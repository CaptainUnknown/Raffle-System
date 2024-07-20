export const topic0 = {
    "anonymous": false,
    "inputs": [
        {
            "indexed": true,
            "internalType": "uint32",
            "name": "raffleId",
            "type": "uint32"
        },
        {
            "indexed": false,
            "internalType": "uint128",
            "name": "price",
            "type": "uint128"
        },
        {
            "indexed": false,
            "internalType": "uint64",
            "name": "endTime",
            "type": "uint64"
        },
        {
            "components": [
                {
                    "internalType": "address",
                    "name": "NFTContract",
                    "type": "address"
                },
                {
                    "internalType": "uint32",
                    "name": "NFTTokenId",
                    "type": "uint32"
                }
            ],
            "indexed": false,
            "internalType": "struct WhoopDoopRaffle.Prize",
            "name": "rafflePrize",
            "type": "tuple"
        }
    ],
    "name": "RaffleStarted",
    "type": "event"
};

export const topic1 = {
    "anonymous": false,
    "inputs": [
        {
            "indexed": true,
            "internalType": "uint256",
            "name": "raffleId",
            "type": "uint256"
        },
        {
            "indexed": false,
            "internalType": "address",
            "name": "winner",
            "type": "address"
        }
    ],
    "name": "Winner",
    "type": "event"
};

export const topic0ID = "0xdb3a984435034ab468a74c1966de00c53a75c969b6b1c4576b78e68a6571fb73";
export const topic1ID = "0x6b5936f5be80114e7a91daf84ba4886ece975aaffac48c9609cfa022d74a8a7d";
