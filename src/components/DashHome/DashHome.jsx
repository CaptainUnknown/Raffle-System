import React, { useEffect, useState } from "react";
import { ReactComponent as Ether } from "../../assets/icons/ethereum.svg";
import styles from "./styles.module.scss";

export default function DashHome() {
  const [collectionStats, setCollectionStats] = useState(null);
  const [floorItems, setFloorItems] = useState(null);
  const [filter, setFilter] = useState("all");

  const generateRandom = () => {
    return 1 + Math.floor(Math.random() * 6125);
  };

  const fetchFloorItems = async () => {
    let idArr = [];

    for (let i = 0; i < 30; i++) {
      idArr.push("token_ids=" + generateRandom() + "&");
    }
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
      `collection_slug=whoopsiesdoopsies&order_direction=desc&asset_contract_address=0x565AbC3FEaa3bC3820B83620f4BbF16B5c4D47a3&limit=30&include_orders=true`;

    fetch(url, options)
      .then((response) => response.json())
      .then((response) => setFloorItems(response.assets))
      .catch((err) => console.error(err));
  };

  const getCollectionStats = async () => {
    const options = {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-API-KEY": "dec6fe4199964cc7990875fb6c623441",
      },
    };

    fetch(
      "https://api.opensea.io/api/v1/collection/whoopsiesdoopsies/stats",
      options
    )
      .then((response) => response.json())
      .then((response) => setCollectionStats(response.stats))
      .catch((err) => console.error(err));
  };

  const formatNum = (num, digits) => {
    num = parseFloat(num);
    return num.toLocaleString("en-US", { maximumFractionDigits: digits });
  };

  const formatEth = (num) => {
    num = num * 0.000000000000000001;
    return formatNum(num, 4);
  };

  useEffect(() => {
    setFloorItems(null);
    fetchFloorItems();
    getCollectionStats();
    //eslint-disable-next-line
  }, []);

  return (
    <div className={styles.notHolderContainer}>
      <div className={styles.titleContainer}>
        <div className={styles.titleActions}>
          <h2>Collection Overview</h2>
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
              {formatNum(collectionStats.floor_price, 3)}
            </h2>
          </div>
          <div className={styles.statsCard}>
            <h4>MARKET CAP</h4>
            <h2>
              <Ether />
              {formatNum(collectionStats.market_cap, 0)}
            </h2>
          </div>
          <div className={styles.statsCard}>
            <h4>HOLDERS</h4>
            <h2>{formatNum(collectionStats.num_owners, 0)}</h2>
          </div>
          {filter === "all" && (
            <>
              <div className={styles.statsCard}>
                <h4>AVG PRICE</h4>
                <h2>
                  <Ether />
                  {formatNum(collectionStats.average_price, 3)}
                </h2>
              </div>
              <div className={styles.statsCard}>
                <h4>TOTAL SALES</h4>
                <h2>{formatNum(collectionStats.total_sales, 0)}</h2>
              </div>
              <div className={styles.statsCard}>
                <h4>TOTAL VOLUME</h4>
                <h2>
                  <Ether />
                  {formatNum(collectionStats.total_volume, 0)}
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
                  {formatNum(collectionStats.one_day_average_price, 3)}
                </h2>
              </div>
              <div className={styles.statsCard}>
                <h4>TOTAL SALES</h4>
                <h2>{formatNum(collectionStats.one_day_sales, 0)}</h2>
              </div>
              <div className={styles.statsCard}>
                <h4>TOTAL VOLUME</h4>
                <h2>
                  <Ether />
                  {formatNum(collectionStats.one_day_volume, 0)}
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
                  {formatNum(collectionStats.seven_day_average_price, 3)}
                </h2>
              </div>
              <div className={styles.statsCard}>
                <h4>TOTAL SALES</h4>
                <h2>{formatNum(collectionStats.seven_day_sales, 0)}</h2>
              </div>
              <div className={styles.statsCard}>
                <h4>TOTAL VOLUME</h4>
                <h2>
                  <Ether />
                  {formatNum(collectionStats.seven_day_volume, 0)}
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
                  {formatNum(collectionStats.thirty_day_average_price, 3)}
                </h2>
              </div>
              <div className={styles.statsCard}>
                <h4>TOTAL SALES</h4>
                <h2>{formatNum(collectionStats.thirty_day_sales, 0)}</h2>
              </div>
              <div className={styles.statsCard}>
                <h4>TOTAL VOLUME</h4>
                <h2>
                  <Ether />
                  {formatNum(collectionStats.thirty_day_volume, 0)}
                </h2>
              </div>
            </>
          )}
        </div>
      )}
      <div className={styles.titleContainer}>
        <h2>Find A Whoopsie</h2>
        <hr />
      </div>
      {floorItems && (
        <div className={styles.floorItemsContainer}>
          {floorItems.map((item, idx) => (
            <div className={styles.whoopCard} key={idx}>
              <img alt="whoopsie" src={item.image_url} />
              <div className={styles.itemDetails}>
                <h2>{item.name}</h2>
                {item.seaport_sell_orders && (
                  <h2>
                    <Ether />{" "}
                    {formatEth(item.seaport_sell_orders[0].current_price)}
                  </h2>
                )}
                {!item.seaport_sell_orders && <h2>Unlisted</h2>}
              </div>
              <div className={styles.itemDetails}>
                <a
                  href={`https://opensea.io/assets/ethereum/0x565abc3feaa3bc3820b83620f4bbf16b5c4d47a3/${item.token_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.actionButton}
                >
                  BUY NOW
                </a>
                <a
                  href={`/details/${item.token_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.actionButton}
                >
                  VIEW DETAILS
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
