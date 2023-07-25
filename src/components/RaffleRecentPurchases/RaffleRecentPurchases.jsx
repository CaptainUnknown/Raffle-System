import React, { useState, useEffect } from "react";
import "./RaffleRecentPurchases.scss";

import { useMoralis } from "react-moralis";
import { ReactComponent as Loading } from "../../assets/icons/loading.svg";
import HelperContract from "../../context/helperInteract";

function RaffleRecentPurchases({ raffleId }) {
    const { Moralis, isInitialized } = useMoralis();
    const [isLoading, setIsLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(true);
    const [recentPurchases, setRecentPurchases] = useState(false);

    const getRecent = async () => {
        const contract = new HelperContract();
        const entries = await contract.getRecentEntries(raffleId);
        console.log(entries);
        await setRecentPurchases(entries);
        setIsLoading(false);
    };

    useEffect(() => {
        getRecent();
        // eslint-disable-next-line
    }, [isExpanded]);

    const handleExpandClick = () => {
        setIsExpanded(!isExpanded);
        console.log("isExpanded", isExpanded);
    };

    const parseAddress = (address) => {
        if (address === null) return "N/A";
        if (address.length <= 18) return address;
        return address.slice(0, 6) + "..." + address.slice(-4);
    };

    return (
        <>
            <div className="recentWrap">
                <div
                    className="recent"
                    onClick={handleExpandClick}
                    style={{
                        borderRadius: isExpanded
                            ? "var(--border-radius) var(--border-radius) 0 0"
                            : "var(--border-radius)"
                    }}
                >
                    <h1> Recent Purchases </h1>
                </div>
                <div className={`all ${isExpanded ? "allExpanded" : ""}`} style={{ display: isExpanded ? "flex" : "none", width: "100%" }}>
                    {isLoading ? (
                        <Loading />
                    ) : (
                        <>
                            <div style={{ width: "100%" }}>
                                {
                                    recentPurchases.length !== 0 ?
                                    recentPurchases.map((purchase) => (
                                        <p> {parseAddress(purchase.wallet)}
                                            <span>{purchase.ticketCount}</span>
                                        </p>
                                    )) : <p> No Purchases Yet </p>
                                }
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

export default RaffleRecentPurchases;
