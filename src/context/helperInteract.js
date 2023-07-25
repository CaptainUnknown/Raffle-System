import {ethers} from "ethers";
import {helperABI} from "./helperABI.js";
import {helperContractAddress, rpcURL} from "../Constant/constants.js";

export default class HelperContract {
    constructor() {
        this.provider = new ethers.providers.JsonRpcProvider(rpcURL);

        this.ABI = helperABI;
        this.contractAddress = helperContractAddress;
        this.helperContract = new ethers.Contract(this.contractAddress, this.ABI, this.provider);
        console.log(`RaffleContract: ${this.contractAddress}`);
        console.log(`RaffleContract: ${(this.helperContract).toString()}`);
    }

    async getUserEntries(_raffleId) {
        try {
            const raffleId = ethers.BigNumber.from(_raffleId);
            const entries = await this.helperContract.getMyEntries(raffleId);
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
            return await this.helperContract.getRecentEntries(raffleId, query);
        }
        catch (error) {
            throw error;
        }
    }
}
