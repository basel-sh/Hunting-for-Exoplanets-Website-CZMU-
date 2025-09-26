import React from "react";
import { Link } from "react-router-dom";
import "./Header.css";

const Navbar = () => {
  return (
    <div className="divnavbar">
      <nav className="navbar">
        <div className="logo">CZMU</div>
        <ul className="navMenu">
          <li>
            <Link className="lii" to="/">
              Home
            </Link>
          </li>
          <li>
            <Link className="lii" to="/dashboard">
              Dashboard
            </Link>
          </li>
          <li>
            <Link className="lii" to="/storytelling">
              Storytelling
            </Link>
          </li>
          <li>
            <Link className="lii" to="/game">
              Planet Game
            </Link>
          </li>{" "}
          {/* الرابط الجديد */}
        </ul>
      </nav>
    </div>
  );
};

export default Navbar;
