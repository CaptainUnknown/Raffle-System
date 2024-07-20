/* global BigInt */
import React, { useState, useEffect } from "react";
import "./Claim.scss";
import {useAccount, useContractRead, useContractWrite} from "wagmi";
import {toast} from "react-toastify";
import axios from "axios";
import RaffleLogin from "../../components/RaffleLogin/RaffleLogin";
import Navbar from "../../components/NavBar/NavBar";
import {
    EAClaimAddress,
    whoopAddress,
    eaAddress, rpcURL,
} from "../../Constant/constants";
import {claimABI} from "../../context/claimABI";
import {EAABI} from "../../context/EAABI";
import {ReactComponent as Loading} from "../../assets/icons/loading.svg";
import {whoopsiesAbi} from "../../context/whoopsiesAbi";

export default function Claim() {
    const { address, isConnecting } = useAccount();
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
    const chainId = 42170;

    /**
     * @dev Reads
     */
    // Owns EA Read
    useContractRead({
        address: eaAddress,
        abi: EAABI,
        functionName: 'balanceOf',
        args: [address],
        chainId: chainId,
        onError(error) {
            console.error('Owns EA error _claim: ', error);
        },
        onSuccess(data) {
            console.log('Owns EA _claim: ', Number(data));
            setOwnsEA(0 < Number(data));
            setTotalEAsOwned(Number(data));
        },
    });

    // Owns OG Read
    useContractRead({
        address: whoopAddress,
        abi: whoopsiesAbi,
        functionName: 'balanceOf',
        args: [address],
        chainId: chainId,
        onError(error) {
            console.error('Owns OG error _claim: ', error);
        },
        onSuccess(data) {
            console.log('Owns OG _claim: ', Number(data));
            setOwnsOG(0 < Number(data));
            setTotalOGsOwned(Number(data));
        },
    });

    // EA Claimable Read
    useContractRead({
        address: EAClaimAddress,
        abi: claimABI,
        functionName: 'getClaimable',
        args: [address],
        chainId: chainId,
        onError(error) {
            console.error('EA Claimable error _claim: ', error);
        },
        onSuccess(data) {
            console.log('EA Claimable _claim: ', data);
            setEAClaimable((Number(data) / 10 ** 18).toFixed(0));
        },
    });

    // OG Claimable
    useContractRead({
        address: whoopAddress,
        abi: whoopsiesAbi,
        functionName: 'retrieveClaimableDoop',
        args: [address],
        chainId: chainId,
        account: address,
        onError(error) {
            console.error('OG Claimable error _claim: ', error);
        },
        onSuccess(data) {
            console.log('OG Claimable _claim: ', Number(data) / 10 ** 18);
            setOGClaimable((Number(data) / 10 ** 18).toFixed(0));
        },
    });

    // EA Last Claimed
    useContractRead({
        address: EAClaimAddress,
        abi: claimABI,
        functionName: 'previousTime',
        args: [address],
        chainId: chainId,
        onError(error) {
            console.error('Last EA Claimed error _claim: ', error);
        },
        onSuccess(data) {
            console.log('Last EA Claimed _useContractRead _claim: ', Number(data));
            setLastEAClaim(Number(data) * 1000);
        },
    });

    // OG Last Claimed
    useContractRead({
        address: whoopAddress,
        abi: whoopsiesAbi,
        functionName: 'lastDoopClaimTime',
        args: [address],
        chainId: chainId,
        onError(error) {
            console.error('Last OG Claimed error _claim: ', error);
        },
        onSuccess(data) {
            console.log('Last OG Claimed _useContractRead _claim: ', BigInt(data).toString().slice(0, -18));
            setLastOGClaim(Number(data) * 1000);
        },
    });

    // EA Total Claimed
    useContractRead({
        address: EAClaimAddress,
        abi: claimABI,
        functionName: 'totalClaimed',
        args: [address],
        chainId: chainId,
        onError(error) {
            console.error('Total EA Claimed error _claim: ', error);
            console.error('Address: ', address);
        },
        onSuccess(data) {
            console.log('Total EA Claimed _claim: ', Number(data));
            setTotalEAClaimed(Number(data));
        },
    });

    // OG Total Claimed
    useContractRead({
        address: whoopAddress,
        abi: whoopsiesAbi,
        functionName: 'totalClaimed',
        args: [address],
        chainId: chainId,
        onError(error) {
            console.error('Total OG Claimed error _claim: ', error);
        },
        onSuccess(data) {
            console.log('Total OG Claimed _claim: ', BigInt(data).toString().slice(0, -18));
            setTotalOGClaimed(Number(data));
        },
    });

    /**
     * @dev Writes
     */
    // EA Claim
    const {data: EAClaimResponse, isLoading: EAClaimLoading, isError: EAClaimError, write: EAClaim, isSuccess: EAClaimSuccess } = useContractWrite({
            address: EAClaimAddress,
            abi: claimABI,
            functionName: "claim",
            chainId: chainId,
            account: address,
            onError(error) { toast.error(error.reason.replace(/execution reverted: /g, "")) },
            onSuccess(data) { toast.info("Claiming rewards...") },
        });

    // OG Claim
    const {data: OGClaimResponse, isLoading: OGClaimLoading, isError: OGClaimError, write: OGClaim, isSuccess: OGClaimSuccess } = useContractWrite({
        address: whoopAddress,
        abi: whoopsiesAbi,
        functionName: "claimDoop",
        chainId: chainId,
        account: address,
        onError(error) {
            toast.error(error.reason.replace(/execution reverted: /g, ""))
            console.log("Error occurred while claiming doop", error);
        },
        onSuccess(data) { toast.info("Claiming rewards...") },
    });

    useEffect(() => {
        const OGOwned = [];
        const EAOwned = [];
        (async () => {
            let allRawNFTs = [];
            let pageSize = 0;
            let pageKey;
            while (true) {
                let url;
                if (pageSize === 0) url = `${rpcURL}/getNFTs/?owner=${address}`;
                else url = `${rpcURL}/getNFTs/?owner=${address}&pageKey=${pageKey}`;
                const {data} = await axios({ method: 'get', url: url });
                pageSize = data.ownedNfts.length;
                pageKey = data.pageKey;
                allRawNFTs = [...allRawNFTs, ...data.ownedNfts];
                if (pageSize < 100) break;
            }
            console.log("All owned NFTs", allRawNFTs);
            for (const nft of allRawNFTs) {
                if (nft.contract.address.toLowerCase() === whoopAddress.toLowerCase()) {
                    console.log("Whoopsies Found", nft);
                    const tokenID = parseInt(nft.id.tokenId, 0);
                    OGOwned.push({
                        imageUrl: nft.media[0].gateway
                    });
                } else if (nft.contract.address.toLowerCase() === eaAddress.toLowerCase()) {
                    console.log("EA Found", nft);
                    const tokenID = parseInt(nft.id.tokenId, 0);
                    EAOwned.push({
                        imageUrl: `https://storage.googleapis.com/nftimagebucket/tokens/0x8ad1bfab08fc8f5664cca46e5e1c69b2f4619645/preview/${tokenID}.png`
                    });
                }
            }
            const images = {EA: EAOwned[Math.floor(Math.random() * EAOwned.length)]?.imageUrl || '', OG: OGOwned[Math.floor(Math.random() * EAOwned.length)]?.imageUrl || ''};
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
