// SPDX-License-Identifier: UNLICENSE
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Vault is Ownable {

    event ContractSet(address indexed masterContract, bool enabled);
    event SwapperSet(address swapper, bool enabled);
    event Created(address indexed masterContract, bytes data, address clone_address);

    mapping(address => bool) public contracts; // Map of allowed master Contracts.
    mapping(address => bool) public swappers; // Map of allowed Swappers.

    mapping(IERC20 => mapping(address => uint)) public shareOf; // Balance per token per address/contract
    mapping(IERC20 => uint) public totalShare; // Total share per token
    mapping(IERC20 => uint) public totalBalance; // Total balance per token

    address public feeTo;


    constructor() {
        feeTo = msg.sender;
    }

    // Disables / enables a given master contract. If the master contract doesn't exist yet, it gets added to the map.
    // When a master contract is disabled, it cannot be deployed. However, this doesn't affect already deployed clones.
    function setContract(address newContract, bool enabled) external onlyOwner() {
        contracts[newContract] = enabled;
        emit ContractSet(newContract, enabled);
    }

    // Disables / enables a given Swapper. If the Swapper doesn't exist yet, it gets added to the map.
    function setSwapper(address swapper, bool enabled) external onlyOwner() {
        swappers[swapper] = enabled;
        emit SwapperSet(swapper, enabled);
    }

    function toAmount(IERC20 token, uint256 share) external view returns (uint256) {
        return share * totalBalance[token] / totalShare[token];
    }

    function toShare(IERC20 token, uint256 amount) external view returns (uint256) {
        return amount * totalShare[token] / totalBalance[token];
    }

    // Transfers funds from the vault (for msg.sender) to the user. Can be called by any contract or EOA.
    function transferShare(IERC20 token, address to, uint256 share) external returns (uint256) {
        shareOf[token][msg.sender] = shareOf[token][msg.sender] - share;
        uint256 amount = share * totalBalance[token] / totalShare[token];
        totalShare[token] = totalShare[token]- share;
        totalBalance[token] = totalBalance[token]- amount;

        (bool success, bytes memory data) = address(token).call(abi.encodeWithSelector(0xa9059cbb, to, amount));
        require(success && (data.length == 0 || abi.decode(data, (bool))), "BentoBox: Transfer failed at ERC20");
        return amount;
    }

    // Transfers funds from the user to the vault (for msg.sender). Can be called by any contract or EOA.
    function transferShareFrom(IERC20 token, address from, uint256 share) external returns (uint256) {
        shareOf[token][msg.sender] = shareOf[token][msg.sender] + share;
        uint256 amount = totalShare[token] == 0 ? share : share * totalBalance[token] / totalShare[token];
        totalShare[token] = totalShare[token] + share;
        totalBalance[token] = totalBalance[token] + amount;

        (bool success, bytes memory data) = address(token).call(abi.encodeWithSelector(0x23b872dd, from, address(this), amount));
        require(success && (data.length == 0 || abi.decode(data, (bool))), "BentoBox: TransferFrom failed at ERC20");
        return amount;
    }

    // Transfers funds from the vault (for msg.sender) to the user. Can be called by any contract or EOA.
    function transferAmount(IERC20 token, address to, uint256 amount) external returns (uint256) {
        uint256 share = amount * totalShare[token] / totalBalance[token];
        shareOf[token][msg.sender] = shareOf[token][msg.sender] - share;
        totalShare[token] = totalShare[token] - share;
        totalBalance[token] = totalBalance[token] - amount;

        (bool success, bytes memory data) = address(token).call(abi.encodeWithSelector(0xa9059cbb, to, amount));
        require(success && (data.length == 0 || abi.decode(data, (bool))), "BentoBox: Transfer failed at ERC20");
        return share;
    }

    // Transfers funds from the user to the vault (for msg.sender). Can be called by any contract or EOA.
    function transferAmountFrom(IERC20 token, address from, uint256 amount) external returns (uint256) {
        uint256 share = totalShare[token] == 0 ? amount : amount * totalShare[token] / totalBalance[token];
        shareOf[token][msg.sender] = shareOf[token][msg.sender] + share;
        totalShare[token] = totalShare[token] + share;
        totalBalance[token] = totalBalance[token] + amount;

        (bool success, bytes memory data) = address(token).call(abi.encodeWithSelector(0x23b872dd, from, address(this), amount));
        require(success && (data.length == 0 || abi.decode(data, (bool))), "BentoBox: TransferFrom failed at ERC20");
        return share;
    }

    // Register funds added to the vault (for msg.sender).
    function addShare(IERC20 token, uint256 share) external returns (uint256) {
        shareOf[token][msg.sender] = shareOf[token][msg.sender] + share;
        uint256 amount = totalShare[token] == 0 ? share : share * totalBalance[token] / totalShare[token];
        totalShare[token] = totalShare[token] + share;
        totalBalance[token] = totalBalance[token] + amount;
        return amount;
    }

    // Register funds added to the vault (for msg.sender).
    function addAmount(IERC20 token, uint256 amount) external returns (uint256) {
        uint256 share = totalShare[token] == 0 ? amount : amount * totalShare[token] / totalBalance[token];
        shareOf[token][msg.sender] = shareOf[token][msg.sender] + share;
        totalShare[token] = totalShare[token] + share;
        totalBalance[token] = totalBalance[token] + amount;
        return share;
    }

    function sync(IERC20 token) external {
        totalBalance[token] = token.balanceOf(address(this));
    }

}