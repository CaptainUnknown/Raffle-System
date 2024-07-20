import {ethers} from "ethers";
import {marketplaceABI} from "./marketplaceABI.js";
import {raffleContractAddress, rpcURL} from "../Constant/constants.js";

export default class MarketplaceContract {
    constructor() {
        this.provider = new ethers.providers.JsonRpcProvider(rpcURL);

        this.ABI = marketplaceABI;
        this.contractAddress = raffleContractAddress;
        this.marketplaceContract = new ethers.Contract(this.contractAddress, this.ABI, this.provider);
        console.log(`MarketplaceContract: ${this.contractAddress}`);
        console.log(`MarketplaceContract: ${(this.marketplaceContract).toString()}`);
    }
    async getListing(_listingId) {
        try {
            const listingId = ethers.BigNumber.from(_listingId);
            return await this.marketplaceContract.OpenedListings(listingId);
        }
        catch (error) {
            throw error;
        }
    }
}
