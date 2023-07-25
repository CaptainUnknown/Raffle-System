import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useNetwork } from "wagmi";
import Moralis from "moralis-v1";

import "./App.scss";

import Home from "./pages/HomePage/Home.jsx";
import Details from "./pages/DetailsPage/Details";
import NotFound from "./components/NotFound/NotFound";
import Dashboard from "./pages/Dashboard/Dashboard";
import "react-toastify/dist/ReactToastify.css";
import Raffle from "./pages/Raffle/Raffle";
import RaffleInfo from "./pages/Raffle/RaffleInfo/RaffleInfo";
// import Marketplace from "./pages/Marketplace/Marketplace";
import Claim from "./pages/Claim/Claim";
import ChainSwitch from "./pages/ChainSwitch/ChainSwitch";

const serverUrl = process.env.REACT_APP_MORALIS_SERVER_URL;
const appId = process.env.REACT_APP_MORALIS_APP_ID;

export default function App() {
  const { pathname, hash, key } = useLocation();
  const { chain } = useNetwork();
  const [currentChainId, setCurrentChainId] = useState();
  Moralis.start({ serverUrl, appId });

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
        <Route exact path="/" element={<Raffle />} />
        <Route exact path="/about" element={<Home />} />
        <Route path="/raffle" element={
            currentChainId === 1 || !currentChainId ? (
              <Raffle />
            ) : (
              <ChainSwitch />
            )
          }
        />
          <Route path="/raffle/:id" element={
              currentChainId === 1 || !currentChainId ? (
                  <RaffleInfo />
              ) : (
                  <ChainSwitch />
              )
          }
          />

          <Route path="/claim" element={
              // TODO: Change to 80001 for Testnet
              currentChainId === 1 || !currentChainId ? (
                  <Claim />
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
