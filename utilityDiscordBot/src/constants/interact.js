const {ethers} = require('ethers');
const abi = require('./abi.js');
const EAPabi = require('./collection/EAPabi.js');
const WDabi = require('./collection/WDabi.js');
const dotenv = require('dotenv').config();

class RaffleContract {
    constructor() {
        this.provider = new ethers.providers.JsonRpcProvider("");
        this.signer = new ethers.Wallet("", this.provider);

        this.ABI = abi;
        this.contractAddress = "";
        this.raffleContract = new ethers.Contract(this.contractAddress, this.ABI, this.signer);
        console.log(`RaffleContract: ${this.contractAddress}`);
        console.log(`RaffleContract: ${(this.raffleContract).toString()}`);
    }
    async startRaffle(_price, _doopPrice, _payableWithDoop, _duration, _prizeNFTContract, _prizeNFTContract_L2, _prizeNFTTokenId, _prizeNFTTokenId_L2) {
        try {
            const price = ethers.utils.parseEther(_price.toString());
            const doopPrice = ethers.utils.parseEther(_doopPrice.toString());
            console.log('Price: ', price, ' ETH');
            console.log('Price: ', doopPrice, ' Doop');
            const payableWithDoop = _payableWithDoop;
            const duration = ethers.BigNumber.from(_duration * 24 * 60 * 60);
            const prizeNFTContract = ethers.utils.getAddress(_prizeNFTContract);
            const prizeNFTContract_L2 = ethers.utils.getAddress(_prizeNFTContract_L2);
            const prizeNFTTokenId = ethers.BigNumber.from(_prizeNFTTokenId);
            const prizeNFTTokenId_L2 = ethers.BigNumber.from(_prizeNFTTokenId_L2);
            const option = { gasLimit: 500000 };
            console.log(`price: ${price}`);
            console.log('prizeNFTContract: ', prizeNFTContract);

            // @dev If the Raffle Contract isn't already the owner 
            // const collectionContract = new CollectionContract(prizeNFTContract);
            // const approveResult = await collectionContract.approve(prizeNFTTokenId);
            // console.log('approved: ', approveResult);

            const transaction = await this.raffleContract.startRaffle(price, doopPrice, payableWithDoop, duration, prizeNFTContract, prizeNFTContract_L2, prizeNFTTokenId, prizeNFTTokenId_L2, option);
            return await transaction.wait();
        }
        catch (error) {
            throw error;
        }
    }

    async endRaffle(_raffleId, seed) {
        try {
            const raffleId = ethers.BigNumber.from(_raffleId);
            const option = { gasLimit: 500000 };

            const transaction = await this.raffleContract.endRaffle(raffleId, seed, option);
            return await transaction.wait();
        }
        catch (error) {
            throw error;
        }
    }

    async pauseRaffle(_raffleId) {
        try {
            const raffleId = ethers.BigNumber.from(_raffleId);
            const option = { gasLimit: 500000 };

            const transaction = await this.raffleContract.pauseRaffle(raffleId, option);
            return await transaction.wait();
        }
        catch (error) {
            throw error;
        }
    }

    async resumeRaffle(_raffleId, toIncreaseTime, _addedTime) {
        try {
            const raffleId = ethers.BigNumber.from(_raffleId);
            const addedTime = ethers.BigNumber.from(_addedTime * 60 * 60);
            const option = { gasLimit: 500000 };

            const transaction = await this.raffleContract.resumeRaffle(raffleId, toIncreaseTime, addedTime, option);
            return await transaction.wait();
        }
        catch (error) {
            throw error;
        }
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

    async getBalance() {
        try {
            const balance = await this.provider.getBalance(this.signer.address);
            return ethers.utils.formatEther(balance);
        } catch (error) {
            throw error;
        }
    }

    async getOnGoingRaffles() {
        try {
            const onGoingIDs = await this.raffleContract.getOngoingRaffles();
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

    async getRaffleIDs() {
        try {
            return await this.raffleContract.getOngoingRaffles();
        } catch (error) {
            throw error;
        }
    }
}

class CollectionContract {
    constructor(contractAddress) {
        this.provider = new ethers.providers.JsonRpcProvider("");
        this.signer = new ethers.Wallet("", this.provider)
        this.ABI = WDabi;
        this.contractAddress = contractAddress;
        this.collectionContract = new ethers.Contract(this.contractAddress, this.ABI, this.signer);
    }

    async approve(_tokenId) {
        try {
            const tokenId = ethers.BigNumber.from(_tokenId);
            const option = { gasLimit: 500000 };

            const transaction = await this.collectionContract.approve("", tokenId, option);
            return await transaction.wait();
        } catch (error) {
            throw error;
        }
    }
}

module.exports = RaffleContract;