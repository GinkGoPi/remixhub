// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

import "./CvxUnity.sol";

contract CvxDAISwapper is CvxUnity { 
    using SafeMath for uint256;

    uint256 private tokenid = 1;

    address public dai;

    uint256 private depositAmount;
    uint256 private leverage;
    uint256 private margin;
    uint256 private borrow;
    uint256 private swapUSDAAmount;
    uint256 private expectedBorrow;
    uint256 private meta3CRVAmount;
    uint256 private swapAmount;
    uint256 private interestAmount;
    uint256 private pid;
    uint private previd;
    uint private nextid;
    address private debtor;
    uint256 private deleverageAmount;

    constructor(address[5] memory _coins, address[3] memory _pools) {
        usda = _coins[0];
        dai = _coins[1];
        usdt = _coins[2];
        threeCRV = _coins[3];
        cvxlp3Crv = _coins[4];
        pools = _pools;

        IERC20(usda).approve(pools[2], type(uint256).max);
        IERC20(dai).approve(pools[0], type(uint256).max);
        // usdt.approve(threepool, type(uint256).max);
        (bool success, bytes memory data) = usdt.call(abi.encodeWithSelector(SIG_APPROVE, pools[0], type(uint256).max));
        require(success && (data.length == 0 || abi.decode(data, (bool))), "USDT: approve failed");

        IERC20(threeCRV).approve(pools[1], type(uint256).max);
        IERC20(threeCRV).approve(pools[2], type(uint256).max);
    }

    function setCoins(address[3] memory _coins, address _threeCRV, address _cvxlp3Crv) public isOwner returns (bool) {
        usda = _coins[0];
        dai = _coins[1];
        usdt = _coins[2];
        threeCRV = _threeCRV;
        cvxlp3Crv = _cvxlp3Crv;
        return true;
    }

    function deposit(uint256 _amount, uint256 _leverage, uint8 mode, uint256 swap, uint _previd, uint _nextid) public isUnlock returns (bool) {
        require(activePool != address(0x0), "activePool address error.");
        require(_amount >= 2*1e12, "out of min.");
        depositAmount = _amount;
        leverage = _leverage;
        previd = _previd;
        nextid = _nextid;

        if (mode == 1) {
            require(_leverage <= recovery, "leverage error");
        }

        IERC20(dai).transferFrom(msg.sender, address(this), _amount);

        // dai == usda
        swapUSDAAmount = IMetaPool(pools[2]).get_dy_underlying(1, 0, depositAmount);

        // leverage 0x0 -> USDA
        uint256 fee;
        (borrow, fee) = _expected(swapUSDAAmount, leverage);
        uint256 left = ILeverageManager(leverageManager).remain(strategy);
        require(left >= borrow, "balance not enough.");
        IUSDA(usda).mint(address(this), borrow);
        expectedBorrow = borrow.sub(fee);

        // fee -> ActivePool
        IActivePool(activePool).receiveUSDAEarned(address(this),address(this), fee);

        // USDA -> USDT
        uint256 dy = IMetaPool(pools[2]).get_dy_underlying(0, 3, expectedBorrow);
        uint256 mimUsdtAmount = _mimAmount(swap, dy);
        uint256 usdtAmount = IMetaPool(pools[2]).exchange_underlying(0, 3, expectedBorrow, mimUsdtAmount, address(this));
    
        // DAI, USDT -> 3CRV
        uint256 old_balance = IERC20(threeCRV).balanceOf(address(this));
        uint256[3] memory amountsAdded = [depositAmount, 0, usdtAmount];
        IThreePool(pools[0]).add_liquidity(amountsAdded, 0);
        uint256 new_balance = IERC20(threeCRV).balanceOf(address(this));
        uint256 threeCRVAmount = new_balance.sub(old_balance);

        // 3CRV -> meta pool lptoken xxx3CRV e.g. frax3CRV
        meta3CRVAmount =  IMetaPool(pools[1]).add_liquidity([0, threeCRVAmount], 0);

        // lptoken -> cvxlptoken e.g. frax3CRV -> cvxFrax3CRV
        pid = IRewards(rewards).pid();
        uint256 oldCvxlp3CRVAmount = IERC20(cvxlp3Crv).balanceOf(address(this));
        IDeposit(depositpool).deposit(pid, meta3CRVAmount, false);
        uint256 newCvxlp3CRVAmount = IERC20(cvxlp3Crv).balanceOf(address(this));
        uint256 cvxlp3CRVAmount = newCvxlp3CRVAmount.sub(oldCvxlp3CRVAmount);

        // cvxlptoken -> rewards e.g. cvxFrax3CRV -> rewards
        address proxy = IAddressFactory(addressFactory).getProxyAddress(msg.sender);
        IERC20(cvxlp3Crv).transfer(proxy, cvxlp3CRVAmount);
        IProxyAddress(proxy).deposit(rewards, cvxlp3Crv, cvxlp3CRVAmount);

        uint256 totalUSDAAmount = swapUSDAAmount.add(expectedBorrow);
        margin = meta3CRVAmount.mul(swapUSDAAmount);
        margin = margin.div(totalUSDAAmount);
        DepositInfo memory info;
        info.tokenid = tokenid;
        info.margin = margin;
        info.borrow = borrow;
        info.metaThreeCRVAmount = meta3CRVAmount;
        info.interestTime = block.timestamp;
        ILeverageManager(leverageManager).deposit(msg.sender, strategy, info);

        // notify redeem
        if (redeem != address(0x0)) {
            IRedeem(redeem).setSort(msg.sender, opType, info.metaThreeCRVAmount, borrow, previd, nextid);
        }

        emit Deposit(msg.sender, strategy, leverage, depositAmount);

        return true;
    }

    function repay(uint256 _amount, uint _previd, uint _nextid) public returns (bool) {
        return _repay(_amount, strategy, _previd, _nextid);
    }

    function deleverage(uint256 swap, uint _previd, uint _nextid) public returns (bool) {
        return _deleverage(msg.sender, swap, _previd, _nextid);
    }

    function deleverageFor(uint256 swap, address _debtor, uint _previd, uint _nextid) public returns (bool) {
        require(msg.sender == redeem, "operator error.");
        return _deleverage(_debtor, swap, _previd, _nextid);
    }

    function _deleverage(address _debtor, uint256 swap, uint _previd, uint _nextid) internal isUnlock returns (bool) {
        debtor = _debtor;
        previd = _previd;
        nextid = _nextid;
        
        DepositInfo memory info = ILeverageManager(leverageManager).deposits(debtor, strategy);
        require(info.tokenid == tokenid, "deleverage address error.");

        // e.g. rewards -> cvxFrax3CRV -> frax3CRV
        address proxy = IAddressFactory(addressFactory).getProxyAddress(debtor);
        uint256 lp3CRVAmount = IProxyAddress(proxy).unstake(rewards, info.metaThreeCRVAmount, true, pools[1], extraRewards, msg.sender);

        // e.g. frax3CRV -> 3CRV
        uint256 threeCRVAmount = IMetaPool(pools[1]).remove_liquidity_one_coin(lp3CRVAmount, 1, 0);

        // deleverage fee
        (uint256 value,  uint256 fee) = _deleverageFee(threeCRVAmount);
        if (fee == 0) {
            value = value - 1;
            fee = 1;
        }

        // interest
        interestAmount = _interest(info.borrow, info.interestTime);
        uint256 usdaDebtAmount = info.borrow.add(interestAmount);

        // 3CRV == USDA
        uint256 price = IMetaPool(pools[2]).get_dy(1, 0, 1e18);
        swapAmount = usdaDebtAmount.mul(PRICE_DENOMINATOR).div(price);
        swapAmount = swapAmount.add(fee);

        if (swapAmount > value) {
            swapAmount = threeCRVAmount;
        }
        // 3CRV -> USDA
        uint256 dy = IMetaPool(pools[2]).get_dy(1, 0, swapAmount);
        uint256 mimUSDAAmount = _mimAmount(swap, dy);
        uint256 usdaAmount = IMetaPool(pools[2]).exchange(1, 0, swapAmount, mimUSDAAmount, address(this));

        // 3CRV -> DAI
        uint256 threeCRVBalance = threeCRVAmount.sub(swapAmount);
        if (threeCRVBalance > 0) {
            uint256 oldDaiAmount = IERC20(dai).balanceOf(address(this));
            IThreePool(pools[0]).remove_liquidity_one_coin(threeCRVBalance, 0, 0);
            uint256 newDaiAmount = IERC20(dai).balanceOf(address(this));
            uint256 balance = newDaiAmount.sub(oldDaiAmount);
            IERC20(dai).transfer(msg.sender, balance);
        }
        
        // interest -> ActivePool
        if (info.borrow > 0) {
            IUSDA(usda).burn(info.borrow);
        }
        deleverageAmount = usdaAmount.sub(info.borrow);
        IActivePool(activePool).receiveUSDAEarned(address(this),address(this), deleverageAmount);

        ILeverageManager(leverageManager).deleverage(debtor, strategy);

        // notify redeem
        if (redeem != address(0x0)) {
            IRedeem(redeem).setSort(debtor, opType, 0, 0, previd, nextid);
        }

        emit Deleverage(debtor, strategy);

        return true;
    }
}
