import React from "react";
import { useAccount, useSwitchNetwork } from "wagmi";

import styles from "./styles.module.scss";

export default function ChainSwitch() {
  const { switchNetwork } = useSwitchNetwork({
    chainId: 1,
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
            chainId: "0x1",
            chainName: "Ethereum Mainnet",
            nativeCurrency: {
              name: "Ether",
              symbol: "ETH",
              decimals: 18,
            },
            rpcUrls: "https://mainnet.infura.io/v3/",
            blockExplorerUrls: "https://etherscan.io/",
          },
          account,
        ],
      });
    }
  };

  return (
    <div className={styles.chainSwitchContainer}>
      <h2>Wrong Chain Detected, Please Switch To ETH Mainnet</h2>
      <button
        onClick={() => switchNetwork()}
        className={styles.switchChainButton}
      >
        SWITCH NETWORK
      </button>
    </div>
  );
}
