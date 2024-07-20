import { useAccount, useContractReads } from "wagmi";
import whoopAbi from "../whoopAbi.json";
import quirkiesAbi from "../quirkiesAbi.json";
import quirklingsAbi from "../quirklingsAbi.json";
import roomsAbi from "../roomsAbi.json";

export default function useWhoopCheck() {
  const { address } = useAccount();
  const { data, isLoading } = useContractReads({
    contracts: [
      {
        addressOrName: "0x646Eb9B8E6bED62c0e46b67f3EfdEF926Fb9D621",
        contractInterface: whoopAbi,
        functionName: "balanceOf",
        args: [address],
      },
      {
        addressOrName: "0x3903d4fFaAa700b62578a66e7a67Ba4cb67787f9",
        contractInterface: quirkiesAbi,
        functionName: "balanceOf",
        args: [address],
      },
      {
        addressOrName: "0xDA60730E1feAa7D8321f62fFb069eDd869E57D02",
        contractInterface: quirklingsAbi,
        functionName: "balanceOf",
        args: [address],
      },
      {
        addressOrName: "0x2c42Ae60f6A4FA8FAa222374ED99cB6816c1FC96",
        contractInterface: roomsAbi,
        functionName: "balanceOf",
        args: [address],
      },
    ],
  });

  const checkWhoop = () => {
    if (data && !isLoading) {
      if (parseFloat(data[0]) > 0) {
        return true;
      } else {
        return false;
      }
    }
  };

  const checkQuirkies = () => {
    if (data && !isLoading) {
      if (parseFloat(data[1]) > 0) {
        return true;
      } else {
        return false;
      }
    }
  };

  const checkQuirklings = () => {
    if (data && !isLoading) {
      if (parseFloat(data[2]) > 0) {
        return true;
      } else {
        return false;
      }
    }
  };

  const checkRooms = () => {
    if (data && !isLoading) {
      if (parseFloat(data[3]) > 0) {
        return true;
      } else {
        return false;
      }
    }
  };

  return {
    checkWhoop,
    checkQuirkies,
    checkQuirklings,
    checkRooms,
  };
}
