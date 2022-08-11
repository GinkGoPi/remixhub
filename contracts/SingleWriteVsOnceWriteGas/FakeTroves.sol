// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";


contract FakeTroves {
    using SafeMath for uint;

    enum Status {
        nonExistent,
        active,
        closedByBorrow,
        closedByLeverage,
        closedByRedemption,
        closedByLiquidation
    }

    struct Trove {
        Status status;
        uint debt;
        uint coll;
        uint startTime; // calc interest start timestamp
        uint margin; // leverage
    }

    mapping(address => Trove) public borrowTroves;

    uint public totalDebts;
    uint public totalColls;

    address public borrowOperationAddr;
    address public leverageOperationAddr;
    address public redeemOperationAddr;

    function setAddresses(address _borrowOpAddr, address _leverageOpAddr, address _redeemOpAddr) external {
        borrowOperationAddr = _borrowOpAddr;
        leverageOperationAddr = _leverageOpAddr;
        redeemOperationAddr = _redeemOpAddr;
    }

    function setBorrowTroveStatus(address _borrower, uint _num)
        external
    {
        _requireCallerIsAllowed();
        borrowTroves[_borrower].status = Status(_num);
    }

    function increaseBorrowTroveColl(address _borrower, uint _collIncrease)
        external
        returns (uint)
    {
        _requireCallerIsAllowed();
        uint newColl = borrowTroves[_borrower].coll.add(_collIncrease);
        borrowTroves[_borrower].coll = newColl;

        totalColls = totalColls.add(_collIncrease);
        return newColl;
    }

    function decreaseBorrowTroveColl(address _borrower, uint _collDecrease)
        external
        returns (uint)
    {
        _requireCallerIsAllowed();
        uint newColl = borrowTroves[_borrower].coll.sub(_collDecrease);
        borrowTroves[_borrower].coll = newColl;

        totalColls = totalColls.sub(_collDecrease);
        return newColl;
    }

    function increaseBorrowTroveDebt(address _borrower, uint _debtIncrease)
        external
        returns (uint)
    {
        _requireCallerIsAllowed();
        uint newDebt = borrowTroves[_borrower].debt.add(_debtIncrease);
        borrowTroves[_borrower].debt = newDebt;

        totalDebts = totalDebts.add(_debtIncrease);
        return newDebt;
    }

    function decreaseBorrowTroveDebt(address _borrower, uint _debtDecrease)
        external
        returns (uint)
    {
        _requireCallerIsAllowed();
        uint newDebt = borrowTroves[_borrower].debt.sub(_debtDecrease);
        borrowTroves[_borrower].debt = newDebt;

        totalDebts = totalDebts.sub(_debtDecrease);
        borrowTroves[_borrower].startTime = block.timestamp;
        return newDebt;
    }

    function setBorrowTroveStartTime(address _borrower, uint _timestamp)
        external
    {
        _requireCallerIsAllowed();
        borrowTroves[_borrower].startTime = _timestamp;
    }

    function getBorrowTroveStatus(address _borrower)
        external
        view
        returns (uint)
    {
        return uint(borrowTroves[_borrower].status);
    }

    function getBorrowTroveStartTime(address _borrower)
        external
        view
        returns (uint)
    {
        return uint(borrowTroves[_borrower].startTime);
    }

    function getBorrowTroveDebt(address _borrower)
        external
        view
        returns (uint)
    {
        return borrowTroves[_borrower].debt;
    }

    function getBorrowTroveInterest(address _borrower)
        external
        view
        returns (uint)
    {
        require(
            block.timestamp >= borrowTroves[_borrower].startTime, 
            "TrovesManager: trove start timestamp lt block now"
        );
        return _calcInterest(borrowTroves[_borrower].debt, borrowTroves[_borrower].startTime);
    }

    function _calcInterest(uint _baseDebt, uint _startTime)
        internal
        view
        returns (uint)
    {
        uint interestDays = block.timestamp.sub(_startTime);
        if (interestDays <= 1 days) {
            interestDays = 1 days;
        }
        return _baseDebt.div(1).div(interestDays);
    }

    function getBorrowTroveColl(address _borrower)
        external
        view
        returns (uint)
    {
        return borrowTroves[_borrower].coll;
    }

    // with once operate to change trove's attrubites
    function updateTroveOnce(address _borrower, uint _debt, uint _coll, uint _timestamp, uint _num) external {
        _requireCallerIsAllowed();
        borrowTroves[_borrower].debt = _debt;
        borrowTroves[_borrower].coll = _coll;
        borrowTroves[_borrower].startTime = _timestamp;
        borrowTroves[_borrower].status = Status(_num);
    }

    function _requireCallerIsAllowed() internal view {
        require(
            msg.sender == borrowOperationAddr ||
                msg.sender == leverageOperationAddr ||
                msg.sender == redeemOperationAddr,
            "TrovesManager: caller is not borrow or leverage contract"
        );
    }

}