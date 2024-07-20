import React from "react";
import { useAccount, useSwitchNetwork } from "wagmi";

import styles from "./styles.module.scss";
import {Link} from "react-router-dom";

export default function ChainSwitch() {
  const { switchNetwork } = useSwitchNetwork({
    chainId: 42170,
    onError(error) {
      addChain(error);
    },
  });
  const { account } = useAccount();

  const addChain = async (error) => {
    if (error.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0xA4B1",
            chainName: "Arbitrum Nova",
            nativeCurrency: {
              name: "Ether",
              symbol: "ETH",
              decimals: 18,
            },
            rpcUrls: ["https://rpc.ankr.com/arbitrumnova/c38c40685cd9b48ca9e5a8e52eee48103ef99e793c5e9442aff9fa569c8749a5", "https://nova.arbitrum.io/rpc/"],
            blockExplorerUrls: "https://nova.arbiscan.io/",
          },
          account,
        ],
      });
    }
  };

  return (
    <div className={styles.chainSwitchContainer}>
      <h2>Wrong Chain Detected, Please Switch To <span>Arbitrum Nova</span></h2>
      <p>For blazing fast & cheap transactions! We've moved some of the sites functionality to Arbitrum Nova.</p>
      <div className={styles.chainSwitchCTA}>
        <button
            onClick={() => switchNetwork()}
            className={styles.switchChainButton}
        >
          Switch to Nova
        </button>
        <Link to="/bridge" className={styles.chainSwitchBridgeAssets}>
          Bridge My Doop
        </Link>

      </div>
    </div>
  );
}
