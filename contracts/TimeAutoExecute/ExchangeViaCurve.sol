// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "hardhat/console.sol";

interface IActivePool {
    function withdraw(uint _amount) external;
}

interface IERC20 {
    function balanceOf(address _account) external view returns (uint);
    function allowance(address owner, address spender) external returns (uint);
    function approve(address spender, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

interface ICurve {
    function get_virtual_price() external view returns (uint);
    function get_dy(int128 i, int128 j, uint dx) external view returns (uint);
    function get_dy_underlying(int128 i, int128 j, uint dx) external view returns (uint);
    function exchange(int128 i, int128 j, uint dx, uint min_dy, address _receiver) external returns (uint);
    function exchange_underlying(int128 i, int128 j, uint dx, uint min_dy) external;
    // function exchange_underlying(int128 i, int128 j, uint dx, uint min_dy, address _receiver) external returns (uint);
}


contract ExchangeViaCurve {
    uint public counter;
    uint public interval;
    uint public lastTimeStamp;

    uint public stakeRate = 60;
    uint public platRate = 40;
    uint public DECI = 100;

    address public USDAToken = 0x99D8a9C45b2ecA8864373A26D1459e3Dff1e17F3;
    address public ARCToken = 0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599;

    address public ActivePool = 0xD4Fc541236927E2EAf8F27606bD7309C1Fc2cbee;

    // fork mainnet
    address public USDTToken = 0xdAC17F958D2ee523a2206206994597C13D831ec7;
    address public wETHToken = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address public usda3PoolAddress = 0x5a6A4D54456819380173272A5E8E9B9904BdF41B;
    address public tricrypto2Address = 0xD51a44d3FaE010294C616388b506AcdA1bfAAE46;
    address public uniswapARCAddress = 0xD51a44d3FaE010294C616388b506AcdA1bfAAE46;

    address public USDCTOken = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;

    constructor(uint updateInterval) {
        interval = updateInterval;
        lastTimeStamp = block.timestamp;
    }

    function getBalanceOfUSDA() external view returns (uint) {
        return IERC20(USDAToken).balanceOf(address(this));
    }

    function getBalanceOfUSDT() external view returns (uint) {
        return IERC20(USDTToken).balanceOf(address(this));
    }

    function getPrice() external view returns (uint) {
        return ICurve(usda3PoolAddress).get_virtual_price();
    }

    function getMindy(int128 i, int128 j, uint dx) external view returns (uint) {
        return ICurve(usda3PoolAddress).get_dy_underlying(i, j, dx);
    }

    function exchangeOnce() external returns (uint) {
        uint min_dy = ICurve(usda3PoolAddress).get_dy_underlying(0, 1, 1000);
        // console.log("min_dy", min_dy);
        // IERC20(USDAToken).allowance(address(this), usda3PoolAddress);
        IERC20(USDAToken).approve(usda3PoolAddress, 1000);
        ICurve(usda3PoolAddress).exchange_underlying(0, 3, 1000, min_dy, msg.sender);
        return min_dy;
    }

    /// @dev time exchange
    function convert() external returns (uint min_dy) {
        // withdraw all 
        // uint balance = IActivePool(ActivePool).balanceOf(address(ActivePool));
        // require(balance > 0, "balance less then 0");
        // console.log("init balance", balance);

        // IActivePool(ActivePool).withdraw(balance);
        uint balance = IERC20(USDAToken).balanceOf(address(this));
        console.log("init balance", balance);
        require(balance > 0, "balance less then 0");

        uint toExchange = balance * stakeRate / DECI;
        console.log("to exchange amount", toExchange);
        
        // // USDA => USDT
        min_dy = ICurve(usda3PoolAddress).get_dy_underlying(0, 1, toExchange);
        // console.log("min_dy", min_dy);
        IERC20(USDAToken).approve(usda3PoolAddress, toExchange);
        ICurve(usda3PoolAddress).exchange_underlying(0, 3, toExchange, min_dy, msg.sender);

        // // USDT => wETH
        // uint tBalance = IERC20(USDTToken).balanceOf(address(this));
        // console.log("exchanged usdt balance", tBalance);

        // // IERC20(USDTToken).approve(tricrypto2Address, tBalance);
        // // ICurve().exchange(tBalance, j, dx, min_dy);

        // // wETh => ARC
        // uint wethBalance = IERC20(wETHToken).balanceOf(address(this));
        // console.log("exchanged weth balance", wethBalance);

        // // IERC20(wETHToken).approve(uniswapARCAddress, wethBalance);
        // // IUniswapPool(uniswapARCAddress).swap(recipient, false, wethBalance, 0);
        // uint arcBalance = IERC20(ARCToken).balanceOf(address(this));
        // console.log("exchanged arc balance", arcBalance);

        // wBTC send to stake

        // ATC send to stake
    }
}