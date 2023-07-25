import React, { useState } from "react";
import { useAccount } from "wagmi";
import { useDisconnect } from "wagmi";
import { Link } from "react-router-dom";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";

import styles from "./styles.module.scss";
import LoginModal from "../LoginModal/LoginModal";

export default function DashNav({ holder }) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const mobile = window.matchMedia("(max-width: 767px)");
  const [openModal, setOpenModal] = useState(false);
  const [openNav, setOpenNav] = useState(false);

  const logOut = async () => {
    disconnect();
    window.location.replace("/dashboard");
  };

  return (
    <>
      {!mobile.matches && (
        <nav
          onMouseEnter={() => setOpenNav(true)}
          onMouseLeave={() => setOpenNav(false)}
          className={openNav ? styles.dashNavOpen : styles.dashNavCollapsed}
        >
          <Link className={styles.navLink} to="/">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path d="M21 13v10h-6v-6h-6v6h-6v-10h-3l12-12 12 12h-3zm-1-5.907v-5.093h-3v2.093l3 3z" />
            </svg>{" "}
            <h4>Home</h4>
          </Link>
          <Link
            className={styles.navLink}
            to={`${holder ? "/dashboard/analytics" : "/dashboard"}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M7 24h-6v-6h6v6zm8-9h-6v9h6v-9zm8-4h-6v13h6v-13zm0-11l-6 1.221 1.716 1.708-6.85 6.733-3.001-3.002-7.841 7.797 1.41 1.418 6.427-6.39 2.991 2.993 8.28-8.137 1.667 1.66 1.201-6.001z" />
            </svg>
            <h4>Analytics</h4>
          </Link>
          <Link
            className={styles.navLink}
            to={`${holder ? "/dashboard/rarity" : "/dashboard"}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path d="M21 4l-5-3h-8l-5 3-3 5 12 14 12-14.042-3-4.958zm-13.287 8.974l1.463 3.658-4.379-5.108 2.916 1.45zm6.668-4.974l.58 2.905-.038.095h-5.846l-.038-.095.58-2.905h4.762zm-.258 5l-2.123 5.307-2.123-5.307h4.246zm2.164-.026l2.881-1.44-4.332 5.069 1.451-3.629zm4.953-4.713l-4.334 2.168-.573-2.864 3.651-1.38 1.256 2.076zm-12.685-5.261h6.891l2.824 1.694-3.453 1.306h-5.64l-3.491-1.279 2.869-1.721zm-4.561 3.23l3.671 1.345-.571 2.856-4.329-2.152 1.229-2.049z" />
            </svg>
            <h4>Rarity</h4>
          </Link>

          {address && (
            <button className={styles.jazz}>
              <Jazzicon diameter={25} seed={jsNumberForAddress(address)} />
              <h4>{address.slice(0, 6) + "..." + address.slice(38, 42)}</h4>
            </button>
          )}
          {!address && (
            <button
              className={styles.navLink}
              onClick={() => setOpenModal(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                <path d="M12.136.326A1.5 1.5 0 0 1 14 1.78V3h.5A1.5 1.5 0 0 1 16 4.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 13.5v-9a1.5 1.5 0 0 1 1.432-1.499L12.136.326zM5.562 3H13V1.78a.5.5 0 0 0-.621-.484L5.562 3zM1.5 4a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-13z" />
              </svg>
              <h4>Connect</h4>
            </button>
          )}
          {address && (
            <button className={styles.navLink} onClick={() => logOut()}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                <path
                  fillRule="evenodd"
                  d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"
                />
                <path
                  fillRule="evenodd"
                  d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"
                />
              </svg>
              <h4>Logout</h4>
            </button>
          )}
        </nav>
      )}
      {mobile.matches && (
        <nav className={openNav ? styles.dashNavOpen : styles.dashNavCollapsed}>
          <Link className={styles.navLink} to="/">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path d="M21 13v10h-6v-6h-6v6h-6v-10h-3l12-12 12 12h-3zm-1-5.907v-5.093h-3v2.093l3 3z" />
            </svg>
          </Link>
          <Link
            className={styles.navLink}
            to={`${holder ? "/dashboard/analytics" : "/dashboard"}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M7 24h-6v-6h6v6zm8-9h-6v9h6v-9zm8-4h-6v13h6v-13zm0-11l-6 1.221 1.716 1.708-6.85 6.733-3.001-3.002-7.841 7.797 1.41 1.418 6.427-6.39 2.991 2.993 8.28-8.137 1.667 1.66 1.201-6.001z" />
            </svg>
          </Link>
          <Link
            className={styles.navLink}
            to={`${holder ? "/dashboard/rarity" : "/dashboard"}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path d="M21 4l-5-3h-8l-5 3-3 5 12 14 12-14.042-3-4.958zm-13.287 8.974l1.463 3.658-4.379-5.108 2.916 1.45zm6.668-4.974l.58 2.905-.038.095h-5.846l-.038-.095.58-2.905h4.762zm-.258 5l-2.123 5.307-2.123-5.307h4.246zm2.164-.026l2.881-1.44-4.332 5.069 1.451-3.629zm4.953-4.713l-4.334 2.168-.573-2.864 3.651-1.38 1.256 2.076zm-12.685-5.261h6.891l2.824 1.694-3.453 1.306h-5.64l-3.491-1.279 2.869-1.721zm-4.561 3.23l3.671 1.345-.571 2.856-4.329-2.152 1.229-2.049z" />
            </svg>
          </Link>
          <Link
            className={styles.navLink}
            to={`${address ? "/dashboard/claim" : "/dashboard"}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path d="M22 4h-20c-1.104 0-2 .896-2 2v12c0 1.104.896 2 2 2h20c1.104 0 2-.896 2-2v-12c0-1.104-.896-2-2-2zm0 13.5c0 .276-.224.5-.5.5h-19c-.276 0-.5-.224-.5-.5v-6.5h20v6.5zm0-9.5h-20v-1.5c0-.276.224-.5.5-.5h19c.276 0 .5.224.5.5v1.5zm-9 6h-9v-1h9v1zm-3 2h-6v-1h6v1zm10-2h-3v-1h3v1z" />
            </svg>
          </Link>

          {address && (
            <Link to="/dashboard/claim" className={styles.jazz}>
              <Jazzicon diameter={25} seed={jsNumberForAddress(address)} />
            </Link>
          )}
          {!address && (
            <button
              className={styles.navLink}
              onClick={() => setOpenModal(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                <path d="M12.136.326A1.5 1.5 0 0 1 14 1.78V3h.5A1.5 1.5 0 0 1 16 4.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 13.5v-9a1.5 1.5 0 0 1 1.432-1.499L12.136.326zM5.562 3H13V1.78a.5.5 0 0 0-.621-.484L5.562 3zM1.5 4a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-13z" />
              </svg>
              <h4>Connect</h4>
            </button>
          )}
          {address && (
            <button className={styles.navLink} onClick={() => logOut()}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                <path
                  fillRule="evenodd"
                  d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"
                />
                <path
                  fillRule="evenodd"
                  d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"
                />
              </svg>
              <h4>Logout</h4>
            </button>
          )}
        </nav>
      )}

      {!isConnected && !address && (
        <LoginModal setOpenModal={setOpenModal} holder={holder} />
      )}
      {openModal && <LoginModal setOpenModal={setOpenModal} />}
    </>
  );
}
