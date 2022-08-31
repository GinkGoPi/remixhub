// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

// chainlink aggregator
interface IAggregator {
    function latestAnswer() external view returns (uint answer);
}

interface ICurvePool {
    function get_virtual_price() external view returns (uint price);
}


contract FraxUSDCOracle {
    address public owner;

    ICurvePool public constant FraxUSDC = ICurvePool(0xDcEF968d416a41Cdac0ED8702fAC8128A64241A2);
    IAggregator public constant FRAX = IAggregator(0xB9E1E3A9feFf48998E45Fa90847ed4D467E8BcfD);
    IAggregator public constant USDC = IAggregator(0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6);

    constructor () {
        owner = msg.sender;
    }

    function _min(uint a, uint b) internal pure returns (uint) {
        return a < b ? a : b;
    }

    function _get() internal view returns (uint) {
        uint minStable = _min(
            uint(FRAX.latestAnswer()), uint(USDC.latestAnswer())
        );

        uint yVCurvePrice = FraxUSDC.get_virtual_price() * minStable;
        return 1e44 / yVCurvePrice;
    }

    function get() public view returns (bool, uint) {
        return (true, _get());
    }
    
}