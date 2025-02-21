import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h2 className="footer-brand">Dr THANKYOU</h2>
          <p>
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text
            ever since the 1500s.
          </p>
        </div>
        <div className="footer-section">
          <h3>Company</h3>
          <ul>
            <li>Home</li>
            <li>About us</li>
            <li>Delivery</li>
            <li>Privacy policy</li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Get in Touch</h3>
          <p>+0-000-000-000</p>
          <p>drthankyou@gmail.com</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>Copyright 2024 @ Dr THANKYOU - All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
