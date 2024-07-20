import React, { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { useAccount } from "wagmi";

import Analytics from "../../components/Analytics/Analytics";
import DashNav from "../../components/DashNav/DashNav";
import Rarity from "../../components/Rarity/Rarity";

import styles from "./styles.module.scss";
import DashHome from "../../components/DashHome/DashHome";
import useWhoopCheck from "../../Hooks/useWhoopCheck";
import CollectionDetails from "../../components/CollectionDetails/collectionDetails";

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const { checkWhoop, checkQuirkies, checkQuirklings, checkRooms } =
    useWhoopCheck();

  const [holder, setHolder] = useState(false);

  useEffect(() => {
    !address && !isConnected && setHolder(false);
    if (address && isConnected) {
      let whoopRes = checkWhoop();
      let quirkiesRes = checkQuirkies();
      let quirklingsRes = checkQuirklings();
      let roomsRes = checkRooms();
      if (whoopRes || quirkiesRes || quirklingsRes || roomsRes) {
        setHolder(true);
      } else {
        setHolder(false);
      }
    } else {
      setHolder(false);
    }
    // eslint-disable-next-line
  }, [isConnected, address]);

  return (
    <div className={styles.dashboardContainer}>
      <DashNav holder={holder} />
      <Routes>
        <Route index element={<DashHome />} />
        <Route
          path="/rarity"
          element={holder ? <Rarity holder={holder} /> : <DashHome />}
        />
        <Route
          path="/collection/:slug"
          element={holder ? <CollectionDetails /> : <DashHome />}
        />
        <Route
          path="/analytics"
          element={holder ? <Analytics /> : <DashHome />}
        />
      </Routes>
    </div>
  );
}
