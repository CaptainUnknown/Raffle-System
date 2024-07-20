import React from "react";
import ReactDOM from "react-dom/client";
import "./index.scss";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { infuraProvider } from "wagmi/providers/infura";
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import {arbitrumNova} from "./context/arbitrumNova"
import { alchemyProvider } from 'wagmi/providers/alchemy';

const RPC = {
    1: "",
    11155111: "",
    42170: ""
}

const { chains, publicClient } = configureChains(
    [mainnet, sepolia, arbitrumNova],
    [
        jsonRpcProvider({
            rpc: (chain) => {
                console.log(RPC[chain.id])
                return {
                    http: RPC[chain.id]
                }
            },
        }),
        alchemyProvider({ apiKey: "fWWp_qP8N18IXE2aT4rluwbnEJpSM-C6" }),
        infuraProvider({ apiKey: "bb73ce71883a4a29aa1cc77d1500e6e7" })
    ]
);

const { connectors } = getDefaultWallets({
    appName: 'My RainbowKit App',
    projectId: '8184ab0fb00ef4954ef085bbe5bae201',
    chains
});

const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    publicClient
})

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <WagmiConfig config={wagmiConfig}>
        <BrowserRouter>
            <RainbowKitProvider chains={chains} theme={darkTheme({accentColor: '#1D9BF0'})}>
                <App />
            </RainbowKitProvider>
        </BrowserRouter>
    </WagmiConfig>
);
