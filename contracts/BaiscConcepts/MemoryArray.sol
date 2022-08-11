// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "hardhat/console.sol";

contract MemoryArray {
    address public owner;

    uint[] dynamicArray;

    uint internal idx;
    uint[10] fixedSizeArray;

    struct ArrayInStruct {
        uint amount;
        uint[] indexArray;
    }

    ArrayInStruct structStore;

    constructor() {
        owner = msg.sender;
    }

    function pushIn(uint amount) external {
        dynamicArray.push(amount);
        console.log("--> push In", amount);
    }

    function addToDynaArray(uint amount) external {
        require(idx < fixedSizeArray.length, "More than fixed size array max length");
        fixedSizeArray[idx] = amount;
        idx++;
    }

    function getDynaArrayByIndex(uint index) public view returns (uint) {
        return dynamicArray[index];
    }

    function getFixArrayByIndex(uint index) public view returns (uint) {
        require(index < fixedSizeArray.length, "Must less than fixed size");
        return fixedSizeArray[index];
    }

    function storeInStruct(uint[] memory array) external {
        ArrayInStruct storage ss = structStore;
        ss.amount = 1;
        ss.indexArray = array;
    }

    function getStoreStructArr() external view returns (uint[] memory idxArr) {
        return structStore.indexArray;
    }

    function memoryArray(uint n) external view returns (uint[] memory arr) {
        uint num = fixedSizeArray[0];

        // must "new" to create dyn array 
        arr = new uint[](n);
        console.log("--> mem arr length", arr.length);
        for (uint i=0; i < n; i++) {
            arr[i] = i + num;
        }
    }

    function memoryStructArray(uint n) external pure returns (ArrayInStruct memory aIS) {
        // uint[] memory arr;
        // arr[0] = 1;
        // aIS = ArrayInStruct(0, arr);
        
        aIS = ArrayInStruct(0, new uint[](n));
        aIS.amount = 10;
        for (uint i=0; i < n; i++) {
            aIS.indexArray[i] = i;
        }
    }

}