import React from "react"

import styles from './styles.module.scss';
import About from "../../components/About/About";
import VideoSection from "../../components/videoSection/VideoSection";
import RoadMap from "../../components/RoadMap/RoadMap";
import Team from "../../components/Team/Team";
import Gallery from "../../components/Gallery/Gallery";
import NavBar from "../../components/NavBar/NavBar";
import AboutDashBoard from "../../components/AboutDashboard/AboutDashBoard";
import Announcement from "../../components/Announcement/Announcement";

export default function Home() {
  return (
    <>
     <NavBar />
        <div style={{overflowX: "hidden"}}>
            <Announcement title={'All new Whoopsies are here!'} content={'Claim your new tokens now! Transformation begins with you!'} CTALink={'claim-v2'} CTA={'Claim Now'} logoVisibility={true}/>
            <VideoSection />
            <AboutDashBoard />
            <About />
            <RoadMap />
            <Team />
        </div>
        {/*
        <Gallery />
        */}
      <div className={styles.homeContainer}>
      </div>
    </>
  )
}