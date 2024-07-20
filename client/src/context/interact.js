import {ethers} from "ethers";
import {abi} from "./abi.js";
import {raffleContractAddress, rpcURL} from "../Constant/constants.js";

export default class RaffleContract {
    constructor() {
        this.provider = new ethers.providers.JsonRpcProvider(rpcURL);

        this.ABI = abi;
        this.contractAddress = raffleContractAddress;
        this.raffleContract = new ethers.Contract(this.contractAddress, this.ABI, this.provider);
        console.log(`RaffleContract: ${this.contractAddress}`);
        console.log(`RaffleContract: ${(this.raffleContract).toString()}`);
    }
    async getRaffle(_raffleId) {
        try {
            const raffleId = ethers.BigNumber.from(_raffleId);
            return await this.raffleContract.OnGoingRaffles(raffleId);
        }
        catch (error) {
            throw error;
        }
    }

    async getAllRaffles() {
        try {
            const raffles = [];
            const onGoingIDs = await this.raffleContract.getOngoingRaffles();
            console.log(`onGoingIDs: ${onGoingIDs}`);
            const onGoing = [];
            if (onGoingIDs.length !== 0) {
                for (let i = 0; i < onGoingIDs.length; i++) {
                    const raffle = await this.getRaffle(onGoingIDs[i]);
                    onGoing.push(raffle);
                }
                const parsedOnGoing = onGoing.map((arr) => {
                    return arr.map((item) => {
                        if (item instanceof ethers.BigNumber) {
                            return item;
                        } else if (typeof item === "object" && "_isBigNumber" in item) {
                            return ethers.BigNumber.from(item._hex);
                        } else {
                            return item;
                        }
                    });
                });
                console.log('parsedOnGoing:', parsedOnGoing.toString());
                const raffleInfoRaw = ((parsedOnGoing).toString()).split(",");
                for (let i = 0; i < raffleInfoRaw.length; i += 10) {
                    const raffle = {
                        raffleId: raffleInfoRaw[i],
                        price: raffleInfoRaw[i+1] / 1000000000000000000, // 18 decimals
                        // Temporary: (Usual endedRaffleInfoRaw[i+2] / 1000000000000000000)
                        doopPrice: raffleInfoRaw[i] === '0' ? 1 : raffleInfoRaw[i+2] / 1000000000000000000, // 18 decimals
                        img: `https://picsum.photos/2/2?random=${i*9}`,
                        payableWithDoop: raffleInfoRaw[i + 5] === 'true',
                        hasEnded: false,
                        endTime: new Date(raffleInfoRaw[i+3] * 1000),
                        winner: !raffleInfoRaw[i+7] ? 'Not Selected Yet' : raffleInfoRaw[i+7],
                        participants: raffleInfoRaw[i + 4],
                        nftContract: raffleInfoRaw[i+8],
                        nftTokenId: raffleInfoRaw[i+9]
                    }
                    console.log(`raffle from interact`, raffle);
                    // raffle.participants = await this.getParticipants(raffle.raffleId);
                    // raffle.participants = raffle.participants.toNumber();
                    parseInt(raffle.raffleId) !== 10 && raffles.push(raffle);
                }
            }

            const endedIDs = await this.raffleContract.getEndedRaffles();
            console.log(`endedIDs: ${endedIDs}`);
            if (endedIDs.length === 0) return raffles;
            const ended = [];
            for (let i = 0; i < endedIDs.length; i++) {
                const raffle = await this.getRaffle(endedIDs[i]);
                ended.push(raffle);
            }
            const parsedEnded = ended.map((arr) => {
                return arr.map((item) => {
                    if (item instanceof ethers.BigNumber) {
                        return item;
                    } else if (typeof item === "object" && "_isBigNumber" in item) {
                        return ethers.BigNumber.from(item._hex);
                    } else {
                        return item;
                    }
                });
            });

            console.log('parsedOnEnded:', parsedEnded.toString());
            const endedRaffleInfoRaw = ((parsedEnded).toString()).split(",");
            for (let i = 0; i < endedRaffleInfoRaw.length; i += 10) {
                const raffle = {
                    raffleId: endedRaffleInfoRaw[i],
                    price: endedRaffleInfoRaw[i+1] / 1000000000000000000, // 18 decimals
                    // Temporary: (Usual endedRaffleInfoRaw[i+2] / 1000000000000000000)
                    doopPrice: endedRaffleInfoRaw[i] === '0' ? 1 : endedRaffleInfoRaw[i+2] / 1000000000000000000, // 18 decimals
                    payableWithDoop: endedRaffleInfoRaw[i + 5] === 'true',
                    img: `https://picsum.photos/2/2?random=${i*9}`,
                    hasEnded: true,
                    endTime: new Date(endedRaffleInfoRaw[i+3] * 1000),
                    winner: !endedRaffleInfoRaw[i+7] ? 'Not Selected Yet' : endedRaffleInfoRaw[i+7],
                    participants: endedRaffleInfoRaw[i + 4],
                    nftContract: endedRaffleInfoRaw[i+8],
                    nftTokenId: endedRaffleInfoRaw[i+9]
                }
                // raffle.participants = await this.getParticipants(raffle.raffleId);
                // raffle.participants = raffle.participants.toNumber();
                raffles.push(raffle);
            }

            return raffles;
        } catch (error) {
            throw error;
        }
    }

    async getEndedRaffles() {
        try {
            const onGoingIDs = await this.raffleContract.getEndedRaffles();
            const onGoing = [];
            for (let i = 0; i < onGoingIDs.length; i++) {
                const raffle = await this.getRaffle(onGoingIDs[i]);
                onGoing.push(raffle);
            }
            return onGoing.map((arr) => {
                return arr.map((item) => {
                    if (item instanceof ethers.BigNumber) {
                        return item;
                    } else if (typeof item === "object" && "_isBigNumber" in item) {
                        return ethers.BigNumber.from(item._hex);
                    } else {
                        return item;
                    }
                });
            });
        } catch (error) {
            throw error;
        }
    }

    async getParticipants(_raffleId) {
        try {
            const raffleId = ethers.BigNumber.from(_raffleId);
            return await this.raffleContract.getTotalParticipants(raffleId);
        }
        catch (error) {
            throw error;
        }
    }

    async getRaffleIDs() {
        try {
            return await this.raffleContract.getOngoingRaffles();
        } catch (error) {
            throw error;
        }
    }

    async getLastEntries(_raffleId, length) {
        try {
            const lastEntries = [];
            const totalParts = (await this.getParticipants(_raffleId)).toNumber();
            const totalEntries = (await this.getRaffle(_raffleId))[4];
            let countedEntries = 0;
            console.log(`totalParts: `, totalParts);
            console.log(`totalEntries: `, totalEntries);
            const id = ethers.BigNumber.from(_raffleId);
            console.log(`id: ${id}`);
            for (let i = 0; i < totalParts || i < length; i++) {
                const index = ethers.BigNumber.from(totalParts - (i + 1));
                const entryRaw = await this.raffleContract.Entries(id, index);
                console.log(`entry:`, entryRaw);
                const raffleInfoParsed = ((entryRaw).toString()).split(",");
                console.log('raffleInfoParsed: ', raffleInfoParsed);
                const tickets = (raffleInfoParsed[1] - raffleInfoParsed[0]) + 1;
                console.log('tickets: ', tickets);
                const wallet = raffleInfoParsed[2];
                const entry = {
                    tickets,
                    wallet
                }
                lastEntries.push(entry);
                countedEntries += tickets;
                if (countedEntries >= totalEntries) break;
            }
            console.log('lastEntries:', lastEntries);
            return lastEntries;
        } catch (error) {
            throw error;
        }
    }

    async getTotalEntries(_raffleId) {
        try {
            const raffle = await this.getRaffle(_raffleId);
            const onGoing = [];
            onGoing.push(raffle);
            const parsedOnGoing = onGoing.map((arr) => {
                return arr.map((item) => {
                    if (item instanceof ethers.BigNumber) {
                        return item;
                    } else if (typeof item === "object" && "_isBigNumber" in item) {
                        return ethers.BigNumber.from(item._hex);
                    } else {
                        return item;
                    }
                });
            });
            const raffleInfoRaw = ((parsedOnGoing).toString()).split(",");
            return raffleInfoRaw[4];
        } catch (error) {
            throw error;
        }
    }

    async getENS(address) {
        return await this.provider.lookupAddress(address);
    }
}
