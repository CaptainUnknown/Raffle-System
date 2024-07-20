import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";

import StakingHeader from "../../components/StakingHeader/StakingHeader";

import styles from "./styles.module.scss";
import background from "../../assets/staking/mobileBG.png";

export default function History() {
  const { Moralis } = useMoralis();
  const [poolInfo, setPoolInfo] = useState();

  const getPoolInfo = async () => {
    const Pool = Moralis.Object.extend("pools");
    const query = new Moralis.Query(Pool);
    const sortDsc = query.descending("createdAt");
    const results = await sortDsc.find();
    setPoolInfo(results);
  };

  useEffect(() => {
    getPoolInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <StakingHeader />
      <div className={styles.historyContainer}>
        <div className={styles.tableWrapper}>
          <img
            src={background}
            alt="background"
            className={styles.background}
          />
          <div className={styles.tableHeader}>
            <p>Pool #</p>
            <p>Kelta</p>
            <p>Casa</p>
            <p>Manu</p>
            <p>Lanu</p>
            <p>Reward</p>
          </div>
          <div className={styles.historyTable}>
            {poolInfo &&
              poolInfo.map((pool, idx) => (
                <div className={styles.tableRow} key={idx}>
                  <p>{poolInfo.length - idx}</p>
                  <p>
                    {pool.attributes.totalKeltaPower.toLocaleString("en-US")}
                  </p>
                  <p>
                    {pool.attributes.totalCasaPower.toLocaleString("en-US")}
                  </p>
                  <p>
                    {pool.attributes.totalManuPower.toLocaleString("en-US")}
                  </p>
                  <p>
                    {pool.attributes.totalLanuPower.toLocaleString("en-US")}
                  </p>
                  <p>{pool.attributes.rewardTotal.toLocaleString("en-US")}</p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  );
}
