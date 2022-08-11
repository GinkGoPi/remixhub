// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;


contract EnumUse {
    enum Status {
        invalid,
        owner,
        others
    }

    function element(address _id) public view returns (Status status) {
        if (_id == address(0)) {
            status = Status.invalid;
        } else if (_id == msg.sender) {
            status = Status.owner;
        } else {
            status = Status.others;
        }
    }

    function useEnumWrap(address _id, uint8 _rate) external view returns (uint8) {
        uint8 base = uint8(element(_id));
        return base*_rate;
    }
}