// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract WhoopsiesRaffleHoldersLogger is Ownable {
    struct Qualification {
        bool twoX;
        bool threeX;
        uint16 twoXBalance;
        uint16 threeXBalance;
    }
    mapping (address => Qualification) public holders;

    constructor() Ownable(msg.sender) {}

    function initializeHolders(address[] calldata _holders, bool[] calldata _qualificationTwoX, bool[] calldata _qualificationThreeX, uint16[] calldata _twoXBalance, uint16[] calldata _threeXBalance) public onlyOwner {
        for (uint256 i; i < _holders.length;) {
            holders[_holders[i]] = Qualification({
                twoX: _qualificationTwoX[i],
                threeX: _qualificationThreeX[i],
                twoXBalance: _twoXBalance[i],
                threeXBalance: _threeXBalance[i]
            });
            unchecked {
                i++;
            }
        }
    }

    function initializeHoldersForTwoX(address[] calldata _holders, bool[] calldata _qualificationTwoX, uint16[] calldata _twoXBalance) public onlyOwner {
        for (uint256 i; i < _holders.length;) {
            holders[_holders[i]].twoX = _qualificationTwoX[i];
            holders[_holders[i]].twoXBalance = _twoXBalance[i];
            unchecked {
                i++;
            }
        }
    }

    function initializeHoldersForThreeX(address[] calldata _holders, bool[] calldata _qualificationThreeX, uint16[] calldata _threeXBalance) public onlyOwner {
        for (uint256 i; i < _holders.length;) {
            holders[_holders[i]].threeX = _qualificationThreeX[i];
            holders[_holders[i]].threeXBalance = _threeXBalance[i];
            unchecked {
                i++;
            }
        }
    }

    function updateQualifierTwoX(bool _twoX, uint16 _twoXBalance, address qualifier) public onlyOwner {
        holders[qualifier].twoX = _twoX;
        holders[qualifier].twoXBalance = _twoXBalance;
    }

    function updateQualifierThreeX(bool _threeX, uint16 _threeXBalance, address qualifier) public onlyOwner {
        holders[qualifier].threeX = _threeX;
        holders[qualifier].twoXBalance = _threeXBalance;
    }

    function swapQualifierTwoX(address previousQualifier, address newQualifier) public onlyOwner {
        bool _twoX = holders[previousQualifier].twoX;
        holders[previousQualifier].twoX = false;
        holders[previousQualifier].twoXBalance--;
        holders[newQualifier].twoX = _twoX;
        holders[newQualifier].twoXBalance++;
    }

    function swapQualifierThreeX(address previousQualifier, address newQualifier) public onlyOwner {
        bool _threeX = holders[previousQualifier].threeX;
        holders[previousQualifier].threeX = false;
        holders[previousQualifier].threeXBalance--;
        holders[newQualifier].threeX = _threeX;
        holders[newQualifier].threeXBalance++;
    }

    function qualifiesForTwoX(address candidate) public view returns(bool) {
        return holders[candidate].threeX;
    }

    function qualifiesForThreeX(address candidate) public view returns(bool) {
        return holders[candidate].twoX;
    }

    function getTwoXBalance(address holder) public view returns(uint16) {
        return holders[holder].twoXBalance;
    }

    function getThreeXBalance(address holder) public view returns(uint16) {
        return holders[holder].threeXBalance;
    }
}
