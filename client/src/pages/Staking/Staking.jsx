import { useEffect, useState } from "react";

import {
  useAccount,
  useContractReads,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";

import { toast } from "react-toastify";
import { useMoralis } from "react-moralis";

import styles from "./styles.module.scss";

import StakingLogin from "../../components/StakingLogin/StakingLogin";
import useMerkle from "../../Hooks/useMerkle.js";
import StakingHeader from "../../components/StakingHeader/StakingHeader";

import shield from "../../assets/staking/battleIcon.svg";
import battleProgress from "../../assets/staking/totalBattleProgressTrial.png";
import keltaProgress from "../../assets/staking/keltaProgress.png";
import casaProgress from "../../assets/staking/casaProgress.png";
import manuProgress from "../../assets/staking/manuProgress.png";
import lanuProgress from "../../assets/staking/lanuProgress.png";
import keltaStars from "../../assets/staking/keltaStars.png";
import casaStars from "../../assets/staking/casaStars.png";
import manuStars from "../../assets/staking/manuStars.png";
import lanuStars from "../../assets/staking/lanuStars.png";
import winnerBG from "../../assets/staking/victoryBG.svg";
import loserBG from "../../assets/staking/defeatBG.svg";
import animationBG from "../../assets/staking/animationBG.png";

import { stakingAddress } from "../../Constant/constants";
import abi from "../../ABI/stakeAbi.json";
import { CircularProgress } from "@mui/material";
import useStakingStats from "../../Hooks/useStakingStats";

export default function Staking() {
  const { Moralis } = useMoralis();
  const { address } = useAccount();
  const { generateTree, getProof, getKeccak } = useMerkle();
  const { findFactionStaked } = useStakingStats();
  const [currentPool, setCurrentPool] = useState(null);
  const [poolEnded, setPoolEnded] = useState(false);
  const [userPoolInfo, setUserPoolInfo] = useState(null);
  const [poolInfo, setPoolInfo] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [userIdx, setUserIdx] = useState(null);
  const [p, setP] = useState(null);
  const [l, setL] = useState(null);
  const [powerLevelsArr, setPowerLevelsArr] = useState([]);
  const [userLevelsArr, setUserLevelsArr] = useState([]);
  const [factionStaked, setFactionStaked] = useState({
    kelta: 0,
    casa: 0,
    manu: 0,
    lanu: 0,
  });
  const [battleProgressWidth, setBattleProgressWidth] = useState(0);
  const [keltaProgressWidth, setKeltaProgressWidth] = useState(0);
  const [casaProgressWidth, setCasaProgressWidth] = useState(0);
  const [manuProgressWidth, setManuProgressWidth] = useState(0);
  const [lanuProgressWidth, setLanuProgressWidth] = useState(0);
  const [userPoolWinner, setUserPoolWinner] = useState(null);
  const [poolReward, setPoolReward] = useState(0);
  const [timePercInterval, setTimePercInterval] = useState(null);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const { data } = useContractReads({
    contracts: [
      {
        addressOrName: stakingAddress,
        contractInterface: abi,
        functionName: "currentPool",
      },

      {
        addressOrName: stakingAddress,
        contractInterface: abi,
        functionName: "pools",
        args: [currentPool],
      },

      {
        addressOrName: stakingAddress,
        contractInterface: abi,
        functionName: "pools",
        args: [userIdx],
      },
    ],
    watch: true,
  });

  const {
    data: claimResponse,
    isLoading: claimLoading,
    isError: claimError,
    write: claim,
    isSuccess: claimSuccess,
  } = useContractWrite({
    mode: "recklesslyUnprepared",
    addressOrName: stakingAddress,
    contractInterface: abi,
    functionName: "claimSpoils",
    args: [powerLevelsArr, userLevelsArr, userIdx, p, l],
    onError(error) {
      toast.error(error.reason.replace(/execution reverted: /g, ""));
    },
  });

  const { isLoading: claimWaitLoading } = useWaitForTransaction({
    confirmations: 1,
    hash: claimResponse?.hash,
  });

  useEffect(() => {
    if (claimSuccess && !claimLoading && !claimError) {
      handleClaim();
      getUserInfo();
      getUserPoolInfo();
      toast.success("Claimed Successfully");
      setPoolEnded(false);
    }

    // eslint-disable-next-line
  }, [claimSuccess, claimLoading, claimResponse]);

  const checkClaim = () => {
    if (
      userInfo.attributes.address !== address &&
      userLevelsArr[0] !== userInfo.attributes.keltaPower &&
      userLevelsArr[1] !== userInfo.attributes.casaPower &&
      userLevelsArr[2] !== userInfo.attributes.manuPower &&
      userLevelsArr[3] !== userInfo.attributes.lanuPower
    ) {
      getUserInfo();
      return;
    } else {
      claim();
    }
  };

  const handleClaim = async () => {
    if (!userInfo || !poolInfo) {
      toast.error("Try Refreshing the page");
      return;
    }
    if (data[2].endTime * 1000 > new Date().getTime()) {
      toast.error("Pool has not ended yet.");
      return;
    }
    if (userInfo.attributes.poolIdx === poolInfo.attributes.poolIdx) {
      userInfo.set("poolIdx", currentPool + 1);
    } else {
      userInfo.set("poolIdx", currentPool);
    }
    userInfo.set("keltaPower", 0);
    userInfo.set("casaPower", 0);
    userInfo.set("manuPower", 0);
    userInfo.set("lanuPower", 0);
    userInfo.set("whoopIds", []);
    userInfo.set("whoopFactions", []);
    userInfo.set("oneOfOneFactions", []);
    userInfo.set("eaIds", []);
    userInfo.set("eaFactions", []);
    userInfo.set("whoopWeapons", []);
    userInfo.set("eaWeapons", []);
    userInfo.set("epicWhoopWeapons", []);
    userInfo.set("epicEaWeapons", []);
    await userInfo.save();
  };

  const handleContinue = async () => {
    if (!userInfo || !poolInfo) {
      toast.error("Try Refreshing the page");
      return;
    }
    if (userInfo.attributes.poolIdx === poolInfo.attributes.poolIdx) {
      userInfo.set("poolIdx", currentPool + 1);
    } else {
      userInfo.set("poolIdx", currentPool);
    }
    userInfo.set("keltaPower", 0);
    userInfo.set("casaPower", 0);
    userInfo.set("manuPower", 0);
    userInfo.set("lanuPower", 0);
    userInfo.set("whoopIds", []);
    userInfo.set("oneOfOneFactions", []);
    userInfo.set("whoopFactions", []);
    userInfo.set("eaIds", []);
    userInfo.set("eaFactions", []);
    userInfo.set("whoopWeapons", []);
    userInfo.set("eaWeapons", []);
    userInfo.set("epicWhoopWeapons", []);
    userInfo.set("epicEaWeapons", []);
    await userInfo.save();
    getUserInfo();
    getUserPoolInfo();
    setPoolEnded(false);
  };

  /* const setValidating = async () => {
    userPoolInfo.set("validating", true);
    await userPoolInfo.save();
    await createBackup();
    await backupPool(currentPool);
    validateTransfers(data[2].startBlock._hex);
  }; */

  /*  const validateTransfers = async (startBlock) => {
    let transfers = await getAllTransfers(startBlock);
    if (transfers.length === 0) {
      userPoolInfo.set("validating", false);
      userPoolInfo.set("finalCheck", true);
      await userPoolInfo.save();
      return;
    }

    for (const transfer of transfers) {
      const Staker = Moralis.Object.extend("stakers");
      const stakerQuery = new Moralis.Query(Staker);
      stakerQuery.equalTo("address", transfer.from);
      let staker = await stakerQuery.find();
      if (staker.length === 0) {
        continue;
      }
      staker = staker[0];

      if (
        transfer.rawContract.address.toLowerCase() ===
          whoopAddress.toLowerCase() &&
        staker.attributes.whoopIds.includes(Number(transfer.erc721TokenId))
      ) {
        let id = Number(transfer.erc721TokenId);
        if (
          id === 1000 ||
          id === 2000 ||
          id === 3000 ||
          id === 4000 ||
          id === 5000 ||
          id === 6100
        ) {
          let stakerKelta = 0;
          let stakerCasa = 0;
          let stakerManu = 0;
          let stakerLanu = 0;
          let whoopIds = staker.get("whoopIds");
          let oneOfOneFactions = staker.get("oneOfOneFactions");
          let faction = oneOfOneFactions.filter(
            (whoop) => Number(whoop.id) === id
          )[0].faction;
          let whoopWeapons = staker.get("whoopWeapons");
          let epicWhoopWeapons = staker.get("epicWhoopWeapons");
          let stakedWhoopWeapon = whoopWeapons.filter(
            (weapon) => Number(weapon.tokenId) === id
          );

          let stakedEpicWhoopWeapon = epicWhoopWeapons.filter(
            (weapon) => Number(weapon.tokenId) === id
          );

          if (faction === 0) {
            if (stakedWhoopWeapon.length > 0) {
              stakerKelta += stakedWhoopWeapon[0].weaponPower;
            }
            if (stakedEpicWhoopWeapon.length > 0) {
              stakerKelta += 3000;
            }
            stakerKelta += oneOfOnePower;
          }
          if (faction === 1) {
            if (stakedWhoopWeapon.length > 0) {
              stakerCasa += stakedWhoopWeapon[0].weaponPower;
            }
            if (stakedEpicWhoopWeapon.length > 0) {
              stakerCasa += 3000;
            }
            stakerCasa += oneOfOnePower;
          }
          if (faction === 2) {
            if (stakedWhoopWeapon.length > 0) {
              stakerManu += stakedWhoopWeapon[0].weaponPower;
            }
            if (stakedEpicWhoopWeapon.length > 0) {
              stakerManu += 3000;
            }
            stakerManu += oneOfOnePower;
          }
          if (faction === 3) {
            if (stakedWhoopWeapon.length > 0) {
              stakerLanu += stakedWhoopWeapon[0].weaponPower;
            }
            if (stakedEpicWhoopWeapon.length > 0) {
              stakerLanu += 3000;
            }
            stakerLanu += oneOfOnePower;
          }

          stakedWhoopWeapon.length > 0 &&
            staker.set(
              "whoopWeapons",
              whoopWeapons.filter((weapon) => Number(weapon.tokenId) !== id)
            );

          stakedEpicWhoopWeapon.length > 0 &&
            staker.set(
              "epicWhoopWeapons",
              epicWhoopWeapons.filter((weapon) => Number(weapon.tokenId) !== id)
            );

          whoopIds = whoopIds.filter((whoop) => whoop !== id);
          oneOfOneFactions = oneOfOneFactions.filter(
            (whoop) => whoop.id !== id
          );
          staker.set("whoopIds", whoopIds);
          staker.set("oneOfOneFactions", oneOfOneFactions);
          stakerKelta > 0 && staker.decrement("keltaPower", stakerKelta);
          stakerCasa > 0 && staker.decrement("casaPower", stakerCasa);
          stakerManu > 0 && staker.decrement("manuPower", stakerManu);
          stakerLanu > 0 && staker.decrement("lanuPower", stakerLanu);
          stakerKelta > 0 &&
            userPoolInfo.decrement("totalKeltaPower", stakerKelta);
          stakerCasa > 0 &&
            userPoolInfo.decrement("totalCasaPower", stakerCasa);
          stakerManu > 0 &&
            userPoolInfo.decrement("totalManuPower", stakerManu);
          stakerLanu > 0 &&
            userPoolInfo.decrement("totalLanuPower", stakerLanu);
          await staker.save();
          await userPoolInfo.save();
        } else {
          let stakerKelta = 0;
          let stakerCasa = 0;
          let stakerManu = 0;
          let stakerLanu = 0;
          let whoopIds = staker.get("whoopIds");
          let whoopFactions = staker.get("whoopFactions");
          let faction = whoopFactions.filter(
            (whoop) => Number(whoop.id) === id
          )[0].faction;
          let whoopWeapons = staker.get("whoopWeapons");
          let epicWhoopWeapons = staker.get("epicWhoopWeapons");
          let stakedWhoopWeapon = whoopWeapons.filter(
            (weapon) => Number(weapon.tokenId) === id
          );
          let stakedEpicWhoopWeapon = epicWhoopWeapons.filter(
            (weapon) => Number(weapon.tokenId) === id
          );

          if (faction === 0) {
            if (stakedWhoopWeapon.length > 0) {
              stakerKelta += stakedWhoopWeapon[0].weaponPower;
            }
            if (stakedEpicWhoopWeapon.length > 0) {
              stakerKelta += 3000;
            }
            stakerKelta += keltaPower;
          }
          if (faction === 1) {
            if (stakedWhoopWeapon.length > 0) {
              stakerCasa += stakedWhoopWeapon[0].weaponPower;
            }
            if (stakedEpicWhoopWeapon.length > 0) {
              stakerCasa += 3000;
            }
            stakerCasa += casaPower;
          }
          if (faction === 2) {
            if (stakedWhoopWeapon.length > 0) {
              stakerManu += stakedWhoopWeapon[0].weaponPower;
            }
            if (stakedEpicWhoopWeapon.length > 0) {
              stakerManu += 3000;
            }
            stakerManu += manuPower;
          }
          if (faction === 3) {
            if (stakedWhoopWeapon.length > 0) {
              stakerLanu += stakedWhoopWeapon[0].weaponPower;
            }
            if (stakedEpicWhoopWeapon.length > 0) {
              stakerLanu += 3000;
            }
            stakerLanu += lanuPower;
          }

          stakedWhoopWeapon.length > 0 &&
            staker.set(
              "whoopWeapons",
              whoopWeapons.filter((weapon) => Number(weapon.tokenId) !== id)
            );

          stakedEpicWhoopWeapon.length > 0 &&
            staker.set(
              "epicWhoopWeapons",
              epicWhoopWeapons.filter((weapon) => Number(weapon.tokenId) !== id)
            );

          whoopIds = whoopIds.filter((whoop) => whoop !== id);
          whoopFactions = whoopFactions.filter((whoop) => whoop.id !== id);
          staker.set("whoopIds", whoopIds);
          staker.set("whoopFactions", whoopFactions);
          stakerKelta > 0 && staker.decrement("keltaPower", stakerKelta);
          stakerCasa > 0 && staker.decrement("casaPower", stakerCasa);
          stakerManu > 0 && staker.decrement("manuPower", stakerManu);
          stakerLanu > 0 && staker.decrement("lanuPower", stakerLanu);
          stakerKelta > 0 &&
            userPoolInfo.decrement("totalKeltaPower", stakerKelta);
          stakerCasa > 0 &&
            userPoolInfo.decrement("totalCasaPower", stakerCasa);
          stakerManu > 0 &&
            userPoolInfo.decrement("totalManuPower", stakerManu);
          stakerLanu > 0 &&
            userPoolInfo.decrement("totalLanuPower", stakerLanu);
          await staker.save();
          await userPoolInfo.save();
        }
      }
      if (
        transfer.rawContract.address.toLowerCase() ===
          eaAddress.toLowerCase() &&
        staker.attributes.eaIds.includes(Number(transfer.erc721TokenId))
      ) {
        let stakerKelta = 0;
        let stakerCasa = 0;
        let stakerManu = 0;
        let stakerLanu = 0;
        let id = Number(transfer.erc721TokenId);
        let eaIds = staker.get("eaIds");
        let eaFactions = staker.get("eaFactions");
        let faction = eaFactions.filter((ea) => Number(ea.id) === id)[0]
          .faction;
        let eaWeapons = staker.get("eaWeapons");
        let epicEaWeapons = staker.get("epicEaWeapons");
        let stakedEaWeapon = eaWeapons.filter(
          (weapon) => Number(weapon.tokenId) === id
        );
        let stakedEpicEaWeapon = epicEaWeapons.filter(
          (weapon) => Number(weapon.tokenId) === id
        );

        if (faction === 0) {
          if (stakedEaWeapon.length > 0) {
            stakerKelta += stakedEaWeapon[0].weaponPower;
          }
          if (stakedEpicEaWeapon.length > 0) {
            stakerKelta += 3000;
          }
          stakerKelta += eaPower;
        }

        if (faction === 1) {
          if (stakedEaWeapon.length > 0) {
            stakerCasa += stakedEaWeapon[0].weaponPower;
          }
          if (stakedEpicEaWeapon.length > 0) {
            stakerCasa += 3000;
          }
          stakerCasa += eaPower;
        }
        if (faction === 2) {
          if (stakedEaWeapon.length > 0) {
            stakerManu += stakedEaWeapon[0].weaponPower;
          }
          if (stakedEpicEaWeapon.length > 0) {
            stakerManu += 3000;
          }
          stakerManu += eaPower;
        }
        if (faction === 3) {
          if (stakedEaWeapon.length > 0) {
            stakerLanu += stakedEaWeapon[0].weaponPower;
          }
          if (stakedEpicEaWeapon.length > 0) {
            stakerLanu += 3000;
          }
          stakerLanu += eaPower;
        }

        stakedEaWeapon.length > 0 &&
          staker.set(
            "eaWeapons",
            eaWeapons.filter((weapon) => Number(weapon.tokenId) !== id)
          );

        stakedEpicEaWeapon.length > 0 &&
          staker.set(
            "epicEaWeapons",
            epicEaWeapons.filter((weapon) => Number(weapon.tokenId) !== id)
          );

        eaIds = eaIds.filter((ea) => ea !== id);
        eaFactions = eaFactions.filter((ea) => ea.id !== id);
        staker.set("eaIds", eaIds);
        staker.set("eaFactions", eaFactions);
        stakerKelta > 0 && staker.decrement("keltaPower", stakerKelta);
        stakerCasa > 0 && staker.decrement("casaPower", stakerCasa);
        stakerManu > 0 && staker.decrement("manuPower", stakerManu);
        stakerLanu > 0 && staker.decrement("lanuPower", stakerLanu);
        stakerKelta > 0 &&
          userPoolInfo.decrement("totalKeltaPower", stakerKelta);
        stakerCasa > 0 && userPoolInfo.decrement("totalCasaPower", stakerCasa);
        stakerManu > 0 && userPoolInfo.decrement("totalManuPower", stakerManu);
        stakerLanu > 0 && userPoolInfo.decrement("totalLanuPower", stakerLanu);
        await staker.save();
        await userPoolInfo.save();
      }

      if (
        transfer.rawContract.address.toLowerCase() ===
          weaponAddress.toLowerCase() &&
        staker.attributes.whoopWeapons.filter(
          (weapon) => Number(weapon.weaponId) === Number(transfer.erc721TokenId)
        ).length > 0
      ) {
        let wepId = Number(transfer.erc721TokenId);
        let whoopWeapons = staker.get("whoopWeapons");
        let stakedWhoopWeapon = whoopWeapons.filter(
          (weapon) => Number(weapon.weaponId) === wepId
        );
        if (stakedWhoopWeapon[0].weaponFaction === 0) {
          staker.decrement("keltaPower", stakedWhoopWeapon[0].weaponPower);
          userPoolInfo.decrement(
            "totalKeltaPower",
            stakedWhoopWeapon[0].weaponPower
          );
        }
        if (stakedWhoopWeapon[0].weaponFaction === 1) {
          staker.decrement("casaPower", stakedWhoopWeapon[0].weaponPower);
          userPoolInfo.decrement(
            "totalCasaPower",
            stakedWhoopWeapon[0].weaponPower
          );
        }
        if (stakedWhoopWeapon[0].weaponFaction === 2) {
          staker.decrement("manuPower", stakedWhoopWeapon[0].weaponPower);
          userPoolInfo.decrement(
            "totalManuPower",
            stakedWhoopWeapon[0].weaponPower
          );
        }
        if (stakedWhoopWeapon[0].weaponFaction === 3) {
          staker.decrement("lanuPower", stakedWhoopWeapon[0].weaponPower);
          userPoolInfo.decrement(
            "totalLanuPower",
            stakedWhoopWeapon[0].weaponPower
          );
        }
        stakedWhoopWeapon.length > 0 &&
          staker.set(
            "whoopWeapons",
            whoopWeapons.filter((weapon) => Number(weapon.weaponId) !== wepId)
          );
        staker.save();
        userPoolInfo.save();
      }

      if (
        transfer.rawContract.address.toLowerCase() ===
          weaponAddress.toLowerCase() &&
        staker.attributes.eaWeapons.filter(
          (weapon) => Number(weapon.weaponId) === Number(transfer.erc721TokenId)
        ).length > 0
      ) {
        let wepId = Number(transfer.erc721TokenId);
        let eaWeapons = staker.get("eaWeapons");
        let stakedEaWeapon = eaWeapons.filter(
          (weapon) => Number(weapon.weaponId) === wepId
        );
        if (stakedEaWeapon[0].weaponFaction === 0) {
          staker.decrement("keltaPower", stakedEaWeapon[0].weaponPower);
          userPoolInfo.decrement(
            "totalKeltaPower",
            stakedEaWeapon[0].weaponPower
          );
        }
        if (stakedEaWeapon[0].weaponFaction === 1) {
          staker.decrement("casaPower", stakedEaWeapon[0].weaponPower);
          userPoolInfo.decrement(
            "totalCasaPower",
            stakedEaWeapon[0].weaponPower
          );
        }
        if (stakedEaWeapon[0].weaponFaction === 2) {
          staker.decrement("manuPower", stakedEaWeapon[0].weaponPower);
          userPoolInfo.decrement(
            "totalManuPower",
            stakedEaWeapon[0].weaponPower
          );
        }
        if (stakedEaWeapon[0].weaponFaction === 3) {
          staker.decrement("lanuPower", stakedEaWeapon[0].weaponPower);
          userPoolInfo.decrement(
            "totalLanuPower",
            stakedEaWeapon[0].weaponPower
          );
        }
        stakedEaWeapon.length > 0 &&
          staker.set(
            "eaWeapons",
            eaWeapons.filter((weapon) => Number(weapon.weaponId) !== wepId)
          );
        staker.save();
        userPoolInfo.save();
      }
      if (
        transfer.rawContract.address.toLowerCase() ===
          epicWeaponAddress.toLowerCase() &&
        staker.attributes.epicWhoopWeapons.filter(
          (weapon) => Number(weapon.weaponId) === Number(transfer.erc721TokenId)
        ).length > 0
      ) {
        let wepId = Number(transfer.erc721TokenId);
        let epicWhoopWeapons = staker.get("epicWhoopWeapons");
        let stakedEpicWhoopWeapon = epicWhoopWeapons.filter(
          (weapon) => Number(weapon.weaponId) === wepId
        );
        if (stakedEpicWhoopWeapon[0].weaponFaction === 0) {
          staker.decrement("keltaPower", 3000);
          userPoolInfo.decrement("totalKeltaPower", 3000);
        }
        if (stakedEpicWhoopWeapon[0].weaponFaction === 1) {
          staker.decrement("casaPower", 3000);
          userPoolInfo.decrement("totalCasaPower", 3000);
        }
        if (stakedEpicWhoopWeapon[0].weaponFaction === 2) {
          staker.decrement("manuPower", 3000);
          userPoolInfo.decrement("totalManuPower", 3000);
        }
        if (stakedEpicWhoopWeapon[0].weaponFaction === 3) {
          staker.decrement("lanuPower", 3000);
          userPoolInfo.decrement("totalLanuPower", 3000);
        }
        stakedEpicWhoopWeapon.length > 0 &&
          staker.set(
            "epicWhoopWeapons",
            epicWhoopWeapons.filter(
              (weapon) => Number(weapon.weaponId) !== wepId
            )
          );
        staker.save();
        userPoolInfo.save();
      }

      if (
        transfer.rawContract.address.toLowerCase() ===
          epicWeaponAddress.toLowerCase() &&
        staker.attributes.epicEaWeapons.filter(
          (weapon) => Number(weapon.weaponId) === Number(transfer.erc721TokenId)
        ).length > 0
      ) {
        let wepId = Number(transfer.erc721TokenId);
        let epicEaWeapons = staker.get("epicEaWeapons");
        let stakedEpicEaWeapon = epicEaWeapons.filter(
          (weapon) => Number(weapon.weaponId) === wepId
        );
        if (stakedEpicEaWeapon[0].weaponFaction === 0) {
          staker.decrement("keltaPower", 3000);
          userPoolInfo.decrement("totalKeltaPower", 3000);
        }
        if (stakedEpicEaWeapon[0].weaponFaction === 1) {
          staker.decrement("casaPower", 3000);
          userPoolInfo.decrement("totalCasaPower", 3000);
        }
        if (stakedEpicEaWeapon[0].weaponFaction === 2) {
          staker.decrement("manuPower", 3000);
          userPoolInfo.decrement("totalManuPower", 3000);
        }
        if (stakedEpicEaWeapon[0].weaponFaction === 3) {
          staker.decrement("lanuPower", 3000);
          userPoolInfo.decrement("totalLanuPower", 3000);
        }
        stakedEpicEaWeapon.length > 0 &&
          staker.set(
            "epicEaWeapons",
            epicEaWeapons.filter((weapon) => Number(weapon.weaponId) !== wepId)
          );
        staker.save();
        userPoolInfo.save();
      }
    }

    userPoolInfo.set("finalCheck", true);
    userPoolInfo.set("validating", false);
    await userPoolInfo.save();
  }; */

  const getWinner = (values) => {
    let max = Math.max(...values);
    let maxIdx = values.indexOf(max);
    return maxIdx;
  };

  const getReward = (winner) => {
    let reward;
    if (winner === 0) {
      let userPower = userInfo.attributes.keltaPower;
      let totalPower = userPoolInfo.attributes.totalKeltaPower;
      let poolAmt = Number(data[2].amount);
      if ((userPower === 0 && totalPower === 0) || poolAmt === 0) {
        reward = 0;
      } else {
        reward = (userPower / totalPower) * poolAmt;
      }
      return reward;
    }

    if (winner === 1) {
      let userPower = userInfo.attributes.casaPower;
      let totalPower = userPoolInfo.attributes.totalCasaPower;
      let poolAmt = Number(data[2].amount);
      if ((userPower === 0 && totalPower === 0) || poolAmt === 0) {
        reward = 0;
      } else {
        reward = (userPower / totalPower) * poolAmt;
      }
      return reward;
    }

    if (winner === 2) {
      let userPower = userInfo.attributes.manuPower;
      let totalPower = userPoolInfo.attributes.totalManuPower;
      let poolAmt = Number(data[2].amount);
      if ((userPower === 0 && totalPower === 0) || poolAmt === 0) {
        reward = 0;
      } else {
        reward = (userPower / totalPower) * poolAmt;
      }
      return reward;
    }

    if (winner === 3) {
      let userPower = userInfo.attributes.lanuPower;
      let totalPower = userPoolInfo.attributes.totalLanuPower;
      let poolAmt = Number(data[2].amount);
      if ((userPower === 0 && totalPower === 0) || poolAmt === 0) {
        reward = 0;
      } else {
        reward = (userPower / totalPower) * poolAmt;
      }
      return reward;
    }
  };

  const generateParams = async () => {
    await generateTree();
    let proof = await getProof();
    let keccak = await getKeccak();
    setP(proof);
    setL(keccak);
    //let formatProof = JSON.stringify(proof).replace(/\s/g, "");
  };

  const setTimePerc = () => {
    let distance;
    let timeReamining;
    if (data[1].startTime) {
      let timeFromStart =
        new Date().getTime() - Number(data[1].startTime) * 1000;
      let totalDiff =
        Number(data[1].endTime) * 1000 - Number(data[1].startTime) * 1000;
      let difference = 1 - timeFromStart / totalDiff;
      let percentage = difference * 100;

      if (new Date().getTime() < Number(data[1].endTime) * 1000) {
        setBattleProgressWidth(96 - percentage);
      } else {
        setBattleProgressWidth(95);
        getUserPoolInfo();
      }

      distance = Number(data[1].endTime) * 1000 - new Date().getTime();

      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));

      timeReamining = {
        days,
        hours,
        minutes,
        seconds,
      };
    } else {
      distance = 0;
    }

    if (distance > 0) {
      setTimeLeft(timeReamining);
    } else {
      setTimeLeft({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      });
      getUserInfo();
    }
  };

  const getPoolInfo = async () => {
    const Pool = Moralis.Object.extend("pools");
    const poolQuery = new Moralis.Query(Pool);
    poolQuery.equalTo("poolIdx", currentPool);
    let _poolInfo = await poolQuery.find();
    let poolSubscription = await poolQuery.subscribe();

    poolSubscription.on("open", () => {
      if (_poolInfo.length > 0) {
        setPoolInfo(_poolInfo[0]);
      } else {
        setPoolInfo(null);
      }
    });

    poolSubscription.on("create", () => {
      if (_poolInfo.length > 0) {
        setPoolInfo(_poolInfo[0]);
      } else {
        setPoolInfo(null);
      }
    });
    poolSubscription.on("update", () => {
      if (_poolInfo.length > 0) {
        setPoolInfo(_poolInfo[0]);
      } else {
        setPoolInfo(null);
      }
    });
  };

  const getUserPoolInfo = async () => {
    const Pool = Moralis.Object.extend("pools");
    const poolQuery = new Moralis.Query(Pool);
    poolQuery.equalTo("poolIdx", Number(userIdx));
    let _userPoolInfo = await poolQuery.find();
    if (_userPoolInfo.length > 0) {
      setUserPoolInfo(_userPoolInfo[0]);
    } else {
      setUserPoolInfo(null);
    }
  };

  const getUserInfo = async () => {
    const Staker = Moralis.Object.extend("stakers");
    const stakerQuery = new Moralis.Query(Staker);
    stakerQuery.equalTo("address", address?.toLowerCase());
    let stakerInfo = await stakerQuery.find();
    if (stakerInfo.length > 0) {
      setUserInfo(stakerInfo[0]);
      setUserIdx(stakerInfo[0].attributes.poolIdx);
    } else {
      setUserIdx(null);
      setUserInfo(null);
    }
  };

  useEffect(() => {
    generateParams();
    data && setCurrentPool(Number(data[0]));
    data && !userInfo && !userIdx && getUserInfo();
    data && getPoolInfo();
    userInfo && getUserPoolInfo();
    // eslint-disable-next-line
  }, [data, address]);

  useEffect(() => {
    if (
      data &&
      poolInfo &&
      !timePercInterval &&
      poolInfo.attributes.endTime > new Date().getTime()
    ) {
      setTimePerc();
      let _timePercInterval = setInterval(setTimePerc, 1000);
      setTimePercInterval(_timePercInterval);
    }
    return () => {
      clearInterval(timePercInterval);
      setTimePercInterval(null);
    };
    // eslint-disable-next-line
  }, [data, address, poolInfo]);

  useEffect(() => {
    if (
      data &&
      data[2] &&
      userInfo &&
      userPoolInfo &&
      userPoolInfo.attributes.endTime < new Date().getTime()
    ) {
      setPoolEnded(true);

      /* if (
        !userPoolInfo?.attributes?.finalCheck &&
        !userPoolInfo?.attributes?.validating &&
        data[2]
      ) {
        setValidating();
      } */
      let winner = getWinner([
        userPoolInfo?.attributes.totalKeltaPower,
        userPoolInfo?.attributes.totalCasaPower,
        userPoolInfo?.attributes.totalManuPower,
        userPoolInfo?.attributes.totalLanuPower,
      ]);
      let reward = getReward(winner);
      setUserLevelsArr([
        userInfo.attributes.keltaPower,
        userInfo.attributes.casaPower,
        userInfo.attributes.manuPower,
        userInfo.attributes.lanuPower,
      ]);
      setPowerLevelsArr([
        userPoolInfo?.attributes.totalKeltaPower,
        userPoolInfo?.attributes.totalCasaPower,
        userPoolInfo?.attributes.totalManuPower,
        userPoolInfo?.attributes.totalLanuPower,
      ]);
      setPoolReward(reward);
      setUserPoolWinner(winner);
    } else {
      setPoolEnded(false);
    }

    // eslint-disable-next-line
  }, [data, address, userPoolInfo, userInfo?.attributes.address]);

  useEffect(() => {
    if (poolInfo) {
      let keltaTotal = 251900;
      let keltaPower = poolInfo.attributes.totalKeltaPower;
      let keltaPercentage = (keltaPower / keltaTotal) * 100;
      setKeltaProgressWidth(keltaPercentage + 20);
      let casaTotal = 401400;
      let casaPower = poolInfo.attributes.totalCasaPower;
      let casaPercentage = (casaPower / casaTotal) * 100;
      setCasaProgressWidth(casaPercentage + 20);
      let manuTotal = 314100;
      let manuPower = poolInfo.attributes.totalManuPower;
      let manuPercentage = (manuPower / manuTotal) * 100;
      setManuProgressWidth(manuPercentage + 20);
      let lanuTotal = 218400;
      let lanuPower = poolInfo.attributes.totalLanuPower;
      let lanuPercentage = (lanuPower / lanuTotal) * 100;
      setLanuProgressWidth(lanuPercentage + 10);
    }
    // eslint-disable-next-line
  }, [poolInfo]);

  const getFactionsStaked = async () => {
    if (currentPool) {
      let res = await findFactionStaked(currentPool);
      setFactionStaked(res);
    }
  };

  useEffect(() => {
    getFactionsStaked();
    // eslint-disable-next-line
  }, [poolInfo]);

  return (
    <>
      {!poolEnded ? (
        <>
          {address ? (
            <>
              <StakingHeader />
              <div className={styles.stakingContainer}>
                <div>
                  <div className={styles.battleProgressContainer}>
                    <img src={shield} alt="shield" />
                    <div className={styles.battleProgress}>
                      <h3>Battle Progress</h3>
                      <p>
                        {`${timeLeft.days}D ${timeLeft.hours}H ${timeLeft.minutes}M ${timeLeft.seconds}S`}
                      </p>
                      <img src={battleProgress} alt="battleProgress" />
                      <div
                        className={styles.battleProgressBar}
                        style={{
                          width: `${battleProgressWidth}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className={styles.factionProgressContainer}>
                    <div className={styles.factionProgress}>
                      <p className={styles.factionTitle}>Kelta</p>
                      <p className={styles.factionStats}>
                        {factionStaked && factionStaked.kelta} / 2,519
                      </p>
                      {poolInfo && (
                        <p>
                          {poolInfo.attributes.totalKeltaPower.toLocaleString(
                            "en-US"
                          )}{" "}
                          Power
                        </p>
                      )}
                      <img src={keltaProgress} alt="battleProgress" />
                      <div
                        className={styles.keltaProgressBar}
                        style={{
                          width: `${keltaProgressWidth}%`,
                        }}
                      />
                    </div>
                    <div className={styles.factionProgress}>
                      <p className={styles.factionTitle}>Casa</p>
                      <p className={styles.factionStats}>
                        {factionStaked && factionStaked.casa} / 2,007
                      </p>
                      {poolInfo && (
                        <p>
                          {poolInfo.attributes.totalCasaPower.toLocaleString(
                            "en-US"
                          )}{" "}
                          Power
                        </p>
                      )}
                      <img src={casaProgress} alt="battleProgress" />
                      <div
                        className={styles.casaProgressBar}
                        style={{
                          width: `${casaProgressWidth}%`,
                        }}
                      />
                    </div>
                    <div className={styles.factionProgress}>
                      <p className={styles.factionTitle}>Manu</p>
                      <p className={styles.factionStats}>
                        {factionStaked && factionStaked.manu} / 1,047
                      </p>
                      {poolInfo && (
                        <p>
                          {poolInfo.attributes.totalManuPower.toLocaleString(
                            "en-US"
                          )}{" "}
                          Power
                        </p>
                      )}
                      <img src={manuProgress} alt="battleProgress" />
                      <div
                        className={styles.manuProgressBar}
                        style={{
                          width: `${manuProgressWidth}%`,
                        }}
                      />
                    </div>
                    <div className={styles.factionProgress}>
                      <p className={styles.factionTitle}>Lanu</p>
                      <p className={styles.factionStats}>
                        {factionStaked && factionStaked.lanu} / 546
                      </p>
                      {poolInfo && (
                        <p>
                          {poolInfo.attributes.totalLanuPower.toLocaleString(
                            "en-US"
                          )}{" "}
                          Power
                        </p>
                      )}
                      <img src={lanuProgress} alt="battleProgress" />
                      <div
                        className={styles.lanuProgressBar}
                        style={{
                          width: `${lanuProgressWidth}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className={styles.videoContainer}>
                  <img src={animationBG} alt="animationBG" />
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    src="https://ipfs.moralis.io:2053/ipfs/QmXXfKX8ge2WWpMD9QxsSGeaurrUrqnr5NPknZBU3SZFAb"
                  />
                </div>
              </div>
            </>
          ) : (
            <StakingLogin />
          )}
        </>
      ) : (
        <div className={styles.poolEndedContainer}>
          <div
            className={
              poolReward < 1 ? styles.defeatContainer : styles.victoryContainer
            }
          >
            {userPoolWinner === 0 && poolReward > 0 && (
              <img
                className={styles.stars}
                src={keltaStars}
                alt="kelta stars"
              />
            )}
            {userPoolWinner === 1 && poolReward > 0 && (
              <img className={styles.stars} src={casaStars} alt="casa stars" />
            )}
            {userPoolWinner === 2 && poolReward > 0 && (
              <img className={styles.stars} src={manuStars} alt="manu stars" />
            )}
            {userPoolWinner === 3 && poolReward > 0 && (
              <img className={styles.stars} src={lanuStars} alt="lanu stars" />
            )}
            {poolReward > 0 && (
              <img
                className={styles.winning}
                src={winnerBG}
                alt="winner background"
              />
            )}
            {poolReward < 1 && (
              <img
                className={styles.losing}
                src={loserBG}
                alt="losing background"
              />
            )}
            {userPoolWinner === 0 && <h1>KELTA'S WIN!</h1>}
            {userPoolWinner === 1 && <h1>CASA'S WIN!</h1>}
            {userPoolWinner === 2 && <h1>MANU'S WIN!</h1>}
            {userPoolWinner === 3 && <h1>LANU'S WIN!</h1>}
            <div className={styles.rewardContainer}>
              <h3>
                YOUR REWARD:{" "}
                {poolReward &&
                  poolReward.toLocaleString("en-US", {
                    maximumFractionDigits: 0,
                  })}{" "}
                $DOOP
              </h3>
              {poolReward > 0 &&
                userPoolInfo &&
                !claimLoading &&
                !claimWaitLoading && (
                  <div className={styles.claim} onClick={() => checkClaim()}>
                    CLAIM
                  </div>
                )}
              {!userPoolInfo && (
                <>
                  <div className={styles.check}>
                    <p>Checking Transfers</p>
                    <CircularProgress size={30} color="inherit" />
                  </div>
                  <div className={styles.checkMobile}>
                    <p>Checking Transfers</p>
                    <CircularProgress size={15} color="inherit" />
                  </div>
                </>
              )}
              {poolReward > 0 && (claimLoading || claimWaitLoading) && (
                <>
                  <div className={styles.check}>
                    <p>Please Wait Until Confirmation</p>
                    <CircularProgress size={30} color="inherit" />
                  </div>
                  <div className={styles.checkMobile}>
                    <p>Please Wait Until Confirmation</p>
                    <CircularProgress size={15} color="inherit" />
                  </div>
                </>
              )}
              {poolReward < 1 && (
                <div className={styles.claim} onClick={() => handleContinue()}>
                  CONTINUE
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
