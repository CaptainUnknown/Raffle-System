import React, { useEffect, useState } from "react";
import "./RaffleInfo.scss";
import { useParams } from "react-router-dom";
import {useContractRead} from "wagmi";
import Navbar from "../../../components/NavBar/NavBar";
import RafflePurchase from "../../../components/RafflePurchase/RafflePurchase";
import RaffleRecentPurchases from "../../../components/RaffleRecentPurchases/RaffleRecentPurchases";
import {
  raffleContractAddress,
  raffleContractAddress_OLD
} from "../../../Constant/constants";
import { abi } from "../../../context/abi";
import { raffleAbiL2 } from "../../../context/raffleAbiL2";
import { parseImageURI, parseAddress, getEndDuration,
  getUserNameFromAddress, fetchMetadata } from "../../../context/utils";
import { ReactComponent as Loading } from "../../../assets/icons/loading.svg";
import { ReactComponent as Twitter } from "../../../assets/icons/twitter.svg";
import { ReactComponent as Tickets } from "../../../assets/icons/ticket.svg";
import { ReactComponent as Clock } from "../../../assets/icons/clock.svg";
import {ethers} from "ethers"

function RaffleInfo() {
  const { id } = useParams();
  const [raffle, setRaffle] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [imageURL, setImageURL] = useState("https://picsum.photos/2/2?random=8");
  const [isLoading, setIsLoading] = useState(true);
  const [winner, setWinner] = useState({});
  const [purchasable, setPurchasable] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);

  useContractRead({
    address: parseInt(id) < 19 ? raffleContractAddress_OLD : raffleContractAddress,
    abi: parseInt(id) < 19 ? abi : raffleAbiL2,
    functionName: 'OnGoingRaffles',
    args: [parseInt(id)],
    chainId: parseInt(id) < 19 ? 1 : 42170,
    onError(error) {
      console.error('Error reading Raffle Info _raffleInfo:', error);
    },
    onSuccess(data) {
      const raffleTemp = {
        raffleId: data[0],
        price: ethers.utils.formatEther(data[1].toString()),
        doopPrice: ethers.utils.formatEther(data[2].toString()),
        payableWithDoop: data[5],
        img: "https://picsum.photos/2/2",
        endTime: new Date(Number(data[3]) * 1000),
        unixEndTime: Number(data[3]),
        hasEnded: data[6],
        winner: data[7],
        participants: data[4],
        nftContract: data[8].NFTContract,
        nftContract_L2: parseInt < 19 ? "" : data[8].NFTContract_L2,
        nftTokenId: data[8].NFTTokenId,
        nftTokenId_L2: parseInt < 19 ? "" : data[8].NFTTokenId_L2
      };

      (async () => {
        if (raffle !== null) return;
        await setRaffle(raffleTemp);
        console.log('Raffle Fetched: ', raffleTemp);
      })();
    },
  });

  const getMetadata = async () => {
    let raffleMeta = JSON.parse(localStorage.getItem(`raffleMeta-${parseInt(id)}`));
    if (raffleMeta === null) raffleMeta = await fetchMetadata(raffle.nftContract, raffle.nftTokenId);
    else console.log(`raffleMeta-${parseInt(id)} found`, raffleMeta);

    await setMetadata(raffleMeta);
    await setImageURL(parseImageURI(raffleMeta.image.cachedUrl));
    await setIsLoading(false);

    const now = new Date();
    const endDate = new Date(raffle.endTime);
    const diff = endDate - now;
    if (diff < 0) setPurchasable(false);
    if(raffle.hasEnded) setWinner(await getUserNameFromAddress(raffle.winner, true));
  }

  useEffect(() => {
    (async () => {
      const rafflesCached = JSON.parse(localStorage.getItem(`raffles`));
      if (rafflesCached !== null && rafflesCached.includes(parseInt(id))) await setRaffle(rafflesCached[parseInt(id)]);
      console.log('Raffle Found: ', rafflesCached[parseInt(id)]);
    })();
  }, []);

  useEffect(() => {
    if (raffle === null) return;
    getMetadata();
  }, [raffle])

  useEffect(() => {
    if (isLoading || raffle === null) return;
    document.title = `${metadata.name ?? metadata.collection.name } | Raffle`;
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => {
      clearInterval(timer);
      document.title = "Whoopsies Doopsies";
    }
  }, [isLoading, raffle]);

  function calculateTimeLeft() {
    const difference = raffle.endTime - Date.now();
    const parseValues = (val) => {
      const idStr = val.toString();
      if (idStr.length >= 2) return idStr;
      return "0".repeat(2 - idStr.length) + idStr;
    };

    if (!raffle.hasEnded && difference > 0) {
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      if (days === 0) return `${parseValues(hours)}h ${parseValues(minutes)}m ${parseValues(seconds)}s`;
      if (days === 0 && hours === 0) return `${parseValues(minutes)}m ${parseValues(seconds)}s`;
      if (days === 0 && hours === 0 && minutes === 0) return `${parseValues(seconds)}s`;
      else return `${parseValues(days)}d ${parseValues(hours)}h ${parseValues(minutes)}m ${parseValues(seconds)}s`;
    }
    return 'Closing...';
  }

  const shareOnTwitter = (event) => {
    const url = window.location.href;
    const shareUrlIfOnGoing = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`I just entered a raffle for a ${metadata.name ?? metadata.collection.name} on Whoopdoop!\n\nFeeling lucky? Join and get a chance to win this NFT for only ${raffle.payableWithDoop ? raffle.doopPrice + ' $DOOP': raffle.price + ' $ETH'}!\n\n`)}`;
    const shareUrlIfEnded = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`Raffle for a ${metadata.name ?? metadata.collection.name} on Whoopdoop, just ended ${getEndDuration(raffle.endTime)}.\n\n`)}`;

    event.preventDefault();
    const shareUrl = raffle.hasEnded ? shareUrlIfEnded : shareUrlIfOnGoing;
    window.open(shareUrl, '_blank');
  }
  const openOnEtherscan = (event) => {
    event.preventDefault();
    const url = `https://etherscan.io/nft/${raffle.nftContract}/${raffle.nftTokenId}`;
    window.open(url, '_blank');
  }
  const openOnOpensea = (event) => {
    event.preventDefault();
    const url = `https://opensea.io/assets/ethereum/${raffle.nftContract}/${raffle.nftTokenId}`;
    window.open(url, '_blank');
  }
  const openOnOpenseaUser = (event) => {
    event.preventDefault();
    const url = `https://opensea.io/${winner.username}`;
    window.open(url, '_blank');
  }

  return (
      <>
        <Navbar />
        <br />

        <div
            className="raffleInfo"
            style={{ alignItems: isLoading ? "center" : "flex-start" }}
        >
          {isLoading || raffle === null || metadata === null ? (
              <div className='loadingWrap'>
                <Loading />
                <h1>Loading...</h1>
              </div>
          ) : (
              <>
                <div className="infoPanel">
                  <div className="infoPanelLeft">
                    <h1
                        className="title"
                        style={{ position: "relative", top: "-12px" }}
                    >
                      Raffle:
                    </h1>
                    <span className="titleName" onClick={openOnOpensea}> {metadata.name !== null ? metadata.name : metadata.collection.name}</span>
                    <img src={imageURL} alt="NFT"
                         onClick={openOnOpensea}
                    />
                    <div className="participants">
                      <div>
                        <Tickets />
                        {raffle.participants}
                      </div>
                      <div>
                        <Clock style={{ width: "20px" }} />
                        {!raffle.hasEnded
                            ? timeLeft
                            : "Ended " + getEndDuration(raffle.endTime)}
                      </div>
                    </div>
                    <h2>Description</h2>
                    <div className="divider"></div>
                    <p>{ metadata.description !== null ? metadata.description : metadata.collection.description ?? 'Not Found' }</p>
                    <h2 style={{ marginTop: "1rem" }}>Attributes</h2>
                    <div className="divider"></div>
                    {metadata.raw.metadata.attributes === 0 ?
                        <div className="attributeProperty" style={{justifyContent: "center"}}>
                          <h1> None Found </h1>
                        </div> :
                        metadata.raw.metadata.attributes.map((property, index) => (
                            <div
                                className="attributeProperty" key={index}
                                style={{
                                  display: "flex",
                                  flexDirection: "row",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  margin: "0",
                                }}
                            >
                              <h1>{property.trait_type}: </h1>
                              <span>{property.value}</span>
                            </div>
                        ))}
                    <RaffleRecentPurchases raffleId={id}/>
                  </div>
                  <div className="infoPanelRight">
                    <h1
                        className="title"
                        style={{ position: "relative", top: "-12px" }}
                    >
                      Raffle: <span onClick={openOnOpensea}> {metadata.name !== null ? metadata.name : metadata.collection.name}</span>
                    </h1>
                    <div className="divider"></div>
                    <div className="share" onClick={openOnEtherscan}>
                      {" "}
                      Status: <span>{raffle.hasEnded ? "Ended" : "On Going"}</span>
                    </div>
                    {purchasable ? (
                        <RafflePurchase
                            raffleId={raffle.raffleId}
                            price={raffle.raffleId === '0' ? 1:raffle.price}
                            doopPrice={raffle.raffleId === '0' ? 1:raffle.doopPrice}
                            isPurchasableWithDoop={raffle.payableWithDoop}
                            isModal={false}
                            endtime={raffle.unixEndTime}
                        />
                    ) : (
                        <>
                          <div className="raffleInfoWinner" onClick={winner.username ? openOnOpenseaUser : null}
                               style={{ cursor: winner.username ? 'pointer' : null }}>
                            <h1>Winner</h1>
                            <div>
                              {
                                  raffle.hasEnded &&
                                  <img src={winner.username ? winner.profile_image_url : 'https://picsum.photos/4/4'} alt="Winner Avatar" />
                              }
                              <span>{raffle.hasEnded ? winner.username ? parseAddress(winner.username) : parseAddress(raffle.winner) : 'Not Closed Yet'}</span>
                            </div>
                          </div>
                        </>
                    )}
                    <div className="share" onClick={shareOnTwitter}>
                      {" "}
                      Share this Raffle <Twitter />
                    </div>
                  </div>
                </div>
              </>
          )}
        </div>
      </>
  );
}

export default RaffleInfo;
