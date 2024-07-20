import { useMoralis } from "react-moralis";

export default function useStakingStats() {
  const { Moralis } = useMoralis();
  const findFactionStaked = async (pool) => {
    const Stakers = new Moralis.Query("stakers");
    Stakers.withCount();
    let stakers = await Stakers.find();
    let allStakers = stakers.results.map((item) => item);
    let pages = (stakers.count / 100).toFixed(0);
    //const timer = (ms) => new Promise((res) => setTimeout(res, ms));
    if (stakers.count > 100) {
      for (let i = 1; i <= pages; i++) {
        Stakers.skip(i * 100);
        stakers = await Stakers.find();
        stakers.results.forEach((item) => allStakers.push(item));
      }
    }

    let stakedFactions = {
      kelta: 0,
      casa: 0,
      manu: 0,
      lanu: 0,
    };

    allStakers.forEach((staker) => {
      if (staker.attributes.poolIdx === pool) {
        staker.attributes.whoopFactions.forEach((item) => {
          if (item.faction === 0) {
            stakedFactions.kelta += 1;
          }
          if (item.faction === 1) {
            stakedFactions.casa += 1;
          }
          if (item.faction === 2) {
            stakedFactions.manu += 1;
          }
          if (item.faction === 3) {
            stakedFactions.lanu += 1;
          }
        });
      }
    });

    return stakedFactions;
  };

  const createBackup = async () => {
    const Stakers = new Moralis.Query("stakers");
    Stakers.withCount();
    let stakers = await Stakers.find();
    let allStakers = stakers.results.map((item) => item);
    let pages = (stakers.count / 100).toFixed(0);
    //const timer = (ms) => new Promise((res) => setTimeout(res, ms));
    if (stakers.count > 100) {
      for (let i = 1; i <= pages; i++) {
        Stakers.skip(i * 100);
        stakers = await Stakers.find();
        stakers.results.forEach((item) => allStakers.push(item));
      }
    }

    const StakersBackup = Moralis.Object.extend("stakersBackup");

    for (let i = 0; i < allStakers.length; i++) {
      const stakersBackup = new StakersBackup();
      stakersBackup.set(
        "oneOfOneFactions",
        allStakers[i].attributes.oneOfOneFactions
      );
      stakersBackup.set("poolIdx", allStakers[i].attributes.poolIdx);
      stakersBackup.set("keltaPower", allStakers[i].attributes.keltaPower);
      stakersBackup.set("casaPower", allStakers[i].attributes.casaPower);
      stakersBackup.set("manuPower", allStakers[i].attributes.manuPower);
      stakersBackup.set("lanuPower", allStakers[i].attributes.lanuPower);
      stakersBackup.set("eaFactions", allStakers[i].attributes.eaFactions);
      stakersBackup.set("address", allStakers[i].attributes.address);
      stakersBackup.set(
        "epicEaWeapons",
        allStakers[i].attributes.epicEaWeapons
      );
      stakersBackup.set(
        "whoopFactions",
        allStakers[i].attributes.whoopFactions
      );
      stakersBackup.set("whoopWeapons", allStakers[i].attributes.whoopWeapons);
      stakersBackup.set("whoopIds", allStakers[i].attributes.whoopIds);
      stakersBackup.set("eaWeapons", allStakers[i].attributes.eaWeapons);
      stakersBackup.set("eaIds", allStakers[i].attributes.eaIds);
      stakersBackup.set(
        "epicWhoopWeapons",
        allStakers[i].attributes.epicWhoopWeapons
      );
      await stakersBackup.save();
    }
  };

  const backupPool = async (currentPool) => {
    const Pools = new Moralis.Query("pools");
    Pools.equalTo("poolIdx", currentPool);
    let pool = await Pools.find();
    const backupPool = Moralis.Object.extend("poolBackup");
    const poolBackup = new backupPool();
    poolBackup.set("poolIdx", pool[0].attributes.poolIdx);
    poolBackup.set("totalKeltaPower", pool[0].attributes.totalKeltaPower);
    poolBackup.set("totalCasaPower", pool[0].attributes.totalCasaPower);
    poolBackup.set("totalManuPower", pool[0].attributes.totalManuPower);
    poolBackup.set("totalLanuPower", pool[0].attributes.totalLanuPower);
    await poolBackup.save();
  };

  return { findFactionStaked, createBackup, backupPool };
}
