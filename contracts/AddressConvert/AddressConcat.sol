// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;


contract AddressConcat {
    function zeroUintAddress() external pure returns (address, uint) {
        return (address(0), uint(0));
    }

    function showUint8(uint _typeId, uint _last) external pure returns (uint8, uint) {
        return (uint8(_typeId), (uint8(_typeId<<1)|_last));
    }

    // 22775 gas
    function toBytes32(uint8 _typeId) external view returns (bytes32) {
        return bytes32(abi.encodePacked(msg.sender, _typeId));
    }

    function bytes32WithZero() external pure returns (bytes32) {
        return bytes32(0);
    }

    // 22237 gas
    function bytes32ConvertAddress(bytes32 data) external pure returns (address _id, uint8 _typeId) {
        // assembly {
        //     _id := mload(add(data, 20))
        // }
        _id = address(uint160(bytes20(data)));
        _typeId = uint8(data[20]);
    }

    function bytes32ToUint(bytes32 data) external pure returns (uint) {
        return uint(data);
    }

    function addressConcatToBytes21(address _borrow, uint8 _typeId) external pure returns (bytes21) {
        bytes21 _bytes = bytes21(abi.encodePacked(_borrow, _typeId));
        // assembly {
        //     value := mload(add(_bytes, 0x15))
        // }
        // value = uint(_bytes);
        return _bytes;
    }

    // 22487 gas
    function addressConcatToUint(address _borrow, uint8 _typeId) external pure returns (uint) {
        // uint _nodeId = uint(0);
        uint _nodeId = (uint(_typeId)<<160) | uint(uint160(_borrow));
        // uint _nodeId = uint(_typeId << 160 | uint160(_borrow));
        return _nodeId;
    }

    // 22287 gas
    function uintParse(uint _nodeId) external pure returns (address _borrow, uint8 _typeId) {
        _typeId = uint8((_nodeId>>160));
        _borrow = address(uint160(_nodeId));
    }

}