// SPDX-License-Identifier: UNLICENSE
pragma solidity ^0.8.7;

import "./libraries/BoringRebase.sol";
import "./libraries/BoringERC20.sol";

import "hardhat/console.sol";

interface IOracle {
    function get() external view returns (bool, uint);
}

interface IVaultV1 {
    function toAmount(IERC20 token, uint256 share) external view returns (uint256);
    function toShare(IERC20 token, uint256 amount) external view returns (uint256);
    function transferShare(IERC20 token, address to, uint256 share) external returns (uint256);
    function transferShareFrom(IERC20 token, address from, uint256 share) external returns (uint256);
    function transferAmount(IERC20 token, address to, uint256 amount) external returns (uint256);
    function transferAmountFrom(IERC20 token, address from, uint256 amount) external returns (uint256);
    function addShare(IERC20 token, uint256 share) external returns (uint256);
    function addAmount(IERC20 token, uint256 amount) external returns (uint256);
}


contract Cvx3crvTrove {
    using RebaseLibrary for Rebase;
    using BoringERC20 for IERC20;

    event LogAccrue(uint128 accruedAmount);
    event LogAddCollateral(address indexed from, address indexed to, uint256 share);
    event LogWithdrawCollateral(address indexed from, address indexed to, uint256 share);
    event LogBorrow(address indexed from, address indexed to, uint256 amount, uint256 part);
    event LogRepay(address indexed from, address indexed to, uint256 amount, uint256 part);

    IVaultV1 public immutable vault;
    IERC20 public collateral;
    IERC20 public usdaToken;
    IOracle public oracle;

    address public feeTo;
    // Total amounts
    uint256 public totalCollateralShare; // Total collateral supplied
    Rebase public totalBorrow; // elastic = Total token amount to be repayed by borrowers, base = Total parts of the debt held by borrowers

    // User balances
    mapping(address => uint256) public userCollateralShare;
    mapping(address => uint256) public userBorrowPart;

    /// @notice Exchange and interest rate tracking.
    /// This is 'cached' here because calls to Oracles can be very expensive.
    uint256 public exchangeRate;

    struct AccrueInfo {
        uint64 lastAccrued;
        uint128 feesEarned;
    }

    AccrueInfo public accrueInfo;

    // Settings
    uint128 private constant INTEREST_PER_SECOND = 317097920;

    uint256 private constant COLLATERIZATION_RATE = 75000; // 75%
    uint256 private constant COLLATERIZATION_RATE_PRECISION = 1e5; // Must be less than EXCHANGE_RATE_PRECISION (due to optimization in math)
    uint256 private constant MINIMUM_TARGET_UTILIZATION = 7e17; // 70%
    uint256 private constant MAXIMUM_TARGET_UTILIZATION = 8e17; // 80%
    uint256 private constant UTILIZATION_PRECISION = 1e18;
    uint256 private constant FULL_UTILIZATION = 1e18;
    uint256 private constant FULL_UTILIZATION_MINUS_MAX = FULL_UTILIZATION - MAXIMUM_TARGET_UTILIZATION;
    uint256 private constant FACTOR_PRECISION = 1e18;

    uint256 private constant EXCHANGE_RATE_PRECISION = 1e18;

    uint256 private constant LIQUIDATION_MULTIPLIER = 112000; // add 12%
    uint256 private constant LIQUIDATION_MULTIPLIER_PRECISION = 1e5;

    constructor(
        IVaultV1 vault_, 
        IERC20 usdaToken_, 
        IERC20 collateralToken_, 
        IOracle oracle_
    ) {
        vault = vault_;
        usdaToken = usdaToken_;
        oracle = oracle_;
        collateral = collateralToken_;
    }

    function updateExchangeRate() public returns (bool updated, uint256 rate) {
        (updated, rate) = oracle.get();

        if (updated) {
            exchangeRate = rate;
            // emit LogExchangeRate(rate);
        } else {
            // Return the old rate if fetching wasn't successful
            rate = exchangeRate;
        }
    }

    /// @notice Accrues the interest on the borrowed tokens and handles the accumulation of fees.
    function accrue() public {
        AccrueInfo memory _accrueInfo = accrueInfo;
        // Number of seconds since accrue was called
        uint128 elapsedTime = uint128(uint64(block.timestamp) - _accrueInfo.lastAccrued);
        if (elapsedTime == 0) {
            return;
        }
        _accrueInfo.lastAccrued = uint64(block.timestamp);

        Rebase memory _totalBorrow = totalBorrow;
        if (_totalBorrow.base == 0) {
            accrueInfo = _accrueInfo;
            return;
        }

        // Accrue interest
        uint128 extraAmount = _totalBorrow.elastic * INTEREST_PER_SECOND * elapsedTime / uint128(1e18);
        
        _totalBorrow.elastic = _totalBorrow.elastic + extraAmount;

        _accrueInfo.feesEarned = _accrueInfo.feesEarned + extraAmount;
        totalBorrow = _totalBorrow;
        accrueInfo = _accrueInfo;

        emit LogAccrue(extraAmount);
    }

    // function _addTokens(
    //     IERC20 token,
    //     uint256 share,
    //     uint256 total,
    //     bool skim
    // ) internal {
    //     // if (skim) {
    //     //     require(share <= vault.balanceOf(token, address(this)).sub(total), "Cauldron: Skim too much");
    //     // } else {
    //     //     vault.transferShareFrom(token, msg.sender, share);
    //     // }
    //     vault.transferShareFrom(token, msg.sender, share);
    // }

    function _addCollateral(
        address to,
        bool skim,
        uint256 share
    ) internal {
        userCollateralShare[to] = userCollateralShare[to] + share;
        uint256 oldTotalCollateralShare = totalCollateralShare;
        totalCollateralShare = oldTotalCollateralShare + share;

        // _addTokens(collateral, share, oldTotalCollateralShare, skim);
        vault.transferShareFrom(collateral, msg.sender, share);

        emit LogAddCollateral(to, address(vault), share);
    }

    function _withdrawCollateral(address to, uint256 share) internal {
        userCollateralShare[msg.sender] = userCollateralShare[msg.sender] - share;
        totalCollateralShare = totalCollateralShare - share;

        vault.transferShare(collateral, to, share);

        emit LogWithdrawCollateral(address(vault), to, share);
    }

    function withdrawCollateral(address to, uint256 share) external {
        // accrue must be called because we check solvency
        accrue();
        _withdrawCollateral(to, share);
    }

    function _borrow(address to, uint256 amount) internal returns (uint256 part, uint256 share) {
        (totalBorrow, part) = totalBorrow.add(amount, true);
        console.log("totalBorrow", part);
        userBorrowPart[msg.sender] = userBorrowPart[msg.sender] + part;
        console.log("userBorrow", userBorrowPart[msg.sender]);
        // As long as there are tokens on this contract you can 'mint'... this enables limiting borrows
        share = vault.toShare(usdaToken, amount);
        console.log("share", share);

        vault.transferShare(usdaToken, to, share);

        emit LogBorrow(msg.sender, to, amount, part);
    }

    // function borrow(address to, uint256 amount) external returns (uint256 part, uint256 share) {
    //     accrue();
    //     (part, share) = _borrow(to, amount);
    // }

    function multiBorrow(address to, uint _inAmount, uint _outAmount) external  returns (uint part, uint share) {
        require(_inAmount + _outAmount > 0, "Trove: not all zero");
        if (_inAmount > 0 && _outAmount == 0) {
            // only add collateral
            _addCollateral(to, true, _inAmount);
            part = userBorrowPart[to];
            share = userCollateralShare[to];
        } else {
            accrue();
            if (_inAmount > 0) {
                // add collateral before borrow
                _addCollateral(to, true, _inAmount);
            }
            // borrow
            (part, share) = _borrow(to, _outAmount);
        }
    }

    function _repay(
        address to,
        bool skim,
        uint256 part
    ) internal returns (uint256 amount) {
        (totalBorrow, amount) = totalBorrow.sub(part, true);
        userBorrowPart[to] = userBorrowPart[to] - part;

        uint256 share = vault.toShare(usdaToken, amount);
        vault.transferShare(usdaToken, msg.sender, share);

        // console.log("Repay", address(vault), amount, part);
        emit LogRepay(address(vault), to, amount, part);
    }

    function repay(
        address to,
        uint256 part
    ) public returns (uint256 amount) {
        accrue();
        amount = _repay(to, false, part);
    }

    function withdrawFees() external {
        accrue();
        uint256 _feesEarned = accrueInfo.feesEarned;
        vault.transferAmount(usdaToken, feeTo, _feesEarned);
        accrueInfo.feesEarned = 0;

    }

    function setFeeTo(address newFeeTo) external {
        feeTo = newFeeTo;
        // emit LogFeeTo(newFeeTo);
    }

}