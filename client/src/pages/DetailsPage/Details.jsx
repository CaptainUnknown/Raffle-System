import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import NavBar from "../../components/NavBar/NavBar";
import NotFound from "../../components/NotFound/NotFound";
import useRanking from "../../Hooks/useRanking";
import { openSeaAPIKey } from "../../Constant/constants";

import styles from "./styles.module.scss";

const wei = 0.000000000000000001;
const ethImg =
  "https://openseauserdata.com/files/6f8e2979d428180222796ff4a33ab929.svg";
const loadingArr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

export default function Details() {
  const { id } = useParams();
  const { getRanking } = useRanking();
  const [nft, setNft] = useState();
  const [nextItem, setNextItem] = useState(null);
  const [prevItem, setPrevItem] = useState(null);
  const [rank, setRank] = useState(0);
  const [rarityScore, setRarityScore] = useState(0);
  const [attributes, setAttributes] = useState(null);
  const [price, setPrice] = useState(0);
  const [newId, setNewId] = useState(id);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchNft = async () => {
    setLoading(true);
    let err = false;
    const options = {
      method: "GET",
      headers: { "X-API-KEY": openSeaAPIKey },
    };
    let url = `https://api.opensea.io/api/v1/asset/0x646Eb9B8E6bED62c0e46b67f3EfdEF926Fb9D621/${id}/?include_orders=false`;
    await fetch(url, options)
      .then((response) => response.json())
      .then((response) => {
        response.success === false ? (err = true) : setNft(response);
      })
      .catch((e) => {
        err = true;
        console.log(e);
      });
    if (!err) {
      fetchCurrentPrice();
      let result = await getRanking(
        id,
        "0x646Eb9B8E6bED62c0e46b67f3EfdEF926Fb9D621"
      );
      setRank(result[0].Rank);
      setRarityScore(result[0].Rarity.toFixed(2));
      setAttributes(result[0].Attributes);
      id < 6125 && setNextItem(parseFloat(id) + 1);
      id > 0 && setPrevItem(parseFloat(id) - 1);
    }
    setError(err);
    setLoading(false);
  };

  const fetchCurrentPrice = async () => {
    const options = {
      method: "GET",
      headers: { "X-API-KEY": openSeaAPIKey },
    };
    let url = `https://api.opensea.io/api/v1/asset/0x646Eb9B8E6bED62c0e46b67f3EfdEF926Fb9D621/${id}/listings?limit=1`;

    fetch(url, options)
      .then((response) => response.json())
      .then((response) => {
        if (response.listings && response.listings.length > 0) {
          setPrice((response?.listings[0].current_price * wei).toFixed(2));
        } else if (
          response.seaport_listings &&
          response.seaport_listings.length > 0
        ) {
          setPrice(
            (response.seaport_listings[0].current_price * wei).toFixed(2)
          );
        } else {
          setPrice(0);
        }
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    if (id > 6124 || id < 0) {
      setNotFound(true);
    } else {
      fetchNft();
    }
    // eslint-disable-next-line
  }, [id]);

  return (
    <>
      <NavBar />
      {nft && !error ? (
        <div className={styles.detailsContainer}>
          <div className={styles.itemContainer}>
            <div
              className={`${
                nft.traits[0].trait_type === "1 of 1"
                  ? "oneofOne"
                  : nft.traits.filter(
                      (trait) => trait.trait_type === "Faction"
                    )[0].value
              }Details`}
            >
              {id < 6124 && (
                <Link
                  to={`/details/${nextItem}`}
                  className={styles.rightButton}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                    <path
                      fillRule="evenodd"
                      d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
                    />
                  </svg>
                </Link>
              )}
              {id > 1 && (
                <Link to={`/details/${prevItem}`} className={styles.leftButton}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                    <path
                      fillRule="evenodd"
                      d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"
                    />
                  </svg>
                </Link>
              )}
              {!loading && <img src={nft.image_url} alt="nft thumbnail" />}
              {loading && <div className={styles.imgLoader}></div>}
            </div>
            <div className={styles.aboutContainer}>
              <h2>{nft.name}</h2>
              {price !== 0 && (
                <div className={styles.priceContainer}>
                  <img src={ethImg} alt="ethereum logo" />
                  <h2>{price}</h2>
                </div>
              )}
            </div>

            <div className={styles.ranking}>
              {!loading && (
                <div
                  className={
                    rank < 2000
                      ? styles.rare
                      : rank < 3500
                      ? styles.medRare
                      : styles.rank
                  }
                >
                  <h4>Rarity Rank</h4>
                  <h2>#{rank}</h2>
                </div>
              )}
              {loading && (
                <div className={styles.rank}>
                  <h4>Rarity Rank</h4>
                  <div className={styles.rankLoader}></div>
                </div>
              )}
              {!loading && (
                <div
                  className={
                    rank < 2000
                      ? styles.rare
                      : rank < 3500
                      ? styles.medRare
                      : styles.rank
                  }
                >
                  <h4>Rarity Score</h4>
                  <h2>{rarityScore}</h2>
                </div>
              )}
              {loading && (
                <div
                  className={
                    rank < 2000
                      ? styles.rare
                      : rank < 3500
                      ? styles.medRare
                      : styles.rank
                  }
                >
                  <h4>Rarity Score</h4>
                  <div className={styles.rankLoader}></div>
                </div>
              )}
            </div>
            <a
              className={styles.buyButton}
              href={nft.permalink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 90 90"
                version="1.1"
                id="svg20"
              >
                <defs id="defs24" />
                <path d="M 5.3807274,51.36189 5.6946917,50.816135 24.620335,18.058313 c 0.276457,-0.479749 0.926858,-0.430022 1.13606,0.09087 3.161791,7.840196 5.889983,17.590627 4.611814,23.660832 -0.545637,2.497486 -2.040444,5.880059 -3.722303,9.006121 -0.216799,0.454886 -0.455912,0.901541 -0.710056,1.331563 -0.119637,0.198376 -0.321402,0.314287 -0.538202,0.314287 H 5.9338021 c -0.5231663,0 -0.8295316,-0.628575 -0.5530747,-1.100096 z" />
                <path d="m 89.738663,57.44891 v 5.185298 c 0,0.297651 -0.164419,0.562391 -0.403529,0.678126 -1.46506,0.69476 -6.480566,3.241974 -8.565955,6.450677 -5.321872,8.195627 -9.388049,19.914424 -18.477171,19.914424 H 24.373626 c -13.439352,0 -24.32980682,-12.090862 -24.32980682,-27.010133 v -0.479749 c 0,-0.396931 0.29149216,-0.719447 0.65040081,-0.719447 H 21.832164 c 0.418566,0 0.725093,0.430022 0.687747,0.884907 -0.149546,1.521711 0.104606,3.076513 0.75484,4.490719 1.255857,2.82 3.856976,4.581587 6.667457,4.581587 H 40.406499 V 62.386105 H 30.061682 c -0.530601,0 -0.844566,-0.678123 -0.538039,-1.157872 0.112038,-0.190147 0.23911,-0.388701 0.37362,-0.61194 0.97924,-1.538167 2.376882,-3.928328 3.767249,-6.649232 0.949168,-1.835819 1.868588,-3.795959 2.608555,-5.764146 0.149546,-0.355609 0.269182,-0.719445 0.388656,-1.075233 0.201926,-0.628396 0.411128,-1.215651 0.560673,-1.802726 0.149384,-0.496207 0.26902,-1.017277 0.388656,-1.505255 0.35131,-1.670535 0.500857,-3.440349 0.500857,-5.276347 0,-0.719442 -0.02991,-1.471982 -0.08974,-2.191606 -0.02991,-0.785629 -0.119636,-1.571259 -0.209364,-2.356888 -0.05982,-0.694761 -0.171856,-1.381112 -0.291492,-2.100558 -0.149545,-1.050367 -0.358747,-2.09233 -0.598019,-3.142698 l -0.08213,-0.396928 C 36.661714,27.635231 36.51233,26.948699 36.302966,26.229255 35.712546,23.971462 35.032236,21.771629 34.314742,19.712393 34.05316,18.89367 33.75407,18.108041 33.455141,17.32241 33.014105,16.139672 32.56563,15.064621 32.154663,14.047343 31.9453,13.584231 31.765845,13.162438 31.586552,12.732416 31.384788,12.244439 31.175425,11.756639 30.966223,11.293347 30.816676,10.937738 30.644659,10.606994 30.525185,10.276249 L 29.247017,7.6628515 c -0.179454,-0.3556089 0.119636,-0.777402 0.470784,-0.669896 l 7.997845,2.3983889 h 0.02246 c 0.01488,0 0.02247,0.00822 0.02991,0.00822 l 1.05393,0.3225146 1.158531,0.363838 0.426003,0.132368 V 4.9585796 c 0,-2.5389859 1.838841,-4.59822264 4.111122,-4.59822264 1.136058,0 2.167516,0.51266362 2.907482,1.34802014 0.739967,0.8353575 1.203478,1.9765947 1.203478,3.2502025 v 7.8069274 l 0.852003,0.264558 c 0.06741,0.02487 0.134672,0.05795 0.194489,0.107498 0.209202,0.173689 0.50813,0.430198 0.889349,0.744308 0.299092,0.26474 0.620493,0.587254 1.00915,0.917999 0.769875,0.686533 1.689133,1.571439 2.698281,2.588535 0.26902,0.256511 0.530765,0.521071 0.769875,0.78581 1.300641,1.339613 2.7581,2.911051 4.148468,4.647771 0.388656,0.487798 0.769876,0.984006 1.158531,1.505074 0.388657,0.529299 0.799784,1.050369 1.158532,1.571439 0.470946,0.694582 0.979078,1.414027 1.420115,2.166743 0.209364,0.355608 0.448474,0.719444 0.6504,1.075053 0.567949,0.95109 1.068805,1.935275 1.547188,2.919281 0.201764,0.454885 0.411128,0.951089 0.590421,1.439067 0.530764,1.314929 0.94933,2.65472 1.21835,3.994512 0.08229,0.289424 0.142107,0.60371 0.172016,0.884907 v 0.06602 c 0.08957,0.397108 0.119476,0.818901 0.149385,1.248921 0.119636,1.372708 0.05982,2.745592 -0.209202,4.126703 -0.112199,0.587255 -0.261583,1.141238 -0.441038,1.728493 -0.179455,0.562391 -0.358747,1.149466 -0.59042,1.703629 -0.448475,1.149466 -0.979239,2.29911 -1.607168,3.374164 -0.201765,0.396929 -0.440875,0.818722 -0.680147,1.215651 -0.261584,0.421795 -0.530604,0.818901 -0.769876,1.207602 -0.328839,0.496206 -0.680148,1.017096 -1.038896,1.48021 -0.321401,0.487979 -0.6504,0.975955 -1.009148,1.405977 -0.500693,0.653261 -0.979076,1.273607 -1.479932,1.869091 -0.298929,0.388698 -0.620331,0.785628 -0.94933,1.141238 -0.321402,0.396929 -0.65024,0.752536 -0.949168,1.08328 -0.500855,0.554163 -0.919421,0.984184 -1.270731,1.339792 l -0.822256,0.835359 c -0.119475,0.115741 -0.276457,0.181917 -0.440876,0.181917 h -6.368365 v 9.039213 h 8.012717 c 1.793896,0 3.498066,-0.702988 4.873398,-1.993052 0.470946,-0.454885 2.526426,-2.423252 4.955688,-5.39208 0.08213,-0.09927 0.186891,-0.173692 0.306366,-0.206783 l 22.132218,-7.079253 c 0.411127,-0.13237 0.829693,0.215011 0.829693,0.69476 z" />
              </svg>{" "}
              VIEW ON OPENSEA
            </a>
            <div className={styles.searchContainer}>
              <h2 className={styles.searchTitle}>FIND MY WHOOPSIE</h2>
              <div className={styles.search}>
                <input
                  onChange={(e) => {
                    if (id > 0 && id < 6126) {
                      setNewId(e.target.value);
                    } else {
                      setNewId(id);
                    }
                  }}
                  value={newId}
                  type="number"
                  min="1"
                  max="6125"
                />
                <button
                  onClick={() => {
                    setLoading(true);
                    navigate(`/details/${newId}`);
                  }}
                >
                  SEARCH
                </button>
              </div>
            </div>
          </div>
          <div className={styles.traitDetailsContainer}>
            <h2 className={styles.title}>TRAIT RARITY</h2>
            <div className={styles.nftDetails}>
              {attributes &&
                !loading &&
                attributes.map((trait) => (
                  <div key={trait.trait_type} className={styles.pointsWrapper}>
                    <div
                      className={
                        parseFloat((1 / trait.rarityScore) * 100).toFixed(2) <
                        5.0
                          ? styles.rareTrait
                          : styles.traits
                      }
                      key={trait.trait_type}
                    >
                      <h4>{trait.trait_type}</h4>
                      <h2>{trait?.value || "None"}</h2>
                      <p>
                        {parseFloat((1 / trait.rarityScore) * 100).toFixed(2)}%
                        Have this trait
                      </p>
                    </div>
                    <p>+{trait.rarityScore.toFixed(0)}</p>
                  </div>
                ))}
              {loading &&
                loadingArr.map((item) => (
                  <div key={item} className={styles.pointsWrapper}>
                    <div className={styles.attributeLoader}></div>
                  </div>
                ))}
            </div>

            <div className={styles.warningMessage}>
              <h2>
                Rankings may differ from other sites as every site uses their
                own determination of rarity. Use at your own risk.
              </h2>
            </div>
          </div>
        </div>
      ) : notFound || error ? (
        <NotFound />
      ) : null}
    </>
  );
}
