// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./WhoopsiesRaffleL2.sol";

contract WhoopDoopRaffleRelayer {
    WhoopsiesRaffleL2 private _raffleContract;

    struct Purchase {
        address wallet;
        uint32 ticketCount;
    }

    constructor(address raffleContractAddress) {
        _raffleContract = WhoopsiesRaffleL2(raffleContractAddress);
    }

    function getMyEntries(uint256 raffleId) public view returns (uint256) {
        if (raffleId < 19) return 0;
        uint256 entriesFound = 0;
        address requestedAddress = msg.sender;
        uint256 length = _raffleContract.getTotalParticipants(raffleId);
        WhoopsiesRaffleL2.Entry memory entry;
        for (uint256 i = 0; i < length; ) {
            (uint32 lowerBound, uint32 upperBound, address wallet) = _raffleContract.Entries(raffleId, length - (i + 1));
            if (wallet == requestedAddress) {
                entry = WhoopsiesRaffleL2.Entry(lowerBound, upperBound, wallet);
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
        if (raffleId < 19) return lastPurchases;
        WhoopsiesRaffleL2.Entry memory entry;

        for (uint256 i = 0; i < query; ) {
            (uint32 lowerBound, uint32 upperBound, address wallet) = _raffleContract.Entries(raffleId, length - (i + 1));
            entry = WhoopsiesRaffleL2.Entry(lowerBound, upperBound, wallet);
            Purchase memory purchase;
            purchase.wallet = entry.wallet;
            purchase.ticketCount = (entry.upperBound - entry.lowerBound) + 1;
            lastPurchases[i] = purchase;
        unchecked {i++;}
        }

        return lastPurchases;
    }

    function getOnGoing() public view returns (WhoopsiesRaffleL2.Raffle[] memory) {
        uint256[] memory onGoingIds = _raffleContract.getOngoingRaffles();
        WhoopsiesRaffleL2.Raffle[] memory onGoingRaffles = new WhoopsiesRaffleL2.Raffle[](onGoingIds.length);

        for (uint256 i = 0; i < onGoingIds.length; i++) {
            (uint32 raffleId, uint128 ethPrice, uint128 doopPrice,
            uint64 endTime, uint32 entriesCount, bool payableWithDoop,
            bool hasEnded, address winner, WhoopsiesRaffleL2.Prize memory prize) = _raffleContract.OnGoingRaffles(onGoingIds[i]);

            WhoopsiesRaffleL2.Raffle memory newRaffle = WhoopsiesRaffleL2.Raffle({
                raffleId: raffleId,
                ethPrice: ethPrice,
                doopPrice: doopPrice,
                endTime: endTime,
                entriesCount: entriesCount,
                payableWithDoop: payableWithDoop,
                hasEnded: hasEnded,
                winner: winner,
                rafflePrize: WhoopsiesRaffleL2.Prize({
                    NFTContract: prize.NFTContract,
                    NFTContract_L2: prize.NFTContract_L2,
                    NFTTokenId: prize.NFTTokenId,
                    NFTTokenId_L2: prize.NFTTokenId_L2
                })
            });
            onGoingRaffles[i] = newRaffle;
        }
        return onGoingRaffles;
    }

    function getEnded() public view returns (WhoopsiesRaffleL2.Raffle[] memory) {
        uint256[] memory endedIds = _raffleContract.getEndedRaffles();
        WhoopsiesRaffleL2.Raffle[] memory endedRaffles = new WhoopsiesRaffleL2.Raffle[](endedIds.length);

        for (uint256 i = 0; i < endedIds.length; i++) {
            (uint32 raffleId, uint128 ethPrice, uint128 doopPrice,
            uint64 endTime, uint32 entriesCount, bool payableWithDoop,
            bool hasEnded, address winner, WhoopsiesRaffleL2.Prize memory prize) = _raffleContract.OnGoingRaffles(endedIds[i]);

            WhoopsiesRaffleL2.Raffle memory newRaffle = WhoopsiesRaffleL2.Raffle({
                raffleId: raffleId,
                ethPrice: ethPrice,
                doopPrice: doopPrice,
                endTime: endTime,
                entriesCount: entriesCount,
                payableWithDoop: payableWithDoop,
                hasEnded: hasEnded,
                winner: winner,
                rafflePrize: WhoopsiesRaffleL2.Prize({
                    NFTContract: prize.NFTContract,
                    NFTContract_L2: prize.NFTContract_L2,
                    NFTTokenId: prize.NFTTokenId,
                    NFTTokenId_L2: prize.NFTTokenId_L2
                })
            });
            endedRaffles[i] = newRaffle;
        }
        return endedRaffles;
    }
}