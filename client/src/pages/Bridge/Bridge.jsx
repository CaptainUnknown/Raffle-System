/* global BigInt */
import React, { useState, useEffect } from "react";
import "./Bridge.scss";
import {useAccount, useBalance, useContractRead, useContractWrite} from "wagmi";
import {toast} from "react-toastify";
import RaffleLogin from "../../components/RaffleLogin/RaffleLogin";
import Navbar from "../../components/NavBar/NavBar";
import {
    doopContractAddress, doopL2ContractAddress, raffleContractAddress_OLD
} from "../../Constant/constants";
import { parseAddress, getEtherPrice } from "../../context/utils";
import {doopAbi} from "../../context/doopAbi";
import {ethers} from "ethers";
import {doopL2Abi} from "../../context/doopL2Abi";
import {ReactComponent as Loading} from "../../assets/icons/loading.svg";
import {ReactComponent as Info} from "../../assets/icons/info.svg";
import {ReactComponent as Ether} from "../../assets/icons/ethereumHorizontal.svg";
import {ReactComponent as Nova} from "../../assets/icons/nova.svg";
import {ReactComponent as Swap} from "../../assets/icons/rotate.svg";
import {ReactComponent as Cross} from "../../assets/icons/cross.svg";

export default function Bridge() {
    const { address, isConnecting, isDisconnected } = useAccount();
    const [isLoading, setIsLoading] = useState(false);
    const [ethPrice, setEthPrice] = useState(0);
    const [ethMainnetBalance, setEthMainnetBalance] = useState(0);
    const [ethNovaBalance, setNovaBalance] = useState(0);
    const [doopMainnetBalance, setDoopMainnetBalance] = useState(0);
    const [doopNovaBalance, setDoopNovaBalance] = useState(0);
    const [overlayVisibility, setOverlayVisibility] = useState(false);
    const [requestedBridge, setRequestedBridge] = useState(0);

    const ethMainnetBalanceHook = useBalance({
        address: address,
        chainId: 1,
        onError(error) {
            console.error('eth balance error _useBalance _bridge: ', error);
        },
        onSuccess(data) {
            console.log('eth _useBalance _bridge: ', data);
            setEthMainnetBalance(parseFloat(data.formatted).toFixed(3));
        }
    });

    const ethNovaBalanceHook = useBalance({
        address: address,
        chainId: 42170,
        onError(error) {
            console.error('eth balance error _useBalance _bridge: ', error);
        },
        onSuccess(data) {
            console.log('eth _useBalance _bridge: ', data);
            setNovaBalance(parseFloat(data.formatted).toFixed(3));
        }
    });

    // Doop Balance Mainnet
    useContractRead({
        address: doopContractAddress,
        abi: doopAbi,
        functionName: 'balanceOf',
        args: [address],
        chainId: 1,
        onError(error) {
            console.log('doop balance error _bridge: ', error);
        },
        onSuccess(data) {
            console.log('doop balance _bridge: ', (Number(data) / 10 ** 18).toFixed(0));
            setDoopMainnetBalance((Number(data) / 10 ** 18).toFixed(0));
        },
    });

    // Doop Balance Nova
    useContractRead({
        address: doopL2ContractAddress,
        abi: doopL2Abi,
        functionName: 'balanceOf',
        args: [address],
        chainId: 42170,
        onError(error) {
            console.log('doop balance error _bridge: ', error);
        },
        onSuccess(data) {
            console.log('doop balance _bridge: ', (Number(data) / 10 ** 18).toFixed(0));
            setDoopNovaBalance((Number(data) / 10 ** 18).toFixed(0));
        },
    });

    // Bridge Doop
    const {data: allowDoopResponse, isLoading: allowDoopLoading, write: allowDoop } = useContractWrite({
        mode: "recklesslyUnprepared",
        address: doopContractAddress,
        abi: doopAbi,
        functionName: "transfer",
        args: [raffleContractAddress_OLD, ethers.utils.parseEther(requestedBridge ? requestedBridge.toString() : (0).toString())],
        chainId: 1,
        onSuccess(data) {
            console.log('allow doop success _allowance: ', data);
            toast.info("Bridging... (This can take a few mins).", { autoClose: 10000 });
            setTimeout(() => {window.location.reload(false)}, 10000);
            setOverlayVisibility(false);
        },
        onError(error) {
            toast.error(error.reason.replace(/execution reverted: /g, ""));
        },
    });

    useEffect(() => {
        getEtherPrice().then(price => setEthPrice(price));
    }, [])

    return (
        <>
            <Navbar />
            { !address && <RaffleLogin heading={'Bridge to Nova'} tag={'Connect to Bridge!'} /> }
            { (isLoading && address && !isConnecting) && <div className='loadingWrap'> <Loading /> <h1>Loading...</h1> </div> }

            { address && overlayVisibility && (<>
                <div className="allowOverlay" onClick={() => {setOverlayVisibility(false)}}></div>
                <div className="allowOverlayContent">
                    <Cross className="cross"
                           onClick={() => {setOverlayVisibility(false)}}
                    />
                    <h1>Enter an amount to bridge: </h1>
                    <div className="inputBox" style={{ border: requestedBridge > doopMainnetBalance ? "solid 2px var(--red)" : "solid 2px var(--primary)" }}>
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
                        <h2>Available: <span>{doopMainnetBalance}</span> Doop</h2>
                        <a onClick={() => { setRequestedBridge(doopMainnetBalance) }}>Max</a>
                    </div>
                    <button onClick={() => { allowDoop() }}
                            style={{
                                cursor: requestedBridge > doopMainnetBalance ? 'not-allowed' : 'pointer',
                                background: requestedBridge > doopMainnetBalance ? 'var(--text-color-accent)' : 'var(--primary)'
                            }}
                            disabled={requestedBridge > doopMainnetBalance}
                    >Bridge to Nova</button>
                </div>
            </>)}
            { address && <div className='bridgeWrap'>
                <br />
                <br />
                <br />
                <br />
                <br />
                <div className='bridgeWidget'>
                    <div className="address">{parseAddress(address)}</div>
                    <h1>Eth to Nova</h1>
                    <p className="tag">Bridging Ethereum to Arbitrum Nova!</p>
                    <div className="ethBalances"
                         onClick={() => {window.open("https://bridge.arbitrum.io/?destinationChain=arbitrum-nova&sourceChain=ethereum", '_blank')}}
                    >
                        <div className="left">
                            <div className="iconWrapper"><Ether /></div>
                            <p><span>{ethMainnetBalance}</span> Eth</p>
                            <div className="swapWrapper"><div className="swapBack" style={{top: "-35px"}}><Swap className="swap"/></div></div>
                            <p style={{marginTop: "0"}}>~${(ethMainnetBalance * ethPrice).toFixed(2)}</p>
                        </div>
                        <div className="right">
                            <div className="iconWrapper"><Nova /></div>
                            <p><span>{ethNovaBalance}</span> Eth</p>
                            <p style={{marginTop: "0"}}>~${(ethNovaBalance * ethPrice).toFixed(2)}</p>
                        </div>
                    </div>
                    <div className="ethBalances"
                         onClick={() => {setOverlayVisibility(true)}}
                    >
                        <div className="left">
                            <div className="iconWrapper"><Ether /></div>
                            <p><span>{doopMainnetBalance}</span> Doop</p>
                            <div className="swapWrapper"><div className="swapBack" style={{top: "-47px"}}><Swap className="swap"/></div></div>
                        </div>
                        <div className="right">
                            <div className="iconWrapper"><Nova /></div>
                            <p><span>{doopNovaBalance}</span> Doop</p>
                        </div>
                    </div>
                    <div className="tip">
                        <div className="icon">
                            <Info />
                            <h2>Quick Tip!</h2>
                        </div>
                        <p>This is only a one time process for onboarding to a network with almost gasless transactions at lightning fast speeds. You need to bridge small amount of Eth & any amount of Doop to participate in raffles. You'll receive the bridged assets to the connected wallet.</p>
                    </div>
                </div>
                <br />
                <br />
                <br />
                <br />
                <br />
            </div>
            }

        </>
    );
}
