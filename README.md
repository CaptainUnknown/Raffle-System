<img src="https://i.imgur.com/2cfS300.png" alt="Raffle Cards" style="width:600px;"/>

# Whoodoop Labs Raffle Site 🎟️

This repository contains the source code for an ERC721 raffle system website built using ReactJS. The system allows users to participate in raffles using either ERC20 Tokens or Eth.

Whoopsie Doopsies is a collection with a total volume of over 800 ETH. As part of their 2023 Roadmap, they planned to develop a Raffle System similar to the one that Metawin.com has been dominating with, in the space for years. My task was to develop a system that automates the management of raffles while minimizing network costs and providing the same level of utility as the competitor.

Metawin.com utilizes on-chain random number generation through ChainLink Upkeep, which incurs significant network fees and increases operational costs per raffle. However, the Smart Contract for this site actually uses an off-chain random number provided upon invocation.

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
<img src="https://i.imgur.com/TMT1sMe.png" alt=""/>
<img src="https://i.imgur.com/5sbSpMV.png" alt=""/>
<img src="https://i.imgur.com/9B7El7b.png" alt="" style="width:424px;"/>
<img src="https://i.imgur.com/dc6UxsW.png" alt="" style="width:424px;"/>
<img src="https://i.imgur.com/F1JNUDl.png" alt="" style="width:424px;"/>
