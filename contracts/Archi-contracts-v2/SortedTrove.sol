// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

interface ISortedTrove {
    function getSize() external view returns (uint256);
    function getTopSize() external view returns (uint256);
    function getFirst() external view returns (address);
    function getLast() external view returns (address);
}

abstract contract SortedTrove is ISortedTrove {}
