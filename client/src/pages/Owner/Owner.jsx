import { CircularProgress, TextField } from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useMoralis } from "react-moralis";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useAccount,
  useContractReads,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";

import abi from "../../ABI/stakeAbi.json";
import StakingHeader from "../../components/StakingHeader/StakingHeader";
import {
  contractOwner,
  doopAddress,
  stakingAddress,
} from "../../Constant/constants";
import useMerkle from "../../Hooks/useMerkle";

import styles from "./styles.module.scss";

export default function Owner() {
  const { Moralis } = useMoralis();
  const { address } = useAccount();
  const navigate = useNavigate();
  const { generateTree, getRoot } = useMerkle();
  const [unformattedAmount, setUnformattedAmount] = useState(0);
  const [formattedAmount, setFormattedAmount] = useState(0);
  const [unformattedTime, setUnformattedTime] = useState();
  const [formattedTime, setFormattedTime] = useState();
  const [root, setRoot] = useState(null);
  const [newRoot, setNewRoot] = useState(null);
  const [poolActive, setPoolActive] = useState(false);
  const [currentPool, setCurrentPool] = useState(null);

  const getTree = async () => {
    await generateTree();
    let root = getRoot();
    setRoot(root);
  };

  const getNewTree = async () => {
    await generateTree();
    let root = getRoot();
    setNewRoot(root);
  };

  const handlePool = async () => {
    if (Number(formattedAmount) > 0 && unformattedTime > new Date().getTime()) {
      await mint();
      createPool();
    } else {
      toast.error("Invalid Amount or Time");
      return;
    }
  };

  const createPoolInDB = async () => {
    const Pool = Moralis.Object.extend("pools");
    let newPool = new Pool();
    let endTime = new Date(unformattedTime).getTime();
    newPool.set("totalKeltaPower", 0);
    newPool.set("totalCasaPower", 0);
    newPool.set("totalManuPower", 0);
    newPool.set("totalLanuPower", 0);
    newPool.set("poolIdx", currentPool);
    newPool.set("rewardTotal", Number(formattedAmount));
    newPool.set("endTime", endTime);
    if (createPoolError || mintError) {
      toast.error("Error in creating pool");
      return;
    }
    await newPool.save();
    toast.success("Pool Created Successfully");
  };

  useEffect(() => {
    if (root) {
      handlePool();
    }
    // eslint-disable-next-line
  }, [root]);

  useEffect(() => {
    if (newRoot) {
      console.log("newRoot", newRoot);
      setHash();
    }
    // eslint-disable-next-line
  }, [newRoot]);

  const { data } = useContractReads({
    contracts: [
      {
        addressOrName: doopAddress,
        contractInterface: [
          {
            inputs: [
              { internalType: "address", name: "account", type: "address" },
            ],
            name: "balanceOf",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "balanceOf",
        args: [stakingAddress],
      },
      {
        addressOrName: stakingAddress,
        contractInterface: abi,
        functionName: "poolActive",
      },
      {
        addressOrName: stakingAddress,
        contractInterface: abi,
        functionName: "currentPool",
      },
    ],

    watch: true,
  });

  const {
    isLoading: mintLoading,
    isError: mintError,
    writeAsync: mint,
  } = useContractWrite({
    mode: "recklesslyUnprepared",
    addressOrName: doopAddress,
    contractInterface: [
      {
        inputs: [
          { internalType: "address", name: "to", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "mint",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
    functionName: "mint",
    args: [stakingAddress, formattedAmount],
    onError(error) {
      toast.error(error.reason.replace(/execution reverted: /g, ""));
    },
  });

  const {
    data: setHashResponse,
    isLoading: setHashLoading,
    isError: setHashError,
    write: setHash,
  } = useContractWrite({
    mode: "recklesslyUnprepared",
    addressOrName: stakingAddress,
    contractInterface: abi,
    functionName: "setHash",
    args: [newRoot],
    onError(error) {
      toast.error(error.reason.replace(/execution reverted: /g, ""));
      console.log(setHashError);
    },
    onSuccess() {
      toast.success("Hash Set Successfully");
      console.log(setHashResponse);
    },
  });

  const {
    data: createPoolResponse,
    isLoading: createPoolLoading,
    isError: createPoolError,
    write: createPool,
  } = useContractWrite({
    mode: "recklesslyUnprepared",
    addressOrName: stakingAddress,
    contractInterface: abi,
    functionName: "createNewPool",
    args: [formattedAmount, formattedTime, root],
    onError(error) {
      toast.error(error.reason.replace(/execution reverted: /g, ""));
    },
  });

  const { data: waitCreatePool, isLoading: createPoolWaitLoading } =
    useWaitForTransaction({
      confirmations: 1,
      hash: createPoolResponse?.hash,
    });

  useEffect(() => {
    waitCreatePool && createPoolInDB();
    // eslint-disable-next-line
  }, [waitCreatePool, createPoolLoading]);

  useEffect(() => {
    address &&
      address.toLowerCase() !== contractOwner.toLowerCase() &&
      navigate("/staking");
    address === undefined && navigate("/staking");
    // eslint-disable-next-line
  }, [address]);

  useEffect(() => {
    data && setPoolActive(data[1]);
    data && setCurrentPool(Number(data[2]));
  }, [data, createPoolLoading, createPoolWaitLoading]);

  const handleAmountChange = (e) => {
    setUnformattedAmount(e.target.value);
    setFormattedAmount(e.target.value.toString());
  };

  const handleTimeConversion = (time) => {
    let timeDiff =
      new Date(time.$d).getTime() / 1000 - new Date().getTime() / 1000;
    setFormattedTime(timeDiff.toFixed(0));
  };

  return (
    <div className={styles.ownerContainer}>
      {address && <StakingHeader />}
      <h1>Create New Pool</h1>
      {(createPoolLoading || mintLoading || createPoolWaitLoading) && (
        <div className={styles.warning}>
          wait for "Pool Created Successfully" pop-up
        </div>
      )}
      <div className={styles.poolModal}>
        <p>Pool Amount</p>
        <input
          className={styles.amountInput}
          value={unformattedAmount}
          onChange={(e) => handleAmountChange(e)}
          type="number"
        />
        <p>Pool End Date And Time</p>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateTimePicker
            renderInput={(props) => (
              <TextField
                sx={{
                  color: "white",
                  "& .MuiInputBase-input": {
                    color: "white",
                  },
                  "& fieldset": {
                    borderColor: "white",
                  },
                  "& fieldset:hover ": {
                    borderColor: "white",
                  },
                  "& .MuiButtonBase-root": {
                    color: "white",
                  },
                }}
                {...props}
              />
            )}
            value={unformattedTime}
            onChange={(newValue) => {
              setUnformattedTime(newValue);
              handleTimeConversion(newValue);
            }}
          />
        </LocalizationProvider>
        <button
          disabled={
            poolActive ||
            createPoolLoading ||
            mintLoading ||
            createPoolWaitLoading
          }
          onClick={() => getTree()}
          className={styles.poolButton}
        >
          {createPoolLoading || mintLoading || createPoolWaitLoading ? (
            <CircularProgress size={30} color="inherit" />
          ) : (
            "Create Pool"
          )}
        </button>
        {!poolActive && (
          <button
            disabled={
              poolActive ||
              createPoolLoading ||
              mintLoading ||
              createPoolWaitLoading ||
              setHashLoading
            }
            onClick={() => getNewTree()}
            className={styles.poolButton}
          >
            {createPoolLoading || mintLoading || createPoolWaitLoading ? (
              <CircularProgress size={30} color="inherit" />
            ) : (
              "Set Hash"
            )}
          </button>
        )}
      </div>
    </div>
  );
}
