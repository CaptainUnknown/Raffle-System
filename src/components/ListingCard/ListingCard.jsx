import React, { useState, useEffect } from "react";
import "./ListingCard.scss";
import { ReactComponent as Ether } from "../../assets/icons/ethereum.svg";
import Navbar from "../../components/NavBar/NavBar";

export default function ListingCard({ listing }) {
  const [imageURL, setImageURL] = useState('https://picsum.photos/512/512');

  const parseId = (id) => {
    const idStr = id.toString();
    if (idStr.length >= 3) return idStr;
    return "0".repeat(3 - idStr.length) + idStr;
  };

  return (
      <>
        <div className="listingCard">

          <div className="statusTop">
            <div className="raffleId">{ parseId(listing.id) }</div>
          </div>
          <div className="status" style={{ /* backgroundImage: `url(${listing.image})` */ }}>
            <div className="price"> <Ether/> { listing.price } </div>
          </div>

          <div className="cardBody">
            { listing.name }
          </div>
        </div>
      </>
  );
}
