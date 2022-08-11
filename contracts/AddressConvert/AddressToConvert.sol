// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;


import "@openzeppelin/contracts/utils/Strings.sol";

contract AddressToConvert {
    function toUint(address a) external pure returns (uint256) {
        return uint256(uint160(a));
    }

    function toString(address a) external pure returns (string memory) {
        return Strings.toHexString(uint256(uint160(a)), 20);
        // return Strings.toString(uint256(uint160(a)));
    }

    function toBytes(address a) public pure returns (bytes memory) {
        return abi.encodePacked(a);
    }

    function concatAddrUint(address a, uint8 b) public pure returns (bytes memory) {
        return abi.encodePacked(a, b);
    }

    function parseAddrUint(address a, uint8 b) public pure returns (address _id, uint8 _opNum) {
        bytes memory data = concatAddrUint(a, b);
        // (_id, _opNum) = abi.decode(data, (address, uint8));
        // assembly {
        //     parsed := div(mload(add(data, 32)), 0x1000000000000000000000000)
        // }
        // _id = parsed(data);
        // _id = bytesToAddress(data);
        assembly {
            _id := mload(add(data, 20))
        }
        _opNum = uint8(data[20]);
    }

    function bytesToAddress(bytes memory bys) public pure returns (address addr) {
      assembly {
        addr := mload(add(bys,20))
      }
    }

    function bytes32To(address _id, uint8 _typeId) external pure returns (bytes32) {
        return bytes32(abi.encodePacked(_id, _typeId));
    }
}
