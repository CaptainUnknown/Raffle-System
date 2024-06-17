<img src="https://i.imgur.com/2cfS300.png" alt="Raffle Cards" style="width:600px;"/>

# A Cross Chain Raffle System 🎟️

This repository contains the source code for an ERC721 raffle system website built using ReactJS. The system allows users to participate in raffles using either ERC20 Tokens or Eth. This site & all the supported systems facilitated over 100k entry purchases.

Metawin.com utilizes on-chain random number generation through ChainLink Upkeep, which incurs significant network fees and increases operational costs per raffle. However, the Smart Contract for this site actually uses an off-chain random number provided upon invocation.

<br/>
<img src="https://shehrozk.vercel.app/map.svg" style="width: 60%; height: 60%;" alt="Overall system architecture."/>
<br/>

## Hosting ⚙️

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
