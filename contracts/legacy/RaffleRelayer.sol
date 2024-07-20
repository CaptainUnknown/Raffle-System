// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./WhoopdoopRaffle.sol";

contract WhoopDoopRaffleRelayer {
    WhoopDoopRaffle private _raffleContract;

    constructor(address raffleContractAddress) {
        _raffleContract = WhoopDoopRaffle(raffleContractAddress);
    }

    function getOnGoing() public view returns (WhoopDoopRaffle.Raffle[] memory) {
        uint256[] memory onGoingIds = _raffleContract.getOngoingRaffles();
        WhoopDoopRaffle.Raffle[] memory onGoingRaffles = new WhoopDoopRaffle.Raffle[](onGoingIds.length);
        
        for (uint256 i = 0; i < onGoingIds.length; i++) {
            (uint32 raffleId, uint128 ethPrice, uint128 doopPrice,
            uint64 endTime, uint32 entriesCount, bool payableWithDoop,
            bool hasEnded, address winner, WhoopDoopRaffle.Prize memory prize) = _raffleContract.OnGoingRaffles(onGoingIds[i]);

            WhoopDoopRaffle.Raffle memory newRaffle = WhoopDoopRaffle.Raffle({
                raffleId: raffleId,
                ethPrice: ethPrice,
                doopPrice: doopPrice,
                endTime: endTime,
                entriesCount: entriesCount,
                payableWithDoop: payableWithDoop,
                hasEnded: hasEnded,
                winner: winner,
                rafflePrize: WhoopDoopRaffle.Prize({
                    NFTContract: prize.NFTContract,
                    NFTTokenId: prize.NFTTokenId
                })
            });
            onGoingRaffles[i] = newRaffle;
        }
        return onGoingRaffles;
    }

    function getEnded() public view returns (WhoopDoopRaffle.Raffle[] memory) {
        uint256[] memory endedIds = _raffleContract.getEndedRaffles();
        WhoopDoopRaffle.Raffle[] memory endedRaffles = new WhoopDoopRaffle.Raffle[](endedIds.length);
        
        for (uint256 i = 0; i < endedIds.length; i++) {
            (uint32 raffleId, uint128 ethPrice, uint128 doopPrice,
            uint64 endTime, uint32 entriesCount, bool payableWithDoop,
            bool hasEnded, address winner, WhoopDoopRaffle.Prize memory prize) = _raffleContract.OnGoingRaffles(endedIds[i]);

            WhoopDoopRaffle.Raffle memory newRaffle = WhoopDoopRaffle.Raffle({
                raffleId: raffleId,
                ethPrice: ethPrice,
                doopPrice: doopPrice,
                endTime: endTime,
                entriesCount: entriesCount,
                payableWithDoop: payableWithDoop,
                hasEnded: hasEnded,
                winner: winner,
                rafflePrize: WhoopDoopRaffle.Prize({
                    NFTContract: prize.NFTContract,
                    NFTTokenId: prize.NFTTokenId
                })
            });
            endedRaffles[i] = newRaffle;
        }
        return endedRaffles;
    }
}