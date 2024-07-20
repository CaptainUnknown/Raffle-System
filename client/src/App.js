import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useNetwork } from "wagmi";

import "./App.scss";

import Home from "./pages/HomePage/Home.jsx";
import Details from "./pages/DetailsPage/Details";
import NotFound from "./components/NotFound/NotFound";
import Dashboard from "./pages/Dashboard/Dashboard";
import Staking from "./pages/Staking/Staking";
import "react-toastify/dist/ReactToastify.css";
import Raffle from "./pages/Raffle/Raffle";
import RaffleInfo from "./pages/Raffle/RaffleInfo/RaffleInfo";
import Bridge from "./pages/Bridge/Bridge";
import Unwrap from "./pages/Unwrap/Unwrap"
// import Marketplace from "./pages/Marketplace/Marketplace";
import MVPEdit from "./pages/MVPEdit/MVPEdit";
import Claim from "./pages/Claim/Claim";
import ClaimV2 from "./pages/V2Claim/V2Claim";
import FAQ from "./pages/FAQ/FAQ";
import StakingUser from "./pages/StakingUser.js/StakingUser";
import ChainSwitch from "./pages/ChainSwitch/ChainSwitch";
import ChainSwitchForNova from "./pages/ChainSwitchForNova/ChainSwitchForNova";
import Owner from "./pages/Owner/Owner";
import History from "./pages/History/History";
import StakingLogs from "./pages/StakingLogs/StakingLogs";

export default function App() {
  const { pathname, hash, key } = useLocation();
  const { chain } = useNetwork();
  const [currentChainId, setCurrentChainId] = useState();

  useEffect(() => {
    if (hash === "") {
      window.scrollTo(0, 0);
    } else {
      setTimeout(() => {
        const id = hash.replace("#", "");
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView();
        }
      }, 0);
    }
  }, [pathname, hash, key]);

  useEffect(() => {
    if (chain) {
      setCurrentChainId(chain.id);
    } else {
      setCurrentChainId(0);
    }
  }, [chain]);

  return (
    <div className="main">
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route exact path="/about" element={<Home />} />
        <Route path="/raffle" element={
            currentChainId === 42170 || !currentChainId ? (
              <Raffle />
            ) : (
              <ChainSwitchForNova />
            )
          }
        />
          <Route path="/raffle/:id" element={
              currentChainId === 42170 || !currentChainId ? (
                  <RaffleInfo />
              ) : (
                  <ChainSwitchForNova />
              )
          }
          />

          <Route path="/bridge" element={
              currentChainId === 1 || !currentChainId ? (
                  <Bridge />
              ) : (
                  <ChainSwitch />
              )
          }
          />

          <Route path="/unwrap" element={
              currentChainId === 42170 || !currentChainId ? (
                  <Unwrap />
              ) : (
                  <ChainSwitchForNova />
              )
          }
          />

          <Route path="/claim" element={
              currentChainId === 1 || !currentChainId ? (
                  <Claim />
              ) : (
                  <ChainSwitch />
              )
          }
          />

          <Route path="/claim-v2" element={
              currentChainId === 1 || !currentChainId ? (
                  <ClaimV2 />
              ) : (
                  <ChainSwitch />
              )
          }
          />

          <Route path="/faq" element={<FAQ />}/>

          <Route path="/mvp-edit" element={
              currentChainId === 1 || !currentChainId ? (
                  <MVPEdit />
              ) : (
                  <ChainSwitch />
              )
          }
          />

          <Route path="/dashboard/*" element={<Dashboard />} />
        <Route exact path="/details/:id" element={<Details />} />
        <Route path="*" element={<NotFound replace />} />
      </Routes>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}
