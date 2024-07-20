import express from "express";
import { getRequiredEnvVar, setDefaultEnvVar } from "./envHelpers";
import {
  addAlchemyContextToRequest,
  AlchemyWebhookEvent, isValidSignatureForAlchemyRequest, AlchemyRequest,
} from "./webhooksUtil";
import { Alchemy, Network, WebhookType } from "alchemy-sdk";
import ngrok from '@ngrok/ngrok';
import { ethers } from "ethers";
import Erc721Abi from "./abis/erc721Abi.json";
import wrapperAbi from "./abis/wrapperAbi.json";

async function main(): Promise<void> {
  setDefaultEnvVar("PORT", "8081");
  setDefaultEnvVar("HOST", "127.0.0.1");
  setDefaultEnvVar("RPC_URL_NOVA_WSS", "");
  setDefaultEnvVar("RPC_URL_ETH", "");
  setDefaultEnvVar("PRIVATE_KEY", "");
  setDefaultEnvVar("NFT_BRIDGE_ADDRESS_L2", "");
  setDefaultEnvVar("NFT_BRIDGE_ADDRESS_DEPLOYER", "");
  setDefaultEnvVar("NFT_BRIDGE_ADDRESS_RECEIVER", "");
  setDefaultEnvVar("NFT_BRIDGE_ADDRESS_RECEIVER_PK", "");
  setDefaultEnvVar("ALCHEMY_AUTH", "")
  setDefaultEnvVar("NGROK_AUTH", "");
  setDefaultEnvVar("NGROK_DOMAIN", "");

  const port = +getRequiredEnvVar("PORT");
  const host = getRequiredEnvVar("HOST");
  const rpcWss = getRequiredEnvVar("RPC_URL_NOVA_WSS");
  const rpcUrlEth = getRequiredEnvVar("RPC_URL_ETH");
  const walletPK = getRequiredEnvVar("PRIVATE_KEY");
  const receiverWalletPK = getRequiredEnvVar("NFT_BRIDGE_ADDRESS_RECEIVER_PK");
  const wrapperAddress_L2 = getRequiredEnvVar("NFT_BRIDGE_ADDRESS_L2");
  const wrapperDeployer = getRequiredEnvVar("NFT_BRIDGE_ADDRESS_DEPLOYER");
  const nftBridgeAddress_Receiver = getRequiredEnvVar("NFT_BRIDGE_ADDRESS_RECEIVER");
  const alchemyAuthToken = getRequiredEnvVar("ALCHEMY_AUTH");
  const ngrokAuthToken = getRequiredEnvVar("NGROK_AUTH");
  const ngrokDomain = getRequiredEnvVar("NGROK_DOMAIN");

  console.log(` Environment Configuration `);

  console.log(`\u203A Server Configuration`);
  console.log(`- Port: ${port}`);
  console.log(`- Host: ${host}`);

  console.log(`\u203A Blockchain Node Configuration`);
  console.log(`- NOVA RPC URL: ${rpcWss}`);
  console.log(`- ETH RPC URL: ${rpcUrlEth}`);

  console.log(`\u203A Wallet Configuration`);
  console.log(`- Private Key Nova: ${walletPK}`);
  console.log(`- Private Key Wrapper Receiver: ${receiverWalletPK}`);

  console.log(`\u203A Contract Addresses`);
  console.log(`- Bridge Address: ${wrapperAddress_L2}`);
  console.log(`- Bridge Receiver: ${nftBridgeAddress_Receiver}`);
  console.log(`- Bridge Deployer: ${wrapperDeployer}`);

  console.log(`\u203A External Service Configuration`);
  console.log(`- Alchemy Authentication Token: ${alchemyAuthToken}`);
  console.log(`- Ngrok Authentication Token: ${ngrokAuthToken}`);
  console.log(`- Ngrok Domain: ${ngrokDomain}`);

  const novaProvider = new ethers.providers.WebSocketProvider(rpcWss);
  const ethProvider = new ethers.providers.JsonRpcProvider(rpcUrlEth);
  const novaSigner = new ethers.Wallet(walletPK, novaProvider);
  const ethSigner = new ethers.Wallet(receiverWalletPK, ethProvider);
  const wrapperContract = new ethers.Contract(wrapperAddress_L2, wrapperAbi, novaSigner);

  const settings = {
    authToken: alchemyAuthToken,
    network: Network.ETH_MAINNET,
  };
  const alchemy = new Alchemy(settings);
  const receiverActivityWebhook = await alchemy.notify.createWebhook(
      ngrokDomain + "/nft-l1-to-l2",
      WebhookType.ADDRESS_ACTIVITY,
      {
        addresses: [nftBridgeAddress_Receiver],
        network: Network.ETH_MAINNET,
      }
  );

  const signingKeyAddress = parseWebhookResponse(receiverActivityWebhook, "signingKey");

  // === WEBHOOK SERVER ===
  const app = express();

  // Middleware needed to validate the alchemy signature
  app.use(express.json({ verify: addAlchemyContextToRequest }));

  // == NFT BRIDGE ==
  app.post("/nft-l1-to-l2", async (req, res) => {
    if (!isValidSignatureForAlchemyRequest(req as AlchemyRequest, signingKeyAddress)) {
      const errMessage = "Signature validation failed, unauthorized!";
      res.status(403).send(errMessage);
      return;
    }
    const webhookEvent = req.body as AlchemyWebhookEvent;
    if (webhookEvent.event.activity[0] === undefined) {
      res.status(400).send("Invalid Request!");
      return;
    }

    try {
      res.status(200).send("Processing the Response...");
      const activity = webhookEvent.event.activity[0];
      if (activity.category === 'token' && activity.erc721TokenId !== undefined) {
        const contract = activity.rawContract.address;
        const from = activity.fromAddress;
        const tokenId = Number(activity.erc721TokenId);
        console.log(`=> Wrap Request\nContract: ${contract}, From: ${from}, Token ID: ${tokenId}`);

        const requestedCollection = new ethers.Contract(contract, Erc721Abi, novaSigner);
        const tokenUri = await requestedCollection.tokenURI(ethers.BigNumber.from(tokenId));
        const tx = await wrapperContract.wrapNFT(contract, ethers.BigNumber.from(tokenId.toString()), tokenUri);
        await tx.wait();
        console.log(`${contract}'s token Id ${tokenId} WRAPPED successfully.`);
      }
    } catch (error) {
      console.log("Wrap Failed: ", JSON.stringify(error, null, 2));
    }
  });

  // == LISTENER ==
  const filter = {
    address: wrapperAddress_L2,
    topics: [ethers.utils.id("NFTUnwrapped(address,address,uint256)")]
  }
  novaProvider.on(filter, async (log) => {
    const decodedData = ethers.utils.defaultAbiCoder.decode(['address', 'address', 'uint256'], log.data);
    const txReceipt = await novaProvider.getTransaction(log.transactionHash);
    const l1Address = decodedData[0];
    const sender = txReceipt.from;
    const tokenId = decodedData[2];
    console.log(`=> Unwrap Request\nL1Address: ${l1Address}, From: ${sender}, Token ID: ${tokenId}`);
    console.log('Event Log:', JSON.stringify(log, null, 4));

    try {
      await txReceipt.wait(25);
      const requestedCollection = new ethers.Contract(l1Address, Erc721Abi, ethSigner);
      const transfer = await requestedCollection.transferFrom(nftBridgeAddress_Receiver, sender, tokenId);
      await transfer.wait();

      const gasFees = await ethProvider.getGasPrice();
      const setFees = await wrapperContract.setUnwrapFees(ethers.BigNumber.from(Number(gasFees) * (84904 + 21000 + 8500))); // ERC721 Transfer + Eth Transfer + (Priority + Misc)
      await setFees.wait();
      console.log(`${l1Address}'s token Id ${Number(tokenId)} UNWRAPPED successfully by ${sender}, Fee Set to ${ethers.utils.parseEther((Number(gasFees) * 84904).toString())} Eth.`);
    } catch (error) {
      console.log(`Unwrap Failed ${error.code || 'UNKNOWN_ERR'}: `, JSON.stringify(error, null, 2));
    }
  });
  app.listen(port, host, async () => {
    console.log(`NFT Wrapper listening at ${host}:${port}`);
    const ngrokUrl = await ngrok.connect({
      addr: port,
      authtoken: ngrokAuthToken,
      domain: '',
    });
    console.log(`Webhook exposed at: ${ngrokUrl.url()}`);
  });
}
main();

// === UTILITIES ===
function parseWebhookResponse(response:string, key:string) {
  const params = new URLSearchParams(response);
  return params.get(key);
}