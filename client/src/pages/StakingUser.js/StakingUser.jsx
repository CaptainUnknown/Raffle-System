import React, { useEffect, useState, Suspense } from "react";
import { useAccount, useContractReads } from "wagmi";
import Moralis from "moralis-v1";

import StakingHeader from "../../components/StakingHeader/StakingHeader";
import StakingLogin from "../../components/StakingLogin/StakingLogin";

import {
  eaPower,
  oneOfOnePower,
  stakingAddress,
} from "../../Constant/constants";
import abi from "../../ABI/stakeAbi.json";

import title from "../../assets/staking/titleCard.svg";
import nextButton from "../../assets/staking/nextButton.png";
import mobileBG from "../../assets/staking/mobileBG.png";
import useExternalNftApi from "../../Hooks/useExternalNftApi";

import styles from "./styles.module.scss";
import StakingModal from "../../components/StakingModal/StakingModal";
import { toast } from "react-toastify";

const titles = ["Whoopsies", "EA Pass"];

export default function StakingUser() {
  const { address } = useAccount();
  const { fetchAllNfts } = useExternalNftApi();
  const [owned, setOwned] = useState(null);
  const [currentPool, setCurrentPool] = useState(null);
  const [currentStakingPool, setCurrentStakingPool] = useState(null);
  const [userIdx, setUserIdx] = useState(null);
  const [userPool, setUserPool] = useState(null);
  const [selected, setSelected] = useState(0);
  const [eaImages, setEaImages] = useState();
  const [openModal, setOpenModal] = useState(false);
  const [stakingModal, setStakingModal] = useState(false);
  const [selectedToken, setSelectedToken] = useState(null);
  const [stakedWhoopWeapons, setStakedWhoopWeapons] = useState([]);
  const [stakedEaWeapons, setStakedEaWeapons] = useState([]);
  const [stakedWhoopEpic, setStakedWhoopEpic] = useState([]);
  const [stakedEaEpic, setStakedEaEpic] = useState([]);
  const [currentPoolInfo, setCurrentPoolInfo] = useState(null);
  const [poolActive, setPoolActive] = useState(false);
  const [currentStaker, setCurrentStaker] = useState(null);

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
        functionName: "poolActive",
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

  const formatFaction = (faction) => {
    if (faction === 0) {
      return "Kelta";
    }
    if (faction === 1) {
      return "Casa";
    }
    if (faction === 2) {
      return "Manu";
    }
    if (faction === 3) {
      return "Lanu";
    }
  };

  const getAllNfts = async () => {
    let tempOwned = await fetchAllNfts(address);
    setOwned(tempOwned);
    let eaArr = tempOwned.ea.map((item) => Number(item.id));
    let tempImages = await getEaImages(eaArr);
    setEaImages(tempImages);
  };

  const getEaImages = async (idArr) => {
    const images = Moralis.Object.extend("EAImages");
    let query = new Moralis.Query(images);
    query.containedIn("tokenId", idArr);
    let image = await query.find();
    let urls = image.map((item) => item.attributes.image._url);
    return urls;
  };

  const formatPower = (power) => {
    let formatted = (power / 600) * 100;
    if (formatted <= 2) {
      formatted = 2;
    }
    return formatted;
  };

  const formatWhoopPower = (item, weapon, epicWeapon) => {
    let power = 0;
    let weaponPower = 0;
    if (
      Number(item.id) === 1000 ||
      Number(item.id) === 2000 ||
      Number(item.id) === 3000 ||
      Number(item.id) === 4000 ||
      Number(item.id) === 5000 ||
      Number(item.id === 6100)
    ) {
      power = oneOfOnePower;
      if (weapon.length > 0) {
        weaponPower = weapon[0].weaponPower;
        power += weaponPower;
      }
      if (epicWeapon.length > 0) {
        power += 3000;
      }
      return power;
    }

    if (
      item.meta.attributes.filter((trait) => trait.trait_type === "Faction")[0]
        .value === "Kelta"
    ) {
      power = 100;
    } else if (
      item.meta.attributes.filter((trait) => trait.trait_type === "Faction")[0]
        .value === "Casa"
    ) {
      power = 200;
    } else if (
      item.meta.attributes.filter((trait) => trait.trait_type === "Faction")[0]
        .value === "Manu"
    ) {
      power = 300;
    } else if (
      item.meta.attributes.filter((trait) => trait.trait_type === "Faction")[0]
        .value === "Lanu"
    ) {
      power = 400;
    }

    if (weapon.length > 0) {
      weaponPower = weapon[0].weaponPower;
      power += weaponPower;
    }
    if (epicWeapon.length > 0) {
      power += 3000;
    }

    return power;
  };

  const formatEaPower = (weapon, epicWeapon) => {
    let power = eaPower;
    let weaponPower = 0;

    if (weapon.length > 0) {
      weaponPower = weapon[0].weaponPower;
      power += weaponPower;
    }
    if (epicWeapon.length > 0) {
      power += 3000;
    }

    return power;
  };

  const handleAddWeapon = (nft) => {
    if (
      !poolActive ||
      currentStakingPool?.endTime * 1000 < new Date().getTime() ||
      userPool?.endTime * 1000 < new Date().getTime()
    ) {
      toast.error("Pool is not active");
      return;
    }
    setOpenModal(true);
    setSelectedToken(nft);
  };

  const handleAddWhoop = async (nft) => {
    if (
      !poolActive ||
      currentStakingPool?.endTime * 1000 < new Date().getTime() ||
      userPool?.endTime * 1000 < new Date().getTime()
    ) {
      toast.error("Pool is not active");
      return;
    }
    if (currentStaker.attributes.address !== address.toLowerCase()) {
      currentStaker.set("address", address.toLowerCase());
      currentStaker.set("poolIdx", currentPool);
      currentStaker.set("keltaPower", 0);
      currentStaker.set("casaPower", 0);
      currentStaker.set("manuPower", 0);
      currentStaker.set("lanuPower", 0);
      currentStaker.set("whoopIds", []);
      currentStaker.set("whoopFactions", []);
      currentStaker.set("oneOfOneFactions", []);
      currentStaker.set("eaIds", []);
      currentStaker.set("eaFactions", []);
      currentStaker.set("whoopWeapons", []);
      currentStaker.set("eaWeapons", []);
      currentStaker.set("epicWhoopWeapons", []);
      currentStaker.set("epicEaWeapons", []);
      await currentStaker.save();
    }
    setStakingModal(true);
    setSelectedToken(nft);
  };

  const addEaWeapon = async (weapon) => {
    let weapons = currentStaker.attributes.eaWeapons;
    if (weapons && weapons.length > 0) {
      let tokenExists = weapons.map(
        (item) => item.tokenId === selectedToken.id
      );
      let weaponExists = weapons.map((item) => item.weaponId === weapon.id);
      if (tokenExists.includes(true)) return;
      if (weaponExists.includes(true)) return;
    }

    let selectedFaction = currentStaker.attributes.eaFactions.filter(
      (item) => item.id === Number(selectedToken.id)
    )[0].faction;
    let newWeapon = {
      tokenId: selectedToken.id,
      weaponId: weapon.id,
      weaponFaction: selectedFaction,
      weaponPower: weapon.meta.attributes.filter(
        (item) => item.trait_type === "Power"
      )[0].value,
      weaponImage: weapon.meta.image,
    };
    currentStaker.addUnique("eaWeapons", newWeapon);
    if (selectedFaction === 0) {
      currentStaker.increment(
        "keltaPower",
        weapon.meta.attributes.filter((item) => item.trait_type === "Power")[0]
          .value
      );
      currentPoolInfo.increment(
        "totalKeltaPower",
        weapon.meta.attributes.filter((item) => item.trait_type === "Power")[0]
          .value
      );
    }
    if (selectedFaction === 1) {
      currentStaker.increment(
        "casaPower",
        weapon.meta.attributes.filter((item) => item.trait_type === "Power")[0]
          .value
      );
      currentPoolInfo.increment(
        "totalCasaPower",
        weapon.meta.attributes.filter((item) => item.trait_type === "Power")[0]
          .value
      );
    }
    if (selectedFaction === 2) {
      currentStaker.increment(
        "manuPower",
        weapon.meta.attributes.filter((item) => item.trait_type === "Power")[0]
          .value
      );
      currentPoolInfo.increment(
        "totalManuPower",
        weapon.meta.attributes.filter((item) => item.trait_type === "Power")[0]
          .value
      );
    }
    if (selectedFaction === 3) {
      currentStaker.increment(
        "lanuPower",
        weapon.meta.attributes.filter((item) => item.trait_type === "Power")[0]
          .value
      );
      currentPoolInfo.increment(
        "totalLanuPower",
        weapon.meta.attributes.filter((item) => item.trait_type === "Power")[0]
          .value
      );
    }
    await currentStaker.save();
    await currentPoolInfo.save();
    setOpenModal(false);
  };

  const addWhoopWeapon = async (weapon) => {
    let weapons = currentStaker.attributes.whoopWeapons;
    let newWeapon;
    if (weapons && weapons.length > 0) {
      let tokenExists = weapons.map(
        (item) => item.tokenId === selectedToken.id
      );
      let weaponExists = weapons.map((item) => item.weaponId === weapon.id);
      if (tokenExists.includes(true)) return;
      if (weaponExists.includes(true)) return;
    }

    if (
      Number(selectedToken.id) === 1000 ||
      Number(selectedToken.id) === 2000 ||
      Number(selectedToken.id) === 3000 ||
      Number(selectedToken.id) === 4000 ||
      Number(selectedToken.id) === 5000 ||
      Number(selectedToken.id) === 6100
    ) {
      let selectedFaction = currentStaker.attributes.oneOfOneFactions.filter(
        (item) => item.id === Number(selectedToken.id)
      )[0].faction;
      let newWeapon = {
        tokenId: selectedToken.id,
        weaponId: weapon.id,
        weaponFaction: selectedFaction,
        weaponPower: weapon.meta.attributes.filter(
          (item) => item.trait_type === "Power"
        )[0].value,
        weaponImage: weapon.meta.image,
      };
      currentStaker.addUnique("whoopWeapons", newWeapon);
      if (selectedFaction === 0) {
        currentStaker.increment(
          "keltaPower",
          weapon.meta.attributes.filter(
            (item) => item.trait_type === "Power"
          )[0].value
        );
        currentPoolInfo.increment(
          "totalKeltaPower",
          weapon.meta.attributes.filter(
            (item) => item.trait_type === "Power"
          )[0].value
        );
      }
      if (selectedFaction === 1) {
        currentStaker.increment(
          "casaPower",
          weapon.meta.attributes.filter(
            (item) => item.trait_type === "Power"
          )[0].value
        );
        currentPoolInfo.increment(
          "totalCasaPower",
          weapon.meta.attributes.filter(
            (item) => item.trait_type === "Power"
          )[0].value
        );
      }
      if (selectedFaction === 2) {
        currentStaker.increment(
          "manuPower",
          weapon.meta.attributes.filter(
            (item) => item.trait_type === "Power"
          )[0].value
        );
        currentPoolInfo.increment(
          "totalManuPower",
          weapon.meta.attributes.filter(
            (item) => item.trait_type === "Power"
          )[0].value
        );
      }
      if (selectedFaction === 3) {
        currentStaker.increment(
          "lanuPower",
          weapon.meta.attributes.filter(
            (item) => item.trait_type === "Power"
          )[0].value
        );
        currentPoolInfo.increment(
          "totalLanuPower",
          weapon.meta.attributes.filter(
            (item) => item.trait_type === "Power"
          )[0].value
        );
      }
    } else {
      let selectedFaction;
      if (
        selectedToken.meta.attributes.filter(
          (item) => item.trait_type === "Faction"
        )[0].value === "Kelta"
      ) {
        selectedFaction = 0;
      }
      if (
        selectedToken.meta.attributes.filter(
          (item) => item.trait_type === "Faction"
        )[0].value === "Casa"
      ) {
        selectedFaction = 1;
      }
      if (
        selectedToken.meta.attributes.filter(
          (item) => item.trait_type === "Faction"
        )[0].value === "Manu"
      ) {
        selectedFaction = 2;
      }
      if (
        selectedToken.meta.attributes.filter(
          (item) => item.trait_type === "Faction"
        )[0].value === "Lanu"
      ) {
        selectedFaction = 3;
      }
      newWeapon = {
        tokenId: selectedToken.id,
        weaponId: weapon.id,
        weaponFaction: selectedFaction,
        weaponPower: weapon.meta.attributes.filter(
          (item) => item.trait_type === "Power"
        )[0].value,
        weaponImage: weapon.meta.image,
      };
      currentStaker.addUnique("whoopWeapons", newWeapon);

      if (
        selectedToken.meta.attributes.filter(
          (item) => item.trait_type === "Faction"
        )[0].value === "Kelta"
      ) {
        currentStaker.increment(
          "keltaPower",
          weapon.meta.attributes.filter(
            (item) => item.trait_type === "Power"
          )[0].value
        );
        currentPoolInfo.increment(
          "totalKeltaPower",
          weapon.meta.attributes.filter(
            (item) => item.trait_type === "Power"
          )[0].value
        );
      }
      if (
        selectedToken.meta.attributes.filter(
          (item) => item.trait_type === "Faction"
        )[0].value === "Casa"
      ) {
        currentStaker.increment(
          "casaPower",
          weapon.meta.attributes.filter(
            (item) => item.trait_type === "Power"
          )[0].value
        );
        currentPoolInfo.increment(
          "totalCasaPower",
          weapon.meta.attributes.filter(
            (item) => item.trait_type === "Power"
          )[0].value
        );
      }
      if (
        selectedToken.meta.attributes.filter(
          (item) => item.trait_type === "Faction"
        )[0].value === "Manu"
      ) {
        currentStaker.increment(
          "manuPower",
          weapon.meta.attributes.filter(
            (item) => item.trait_type === "Power"
          )[0].value
        );
        currentPoolInfo.increment(
          "totalManuPower",
          weapon.meta.attributes.filter(
            (item) => item.trait_type === "Power"
          )[0].value
        );
      }
      if (
        selectedToken.meta.attributes.filter(
          (item) => item.trait_type === "Faction"
        )[0].value === "Lanu"
      ) {
        currentStaker.increment(
          "lanuPower",
          weapon.meta.attributes.filter(
            (item) => item.trait_type === "Power"
          )[0].value
        );
        currentPoolInfo.increment(
          "totalLanuPower",
          weapon.meta.attributes.filter(
            (item) => item.trait_type === "Power"
          )[0].value
        );
      }
    }
    await currentStaker.save();
    await currentPoolInfo.save();
    setOpenModal(false);
  };

  const addEaEpicWeapon = async (weapon) => {
    let weapons = currentStaker.attributes.epicEaWeapons;
    if (weapons && weapons.length > 0) {
      let tokenExists = weapons.map(
        (item) => item.tokenId === selectedToken.id
      );
      let weaponExists = weapons.map((item) => item.weaponId === weapon.id);
      if (tokenExists.includes(true)) return;
      if (weaponExists.includes(true)) return;
    }

    let selectedFaction = currentStaker.attributes.eaFactions.filter(
      (item) => item.id === Number(selectedToken.id)
    )[0].faction;
    let newWeapon = {
      tokenId: selectedToken.id,
      weaponId: weapon.id,
      weaponFaction: selectedFaction,
      weaponPower: 3000,
      weaponImage: weapon.meta.image,
    };
    currentStaker.addUnique("epicEaWeapons", newWeapon);
    if (selectedFaction === 0) {
      currentStaker.increment("keltaPower", 3000);
      currentPoolInfo.increment("totalKeltaPower", 3000);
    }
    if (selectedFaction === 1) {
      currentStaker.increment("casaPower", 3000);
      currentPoolInfo.increment("totalCasaPower", 3000);
    }
    if (selectedFaction === 2) {
      currentStaker.increment("manuPower", 3000);
      currentPoolInfo.increment("totalManuPower", 3000);
    }
    if (selectedFaction === 3) {
      currentStaker.increment("lanuPower", 3000);
      currentPoolInfo.increment("totalLanuPower", 3000);
    }
    await currentStaker.save();
    await currentPoolInfo.save();
    setOpenModal(false);
  };

  const addWhoopEpicWeapon = async (weapon) => {
    let weapons = currentStaker.attributes.epicWhoopWeapons;
    let newWeapon;
    if (weapons && weapons.length > 0) {
      let tokenExists = weapons.map(
        (item) => item.tokenId === selectedToken.id
      );
      let weaponExists = weapons.map((item) => item.weaponId === weapon.id);
      if (tokenExists.includes(true)) return;
      if (weaponExists.includes(true)) return;
    }

    if (
      Number(selectedToken.id) === 1000 ||
      Number(selectedToken.id) === 2000 ||
      Number(selectedToken.id) === 3000 ||
      Number(selectedToken.id) === 4000 ||
      Number(selectedToken.id) === 5000 ||
      Number(selectedToken.id) === 6100
    ) {
      let selectedFaction = currentStaker.attributes.oneOfOneFactions.filter(
        (item) => item.id === Number(selectedToken.id)
      )[0].faction;
      let newWeapon = {
        tokenId: selectedToken.id,
        weaponId: weapon.id,
        weaponFaction: selectedFaction,
        weaponPower: weapon.meta.attributes.filter(
          (item) => item.trait_type === "Power"
        )[0].value,
        weaponImage: weapon.meta.image,
      };
      currentStaker.addUnique("epicWhoopWeapons", newWeapon);
      if (selectedFaction === 0) {
        currentStaker.increment("keltaPower", 3000);
        currentPoolInfo.increment("totalKeltaPower", 3000);
      }
      if (selectedFaction === 1) {
        currentStaker.increment("casaPower", 3000);
        currentPoolInfo.increment("totalCasaPower", 3000);
      }
      if (selectedFaction === 2) {
        currentStaker.increment("manuPower", 3000);
        currentPoolInfo.increment("totalManuPower", 3000);
      }
      if (selectedFaction === 3) {
        currentStaker.increment("lanuPower", 3000);
        currentPoolInfo.increment("totalLanuPower", 3000);
      }
    } else {
      let selectedFaction;
      if (
        selectedToken.meta.attributes.filter(
          (item) => item.trait_type === "Faction"
        )[0].value === "Kelta"
      ) {
        selectedFaction = 0;
      }
      if (
        selectedToken.meta.attributes.filter(
          (item) => item.trait_type === "Faction"
        )[0].value === "Casa"
      ) {
        selectedFaction = 1;
      }
      if (
        selectedToken.meta.attributes.filter(
          (item) => item.trait_type === "Faction"
        )[0].value === "Manu"
      ) {
        selectedFaction = 2;
      }
      if (
        selectedToken.meta.attributes.filter(
          (item) => item.trait_type === "Faction"
        )[0].value === "Lanu"
      ) {
        selectedFaction = 3;
      }
      newWeapon = {
        tokenId: selectedToken.id,
        weaponId: weapon.id,
        weaponFaction: selectedFaction,
        weaponPower: 3000,
        weaponImage: weapon.meta.image,
      };
      currentStaker.addUnique("epicWhoopWeapons", newWeapon);
      if (
        selectedToken.meta.attributes.filter(
          (item) => item.trait_type === "Faction"
        )[0].value === "Kelta"
      ) {
        currentStaker.increment("keltaPower", 3000);
        currentPoolInfo.increment("totalKeltaPower", 3000);
      }
      if (
        selectedToken.meta.attributes.filter(
          (item) => item.trait_type === "Faction"
        )[0].value === "Casa"
      ) {
        currentStaker.increment("casaPower", 3000);
        currentPoolInfo.increment("totalCasaPower", 3000);
      }
      if (
        selectedToken.meta.attributes.filter(
          (item) => item.trait_type === "Faction"
        )[0].value === "Manu"
      ) {
        currentStaker.increment("manuPower", 3000);
        currentPoolInfo.increment("totalManuPower", 3000);
      }
      if (
        selectedToken.meta.attributes.filter(
          (item) => item.trait_type === "Faction"
        )[0].value === "Lanu"
      ) {
        currentStaker.increment("lanuPower", 3000);
        currentPoolInfo.increment("totalLanuPower", 3000);
      }
    }
    await currentStaker.save();
    await currentPoolInfo.save();
    setOpenModal(false);
  };

  const changeSelected = () => {
    if (selected === 1) {
      setSelected(0);
    } else {
      setSelected(selected + 1);
    }
  };

  useEffect(() => {
    data && getPoolInfo();
    data && getUserInfo();
    data && setCurrentPool(Number(data[0]));
    data && setPoolActive(data[1]);
    data && setUserPool(data[3]);
    data && setCurrentStakingPool(data[2]);
    address && getAllNfts();
    // eslint-disable-next-line
  }, [address]);

  /*  useEffect(() => {
    let itemsInterval;

    if (address) {
      itemsInterval = setInterval(getAllNfts, 5000);
    }

    return () => {
      clearInterval(itemsInterval);
    };
    // eslint-disable-next-line
  }, [address]); */

  useEffect(() => {
    updateStakedWhoopWeapons();
    // eslint-disable-next-line
  }, [data, address, openModal, stakedWhoopWeapons.length]);

  useEffect(() => {
    updateStakedEaWeapons();
    // eslint-disable-next-line
  }, [data, address, openModal, stakedEaWeapons.length]);

  useEffect(() => {
    updateStakedWhoopEpic();
    // eslint-disable-next-line
  }, [data, address, openModal, stakedWhoopEpic.length]);

  useEffect(() => {
    updateStakedEaEpic();
    // eslint-disable-next-line
  }, [data, address, openModal, setStakedEaEpic.length]);

  const getUserInfo = async () => {
    const Staker = Moralis.Object.extend("stakers");
    const stakerQuery = new Moralis.Query(Staker);
    address && stakerQuery.equalTo("address", address.toLowerCase());
    let stakerInfo = await stakerQuery.find();
    if (stakerInfo.length > 0) {
      setCurrentStaker(stakerInfo[0]);
      setUserIdx(stakerInfo[0].attributes.poolIdx);
    } else {
      let newStaker = new Staker();
      setCurrentStaker(newStaker);
      setUserIdx(null);
    }
  };

  const getPoolInfo = async () => {
    const Pool = Moralis.Object.extend("pools");
    const poolQuery = new Moralis.Query(Pool);
    poolQuery.equalTo("poolIdx", currentPool);
    let poolInfo = await poolQuery.find();
    if (poolInfo.length > 0) {
      setCurrentPoolInfo(poolInfo[0]);
    } else {
      setCurrentPoolInfo(null);
    }
  };

  const updateStakedWhoopWeapons = async () => {
    if (currentStaker && currentStaker.attributes.whoopWeapons) {
      if (currentStaker.attributes.whoopWeapons.length > 0) {
        setStakedWhoopWeapons(currentStaker.attributes.whoopWeapons);
      } else {
        setStakedWhoopWeapons([]);
      }
    } else {
      setStakedWhoopWeapons([]);
    }
  };

  const updateStakedWhoopEpic = async () => {
    if (currentStaker && currentStaker.attributes.epicWhoopWeapons) {
      if (currentStaker.attributes.epicWhoopWeapons.length > 0) {
        setStakedWhoopEpic(currentStaker.attributes.epicWhoopWeapons);
      } else {
        setStakedWhoopEpic([]);
      }
    } else {
      setStakedWhoopEpic([]);
    }
  };

  const updateStakedEaEpic = async () => {
    if (currentStaker && currentStaker.attributes.epicEaWeapons) {
      if (currentStaker.attributes.epicEaWeapons.length > 0) {
        setStakedEaEpic(currentStaker.attributes.epicEaWeapons);
      } else {
        setStakedEaEpic([]);
      }
    } else {
      setStakedEaEpic([]);
    }
  };

  const updateStakedEaWeapons = async () => {
    if (currentStaker && currentStaker.attributes.eaWeapons) {
      if (currentStaker.attributes.eaWeapons.length > 0) {
        setStakedEaWeapons(currentStaker.attributes.eaWeapons);
      } else {
        setStakedEaWeapons([]);
      }
    } else {
      setStakedEaWeapons([]);
    }
  };

  return (
    <>
      {openModal && (
        <div className={styles.weaponModal}>
          <div className={styles.modalBG} onClick={() => setOpenModal(false)} />
          <div className={styles.modalContent}>
            {stakedEaEpic &&
              stakedWhoopEpic &&
              stakedWhoopWeapons &&
              stakedEaWeapons &&
              owned &&
              stakedWhoopWeapons.length +
                stakedEaWeapons.length +
                stakedEaEpic.length +
                stakedWhoopEpic.length ===
                owned.weapons.length + owned.epicWeapons.length && (
                <div className={styles.noWeapons}>
                  No Weapons Available To Stake
                </div>
              )}
            {owned &&
              owned.weapons.length < 1 &&
              owned.epicWeapons.length < 1 && (
                <div className={styles.noWeapons}>
                  No Weapons Available To Stake
                </div>
              )}

            {owned &&
              (owned.weapons.length > 0 || owned.epicWeapons.length > 0) && (
                <div className={styles.weaponContainer}>
                  {owned.epicWeapons.length > 0 &&
                    owned.epicWeapons.map((item, idx) =>
                      stakedEaEpic &&
                      stakedWhoopEpic &&
                      stakedWhoopEpic.filter(
                        (weapon) => weapon.weaponId === item.id
                      ).length === 0 &&
                      stakedEaEpic.filter(
                        (weapon) => weapon.weaponId === item.id
                      ).length === 0 ? (
                        <div key={idx} className={styles.weapon}>
                          <Suspense
                            fallback={<div className={styles.loadingImage} />}
                          >
                            <img src={item.meta.image} alt="weapon" />
                          </Suspense>

                          <p>{item.meta.name}</p>

                          <div className={styles.powerBar}>
                            <p>
                              {item.meta.attributes.filter(
                                (trait) => trait.trait_type === "Power"
                              )[0].value + " "}
                              / 3000
                            </p>
                            <div
                              className={styles.powerLevel}
                              style={{
                                width: "100%",
                              }}
                            />
                          </div>
                          {selectedToken.meta.name.includes("WD") && (
                            <button
                              onClick={() => addWhoopEpicWeapon(item)}
                              className={styles.addButton}
                            >
                              ADD WEAPON
                            </button>
                          )}
                          {selectedToken.meta.name.includes("EA") && (
                            <button
                              onClick={() => addEaEpicWeapon(item)}
                              className={styles.addButton}
                            >
                              ADD WEAPON
                            </button>
                          )}
                        </div>
                      ) : null
                    )}
                  {owned.weapons.length > 0 &&
                    owned.weapons.map((item, idx) =>
                      stakedWhoopWeapons &&
                      stakedWhoopWeapons.filter(
                        (weapon) => weapon.weaponId === item.id
                      ).length === 0 &&
                      stakedEaWeapons.filter(
                        (weapon) => weapon.weaponId === item.id
                      ).length === 0 ? (
                        <div key={idx} className={styles.weapon}>
                          <Suspense
                            fallback={<div className={styles.loadingImage} />}
                          >
                            <img src={item.meta.image} alt="weapon" />
                          </Suspense>

                          <p>{item.meta.name.slice(8)}</p>

                          <div className={styles.powerBar}>
                            <p>
                              {item.meta.attributes.filter(
                                (trait) => trait.trait_type === "Power"
                              )[0].value + " "}
                              / 600
                            </p>
                            <div
                              className={styles.powerLevel}
                              style={{
                                width: `${formatPower(
                                  item.meta.attributes.filter(
                                    (trait) => trait.trait_type === "Power"
                                  )[0].value
                                )}%`,
                              }}
                            />
                          </div>
                          {selectedToken.meta.name.includes("WD") && (
                            <button
                              onClick={() => addWhoopWeapon(item)}
                              className={styles.addButton}
                            >
                              ADD WEAPON
                            </button>
                          )}
                          {selectedToken.meta.name.includes("EA") && (
                            <button
                              onClick={() => addEaWeapon(item)}
                              className={styles.addButton}
                            >
                              ADD WEAPON
                            </button>
                          )}
                        </div>
                      ) : null
                    )}
                </div>
              )}
          </div>
        </div>
      )}
      {stakingModal && (
        <StakingModal
          staker={currentStaker}
          pool={currentPoolInfo}
          account={address}
          setStakingModal={setStakingModal}
          owned={owned}
          selectedToken={selectedToken}
        />
      )}
      {address ? (
        <>
          <StakingHeader />
          <div className={styles.stakingContainer}>
            <div className={styles.ownedContainer}>
              <img
                className={styles.mobileBG}
                src={mobileBG}
                alt="mobile background"
              />
              <div className={styles.titleCard}>
                <img src={title} alt="page title" />
                <h2>{titles[selected]}</h2>
              </div>

              <button
                onClick={() => changeSelected()}
                className={styles.nextButton}
              >
                <img src={nextButton} alt="next" />
              </button>
              <button
                onClick={() => changeSelected()}
                className={styles.previousButton}
              >
                <img src={nextButton} alt="next" />
              </button>
              {owned && selected === 0 && (
                <div className={styles.whoopsContainer}>
                  {owned.whoops.map((nft, idx) => (
                    <div className={styles.stakeItemContainer} key={idx}>
                      {stakedWhoopWeapons &&
                        stakedWhoopWeapons.map((item, idx) => {
                          if (item.tokenId === nft.id) {
                            return (
                              <img
                                key={idx}
                                className={styles.stakedWeapon}
                                src={item.weaponImage}
                                alt="staked weapon"
                              />
                            );
                          } else {
                            return null;
                          }
                        })}
                      {stakedWhoopEpic &&
                        stakedWhoopEpic.map((item, idx) => {
                          if (item.tokenId === nft.id) {
                            return (
                              <img
                                key={idx}
                                className={styles.stakedWeapon}
                                src={item.weaponImage}
                                alt="staked weapon"
                              />
                            );
                          } else {
                            return null;
                          }
                        })}
                      <Suspense
                        fallback={<div className={styles.loadingImage} />}
                      >
                        {Number(nft.id) !== 1000 &&
                        Number(nft.id) !== 2000 &&
                        Number(nft.id) !== 3000 &&
                        Number(nft.id) !== 4000 &&
                        Number(nft.id) !== 5000 &&
                        Number(nft.id) !== 6100 ? (
                          <img
                            className={`${
                              nft.meta?.attributes?.filter(
                                (trait) => trait.trait_type === "Faction"
                              )[0].value
                            }`}
                            key={idx}
                            src={nft?.meta?.image}
                            alt="whoopsie"
                          />
                        ) : (
                          <img
                            key={idx}
                            src={
                              nft?.meta?.image.slice ||
                              `https://ipfs.moralis.io:2053/ipfs//Qmdd3pEV9ZPqS1Vj9i29fsk5vnP1FWQxVFKmzcUZm8yCGK/${nft.id}.png`
                            }
                            alt="whoopsie"
                          />
                        )}
                      </Suspense>

                      <div className={styles.itemDescription}>
                        <p>WD #{nft.id}</p>
                        {Number(nft.id) !== 1000 &&
                        Number(nft.id) !== 2000 &&
                        Number(nft.id) !== 3000 &&
                        Number(nft.id) !== 4000 &&
                        Number(nft.id) !== 5000 &&
                        Number(nft.id) !== 6100 ? (
                          <p>
                            {
                              nft.meta.attributes.filter(
                                (trait) => trait.trait_type === "Faction"
                              )[0].value
                            }
                          </p>
                        ) : (
                          <p>
                            {currentStaker &&
                              currentStaker?.attributes?.oneOfOneFactions?.filter(
                                (item) => item.id === Number(nft.id)
                              ).length > 0 &&
                              formatFaction(
                                currentStaker?.attributes?.oneOfOneFactions?.filter(
                                  (item) => item.id === Number(nft.id)
                                )[0].faction
                              )}
                          </p>
                        )}
                      </div>
                      <div>
                        <div className={styles.powerBar}>
                          <p>
                            {formatWhoopPower(
                              nft,
                              stakedWhoopWeapons.filter(
                                (weapon) =>
                                  Number(weapon.tokenId) === Number(nft.id)
                              ),
                              stakedWhoopEpic.filter(
                                (weapon) =>
                                  Number(weapon.tokenId) === Number(nft.id)
                              )
                            )}
                          </p>
                          <div
                            className={styles.powerLevel}
                            style={{
                              width: "100%",
                            }}
                          />
                        </div>
                        {currentStaker &&
                          currentStaker?.attributes?.whoopIds?.includes(
                            Number(nft.id)
                          ) && (
                            <button
                              disabled={
                                (stakedWhoopWeapons &&
                                  stakedWhoopWeapons.filter(
                                    (token) => token.tokenId === nft.id
                                  ).length > 0) ||
                                (stakedWhoopEpic &&
                                  stakedWhoopEpic.filter(
                                    (token) => token.tokenId === nft.id
                                  ).length > 0)
                              }
                              onClick={() => handleAddWeapon(nft)}
                              className={styles.stakeButton}
                            >
                              Add Weapon
                            </button>
                          )}
                        {currentStaker &&
                          !currentStaker?.attributes?.whoopIds?.includes(
                            Number(nft.id)
                          ) && (
                            <button
                              onClick={() => handleAddWhoop(nft)}
                              className={styles.stakeButton}
                            >
                              Stake
                            </button>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {owned && selected === 1 && (
                <div className={styles.whoopsContainer}>
                  {owned.ea.map((nft, idx) => (
                    <div className={styles.stakeItemContainer} key={idx}>
                      {stakedEaWeapons &&
                        stakedEaWeapons.map((item, idx) => {
                          if (item.tokenId === nft.id) {
                            return (
                              <img
                                key={idx}
                                className={styles.stakedWeapon}
                                src={item.weaponImage}
                                alt="staked weapon"
                              />
                            );
                          } else {
                            return null;
                          }
                        })}
                      {stakedEaEpic &&
                        stakedEaEpic.map((item, idx) => {
                          if (item.tokenId === nft.id) {
                            return (
                              <img
                                key={idx}
                                className={styles.stakedWeapon}
                                src={item.weaponImage}
                                alt="staked weapon"
                              />
                            );
                          } else {
                            return null;
                          }
                        })}
                      {eaImages && (
                        <Suspense
                          fallback={<div className={styles.loadingImage} />}
                        >
                          <img
                            key={idx}
                            src={`${eaImages[idx]}`}
                            alt="ea pass"
                          />
                        </Suspense>
                      )}

                      <div className={styles.itemDescription}>
                        <p>EA #{nft.id}</p>
                        {currentStaker &&
                          currentStaker.attributes?.eaFactions?.filter(
                            (item) => item.id === Number(nft.id)
                          ).length > 0 && (
                            <p>
                              {formatFaction(
                                currentStaker.attributes.eaFactions.filter(
                                  (item) => item.id === Number(nft.id)
                                )[0].faction
                              )}
                            </p>
                          )}
                      </div>
                      <div className={styles.powerBar}>
                        <p>
                          {formatEaPower(
                            stakedEaWeapons.filter(
                              (weapon) =>
                                Number(weapon.tokenId) === Number(nft.id)
                            ),
                            stakedEaEpic.filter(
                              (weapon) =>
                                Number(weapon.tokenId) === Number(nft.id)
                            )
                          )}
                        </p>
                        <div
                          className={styles.powerLevel}
                          style={{
                            width: "100%",
                          }}
                        />
                      </div>
                      {currentStaker &&
                        currentStaker?.attributes?.eaIds?.includes(
                          Number(nft.id)
                        ) && (
                          <button
                            disabled={
                              (stakedEaWeapons &&
                                stakedEaWeapons.filter(
                                  (token) => token.tokenId === nft.id
                                ).length > 0) ||
                              (stakedEaEpic &&
                                stakedEaEpic.filter(
                                  (token) => token.tokenId === nft.id
                                ).length > 0)
                            }
                            onClick={() => handleAddWeapon(nft)}
                            className={styles.stakeButton}
                          >
                            Add Weapon
                          </button>
                        )}
                      {currentStaker &&
                        !currentStaker?.attributes?.eaIds?.includes(
                          Number(nft.id)
                        ) && (
                          <button
                            onClick={() => handleAddWhoop(nft)}
                            className={styles.stakeButton}
                          >
                            Stake
                          </button>
                        )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <StakingLogin />
      )}
    </>
  );
}
