// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

/**
 * 仿照v1的leverage swapper(CvxCrvLpTokenSwapper.sol)的测试问题重现
 * 用LUSD替代USDA进行测试，因为实际链上没有**USDA3Pool**
 */

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "hardhat/console.sol";


interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

interface IUSDA {
    function mint(address to, uint256 amount) external returns (bool);
    function burn(uint256 amount) external returns (bool);
}

// IMetaPool
interface IMetaPool {
    function get_dy_underlying(int128 i, int128 j, uint256 dx) external view returns (uint256);
    function exchange_underlying(int128 i, int128 j, uint256 dx, uint256 min_dy, address receiver) external returns (uint256);
}

interface ICvxCrvPool {
    function calc_token_amount(uint256[2] memory _amounts, bool _is_deposit) external view returns (uint256);
    function add_liquidity(uint256[2] memory _amounts, uint256 _min_mint_amount) external returns (uint256);
    function get_dy(int128 i, int128 j, uint256 _dx) external view returns (uint256);
    function exchange(int128 i, int128 j, uint256 _dx, uint256 _min_dy) external returns (uint256);
    function remove_liquidity_one_coin(uint256 _token_amount, int128 i, uint256 _min_amount) external returns (uint256);
}

interface IDeposit {
    function deposit(uint256 _pid, uint256 _amount, bool _stake) external returns(bool);
}

interface IRewards{
    function pid() external view returns(uint256);
}

contract ErrorCvxCrvLev {

    address public usda;
    address public usdc;
    address public crvToken;
    address public cvxcrvToken;
    address[2] public pools; // 0: crvpool e.g. StableSwap (crvfrax pool) 1: usdapool(usda3CRV)

    address public depositpool; // booster
    address public rewards; // rewards
    address[8] public extraRewards; // [crv, cvx]
    uint256 public strategy = 2;   // leverageManager: 0 frax 1 mim 2 usdcFrax
 
    uint256 public recovery = 400;
    uint256 public borrowFee = 100;
    uint256 public aprFee = 100;
    uint256 public leverageFee = 50;
    uint256 public deleverageFee = 100;

    uint256 public constant FEE_DENOMINATOR = 10000;
    uint256 public constant SWAP_DENOMINATOR = 1000;
    uint256 public constant COLLATERAL_DENOMINATOR = 100;
    uint256 public constant PRICE_DENOMINATOR = 1e18;
    uint public constant DAY = 86400;
    uint public constant YEAR = 365*DAY+21600;

    // ICurvePool public constant MIM3POOL = ICurvePool(0x5a6A4D54456819380173272A5E8E9B9904BdF41B);
    // ICurvePool constant public THREECRV = ICurvePool(0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7);
    
    // IERC20 public constant MIM3LP3CRV = IERC20(0x5a6A4D54456819380173272A5E8E9B9904BdF41B);
    // IERC20 public constant TETHER = IERC20(0xdAC17F958D2ee523a2206206994597C13D831ec7); 
    // IERC20 public constant MIM = IERC20(0x99D8a9C45b2ecA8864373A26D1459e3Dff1e17F3);
    // IERC20 public constant CurveToken = IERC20(0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490);

    // ICurvePool public constant LUSD3POOL = ICurvePool(0xEd279fDD11cA84bEef15AF5D39BB4d4bEE23F0cA);
    // IERC20 public constant LUSD = IERC20(0x5f98805A4E8be255a32880FDeC7F6728C6568bA0);
    
    // IERC20 public constant USDC = IERC20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);

    // IConvexDeposits public constant convexBooster = IConvexDeposits(0xF403C135812408BFbE8713b5A23a04b3D48AAE31);
    // IConvexRewards public constant BaseReward = IConvexRewards(0xFd5AbF66b003881b88567EB9Ed9c651F14Dc4771);
    // IConvex public constant cvx3CRV = IConvex();

    bytes4 constant SIG_BALANCEOF = 0x70a08231;     // balanceOf(address account)
    bytes4 constant SIG_TRANSFER = 0xa9059cbb;      // transfer(address recipient, uint256 amount)
    bytes4 constant SIG_TRANSFERFROM = 0x23b872dd;  // transferFrom(address from, address to, uint256 amount)
    bytes4 constant SIG_APPROVE = 0x095ea7b3;       // approve(address,uint256)

    using SafeMath for uint256;

    uint256 private tokenid = 5;

    uint256 private depositAmount;
    uint256 private leverage;
    uint private previd;
    uint private nextid;
    uint256 private swapUSDAAmount;
    uint256 private expectedBorrow;
    uint256 private mimUsdcAmount;
    uint256 private usdcAmount;
    address private debtor;
    uint256 private interestAmount;
    uint256 private usdaDebtAmount;
    uint256 private mimUSDAAmount;

    constructor(address[4] memory _coins, address[2] memory _pools) {
        usda = _coins[0];
        usdc = _coins[1];
        crvToken = _coins[2];
        cvxcrvToken = _coins[3];
        pools = _pools;

        IERC20(usda).approve(pools[1], type(uint256).max);
        IERC20(usdc).approve(pools[0], type(uint256).max);
        IERC20(usdc).approve(pools[1], type(uint256).max);
    }

    function deposit(uint256 _amount, uint256 _leverage) external returns (bool) {
    // function deposit(uint256 _amount, uint256 _leverage, uint8 mode, uint256 swap, uint _previd, uint _nextid) public isUnlock returns (bool) {
        // require(activePool != address(0x0), "activePool address error.");
        // require(_amount >= 2*1e12, "out of min.");
        depositAmount = _amount;
        leverage = _leverage;
        // previd = _previd;
        // nextid = _nextid;

        // if (mode == 1) {
            // require(_leverage <= recovery, "leverage error");
        // }

        // cvxcrvToken.transferFrom(msg.sender, address(this), depositAmount);
        // (bool success, bytes memory data) = cvxcrvToken.call(abi.encodeWithSelector(SIG_TRANSFERFROM, msg.sender, address(this), depositAmount));
        // require(success && (data.length == 0 || abi.decode(data, (bool))), "cvxcrvToken token transferFraom failed");
        
        // cvxlptoken == usda e.g. cvxFrax3Crv == usda
        // uint256 price = oracle.get(); // cvxcrvlptoken/usd
        // swapUSDAAmount = depositAmount.mul(PRICE_DENOMINATOR).div(price);
        swapUSDAAmount = depositAmount;

        // leverage 0x0 -> USDA
        (uint256 borrow, uint256 fee) = _expected(swapUSDAAmount, leverage);
        // uint256 left = ILeverageManager(leverageManager).remain(strategy);
        // require(left >= borrow, "balance not enough.");
        // IUSDA(usda).mint(address(this), borrow);
        expectedBorrow = borrow.sub(fee);

        // fee -> ActivePool
        // IActivePool(activePool).receiveUSDAEarned(address(this),address(this), fee);
        console.log("--> expectedBorrow", expectedBorrow);
        // USDA -> USDC
        uint256 dy = IMetaPool(pools[1]).get_dy_underlying(0, 2, expectedBorrow);
        console.log("--> lusd to USDC dy", dy);
        // mimUsdcAmount = _mimAmount(swap, dy);
        mimUsdcAmount = dy;
        usdcAmount = IMetaPool(pools[1]).exchange_underlying(0, 2, expectedBorrow, mimUsdcAmount, address(this));
        console.log("--> has exchange usdc", usdcAmount);
        // USDC -> meta pool lptoken crvToken e.g. crvFRAX
        uint256 crvTokenAmount =  ICvxCrvPool(pools[0]).add_liquidity([0, usdcAmount], 0);
        console.log("--> add liquidaty lp token", crvTokenAmount);

        // crvToken -> cvxcrvToken e.g. crvFRAX -> cvxcrvFRAX
        uint256 pid = IRewards(rewards).pid();
        uint256 oldCvxCrvTokenAmount = IERC20(cvxcrvToken).balanceOf(address(this));
        IDeposit(depositpool).deposit(pid, crvTokenAmount, false);
        uint256 newCvxCrvTokenAmount = IERC20(cvxcrvToken).balanceOf(address(this));
        uint256 cvxcrvTokenAmount = newCvxCrvTokenAmount.sub(oldCvxCrvTokenAmount);
        uint256 totalCvxCrvTokenAmount = cvxcrvTokenAmount.add(depositAmount);
        console.log("--> totalCvxCrvTokenAmount", totalCvxCrvTokenAmount);

        // // cvxcrvToken -> rewards e.g. cvxcrvFRAX -> rewards
        // address proxy = IAddressFactory(addressFactory).getProxyAddress(msg.sender);
        // IERC20(cvxcrvToken).transfer(proxy, totalCvxCrvTokenAmount);
        // IProxyAddress(proxy).deposit(rewards, cvxcrvToken, totalCvxCrvTokenAmount);

        // DepositInfo memory info;
        // info.tokenid = tokenid;
        // info.margin = depositAmount;
        // info.borrow = borrow;
        // info.metaThreeCRVAmount = totalCvxCrvTokenAmount;
        // info.interestTime = block.timestamp;
        // ILeverageManager(leverageManager).deposit(msg.sender, strategy, info);

        // // notify redeem
        // if (redeem != address(0x0)) {
        //     IRedeem(redeem).setSort(msg.sender, opType, info.metaThreeCRVAmount, info.borrow, previd, nextid);
        // }

        // emit Deposit(msg.sender, strategy, leverage, depositAmount);

        return true;
    }

    function _expected(uint256 _amount, uint256 _collateral) internal view returns (uint256, uint256) {
        // require(_collateral <= leverageMax, "leverage error");
        uint256 feePercent = borrowFee + leverageFee;
        uint256 borrow = _amount * _collateral;
        uint256 fee = borrow - feePercent;
        uint256 DENOMINATOR = FEE_DENOMINATOR * COLLATERAL_DENOMINATOR;
        return (borrow/COLLATERAL_DENOMINATOR, fee/DENOMINATOR);
    }

    function _mimAmount(uint256 swap, uint256 dy) internal pure returns(uint256) {
        // require(swap <= SWAP_DENOMINATOR, "swap error");
        uint256 value = SWAP_DENOMINATOR - swap;
        uint256 mimAmount = dy * value;
        return mimAmount / SWAP_DENOMINATOR;
    }
    
}