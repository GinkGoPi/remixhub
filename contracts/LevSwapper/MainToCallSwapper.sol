// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "hardhat/console.sol";

interface ILevSwapper {
    function deposit(uint256 _amount, uint256 _leverage) external returns (uint margin, uint coll, uint debt);
}

contract MainToCallSwapper {

    function cook(address _swapper, uint256 _amount, uint256 _leverage) external returns (bytes memory res) {
        ILevSwapper swaper = ILevSwapper(_swapper);
        (uint margin, uint coll, uint debt) = swaper.deposit(_amount, _leverage);
        console.log('==> margin', margin);
        console.log('==> coll', coll);
    }
    
    function cookCall(uint value, bytes calldata data) external returns (bytes memory res) {
        res = _call(value, data);
    }

    function _call(uint value, bytes memory data) internal returns (bytes memory) {
        (address callee, bytes memory callData) = abi.decode(data, (address, bytes));
        console.log("caller", callee);

        // uint value2;
        // callData = abi.encodePacked(callData, value2);
        // (bool success, bytes memory returnData) = callee.call{value: value}(callData);
        (bool success, bytes memory returnData) = callee.call{gas: 1000000}(abi.encodeWithSignature("deposit(uint256, uint256)", 100e18, 2));
        require(success, "Main: call failed");
        return returnData;
    }
 
}