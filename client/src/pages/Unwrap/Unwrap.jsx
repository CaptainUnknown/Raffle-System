/* global BigInt */
import React, { useState, useEffect } from "react";
import "./Unwrap.scss";
import {useAccount, useContractRead, useContractWrite} from "wagmi";
import {toast} from "react-toastify";
import RaffleLogin from "../../components/RaffleLogin/RaffleLogin";
import Navbar from "../../components/NavBar/NavBar";
import { wrapperAddress } from "../../Constant/constants";
import {parseAddress, getEtherPrice, getWrappedNFTs} from "../../context/utils";
import {ethers} from "ethers";
import {wrapperAbi} from "../../context/wrapperAbi";
import {v2Abi} from "../../context/v2ABI";
import {ReactComponent as Loading} from "../../assets/icons/loading.svg";
import {ReactComponent as Info} from "../../assets/icons/info.svg";
import {ReactComponent as LoadingAction} from "../../assets/icons/loadingAction.svg";

export default function Unwrap() {
    const { address, isConnecting, isDisconnected } = useAccount();
    const [isLoading, setIsLoading] = useState(false);
    const [fetchingNFTs, setFetchingNFTs] = useState(true);
    const [ethPrice, setEthPrice] = useState(0);
    const [wrappedTokens, setWrappedTokens] = useState([]);
    const [unwrapFees, setUnwrapFees] = useState(0);
    const [unwrapMessage, setUnwrapMessage] = useState("Unwrap your NFT");
    const [unwrapRequest, setUnwrapRequest] = useState({wrappedAddress: "", deployer: "", tokenId: 0});
    const [unwrapReady, setUnwrapReady] = useState(false);
    const [isUnwrapRequested, setIsUnwrapRequested] = useState(false);
    const [isUnwrapped, setIsUnwrapped] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const chainId = 42170;

    const handleSelect = (index) => {
        if (isUnwrapRequested) return;
        if (selectedIndex === index) setSelectedIndex(null);
        else setSelectedIndex(index);
    };

    useEffect(() => {
        setFetchingNFTs(true);
        getWrappedNFTs(address).then(foundWrappedTokens => {
            setWrappedTokens(foundWrappedTokens);
            setIsUnwrapped(false);
            setFetchingNFTs(false);
        });
    }, [isUnwrapped]);

    // Unwrap Fees
    useContractRead({
        address: wrapperAddress,
        abi: wrapperAbi,
        functionName: 'unwrapFees',
        chainId: chainId,
        onError(error) {
            console.log('unwrapFees read error _unwrap: ', error);
        },
        onSuccess(data) {
            console.log('unwrapFees _unwrap: ', (Number(data) / 10 ** 18));
            setUnwrapFees(Number(data) / 10 ** 18);
        },
    });

    // Unwrap
    const {data: unwrapResponse, isLoading: unwrapLoading, write: unwrap, isError: unwrapError } = useContractWrite({
        mode: 'recklesslyUnprepared',
        abi: wrapperAbi,
        functionName: 'unwrapNFT',
        value: ethers.utils.parseEther((unwrapFees).toString()),
        chainId: chainId,
        onSuccess(data) {
            toast.info("Unwrapping your NFT...", { autoClose: 20000 });
            setIsUnwrapped(true);
            setIsUnwrapRequested(false);
            setUnwrapReady(false);
            setSelectedIndex(null);
            setUnwrapMessage('NFT Dispatched!');
            const timeout = (delay) => {
                return new Promise((resolve) => setTimeout(() => resolve(), delay));
            }
            timeout(3000).then(() => setUnwrapMessage('Unwrap Your NFT'));
        },
    });

    // onError
    useEffect(() => {
        if (unwrapLoading || !isUnwrapRequested || !unwrapReady) return;
        toast.error("Request Failed!");
        console.error('unwrapResponse error _unwrap: ', unwrapResponse);
        setIsUnwrapRequested(false);
        setUnwrapMessage('Unwrap Your NFT');
    }, [unwrapError])

    // approve
    const {data: approveResponse, isLoading: approveLoading, write: approve, isError: approveError } = useContractWrite({
        mode: 'recklesslyUnprepared',
        abi: v2Abi,
        functionName: 'approve',
        chainId: chainId,
        onSuccess(data) {
            toast.info("Transaction sent, processing...", { autoClose: 10000 });
            setUnwrapReady(true);
            setUnwrapMessage('Approving transfer... (1/2)');
        },
    });

    // onError
    useEffect(() => {
        if (approveLoading || !isUnwrapRequested) return;
        toast.error("Request Failed!");
        console.error('ClaimV2Response error _approve: ', approveResponse);
        console.error('ClaimV2Response error _approve: ', approveError);
        setIsUnwrapRequested(false);
        setUnwrapReady(false);
        setUnwrapMessage('Claim New Whoopsies');
    }, [approveError])


    const handleUnwrap = (index) => {
        console.log("Requested Unwrap _unwrap: ", wrappedTokens[index]);
        console.log("Requested Unwrap Add _unwrap: ", wrappedTokens[index].wrappedAddress);
        setIsUnwrapRequested(true);
        setUnwrapRequest({
            wrappedAddress: wrappedTokens[index].wrappedAddress,
            deployer: wrappedTokens[index].deployer, // Wrapper Deployer
            tokenId: wrappedTokens[index].tokenId
        })
        approve?.({
            address: wrappedTokens[index].wrappedAddress,
            args: [wrappedTokens[index].deployer, wrappedTokens[index].tokenId],
            gas: 200000,
        })
    }

    useEffect(() => {
        if (!unwrapReady) return;
        if (approveLoading || approveError) return;
        setUnwrapMessage('Unwrapping NFT... (2/2)');
        unwrap?.({
            address: wrapperAddress,
            args: [unwrapRequest.wrappedAddress, unwrapRequest.tokenId],
            gas: 100000
        });
    }, [unwrapReady, approveLoading, approveError])

    useEffect(() => {
        getEtherPrice().then(price => setEthPrice(price));
    }, [])

    return (
        <>
            <Navbar />

            { !address && <RaffleLogin heading={'Bridge to Eth Mainnet'} tag={'Connect to Unwrap your NFTs!'} /> }
            { (isLoading && address && !isConnecting) && <div className='loadingWrap'> <Loading /> <h1>Loading...</h1> </div> }

            {(address && !isConnecting) && <div className='unwrapWrap'>
                <br/>
                <br/>
                <br/>
                <br/>
                <div className='unwrapWrapRow'>
                    <div className='unwrapWidget'>
                        <h1>Unwrap NFTs to the Mainnet</h1>
                        <p className="tag">Bridging Your NFTs from Nova to the Ethereum Mainnet!</p>
                        <div className="wrappedNFTs">
                            {
                                !fetchingNFTs ? wrappedTokens.length !== 0 ?
                                        wrappedTokens.map((token, index) => {
                                            return (
                                                <li key={index}>
                                                    <input type='checkbox' id={`cb${index}`}
                                                           checked={index === selectedIndex}
                                                           onChange={() => handleSelect(index)}
                                                           disabled={isUnwrapRequested}
                                                    />
                                                    <label htmlFor={`cb${index}`}>
                                                        <img src={token.meta.image.cachedUrl} alt={`${token.meta.collection.name} #${token.meta.tokenId}`} />
                                                        <p className='tokenId'>{token.meta.name || token.meta.collection.name}</p>
                                                    </label>
                                                </li>
                                            )
                                        }) : <h3> No Wrapped NFTs Found! </h3> :
                                    <div className='tokensOwnedLoading'><Loading/><span>Fetching your NFTs...</span>
                                    </div>
                            }
                        </div>

                        <div className="tip" style={{marginTop: "auto"}}>
                            <div className="icon">
                                <Info/>
                                <h2>Quick Tip!</h2>
                            </div>
                            <p>Bridge will wait for 25 Block confirmations after which, you'll receive your NFT to the
                                connected wallet on the Ethereum Mainnet.</p>
                        </div>
                    </div>
                    <div className='unwrapWidget sidebar'>
                        <div className="address">{parseAddress(address)}</div>
                        <div className="statusItem" style={{marginTop: "20px"}}>
                            <span>1. Select an NFT to Unwrap</span>
                            <p style={{color: `${selectedIndex !== null ? 'var(--primary)' : 'var(--text-color-accent)'}`}}>{selectedIndex !== null ? 'Selected!' : 'Selecting...'}</p>
                        </div>
                        <div className="statusItem">
                            <span>2. Approve NFT Transfer</span>
                            <p style={{color: `${isUnwrapRequested && unwrapReady ? 'var(--primary)' : 'var(--text-color-accent)'}`}}>{isUnwrapRequested ? unwrapReady ? "Approved!" : "Approving..." : "Waiting..."}</p>
                        </div>
                        <div className="statusItem">
                            <span>3. Unwrap the Selected NFT</span>
                            <p style={{color: `${isUnwrapped ? 'var(--primary)' : 'var(--text-color-accent)'}`}}>{isUnwrapRequested ? unwrapReady ? isUnwrapped ? "Unwrap Initiated!" : "Waiting to be Unwrapped..." : "Making preparations..." : "Waiting..."}</p>
                        </div>
                        <div className="fees">
                            <div className="title">
                                <span>Fees</span>
                            </div>
                            <div className="cost">
                                <p className="eth">{parseFloat(unwrapFees).toFixed(4)}</p>
                                <p>~${parseFloat(ethPrice * unwrapFees).toFixed(2)}</p>
                            </div>
                        </div>
                        <button onClick={() => {
                            handleUnwrap(selectedIndex)
                        }}
                                disabled={isUnwrapRequested || selectedIndex === null}
                        >
                            {unwrapMessage}
                            <LoadingAction style={{display: isUnwrapRequested ? 'block' : 'none'}}/>
                        </button>
                    </div>
                </div>
            </div>}
        </>
    );
}
