// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

interface ITrove {
    function multiBorrow(address to, uint _inAmount, uint _outAmount) external returns (uint part, uint share);
    
    function repay(address to, uint256 part) external returns (uint256 amount);

    function withdrawCollateral(address to, uint256 share) external;
}