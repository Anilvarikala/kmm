import React from "react";
import "./Contact.css";
import contactImage from "../../assets/d2.jpg";
import Navbar from "../Navbar";
import Footer from "../Footer/Footer";

const Contact = () => {
  return (
    <>
      <Navbar />
      <div className="contact-container">
        <h1>
          CONTACT <span>US</span>
        </h1>
        <div className="contact-content">
          <div className="contact-image">
            <img src={contactImage} alt="Doctor and patient" />
          </div>
          <div className="contact-info">
            <h3>OUR OFFICE</h3>
            <p>
              Yamnempet <br />  Hyderabad, Gatkesar
            </p>
            <p>
              <strong>Tel:</strong> 7013725762
            </p>
            <p>
              <strong>Email:</strong> drthankyou@gmail.com
            </p>

            <h3>CAREERS AT Dr THANKYOU</h3>
            <p>Learn more about our teams and job openings.</p>
            <button className="explore-btn">Explore Jobs</button>
          </div>
        </div>
      </div><br /><br />

      <Footer />
    </>
  );
};

export default Contact;
