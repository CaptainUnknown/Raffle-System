import React, { useState } from "react";

import styles from "./styles.module.scss";

import trending from "../../assets/whoopsiesDash.png";
import minting from "../../assets/whoopsiesDashDiscover.png";
import rarity from "../../assets/whoopsiesRarity.png";
import { Link } from "react-router-dom";

export default function AboutDashBoard() {
  const [slide, setSlide] = useState(0);

  const incrementSlide = () => {
    if (slide < 2) {
      setSlide(slide + 1);
    } else {
      setSlide(0);
    }
  };

  const decrementSlide = () => {
    if (slide > 0) {
      setSlide(slide - 1);
    } else {
      setSlide(2);
    }
  };

  return (
    <div className={styles.aboutDashContainer}>
      <div className={styles.trendingContainer}>
        <div className={styles.trendingDescription}>
          <div>
            <h2 className={slide === 0 ? styles.headerActivePrim : styles.header}>
              Each Whoopsie gives you access to discounted & FREE NFT Raffles
            </h2>
            <h2 className={slide === 1 ? styles.headerActivePrim : styles.header}>
              DISCOVER MINTING COLLECTIONS
            </h2>
            <h2 className={slide === 2 ? styles.headerActivePrim : styles.header}>
              COLLECTION RARITY
            </h2>
            <h3 className={slide === 0 ? styles.headerActive : styles.header}>
              While OG Whoopsies enables discounted prices - EA Passes increases
              your discounts even more!
            </h3>
            <h3 className={slide === 1 ? styles.headerActive : styles.header}>
              Discover recently minting projects for you to join in on.
            </h3>
            <h3 className={slide === 2 ? styles.headerActive : styles.header}>
              Check The Rarity Ranking And Current Stats Of Supported
              Collections.
            </h3>
          </div>
          <h2 className={styles.trendingDetail}>
            Every Whoopsie owner ( NFT holder) gains privileged access to unique
            experiences, events, intellectual property licensing possibilities,
            and more. Join us today to be a part of exclusive journey.
          </h2>
          <div className={styles.actions}>
            <Link to="/dashboard" className={styles.button}>
              Dashboard
            </Link>
            <a
              href="https://opensea.io/collection/whoopsies"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.button}
            >
              Magic Eden
            </a>
          </div>

        </div>
        <div className={styles.trendingImageContainer}>
          <img
            className={slide === 0 ? styles.imgActive : styles.img}
            src={trending}
            alt="trending nfts"
          />
          <img
            className={slide === 1 ? styles.imgActive : styles.img}
            src={minting}
            alt="trending nfts"
          />
          <img
            className={slide === 2 ? styles.imgActive : styles.img}
            src={rarity}
            alt="trending nfts"
          />
        </div>
        <button onClick={() => incrementSlide()} className={styles.buttonNext}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path d="M7.33 24l-2.83-2.829 9.339-9.175-9.339-9.167 2.83-2.829 12.17 11.996z" />
          </svg>
        </button>
        <button onClick={() => decrementSlide()} className={styles.buttonLast}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path d="M7.33 24l-2.83-2.829 9.339-9.175-9.339-9.167 2.83-2.829 12.17 11.996z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
