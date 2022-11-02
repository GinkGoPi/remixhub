// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";


// contract DTMToken {
contract DTMToken is Ownable{
    uint public price;
    
    // address public owner;
    // constructor () {
    //     owner = msg.sender;
    // }

    // modifier onlyOwner() {
    //     require(owner == msg.sender, "Ownable: caller is not the owner");
    //     _;
    // }

    function setPrice(uint _price) external returns (uint) {
        price = _price;
        return price;
    } 

}
