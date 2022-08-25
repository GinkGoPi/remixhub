// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import '@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol';
import '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';

import "hardhat/console.sol";

interface IStakeReward {
    function pushRewardARC(uint _amount) external;
    function pushRewardWBTC(uint _amount) external;
}

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


contract PushStake {

    using SafeERC20 for IERC20;

    uint public interval;
    uint public lastTimeStamp;

    // curve
    address public MIMToken = 0x99D8a9C45b2ecA8864373A26D1459e3Dff1e17F3;
    address public USDTToken = 0xdAC17F958D2ee523a2206206994597C13D831ec7;

    address public mim3CrvPool = 0x5a6A4D54456819380173272A5E8E9B9904BdF41B;

    address public wBTCToken = 0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599;
    address public wETHToken = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address public tricrypto2Pool = 0xD51a44d3FaE010294C616388b506AcdA1bfAAE46;

    // uniswap 
    address public spellToken = 0x090185f2135308BaD17527004364eBcC2D37e5F6;
    address public swapRouter = 0xE592427A0AEce92De3Edee1F18E0157C05861564;

    // stake
    address public stakeContract;

    uint24 public constant poolFee = 3000;

    constructor(uint updateInterval) {
        interval = updateInterval;
        lastTimeStamp = block.timestamp;
    }

    function getBalanceOfUSDA() external view returns (uint) {
        return IERC20(MIMToken).balanceOf(address(this));
    }

    function getBalanceOfUSDT() external view returns (uint) {
        return IERC20(USDTToken).balanceOf(address(this));
    }

    function getBalanceOfwBTC() external view returns (uint) {
        return IERC20(wBTCToken).balanceOf(address(this));
    }

    function getBalanceOfwETH() external view returns (uint) {
        return IERC20(wETHToken).balanceOf(address(this));
    }

    function getBalanceOfSpell() external view returns (uint) {
        return IERC20(spellToken).balanceOf(address(this));
    }

    function periodDistributeUSDA(address _stake) external returns(uint, uint) {
        // period
        require((block.timestamp - lastTimeStamp) > interval, "Execute only once in period");

        lastTimeStamp = block.timestamp;

        // USDA to USDT
        uint amount = IERC20(MIMToken).balanceOf(address(this));
        require(amount > 0, "balance less than 0");

        if (IERC20(MIMToken).allowance(address(this), mim3CrvPool) == 0) {
            SafeERC20.safeApprove(IERC20(MIMToken), mim3CrvPool, amount);
        }

        ICurveFi(mim3CrvPool).exchange_underlying(0, 3, amount, 1);
        
        // TODO: swap reward to wBTC and ARC ratio
        // partial USDT to wBTC
        uint usdtAmount = IERC20(USDTToken).balanceOf(address(this));
        console.log("this had exchange USDT", usdtAmount);

        uint _partialTowBTC = usdtAmount * 50 / 100;
        console.log("exchange wBTC", _partialTowBTC);
        
        if (IERC20(USDTToken).allowance(address(this), tricrypto2Pool) == 0) {
            SafeERC20.safeApprove(IERC20(USDTToken), tricrypto2Pool, _partialTowBTC);
        }

        ICurveFi(tricrypto2Pool).exchange(0, 1, _partialTowBTC, 1, false);

        // partial USDT to wETH
        uint _partialTowETH = usdtAmount * 50 / 100;
        console.log("exchange wETH", _partialTowETH);

        if (IERC20(USDTToken).allowance(address(this), tricrypto2Pool) == 0) {
            SafeERC20.safeApprove(IERC20(USDTToken), tricrypto2Pool, _partialTowETH);
        }
        
        ICurveFi(tricrypto2Pool).exchange(0, 2, _partialTowETH, 1, false);

        // wETH to ARC
        uint amountIn = IERC20(wETHToken).balanceOf(address(this));
        // Approve the router to spend.
        TransferHelper.safeApprove(wETHToken, address(swapRouter), amountIn);

        // Naively set amountOutMinimum to 0. In production, use an oracle or other data source to choose a safer value for amountOutMinimum.
        // We also set the sqrtPriceLimitx96 to be 0 to ensure we swap our exact input amount.
        ISwapRouter.ExactInputSingleParams memory params =
            ISwapRouter.ExactInputSingleParams({
                tokenIn: wETHToken,
                tokenOut: spellToken,
                fee: poolFee,
                recipient: address(this),
                deadline: block.timestamp + 15,
                amountIn: amountIn,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });

        // The call to `exactInputSingle` executes the swap.
        ISwapRouter(swapRouter).exactInputSingle(params);

        // wBTC and ARC send to stake
        uint amountWBTC = IERC20(wBTCToken).balanceOf(address(this));
        uint amountARC = IERC20(spellToken).balanceOf(address(this));
        
        TransferHelper.safeApprove(wBTCToken, _stake, amountWBTC);
        TransferHelper.safeApprove(spellToken, _stake, amountARC);

        // IERC20(wBTCToken).transfer(_stake, amountWBTC);
        // IERC20(spellToken).transfer(_stake, amountARC);
        IStakeReward(_stake).pushRewardWBTC(amountWBTC);
        IStakeReward(_stake).pushRewardARC(amountARC);

        return (amountWBTC, amountARC);
    }

}