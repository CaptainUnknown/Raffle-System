import React, {useEffect, useState} from "react";
import "./RaffleCard.scss";
import {useNavigate} from "react-router-dom";
import RafflePurchase from "../RafflePurchase/RafflePurchase";
import {
  fetchMetadata,
  getDuration,
  getEndDuration,
  getUserNameFromAddress,
  parseAddress,
  parseImageURI,
  parseName,
  parseRaffleId,
} from "../../context/utils";
import {ReactComponent as Tickets} from "../../assets/icons/ticket.svg";
import {ReactComponent as Ether} from "../../assets/icons/ethereum.svg";

const names = {
  22: "Jarritos #448"
}

function RaffleCard({ raffle }) {
  const navigate = useNavigate();
  const [imageURL, setImageURL] = useState(raffle.img);
  const [purchase, setPurchase] = useState(false);
  const [metadata, setMetadata] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [winner, setWinner] = useState("");

  const getMetadata = async () => {
    let raffleMeta = JSON.parse(localStorage.getItem(`raffleMeta-${raffle.raffleId}`));
    if (raffleMeta === null) raffleMeta = await fetchMetadata(raffle.nftContract, raffle.nftTokenId);
    else console.log(`raffleMeta-${raffle.raffleId} found`, raffleMeta);

    console.log('METADATA _RaffleCard:', raffleMeta);
    await setMetadata(raffleMeta);
    await setImageURL(parseImageURI(raffleMeta.image.cachedUrl));
    localStorage.setItem(`raffleMeta-${raffle.raffleId}`, JSON.stringify(raffleMeta));
    await setIsLoading(false);
    if(raffle.hasEnded) setWinner(await getUserNameFromAddress(raffle.winner));
  };

  useEffect(() => {
    getMetadata();
    // eslint-disable-next-line
  }, []);

  const openInfo = (id) => {
    navigate(`/raffle/${id}`);
  };

  const switchPurchaseModal = (event) => {
    event.stopPropagation();
    setPurchase(!purchase);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // === JSX ===
  const cardTop = () => {
    return <>
      <div className="statusTop">
        <div className="raffleId">{parseRaffleId(raffle.raffleId)}</div>
      </div>
      <div className="status" style={{ backgroundImage: `url(${imageURL})` }}>
        {!raffle.hasEnded ? (
            <>
              <div className="participants">
                <Tickets />
                {raffle.participants}
              </div>
              <div className="endingOn">{getDuration(raffle.endTime)}</div>
            </>
        ) : null}
      </div>
    </>
  }
  const priceSection = () => {
    return !raffle.payableWithDoop ? (
        <div className="price">
          <Ether />
          <p>{raffle.price} Eth</p>
        </div>
    ) : (
        <div className="price">
          <p>{raffle.doopPrice} Doop</p>
        </div>
    )
  }
  const cardBottom = () => {
    return raffle.hasEnded ? ( // If Ended
        <>
          <div className="bottom">
            <div className="cardStatus">
              {"Ended " + getEndDuration(raffle.endTime)}
            </div>
            <h2>
              { /* TODO: Use Winner ENS instead of address */ }
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
    )
  }

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
          endtime={raffle.unixEndTime}
        />
      ) : null}
      <div className="card" onClick={() => openInfo(raffle.raffleId)}
           style={{ boxShadow: !raffle.payableWithDoop ? "0 0 10px 4px var(--primary)" : "none" }}
      >
        {cardTop()}

        <div className={`cardBody ${!raffle.payableWithDoop ? 'cardBodyExc' : ''}`}>
          {priceSection()}
          {
            !isLoading ? <span> { names[Number(raffle.raffleId)] || parseName(metadata.name ? metadata.name : metadata.collection.name, metadata) } </span> : null
          }
          {cardBottom()}
        </div>
      </div>
    </>
  );
}

export default RaffleCard;
