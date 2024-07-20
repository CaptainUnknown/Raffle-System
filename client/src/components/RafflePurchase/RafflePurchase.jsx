/* global BigInt */
import React, { useState, useEffect } from "react";
import "./RafflePurchase.scss";
import { toast } from "react-toastify";
import { ReactComponent as Ether } from "../../assets/icons/ethereum.svg";
import {useContractWrite, useContractRead, useAccount, useBalance } from "wagmi";
import {
  doopL2ContractAddress,
  raffleContractAddress,
  raffleRelayContractAddress
} from "../../Constant/constants";
import { ethers } from "ethers";
import RaffleLogin from "../../components/RaffleLogin/RaffleLogin";
import {relayABI} from "../../context/raffleRelayABI";
import {raffleAbiL2} from "../../context/raffleAbiL2";
import {doopL2Abi} from "../../context/doopL2Abi";
import { UsePermit } from "../../Hooks/usePermit";
import { useWalletClient } from "wagmi";
import {doopAbi} from "../../context/doopAbi";
import ConfettiExplosion from 'react-confetti-explosion';


function RafflePurchase({
  raffleId,
  price,
  doopPrice,
  isPurchasableWithDoop,
  switchModal,
  isModal,
  endtime,
}) {
  const { data: walletClient } = useWalletClient();
  const { address, isConnecting, isDisconnected } = useAccount();

  const [isLoading, setIsLoading] = useState(false);
  const [ticketCount, setTicketCount] = useState(0);
  const [isPurchaseRequested, setIsPurchaseRequested] = useState(false);
  const [userEntries, setUserEntries] = useState(0);
  const [entriesLoading, setEntriesLoading] = useState(true);
  const [currentNonce, setCurrentNonce] = useState();
  const [ethBalance, setEthBalance] = useState(0);
  const [doopBalance, setDoopBalance] = useState(0);
  const { signPermit } = UsePermit();

  /**
   * @dev Reads
   */
  // Current Entries
  useContractRead({
    address: raffleRelayContractAddress,
    abi: relayABI,
    functionName: 'getMyEntries',
    args: [raffleId],
    account: address,
    chainId: 42170,
    onSuccess(data) {
      console.log(data);
      setUserEntries(Number(data));
      setEntriesLoading(false);
      },
  });

  // Nonce
  useContractRead({
    address: doopL2ContractAddress,
    abi: doopL2Abi,
    functionName: 'nonces',
    args: [address],
    chainId: 42170,
    onSuccess(data) {
      console.log('Nonce ', Number(data));
      setCurrentNonce(Number(data));
    },
  });

  // Doop Balance
  useContractRead({
    address: doopL2ContractAddress,
    abi: doopAbi,
    functionName: 'balanceOf',
    args: [address],
    chainId: 42170,
    onError(error) {
      console.log('doop balance error _rafflePurchase: ', error);
    },
    onSuccess(data) {
      console.log('doop balance _rafflePurchase: ', (Number(data) / 10 ** 18).toFixed(0));
      setDoopBalance(Number(data) / 10 ** 18);
    },
  });

  // Balance
  useBalance({
    address: address,
    chainId: 42170,
    onError(error) {
      console.error('eth balance error _useBalance _rafflePurchase: ', error);
    },
    onSuccess(data) {
      console.log('eth _useBalance _rafflePurchase: ', data);
      setEthBalance(parseFloat(data.formatted));
    }
  });

  /**
   * @dev Writes
   */
  // Purchase
  const {data: purchaseResponse, isLoading: purchaseLoading, isError: purchaseError, write: purchase, isSuccess: purchaseSuccess } = useContractWrite({
    mode: "recklesslyUnprepared",
    address: raffleContractAddress,
    abi: raffleAbiL2,
    functionName: "buyTicket",
    chainId: 42170,
    from: address,
    onMutate() {
      if (!isPurchasableWithDoop && ethBalance < price * ticketCount) toast.error(`Not enough balance, requires ${price * ticketCount} ETH!`);
      if (isPurchasableWithDoop && doopBalance < doopPrice * ticketCount) toast.error(`Not enough balance, requires ${doopPrice * ticketCount} DOOP!`);
    }
  });

  // onError
  useEffect(() => {
    if (purchaseLoading || !isPurchaseRequested) return;
    toast.error("Request Failed!");
    setIsPurchaseRequested(false);
  }, [purchaseError])

  useEffect(() => {
    if (purchaseLoading) return;
    if (purchaseSuccess) {
      toast.success(`Successfully bought ${ticketCount} ticket${ ticketCount > 1 ? "s" : ""}!`);
      setUserEntries(userEntries + ticketCount);
    }
    // eslint-disable-next-line
  }, [ purchaseLoading ]);

  const writePurchase = async (count) => {
    const placeholderBytes32 = "0x0000000000000000000000000000000000000000000000000000000000000000";
    await setTicketCount(count);
    await setIsPurchaseRequested(true);
    let sig = { v: 0, r: placeholderBytes32, s: placeholderBytes32 };
    if (isPurchasableWithDoop) {
      sig = await signPermit?.(walletClient, {
        contractAddress: doopL2ContractAddress,
        erc20Name: "Doop",
        ownerAddress: address,
        spenderAddress: raffleContractAddress,
        value: Number(count * parseInt(doopPrice) * 10 ** 18),
        deadline: BigInt(endtime),
        nonce: currentNonce,
        chainId: 42_170,
        permitVersion: "1",
      });
      console.log("Permit Signature is: ", sig);
    }

    purchase?.({
      args: [raffleId, count, sig.v, sig.r, sig.s],
      value: isPurchasableWithDoop ? ethers.utils.parseEther((0).toString()) : ethers.utils.parseEther((price * count).toString()),
    });
  };

  const handleConnect = async (provider, signer) => {
    console.log("Connected", provider, signer);
  };

  const ticketOption = (count, showHoldersDiscount) => {
    return <>
      <div className={`${count >= 50 && "max"}`}>
        <h1> {count} </h1>
        <h2> {`Ticket${count > 1 ? "s" : ""}`} </h2>
        <button onClick={() => writePurchase(count)}>
          {!isPurchasableWithDoop ? <>
            <Ether />
            <span> {(price * count).toLocaleString('en-US', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 3 })}</span>
          </> : <> <span> {" "} {(doopPrice * count).toLocaleString('en-US', { style: 'decimal', maximumFractionDigits: 2 })} <p>DOOP</p> </span> </>
          }
        </button>
        {showHoldersDiscount ? <>
              <span className="WD">WD, Quirkies, MetaRebelz & Cannabuddies Get {count * 2}</span>
              <span className="EA">EA Pass Holders Get {count * 3}</span></>
            : <><span>ㅤ</span><span>ㅤ</span></>
        }
        {count === 1 ?
            <p className="applies"> * Gas Applies </p> :
            <p className="saving"> {count}x Gas Savings </p>
        }
      </div>
    </>
  }

  return (
    <>
        <div className="overlay" onClick={switchModal} style={{ display: isModal ? "flex" : "none" }}></div>
        <div
          className={`purchase ${isModal ? "purchaseFloat" : ""}`}
          style={{ width: isModal ? "" : "100%", position: (isModal && !address) ? "fixed" : "",
            top: isModal ? !address ? "20%" : "-200px" : "",
        }}
        >
          { (!isConnecting && address) && isModal ? <h1>Buy Tickets:</h1> : null}
          { !address && <RaffleLogin handleConnect={handleConnect} /> }
          { (!isLoading && !isConnecting && address) && (<>
          <div className="options">
            {ticketOption(1, false)}
            {ticketOption(5, true)}
            {ticketOption(10, true)}
            {ticketOption(25, true)}
            {ticketOption(50, true)}
          </div>
          </>)}
          {
            (!isConnecting && address) && !entriesLoading ?
                <div className={ isModal ? "tickets" : "share" }
                     style={{ order: isModal ? "-1" : "0" }}
                >

                  Your Entries: <span>
                  <div className="confettiWrapper"><div>{purchaseSuccess &&  <ConfettiExplosion duration={4000} particleCount={40} zIndex={999}/>}</div></div>
                  { userEntries }</span>
                </div> : null
          }
        </div>
    </>
  );
}

export default RafflePurchase;
