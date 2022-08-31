// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

// chainlink aggregator
interface IAggregator {
    function latestAnswer() external view returns (uint answer);
}

interface ICurvePool {
    function get_virtual_price() external view returns (uint price);
}


contract LUSD3CrvOracle {
    address public owner;

    ICurvePool public constant LUSD3Crv = ICurvePool(0xEd279fDD11cA84bEef15AF5D39BB4d4bEE23F0cA);
    IAggregator public constant LUSD = IAggregator(0x3D7aE7E594f2f2091Ad8798313450130d0Aba3a0);
    IAggregator public constant DAI = IAggregator(0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9);
    IAggregator public constant USDC = IAggregator(0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6);
    IAggregator public constant USDT = IAggregator(0x3E7d1eAB13ad0104d2750B8863b489D65364e32D);

    constructor () {
        owner = msg.sender;
    }

    function _min(uint a, uint b) internal pure returns (uint) {
        return a < b ? a : b;
    }

    function _get() internal view returns (uint) {
        uint minStable = _min(
            uint(DAI.latestAnswer()), 
            _min(uint(USDC.latestAnswer()), _min(uint(USDT.latestAnswer()), uint(LUSD.latestAnswer())))
        );

        uint yVCurvePrice = LUSD3Crv.get_virtual_price() * minStable;
        return 1e44 / yVCurvePrice;
    }

    function get() public view returns (bool, uint) {
        return (true, _get());
    }
    
}