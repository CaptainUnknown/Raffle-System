// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./WhoopdoopRaffle.sol";

contract WhoopDoopRaffleExtended {
    WhoopDoopRaffle private _raffleContract;

    struct Purchase {
        address wallet;
        uint32 ticketCount;
    }

    constructor(address raffleContractAddress) {
        _raffleContract = WhoopDoopRaffle(raffleContractAddress);
    }

    function getMyEntries(uint256 raffleId) public view returns (uint256) {
        uint256 entriesFound = 0;
        address requestedAddress = msg.sender;
        uint256 length = _raffleContract.getTotalParticipants(raffleId);
        WhoopDoopRaffle.Entry memory entry;
        for (uint256 i = 0; i < length; ) {
            (uint32 lowerBound, uint32 upperBound, address wallet) = _raffleContract.Entries(raffleId, length - (i + 1));
            if (wallet == requestedAddress) {
                entry = WhoopDoopRaffle.Entry(lowerBound, upperBound, wallet);
                entriesFound += (entry.upperBound - entry.lowerBound) + 1;
            }
        unchecked {i++;}
        }

        return entriesFound;
    }

    function getRecentEntries(uint256 raffleId, uint256 query) public view returns (Purchase[] memory) {
        uint256 length = _raffleContract.getTotalParticipants(raffleId);
        if (length < query) query = length;
        Purchase[] memory lastPurchases = new Purchase[](query);
        WhoopDoopRaffle.Entry memory entry;

        for (uint256 i = 0; i < query; ) {
            (uint32 lowerBound, uint32 upperBound, address wallet) = _raffleContract.Entries(raffleId, length - (i + 1));
            entry = WhoopDoopRaffle.Entry(lowerBound, upperBound, wallet);
            Purchase memory purchase;
            purchase.wallet = entry.wallet;
            purchase.ticketCount = (entry.upperBound - entry.lowerBound) + 1;
            lastPurchases[i] = purchase;
        unchecked {i++;}
        }

        return lastPurchases;
    }
}