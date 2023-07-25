import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { useParams } from "react-router-dom";
import { ReactComponent as Ether } from "../../assets/icons/ethereum.svg";

import styles from "./styles.module.scss";

const load = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
];

export default function CollectionDetails() {
  const { slug } = useParams();
  const [collection, setCollection] = useState(null);
  const [collectionInfo, setCollectionInfo] = useState(null);
  const [collectionStats, setCollectionStats] = useState(null);
  const [nftImg, setNftImg] = useState(null);
  const [filter, setFilter] = useState("all");
  const [skip, setSkip] = useState(0);
  const [token, setToken] = useState("");
  const [tokenList, setTokenList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { Moralis } = useMoralis();

  const formatNum = (num, digits) => {
    num = parseFloat(num);
    return num.toLocaleString("en-US", { maximumFractionDigits: digits });
  };

  const nextPage = () => {
    setCollection(null);
    let tempSkip = skip + 20;
    setSkip(tempSkip);
    window.scrollTo(0, 0);
  };

  const getTokenList = async () => {
    let tokensList = collectionInfo[0].attributes.tokens.filter(
      (item) => item.token_id === token
    );
    let collections = [];
    let idArr = [];
    for (let i = 0; i < tokensList.length; i++) {
      collections.push(tokensList[i]);
      idArr.push("token_ids=" + tokensList[i].token_id + "&");
    }
    setCollection(collections);
    const options = {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-API-KEY": "dec6fe4199964cc7990875fb6c623441",
      },
    };

    let url =
      "https://api.opensea.io/api/v1/assets?" +
      idArr.join("") +
      `&order_direction=desc&asset_contract_address=${collectionInfo[0].attributes.address}&limit=20&include_orders=true`;
    let imgRes = await fetch(url, options);
    imgRes = await imgRes.json();
    setNftImg(imgRes);
  };

  const addToList = (token) => {
    if (token.length > 0) {
      let newToken = {
        attributes: token[0].attributes,
        rank: token[0].rank,
        rarity: token[0].rarity,
        token_id: token[0].token_id,
        img: nftImg.assets[0].image_url,
      };
      setTokenList([...tokenList, newToken]);
      setCollection(null);
    }
  };

  const getCollectionRanking = async () => {
    setLoading(true);
    let collectionQuery = new Moralis.Query("supportedNFTs");
    collectionQuery.equalTo("slug", slug);
    let tempCollection = await collectionQuery.find();
    setCollectionInfo(tempCollection);
    let collections = [];
    let idArr = [];
    for (let i = skip; i < skip + 20; i++) {
      collections.push(tempCollection[0].attributes.tokens[i]);
      idArr.push(
        "token_ids=" + tempCollection[0].attributes.tokens[i].token_id + "&"
      );
    }
    setCollection(collections);
    const options = {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-API-KEY": "dec6fe4199964cc7990875fb6c623441",
      },
    };

    let url =
      "https://api.opensea.io/api/v1/assets?" +
      idArr.join("") +
      `&order_direction=desc&asset_contract_address=${tempCollection[0].attributes.address}&limit=20&include_orders=true`;
    let imgRes = await fetch(url, options);
    imgRes = await imgRes.json();
    setNftImg(imgRes);
    imgRes && setLoading(false);
  };

  const getCollectionStats = async () => {
    const options = {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-API-KEY": "dec6fe4199964cc7990875fb6c623441",
      },
    };
    let res = await fetch(
      `https://api.opensea.io/api/v1/collection/${slug}/stats`,
      options
    );
    res = await res.json();
    setCollectionStats(res);
  };

  useEffect(() => {
    token !== "" && getTokenList();
    token === "" && tokenList.length < 1 && getCollectionRanking();
    //eslint-disable-next-line
  }, [token]);

  useEffect(() => {
    getCollectionRanking();
    getCollectionStats();
    //eslint-disable-next-line
  }, [skip]);

  return (
    <div className={styles.collectionDetailsContainer}>
      <div className={styles.titleContainer}>
        <div className={styles.titleActions}>
          {collectionInfo && <h2>{collectionInfo[0].attributes.name}</h2>}
          <div className={styles.filterStats}>
            <button
              className={
                filter === "1d" ? styles.selectedFilter : styles.filter
              }
              onClick={() => setFilter("1d")}
            >
              1d
            </button>
            <button
              className={
                filter === "7d" ? styles.selectedFilter : styles.filter
              }
              onClick={() => setFilter("7d")}
            >
              7d
            </button>
            <button
              className={
                filter === "30d" ? styles.selectedFilter : styles.filter
              }
              onClick={() => setFilter("30d")}
            >
              30d
            </button>
            <button
              className={
                filter === "all" ? styles.selectedFilter : styles.filter
              }
              onClick={() => setFilter("all")}
            >
              All
            </button>
          </div>
        </div>
        <hr />
      </div>
      {collectionStats && (
        <div className={styles.statsContainer}>
          <div className={styles.statsCard}>
            <h4>FLOOR</h4>
            <h2>
              <Ether />
              {formatNum(collectionStats.stats.floor_price, 3)}
            </h2>
          </div>
          <div className={styles.statsCard}>
            <h4>MARKET CAP</h4>
            <h2>
              <Ether />
              {formatNum(collectionStats.stats.market_cap, 0)}
            </h2>
          </div>
          <div className={styles.statsCard}>
            <h4>HOLDERS</h4>
            <h2>{formatNum(collectionStats.stats.num_owners, 0)}</h2>
          </div>
          {filter === "all" && (
            <>
              <div className={styles.statsCard}>
                <h4>AVG PRICE</h4>
                <h2>
                  <Ether />
                  {formatNum(collectionStats.stats.average_price, 3)}
                </h2>
              </div>
              <div className={styles.statsCard}>
                <h4>TOTAL SALES</h4>
                <h2>{formatNum(collectionStats.stats.total_sales, 0)}</h2>
              </div>
              <div className={styles.statsCard}>
                <h4>TOTAL VOLUME</h4>
                <h2>
                  <Ether />
                  {formatNum(collectionStats.stats.total_volume, 0)}
                </h2>
              </div>
            </>
          )}
          {filter === "1d" && (
            <>
              <div className={styles.statsCard}>
                <h4>AVG PRICE</h4>
                <h2>
                  <Ether />
                  {formatNum(collectionStats.stats.one_day_average_price, 3)}
                </h2>
              </div>
              <div className={styles.statsCard}>
                <h4>TOTAL SALES</h4>
                <h2>{formatNum(collectionStats.stats.one_day_sales, 0)}</h2>
              </div>
              <div className={styles.statsCard}>
                <h4>TOTAL VOLUME</h4>
                <h2>
                  <Ether />
                  {formatNum(collectionStats.stats.one_day_volume, 0)}
                </h2>
              </div>
            </>
          )}
          {filter === "7d" && (
            <>
              <div className={styles.statsCard}>
                <h4>AVG PRICE</h4>
                <h2>
                  <Ether />
                  {formatNum(collectionStats.stats.seven_day_average_price, 3)}
                </h2>
              </div>
              <div className={styles.statsCard}>
                <h4>TOTAL SALES</h4>
                <h2>{formatNum(collectionStats.stats.seven_day_sales, 0)}</h2>
              </div>
              <div className={styles.statsCard}>
                <h4>TOTAL VOLUME</h4>
                <h2>
                  <Ether />
                  {formatNum(collectionStats.stats.seven_day_volume, 0)}
                </h2>
              </div>
            </>
          )}
          {filter === "30d" && (
            <>
              <div className={styles.statsCard}>
                <h4>AVG PRICE</h4>
                <h2>
                  <Ether />
                  {formatNum(collectionStats.stats.thirty_day_average_price, 3)}
                </h2>
              </div>
              <div className={styles.statsCard}>
                <h4>TOTAL SALES</h4>
                <h2>{formatNum(collectionStats.stats.thirty_day_sales, 0)}</h2>
              </div>
              <div className={styles.statsCard}>
                <h4>TOTAL VOLUME</h4>
                <h2>
                  <Ether />
                  {formatNum(collectionStats.stats.thirty_day_volume, 0)}
                </h2>
              </div>
            </>
          )}
        </div>
      )}
      <div className={styles.gridActions}>
        <div className={styles.searchContainer}>
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            type="number"
            placeholder="Token ID's"
          />
          <button onClick={() => addToList(collection)}>ADD</button>
          {tokenList.length > 0 && (
            <button
              onClick={() => {
                setTokenList([]);
                setSkip(0);
                setToken("");
                getCollectionRanking();
                setNftImg(null);
              }}
            >
              CLEAR
            </button>
          )}
        </div>
      </div>
      <div className={styles.rankGrid}>
        {loading &&
          load.map((idx) => (
            <div className={styles.cardLoader} key={idx}></div>
          ))}
        {collection &&
          collection.map((nft, idx) => (
            <div className={styles.nftCard} key={idx}>
              <div className={styles.ranking}>
                <div
                  className={
                    nft.rank < 2000
                      ? styles.rare
                      : nft.rank < 3500
                      ? styles.medRare
                      : styles.rank
                  }
                >
                  <h2>#{nft.rank}</h2>
                </div>
                <div
                  className={
                    nft.rank < 2000
                      ? styles.rare
                      : nft.rank < 3500
                      ? styles.medRare
                      : styles.rank
                  }
                >
                  <h2>{nft.rarity.toFixed(0)}</h2>
                </div>
              </div>
              {nftImg && (
                <img
                  src={
                    nftImg.assets[
                      nftImg.assets.findIndex(
                        (x) => x.token_id === nft.token_id
                      )
                    ]?.image_url
                  }
                  alt="nft"
                />
              )}
              <div className={styles.aboutContainer}>
                <h2 className={styles.tokenId}>#{nft.token_id}</h2>
                {collectionInfo && (
                  <a
                    className={styles.buyButton}
                    href={`https://opensea.io/assets/ethereum/${collectionInfo[0].attributes.address}/${nft.token_id}`}
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
                    </svg>
                  </a>
                )}
              </div>
            </div>
          ))}
        {tokenList.map((nft, idx) => (
          <div className={styles.nftCard} key={idx}>
            <div className={styles.ranking}>
              <div
                className={
                  nft.rank < 2000
                    ? styles.rare
                    : nft.rank < 3500
                    ? styles.medRare
                    : styles.rank
                }
              >
                <h2>#{nft.rank}</h2>
              </div>
              <div
                className={
                  nft.rank < 2000
                    ? styles.rare
                    : nft.rank < 3500
                    ? styles.medRare
                    : styles.rank
                }
              >
                <h2>{nft.rarity.toFixed(0)}</h2>
              </div>
            </div>
            <img src={nft.img} alt="nft" />
            <div className={styles.aboutContainer}>
              <h2 className={styles.tokenId}>#{nft.token_id}</h2>
              <a
                className={styles.buyButton}
                href={`https://opensea.io/assets/ethereum/${collectionInfo[0].attributes.address}/${nft.token_id}`}
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
                </svg>
              </a>
            </div>
          </div>
        ))}
        {!token && tokenList.length === 0 && (
          <button className={styles.loadMore} onClick={() => nextPage()}>
            LOAD MORE
          </button>
        )}
      </div>
    </div>
  );
}
