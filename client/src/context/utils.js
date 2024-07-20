import {
    alchemyAPIKey,
    arbiscanAPI,
    ipfsGateway,
    liveCoinWatchAPIKey,
    openSeaAPIKey,
    raffleContractAddress, rpcUrlNova, wrapperRelayerAddress
} from "../Constant/constants";
import RaffleContract from "./interact";
import axios from "axios";
import {ethers} from "ethers";
import {wrapperRelayerAbi} from "./wrapperRelayerAbi";
import {getWalletClient} from "@wagmi/core"
import {providers} from "ethers"

export const parseImageURI = (ipfsUri) => {
    const ipfsMatch = ipfsUri.match(/ipfs\/(.*)/);
    return ipfsMatch ? (ipfsGateway + ipfsMatch[1]) : (ipfsUri);
};

export const parseRaffleId = (id) => {
    const idStr = id.toString();
    if (idStr.length >= 3) return idStr;
    return "0".repeat(3 - idStr.length) + idStr;
};

export const parseName = (name, metadata) => {
    if (!name) return parseCollectionName(metadata.collection);
    if (name.length <= 20) return name;
    return name.slice(0, 17) + "...";
}

export const parseCollectionName = (name) => {
    const words = name.split(/[-_]/);
    const capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
    return capitalizedWords.join(" ");
}

export const parseAddress = (address) => {
    if (address === null || address === undefined) return "N/A";
    if (address?.length <= 18) return address;
    return address.toString().slice(0, 6) + "..." + address.toString().slice(-4);
};

export const getDuration = (date) => {
    const now = new Date();
    const endDate = new Date(date);
    const diff = endDate - now;
    const days = Math.floor(diff / 1000 / 60 / 60 / 24);
    if (diff < 0) return "Closing...";
    else if (days === 0) return "Ending Today";
    return days + ` Day${days > 1 ? 's' : ''} Left`;
};

export const getEndDuration = (date) => {
    const now = new Date();
    const endDate = new Date(date);
    const diff = endDate - now;
    const days = Math.floor(diff / 1000 / 60 / 60 / 24);
    if (diff > 0) return days + " Days Left";
    else if (days === 0) return "Ended Today";
    return days * -1 + ` Day${days*-1 > 1 ? 's' : ''} ago`;
};

export const getTicketCount = async (raffleId) => {
    const contract = new RaffleContract();
    return await contract.getTotalEntries(raffleId);
};

export const getUserNameFromAddress = async (address, getAll = false) => {
    const {data} = await axios.get(`https://api.opensea.io/v2/accounts/${address}`, {
        headers: { "X-API-KEY": openSeaAPIKey },
    });
    console.log("opensea /user: ", data);
    return data.username ? getAll ? data : data.username : address;
}

export const getEtherPrice = async () => {
    const config = { headers: { "x-api-key": liveCoinWatchAPIKey } };
    const {data} = await axios.post("https://api.livecoinwatch.com/coins/single", { "currency": "USD", "code": "ETH", "meta":true}, config);
    console.log("read price _bridge", data);
    return data.rate;
}

export const getWrappedNFTs = async (address) => {
    const wrapperDeployer = "0xfdE6138988A34Db10D8A4116D89996EA76d2d42e";
    const uri = `https://api-nova.arbiscan.io/api?module=account&action=tokennfttx&address=${address.toLowerCase()}&startblock=0&sort=asc&apikey=${arbiscanAPI}`
    const {data} = await axios.get(uri);
    const events = data.result;

    const isTransferred = (tokenId) => {
        for (const event of events)
            if (parseInt(event.tokenID) === parseInt(tokenId) && event.from.toLowerCase() === address.toLowerCase())
                return true;
        return false;
    };

    const filteredNFTs = events
        .filter(event => event.to.toLowerCase() === address.toLowerCase())
        .filter(event => event.from.toLowerCase() === raffleContractAddress.toLowerCase() || event.from.toLowerCase() === wrapperDeployer.toLowerCase())
        .filter(event => !isTransferred(parseInt(event.tokenID)))

    const wrappedAddresses = filteredNFTs.map(event => event.contractAddress);
    const provider = new ethers.providers.JsonRpcProvider(rpcUrlNova);
    const wrapperRelayer = new ethers.Contract(wrapperRelayerAddress, wrapperRelayerAbi, provider);
    const l1Collections = await wrapperRelayer.getL1Addresses(wrappedAddresses);
    const deployerAddresses = await wrapperRelayer.getOwnerAddresses(wrappedAddresses);
    let foundWrappedTokens = [];
    for (let i = 0; i < filteredNFTs.length; i++)
        foundWrappedTokens.push({
            wrappedAddress: filteredNFTs[i].contractAddress,
            l1Address: l1Collections[i],
            deployer: deployerAddresses[i],
            tokenId: parseInt(filteredNFTs[i].tokenID),
            meta: await fetchMetadata(l1Collections[i], filteredNFTs[i].tokenID)
        });
    console.log("foundWrappedTokens _unwrap: ", foundWrappedTokens);
    return foundWrappedTokens;
}

export const fetchMetadata = async (contractAddress, tokenId) => {
    let response;
    try {
        const {data} = await axios.get(`https://eth-mainnet.g.alchemy.com/nft/v3/${alchemyAPIKey}/getNFTMetadata?contractAddress=${contractAddress}&tokenId=${tokenId}&refreshCache=false`);
        response = data;
    } catch (err) {
        console.error("Couldn't find the NFT ", err);
        response = {
            nft: {
                identifier: "0000",
                collection: "Place Holder NFT",
                contract: "0x0000000000000000000000000000000000000000",
                token_standard: "erc721",
                name: "NFT #0000",
                description: "Description...",
                image_url: "https://picsum.photos/2/2",
                metadata_url: "",
                opensea_url: "https://opensea.io",
                updated_at: "",
                is_disabled: false,
                is_nsfw: false,
                animation_url: null,
                is_suspicious: false,
                creator: null,
                traits: [],
                owners: [],
                rarity: {}
            }
        };
    }

    return response;
}