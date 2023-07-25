import React, {useEffect, useState} from "react";
import "./RaffleCard.scss";
import {useMoralis} from "react-moralis";
import {useNavigate} from "react-router-dom";
import RafflePurchase from "../RafflePurchase/RafflePurchase";
import RaffleContract from "../../context/interact";
import {ReactComponent as Tickets} from "../../assets/icons/ticket.svg";
import {ReactComponent as Ether} from "../../assets/icons/ethereum.svg";
import axios from "axios";
import {openSeaAPIKey} from "../../Constant/constants";

function RaffleCard({ raffle, meta }) {
  const navigate = useNavigate();
  const { Moralis, isInitialized } = useMoralis();

  const [imageURL, setImageURL] = useState(raffle.img);
  const [purchase, setPurchase] = useState(false);
  const [metadata, setMetadata] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [tickets, setTickets] = useState(null);
  const [winner, setWinner] = useState("");

  const getMetadata = async () => {
    console.log('metadata from RaffleCard', meta);
    await setMetadata(meta);
    await setImageURL(meta.image_thumbnail_url);
    await setIsLoading(false);

    const reverseENS = async (address) => {
      const contract = new RaffleContract();
      const res = await contract.getENS(address);
      return res === null ? address : res;
    };

    const updateTicketCount = async () => {
      const contract = new RaffleContract();
      const res = await contract.getTotalEntries(raffle.raffleId);
      setTickets(res);
    };

    if(raffle.hasEnded) {
      // const {data} = await axios.get(`https://api.opensea.io/user/${raffle.winner}`, {
      //   headers: { "X-API-KEY": openSeaAPIKey },
      // });
      // console.log("opensea /user: ", data);
      // setWinner(data.username ? data.username : raffle.winner);
      const res = await reverseENS(raffle.winner);
      setWinner(res);
      console.log("Winner: ", res);
    }
    await updateTicketCount();
  };

  useEffect(() => {
    if (!isInitialized) return;
    getMetadata();
    // eslint-disable-next-line
  }, [isInitialized]);

  const openInfo = (id) => {
    navigate(`/raffle/${id}`);
  };

  const parseRaffleId = (id) => {
    const idStr = id.toString();
    if (idStr.length >= 3) return idStr;
    return "0".repeat(3 - idStr.length) + idStr;
  };

  const parseName = (name) => {
    if (name.length <= 20) return name;
    return name.slice(0, 17) + "...";
  }

  const parseAddress = (address) => {
    if (address === null) return "N/A";
    if (address.length <= 18) return address;
    return address.slice(0, 6) + "..." + address.slice(-4);
  };

  const getDuration = (date) => {
    const now = new Date();
    const endDate = new Date(date);
    const diff = endDate - now;
    const days = Math.floor(diff / 1000 / 60 / 60 / 24);
    if (diff < 0) return "Closing...";
    else if (days === 0) return "Ending Today";
    return days + ` Day${days > 1 ? 's' : ''} Left`;
  };

  const getEndDuration = (date) => {
    const now = new Date();
    const endDate = new Date(date);
    const diff = endDate - now;
    const days = Math.floor(diff / 1000 / 60 / 60 / 24);
    if (diff > 0) return days + " Days Left";
    else if (days === 0) return "Ended Today";
    return days * -1 + ` Day${days*-1 > 1 ? 's' : ''} ago`;
  };

  const switchPurchaseModal = (event) => {
    event.stopPropagation();
    setPurchase(!purchase);
  };

  return (
    <>
      {purchase ? (
        <RafflePurchase
          raffleId={raffle.raffleId}
          price={raffle.raffleId === '0' ? 1:raffle.price}
          doopPrice={raffle.raffleId === '0' ? 1:raffle.doopPrice}
          isPurchasableWithDoop={raffle.payableWithDoop}
          switchModal={switchPurchaseModal}
          isModal={true}
        />
      ) : null}
      <div className="card" onClick={() => openInfo(raffle.raffleId)}
           style={{ boxShadow: !raffle.payableWithDoop ? "0 0 10px 4px var(--primary)" : "none" }}
      >
        <div className="statusTop">
          <div className="raffleId">{parseRaffleId(raffle.raffleId)}</div>
        </div>
        <div className="status" style={{ backgroundImage: `url(${imageURL})` }}>
          {!raffle.hasEnded ? (
            <>
              <div className="participants">
                <Tickets />
                {tickets === null ? raffle.participants : tickets}
              </div>
              <div className="endingOn">{getDuration(raffle.endTime)}</div>
            </>
          ) : null}
        </div>

        <div className={`cardBody ${!raffle.payableWithDoop ? 'cardBodyExc' : ''}`}>
          {!raffle.payableWithDoop ? (
            <div className="price">
              <Ether />
              <p>{raffle.price} Eth</p>
            </div>
          ) : (
            <div className="price">
              <p>{raffle.doopPrice} Doop</p>
            </div>
          )}
          {
            !isLoading ?
              <span> { parseName(metadata.name ? metadata.name : metadata.collection.name) } </span> : null
          }
          {raffle.hasEnded ? ( //If Ended
            <>
              <div className="bottom">
                <div className="cardStatus">
                  {"Ended " + getEndDuration(raffle.endTime)}
                </div>
                <h2>
                  {" " // TODO: Use Winner ENS instead of address
                  }
                  Won By: <span> {winner ? parseAddress(winner) : parseAddress(raffle.winner)} </span>
                </h2>
              </div>
            </> // If on going
          ) : (
            <>
              <div className="bottom">
                <button onClick={switchPurchaseModal}> Enter Now </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default RaffleCard;
