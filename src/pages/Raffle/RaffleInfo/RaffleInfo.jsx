import React, { useEffect, useState } from "react";
import "./RaffleInfo.scss";
import { useParams } from "react-router-dom";
import { useContractRead } from "wagmi";
import Navbar from "../../../components/NavBar/NavBar";
import RafflePurchase from "../../../components/RafflePurchase/RafflePurchase";
import RaffleRecentPurchases from "../../../components/RaffleRecentPurchases/RaffleRecentPurchases";
import { openSeaAPIKey, raffleContractAddress} from "../../../Constant/constants";
import { abi } from "../../../context/abi";
import { useMoralis } from "react-moralis";
import { ReactComponent as Loading } from "../../../assets/icons/loading.svg";
import { ReactComponent as Twitter } from "../../../assets/icons/twitter.svg";
import { ReactComponent as Tickets } from "../../../assets/icons/ticket.svg";
import { ReactComponent as Clock } from "../../../assets/icons/clock.svg";
import axios from "axios";

function RaffleInfo() {
  const { id } = useParams();
  const { Moralis, isInitialized } = useMoralis();

  const [raffle, setRaffle] = useState({});
  const [imageURL, setImageURL] = useState("https://picsum.photos/2/2?random=8");
  const [metadata, setMetadata] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [winner, setWinner] = useState({});
  const [purchasable, setPurchasable] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);

  useContractRead({
    addressOrName: raffleContractAddress,
    contractInterface: abi,
    functionName: 'OnGoingRaffles',
    args: [id],
    onError(error) {
      console.error('Error reading Raffle Info _raffleInfo:', error);
    },
    onSuccess(data) {
      const raffleTemp = {
        raffleId: data.raffleId,
        price: data.ethPrice / 10**18,
        doopPrice: data.doopPrice / 10**18,
        payableWithDoop: data.payableWithDoop,
        img: "https://picsum.photos/2/2",
        endTime: new Date(data.endTime * 1000),
        hasEnded: data.hasEnded,
        winner: data.winner,
        participants: data.entriesCount,
        nftContract: data.rafflePrize.NFTContract,
        nftTokenId: data.rafflePrize.NFTTokenId,
      };

      const now = new Date();
      const endDate = new Date(raffleTemp.endTime);
      const diff = endDate - now;
      if (diff < 0) setPurchasable(false);
      setRaffle(raffleTemp);

      (async () => {
        if(raffleTemp.hasEnded) {
          const {data} = await axios.get(`https://api.opensea.io/user/${raffleTemp.winner}`, {
            headers: { "X-API-KEY": openSeaAPIKey },
          });
          setWinner(data);
        }
      })();
    },
  });

  const getMetadata = async () => {
    const {data} = await axios.get(`https://api.opensea.io/api/v1/asset/${raffle.nftContract}/${raffle.nftTokenId}/?include_orders=false`, {
      headers: { "X-API-KEY": openSeaAPIKey },
    });
    await setMetadata(data);
    await setImageURL(data.image_thumbnail_url);
    await setIsLoading(false);
  };

  useEffect(() => {
    if (!isInitialized) return;
    getMetadata();
    // eslint-disable-next-line
  }, [raffle]);

  useEffect(() => {
    if (isLoading) return;
    document.title = `${metadata.name ?? metadata.collection.name } | Raffle`;
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => {
      clearInterval(timer);
      document.title = "Whoopsies Doopsies";
    }
  }, [isLoading]);

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

  const parseAddress = (address) => {
    if (address === null) return "N/A";
    if (address.length <= 18) return address;
    return address.slice(0, 6) + "..." + address.slice(-4);
  };

  const getEndDuration = (date) => {
    const now = new Date();
    const endDate = new Date(date);
    const diff = endDate - now;
    const days = Math.floor(diff / 1000 / 60 / 60 / 24);
    if (diff > 0) return days + " Days Left";
    else if (days === 0) return "Ended Today";
    return days * -1 + ` Day${days * -1 > 1 ? 's' : ''} ago`;
  };

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
    const url = metadata.permalink;
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
          {isLoading ? (
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
                    <span className="titleName" onClick={openOnOpensea}> {metadata.name ?? metadata.collection.name }</span>
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
                    <p>{ metadata.description ?? metadata.collection.description ?? 'Not Found' }</p>
                    <h2 style={{ marginTop: "1rem" }}>Attributes</h2>
                    <div className="divider"></div>
                    {metadata.traits.length === 0 ?
                        <div className="attributeProperty" style={{justifyContent: "center"}}>
                          <h1> None Found </h1>
                        </div> :
                        metadata.traits.map((property, index) => (
                            <div
                                className="attributeProperty"
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
                      Raffle: <span onClick={openOnOpensea}> {metadata.name ?? metadata.collection.name }</span>
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
                        />
                    ) : (
                        <>
                          <div className="raffleInfoWinner" onClick={winner.username ? openOnOpenseaUser : null}
                               style={{ cursor: winner.username ? 'pointer' : null }}>
                            <h1>Winner</h1>
                            <div>
                              {
                                  raffle.hasEnded &&
                                  <img src={winner.username ? winner.account.profile_img_url : 'https://picsum.photos/4/4'} alt="Winner Avatar" />
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
