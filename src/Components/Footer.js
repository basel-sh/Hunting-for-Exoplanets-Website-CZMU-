import React from "react";
import { Link } from "react-router-dom";
import { FaGithub, FaTwitter, FaYoutube } from "react-icons/fa";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* About */}
        <div className="footer-section">
          <h4 className="footer-title">About Us</h4>
          <p className="footer-text">
            Discover the wonders of distant worlds with CZMU! Visualize
            exoplanets in 3D, explore NASA datasets, and see how AI predicts
            their habitability. Learn, explore, and ignite your curiosity about
            the universe.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h4 className="footer-title">Quick Links</h4>
          <ul className="footer-list">
            <li>
              <Link className="footer-link" to="/">
                Home
              </Link>
            </li>
            <li>
              <Link className="footer-link" to="/dashboard">
                Dashboard
              </Link>
            </li>
            <li>
              <Link className="footer-link" to="/game">
                Planet Game 🎮
              </Link>
            </li>
            <li>
              <Link className="footer-link" to="/storytelling">
                About us
              </Link>
            </li>
          </ul>
        </div>

        {/* Socials */}
        <div className="footer-section">
          <h4 className="footer-title">Follow Us</h4>
          <div className="footer-socials">
            <a href="https://github.com" target="_blank" rel="noreferrer">
              <FaGithub />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer">
              <FaTwitter />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer">
              <FaYoutube />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <p className="copyright">
          © {new Date().getFullYear()} <span>CZMU</span> Team. All Rights
          Reserved.
        </p>
      </div>
    </footer>
  );
}
