import React from "react";
import { useConnect } from "wagmi";
import { fetchSigner, getProvider } from "@wagmi/core";

import styles from "./styles.module.scss";
import metaMask from "../../assets/metamask.png";
import walletConnect from "../../assets/walletConnect.png";
import coinbase from "../../assets/coinBase.png";

export default function LoginModal({ setOpenModal, holder, onConnect }) {
  const { connect, connectors, error, isLoading } = useConnect();

  const handleConnect = async (connector) => {
    await connect(connector);
    const signer = await fetchSigner();
    const provider = await getProvider();
    onConnect(provider, signer);
    setOpenModal(false);
  };

  return (
    <div className={styles.modalContainer}>
      <div onClick={() => setOpenModal(false)} className={styles.modalBG} />
      {!holder && (
        <div className={styles.errorMessageContainer}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path d="M16.143 2l5.857 5.858v8.284l-5.857 5.858h-8.286l-5.857-5.858v-8.284l5.857-5.858h8.286zm.828-2h-9.942l-7.029 7.029v9.941l7.029 7.03h9.941l7.03-7.029v-9.942l-7.029-7.029zm-6.471 6h3l-1 8h-1l-1-8zm1.5 12.25c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25z" />
          </svg>
          You must be signed in and hold at least One Whoop Doop to use this
          tool.
        </div>
      )}
      {error && (
        <div className={styles.errorMessageContainer}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path d="M16.143 2l5.857 5.858v8.284l-5.857 5.858h-8.286l-5.857-5.858v-8.284l5.857-5.858h8.286zm.828-2h-9.942l-7.029 7.029v9.941l7.029 7.03h9.941l7.03-7.029v-9.942l-7.029-7.029zm-6.471 6h3l-1 8h-1l-1-8zm1.5 12.25c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25z" />
          </svg>
          {error.message}
        </div>
      )}
      <div className={styles.modal}>
        {connectors.map((connector) => (
          <button
            className={styles.connectButton}
            disabled={!error && isLoading}
            key={connector.id}
            onClick={() => handleConnect({ connector })}
          >
            {connector.id === "metaMask" && (
              <img src={metaMask} alt="metmask" />
            )}
            {connector.id === "walletConnect" && (
              <img src={walletConnect} alt="walletconnect" />
            )}
            {connector.id === "coinbaseWallet" && (
              <img src={coinbase} alt="coinbase" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
