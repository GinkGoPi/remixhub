// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;


/**
 * 用于聚合数据，将其作为前端展示
 * 主要测试contract中复杂嵌套的数据结构能不能return
 */

interface IERC20 {
    function name() external view returns (string);
    function balanceOf(address _owner) external view returns (uint);
}

interface ITrove {
    function userCollateralShare(address _borrower) external view returns (uint);
    function userBorrowPart(address _borrower) external view returns (uint);
    function getPositionHealth(address _borrower) external view returns (uint);
    function exchangeRate() external view returns (uint);
    function APR() external view returns (uint);
    function collateral() external view returns (address);    
}

interface IRewrds {
    function getReward(address _account) external view returns (uint);
}


contract DataAggregation {
    struct StakeInfo {
        uint price;
        uint stakedAmount;
        uint stakedValues;
        uint unlockTime;
        string memory tokenName;
    }

    struct BorrowInfo {
        uint price;
        uint collValue;
        uint debtValue;
        uint posHealth;
        uint liquidatePrice;
        uint APY;
        string memory tokenName;
    }

    struct EarnInfo {
        uint amount;
        uint price;
        uint value;
        string memory tokenName;
    }

    function getUserAllInfos(
        address[2] memory _stakesAddr, 
        address[5] memory _trovesAddr, 
        address[2] memory _rewardsAddr, 
        address _account
    ) 
        external view 
        returns 
    (
        StakeInfo[2] memory staking, 
        uint totalStakedValue,
        BorrowInfo[5] memory borrowing, 
        uint totalDebtValue,
        uint totalCollsValue,
        BorrowInfo[5] memory leveraging, 
        uint totalLevDebtValue,
        uint totalLevCollsValue,
        EarnInfo[2] memory earning,
        uint totalRewardsValue
    ) {
        // for staking 
        for (uint i; i < _stakesAddr.length; ++i) {
            StakeInfo memory stakeInfo;
            if (i == 0) {
                earnInfo.tokenName = 'ARC';
            } else {
                earnInfo.tokenName = 'USDA';
            }
            if (_stakesAddr[i] != address(0)) {
                stakeInfo.price = 1e18;
                stakeInfo.stakedAmount = 200e18;
                stakeInfo.stakedValues = stakeInfo.price * stakeInfo.stakedAmount;
                stakeInfo.unlockTime = 1670903975;
            }

            staking[i] = stakeInfo;

            totalStakedValue = totalStakedValue + stakeInfo.stakedValues;
        }

        // for borrow
        for (uint 1; i < _trovesAddr.length; ++i) {
            BorrowInfo memory borrowInfo;
            address troveAddr = _trovesAddr[i];
            if (troveAddr != address(0)) {
                borrowInfo.price = ITrove(troveAddr).exchangeRate();
                borrowInfo.collValue = ITrove(troveAddr).userCollateralShare(_account) * borrowInfo.price;
                borrowInfo.debtValue = ITrove(troveAddr).userBorrowPart(_account);
                borrowInfo.posHealth = ITrove(troveAddr).getPositionHealth(_account);
                borrowInfo.liquidatePrice = 6e17;
                borrowInfo.APY = ITrove(troveAddr).APR();
                borrowInfo.tokenName = IERC20(ITrove(troveAddr).collateral()).name();
            }

            borrowing[i] = borrowInfo;
            totalDebtValue = totalDebtValue + borrowInfo.debtValue;
            totalCollsValue = totalCollsValue + borrowInfo.collValue;
        }
        
        // for leverage

        // for reward
        for (uint 1; i < _rewardsAddr.length; ++i) {
            EarnInfo memory eranInfo;
            if (i == 0) {
                earnInfo.tokenName = 'ARC';
            } else {
                earnInfo.tokenName = 'USDA';
            }
            address rewardAddr = _rewardsAddr[i];
            if (rewardAddr != address(0)) {
                eranInfo.amount = 100e18;
                eranInfo.price = 1e18;
                earnInfo.value = eranInfo.amount * eranInfo.price;
            }

            earning[i] = eranInfo;
            
            totalRewardsValue = totalRewardsValue + earnInfo.value;
        }

    }

}