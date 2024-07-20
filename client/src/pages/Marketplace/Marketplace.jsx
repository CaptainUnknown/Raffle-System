import React, { useState, useEffect } from "react";
import "./Marketplace.scss";
import { Tabs } from "antd";
import Navbar from "../../components/NavBar/NavBar";
import ListingCard from "../../components/ListingCard/ListingCard";
import MarketplaceInteract from "../../context/MarketplaceInteract";
import { marketplaceContractAddress, openSeaAPIKey } from "../../Constant/constants";
import { ReactComponent as Loading } from "../../assets/icons/loading.svg";
import { useMoralis } from "react-moralis";
import {parseRaffles} from "../../context/raffles";
import { useAccount } from "wagmi";
import RaffleRelayContract from "../../context/RaffleRelayInteract";
import axios from "axios";

const { TabPane } = Tabs;

export default function Marketplace() {
  // const allRaffles = JSON.parse(JSON.stringify(parseRaffles(onGoing.toString(), ended.toString())));

  return (
    <>
    </>
  );
}
