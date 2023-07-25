import React /* , { useState } */ from "react";

import styles from "./styles.module.scss";
import roadMap from "../../assets/roadMap.png";

/* const roadMapSteps = [
  {
    
  },
  {
    title: 'Otherside Land acquisition',
    details: 'Pre mint Otherside (Otherdeed) land acquisition. Land will be acquired for a long term hold and eventual land exploration and development. Virtual meetup place.'
  },
  {
    title: '6125 Whoopsies Dropship landed.',
    details: 'Four Factions have landed on the blockchain, and will be marketed on popular marketplaces such as Opensea, Looksrare, and Rarible.'
  },
  {
    title: 'TCG Metaverse official Partnership',
    details: 'TCG Game trailer release and whoopsies land development. Community metaverse meetup place and explorations.'
  },
  {
    title: 'Whoopsies going to Metaverse conference (Last Vegas)',
    details: 'Metaverse Expo July 8-10 2022. Whoopsies attending expo to setup future collaborations and partnerships.'
  },
  {
    title: 'Staking',
    details: 'Gamified staking implementation. ERC 20 Token Development and Deployment Tokenomics.'
  },
  {
    title: '3D Avatars introduction ( for TCG Metaverse)',
    details: 'With the help of our Metaverse partners (TCG), Whoopsies will be developing 3D Avatars for the TCG Experience.'
  },
  {
    title: 'All Four Factions will be deployed to the metaverse.',
    details: 'Each avatar can be modified with traits and abilities during gaming experience. '
  },
  {
    title: 'Raids Introduction',
    details: 'Projects that we are collaborating with will be introduced to the Whoopsies community. NFT Tokens from partnering projects will be raffled among faction owners during our raids.'
  },
  {
    title: 'Star Doopsies Limited 1/1 Collection',
    details: 'Limited collection of 300 pieces will be airdropped to most active and most contributive members of our community. The collection will be featuring artists from all around web3'
  },
  {
    title: 'Holder giveaways and Community donations',
    details: 'The community will vote on donations to be made. ( Smaller projects / Research centers / Medical )'
  }
] */

export default function RoadMap() {
  /*  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(null);

  const openModal = (num) => {
    setStep(num);
    setOpen(true);
  }; */

  return (
    <div id="roadMap" className={styles.roadMapContainer}>
      <div className={styles.rotateContainer}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M12 0c3.31 0 6.291 1.353 8.459 3.522l2.48-2.48 1.061 7.341-7.437-.966 2.489-2.489c-1.808-1.807-4.299-2.928-7.052-2.928-5.514 0-10 4.486-10 10s4.486 10 10 10c3.872 0 7.229-2.216 8.89-5.443l1.717 1.046c-2.012 3.803-6.005 6.397-10.607 6.397-6.627 0-12-5.373-12-12s5.373-12 12-12z" />
        </svg>
        <p>Rotate Your Phone to see the roadmap.</p>
      </div>
      <img src={roadMap} alt="whoopsies roadmap" />
      {/* {open && step && <div onClick={() => setOpen(false)} className={styles.roadmapDeatailsBg}>
          <div  className={styles.roadmapDeatailsModal}>
            <h2>{roadMapSteps[step].title}</h2>
            <p>{roadMapSteps[step].details}</p>
          </div>
        </div>}
        <button onClick={() => openModal(1)} className={styles.step0}> <span className={styles.pulse}></span></button>
        <button onClick={() => openModal(2)} className={styles.step1}> <span className={styles.pulse}></span></button>
        <button onClick={() => openModal(3)} className={styles.step2}> <span className={styles.pulse}></span></button>
        <button onClick={() => openModal(4)} className={styles.step3}> <span className={styles.pulse}></span></button>
        <button onClick={() => openModal(5)} className={styles.step4}> <span className={styles.pulse}></span></button>
        <button onClick={() => openModal(6)} className={styles.step5}> <span className={styles.pulse}></span></button>
        <button onClick={() => openModal(7)} className={styles.step6}> <span className={styles.pulse}></span></button>
        <button onClick={() => openModal(8)} className={styles.step7}> <span className={styles.pulse}></span></button>
        <button onClick={() => openModal(9)} className={styles.step8}> <span className={styles.pulse}></span></button>
        <button onClick={() => openModal(10)} className={styles.step9}> <span className={styles.pulse}></span></button> */}
    </div>
  );
}
