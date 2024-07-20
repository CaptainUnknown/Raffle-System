import React, { useState, useEffect } from "react";
import "./Raffle.scss";
import { Tabs } from "antd";
import { useAccount } from "wagmi";
import Navbar from "../../components/NavBar/NavBar";
import RaffleCard from "../../components/RaffleCard/RaffleCard";
import RaffleActivity from "../../components/RaffleActivity/RaffleActivity";
import { pastRafflesArchived } from "../../Constant/constants";
import { ReactComponent as Loading } from "../../assets/icons/loading.svg";
import { parseRaffles } from "../../context/raffles";
import RaffleAllowance from "../../components/RaffleAllowance/RaffleAllowance";
import RaffleRelayContract from "../../context/RaffleRelayInteract";
import Announcement from "../../components/Announcement/Announcement";
import { getWrappedNFTs } from "../../context/utils";

const { TabPane } = Tabs;

export default function Raffle() {
  // Context
  const { address, isConnecting, isDisconnected } = useAccount();

  // Raffles
  const [raffles, setRaffles] = useState([]);
  const [liveRaffles, setLiveRaffles] = useState(0);
  const [completedRaffles, setCompletedRaffles] = useState(0);
  const [metadata, setMetadata] = useState([])
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);
  const [hasWon, setHasWon] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const getRaffles = async () => {
      // Fetch Cached Raffles
      const cachedAllraffles = JSON.parse(localStorage.getItem(`raffles`));
      if (cachedAllraffles !== null) {
        await setRaffles(cachedAllraffles);
        setIsLoading(false);
        console.log(`Cached raffles found`, cachedAllraffles);
      }

      const raffleRelayContract = new RaffleRelayContract();
      const onGoing = await raffleRelayContract.getOnGoing();
      const ended = await raffleRelayContract.getEnded();
      console.log("ended from nova: ", ended.toString());
      console.log("ended from eth: ", pastRafflesArchived);

      const endedRaw = (ended.toString() + (ended.toString().length === 0 ? "" : ",") + pastRafflesArchived);
      const allRaffles = JSON.parse(JSON.stringify(parseRaffles(onGoing.toString(), endedRaw.toString())));
      console.log("ended: ", ended);
      console.log("onGoing: ", onGoing);
      return allRaffles;
    }

    getRaffles().then(allRaffles => {
      allRaffles.sort((a, b) => b.raffleId - a.raffleId);
      setRaffles(allRaffles);
      setIsLoading(false);
      localStorage.setItem(`raffles`, JSON.stringify(allRaffles));
    });
    getWrappedNFTs(address).then(foundWrappedTokens => {
      setHasWon(foundWrappedTokens.length > 0);
    });
  }, []);

  useEffect(() => {
    let liveCount = 0;
    raffles.forEach((raffle) => {
      if (!raffle.hasEnded) liveCount++;
      setLiveRaffles(liveCount);
      setCompletedRaffles(raffles.length - liveCount);
    });
    console.log("Live Raffles _raffleInfo: ", liveRaffles);
    console.log("Completed Raffles _raffleInfo: ", completedRaffles);
    // eslint-disable-next-line
  }, [raffles]);

  useEffect(() => {
    console.log("%cWhoopDoop Raffle v3.0", "color: #0aab15; font-weight: bold; font-size: 28px;");
    console.log("%cDeveloped by Captain Unknown", "color: #7be728; font-weight: bold; font-size: 16px;");
    console.log("%chttps://twitter.com/CaptainUnknown5", "color: blue; font-size: 8px;");
    function handleResize() { setScreenWidth(window.innerWidth) }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <Navbar />
      <br />

      { hasWon && <Announcement title={'Hooray! 🎉'} content={'It looks like you\'ve won a raffle! Unwrap your reward to Ethereum Mainnet now!'} CTALink={'unwrap'} CTA={'Unwrap Now'} logoVisibility={false}/>}
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
                      !raffle.hasEnded && <RaffleCard raffle={raffle} meta={metadata[index]} key={index}/>
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
                      raffle.hasEnded && <RaffleCard raffle={raffle} meta={metadata[index]} key={index}/>
                  )
                )}
              </div>
            </TabPane>
            {
              // TODO: Turn on Activities
              false && screenWidth >= 600 &&
                <TabPane tab={`Activity`} key="3">
                  <div className="onGoing"
                    style={{ gridTemplateColumns: isLoadingActivity ? "repeat(auto-fit, minmax(350px, 1fr))" : "1fr" }}
                  >
                    {isLoadingActivity ? (
                      <> <div className="noRaffles"> Loading Activity... <Loading /> </div> </>
                    ) : activities.length === 0 ? (
                      <div className="noRaffles"> * Crickets chirping * </div>
                    ) : (
                      activities.map((activity, index) => (
                        <RaffleActivity
                          activity={activity.activity}
                          isStarted={activity.isStart}
                          key={index}
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
