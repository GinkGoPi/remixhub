// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

interface IFakeTroves {
    /// @dev For borrow strategy set value about trove
    function setBorrowTroveStatus(address _borrower, uint _num) external;
    function setBorrowTroveStartTime(address _borrower, uint _timestamp) external;
    function increaseBorrowTroveColl(address _borrower, uint _collIncrease) external returns (uint);
    function decreaseBorrowTroveColl(address _borrower, uint _collDecrease) external returns (uint);
    function increaseBorrowTroveDebt(address _borrower, uint _debtIncrease) external returns (uint);
    function decreaseBorrowTroveDebt(address _borrower, uint _debtDecrease) external returns (uint);
    
    /// @dev Borrow strategy trove property read
    function getBorrowTroveStatus(address _borrower) external view returns (uint);
    function getBorrowTroveStartTime(address _borrower) external view returns (uint);
    function getBorrowTroveDebt(address _borrower) external view returns (uint);
    function getBorrowTroveInterest(address _borrower) external view returns (uint);
    function getBorrowTroveColl(address _borrower) external view returns (uint);

    function updateTroveOnce(address _borrower, uint _debt, uint _coll, uint _timestamp, uint _num) external;
}

contract FakeOp {
    using SafeMath for uint;

    IFakeTroves public fakeTroves;

    constructor(address _fakeTrovesAddress) {
        fakeTroves = IFakeTroves(_fakeTrovesAddress);
    }

    // gas 196151 / tx 170566
    // gas 74945  / tx 65169
    function openTrove(uint _coll, uint _debt) external {
        fakeTroves.increaseBorrowTroveColl(msg.sender, _coll);
        fakeTroves.increaseBorrowTroveDebt(msg.sender, _debt);
        fakeTroves.setBorrowTroveStatus(msg.sender, 1);
        fakeTroves.setBorrowTroveStartTime(msg.sender, block.timestamp);
    }

    // gas 142625 / tx 124021
    // gas 60745 / tx 52821
    function onceWrite(uint _collIn, uint _debtIn) external {
        uint coll = fakeTroves.getBorrowTroveColl(msg.sender);
        uint debt = fakeTroves.getBorrowTroveDebt(msg.sender);
        uint newColl = coll.add(_collIn);
        uint newDebt = debt.add(_debtIn);
        fakeTroves.updateTroveOnce(msg.sender, newDebt, newColl, block.timestamp, 1);
    }

}
