import React, { useEffect, useState } from "react";
import useIcyQuery from "../../Hooks/useIcyQuery";
import { useMoralis } from "react-moralis";

import styles from "./styles.module.scss";

import placeHolder from "../../assets/placeHolder.png";

const loadingItems = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

export default function Analytics() {
  const { Moralis } = useMoralis();
  const { fetchTrending, fetchMints } = useIcyQuery();
  const [trendingNftData, setTrendingNftData] = useState(null);
  const [mintNftData, setMintNftData] = useState(null);
  const [loadingTrend, setLoadingTrend] = useState(true);
  const [loadingMint, setLoadingMint] = useState(true);
  const [timeFrame, setTimeFrame] = useState("ONE_HOUR");
  const [max, setMax] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(null);

  const getTrending = async () => {
    setLoadingMint(false);
    setLoadingTrend(true);
    if (timeFrame) {
      setMintNftData(null);
      let response = await fetchTrending(timeFrame);
      let responseSorted =
        response.data.data.ethereum.trendingCollections.edges.sort(
          (a, b) =>
            b.node?.collection?.stats?.totalSales -
            a.node?.collection?.stats?.totalSales
        );
      let responseFiltered = responseSorted.filter(
        (item) => item.node.collection.address
      );
      setTrendingNftData(responseFiltered);
      setLoadingTrend(false);
    }
  };

  const fetchMintData = async () => {
    const subtractTimeFromDate = (objDate, intHours) => {
      let numberOfMlSeconds = objDate.getTime();
      let addMlSeconds = intHours * 60 * 60 * 1000;
      let newDateObj = new Date(numberOfMlSeconds - addMlSeconds);

      return newDateObj;
    };

    let timeStamp;

    if (timeFrame === "ONE_HOUR") {
      timeStamp = subtractTimeFromDate(new Date(), 1);
    }

    if (timeFrame === "ONE_MINUTE") {
      timeStamp = subtractTimeFromDate(new Date(), 0.02);
    }
    if (timeFrame === "FIVE_MINUTES") {
      timeStamp = subtractTimeFromDate(new Date(), 0.09);
    }
    if (timeFrame === "FIFTEEN_MINUTES") {
      timeStamp = subtractTimeFromDate(new Date(), 0.25);
    }
    if (timeFrame === "THIRTY_MINUTES") {
      timeStamp = subtractTimeFromDate(new Date(), 0.65);
    }
    let block = await Moralis.Web3API.native.getDateToBlock({
      chain: "eth",
      date: timeStamp,
    });
    block = "0x" + block.block.toString(16);

    let res = await fetchMints(block);
    let mintList = [];
    Object.keys(res).forEach((key) => {
      if (mintList.find((x) => x.address === res[key].address)) {
        mintList[
          mintList.findIndex((x) => x.address === res[key].address)
        ].holders.push(res[key].topics[2]);
      } else {
        mintList.push({
          address: res[key].address,
          holders: [res[key].topics[2]],
        });
      }
    });
    let trendingMints = mintList.sort(
      (a, b) => b.holders.length - a.holders.length
    );
    return trendingMints;
  };

  const getMints = async () => {
    setLoadingTrend(false);
    setLoadingMint(true);
    setTrendingNftData(null);
    const subtractTimeFromDate = (objDate, intHours) => {
      let numberOfMlSeconds = objDate.getTime();
      let addMlSeconds = intHours * 60 * 60 * 1000;
      let newDateObj = new Date(numberOfMlSeconds - addMlSeconds);

      return newDateObj;
    };

    let timeStamp;
    if (timeFrame === "ONE_HOUR") {
      timeStamp = subtractTimeFromDate(new Date(), 1);
    }

    if (timeFrame === "ONE_MINUTE") {
      timeStamp = subtractTimeFromDate(new Date(), 0.02);
    }
    if (timeFrame === "FIVE_MINUTES") {
      timeStamp = subtractTimeFromDate(new Date(), 0.09);
    }
    if (timeFrame === "FIFTEEN_MINUTES") {
      timeStamp = subtractTimeFromDate(new Date(), 0.25);
    }
    if (timeFrame === "THIRTY_MINUTES") {
      timeStamp = subtractTimeFromDate(new Date(), 0.65);
    }
    let collectionArr = [];
    let mints = await fetchMintData();
    let res;
    mints &&
      mints.forEach((mint, idx) => {
        if (idx <= 19) {
          collectionArr.push(mint.address.toLowerCase());
        }
      });

    res = await Moralis.Cloud.run("fetchCollectionInfo", {
      collection: collectionArr,
      timeFrame: timeStamp,
    });
    let allMintData = [];
    mints.forEach(async (mint) => {
      res.data.data.ethereum.collections.edges.forEach((item) => {
        if (mint.address.toLowerCase() === item.node.address.toLowerCase()) {
          let unique = mint.holders.filter(
            (holder, idx) => mint.holders.indexOf(holder) === idx
          );
          allMintData.push({
            address: mint.address,
            total_mints: mint.holders.length,
            name: item.node?.name,
            symbol: item.node?.symbol,
            circSup: item.node?.circulatingSupply,
            img: item.node?.image ? item.node?.image[0].url : null,
            slug: item.node?.openseaMetadata.unsafeSlug,
            unique: unique.length,
            stats: item.node?.stats,
          });
        }
      });
    });
    setMintNftData(allMintData);
    setLoadingMint(false);
    let max = [];
    /* for (let i = 0; i < allMintData.length; i++) {
      let res = await fetch(
        `https://api.looksrare.org/api/v1/collections/stats?address=${allMintData[i].address}`
      );
      res = await res.json();
      res.data?.totalSupply ? max.push(res.data.totalSupply) : max.push("-");
    } */
    setMax(max);
  };

  const switchTrending = async () => {
    setLoadingMint(false);
    setLoadingTrend(true);
    setMintNftData(null);
    let response = await fetchTrending("ONE_HOUR");
    setTimeFrame("ONE_HOUR");
    let responseSorted = response.data.data.trendingCollections.edges.sort(
      (a, b) => b.node.stats.totalSales - a.node.stats.totalSales
    );
    let responseFiltered = responseSorted.filter(
      (item) => item.node.collection.address
    );
    setTrendingNftData(responseFiltered);
    setLoadingTrend(false);
  };

  const switchMints = async () => {
    getMints();
  };

  const formatNum = (num, digits) => {
    num = parseFloat(num);
    return num.toLocaleString("en-US", { maximumFractionDigits: digits });
  };

  useEffect(() => {
    trendingNftData && getTrending();
    mintNftData && getMints();
    if (!trendingNftData && !mintNftData) {
      getTrending();
    }
    // eslint-disable-next-line
  }, [timeFrame]);

  return (
    <div className={styles.analyticsContainer}>
      <div className={styles.options}>
        <div className={styles.listActionsContainer}>
          <button
            className={trendingNftData ? styles.selected : styles.listAction}
            onClick={() => switchTrending()}
          >
            TRENDING
          </button>
          <button
            className={mintNftData ? styles.selected : styles.listAction}
            onClick={() => switchMints()}
          >
            DISCOVER
          </button>
        </div>
        <div className={styles.timeFrame}>
          {mintNftData && (
            <button
              className={
                timeFrame === "ONE_MINUTE" ? styles.selectedTime : styles.time
              }
              onClick={() => setTimeFrame("ONE_MINUTE")}
            >
              1m
            </button>
          )}
          {mintNftData && (
            <button
              className={
                timeFrame === "FIVE_MINUTES" ? styles.selectedTime : styles.time
              }
              onClick={() => setTimeFrame("FIVE_MINUTES")}
            >
              5m
            </button>
          )}
          {mintNftData && (
            <button
              className={
                timeFrame === "FIFTEEN_MINUTES"
                  ? styles.selectedTime
                  : styles.time
              }
              onClick={() => setTimeFrame("FIFTEEN_MINUTES")}
            >
              15m
            </button>
          )}
          {mintNftData && (
            <button
              className={
                timeFrame === "THIRTY_MINUTES"
                  ? styles.selectedTime
                  : styles.time
              }
              onClick={() => setTimeFrame("THIRTY_MINUTES")}
            >
              30m
            </button>
          )}
          <button
            className={
              timeFrame === "ONE_HOUR" ? styles.selectedTime : styles.time
            }
            onClick={() => setTimeFrame("ONE_HOUR")}
          >
            1h
          </button>
          {/* {mintNftData && <button className={timeFrame === "SIX_HOURS" ? styles.selectedTime : styles.time} onClick={() => setTimeFrame("SIX_HOURS")}>6h</button>} */}
          {trendingNftData && (
            <button
              className={
                timeFrame === "TWELVE_HOURS" ? styles.selectedTime : styles.time
              }
              onClick={() => setTimeFrame("TWELVE_HOURS")}
            >
              12h
            </button>
          )}
          {trendingNftData && (
            <button
              className={
                timeFrame === "ONE_DAY" ? styles.selectedTime : styles.time
              }
              onClick={() => setTimeFrame("ONE_DAY")}
            >
              1d
            </button>
          )}
          {trendingNftData && (
            <button
              className={
                timeFrame === "SEVEN_DAYS" ? styles.selectedTime : styles.time
              }
              onClick={() => setTimeFrame("SEVEN_DAYS")}
            >
              7d
            </button>
          )}
          {/* {trendingNftData && <button className={timeFrame === "FOURTEEN_DAYS" ? styles.selectedTime : styles.time} onClick={() => setTimeFrame("FOURTEEN_DAYS")}>14d</button>}
          {trendingNftData && <button className={timeFrame === "THIRTY_DAYS" ? styles.selectedTime : styles.time} onClick={() => setTimeFrame("THIRTY_DAYS")}>30d</button>} */}
        </div>
      </div>
      <div className={styles.table}>
        {trendingNftData && (
          <div className={styles.tableHeader}>
            <div>
              <h2>COLLECTION</h2>
            </div>
            <div className={styles.tableData}>
              <h2>FLOOR</h2>
            </div>
            <div className={styles.tableData}>
              <h2>SALES</h2>
            </div>
            <div className={styles.tableData}>
              <h2>AVERAGE</h2>
            </div>
            <div className={styles.tableData}>
              <h2>VOLUME</h2>
            </div>
            <div className={styles.tableData}>
              <h2>MKT CAP</h2>
            </div>
          </div>
        )}
        {mintNftData && (
          <div className={styles.tableHeaderMint}>
            <div>
              <h2>COLLECTION</h2>
            </div>
            <div className={styles.tableData}>
              <h2>MINTS</h2>
            </div>
            <div className={styles.tableData}>
              <h2>UNIQUE</h2>
            </div>
            <div className={styles.tableData}>
              <h2>FLOOR</h2>
            </div>
            <div className={styles.tableData}>
              <h2>SALES</h2>
            </div>
            <div className={styles.tableData}>
              <h2>VOLUME</h2>
            </div>
            <div className={styles.tableData}>
              <h2>ALL TIME</h2>
            </div>
          </div>
        )}
        {loadingTrend &&
          loadingItems.map((item, idx) => (
            <div key={idx} className={styles.tableRowLoader}>
              <div className={styles.collectionNameLoader}>
                <div className={styles.avatarContainerLoader}></div>
                <div className={styles.collectionTitleLoaderContainer}>
                  <div className={styles.collectionTitleLoader}></div>
                  <div className={styles.collectionTitleLoader}></div>
                </div>
              </div>
              <div className={styles.tableDataLoader}></div>
              <div className={styles.tableDataLoader}></div>
              <div className={styles.tableDataLoader}></div>
              <div className={styles.tableDataLoader}></div>
              <div className={styles.tableDataLoader}></div>
            </div>
          ))}
        {loadingMint &&
          loadingItems.map((item, idx) => (
            <div key={idx} className={styles.tableRowLoaderMint}>
              <div className={styles.collectionNameLoader}>
                <div className={styles.avatarContainerLoader}></div>
                <div className={styles.collectionTitleLoaderContainer}>
                  <div className={styles.collectionTitleLoader}></div>
                  <div className={styles.collectionTitleLoader}></div>
                </div>
              </div>
              <div className={styles.tableDataLoaderMint}></div>
              <div className={styles.tableDataLoaderMint}></div>
              <div className={styles.tableDataLoaderMint}></div>
              <div className={styles.tableDataLoaderMint}></div>
              <div className={styles.tableDataLoaderMint}></div>
              <div className={styles.allTimeLoaderContainer}>
                <div className={styles.allTimeLoader}></div>
                <div className={styles.allTimeLoader}></div>
              </div>
            </div>
          ))}
        {mintNftData &&
          mintNftData.map((item, idx) => (
            <div
              key={item.address}
              onClick={() => {
                detailsOpen !== idx
                  ? setDetailsOpen(idx)
                  : setDetailsOpen(null);
              }}
              className={styles.rowWrapper}
            >
              <div className={styles.tableRowMint}>
                <div className={styles.collectionName}>
                  <div className={styles.avatarContainer}>
                    <img
                      className={styles.collectionAvatar}
                      src={item?.img || placeHolder}
                      alt="collection avatar"
                    />
                  </div>
                  <div className={styles.collectionTitle}>
                    <h4>{item.name}</h4>
                  </div>
                </div>
                <div className={styles.tableData}>
                  {formatNum(item.total_mints, 0)}
                </div>
                <div className={styles.tableData}>
                  {formatNum(item.unique, 0)} (
                  {formatNum((item.unique / item.total_mints) * 100, 0)}%)
                </div>
                <div className={styles.tableData}>
                  {item?.stats?.floorInNativeToken ? (
                    <>
                      <img
                        alt="eth logo"
                        src="https://openseauserdata.com/files/6f8e2979d428180222796ff4a33ab929.svg"
                      />
                      {formatNum(item?.stats?.floorInNativeToken, 3)}{" "}
                    </>
                  ) : (
                    "-"
                  )}
                </div>
                <div className={styles.tableData}>
                  {item?.stats?.totalSales ? (
                    <>{formatNum(item?.stats?.totalSales, 3)} </>
                  ) : (
                    "-"
                  )}
                </div>
                <div className={styles.tableData}>
                  {item?.stats?.volumeInNativeToken ? (
                    <>
                      <img
                        alt="eth logo"
                        src="https://openseauserdata.com/files/6f8e2979d428180222796ff4a33ab929.svg"
                      />
                      {formatNum(item?.stats?.volumeInNativeToken, 2)}{" "}
                    </>
                  ) : (
                    "-"
                  )}
                </div>
                <div className={styles.allTime}>
                  {formatNum(item.circSup, 0)}
                  {max && <p>{formatNum(max[idx], 0)}</p>}
                </div>
              </div>
              <div
                className={
                  detailsOpen === idx
                    ? styles.moreDetails
                    : styles.moreDetailsHidden
                }
              >
                <a
                  href={`https://opensea.io/collection/${item.slug}`}
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
                <a
                  href={`https://looksrare.org/collections/${item.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg viewBox="0 0 148 148" xmlns="http://www.w3.org/2000/svg">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M74 86C61.3026 86 51 75.7077 51 63C51 50.2923 61.3026 40 74 40C86.6974 40 97 50.2923 97 63C97 75.7077 86.6974 86 74 86ZM64 63C64 68.5251 68.4794 73 74 73C79.5206 73 84 68.5251 84 63C84 57.4749 79.5206 53 74 53C68.4794 53 64 57.4749 64 63Z"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M0 63.0304L44 19H104L148 63.0304L74 137L0 63.0304ZM108 46.9998C89.3047 28.2224 58.6953 28.2225 40 46.9999L24 63.0001L40 79.0002C58.6953 97.7776 89.3047 97.7775 108 79.0001L124 63.0001L108 46.9998Z"
                    />
                  </svg>
                </a>
                <a
                  href={`https://etherscan.io/address/${item.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg
                    height="20"
                    viewBox="0 0 293.775 293.671"
                    width="20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g
                      id="etherscan-logo-circle"
                      transform="translate(-219.378 -213.33)"
                    >
                      <path
                        d="M280.433,353.152A12.45,12.45,0,0,1,292.941,340.7l20.737.068a12.467,12.467,0,0,1,12.467,12.467v78.414c2.336-.692,5.332-1.43,8.614-2.2a10.389,10.389,0,0,0,8.009-10.11V322.073a12.469,12.469,0,0,1,12.468-12.47h20.778a12.469,12.469,0,0,1,12.467,12.467v90.279s5.2-2.106,10.269-4.245a10.408,10.408,0,0,0,6.353-9.577V290.9a12.466,12.466,0,0,1,12.466-12.467h20.778A12.468,12.468,0,0,1,450.815,290.9v88.625c18.014-13.055,36.271-28.758,50.759-47.639a20.926,20.926,0,0,0,3.185-19.537,146.6,146.6,0,0,0-136.644-99.006c-81.439-1.094-148.744,65.385-148.736,146.834a146.371,146.371,0,0,0,19.5,73.45,18.56,18.56,0,0,0,17.707,9.173c3.931-.346,8.825-.835,14.643-1.518a10.383,10.383,0,0,0,9.209-10.306V353.152"
                        data-name="Path 1"
                        id="Path_1"
                      ></path>
                      <path
                        d="M244.417,398.641A146.808,146.808,0,0,0,477.589,279.9c0-3.381-.157-6.724-.383-10.049-53.642,80-152.686,117.4-232.79,128.793"
                        data-name="Path 2"
                        id="Path_2"
                        transform="translate(35.564 80.269)"
                      ></path>
                    </g>
                  </svg>
                </a>
              </div>
            </div>
          ))}
        {trendingNftData &&
          trendingNftData.map((item, idx) => (
            <div
              key={item.node.collection.address}
              onClick={() => {
                detailsOpen !== idx
                  ? setDetailsOpen(idx)
                  : setDetailsOpen(null);
              }}
              className={styles.rowWrapper}
            >
              <div className={styles.tableRow}>
                <div className={styles.collectionName}>
                  <div className={styles.avatarContainer}>
                    <img
                      className={styles.collectionAvatar}
                      src={
                        item.node?.collection?.image
                          ? item.node?.collection?.image[0].url
                          : placeHolder
                      }
                      alt="collection logo"
                    />
                  </div>
                  <div className={styles.collectionTitle}>
                    <h4>
                      {item.node?.collection?.name?.length > 14
                        ? item.node.collection.name.slice(0, 14) + "..."
                        : item.node.collection.name}
                    </h4>
                    <p>
                      Circulating Supply:{" "}
                      {formatNum(item.node.collection.circulatingSupply)}
                    </p>
                  </div>
                </div>
                <div className={styles.tableData}>
                  <img
                    alt="eth logo"
                    src="https://openseauserdata.com/files/6f8e2979d428180222796ff4a33ab929.svg"
                  />
                  {formatNum(
                    item.node?.collection?.stats?.floorInNativeToken,
                    3
                  )}
                </div>
                <div className={styles.tableData}>
                  {formatNum(item?.node?.collection?.stats?.totalSales, 0)}
                </div>
                <div className={styles.tableData}>
                  <img
                    alt="eth logo"
                    src="https://openseauserdata.com/files/6f8e2979d428180222796ff4a33ab929.svg"
                  />
                  {formatNum(
                    item?.node?.collection?.stats?.averageInNativeToken,
                    3
                  )}
                </div>
                <div className={styles.tableData}>
                  <img
                    alt="eth logo"
                    src="https://openseauserdata.com/files/6f8e2979d428180222796ff4a33ab929.svg"
                  />
                  {formatNum(
                    item?.node?.collection?.stats?.volumeInNativeToken,
                    2
                  )}
                </div>
                <div className={styles.tableData}>
                  <img
                    alt="eth logo"
                    src="https://openseauserdata.com/files/6f8e2979d428180222796ff4a33ab929.svg"
                  />
                  {formatNum(
                    item?.node?.collection?.stats?.floorInNativeToken *
                      item?.node?.collection?.circulatingSupply,
                    0
                  )}
                </div>
              </div>
              <div
                className={
                  detailsOpen === idx
                    ? styles.moreDetails
                    : styles.moreDetailsHidden
                }
              >
                <a
                  href={`https://opensea.io/collection/${item?.node?.collection?.openseaMetadata?.unsafeSlug}`}
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
                <a
                  href={`https://looksrare.org/collections/${item.node.collection.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg viewBox="0 0 148 148" xmlns="http://www.w3.org/2000/svg">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M74 86C61.3026 86 51 75.7077 51 63C51 50.2923 61.3026 40 74 40C86.6974 40 97 50.2923 97 63C97 75.7077 86.6974 86 74 86ZM64 63C64 68.5251 68.4794 73 74 73C79.5206 73 84 68.5251 84 63C84 57.4749 79.5206 53 74 53C68.4794 53 64 57.4749 64 63Z"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M0 63.0304L44 19H104L148 63.0304L74 137L0 63.0304ZM108 46.9998C89.3047 28.2224 58.6953 28.2225 40 46.9999L24 63.0001L40 79.0002C58.6953 97.7776 89.3047 97.7775 108 79.0001L124 63.0001L108 46.9998Z"
                    />
                  </svg>
                </a>
                <a
                  href={`https://etherscan.io/address/${item.node.collection.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg
                    height="20"
                    viewBox="0 0 293.775 293.671"
                    width="20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g
                      id="etherscan-logo-circle"
                      transform="translate(-219.378 -213.33)"
                    >
                      <path
                        d="M280.433,353.152A12.45,12.45,0,0,1,292.941,340.7l20.737.068a12.467,12.467,0,0,1,12.467,12.467v78.414c2.336-.692,5.332-1.43,8.614-2.2a10.389,10.389,0,0,0,8.009-10.11V322.073a12.469,12.469,0,0,1,12.468-12.47h20.778a12.469,12.469,0,0,1,12.467,12.467v90.279s5.2-2.106,10.269-4.245a10.408,10.408,0,0,0,6.353-9.577V290.9a12.466,12.466,0,0,1,12.466-12.467h20.778A12.468,12.468,0,0,1,450.815,290.9v88.625c18.014-13.055,36.271-28.758,50.759-47.639a20.926,20.926,0,0,0,3.185-19.537,146.6,146.6,0,0,0-136.644-99.006c-81.439-1.094-148.744,65.385-148.736,146.834a146.371,146.371,0,0,0,19.5,73.45,18.56,18.56,0,0,0,17.707,9.173c3.931-.346,8.825-.835,14.643-1.518a10.383,10.383,0,0,0,9.209-10.306V353.152"
                        data-name="Path 1"
                        id="Path_1"
                      ></path>
                      <path
                        d="M244.417,398.641A146.808,146.808,0,0,0,477.589,279.9c0-3.381-.157-6.724-.383-10.049-53.642,80-152.686,117.4-232.79,128.793"
                        data-name="Path 2"
                        id="Path_2"
                        transform="translate(35.564 80.269)"
                      ></path>
                    </g>
                  </svg>
                </a>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
