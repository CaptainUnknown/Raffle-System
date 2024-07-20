import { useMoralis } from "react-moralis";

export default function useIcyQuery() {
  const { Moralis } = useMoralis();

  const fetchTrending = async (timeFrame) => {
    let res;
    try {
      res = await Moralis.Cloud.run("fetchTrending", { timeFrame: timeFrame });
    } catch (err) {
      return err;
    }
    return res;
  };

  const fetchMints = async (block) => {
    const ethers = Moralis.web3Library;
    const apiKey = "fWWp_qP8N18IXE2aT4rluwbnEJpSM-C6";
    const myAddress = "0x0000000000000000000000000000000000000000";
    const provider = new ethers.providers.AlchemyProvider("homestead", apiKey);
    const logs = await provider.getLogs({
      topics: [
        ethers.utils.id("Transfer(address,address,uint256)"),
        ethers.utils.hexZeroPad(myAddress, 32),
      ],
      fromBlock: block,
    });
    return logs;
  };

  return { fetchTrending, fetchMints };
}
