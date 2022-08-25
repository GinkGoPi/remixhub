// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "hardhat/console.sol";

interface ICurveFi is IERC20 {
    function get_virtual_price() external view returns (uint);
    function get_dy_underlying(int128 i, int128 j, uint dx) external view returns(uint);

    function exchange_underlying(
        int128 sourceAssetId,
        int128 destinationAssetId,
        uint sourceAmount,
        uint minimumDestinationAmount,
        uint deadline
    ) external;

    function exchange_underlying(
        int128 sourceAssetId,
        int128 destinationAssetId,
        uint sourceAmount,
        uint minimumDestinationAmount
    ) external;

    function exchange(
        int128 sourceAssetId,
        int128 destinationAssetId,
        uint sourceAmount,
        uint minimumDestinationAmount
    ) external;

    function exchange(
        uint sourceAssetId,
        uint destinationAssetId,
        uint sourceAmount,
        uint minimumDestinationAmount,
        bool use_eth
    ) external payable;
}


contract CurveHandle {
    address public MIMToken = 0x99D8a9C45b2ecA8864373A26D1459e3Dff1e17F3;
    address public USDTToken = 0xdAC17F958D2ee523a2206206994597C13D831ec7;

    address public mim3CrvPool = 0x5a6A4D54456819380173272A5E8E9B9904BdF41B;

    address public wBTCToken = 0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599;
    address public wETHToken = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address public tricrypto2Pool = 0xD51a44d3FaE010294C616388b506AcdA1bfAAE46;


    function getBalanceOfUSDA() external view returns (uint) {
        return IERC20(MIMToken).balanceOf(address(this));
    }

    function getBalanceOfUSDT() external view returns (uint) {
        return IERC20(USDTToken).balanceOf(address(this));
    }

    function getPrice() external view returns (uint) {
        return ICurveFi(mim3CrvPool).get_virtual_price();
    }

    function getBalanceOfwBTC() external view returns (uint) {
        return IERC20(wBTCToken).balanceOf(address(this));
    }

    function getBalanceOfwETH() external view returns (uint) {
        return IERC20(wETHToken).balanceOf(address(this));
    }

    function getMindy(int128 i, int128 j, uint dx) external view returns (uint) {
        return ICurveFi(mim3CrvPool).get_dy_underlying(i, j, dx);
    }

    function swapToUSDT() external returns (uint) {
        uint balance = IERC20(MIMToken).balanceOf(address(this));
        console.log("balance", balance);
        require(balance > 0, "balance less than 0");
        if (IERC20(MIMToken).allowance(address(this), mim3CrvPool) == 0) {
            SafeERC20.safeApprove(IERC20(MIMToken), mim3CrvPool, balance);
        }
        ICurveFi(mim3CrvPool).exchange_underlying(0, 3, balance, 1);
        uint endBalance = IERC20(USDTToken).balanceOf(address(this));
        console.log("exchange result", endBalance);
        return endBalance;
    }

    function swapTowBTC() external returns (uint) {
        uint balance = IERC20(USDTToken).balanceOf(address(this));
        console.log("balance", balance);
        require(balance > 0, "balance less than 0");
        uint _amount = balance * 50 / 100;
        
        if (IERC20(USDTToken).allowance(address(this), tricrypto2Pool) == 0) {
            SafeERC20.safeApprove(IERC20(USDTToken), tricrypto2Pool, _amount);
        }

        ICurveFi(tricrypto2Pool).exchange(0, 1, _amount, 1, false);
        uint endBalance = IERC20(wBTCToken).balanceOf(address(this));
        console.log("exchange result", endBalance);
        return endBalance;
    }

    function swapTowETH(bool _useETH) external returns (uint) {
        uint balance = IERC20(USDTToken).balanceOf(address(this));
        console.log("balance", balance);
        require(balance > 0, "balance less than 0");
        uint _amount = balance * 60 / 100;

        if (IERC20(USDTToken).allowance(address(this), tricrypto2Pool) == 0) {
            SafeERC20.safeApprove(IERC20(USDTToken), tricrypto2Pool, _amount);
        }
        
        ICurveFi(tricrypto2Pool).exchange(0, 2, _amount, 1, _useETH);
        uint endBalance = IERC20(wETHToken).balanceOf(address(this));
        return endBalance;
    }

}