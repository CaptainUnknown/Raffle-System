import express from "express";
import { getRequiredEnvVar, setDefaultEnvVar } from "./envHelpers";
import {
  addAlchemyContextToRequest, AlchemyRequest,
  AlchemyWebhookEvent, isValidSignatureForAlchemyRequest
} from "./webhooksUtil";
import { Alchemy, Network, WebhookType } from "alchemy-sdk";
import ngrok from '@ngrok/ngrok';
import { ethers } from "ethers";
import Erc721Abi from "./abis/erc721Abi.json";
import HoldersLoggerABI from "./abis/holdersLoggerAbi.json";
import DoopAbi from "./abis/doopAbi.json";

async function main(): Promise<void> {
  setDefaultEnvVar("PORT", "8080");
  setDefaultEnvVar("HOST", "127.0.0.1");
  setDefaultEnvVar("RPC_URL", "");
  setDefaultEnvVar("PRIVATE_KEY", "");
  setDefaultEnvVar("EA_ADDRESS", ""); // TODO: Logger
  setDefaultEnvVar("WD_ADDRESS", "");
  setDefaultEnvVar("QKS_ADDRESS", "");
  setDefaultEnvVar("MRZ_ADDRESS", "");
  setDefaultEnvVar("CB_ADDRESS", ""); // On Polygon
  setDefaultEnvVar("POLYGON_HOOK_KEY", "");
  setDefaultEnvVar("LOGGER_ADDRESS", "");
  setDefaultEnvVar("DOOP_MAINNET", "");
  setDefaultEnvVar("DOOP_BRIDGE", "");
  setDefaultEnvVar("DOOP_L2", "");
  setDefaultEnvVar("ALCHEMY_AUTH", "")
  setDefaultEnvVar("NGROK_AUTH", "");
  setDefaultEnvVar("NGROK_DOMAIN", "");

  const port = +getRequiredEnvVar("PORT");
  const host = getRequiredEnvVar("HOST");
  const rpcUrl = getRequiredEnvVar("RPC_URL");
  const walletPK = getRequiredEnvVar("PRIVATE_KEY");
  const EAContractAddress = getRequiredEnvVar("EA_ADDRESS");
  const WDContractAddress = getRequiredEnvVar("WD_ADDRESS");
  const QuirkiesAddress = getRequiredEnvVar("QKS_ADDRESS");
  const MetaRebelzAddress = getRequiredEnvVar("MRZ_ADDRESS");
  const cannabuddiesAddress = getRequiredEnvVar("CB_ADDRESS");
  const polygonHookKey = getRequiredEnvVar("POLYGON_HOOK_KEY");
  const loggerAddress = getRequiredEnvVar("LOGGER_ADDRESS");
  const doopMainnetAddress = getRequiredEnvVar("DOOP_MAINNET");
  const doopBridgeAddress = getRequiredEnvVar("DOOP_BRIDGE");
  const doopContractAddress = getRequiredEnvVar("DOOP_L2");
  const alchemyAuthToken = getRequiredEnvVar("ALCHEMY_AUTH");
  const ngrokAuthToken = getRequiredEnvVar("NGROK_AUTH");
  const ngrokDomain = getRequiredEnvVar("NGROK_DOMAIN");

  console.log(` Environment Configuration `);

  console.log(`\u203A Server Configuration`);
  console.log(`- Port: ${port}`);
  console.log(`- Host: ${host}`);

  console.log(`\u203A Blockchain Node Configuration`);
  console.log(`- RPC URL: ${rpcUrl}`);

  console.log(`\u203A Wallet Configuration`);
  console.log(`- Private Key: ${walletPK}`);

  console.log(`\u203A Contract Addresses`);
  console.log(`- EA Contract Address: ${EAContractAddress}`);
  console.log(`- WD Contract Address: ${WDContractAddress}`);
  console.log(`- QKS Contract Address: ${QuirkiesAddress}`);
  console.log(`- MRZ Contract Address: ${MetaRebelzAddress}`);
  console.log(`- CB Contract Address: ${cannabuddiesAddress}`);
  console.log(`- Logger Address: ${loggerAddress}`);
  console.log(`- DOOP Mainnet Address: ${doopMainnetAddress}`);
  console.log(`- DOOP Bridge Address: ${doopBridgeAddress}`);
  console.log(`- DOOP L2 Contract Address: ${doopContractAddress}`);

  console.log(`\u203A External Service Configuration`);
  console.log(`- Alchemy Authentication Token: ${alchemyAuthToken}`);
  console.log(`- Ngrok Authentication Token: ${ngrokAuthToken}`);
  console.log(`- Ngrok Domain: ${ngrokDomain}`);

  const alchemyProvider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const signer = new ethers.Wallet(walletPK, alchemyProvider);
  const loggerContract = new ethers.Contract(loggerAddress, HoldersLoggerABI, signer);
  const doopContract = new ethers.Contract(doopContractAddress, DoopAbi, signer);

  // ==> FOR ETH_MAINNET
  const settings = {
    authToken: alchemyAuthToken,
    network: Network.ETH_MAINNET,
  };
  const alchemy = new Alchemy(settings);
  const ethNftActivityWebhook = await alchemy.notify.createWebhook(
      ngrokDomain + "/transfers",
      WebhookType.NFT_ACTIVITY,
      {
        filters: [
          { contractAddress: EAContractAddress },
          { contractAddress: WDContractAddress },
          { contractAddress: QuirkiesAddress },
          { contractAddress: MetaRebelzAddress },
        ],
        network: Network.ETH_MAINNET,
      }
  );
  const addressActivityWebhook = await alchemy.notify.createWebhook(
      ngrokDomain + "/doop-bridge",
      WebhookType.ADDRESS_ACTIVITY,
      {
        addresses: [doopBridgeAddress],
        network: Network.ETH_MAINNET,
      }
  );

  const signingKeyEthNFT = parseWebhookResponse(ethNftActivityWebhook, "signingKey");
  const signingKeyAddress = parseWebhookResponse(addressActivityWebhook, "signingKey");

  // === WEBHOOK SERVER ===
  const app = express();

  // Middleware needed to validate the alchemy signature
  app.use(express.json({ verify: addAlchemyContextToRequest }));

  // == HOLDERS LOGGER ==
  app.post("/transfers", async (req, res) => {
    if (!isValidSignatureForAlchemyRequest(req as AlchemyRequest, signingKeyEthNFT) || !isValidSignatureForAlchemyRequest(req as AlchemyRequest, polygonHookKey)) {
      const errMessage = "Signature validation failed, unauthorized!";
      res.status(403).send(errMessage);
      return;
    }
    const webhookEvent = req.body as AlchemyWebhookEvent;
    if (webhookEvent.event.activity === undefined) {
      res.status(400).send("Invalid Request!");
      return;
    }
    const activity = webhookEvent.event.activity[0];
    const collection = activity.contractAddress;
    const from = activity.fromAddress;
    const to = activity.toAddress;
    console.log(`WD from: ${from}, to: ${to}, collection: ${collection}`);

    const updateEligibility = async (address: string) => {
      const erc721Contract = new ethers.Contract(address, Erc721Abi, signer);
      const isNewQualifier = (await erc721Contract.balanceOf(to)).toNumber() === 1;
      if (!isNewQualifier) return;
      const swapOrNew = from?.toLowerCase() === "0x0000000000000000000000000000000000000000" || (await erc721Contract.balanceOf(from)).toNumber() > 1;
      if (address?.toLowerCase() === EAContractAddress?.toLowerCase()) {
        if (swapOrNew) {
          try {
            const tx = await loggerContract.updateQualifierThreeX(true, to);
            await tx.wait();
            console.log("Response Processed & TX Dispatched!");
          } catch (err) {
            console.log("Failed to Update Qualification", JSON.stringify(err, null, 2));
          }
          console.log("Qualification Updated");
          console.log("New Qualifier ThreeX: ", to);
        } else {
          try {
            const tx = await loggerContract.swapQualifierThreeX(from, to);
            await tx.wait();
            console.log("Response Processed & TX Dispatched!");
          } catch (err) {
            console.log("Failed to Update Qualification", JSON.stringify(err, null, 2));
          }
          console.log("Qualification Swapped");
          console.log("Old Qualifier ThreeX: ", from);
          console.log("New Qualifier ThreeX: ", to);
        }
      } else {
        if (swapOrNew) {
          try {
            const tx = await loggerContract.updateQualifierTwoX(true, to);
            await tx.wait();
            console.log("Response Processed & TX Dispatched!");
          } catch (err) {
            console.log("Failed to Update Qualification", JSON.stringify(err, null, 2));
          }
          console.log("Qualification Updated");
          console.log("New Qualifier TwoX: ", to);
        } else {
          try {
            const tx = await loggerContract.swapQualifierTwoX(from, to);
            await tx.wait();
            console.log("Response Processed & TX Dispatched!");
          } catch (err) {
            console.log("Failed to Update Qualification", JSON.stringify(err, null, 2));
          }
          console.log("Qualification Swapped");
          console.log("Old Qualifier TwoX: ", from);
          console.log("New Qualifier TwoX: ", to);
        }
      }
    }

    res.status(200).send("Response Processed & Dispatching TX!");
    await updateEligibility(collection);
    console.log("Transfer Processed!");
  });

  // == DOOP BRIDGE ==
  app.post("/doop-bridge", async (req, res) => {
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
    const activity = webhookEvent.event.activity[0];
    const contract = activity.rawContract.address;
    const from = activity.fromAddress;
    const to = activity.toAddress;
    const amount = activity.value;
    console.log(`Contract: ${contract}, from: ${from}, to: ${to}, amount: ${amount}!`);
    if (contract?.toLowerCase() !== doopMainnetAddress?.toLowerCase() || to?.toLowerCase() !== doopBridgeAddress?.toLowerCase()) {
      console.log("Response Processed!");
      res.status(200).send("Response Processed!");
      return;
    } else {
      try {
        console.log(`Bridge Request: ${amount} DOOP`);
        res.status(200).send("Response Processed & Dispatching DOOP!");
        const tx = await doopContract.mint(from, ethers.utils.parseEther(amount.toString()));
        await tx.wait();
        console.log("Response Processed & DOOP Dispatched!");
      } catch (err) {
        console.log("Failed to dispatch DOOP", JSON.stringify(err, null, 2));
      }
    }
  });

  // == LISTENER ==
  app.listen(port, host, async () => {
    console.log(`WhoopsiesHoldersLogger listening at ${host}:${port}`);
    const ngrokUrl = await ngrok.connect({
      addr: port,
      authtoken: ngrokAuthToken,
      domain: ''
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