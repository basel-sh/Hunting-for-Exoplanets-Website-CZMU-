import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="containerf">
        <div className="row">
          {/* About */}
          <div id="footerabout" className="col-md-4">
            <h4 className="FAtitle">About Us</h4>
            <p>
              CZMU is a platform that visualizes exoplanets in 3D and uses AI
              with NASA’s datasets to estimate the potential habitability of
              other worlds. Explore, learn, and imagine new horizons.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-md-4">
            <h4>Quick Links</h4>
            <ul className="ulfooter">
              <li><Link className="lii" to="/">Home</Link></li>
              <li><Link className="lii" to="/dashboard">Dashboard</Link></li>
              <li><Link className="lii" to="/storytelling">Storytelling</Link></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <p className="copyright">
          © {new Date().getFullYear()} <span style={{ color: "#58a6ff" }}>CZMU</span> Team. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}


