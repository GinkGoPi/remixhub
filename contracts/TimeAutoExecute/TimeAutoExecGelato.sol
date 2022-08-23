// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract TimeAutoExecGelato {
    uint public counter;
    uint public interval;
    uint public lastTimeStamp;

    constructor(uint updateInterval) {
        interval = updateInterval;
        lastTimeStamp = block.timestamp;
    }

    function increaseCounter() external {
        if ((block.timestamp - lastTimeStamp) > interval) {
            lastTimeStamp = block.timestamp;
            counter = counter + 1;
        }
    }

    // function convert(address _activePool, address _basePool) external {
    //     uint balance = IActive(_activePool).totalEarn();
    //     IActive(_activePool).withdraw(balance);
    //     ISwap(_basePool).swap();
        
    // }

}