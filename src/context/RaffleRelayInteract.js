import {ethers} from "ethers";
import {relayABI} from "./raffleRelayABI.js";
import {raffleRelayContractAddress, rpcURL} from "../Constant/constants.js";

export default class RaffleRelayContract {
    constructor() {
        this.provider = new ethers.providers.JsonRpcProvider(rpcURL);

        this.ABI = relayABI;
        this.contractAddress = raffleRelayContractAddress;
        this.relayContract = new ethers.Contract(this.contractAddress, this.ABI, this.provider);
        console.log(`RaffleContract: ${this.contractAddress}`);
        console.log(`RaffleContract: ${(this.relayContract).toString()}`);
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
}
