import React from "react"


import styles from './styles.module.scss';
import About from "../../components/About/About";
import VideoSection from "../../components/videoSection/VideoSection";
import RoadMap from "../../components/RoadMap/RoadMap";
import Team from "../../components/Team/Team";
import Gallery from "../../components/Gallery/Gallery";
import NavBar from "../../components/NavBar/NavBar";
import AboutDashBoard from "../../components/AboutDashboard/AboutDashBoard";

export default function Home() {
  return (
    <>
     <NavBar />
      <div className={styles.homeContainer}>
        <VideoSection />
        <AboutDashBoard />
        <About />
        <RoadMap />
        <Team />
        <Gallery />
      </div>
    </>
  )
}