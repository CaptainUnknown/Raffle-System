import React, { useState, useEffect } from "react";
import "./RafflePurchase.scss";
import { toast } from "react-toastify";
import { ReactComponent as Ether } from "../../assets/icons/ethereum.svg";
import {useContractWrite, useContractRead, useAccount } from "wagmi";
import { doopAbi } from "../../context/doopAbi";
import { abi } from "../../context/abi";
import { helperABI } from "../../context/helperABI";
import { raffleContractAddress, doopContractAddress, helperContractAddress } from "../../Constant/constants";
import { ethers } from "ethers";
import RaffleLogin from "../../components/RaffleLogin/RaffleLogin";

function RafflePurchase({
  raffleId,
  price,
  doopPrice,
  isPurchasableWithDoop,
  switchModal,
  isModal,
}) {
  const { address, isConnecting, isDisconnected } = useAccount();
  const [isLoading, setIsLoading] = useState(true);
  const [ticketCount, setTicketCount] = useState(0);
  const [allowance, setAllowance] = useState(0);
  const [userEntries, setUserEntries] = useState(0);
  const [entriesLoading, setEntriesLoading] = useState(true);

  /**
   * @dev Reads
   */
  // Allowance
  useContractRead({
    addressOrName: doopContractAddress,
    contractInterface: doopAbi,
    functionName: 'allowance',
    args: [address, raffleContractAddress],
    onError(error) {
      console.error('Allowance Error: ', error);
    },
    onSuccess(data) {
      console.log('Allowance Read: ', Number(data.toBigInt() / 1000000000000000000n))
      setAllowance(Number(data.toBigInt() / 1000000000000000000n));
      setIsLoading(false);
    },
  });

  // Current Tickets
  useContractRead({
    addressOrName: helperContractAddress,
    contractInterface: helperABI,
    functionName: 'getMyEntries',
    args: [raffleId],
    overrides: {from: address },
    onSuccess(data) {
      setUserEntries(data.toNumber());
      setEntriesLoading(false);
      },
  });

  /**
   * @dev Writes
   */
  // Allow Doop
  const {data: allowDoopResponse, isLoading: allowDoopLoading, write: allowDoop, isError: allowDoopError } = useContractWrite({
    mode: "recklesslyUnprepared",
    addressOrName: doopContractAddress,
    contractInterface: doopAbi,
    functionName: "approve",
    args: [raffleContractAddress, ethers.utils.parseEther((doopPrice * ticketCount).toString()) ],
    onError(error) {
      toast.error(error.reason.replace(/execution reverted: /g, ""));
    },
    onSuccess(data) {
      toast.info("Sending DOOP...", { autoClose: 20000 });
    },
  });

  // Eth Purchase
  const {data: buyWithEthResponse, isLoading: buyWithEthLoading, isError: buyWithEthError, write: buyWithEth, isSuccess: buyWithEthSuccess } = useContractWrite({
    mode: "recklesslyUnprepared",
    addressOrName: raffleContractAddress,
    contractInterface: abi,
    functionName: "buyTicket",
    args: [raffleId, ticketCount],
    overrides: { value: ethers.utils.parseEther((price * ticketCount).toString()) },
    onError(error) { toast.error(error.reason.replace(/execution reverted: /g, "")) },
  });

  // Doop Purchase
  const {data: buyWithDoopResponse, isLoading: buyWithDoopLoading, isError: buyWithDoopError, write: buyWithDoop, isSuccess: buyWithDoopSuccess } = useContractWrite({
    mode: "recklesslyUnprepared",
    addressOrName: raffleContractAddress,
    contractInterface: abi,
    functionName: "buyTicket",
    args: [raffleId, ticketCount],
    onError(error) { toast.error(error.reason.replace(/execution reverted: /g, "")) },
  });

  useEffect(() => {
    if (buyWithEthLoading || buyWithDoopLoading) return;
    if (buyWithDoopSuccess || buyWithEthSuccess) {
      toast.success(`Successfully bought ${ticketCount} ticket${ ticketCount > 1 ? "s" : ""}!`)
    }
    // eslint-disable-next-line
  }, [ buyWithEthLoading, buyWithDoopLoading ]);

  useEffect(() => {
    if (allowDoopLoading) return;
    console.log('allowDoopLoading from useEffect', allowDoopLoading);
    console.log('allowDoopResponse from useEffect', allowDoopResponse);
    console.log('allowDoopError from useEffect', allowDoopError);
    if (ticketCount > 0) console.log('Positive Ticket Count');
    if (!ticketCount <= 0) console.log('!ticketCount <= 0', !ticketCount <= 0);
    if (!allowDoopError) console.log('!allowDoopError', !allowDoopError);
    if (!allowDoopError && ticketCount > 0) buyWithDoop?.();
  }, [allowDoopResponse, allowDoopLoading, allowDoopError]);

  useEffect(() => {
    if (ticketCount <= 0) return;
    if (isPurchasableWithDoop) {
      console.log('Doop Allowance: ', allowance);
      console.log('Doop Price: ', doopPrice * ticketCount);
      if (allowance < doopPrice * ticketCount) {
        console.log('doopPrice * ticketCount', doopPrice * ticketCount);
        console.log('Needs Allowance');
        toast.info("Approving DOOP...");
        allowDoop?.();
      } else buyWithDoop?.();
    } else {
      console.log("Ticket Count for Eth: ", ticketCount);
      buyWithEth?.();
    }
    // eslint-disable-next-line
  }, [ticketCount]);

  const purchaseEth = async (count) => {
    // @dev Resets ticketCount in order to re-trigger useEffect
    if (count === ticketCount) await setTicketCount(0);
    await setTicketCount(count);
  };

  const purchaseDoop = async (count) => {
    // @dev Resets ticketCount in order to re-trigger useEffect
    if (count === ticketCount) await setTicketCount(0);
    await setTicketCount(count);
  };

  const handleConnect = async (provider, signer) => {
    console.log("Connected", provider, signer);
  };

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
            <div>
              <h1> 1 </h1>
              <h2> Ticket </h2>
              {!isPurchasableWithDoop ?
                  <>
                    <button onClick={() => purchaseEth(1)}>
                      <Ether />
                      <span> {price} </span>
                    </button>
                  </>
                  :
                  <>
                    <button className="doop" onClick={() => purchaseDoop(1)}>
                      <span>
                        {" "}
                        {doopPrice} <p>DOOP</p>
                      </span>
                    </button>
                  </>
              }
              <span>ㅤ</span>
              <span>ㅤ</span>
              <p className="applies"> * Gas Applies </p>
            </div>
            <div>
              <h1> 5 </h1>
              <h2> Tickets </h2>
              {!isPurchasableWithDoop ?
                  <>
                    <button onClick={() => purchaseEth(5)}>
                      <Ether />
                      <span> {price * 5} </span>
                    </button>
                  </>
                  :
                  <>
                    <button className="doop" onClick={() => purchaseDoop(5)}>
                      <span>
                        {" "}
                        {doopPrice * 5} <p>DOOP</p>
                      </span>
                    </button>
                  </>
              }
              <span className="WD">WD HOLDERS GET {5 * 3}</span>
              <span className="EA">EA HOLDERS GET {5 * 5}</span>
              <p className="saving"> 5x Gas Savings </p>
            </div>
            <div>
              <h1> 10 </h1>
              <h2> Tickets </h2>
              {!isPurchasableWithDoop ?
                  <>
                    <button onClick={() => purchaseEth(10)}>
                      <Ether />
                      <span> {price * 10} </span>
                    </button>
                  </>
                  : <>
                    <button className="doop" onClick={() => purchaseDoop(10)}>
                      <span>
                        {" "}
                        {doopPrice * 10} <p>DOOP</p>
                      </span>
                  </button>
                  </>
              }
              <span className="WD">WD HOLDERS GET {10 * 3}</span>
              <span className="EA">EA HOLDERS GET {10 * 5}</span>
              <p className="saving"> 10x Gas Savings </p>
            </div>
            <div>
              <h1> 25 </h1>
              <h2> Tickets </h2>
              {!isPurchasableWithDoop ?
                  <>
                    <button onClick={() => purchaseEth(25)}>
                      <Ether />
                      <span> {price * 25} </span>
                    </button>
                  </>
                  :
                  <>
                    <button className="doop" onClick={() => purchaseDoop(25)}>
                      <span>
                        {" "}
                        {doopPrice * 25} <p>DOOP</p>
                      </span>
                    </button>
                  </>
              }
              <span className="WD">WD HOLDERS GET {25 * 3}</span>
              <span className="EA">EA HOLDERS GET {25 * 5}</span>
              <p className="saving"> 25x Gas Savings </p>
            </div>
            <div className="max">
              <h1> 50 </h1>
              <h2> Tickets </h2>
              {!isPurchasableWithDoop ?
                  <>
                    <button onClick={() => purchaseEth(50)}>
                      <Ether />
                      <span> {price * 50} </span>
                    </button>
                  </>
                  :
                  <>
                    <button className="doop" onClick={() => purchaseDoop(50)}>
                      <span>
                        {" "}
                        {doopPrice * 50} <p>DOOP</p>
                      </span>
                    </button>
                </>
              }
              <span className="WD">WD HOLDERS GET {50 * 3}</span>
              <span className="EA">EA HOLDERS GET {50 * 5}</span>
              <p className="saving"> 50x Gas Savings </p>
            </div>
          </div>
          </>)}
          {
            (!isConnecting && address) && !entriesLoading ?
                <div className={ isModal ? "tickets" : "share" }
                     style={{ order: isModal ? "-1" : "0" }}
                >
                  {" "}
                  Your Entries: <span>{ userEntries }</span>
                </div> : null
          }
        </div>
    </>
  );
}

export default RafflePurchase;
