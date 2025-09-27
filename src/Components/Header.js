import React from "react";
import { NavLink } from "react-router-dom"; // use NavLink for active state
import "./Header.css";

const Navbar = () => {
  return (
    <div className="navbar">
      <div className="logo">CZMU</div>
      <ul className="navMenu">
        <li>
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "navLink active" : "navLink"
            }
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive ? "navLink active" : "navLink"
            }
          >
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/storytelling"
            className={({ isActive }) =>
              isActive ? "navLink active" : "navLink"
            }
          >
            Storytelling
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/game"
            className={({ isActive }) =>
              isActive ? "navLink active" : "navLink"
            }
          >
            Planet Game
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Navbar;
