import React, { useState, useEffect } from "react";
import "./Raffle.scss";
import { Tabs } from "antd";
import Navbar from "../../components/NavBar/NavBar";
import RaffleCard from "../../components/RaffleCard/RaffleCard";
import RaffleActivity from "../../components/RaffleActivity/RaffleActivity";
import { raffleContractAddress, openSeaAPIKey } from "../../Constant/constants";
import { topic0, topic0ID, topic1, topic1ID } from "../../context/topic";
import { ReactComponent as Loading } from "../../assets/icons/loading.svg";
import { useMoralis } from "react-moralis";
import {parseRaffles} from "../../context/raffles";
import RaffleAllowance from "../../components/RaffleAllowance/RaffleAllowance";
import { useAccount } from "wagmi";
import RaffleRelayContract from "../../context/RaffleRelayInteract";
import axios from "axios";
import RaffleContract from "../../context/interact";

const { TabPane } = Tabs;

export default function Raffle() {
  // Context
  const { Moralis, isInitialized } = useMoralis();
  const { address, isConnecting, isDisconnected } = useAccount();

  // Raffles
  const [raffles, setRaffles] = useState([]);
  const [liveRaffles, setLiveRaffles] = useState(0);
  const [completedRaffles, setCompletedRaffles] = useState(0);
  const [metadata, setMetadata] = useState([])
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const getMetadata = async (raffs) => {
      let reqUrl = 'https://api.opensea.io/api/v1/assets?';
      raffs.forEach((raffle, index) => {
        reqUrl += `token_ids=${parseInt(raffle.nftTokenId)}&asset_contract_addresses=${raffle.nftContract}`;
        if (index !== raffs.length - 1) {
          reqUrl += '&';
        }
      });
      reqUrl += '&order_direction=desc&limit=20';
      console.log(reqUrl);

      return axios.get(reqUrl, {
        headers: { "X-API-KEY": openSeaAPIKey },
      });
    }
    const sortDataByRaffles = (data, allRaffles) => {
      console.log('SortDataByRaffles _raffleInfo', data);
      return data.sort((a, b) => {
        const aIndex = allRaffles.findIndex(raffle => raffle.nftContract.toLowerCase() === a.asset_contract.address && raffle.nftTokenId === a.token_id);
        const bIndex = allRaffles.findIndex(raffle => raffle.nftContract.toLowerCase() === b.asset_contract.address && raffle.nftTokenId === b.token_id);
        return aIndex - bIndex;
      });
    }
    const getRaffles = async () => {
      const raffleRelayContract = new RaffleRelayContract();
      const onGoing = await raffleRelayContract.getOnGoing();
      const ended = await raffleRelayContract.getEnded();
      const allRaffles = JSON.parse(JSON.stringify(parseRaffles(onGoing.toString(), ended.toString())));

      allRaffles.sort((a, b) => b.raffleId - a.raffleId);
      const {data} = await getMetadata(allRaffles);
      console.log('REQUEST _raffleInfo', allRaffles);
      console.log('METADATA _raffleInfo', data);
      const sortedData = sortDataByRaffles(JSON.parse(JSON.stringify(data.assets)), allRaffles);
      console.log('SORTED METADATA _raffleInfo', sortedData);

      setMetadata(sortedData);
      setRaffles(allRaffles);
      setIsLoading(false);
    }

    if (!isInitialized) return;
    getRaffles();
  }, [isInitialized]);

  useEffect(() => {
    let liveCount = 0;
    raffles.forEach((raffle) => {
      console.log("raffle _raffleInfo", raffle);
      console.log("raffle.hasEnded _raffleInfo", raffle.hasEnded);
      if (!raffle.hasEnded) liveCount++;
      setLiveRaffles(liveCount);
      setCompletedRaffles(raffles.length - liveCount);
    });
    console.log("Live Raffles _raffleInfo: ", liveRaffles);
    console.log("Completed Raffles _raffleInfo: ", completedRaffles);
    // eslint-disable-next-line
  }, [raffles]);

  useEffect(() => {
    if (isLoading || !isInitialized || !isLoadingActivity) return;
    const getActivities = async () => {
      const startedResponse = await Moralis.Cloud.run("getActivity", {
        address: raffleContractAddress,
        topic: topic0ID,
        abi: topic0,
      });

      console.log("isLoading _raffleInfo: ", isLoading);
      console.log("isInitialized _raffleInfo: ", isInitialized);
      console.log("Started Response _raffleInfo: ", startedResponse);
      console.log(startedResponse.result);

      const endedActivities = await Moralis.Cloud.run('getActivity', {
          address: raffleContractAddress,
          topic: topic1ID,
          abi: topic1
      });

      const activities = [
        ...startedResponse.result.map((activity) => ({
          isStart: true,
          activity,
        })),
        ...endedActivities.result.map((activity) => ({
          isStart: false,
          activity,
        })),
      ];

      const sortedActivities = activities.sort(
        (a, b) =>
          new Date(b.activity.block_timestamp) -
          new Date(a.activity.block_timestamp)
      );
      setActivities(sortedActivities);
      console.log("Sorted Activities _raffleInfo: ", sortedActivities);
      console.log("Activities _raffleInfo: ", activities);
      setIsLoadingActivity(false);
    };

    getActivities();
    // eslint-disable-next-line
  }, [isLoading]);

  useEffect(() => {
    console.log("%cWhoopDoop Raffle v0.2.5", "color: #0aab15; font-weight: bold; font-size: 28px;");
    console.log("%cDeveloped by Captain Unknown", "color: #7be728; font-weight: bold; font-size: 16px;");
    console.log("%chttps://twitter.com/CaptainUnknown5", "color: blue; font-size: 8px;");
    function handleResize() {
      setScreenWidth(window.innerWidth);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <Navbar />
      <br />

      {
        <div className="raffle">
          { (!isLoading && address && !isConnecting) && <RaffleAllowance /> }
          <Tabs defaultActiveKey="1">
            <TabPane tab={screenWidth >= 860 ? `Live Now (${liveRaffles})` : `Live`} key="1">
              <div
                className="onGoing"
                style={{
                  gridTemplateColumns: isLoading
                    ? "repeat(auto-fit, minmax(350px, 1fr))"
                    : "repeat(auto-fit, minmax(350px, 0fr))",
                }}
              >
                { isLoading ? (
                  <>
                    <div className="noRaffles">
                      {" "}
                      Loading Raffles...
                      <Loading />
                    </div>
                  </>
                ) : liveRaffles === 0 ? (
                  <div className="noRaffles"> No On Going Raffles :( </div>
                ) : (
                  raffles.map(
                    (raffle, index) =>
                      !raffle.hasEnded && <RaffleCard raffle={raffle} meta={metadata[index]}/>
                  )
                )}
              </div>
            </TabPane>
            <TabPane tab={screenWidth >= 860 ? `Completed (${completedRaffles})` : `Ended`} key="2">
              <div
                className="onGoing"
                style={{
                  gridTemplateColumns: isLoading
                    ? "repeat(auto-fit, minmax(350px, 1fr))"
                    : "repeat(auto-fit, minmax(350px, 0fr))",
                }}
              >
                { isLoading ? (
                  <>
                    <div className="noRaffles">
                      {" "}
                      Loading Raffles...
                      <Loading />
                    </div>
                  </>
                ) : completedRaffles === 0 ? (
                  <div className="noRaffles"> No Completed Raffles yet </div>
                ) : (
                  raffles.map(
                    (raffle, index) =>
                      raffle.hasEnded && <RaffleCard raffle={raffle} meta={metadata[index]}/>
                  )
                )}
              </div>
            </TabPane>
            {
              screenWidth >= 600 &&
                <TabPane tab={`Activity`} key="3">
                  <div
                    className="onGoing"
                    style={{
                      gridTemplateColumns: isLoadingActivity
                        ? "repeat(auto-fit, minmax(350px, 1fr))"
                        : "1fr",
                    }}
                  >
                    {isLoadingActivity ? (
                      <>
                        <div className="noRaffles">
                          {" "}
                          Loading Activity...
                          <Loading />
                        </div>
                      </>
                    ) : activities.length === 0 ? (
                      <div className="noRaffles"> * Cricket chirping * </div>
                    ) : (
                      activities.map((activity, index) => (
                        <RaffleActivity
                          activity={activity.activity}
                          isStarted={activity.isStart}
                        />
                      ))
                    )}
                  </div>
                </TabPane>
            }
          </Tabs>
        </div>
      }
    </>
  );
}
