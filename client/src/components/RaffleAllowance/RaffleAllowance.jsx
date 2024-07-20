import React, { useState, useEffect } from "react";
import "./RaffleAllowance.scss";
import { toast } from "react-toastify";
import { useContractWrite, useContractRead, useAccount, useBalance } from "wagmi";
import { doopAbi } from "../../context/doopAbi";
import { doopContractAddress, doopL2ContractAddress, doopBridge } from "../../Constant/constants";
import { ethers } from "ethers";
import { ReactComponent as Plus } from "../../assets/icons/plus.svg";
import { ReactComponent as Ether } from "../../assets/icons/ethereum.svg";
import { ReactComponent as Cross } from "../../assets/icons/cross.svg";
import {doopL2Abi} from "../../context/doopL2Abi";
import {Link} from "react-router-dom";

function RaffleAllowance() {
  const { address, isConnecting, isDisconnected } = useAccount();
  const [bridged, setBridged] = useState(0);
  const [doopBalance, setDoopBalance] = useState(null);
  const [ethBalance, setEthBalance] = useState(null);
  const [requestedBridge, setRequestedBridge] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [overlayVisibility, setOverlayVisibility] = useState(false);

  // Doop Bridged
  useContractRead({
    address: doopL2ContractAddress,
    abi: doopL2Abi,
    functionName: 'balanceOf',
    args: [address],
    chainId: 42170,
    onError(error) {
        console.log('bridged error _allowance: ', error);
    },
    onSuccess(data) {
      console.log('doop bridged _allowance: ', data);
      setBridged((Number(data) / 10 ** 18).toFixed(0));
      },
  });

  // Doop Balance
  useContractRead({
    address: doopContractAddress,
    abi: doopAbi,
    functionName: 'balanceOf',
    args: [address],
    chainId: 1,
    onError(error) {
        console.log('doop balance error _allowance: ', error);
    },
    onSuccess(data) {
      console.log('doop balance _allowance: ', (Number(data) / 10 ** 18).toFixed(0));
      setDoopBalance((Number(data) / 10 ** 18).toFixed(0));
    },
  });

  // Eth Balance
  const balance = useBalance({
    address: address,
    chainId: 42170,
    onError(error) {
        console.error('eth balance error _useBalance _allowance: ', error);
    },
    onSuccess(data) {
      console.log('eth _useBalance _allowance: ', data);
      setEthBalance(parseFloat(data.formatted).toFixed(3));
    }
  });

  useEffect(() => {
    if (bridged === null || doopBalance === null || ethBalance === null || !isLoading) return;
    setIsLoading(false);
  }, [bridged, doopBalance, ethBalance, balance]);

  // Bridge Doop
  const {data: allowDoopResponse, isLoading: allowDoopLoading, write: allowDoop } = useContractWrite({
    mode: "recklesslyUnprepared",
    address: doopContractAddress,
    abi: doopAbi,
    functionName: "transfer",
    args: [doopBridge, ethers.utils.parseEther(requestedBridge ? requestedBridge.toString() : (0).toString())],
    chainId: 1,
    onSuccess(data) {
      console.log('allow doop success _allowance: ', data);
    },
    onError(error) {
      toast.error(error.reason.replace(/execution reverted: /g, ""));
    },
  });

  useEffect(() => {
    if (allowDoopResponse && !allowDoopLoading) {
      toast.success(`Successfully bridged ${requestedBridge} DOOP`);
      setBridged(bridged + requestedBridge);
    }
    // eslint-disable-next-line
  }, [allowDoopResponse, allowDoopLoading]);

  return (
    <>
      { overlayVisibility && (<>
        <div className="allowOverlay" onClick={() => {setOverlayVisibility(false)}}></div>
        <div className="allowOverlayContent">
          <Cross className="cross"
                 onClick={() => {setOverlayVisibility(false)}}
          />
          <h1>Enter an amount to bridge: </h1>
          <div className="inputBox" style={{ border: requestedBridge > doopBalance ? "solid 2px var(--red)" : "solid 2px var(--primary)" }}>
            <input
                type="number"
                onChange={(e) => {
                  const trimmedValue = e.target.value.trim(); // Remove leading/trailing whitespace
                  const newValue = !trimmedValue ? "" : parseFloat(trimmedValue);
                  setRequestedBridge(newValue);
                }}
                value={requestedBridge}
            />
          </div>
          <div className="info">
            <h2>Available: <span>{doopBalance}</span> Doop</h2>
            <a onClick={() => { setRequestedBridge(doopBalance) }}>Max</a>
          </div>
          <button onClick={() => {
            allowDoop()
          }}
                  style={{
                    cursor: requestedBridge > doopBalance ? 'not-allowed' : 'pointer',
                    background: requestedBridge > doopBalance ? 'var(--text-color-accent)' : 'var(--primary)'
          }}>Bridge to Nova</button>
        </div>
      </>)}

      { ((!isConnecting && address && !isDisconnected) && !isLoading) && (<>
        <div className="allowance">

          <div className="balance">
            <Link className="bridgeButton" to="/bridge">
              <Plus className="plus" onClick={() => {setOverlayVisibility(true)}} />
            </Link>
            {ethBalance} <Ether /></div>
          <div className="balance"
               style={{ marginBottom: '0' }}
          >{doopBalance} <span> Doop</span></div>
          <div className="allow">
            <h2>Bridged: <span>{bridged}</span> Doop</h2>
            <Link to="/bridge">
              <Plus onClick={() => {setOverlayVisibility(true)}} />
            </Link>
          </div>
        </div>
      </>)}
    </>
  );
}

export default RaffleAllowance;
