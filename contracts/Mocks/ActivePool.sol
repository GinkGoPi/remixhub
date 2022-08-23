// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor (uint _initialSupply, string memory _name, string memory _symbol) ERC20(_name, _symbol) {
        _mint(address(this), _initialSupply);
    }

    function withdraw(uint _amount) external {
        require(_amount > 0, "withdraw less then 0");
        require(balanceOf(address(this)) >= _amount, "balance less than amount");
        _approve(address(this), msg.sender, _amount);
        transferFrom(address(this), msg.sender, _amount);
    }
    
}