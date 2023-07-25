import React, { useState, useEffect } from "react";
import "./RaffleActivity.scss";

import { useMoralis } from "react-moralis";
import { ReactComponent as Link } from "../../assets/icons/externalLink.svg";
import {blockExplorer, openSeaAPIKey, raffleContractAddress} from "../../Constant/constants";
import { ReactComponent as Loading } from "../../assets/icons/loading.svg";
import axios from "axios";
import {useContractRead} from "wagmi";
import {abi} from "../../context/abi";

function RaffleActivity({ activity, isStarted }) {
  const { Moralis, isInitialized } = useMoralis();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [metadata, setMetadata] = useState({});
  const [prize, setPrize] = useState({});
  const [imageURL, setImageURL] = useState("");

  console.log('activity _Activity: ', activity);
  console.log('isStarted _Activity: ', isStarted);

  useEffect(() => {
    if (!isInitialized || !prize.address) return;
    const getMetadata = async () => {
      console.log("getMetadata", prize.address, prize.tokenID);
      const {data} = await axios.get(`https://api.opensea.io/api/v1/asset/${prize.address}/${prize.tokenID}/?include_orders=false`, {
        headers: { "X-API-KEY": openSeaAPIKey },
      });
      await setMetadata(data);
      await setImageURL(data.image_thumbnail_url);
      setIsLoading(false);
    };
    getMetadata();
    // eslint-disable-next-line
  }, [prize, isInitialized]);

  const contractRead = useContractRead({
    addressOrName: raffleContractAddress,
    contractInterface: abi,
    functionName: 'OnGoingRaffles',
    args: [activity.data.raffleId],
    enabled: isExpanded,
    onError(error) {
      console.error('Error reading the raffle:', error);
    },
    onSuccess(data) {
      console.log('Raffle Read _Activity:', data);
      setPrize({
        address: data.rafflePrize.NFTContract,
        tokenID: data.rafflePrize.NFTTokenId,
      });
    },
  });

  const handleExpandClick = () => {
    setIsExpanded(!isExpanded);
    console.log("isExpanded", isExpanded);
  };

  return (
    <>
      <div className="activityWrap">
        <div
          className="activity"
          onClick={handleExpandClick}
          style={{
            borderRadius: isExpanded
              ? "var(--border-radius) var(--border-radius) 0 0"
              : "var(--border-radius)",
          }}
        >
          <h1> {isStarted ? "Raffle Started" : "Raffle Ended"} </h1>
          <p> {new Date(activity.block_timestamp).toLocaleString()} </p>
          <div className="viewButton">
            <Link
              onClick={() => {
                window.open(`${blockExplorer}tx/${activity.transaction_hash}`, "_blank");
              }}
            />
          </div>
        </div>
        <div className={`details ${isExpanded ? "detailsExpanded" : ""}`} style={{ display: isExpanded ? "flex" : "none" }}>
          {isLoading ? (
              <Loading />
          ) : (
            <>
              <div className="detailsInfo">
                <p> Raffle ID: <span>{activity.data.raffleId}</span></p>
                <p> Raffle Name: <span>{metadata.name ?? metadata.collection.name}</span></p>
                <p> Price: <span>{activity.data.price / 10 ** 18}</span></p>
                <p> Prize Detail: <span>{ metadata.description ?? metadata.collection.description ?? 'Not Found' }</span></p>
                {isStarted ? (
                  <>
                    <p> Prize: <span>{activity.data.rafflePrize[0]}</span></p>
                    <p> Ends On: <span>{new Date(activity.data.endTime * 1000).toString()}</span></p>
                  </>
                ) : (
                  <>
                    <p> Winner: <span>{activity.data.winner}</span></p>
                    <p> Prize: <span>{prize.address}</span> </p>
                    <p> Ended On: <span> {new Date(activity.block_timestamp).toLocaleString()}</span> </p>
                  </>
                )}
              </div>
              <img src={imageURL} alt={metadata.name ?? metadata.collection.name} />
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default RaffleActivity;
