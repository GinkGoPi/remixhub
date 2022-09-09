// SPDX-License-Identifier: UNLICENSE
pragma solidity ^0.8.7;

import "./ERC20.sol";

contract Cvx3crvMock is ERC20WithSupply {
    uint public constant PERTIMEALLOW = 100e18;

    constructor(uint _initialAmount) {
		balanceOf[msg.sender] = 100000e18;
		// Update total supply
		totalSupply = _initialAmount;
	}

    function faucet(address to) external {
        require(balanceOf[address(this)] > 0, "No balance to support");
        transfer(to, PERTIMEALLOW);
    }
}