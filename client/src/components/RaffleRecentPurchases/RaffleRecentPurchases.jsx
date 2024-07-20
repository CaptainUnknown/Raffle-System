import React, {useEffect, useState} from "react";
import "./RaffleRecentPurchases.scss";

import {ReactComponent as Loading} from "../../assets/icons/loading.svg";
import HelperContract from "../../context/helperInteract";
import RaffleRelayContract from "../../context/RaffleRelayInteract";
import {getUserNameFromAddress, parseAddress} from "../../context/utils";

function RaffleRecentPurchases({ raffleId }) {
    const [isLoading, setIsLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(true);
    const [recentPurchases, setRecentPurchases] = useState([]);
    const [userNames, setUserNames] = useState([]);
    const [areUserNamesFetched, setAreUserNamesFetched] = useState(false);

    const getRecent = async () => {
        const contract = raffleId < 19 ? new HelperContract() : new RaffleRelayContract();
        const entries = await contract.getRecentEntries(raffleId);
        console.log(entries);
        await setRecentPurchases(entries);
        setIsLoading(false);
    };

    const getUserNames = async () => {
        try {
            console.log("recentPurchases.length > 0", recentPurchases.length > 0);
            if (!(recentPurchases.length > 0)) return;
            const promises = recentPurchases.map(async (purchase) => {
                return await getUserNameFromAddress(purchase.wallet, true);
            });
            const fetchedUserNames = await Promise.all(promises);
            setUserNames(fetchedUserNames);
            setAreUserNamesFetched(true);
        } catch (error) {
            console.error('Error fetching usernames _raffleRecentPurchases:', error);
        }
    };

    useEffect(() => {
        getRecent();
        // eslint-disable-next-line
    }, [isExpanded]);

    useEffect(() => {
        if (!(recentPurchases.length > 0) && isLoading) return;
        getUserNames();
    }, [recentPurchases, isLoading])

    const handleExpandClick = () => {
        setIsExpanded(!isExpanded);
        console.log("isExpanded", isExpanded);
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
                                        recentPurchases.map((purchase, index) => (
                                            <p key={index}>
                                                <img src={areUserNamesFetched && userNames[index].profile_image_url ? userNames[index].profile_image_url : `https://picsum.photos/4/4?random=${index}`} alt={`${areUserNamesFetched ? userNames[index].username : "User "} Avatar`} />
                                                {parseAddress(areUserNamesFetched && userNames[index].username ? userNames[index].username : purchase.wallet)}
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
