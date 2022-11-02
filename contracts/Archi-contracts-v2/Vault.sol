// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

interface IVault {
    function totalShare(address token) external view returns (uint256);
    function totalBalance(address token) external view returns (uint256);
}

abstract contract Vault is IVault {}
