import {ethers} from "ethers";
import {relayABI} from "./raffleRelayABI.js";
import {raffleRelayContractAddress, rpcUrlNova} from "../Constant/constants.js";

export default class RaffleRelayContract {
    constructor() {
        this.provider = new ethers.providers.JsonRpcProvider(rpcUrlNova);

        this.ABI = relayABI;
        this.contractAddress = raffleRelayContractAddress;
        this.relayContract = new ethers.Contract(this.contractAddress, this.ABI, this.provider);
        console.log(`RelayContract RaffleContract: ${this.contractAddress}`);
        console.log(`RelayContract RaffleContract: ${(this.relayContract).toString()}`);
    }

    async getOnGoing() {
        try {
            return await this.relayContract.getOnGoing();
        }
        catch (error) {
            throw error;
        }
    }

    async getEnded() {
        try {
            return await this.relayContract.getEnded();
        }
        catch (error) {
            throw error;
        }
    }

    async getUserEntries(_raffleId) {
        try {
            const raffleId = ethers.BigNumber.from(_raffleId);
            const entries = await this.relayContract.getMyEntries(raffleId);
            return entries.toNumber();
        }
        catch (error) {
            throw error;
        }
    }

    async getRecentEntries(_raffleId) {
        try {
            const raffleId = ethers.BigNumber.from(_raffleId);
            const query = ethers.BigNumber.from(10);
            return await this.relayContract.getRecentEntries(raffleId, query);
        }
        catch (error) {
            throw error;
        }
    }
}
