// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

/** Curve-js usage to interact
 * https://github.com/curvefi/curve-js/blob/master/src/constants/pools/ethereum.ts
 * MIMLP3Pool
 *  swap_address: '0x5a6A4D54456819380173272A5E8E9B9904BdF41B',
    token_address: '0x5a6A4D54456819380173272A5E8E9B9904BdF41B',
    gauge_address: '0xd8b712d29381748dB89c36BCa0138d7c75866ddF',
    deposit_address: '0xA79828DF1850E8a3A3064576f380D90aECDD3359',
    underlying_coins: ['MIM', 'DAI', 'USDC', 'USDT'],
    wrapped_coins: ['MIM', '3Crv']
 */


import "hardhat/console.sol";

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

interface IThreePool {
    function add_liquidity(uint256[3] memory amounts, uint256 _min_mint_amount) external;
    function remove_liquidity_one_coin(uint256 _token_amount, int128 i, uint256 min_amount) external;

}

// Curve MetaPool
interface ICurvePool {
    function calc_token_amount(uint256[2] memory _amounts, bool _is_deposit) external view returns (uint256);
    function add_liquidity(uint256[2] memory _amounts, uint256 _min_mint_amount, address _receiver) external returns (uint256);
    // function get_dy(int128 i, int128 j, uint256 _dx) external view returns (uint256);
    // function exchange(int128 i, int128 j, uint256 _dx, uint256 _min_dy) external returns (uint256);
    function get_dy_underlying(int128 i, int128 j, uint256 dx) external view returns (uint256);
    function exchange_underlying(int128 i, int128 j, uint256 dx, uint256 min_dy, address receiver) external returns (uint256);
    function remove_liquidity_one_coin(uint256 _token_amount, int128 i, uint256 _min_amount) external returns (uint256);
}

interface ICurve3PoolDepositZap {
    function add_liquidity(address _pool, uint256[4] memory _depositAmounts, uint256 _minMintAmount) external returns (uint256);
}

// Convext deposit
interface IConvexDeposits {
    function deposit(uint256 _pid, uint256 _amount, bool _stake) external returns(bool);
    function deposit(uint256 _amount, bool _lock, address _stakeAddress) external;
    function withdraw(uint256 _pid, uint256 _amount) external returns(bool);
    function withdrawTo(uint256 _pid, uint256 _amount, address _to) external returns(bool);
}

// convex rewards
interface IConvexRewards{
    function pid() external view returns(uint256);
    function withdrawAndUnwrap(uint256 amount, bool claim) external returns(bool);
}


contract MIMLevSwapper {

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

    IThreePool constant public THREEPOOL = IThreePool(0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7);
    IERC20 constant public THREECRV = IERC20(0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490);
    ICurvePool public constant MIM3POOL = ICurvePool(0x5a6A4D54456819380173272A5E8E9B9904BdF41B);
    
    IERC20 public constant MIM3LP3CRV = IERC20(0x5a6A4D54456819380173272A5E8E9B9904BdF41B);
    IERC20 public constant TETHER = IERC20(0xdAC17F958D2ee523a2206206994597C13D831ec7); 
    IERC20 public constant MIM = IERC20(0x99D8a9C45b2ecA8864373A26D1459e3Dff1e17F3);
    IERC20 public constant CurveToken = IERC20(0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490);

    ICurvePool public constant LUSD3POOL = ICurvePool(0xEd279fDD11cA84bEef15AF5D39BB4d4bEE23F0cA);
    IERC20 public constant LUSD = IERC20(0x5f98805A4E8be255a32880FDeC7F6728C6568bA0);
    
    IERC20 public constant USDC = IERC20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);

    ICurve3PoolDepositZap public constant DepositZap = ICurve3PoolDepositZap(0xA79828DF1850E8a3A3064576f380D90aECDD3359);

    IConvexDeposits public constant convexBooster = IConvexDeposits(0xF403C135812408BFbE8713b5A23a04b3D48AAE31);
    IConvexRewards public constant BaseReward = IConvexRewards(0xFd5AbF66b003881b88567EB9Ed9c651F14Dc4771);
    // IConvex public constant cvx3CRV = IConvex();

    bytes4 constant SIG_APPROVE = 0x095ea7b3;

    address constant cvxLpToken = 0xabB54222c2b77158CC975a2b715a3d703c256F05;

    constructor () {
        LUSD.approve(address(LUSD3POOL), type(uint).max);
        // USDC.approve(address(MIM3POOL), type(uint).max);
        THREECRV.approve(address(MIM3POOL), type(uint).max);

        // TETHER.approve(address(MIM3POOL), type(uint).max);   <-- Error sytax
        (bool success, bytes memory data) = address(TETHER).call(abi.encodeWithSelector(SIG_APPROVE, address(MIM3POOL), type(uint256).max));
        require(success && (data.length == 0 || abi.decode(data, (bool))), "USDT: approve failed");

        (success, data) = address(TETHER).call(abi.encodeWithSelector(SIG_APPROVE, address(THREEPOOL), type(uint256).max));
        require(success && (data.length == 0 || abi.decode(data, (bool))), "USDT: approve failed");

        // (success, data) = address(TETHER).call(abi.encodeWithSelector(SIG_APPROVE, address(DepositZap), type(uint256).max));
        // require(success && (data.length == 0 || abi.decode(data, (bool))), "USDT: approve failed");

        MIM3LP3CRV.approve(address(convexBooster), type(uint).max);
    }

    function deposit(uint256 _amount, uint256 _leverage) external returns (bool) {
        // require(activePool != address(0x0), "activePool address error.");
        // require(_amount >= 2*1e12, "out of min.");

        uint depositAmount = _amount;
        // uint leverage = _leverage;
 
        // has collateral transfer to vault as margin
        MIM3LP3CRV.transferFrom(msg.sender, address(this), depositAmount);
        console.log("--> MIM3LP3CRV", MIM3LP3CRV.balanceOf(address(this)));
        // leverage 0x0 -> LUSD
        (uint256 borrow, uint256 fee) = _expected(depositAmount, _leverage);
        console.log("--> borrow", borrow);
        // uint256 left = ILeverageManager(leverageManager).remain(strategy);
        // require(left >= borrow, "balance not enough.");
        // IUSDA(usda).mint(address(this), borrow);
        uint expectedBorrow = borrow - fee;

        // fee -> ActivePool
        // IActivePool(activePool).receiveUSDAEarned(address(this),address(this), fee);

        // LUSD -> USDT
        uint256 lusdAmount = depositAmount + expectedBorrow;
        console.log("need lusdAmount", lusdAmount);
        console.log("--> lusd balance", LUSD.balanceOf(address(this)));

        uint256 dy = LUSD3POOL.get_dy_underlying(0, 3, lusdAmount);
        console.log("usdc dy", dy);
        // // uint256 mimUsdtAmount = _mimAmount(_swap, dy);
        uint256 usdtAmount = LUSD3POOL.exchange_underlying(0, 3, lusdAmount, dy, address(this));
        console.log("exchanged usdt amount", usdtAmount);
        console.log("has usdt", TETHER.balanceOf(address(this)));
        // // USDT -> meta pool lptoken
        // uint256 lpTokenAmount =  MIM3POOL.add_liquidity([0, usdtAmount], 0, address(this));  <-- Error sytax
        THREEPOOL.add_liquidity([0, 0, usdtAmount], 0);

        uint256 lp3crvTokenAmount = THREECRV.balanceOf(address(this));
        console.log("--> 3crv amount", lp3crvTokenAmount);

        uint256 lpTokenAmount = MIM3POOL.add_liquidity([0, lp3crvTokenAmount], 0, address(this));
        // uint256 lpTokenAmount =  DepositZap.add_liquidity(address(MIM3POOL), [0, 0, 0, usdtAmount], 0);
        
        console.log("lptoken", lpTokenAmount);

        uint256 oldCvxLpTokenAmount = IERC20(cvxLpToken).balanceOf(address(this));
        // // lptoken -> cvxlptoken 
        uint256 pid = BaseReward.pid();
        console.log("--> to deposit", pid);
        // convexBooster.deposit(pid, lpTokenAmount, false);
        convexBooster.deposit(pid, lpTokenAmount, true);
        
        uint256 newCvxLpTokenAmount = IERC20(cvxLpToken).balanceOf(address(this));
        uint256 cvxlpTokenAmount = newCvxLpTokenAmount - oldCvxLpTokenAmount;
        console.log("--> cvx-lp-token amount", cvxlpTokenAmount);

        // cvxcrvToken -> rewards e.g. cvxcrvFRAX -> rewards
        // address proxy = IAddressFactory(addressFactory).getProxyAddress(msg.sender);
        // IERC20(cvxcrvToken).transfer(proxy, cvxcrvTokenAmount);
        // IProxyAddress(proxy).deposit(rewards, cvxcrvToken, cvxcrvTokenAmount);

        // uint256 margin = cvxcrvTokenAmount.mul(depositAmount);
        // margin = margin.div(usdaAmount);
        // DepositInfo memory info;
        // info.tokenid = tokenid;
        // info.margin = margin;
        // info.borrow = borrow;
        // info.metaThreeCRVAmount = cvxcrvTokenAmount;
        // info.interestTime = block.timestamp;
        // ILeverageManager(leverageManager).deposit(msg.sender, strategy, info);
        
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


    function repay(uint256 _inAmount, uint256 _outAmount) external {
        // USDA to repay
        MIM.transferFrom(msg.sender, address(this), _inAmount);

        if (_outAmount > 0) {
            // withdraw from convex 
            uint256 pid = BaseReward.pid();
            convexBooster.withdrawTo(pid, _outAmount, address(this));

            // collateral to withdraw
            MIM3LP3CRV.transfer(msg.sender, _outAmount);
        }
        
    }
    
}