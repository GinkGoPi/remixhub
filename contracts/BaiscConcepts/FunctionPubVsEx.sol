// SPDX-License-Identifier: MIT
pragma solidity =0.8.7;


contract FunctionPubVsEx {
    uint public constant rate = 3;
    function withPub(uint[] memory arr) public pure returns (uint) {
        return arr[0]*rate;
    }

    function withEx(uint[] memory arr) public pure returns (uint) {
        return arr[0]*rate;
    }

}