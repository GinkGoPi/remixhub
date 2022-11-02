// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

interface ITrove {
    // System params
    function APR() external view returns (uint256);
    function APY() external view returns (uint256);
    function collateral() external view returns (address);
    function usdaToken() external view returns (address);
    function oracle() external view returns (address);
    function sortedTroves() external view returns (address);

    // Read
    function userCollateralShare(address user) external view returns (uint256);
    function userBorrowPart(address user) external view returns (uint256);
    function userLevMargin(address user) external view returns (uint256);

    function getCurrentCR(address user) external  view returns (uint256);

    // Write
    function multiBorrow(uint256 _inAmount, uint256 _outAmount) external returns (uint256 part, uint256 share);
    
    function repay(uint256 _part, uint256 _outAmount) external returns (uint256 amount);

    function withdrawCollateral(uint256 share) external;

    function leverage(
        address token,
        uint256 amount, 
        uint256 maxBorrow
    ) external;

    function deleverage() external;
}

abstract contract Trove is ITrove {}
