<img src="https://i.imgur.com/2cfS300.png" alt="Raffle Cards" style="width:600px;"/>

# A Cross Chain Raffle System 🎟️

👉 ([Read the complete case study of this project here!](https://shehrozk.vercel.app/raffle-case-study))

This repository contains the source code for an ERC721 raffle system website built using ReactJS. The system allows users to participate in raffles using either ERC20 Tokens or Eth. This site & all the supporting systems facilitated over 100k ticket purchases while reducing the costs by more than 15x.

<br/>
<img src="https://shehrozk.vercel.app/map.svg" style="width: 60%; height: 60%;" alt="Overall system architecture."/>
<br/>

## Components Breakdown 🟢

### Raffle Service:
This service consists of the site pages & components, discord bot & raffle contracts. Discord bot is responsible for managing the raffles as an admin and directly interacts with the raffle contract. The Raffle Contract has a user exposed function to participate & read current state, on which the site functionality relies on. A complete break down of the Raffle Contract can be found [here](https://github.com/CaptainUnknown/Raffle-Smart-Contract.git)! 👈

### Wrapper/Unwrapper Service:
This service consists of the alchemy webhooks (logging qualifying collections NFT transfer), holdersLogger contracts & an Express server. This service keeps a log of discount qualifying wallets on L2 (Nova) on the basis of their holdings on the mainnet.

### Bridging Service:
This service consists of the alchemy webhooks (logging erc20 transfers), erc20 contracts on L2 (Nova) & an Express server. This service makes the bridging of erc20 tokens from the mainnet to the L2 (Nova) possible. This approach is kept simple by using off chain triggers in order to lower operational & user side costs.

<br/>

## Installation ⚙️

To run the DApp locally, follow these steps:

1. Deploy the [Smart Contracts](https://github.com/CaptainUnknown/Raffle-Smart-Contract.git) on your preferred network.
2. Clone the repository:
```
git clone https://github.com/CaptainUnknown/Whoopdoop-Labs.git
```
3. Copy the address of your deployed contracts and add it to the constants file, along with any other required information:
```
cd Whoopdoop-Labs
nano src/Constant/constants.js
``` 
4. Install the dependencies:
```
npm install
```
5. Serve the DApp using the following command:
```
npm run start
```
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Screenshots 🖼️
<img src="https://i.imgur.com/TMT1sMe.png" alt="Raffle info page for stats & interaction options."/>
<img src="https://i.imgur.com/5sbSpMV.png" alt="Connect wallet widget."/>
<img src="https://i.imgur.com/9B7El7b.png" alt="Raffle in an ongoing state with 1250 entries & 2 days left." style="width:424px;"/>
<img src="https://i.imgur.com/dc6UxsW.png" alt="Raffle in an ongoing state with 972 entries & 3 days left." style="width:424px;"/>
<img src="https://i.imgur.com/F1JNUDl.png" alt="Raffle in an ended state with winner as squiggy.eth." style="width:424px;"/>
<img src="https://i.imgur.com/JUSuMZW.png" alt="Unwrap widget to bridge NFTs to the mainnet."/>
<img src="https://i.imgur.com/IKfg1Hf.png" alt="Asset bridging widget from Eth mainnet to Nova."/>
<img src="https://i.imgur.com/jIAIA1K.png" alt="ERC20 Claim Widget."/>
