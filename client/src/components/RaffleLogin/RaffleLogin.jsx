import { useState } from "react";
import LoginModal from "../LoginModal/LoginModal";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import styles from "./styles.module.scss";

export default function RaffleLogin({ handleConnect, heading, tag }) {
  const [openModal, setOpenModal] = useState(false);
  const [openInfo, setOpenInfo] = useState(false);

  return (
    <>
      {openModal && (
        <LoginModal
          setOpenModal={setOpenModal}
          holder={true}
          onConnect={handleConnect}
        />
      )}
      <div className={styles.raffleLoginContainer}>
        {!openInfo ? (
          <div className={styles.welcomeContainer}>
            <div className={styles.welcomeActions}>
              <h1>{ heading || 'Feeling Lucky?'}</h1>
              <h3>{tag ?? 'Connect To Join'}</h3>
              <ConnectButton/>
            </div>
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
              <ConnectButton/>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
