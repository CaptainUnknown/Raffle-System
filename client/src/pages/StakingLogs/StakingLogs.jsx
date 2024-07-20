import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";

import StakingHeader from "../../components/StakingHeader/StakingHeader";

import styles from "./styles.module.scss";
import background from "../../assets/staking/mobileBG.png";
import { useAccount } from "wagmi";
import { contractOwner } from "../../Constant/constants";
import { TextField } from "@mui/material";
import StakingLogin from "../../components/StakingLogin/StakingLogin";

export default function StakingLogs() {
  const { Moralis } = useMoralis();
  const { address } = useAccount();
  const [logs, setLogs] = useState([]);
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [image, setImage] = useState(null);

  const handleImageChange = (e) => {
    const image = e.target.files[0];
    setImage(image);
  };

  const handleUploadPost = async () => {
    let { message } = await Moralis.Cloud.run("requestMessage", {
      address: address,
      chain: parseInt(1, 16),
      networkType: "evm",
    });
    await Moralis.authenticate({
      signingMessage: message,
      throwOnError: true,
    });
    const Logs = Moralis.Object.extend("stakingLogs");
    const logs = new Logs();
    const newFile = new Moralis.File(`${image.name}`, image);
    let file = await newFile.save();
    logs.set("title", title);
    logs.set("description", description);
    logs.set("image", file);
    logs.set("datePosted", new Date(Date.now()).toLocaleString().split(",")[0]);
    await logs.save();
    setTitle("");
    setDescription("");
    setImage(null);
    fetchLogs();
  };

  const fetchLogs = async () => {
    const Logs = Moralis.Object.extend("stakingLogs");
    const query = new Moralis.Query(Logs);
    query.descending("createdAt");
    const results = await query.find();
    setLogs(results);
  };

  const deleteLog = async (id) => {
    const logsQuery = new Moralis.Query("stakingLogs");
    logsQuery.equalTo("objectId", id);
    const log = await logsQuery.find();
    await log[0].destroy();
    fetchLogs();
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {address ? (
        <>
          <StakingHeader />
          <div className={styles.stakingLogsContainer}>
            {address === contractOwner && (
              <div className={styles.addLog}>
                <TextField
                  id="outlined-basic"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
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
                    "& .MuiInputLabel-root": {
                      color: "white",
                    },
                  }}
                  label="Title"
                  variant="outlined"
                />
                <TextField
                  id="outlined-multiline-static"
                  label="Content"
                  multiline
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
                    "& .MuiInputLabel-root": {
                      color: "white",
                    },
                  }}
                  placeholder="Put Content Here ..."
                />
                <input
                  className={styles.imageInput}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e)}
                />
                <button
                  onClick={() => handleUploadPost()}
                  className={styles.submit}
                >
                  SAVE
                </button>
              </div>
            )}
            <div className={styles.logsWrapper}>
              <img
                src={background}
                alt="background"
                className={styles.background}
              />
              <div className={styles.logs}>
                {(title || description) && (
                  <div className={styles.log}>
                    {image && (
                      <img src={URL.createObjectURL(image)} alt="log preview" />
                    )}
                    {!image && (
                      <div className={styles.imgPlaceholder}>
                        No Image Selected{" "}
                      </div>
                    )}
                    <div className={styles.logInfo}>
                      <p>
                        {new Date(Date.now()).toLocaleString().split(",")[0]}
                      </p>
                      <h2>{title}</h2>
                      <p>{description}</p>
                    </div>
                  </div>
                )}
                {logs &&
                  logs.map((log, index) => (
                    <div className={styles.log} key={index}>
                      <img src={log.attributes.image._url} alt="log" />
                      <div className={styles.logInfo}>
                        <p>{log.attributes.datePosted}</p>
                        <h2>{log.attributes.title}</h2>
                        <p>{log.attributes.description}</p>
                      </div>
                      {address === contractOwner && (
                        <button
                          onClick={() => deleteLog(log.id)}
                          className={styles.delete}
                        >
                          DELETE
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <StakingLogin />
      )}
    </>
  );
}
