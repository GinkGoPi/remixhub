// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";


contract MockStake {
    using SafeMath for uint;
    using SafeERC20 for IERC20;

    address public wBTCToken = 0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599;
    address public ARCToken = 0x090185f2135308BaD17527004364eBcC2D37e5F6;

    function getBalanceOfwBTC() external view returns (uint) {
        return IERC20(wBTCToken).balanceOf(address(this));
    }

    function getBalanceOfARC() external view returns (uint) {
        return IERC20(ARCToken).balanceOf(address(this));
    }

    function pushRewardWBTC(uint _amount) external {
        IERC20(wBTCToken).safeTransferFrom(msg.sender, address(this), _amount);
    }

    function pushRewardARC(uint _amount) external {
        IERC20(ARCToken).safeTransferFrom(msg.sender, address(this), _amount);
    }

}