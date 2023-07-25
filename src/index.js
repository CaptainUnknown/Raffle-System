import React from "react";
import ReactDOM from "react-dom/client";
import "./index.scss";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { WagmiConfig, createClient, configureChains, chain } from "wagmi";
import { MoralisProvider } from "react-moralis";

import { alchemyProvider } from "wagmi/providers/alchemy";
import { infuraProvider } from "wagmi/providers/infura";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";

const serverUrl = process.env.REACT_APP_MORALIS_SERVER_URL;
const appId = process.env.REACT_APP_MORALIS_APP_ID;

const { chains, provider, webSocketProvider } = configureChains(
  [chain.mainnet, chain.goerli],
  [alchemyProvider({ apiKey: "fWWp_qP8N18IXE2aT4rluwbnEJpSM-C6" })],
  [infuraProvider({ apiKey: "bb73ce71883a4a29aa1cc77d1500e6e7" })]
);

const client = createClient({
  connectors: [
    new MetaMaskConnector({ chains }),
    new WalletConnectConnector({
      options: {
        chains,
        qrcode: true,
        rpc: {
          1: "https://mainnet.infura.io/v3/bb73ce71883a4a29aa1cc77d1500e6e7",
          5: "https://goerli.infura.io/v3/bb73ce71883a4a29aa1cc77d1500e6e7",
        },
      },
    }),
    new CoinbaseWalletConnector({
      options: {
        appName: "Whoop Doop",
        jsonRpcUrl:
          "https://eth-mainnet.g.alchemy.com/v2/fWWp_qP8N18IXE2aT4rluwbnEJpSM-C6",
      },
    }),
  ],
  autoConnect: true,
  chains,
  provider,
  webSocketProvider,
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <WagmiConfig client={client}>
    <BrowserRouter>
      <MoralisProvider
        initializeOnMount={true}
        appId={appId}
        serverUrl={serverUrl}
      >
        <App />
      </MoralisProvider>
    </BrowserRouter>
  </WagmiConfig>
);
