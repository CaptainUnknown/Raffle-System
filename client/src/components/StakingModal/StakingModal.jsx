import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  casaPower,
  eaAddress,
  eaPower,
  keltaPower,
  lanuPower,
  manuPower,
  oneOfOnePower,
  whoopAddress,
} from "../../Constant/constants";

import styles from "./styles.module.scss";

export default function StakingModal({
  staker,
  pool,
  owned,
  selectedToken,
  setStakingModal,
}) {
  const [contract, setContract] = useState(null);
  const [selectedFaction, setSelectedFaction] = useState("Kelta");
  const [selectOpen, setSelectOpen] = useState(false);

  useEffect(() => {
    if (!owned || !selectedToken) return;
    if (selectedToken.meta.name.includes("WD")) {
      setContract(whoopAddress);
    } else {
      setContract(eaAddress);
    }
    // eslint-disable-next-line
  }, []);

  const handleStakeSingle = async () => {
    if (
      staker.attributes.whoopIds &&
      staker.attributes.whoopIds.includes(Number(selectedToken.id))
    )
      return;

    let id = Number(selectedToken.id);
    let faction = selectedToken.meta.attributes.filter(
      (trait) => trait.trait_type === "Faction"
    )[0].value;
    if (faction === "Kelta") {
      let whoopObj = {
        id: id,
        faction: 0,
      };
      staker.increment("keltaPower", keltaPower);
      staker.addUnique("whoopFactions", whoopObj);
      pool.increment("totalKeltaPower", keltaPower);
    } else if (faction === "Casa") {
      let whoopObj = {
        id: id,
        faction: 1,
      };
      staker.increment("casaPower", casaPower);
      staker.addUnique("whoopFactions", whoopObj);
      pool.increment("totalCasaPower", casaPower);
    } else if (faction === "Manu") {
      let whoopObj = {
        id: id,
        faction: 2,
      };
      staker.increment("manuPower", manuPower);
      staker.addUnique("whoopFactions", whoopObj);
      pool.increment("totalManuPower", manuPower);
    } else if (faction === "Lanu") {
      let whoopObj = {
        id: id,
        faction: 3,
      };
      staker.increment("lanuPower", lanuPower);
      staker.addUnique("whoopFactions", whoopObj);
      pool.increment("totalLanuPower", lanuPower);
    }
    staker.addUnique("whoopIds", id);
    await pool.save();
    await staker.save();
    toast.success("Staked Successfully!");
    setStakingModal(false);
  };

  const handleStakeByFaction = async () => {
    owned.whoops.forEach((token) => {
      if (
        (staker.attributes.whoopIds &&
          staker.attributes.whoopIds.includes(Number(token.id))) ||
        token.meta.attributes.filter(
          (trait) => trait.trait_type === "Faction"
        )[0].value !== selectedFaction ||
        Number(token.id) === 1000 ||
        Number(token.id) === 2000 ||
        Number(token.id) === 3000 ||
        Number(token.id) === 4000 ||
        Number(token.id) === 5000 ||
        Number(token.id === 6100)
      ) {
        return;
      }
      let id = Number(token.id);
      let faction = token.meta.attributes.filter(
        (trait) => trait.trait_type === "Faction"
      )[0].value;
      if (faction === "Kelta") {
        let whoopObj = {
          id: id,
          faction: 0,
        };
        staker.increment("keltaPower", keltaPower);
        staker.addUnique("whoopFactions", whoopObj);
        pool.increment("totalKeltaPower", keltaPower);
      } else if (faction === "Casa") {
        let whoopObj = {
          id: id,
          faction: 1,
        };
        staker.increment("casaPower", casaPower);
        staker.addUnique("whoopFactions", whoopObj);
        pool.increment("totalCasaPower", casaPower);
      } else if (faction === "Manu") {
        let whoopObj = {
          id: id,
          faction: 2,
        };
        staker.increment("manuPower", manuPower);
        staker.addUnique("whoopFactions", whoopObj);
        pool.increment("totalManuPower", manuPower);
      } else if (faction === "Lanu") {
        let whoopObj = {
          id: id,
          faction: 3,
        };
        staker.increment("lanuPower", lanuPower);
        staker.addUnique("whoopFactions", whoopObj);
        pool.increment("totalLanuPower", lanuPower);
      }
      staker.addUnique("whoopIds", id);
    });
    await pool.save();
    await staker.save();
    toast.success("Staked Successfully!");
    setStakingModal(false);
  };

  const handleStakeAll = async () => {
    owned.whoops.forEach((token) => {
      if (
        (staker.attributes.whoopIds &&
          staker.attributes.whoopIds.includes(Number(token.id))) ||
        Number(token.id) === 1000 ||
        Number(token.id) === 2000 ||
        Number(token.id) === 3000 ||
        Number(token.id) === 4000 ||
        Number(token.id) === 5000 ||
        Number(token.id === 6100)
      )
        return;
      let id = Number(token.id);
      let faction = token.meta.attributes.filter(
        (trait) => trait.trait_type === "Faction"
      )[0].value;
      if (faction === "Kelta") {
        let whoopObj = {
          id: id,
          faction: 0,
        };
        staker.increment("keltaPower", keltaPower);
        staker.addUnique("whoopFactions", whoopObj);
        pool.increment("totalKeltaPower", keltaPower);
      } else if (faction === "Casa") {
        let whoopObj = {
          id: id,
          faction: 1,
        };
        staker.increment("casaPower", casaPower);
        staker.addUnique("whoopFactions", whoopObj);
        pool.increment("totalCasaPower", casaPower);
      } else if (faction === "Manu") {
        let whoopObj = {
          id: id,
          faction: 2,
        };
        staker.increment("manuPower", manuPower);
        staker.addUnique("whoopFactions", whoopObj);
        pool.increment("totalManuPower", manuPower);
      } else if (faction === "Lanu") {
        let whoopObj = {
          id: id,
          faction: 3,
        };
        staker.increment("lanuPower", lanuPower);
        staker.addUnique("whoopFactions", whoopObj);
        pool.increment("totalLanuPower", lanuPower);
      }
      staker.addUnique("whoopIds", id);
    });

    await pool.save();
    await staker.save();
    toast.success("Staked Successfully!");
    setStakingModal(false);
  };

  const handleStakeOneOfOne = async () => {
    if (
      staker.attributes.whoopIds &&
      staker.attributes.whoopIds.includes(Number(selectedToken.id))
    )
      return;
    let id = Number(selectedToken.id);
    staker.addUnique("whoopIds", id);
    if (selectedFaction === "Kelta") {
      staker.increment("keltaPower", oneOfOnePower);
      let factionInfo = {
        id: id,
        faction: 0,
      };
      staker.add("oneOfOneFactions", factionInfo);
      pool.increment("totalKeltaPower", oneOfOnePower);
    }
    if (selectedFaction === "Casa") {
      staker.increment("casaPower", oneOfOnePower);
      let factionInfo = {
        id: id,
        faction: 1,
      };
      staker.add("oneOfOneFactions", factionInfo);
      pool.increment("totalCasaPower", oneOfOnePower);
    }
    if (selectedFaction === "Manu") {
      staker.increment("manuPower", oneOfOnePower);
      let factionInfo = {
        id: id,
        faction: 2,
      };
      staker.add("oneOfOneFactions", factionInfo);
      pool.increment("totalManuPower", oneOfOnePower);
    }
    if (selectedFaction === "Lanu") {
      staker.increment("lanuPower", oneOfOnePower);
      let factionInfo = {
        id: id,
        faction: 3,
      };
      staker.add("oneOfOneFactions", factionInfo);
      pool.increment("totalLanuPower", oneOfOnePower);
    }
    await pool.save();
    await staker.save();
    toast.success("Staked Successfully!");
    setStakingModal(false);
  };

  const handleStakeEA = async () => {
    if (
      staker.attributes.eaIds &&
      staker.attributes.eaIds.includes(Number(selectedToken.id))
    )
      return;
    let id = Number(selectedToken.id);
    staker.addUnique("eaIds", id);
    if (selectedFaction === "Kelta") {
      staker.increment("keltaPower", eaPower);
      let factionInfo = {
        id: id,
        faction: 0,
      };
      staker.add("eaFactions", factionInfo);
      pool.increment("totalKeltaPower", eaPower);
    }
    if (selectedFaction === "Casa") {
      staker.increment("casaPower", eaPower);
      let factionInfo = {
        id: id,
        faction: 1,
      };
      staker.add("eaFactions", factionInfo);
      pool.increment("totalCasaPower", eaPower);
    }
    if (selectedFaction === "Manu") {
      staker.increment("manuPower", eaPower);
      let factionInfo = {
        id: id,
        faction: 2,
      };
      staker.add("eaFactions", factionInfo);
      pool.increment("totalManuPower", eaPower);
    }
    if (selectedFaction === "Lanu") {
      staker.increment("lanuPower", eaPower);
      let factionInfo = {
        id: id,
        faction: 3,
      };
      staker.add("eaFactions", factionInfo);
      pool.increment("totalLanuPower", eaPower);
    }
    await pool.save();
    await staker.save();
    toast.success("Staked Successfully!");
    setStakingModal(false);
  };

  return (
    <div className={styles.stakingModalContainer}>
      <div
        onClick={() => setStakingModal(false)}
        className={styles.stakingModalBG}
      />
      {contract === whoopAddress &&
      Number(selectedToken.id) !== 1000 &&
      Number(selectedToken.id) !== 2000 &&
      Number(selectedToken.id) !== 3000 &&
      Number(selectedToken.id) !== 4000 &&
      Number(selectedToken.id) !== 5000 &&
      Number(selectedToken.id) !== 6100 ? (
        <div className={styles.stakingModalContent}>
          <div className={styles.stakingModalAction}>
            STAKE ONE
            <button onClick={() => handleStakeSingle()}>CONFIRM</button>
          </div>
          <div className={styles.stakingModalAction}>
            STAKE BY FACTION
            <div
              className={styles.openDrop}
              onClick={() => setSelectOpen(!selectOpen)}
            >
              {selectedFaction}
            </div>
            <div
              onClick={() => setSelectOpen(!selectOpen)}
              className={styles.drop}
            >
              {selectOpen && (
                <>
                  <div className={styles.dropOuter} />
                  <div className={styles.dropInner}>
                    <span
                      onClick={() => setSelectedFaction("Kelta")}
                      className={styles.dropItem}
                    >
                      Kelta
                    </span>
                    <span
                      onClick={() => setSelectedFaction("Casa")}
                      className={styles.dropItem}
                    >
                      Casa
                    </span>
                    <span
                      onClick={() => setSelectedFaction("Manu")}
                      className={styles.dropItem}
                    >
                      Manu
                    </span>
                    <span
                      onClick={() => setSelectedFaction("Lanu")}
                      className={styles.dropItem}
                    >
                      Lanu
                    </span>
                  </div>
                </>
              )}
            </div>
            <button onClick={() => handleStakeByFaction()}>CONFIRM</button>
          </div>
          <div className={styles.stakingModalAction}>
            STAKE ALL
            <button onClick={() => handleStakeAll()}>CONFIRM</button>
          </div>
        </div>
      ) : (
        <div className={styles.stakingModalEaContent}>
          <div className={styles.stakingModalEaAction}>
            SELECT FACTION TO AID
            <div
              className={styles.openDrop}
              onClick={() => setSelectOpen(!selectOpen)}
            >
              {selectedFaction}
            </div>
            <div
              onClick={() => setSelectOpen(!selectOpen)}
              className={styles.drop}
            >
              {selectOpen && (
                <div className={styles.dropInner}>
                  <span
                    onClick={() => setSelectedFaction("Kelta")}
                    className={styles.dropItem}
                  >
                    Kelta
                  </span>
                  <span
                    onClick={() => setSelectedFaction("Casa")}
                    className={styles.dropItem}
                  >
                    Casa
                  </span>
                  <span
                    onClick={() => setSelectedFaction("Manu")}
                    className={styles.dropItem}
                  >
                    Manu
                  </span>
                  <span
                    onClick={() => setSelectedFaction("Lanu")}
                    className={styles.dropItem}
                  >
                    Lanu
                  </span>
                </div>
              )}
            </div>
            {contract === eaAddress && (
              <button onClick={() => handleStakeEA()}>CONFIRM</button>
            )}
            {contract === whoopAddress && (
              <button onClick={() => handleStakeOneOfOne()}>CONFIRM</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
