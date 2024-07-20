import { useState } from "react";

import LoginModal from "../LoginModal/LoginModal";

import styles from "./styles.module.scss";
import RaffleLogin from "../RaffleLogin/RaffleLogin";

export default function StakingLogin() {
  const [openModal, setOpenModal] = useState(false);
  const [openInfo, setOpenInfo] = useState(false);

  return (
    <>
      {openModal && <LoginModal setOpenModal={setOpenModal} holder={true} />}
      <div className={styles.stakingContainer}>
        {!openInfo ? (
          <div className={styles.welcomeContainer}>
            <RaffleLogin
              heading={"Welcome to the battle!"}
              tag={"Connect your wallet to join the fight!"}
            />
          </div>
        ) : (
          <div className={styles.infoContainer}>
            <div className={styles.infoActions}>
              <div className={styles.infoActionsInner}>
                <p>
                  Whoopsies, are four factions of neighboring aliens from the
                  planet Ma'a. Their ancestors created the universe as we know
                  it. The Whoopsies forced to flee from their home planet in
                  order to survive and preserve their unique DNA. Their
                  strongest warriors and not long ago - friendly factions,
                  landed on planet Earth in search of new homes.
                </p>
                <p>
                  Once they landed, the families started discovering new lands
                  and developing their homes. In the search of valuable
                  resources, the Whoopsies located some strange rocks. Some kind
                  of rose-colored obsidian that they now called "Doop" that
                  brings them immense power. After bringing their findings to
                  their tribe leaders a war amongst the tribes broke out fueld
                  by their new obsession.
                </p>
                <p>
                  Each tribe wanted to have all of the Doop gems and be
                  independent from each other. Now, every moon, they gather for
                  a battle powered by Doops they collect. Which tribe wins next
                  moon really depends on the number of collected gems . Whose
                  side are you on?
                </p>
              </div>
              <button
                onClick={() => setOpenModal(true)}
                className={styles.button}
              >
                JOIN THE FIGHT!
              </button>
            </div>
          </div>
        )}
        <svg
          className={styles.infoButton}
          onClick={() => setOpenInfo(!openInfo)}
          clipRule="evenodd"
          fillRule="evenodd"
          strokeLinejoin="round"
          strokeMiterlimit="2"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="m12.002 2.005c5.518 0 9.998 4.48 9.998 9.997 0 5.518-4.48 9.998-9.998 9.998-5.517 0-9.997-4.48-9.997-9.998 0-5.517 4.48-9.997 9.997-9.997zm0 8c-.414 0-.75.336-.75.75v5.5c0 .414.336.75.75.75s.75-.336.75-.75v-5.5c0-.414-.336-.75-.75-.75zm-.002-3c-.552 0-1 .448-1 1s.448 1 1 1 1-.448 1-1-.448-1-1-1z"
            fillRule="nonzero"
          />
        </svg>
      </div>
    </>
  );
}
