import { useMoralis } from "react-moralis";

export default function useRanking() {
  const { Moralis } = useMoralis();

  const getSupportedCollections = async () => {
    const query = new Moralis.Query("collectionInfo");
    const collections = await query.find();
    return collections;
  };

  const getTraitPerc = (num) => {
    num = (num / 6125) * 100;
    if (num > 1) {
      return num.toFixed(0);
    } else {
      return num.toFixed(2);
    }
  };

  const getTraitRarity = (num) => {
    return (1 / (num / 6125)).toFixed(2);
  };

  const getRanking = async (num, addr) => {
    let query = new Moralis.Query("supportedNFTs");
    query.equalTo("address", addr.toLowerCase());
    query.select("tokens");
    let tempRank = await query.find();
    tempRank = tempRank[0].attributes.tokens;

    let ranking = tempRank.filter((e) => e.token_id === num);
    let newRanking = [];

    newRanking.push({
      Attributes: ranking[0].attributes,
      Rank: ranking[0].rank,
      Rarity: ranking[0].rarity,
      token_id: ranking[0].token_id,
    });
    return newRanking;
  };

  return { getTraitPerc, getTraitRarity, getRanking, getSupportedCollections };
}
