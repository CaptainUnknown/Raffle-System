import React, { useState, useEffect } from "react";
import "./RaffleAllowance.scss";
import { toast } from "react-toastify";
import { useContractWrite, useContractRead, useAccount, useBalance } from "wagmi";
import { doopAbi } from "../../context/doopAbi";
import { raffleContractAddress, doopContractAddress } from "../../Constant/constants";
import { ethers } from "ethers";
import { ReactComponent as Plus } from "../../assets/icons/plus.svg";
import { ReactComponent as Ether } from "../../assets/icons/ethereum.svg";
import { ReactComponent as Cross } from "../../assets/icons/cross.svg";

function RaffleAllowance() {
  const { address, isConnecting, isDisconnected } = useAccount();
  const [allowance, setAllowance] = useState(0);
  const [doopBalance, setDoopBalance] = useState(null);
  const [ethBalance, setEthBalance] = useState(null);
  const [requestedAllowance, setRequestedAllowance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [overlayVisibility, setOverlayVisibility] = useState(false);

  // Allowance
  useContractRead({
    addressOrName: doopContractAddress,
    contractInterface: doopAbi,
    functionName: 'allowance',
    args: [address, raffleContractAddress],
    onError(error) {
        console.log('allowance error _allowance: ', error);
    },
    onSuccess(data) {
      console.log('doop allowance _allowance: ', data);
      setAllowance(Number(data.toBigInt() / 1000000000000000000n));
      },
  });

  // Doop Balance
  useContractRead({
    addressOrName: doopContractAddress,
    contractInterface: doopAbi,
    functionName: 'balanceOf',
    args: [address],
    onError(error) {
        console.log('doop balance error _allowance: ', error);
    },
    onSuccess(data) {
      console.log('doop balance _allowance: ', Number(data.toBigInt() / 1000000000000000000n));
      setDoopBalance(Number(data.toBigInt() / 1000000000000000000n).toFixed(0));
    },
  });

  // Eth Balance
  const balance = useBalance({
    addressOrName: address,
    onError(error) {
        console.error('eth balance error _useBalance _allowance: ', error);
    },
    onSuccess(data) {
      console.log('eth _useBalance _allowance: ', data);
      setEthBalance(parseFloat(data.formatted).toFixed(4));
    }
  });

  useEffect(() => {
    if (allowance === null || doopBalance === null || ethBalance === null) return;
    setIsLoading(false);
  }, [allowance, doopBalance, ethBalance, balance]);

  // Allow Doop
  const {data: allowDoopResponse, isLoading: allowDoopLoading, write: allowDoop } = useContractWrite({
    mode: "recklesslyUnprepared",
    addressOrName: doopContractAddress,
    contractInterface: doopAbi,
    functionName: "approve",
    args: [raffleContractAddress, ethers.utils.parseEther(requestedAllowance.toString())],
    onSuccess(data) {
      console.log('allow doop success _allowance: ', data);
    },
    onError(error) {
      toast.error(error.reason.replace(/execution reverted: /g, ""));
    },
  });

  useEffect(() => {
    if (allowDoopResponse && !allowDoopLoading) {
      toast.success(`Successfully allowed ${requestedAllowance} DOOP`);
      setAllowance(allowance + requestedAllowance);
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
          <h1>Enter an amount to allow: </h1>
          <div className="inputBox">
            <input type="number"
                   onChange={(e) => {setRequestedAllowance(e.target.value)}}
                   value={requestedAllowance}
            />
          </div>
          <div className="info">
            <h2>Available: <span>{doopBalance}</span> Doop</h2>
            <a onClick={() => { setRequestedAllowance(doopBalance) }}>Max</a>
          </div>
          <button onClick={() => { allowDoop() }}>Allow</button>
        </div>
      </>)}

      { ((!isConnecting && address) && !isLoading) && (<>
        <div className="allowance">

          <div className="balance">{ethBalance} <Ether /></div>
          <div className="balance"
               style={{ marginBottom: '0' }}
          >{doopBalance} <span> Doop</span></div>
          <div className="allow">
            <h2>Allowance: <span>{allowance}</span></h2>
            <Plus onClick={() => {setOverlayVisibility(true)}} />
          </div>
        </div>
      </>)}
    </>
  );
}

export default RaffleAllowance;
