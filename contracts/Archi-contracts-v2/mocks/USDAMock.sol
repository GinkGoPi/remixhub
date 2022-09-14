// SPDX-License-Identifier: UNLICENSE
pragma solidity ^0.8.7;

import "./ERC20.sol";

contract USDAMock is ERC20WithSupply {
    uint public constant decimals = 18;
    string public constant name = "USDAMock v1";
    string public constant symbol = "USDAMock";

    constructor(uint _initialAmount) {
		balanceOf[address(this)] = _initialAmount;
		// Update total supply
		totalSupply = _initialAmount;
	}

    function faucet(address to, uint amount) external {
        _mint(to, amount);
    }
}