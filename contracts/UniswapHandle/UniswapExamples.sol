// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import '@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol';
import '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';


import "hardhat/console.sol";



contract UniswapExamples {
    address public wETHToken = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address public spellToken = 0x090185f2135308BaD17527004364eBcC2D37e5F6;
    address public swapRouter = 0xE592427A0AEce92De3Edee1F18E0157C05861564;

    uint24 public constant poolFee = 3000;

    function getBalanceOfwETH() external view returns (uint) {
        return IERC20(wETHToken).balanceOf(address(this));
    }

    function getBalanceOfSpell() external view returns (uint) {
        return IERC20(spellToken).balanceOf(address(this));
    }

    // function getAmountsOutFromWETH(uint amountIn) external view returns (uint[] memory) {
    //     address[] memory path;
    //     path = new address[](2);
    //     path[0] = wETHToken;
    //     path[1] = spellToken;
    //     return ISwapRouter(swapRouter).getAmountsOut(amountIn, path);
    // }

    // function swapViaWETH() external {
    //     uint balance = IERC20(wETHToken).balanceOf(address(this));
    //     require(balance > 0, "balance less than 0");

    //     // IERC20(wETHToken).approve(router, balance);
    //     if (IERC20(wETHToken).allowance(address(this), router) == 0) {
    //         SafeERC20.safeApprove(IERC20(wETHToken), router, balance);
    //     }
    //     address[] memory path;
    //     path = new address[](2);
    //     path[0] = wETHToken;
    //     path[1] = spellToken;
    //     uint deadline = block.timestamp + 300;
    //     IUniswapV2Router(router).swapExactETHForTokens{value: balance}(1, path, address(this), deadline);
    // }

    function swapExactInputSingle() external returns (uint amountOut) {
        uint amountIn = IERC20(wETHToken).balanceOf(address(this));
        require(amountIn > 0, "balance less than 0");

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
        amountOut = ISwapRouter(swapRouter).exactInputSingle(params);
    }
}

