import React from "react";
import "./FAQPage.scss";
import Navbar from "../../components/NavBar/NavBar";
import {Link} from "react-router-dom";

import raffleCards from "../../assets/raffle.webp";
import novaXWhoopsies from "../../assets/WDxNova.png";
import bridge from "../../assets/bridgeNova.png";
import smartContract from "../../assets/raffleSC.png";
import nftBridge from "../../assets/nftBridge.png";
import claim from "../../assets/claim.png";
import raffleCardOngoing from "../../assets/labeledOngoing.webp";

import {ReactComponent as Map} from "../../assets/map.svg";

export default function FAQ() {
    return (
        <>
            <Navbar />
            <br />
            <br />
            <br />
            <br />

            <div className="faqWrapper">
                <img alt="Raffle Cards" src={raffleCards} className="bannerImage"/>
                <section style={{ marginTop: "40px" }}>
                    <div className="content">
                        <h1>What is Nova & why use it?</h1>
                        <p>Arbitrum Nova is Blockchain just like Ethereum. It provides extremely low gas costs at blazingly fast speeds.
                            We host our raffles on Nova for its lightning fast speeds & ultra low gas costs.
                        </p>
                    </div>
                    <img alt="Whoopsies x Nova" src={novaXWhoopsies} className="customLogoBanners"/>
                </section>

                <section style={{flexDirection: "column"}}>
                    <div className="content" style={{width: "100%"}}>
                        <h1>How to claim Doop?</h1>
                        <p>Whoopsies & EA Pass NFTs generate Doop daily! If you own them it's claimable at the <Link to="/claim">claim page</Link>. If you don't, why not already grab some?
                        </p>
                    </div>
                    <img style={{
                        marginTop: "40px", width: "50%", boxShadow: "0px 0px 14px 3px"
                    }} alt="Doop Claim Widget" src={claim}/>
                </section>

                <section>
                    <img alt="Nova bridge banner" src={bridge} className="customLogoBanners"/>
                    <div className="content">
                        <h1>How do I bridge Doop or Eth?</h1>
                        <p>Doop can easily be bridged in one step at the <Link to="/bridge">bridge page</Link>. <Link to="/bridge">The bridge</Link> will also help you bridge Eth to Nova.
                        </p>
                    </div>
                </section>

                <section>
                    <div className="content">
                        <h1>How to enter a raffle?</h1>
                        <p>Once you have bridged Doop & Eth. Go to the <Link to="/raffle">raffle page</Link>. There any raffle can be entered with a single transaction! Its never been easier try your luck right now!
                        </p>
                    </div>
                    <img alt="Raffle Card for an ongoing raffle" src={raffleCardOngoing}/>
                </section>

                <section>
                    <div className="content">
                        <h1>How to claim the prize?</h1>
                        <p>Once you win your awesome prize you will receive a wrapped NFT in your wallet. You'll be shown a popup that'll allow you to bridge your prize Wrapped NFT back to the Ethereum mainnet.
                        </p>
                    </div>
                    <img alt="Nft bridge widget" src={nftBridge}/>
                </section>

                <section>
                    <img alt="Smart Contract code" src={smartContract}/>
                    <div className="content">
                        <h1>What are the contract addresses?</h1>
                        <p>The address of the raffle contract is <a href="https://nova.arbiscan.io/address/0x9d67826f6d8de7428F097f003d9F64fA5B8207Ba" target="_blank">0x9d67...7Ba</a>,
                            while the address of the Doop Contract is <a href="https://nova.arbiscan.io/address/0x0fbf48bF210417b79D0B21BBA382a6399237b46B" target="_blank">0x0fbf...46B</a>.
                        </p>
                    </div>
                </section>

                <section>
                    <Map className="svgAsImage"/>
                    <div className="content">
                        <h1>How a winner is chosen?</h1>
                        <p>A winner is selected with the help of an automated process that happens off-chain. The process is done off-chain to reduce the operational cost.
                        </p>
                    </div>
                </section>
            </div>
            <br />
            <br />
            <br />
            <br />
        </>
    );
}
