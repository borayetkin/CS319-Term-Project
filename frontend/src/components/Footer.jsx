// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer>
      <div className="footer-content">
        <div className="footer-branding">
          <span className="footer-logo">ATOM</span>
          <div className="status-indicator">
            <span className="status-dot"></span>
            System Online
          </div>
        </div>

        <nav className="footer-links">
          <Link to="/about" className="footer-link">About</Link>
          <Link to="/services" className="footer-link">Services</Link>
          <Link to="/contact" className="footer-link">Contact</Link>
          <Link to="/privacy" className="footer-link">Privacy</Link>
        </nav>

        <div className="footer-social">
          <a href="#" className="social-icon">
            <i className="fab fa-twitter"></i>
          </a>
          <a href="#" className="social-icon">
            <i className="fab fa-linkedin"></i>
          </a>
          <a href="#" className="social-icon">
            <i className="fab fa-github"></i>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
