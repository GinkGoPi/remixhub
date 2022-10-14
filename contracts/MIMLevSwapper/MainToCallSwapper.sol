// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "hardhat/console.sol";

contract MainToCallSwapper {
    
    function cook(uint value, bytes calldata data) external {
        _call(value, data);
    }

    function _call(uint value, bytes memory data) internal returns (bytes memory) {
        (address callee, bytes memory callData) = abi.decode(data, (address, bytes));
        console.log("caller", callee);

        (bool success, bytes memory returnData) = callee.call{value: value}(callData);
        console.log("success", success);
        return returnData;
    }
}