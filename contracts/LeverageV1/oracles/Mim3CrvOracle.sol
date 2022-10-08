// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

// Chainlink Aggregator

interface IAggregator {
    function latestAnswer() external view returns (int256 answer);
}

interface ICurvePool {
    function get_virtual_price() external view returns (uint256 price);
}

contract Mim3CrvOracle {
    ICurvePool public constant mim3crv = ICurvePool(0x5a6A4D54456819380173272A5E8E9B9904BdF41B);
    IAggregator public constant MIM = IAggregator(0x7A364e8770418566e3eb2001A96116E6138Eb32F);
    IAggregator public constant DAI = IAggregator(0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9);
    IAggregator public constant USDC = IAggregator(0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6);
    IAggregator public constant USDT = IAggregator(0x3E7d1eAB13ad0104d2750B8863b489D65364e32D);

    /**
     * @dev Returns the smallest of two numbers.
     */
    // FROM: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/6d97f0919547df11be9443b54af2d90631eaa733/contracts/utils/math/Math.sol
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    // Calculates the lastest exchange rate
    // Uses both divide and multiply only for tokens not supported directly by Chainlink, for example MKR/USD
    function get() public view returns (uint256) {
        // As the price should never be negative, the unchecked conversion is acceptable
        uint256 minStable = min(
            uint256(DAI.latestAnswer()),
            min(uint256(USDC.latestAnswer()), min(uint256(USDT.latestAnswer()), uint256(MIM.latestAnswer())))
        );

        uint256 yVCurvePrice = mim3crv.get_virtual_price() * minStable;

        return yVCurvePrice / 1e8;
    }
}
