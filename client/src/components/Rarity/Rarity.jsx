import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { Link } from "react-router-dom";

import styles from "./styles.module.scss";

export default function Rarity() {
  const { Moralis } = useMoralis();
  const [collections, setCollections] = useState(null);
  const [address, setAddress] = useState("");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(false);

  const fetchCollectionInfo = async () => {
    let collectionQuery = new Moralis.Query("supportedNFTs");
    collectionQuery.select("name", "address", "img", "slug");
    let supported = await collectionQuery.find();
    setCollections(supported);
  };

  const searchSupported = async () => {
    setError(null);
    setSuccessMessage(false);
    let query = new Moralis.Query("supportedNFTs");
    query.contains("address", address.toLowerCase());
    query.select("name", "address", "img", "slug");
    let results = await query.find();
    results.length > 0 && setCollections(results);
    results.length < 1 && setCollections(null);
  };

  const generateRarity = async () => {
    setSuccessMessage(false);
    setError(null);
    const ethers = Moralis.web3Library;
    if (ethers.utils.isAddress(address)) {
      let query = new Moralis.Query("supportedNFTs");
      let queueQuery = new Moralis.Query("collectionQueue");
      queueQuery.equalTo("address", address.toLowerCase());
      query.equalTo("address", address.toLowerCase());
      let results = await query.find();
      let inQueue = await queueQuery.find();
      if (results.length > 0 || inQueue.length > 0) {
        setError("Collection Is Already Added.");
        setAddress("");
      } else {
        const Queue = Moralis.Object.extend("collectionQueue");
        const queue = new Queue();
        queue.set("address", address.toLowerCase());
        await queue.save();
        setSuccessMessage(true);
        setAddress("");
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    } else {
      setError("Invalid Address");
    }
  };

  useEffect(() => {
    address !== "" && searchSupported();
    //eslint-disable-next-line
  }, [address]);

  useEffect(() => {
    fetchCollectionInfo();
    // eslint-disable-next-line
  }, []);

  return (
    <div className={styles.rarityContainer}>
      {successMessage && (
        <div className={styles.successContainer}>
          <svg
            clipRule="evenodd"
            fillRule="evenodd"
            strokeLinejoin="round"
            strokeMiterlimit="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="m11.998 2.005c5.517 0 9.997 4.48 9.997 9.997 0 5.518-4.48 9.998-9.997 9.998-5.518 0-9.998-4.48-9.998-9.998 0-5.517 4.48-9.997 9.998-9.997zm0 1.5c-4.69 0-8.498 3.807-8.498 8.497s3.808 8.498 8.498 8.498 8.497-3.808 8.497-8.498-3.807-8.497-8.497-8.497zm-5.049 8.886 3.851 3.43c.142.128.321.19.499.19.202 0 .405-.081.552-.242l5.953-6.509c.131-.143.196-.323.196-.502 0-.41-.331-.747-.748-.747-.204 0-.405.082-.554.243l-5.453 5.962-3.298-2.938c-.144-.127-.321-.19-.499-.19-.415 0-.748.335-.748.746 0 .205.084.409.249.557z"
              fillRule="nonzero"
            />
          </svg>
          Collection Added! Please allow up to an hour for the collection rarity
          to be updated. Thank you.
        </div>
      )}
      {error && (
        <div className={styles.errorContainer}>
          <svg
            clipRule="evenodd"
            fillRule="evenodd"
            strokeLinejoin="round"
            strokeMiterlimit="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="m12.002 21.534c5.518 0 9.998-4.48 9.998-9.998s-4.48-9.997-9.998-9.997c-5.517 0-9.997 4.479-9.997 9.997s4.48 9.998 9.997 9.998zm0-1.5c-4.69 0-8.497-3.808-8.497-8.498s3.807-8.497 8.497-8.497 8.498 3.807 8.498 8.497-3.808 8.498-8.498 8.498zm0-6.5c-.414 0-.75-.336-.75-.75v-5.5c0-.414.336-.75.75-.75s.75.336.75.75v5.5c0 .414-.336.75-.75.75zm-.002 3c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"
              fillRule="nonzero"
            />
          </svg>
          {error}
        </div>
      )}
      <div className={styles.titleContainer}>
        <div className={styles.title}>
          <h2>Supported Collections</h2>
          <div className={styles.search}>
            <input
              type="text"
              value={address}
              placeholder="Search Collections By Address"
              onChange={(e) => setAddress(e.target.value)}
            />
            {!collections && (
              <button
                disabled={address.length < 42 || address.length > 42}
                onClick={() => generateRarity()}
              >
                Add
              </button>
            )}
          </div>
        </div>
        <hr />
      </div>
      {!collections && (
        <div className={styles.notFoundContainer}>
          <div className={styles.notFound}>
            <h2>No Collection Found, You can add a new collection above.</h2>
            <ul>
              <li>Make Sure The Collection Is 100% Revealed.</li>
              <li>
                Make Sure The Collection Attributes Are Unique
                <div className={styles.exampleText}>
                  <div className={styles.exampleTextInner}>
                    <p className={styles.correct}>
                      <svg
                        clipRule="evenodd"
                        fillRule="evenodd"
                        strokeLinejoin="round"
                        strokeMiterlimit="2"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="m11.998 2.005c5.517 0 9.997 4.48 9.997 9.997 0 5.518-4.48 9.998-9.997 9.998-5.518 0-9.998-4.48-9.998-9.998 0-5.517 4.48-9.997 9.998-9.997zm0 1.5c-4.69 0-8.498 3.807-8.498 8.497s3.808 8.498 8.498 8.498 8.497-3.808 8.497-8.498-3.807-8.497-8.497-8.497zm-5.049 8.886 3.851 3.43c.142.128.321.19.499.19.202 0 .405-.081.552-.242l5.953-6.509c.131-.143.196-.323.196-.502 0-.41-.331-.747-.748-.747-.204 0-.405.082-.554.243l-5.453 5.962-3.298-2.938c-.144-.127-.321-.19-.499-.19-.415 0-.748.335-.748.746 0 .205.084.409.249.557z"
                          fillRule="nonzero"
                        />
                      </svg>
                      Background: Aqua
                    </p>
                    <p className={styles.correct}>
                      <svg
                        clipRule="evenodd"
                        fillRule="evenodd"
                        strokeLinejoin="round"
                        strokeMiterlimit="2"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="m11.998 2.005c5.517 0 9.997 4.48 9.997 9.997 0 5.518-4.48 9.998-9.997 9.998-5.518 0-9.998-4.48-9.998-9.998 0-5.517 4.48-9.997 9.998-9.997zm0 1.5c-4.69 0-8.498 3.807-8.498 8.497s3.808 8.498 8.498 8.498 8.497-3.808 8.497-8.498-3.807-8.497-8.497-8.497zm-5.049 8.886 3.851 3.43c.142.128.321.19.499.19.202 0 .405-.081.552-.242l5.953-6.509c.131-.143.196-.323.196-.502 0-.41-.331-.747-.748-.747-.204 0-.405.082-.554.243l-5.453 5.962-3.298-2.938c-.144-.127-.321-.19-.499-.19-.415 0-.748.335-.748.746 0 .205.084.409.249.557z"
                          fillRule="nonzero"
                        />
                      </svg>
                      Hat: Captain Hat
                    </p>
                    <p className={styles.correct}>
                      <svg
                        clipRule="evenodd"
                        fillRule="evenodd"
                        strokeLinejoin="round"
                        strokeMiterlimit="2"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="m11.998 2.005c5.517 0 9.997 4.48 9.997 9.997 0 5.518-4.48 9.998-9.997 9.998-5.518 0-9.998-4.48-9.998-9.998 0-5.517 4.48-9.997 9.998-9.997zm0 1.5c-4.69 0-8.498 3.807-8.498 8.497s3.808 8.498 8.498 8.498 8.497-3.808 8.497-8.498-3.807-8.497-8.497-8.497zm-5.049 8.886 3.851 3.43c.142.128.321.19.499.19.202 0 .405-.081.552-.242l5.953-6.509c.131-.143.196-.323.196-.502 0-.41-.331-.747-.748-.747-.204 0-.405.082-.554.243l-5.453 5.962-3.298-2.938c-.144-.127-.321-.19-.499-.19-.415 0-.748.335-.748.746 0 .205.084.409.249.557z"
                          fillRule="nonzero"
                        />
                      </svg>
                      Glasses: Shades
                    </p>
                  </div>
                  <div className={styles.exampleTextInner}>
                    <p className={styles.incorrect}>
                      <svg
                        clipRule="evenodd"
                        fillRule="evenodd"
                        strokeLinejoin="round"
                        strokeMiterlimit="2"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="m12.002 2.005c5.518 0 9.998 4.48 9.998 9.997 0 5.518-4.48 9.998-9.998 9.998-5.517 0-9.997-4.48-9.997-9.998 0-5.517 4.48-9.997 9.997-9.997zm0 1.5c-4.69 0-8.497 3.807-8.497 8.497s3.807 8.498 8.497 8.498 8.498-3.808 8.498-8.498-3.808-8.497-8.498-8.497zm4.253 7.75h-8.5c-.414 0-.75.336-.75.75s.336.75.75.75h8.5c.414 0 .75-.336.75-.75s-.336-.75-.75-.75z"
                          fillRule="nonzero"
                        />
                      </svg>
                      Accessory: Earring
                    </p>
                    <p className={styles.incorrect}>
                      <svg
                        clipRule="evenodd"
                        fillRule="evenodd"
                        strokeLinejoin="round"
                        strokeMiterlimit="2"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="m12.002 2.005c5.518 0 9.998 4.48 9.998 9.997 0 5.518-4.48 9.998-9.998 9.998-5.517 0-9.997-4.48-9.997-9.998 0-5.517 4.48-9.997 9.997-9.997zm0 1.5c-4.69 0-8.497 3.807-8.497 8.497s3.807 8.498 8.497 8.498 8.498-3.808 8.498-8.498-3.808-8.497-8.498-8.497zm4.253 7.75h-8.5c-.414 0-.75.336-.75.75s.336.75.75.75h8.5c.414 0 .75-.336.75-.75s-.336-.75-.75-.75z"
                          fillRule="nonzero"
                        />
                      </svg>
                      Accessory: Captain Hat
                    </p>
                    <p className={styles.incorrect}>
                      <svg
                        clipRule="evenodd"
                        fillRule="evenodd"
                        strokeLinejoin="round"
                        strokeMiterlimit="2"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="m12.002 2.005c5.518 0 9.998 4.48 9.998 9.997 0 5.518-4.48 9.998-9.998 9.998-5.517 0-9.997-4.48-9.997-9.998 0-5.517 4.48-9.997 9.997-9.997zm0 1.5c-4.69 0-8.497 3.807-8.497 8.497s3.807 8.498 8.497 8.498 8.498-3.808 8.498-8.498-3.808-8.497-8.498-8.497zm4.253 7.75h-8.5c-.414 0-.75.336-.75.75s.336.75.75.75h8.5c.414 0 .75-.336.75-.75s-.336-.75-.75-.75z"
                          fillRule="nonzero"
                        />
                      </svg>
                      Accessory: Shades
                    </p>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      )}
      {collections && (
        <div className={styles.collectionsContainer}>
          {collections.map((collection) => (
            <Link
              key={collection.attributes.name}
              to={`/dashboard/collection/${collection.attributes.slug}`}
              className={styles.collectionCard}
            >
              <img alt="collection avatar" src={collection.attributes.img} />
              <h4>{collection.attributes.name}</h4>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
