import React, { useState, useEffect } from "react";
import "./ListingCard.scss";
import Navbar from "../../components/NavBar/NavBar";

export default function ListingCard() {
    const [imageURL, setImageURL] = useState('https://picsum.photos/512/512');

  return (
    <>
        <div className="buyNowCard">
            <div className="status" style={{ backgroundImage: `url(${imageURL})` }}>
            </div>
        </div>
    </>
  );
}
