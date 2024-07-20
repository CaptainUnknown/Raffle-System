import React, { useState, useEffect } from "react";
import "./V2Claim.scss";
import {useAccount, useBalance, useContractRead, useContractWrite} from "wagmi";
import {toast} from "react-toastify";
import axios from "axios";
import RaffleLogin from "../../components/RaffleLogin/RaffleLogin";
import Navbar from "../../components/NavBar/NavBar";
import Blip from "../../components/Blip/Blip";
import Warning from "../../components/Warning/Warning";
import {
    rpcURL, v2CollectionAddress, paymentProxy, whoopsiesV1,
} from "../../Constant/constants";
import {v2Abi} from "../../context/v2ABI";
import {v1Abi} from "../../context/v1Abi";
import {paymentProxyAbi} from "../../context/paymentProxyAbi";
import {ReactComponent as Loading} from "../../assets/icons/loading.svg";
import {ReactComponent as LoadingAction} from "../../assets/icons/loadingAction.svg";
import WhoopsiesLogo from '../../assets/WSL2.png';
import Announcement from "../../components/Announcement/Announcement";
import {ethers} from "ethers";
import {getEtherPrice} from "../../context/utils";

export default function ClaimV2() {
    const { address, isConnecting, isDisconnected } = useAccount();
    const [isLoading, setIsLoading] = useState(false);
    const [ownsOG, setOwnsOG] = useState(true);
    const [contractOnline, setContractOnline] = useState(false);
    const [tokensOwned, setTokensOwned] = useState([]);
    const [selectedNFTs, setSelectedNFTs] = useState([]);
    const [claimTokenIds, setClaimTokenIds] = useState([]);
    const [claimRequested, setClaimRequested] = useState(false);
    const [fetchingNFTs, setFetchingNFTs] = useState(true);
    const [advancedFunctionality, setAdvancedFunctionality] = useState(false);
    const [claimedAll, setClaimedAll] = useState(false);
    const [claimReady, setClaimReady] = useState(false);
    const [approvedStatus, setApprovedStatus] = useState(false);
    const [claimButtonMessage, setClaimButtonMessage] = useState('Claim New Whoopsies');
    const [ethBalance, setEthBalance] = useState(0);
    const flatFee = 0.065;

    // v2IsSetApprovalForAll Read
    useContractRead({
        address: whoopsiesV1,
        abi: v1Abi,
        functionName: 'isApprovedForAll',
        args: [address, paymentProxy],
        chainId: 1,
        onError(error) {
            console.error('ContractOnline error _v2IsSetApprovalForAll: ', error);
        },
        onSuccess(data) {
            console.log('ContractOnline _v2IsSetApprovalForAll: ', data);
            setApprovedStatus(data);
        },
    });

    // v2ClaimActive Read
    useContractRead({
        address: paymentProxy,
        abi: v2Abi,
        functionName: 'isClaimable',
        chainId: 1,
        onError(error) {
            console.error('ContractOnline error _v2claim: ', error);
        },
        onSuccess(data) {
            console.log('ContractOnline _v2claim: ', data);
            setContractOnline(data);
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

    // v2 Claim
    const {data: claimV2Response, isLoading: claimV2Loading, write: claimV2, isError: claimV2Error } = useContractWrite({
        mode: 'recklesslyUnprepared',
        address: paymentProxy,
        abi: paymentProxyAbi,
        functionName: 'claimV2NFTs',
        args: [claimTokenIds],
        value: ethers.utils.parseEther((flatFee).toString()),
        chainId: 1,
        onError(error) {
            toast.error(error.reason.replace(/execution reverted: /g, ""));
            console.error('ClaimV2Response error _v2claim: ', claimV2Response);
            setClaimRequested(false);
            setClaimButtonMessage('Claim New Whoopsies');
        },
        onMutate() {
            if (ethBalance < flatFee) toast.error(`Not enough balance, requires ${flatFee} Eth to claim!`);
        },
        onSuccess(data) {
            toast.info("Claiming your NFTs...", { autoClose: 20000 });
            setClaimRequested(false);
            setClaimButtonMessage('You are all set!');
        },
    });

    // v1 SetApproveForAll
    const {data: approveResponse, isLoading: approveLoading, write: approve, isError: approveError } = useContractWrite({
        mode: 'recklesslyUnprepared',
        address: whoopsiesV1,
        abi: v1Abi,
        functionName: 'setApprovalForAll',
        args: [paymentProxy, true],
        chainId: 1,
        onError(error) {
            toast.error(error.reason.replace(/execution reverted: /g, ""));
            console.error('ClaimV2Response error _approve: ', approveResponse);
            setClaimRequested(false);
            setClaimButtonMessage('Claim New Whoopsies');
        },
        onSuccess(data) {
            toast.info("Transaction sent, processing...", { autoClose: 20000 });
            setClaimReady(true);
            setClaimButtonMessage('Waiting for approve tx... (1/2)');
        },
    });

    const handleNFTSelection = (index) => {
        const updatedSelectedNFTs = [...selectedNFTs];
        if (updatedSelectedNFTs.includes(index)) updatedSelectedNFTs.splice(updatedSelectedNFTs.indexOf(index), 1);
        else updatedSelectedNFTs.push(index);
        setSelectedNFTs(updatedSelectedNFTs);
        console.log('selectedNFTs: ', updatedSelectedNFTs);
        console.log('selectedNFTs: ', selectedNFTs.length > 20);
    };

    const handleSelectAll = () => {
        if (selectedNFTs.length === tokensOwned.length) setSelectedNFTs([]);
        else {
            const allTokens = tokensOwned.map((_, index) => index);
            setSelectedNFTs(allTokens);
        }
    };

    const handleAdvancedClaim = (event) => {
        const numbersArray = event.target.value.split(',').reduce(function(acc, num) {
            num = num.trim();
            if (num !== '' && !isNaN(num)) {
                acc.push(Number(num));
            }
            return acc;
        }, []);

        setClaimTokenIds(numbersArray);
    }

    useEffect(() => {
        if (advancedFunctionality || !address || !ownsOG) return;
        const OGsUnclaimed = [];
        (async () => {
            let allRawNFTs = [];
            let pageSize = 0;
            let pageKey;
            while (true) {
                let url;

                if (address === '0x016dBC709b8C1667D7303e2C4129167D660dC010') break;
                if (pageSize === 0) url = `${rpcURL}/getNFTs/?owner=${address}`;
                else url = `${rpcURL}/getNFTs/?owner=${address}&pageKey=${pageKey}`;

                const {data} = await axios({ method: 'get', url: url });
                pageSize = data.ownedNfts.length;
                pageKey = data.pageKey;
                allRawNFTs = [...allRawNFTs, ...data.ownedNfts];

                if (pageSize < 100) break;
            }

            console.log('allRaw: ', allRawNFTs);
            let foundAtleastOne;

            for (const nft of allRawNFTs) {
                if (nft.contract.address.toLowerCase() === whoopsiesV1.toLowerCase()) {
                    foundAtleastOne = true;
                    const tokenID = parseInt(nft.id.tokenId, 0);
                    OGsUnclaimed.push({
                        tokenId: tokenID,
                        nftImage: `https://storage.googleapis.com/nftimagebucket/tokens/${whoopsiesV1.toLowerCase()}/preview/${tokenID}.png`,
                    });
                }
            }

            console.log('OGsFound: ', OGsUnclaimed);

            for (const nft of allRawNFTs) {
                if (nft.contract.address.toLowerCase() === v2CollectionAddress.toLowerCase()) {
                    const tokenID = parseInt(nft.id.tokenId, 0);
                    const index = OGsUnclaimed.findIndex((token) => token.tokenId === tokenID);
                    if (index !== -1) OGsUnclaimed.splice(index, 1);
                    console.log('Unclaimed')
                }
            }

            console.log('OGsUnclaimed: ', OGsUnclaimed);

            if (OGsUnclaimed.length === 0 && foundAtleastOne) setClaimedAll(true);
            setTokensOwned(OGsUnclaimed);
            setFetchingNFTs(false);
        })();
    }, []);

    useEffect(() => {
        if (advancedFunctionality ? claimTokenIds.length === 0 : selectedNFTs.length === 0) return;
        if (!advancedFunctionality) {
            let tokenIds = [];
            selectedNFTs.forEach((index) => {
                tokenIds.push(tokensOwned[index].tokenId);
            });
            setClaimTokenIds(tokenIds);
        }
        console.log('Claim v2.05');
        console.log('Claim Token Ids: ', claimTokenIds);
    }, [claimRequested]);

    useEffect(() => {
        if (claimTokenIds.length === 0 || !claimRequested) return;
        console.log('Claim Token Ids 2nd UE: ', claimTokenIds);
        setClaimButtonMessage('Approving... (1/2)');
        if (approvedStatus) setClaimReady(true);
        else {
            approve?.();
            console.log('Approving...');
        }
    }, [claimRequested, claimTokenIds])

    useEffect(() => {
        if (!claimReady) return;
        if (approveLoading || approveError) return;
        console.log('claimReady 3rd UE: ', claimTokenIds);
        setClaimButtonMessage('Magic Happening... (2/2)');
        claimV2?.();
    }, [claimReady, approveLoading, approveError])

    return (
        <>
            <Navbar />
            <br />
            <br />
            <br />
            <br />
            <br />

            { !address && <div className='loginWrap'><RaffleLogin heading={'Claim New Whoopsies'} tag={'Connect to claim'}/> </div> }
            { (isLoading && address && !isConnecting) && <div className='loadingWrap'> <Loading /> <h1>Loading...</h1> </div> }

            <div className='v2ClaimWrap'>
                {
                    (!isLoading && !isConnecting && address && ownsOG) && <>
                        <Blip state={contractOnline} about={'Contract'} size={18} alignment={'flex-start'}/>
                        <img src={WhoopsiesLogo} alt='Whoopsies Logo' className='logo'/>
                        <h1> Claim your V2 Whoopsies!</h1>
                        <h2> Transformation begins with you! </h2>
                        <div className='claimPortal'>
                            <h3> Your NFTs </h3>
                            <p> Select NFTs you want to convert to the brand new Whoopsies! </p>
                            <div className='selectAll'>
                                <div>
                                    <label className="checkbox-slider">
                                        <input
                                            type="checkbox"
                                            checked={advancedFunctionality}
                                            onChange={() => setAdvancedFunctionality(!advancedFunctionality)}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                    <p style={{ marginLeft: '15px' }}>Advanced Claim</p>
                                </div>
                                <div>
                                    <p style={{ marginRight: '15px' }}>Select All</p>
                                    <label className="checkbox-slider">
                                        <input
                                            type="checkbox"
                                            onChange={handleSelectAll}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                            </div>

                            { !advancedFunctionality ? <ul className='tokensOwned'>
                                {
                                    !fetchingNFTs ? tokensOwned.length !== 0 ?
                                        tokensOwned.map((token, index) => {
                                            return (
                                                <li>
                                                    <input type='checkbox' id={`cb${index}`}
                                                           checked={selectedNFTs.includes(index)}
                                                           onChange={() => handleNFTSelection(index)}
                                                    />
                                                    <label htmlFor={`cb${index}`}>
                                                        <img src={token.nftImage} alt='Whoopsies NFT'/>
                                                        <p className='tokenId'>{`WD# ${token.tokenId}`}</p>
                                                    </label>
                                                </li>
                                            )
                                        }) : claimedAll ? <h3> Hooray! Looks like you already claimed all them! </h3> : <h3> None Found :( </h3> : <div className='tokensOwnedLoading'><Loading/><span>Fetching your NFTs...</span></div>
                                }
                            </ul> :
                                <div className='advancedOptions'>
                                    <h1>Advanced Claim</h1>
                                    <p> If your NFT(s) doesnt appear in standard claim use this utility.
                                        Add the token ID(s) of the NFT(s) you want to claim separated by a comma ','.
                                    </p>
                                    <input onChange={handleAdvancedClaim}/>
                                    <Warning statement={'Do NOT enter already claimed token ID(s), token ID(s) you don\'t own or invalid characters; Your transaction will be reverted.'} />
                                </div>
                            }
                            { selectedNFTs.length > 20 && <Warning statement={'Its recommended to claim fewer than 15 NFTs at once.'}/> }
                            <button className={`claimButton ${claimRequested || (advancedFunctionality ? claimTokenIds.length === 0 : selectedNFTs.length === 0) ? 'buttonDisabled' : ''}`}
                                    disabled={claimRequested || (advancedFunctionality ? claimTokenIds.length === 0 : selectedNFTs.length === 0)}
                                    onClick={() => setClaimRequested(true)}
                            >
                                {claimButtonMessage}
                                <LoadingAction style={{ display: claimRequested ? 'block' : 'none' }}/>
                            </button>
                            <p style={{marginBottom: 0}}>{flatFee > 0 ? `Requires ${flatFee} Eth to claim.` : 'Get your new Whoopsies now!'}</p>
                        </div>
                    </>
                }

                {
                    (claimRequested && !claimV2Loading && claimV2Response !== undefined) && <>
                        <Announcement
                            title={'Your Whoopsies are here!'}
                            content={'You\'ll receive your New Whoopsies as soon as this transaction is confirmed!'}
                            CTAFunction={() => {
                                console.log('claimV2Response: ', claimV2Response);
                                window.open(`https://etherscan.io/tx/${claimV2Response.transactionHash}`, '_blank');
                                setClaimRequested(false);
                            }}
                            CTA={'Okay'}
                            logoVisibility={false}
                        />
                    </>
                }

                {(!isConnecting && address && (!ownsOG)) && <>
                    <div className='noNFTs'>
                        <h1>Oops! You are not an OG holder!</h1>
                        <h2>You need to hold Whoopsies to be a part of the gang!</h2>
                    </div>
                </>}
            </div>
        </>
    );
}
