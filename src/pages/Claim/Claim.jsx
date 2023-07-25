import React, { useState, useEffect } from "react";
import "./Claim.scss";
import {useAccount, useContractRead, useContractWrite} from "wagmi";
import { useMoralis } from "react-moralis";
import {toast} from "react-toastify";
import axios from "axios";
import RaffleLogin from "../../components/RaffleLogin/RaffleLogin";
import Navbar from "../../components/NavBar/NavBar";
import {
    EAClaimAddress,
    doopContractAddress,
    openSeaAPIKey,
    whoopAddress,
    eaAddress,
    raffleContractAddress
} from "../../Constant/constants";
import {doopAbi} from "../../context/doopAbi";
import {claimABI} from "../../context/claimABI";
import {EAABI} from "../../context/EAABI";
import {ReactComponent as Loading} from "../../assets/icons/loading.svg";
import {topic1, topic1ID} from "../../context/topic";

export default function Claim() {
    const { address, isConnecting, isDisconnected } = useAccount();
    const { Moralis, isInitialized } = useMoralis();
    const [isLoading, setIsLoading] = useState(false);
    const [ownsEA, setOwnsEA] = useState(false);
    const [ownsOG, setOwnsOG] = useState(false);
    const [EAClaimable, setEAClaimable] = useState(0);
    const [OGClaimable, setOGClaimable] = useState(0);
    const [lastEAClaim, setLastEAClaim] = useState(0);
    const [lastOGClaim, setLastOGClaim] = useState(0);
    const [totalEAClaimed, setTotalEAClaimed] = useState(0);
    const [totalOGClaimed, setTotalOGClaimed] = useState(0);
    const [lastEAClaimFormatted, setLastEAClaimFormatted] = useState({});
    const [lastOGClaimFormatted, setLastOGClaimFormatted] = useState({});
    const [totalEAsOwned, setTotalEAsOwned] = useState(0);
    const [totalOGsOwned, setTotalOGsOwned] = useState(0);
    const [NFTImages, setNFTImages] = useState({});

    /**
     * @dev Reads
     */
    // Owns EA Read
    useContractRead({
        addressOrName: eaAddress,
        contractInterface: EAABI,
        functionName: 'balanceOf',
        args: [address],
        onError(error) {
            console.error('Owns EA error _claim: ', error);
        },
        onSuccess(data) {
            console.log('Owns EA _claim: ', data.toNumber());
            setOwnsEA(0 < data.toNumber());
            setTotalEAsOwned(data.toNumber());
        },
    });

    // Owns OG Read
    useContractRead({
        addressOrName: whoopAddress,
        contractInterface: doopAbi,
        functionName: 'balanceOf',
        args: [address],
        onError(error) {
            console.error('Owns OG error _claim: ', error);
        },
        onSuccess(data) {
            console.log('Owns OG _claim: ', data.toNumber());
            setOwnsOG(0 < data.toNumber());
            setTotalOGsOwned(data.toNumber());
        },
    });

    // EA Claimable Read
    useContractRead({
        addressOrName: EAClaimAddress,
        contractInterface: claimABI,
        functionName: 'getClaimable',
        args: [address],
        onError(error) {
            console.error('EA Claimable error _claim: ', error);
        },
        onSuccess(data) {
            console.log('EA Claimable _claim: ', data);
            setEAClaimable(Number(data.toBigInt() / 1000000000000000000n).toFixed(0));
        },
    });

    // OG Claimable
    useContractRead({
        addressOrName: doopContractAddress,
        contractInterface: doopAbi,
        functionName: 'canClaim',
        args: [address],
        onError(error) {
            console.error('OG Claimable error _claim: ', error);
        },
        onSuccess(data) {
            console.log('OG Claimable _claim: ', data.toBigInt().toString().slice(0, -18));
            setOGClaimable(data.toNumber());
        },
    });

    // EA Last Claimed
    useContractRead({
        addressOrName: EAClaimAddress,
        contractInterface: claimABI,
        functionName: 'previousTime',
        args: [address],
        onError(error) {
            console.error('Last EA Claimed error _claim: ', error);
        },
        onSuccess(data) {
            console.log('Last EA Claimed _useContractRead _claim: ', data.toNumber());
            setLastEAClaim(data.toNumber() * 1000);
        },
    });

    // OG Last Claimed
    useContractRead({
        addressOrName: doopContractAddress,
        contractInterface: doopAbi,
        functionName: 'prevTime',
        args: [address],
        onError(error) {
            console.error('Last OG Claimed error _claim: ', error);
        },
        onSuccess(data) {
            console.log('Last OG Claimed _useContractRead _claim: ', data.toBigInt().toString().slice(0, -18));
            setLastOGClaim(data.toNumber() * 1000);
        },
    });

    // EA Total Claimed
    useContractRead({
        addressOrName: EAClaimAddress,
        contractInterface: claimABI,
        functionName: 'totalClaimed',
        args: [address],
        onError(error) {
            console.error('Total EA Claimed error _claim: ', error);
            console.error('Address: ', address);
        },
        onSuccess(data) {
            console.log('Total EA Claimed _claim: ', data.toNumber());
            setTotalEAClaimed(data.toNumber());
        },
    });

    // OG Total Claimed
    useContractRead({
        addressOrName: doopContractAddress,
        contractInterface: doopAbi,
        functionName: 'totalClaimed',
        args: [address],
        onError(error) {
            console.error('Total OG Claimed error _claim: ', error);
        },
        onSuccess(data) {
            console.log('Total OG Claimed _claim: ', data.toBigInt().toString().slice(0, -18));
            setTotalOGClaimed(data.toNumber());
        },
    });

    /**
     * @dev Writes
     */
    // EA Claim
    const {data: EAClaimResponse, isLoading: EAClaimLoading, isError: EAClaimError, write: EAClaim, isSuccess: EAClaimSuccess } = useContractWrite({
            mode: "recklesslyUnprepared",
            addressOrName: EAClaimAddress,
            contractInterface: claimABI,
            functionName: "claim",
            onError(error) { toast.error(error.reason.replace(/execution reverted: /g, "")) },
            onSuccess(data) { toast.info("Claiming rewards...") },
        });

    // OG Claim
    const {data: OGClaimResponse, isLoading: OGClaimLoading, isError: OGClaimError, write: OGClaim, isSuccess: OGClaimSuccess } = useContractWrite({
        mode: "recklesslyUnprepared",
        addressOrName: doopContractAddress,
        contractInterface: doopAbi,
        functionName: "claim",
        onError(error) { toast.error(error.reason.replace(/execution reverted: /g, "")) },
        onSuccess(data) { toast.info("Claiming rewards...") },
    });

    useEffect(() => {
        const OGOwned = [];
        const EAOwned = [];
        (async () => {
            const ownedNFTs = await Moralis.Cloud.run('getNFTs', {
                address: address,
            });
            console.log('Owned NFTs: ', ownedNFTs);
            ownedNFTs.result.forEach((nft) => {
                if (nft.token_address.toLowerCase() === whoopAddress.toLowerCase()) {
                    console.log('Found OG NFT: ', nft);
                    OGOwned.push(nft);
                } else if (nft.token_address.toLowerCase() === eaAddress.toLowerCase()) {
                    console.log('Found EA NFT: ', nft);
                    EAOwned.push(nft);
                }
            });

            // TODO: Handling if one or both tokens aren't found (i.e. page size exceeds 100)
            // Use the cursor to look for more
            console.log('OGOwned: ', OGOwned);
            console.log('EAOwned: ', EAOwned);
            const url = `https://api.opensea.io/api/v1/assets?` +
                (OGOwned.length > 0 ? `token_ids=${parseInt(OGOwned[0].token_id)}&` : ``) +
                (EAOwned.length > 0 ? `token_ids=${parseInt(EAOwned[0].token_id)}` : ``) +
                (OGOwned.length > 0 ? `&asset_contract_addresses=${whoopAddress}` : ``) +
                (EAOwned.length > 0 ? `&asset_contract_addresses=${eaAddress}` : ``);
            const {data} = await axios.get(url + '&include_orders=true&order_direction=desc', {
                headers: { "X-API-KEY": openSeaAPIKey },
            });
            console.log('Owned Metadata', data);

            // @dev In case only one owned token found, add the other token as the first element to preserve the order
            if (data.assets.length === 1 && data.assets[0].asset_contract.address.toLowerCase() !== whoopAddress.toLowerCase()) {
                data.assets.unshift({asset_contract: {address: whoopAddress}});
            } else {
                data.assets.sort((a, b) => {
                    if (a.asset_contract.address.toLowerCase() === whoopAddress.toLowerCase()) return -1;
                    else if (b.asset_contract.address.toLowerCase() === eaAddress.toLowerCase()) return 1;
                });
            }
            const images = {EA: data.assets[1]?.image_url || '', OG: data.assets[0]?.image_url || ''};
            setNFTImages(images);
        })();
    }, [ownsEA, ownsOG]);

    function calculateTimeLeft(time) {
        const difference = time - Date.now();
        const parseValues = (val) => {
            const idStr = val.toString();
            if (idStr.length >= 2) return idStr;
            return "0".repeat(2 - idStr.length) + idStr;
        };

        if (difference > 0) {
            const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((difference / 1000 / 60) % 60);
            const seconds = Math.floor((difference / 1000) % 60);
            return {
                hours: parseValues(hours),
                minutes: parseValues(minutes),
                seconds: parseValues(seconds),
            }
        } else return {
            hours: "00",
            minutes: "00",
            seconds: "00",
        };
    }

    useEffect(() => {
        if (!ownsEA) return;
        console.log('Last EA Claimed _useEffect _claim: ', lastEAClaim);
        const timer = setInterval(() => {
            setLastEAClaimFormatted(calculateTimeLeft(lastEAClaim));
        }, 1000);
        return () => { clearInterval(timer) }
    }, [ownsEA]);

    useEffect(() => {
        if (!ownsOG) return;
        console.log('Last OG Claimed _useEffect _claim: ', lastOGClaim);
        const timer = setInterval(() => {
            console.log('Last OG Claimed _setInterval _claim: ', lastOGClaim);
            setLastOGClaimFormatted(calculateTimeLeft(lastOGClaim));
        }, 1000);
        return () => { clearInterval(timer) }
    }, [ownsOG]);

    useEffect(() => {
        if (EAClaimLoading || OGClaimLoading) return;
        if (EAClaimSuccess || OGClaimSuccess) toast.success('Successfully claimed rewards!');
        if (EAClaimError || OGClaimError) toast.error('Error claiming rewards!');
    }, [EAClaimLoading, OGClaimLoading]);

    return (
        <>
            <Navbar />
            <br />
            <br />
            <br />
            <br />
            <br />

            { !address && <div className='loginWrap'><RaffleLogin heading={'Claim Rewards'} tag={'Connect to claim'}/> </div> }
            { (isLoading && address && !isConnecting) && <div className='loadingWrap'> <Loading /> <h1>Loading...</h1> </div> }

            <div className='claimWrap'>
                {
                    (!isLoading && !isConnecting && address && ownsOG) && <>
                        <div className='claimRow'>
                            <div className='NFTDisplay'>
                                <img src={ NFTImages.OG || 'https://picsum.photos/4/4'} alt='NFT' />
                                { totalOGsOwned > 1 &&
                                    <div className='multiplierWrap'><div className='multiplier'>{'x' + totalOGsOwned}</div></div>
                                }
                            </div>
                            <div className='claimBox'>
                                <div className='claim'>
                                    <h1>Whoopsies Collection Rewards</h1>
                                    <div className='statsRow'>
                                        <div className='stats'>
                                            <h2>{OGClaimable}</h2>
                                            <p>DOOP Claimable</p>
                                        </div>
                                        <div className='stats'>
                                            <h2>{totalOGClaimed}</h2>
                                            <p>DOOP Claimed in Total</p>
                                        </div>
                                    </div>
                                    <p className='info' style={{marginTop: '0.75rem'}}>Current Reward Rate is <span> 5 DOOP </span> per day. </p>
                                    <p className='info'>Claimable every day. </p>
                                    <div className='timeleft'>
                                        <h2 className='timeleftTitle'>Time Left</h2>
                                        <p className='timeleftTag'>till next claim</p>
                                        <div className='time'>
                                            <div className='unit'>
                                                <h2>{lastOGClaimFormatted.hours}</h2>
                                                <p>⠀Hours⠀</p>
                                            </div>
                                            <div className='unit'>
                                                <h2>{lastOGClaimFormatted.minutes}</h2>
                                                <p>Minutes</p>
                                            </div>
                                            <div className='unit'>
                                                <h2>{lastOGClaimFormatted.seconds}</h2>
                                                <p>Seconds</p>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => {OGClaim?.()}}>Claim</button>
                                </div>
                            </div>
                        </div>
                    </>
                }

                {
                    (!isLoading && !isConnecting && address && ownsEA) && <>
                        <div className='claimRow'
                             style={{marginTop: '4rem', marginBottom: '4rem'}}
                        >
                            <div className='NFTDisplay'>
                                <img src={ NFTImages.EA || 'https://picsum.photos/4/4'} alt='NFT' />
                                { totalEAsOwned > 1 &&
                                    <div className='multiplierWrap'><div className='multiplier'>{'x' + totalEAsOwned}</div></div>
                                }
                            </div>
                            <div className='claimBox'>
                                <div className='claim'>
                                    <h1>EA Collection Rewards</h1>
                                    <div className='statsRow'>
                                        <div className='stats'>
                                            <h2>{EAClaimable}</h2>
                                            <p>DOOP Claimable</p>
                                        </div>
                                        <div className='stats'>
                                            <h2>{totalEAClaimed}</h2>
                                            <p>DOOP Claimed in Total</p>
                                        </div>
                                    </div>
                                    <p className='info' style={{marginTop: '0.75rem'}}>Current Reward Rate is <span> 72 DOOP </span> per day. </p>
                                    <p className='info'>Claimable every day. </p>
                                    <div className='timeleft'>
                                        <h2 className='timeleftTitle'>Time Left</h2>
                                        <p className='timeleftTag'>till next claim</p>
                                        <div className='time'>
                                            <div className='unit'>
                                                <h2>{lastEAClaimFormatted.hours}</h2>
                                                <p>⠀Hours⠀</p>
                                            </div>
                                            <div className='unit'>
                                                <h2>{lastEAClaimFormatted.minutes}</h2>
                                                <p>Minutes</p>
                                            </div>
                                            <div className='unit'>
                                                <h2>{lastEAClaimFormatted.seconds}</h2>
                                                <p>Seconds</p>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => {EAClaim?.()}}>Claim</button>
                                </div>
                            </div>
                        </div>
                    </>
                }

                {(!isConnecting && address && (!ownsEA && !ownsOG)) && <>
                    <div className='noNFTs'>
                        <h1>Looks like you are not part of the club yet!</h1>
                        <h2>Get yourself Whoopsies to get extra rewards!</h2>
                    </div>
                </>}
            </div>
        </>
    );
}
