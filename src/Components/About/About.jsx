// import React from "react";
// import "./About.css";
// import doctorImage from "../../assets/d2.jpg"; // Replace with the actual image path
// import Navbar from "../Navbar";
// import Footer from "../Footer/Footer";

// const About = () => {
//   return (
//     <>
//     <Navbar/>
//     <div className="about-container">
//       <section className="about-header">
//         <h1>ABOUT <span>US</span></h1>
//         {/* <p>Welcome to Prescripto, your trusted partner in managing your healthcare needs conveniently and efficiently.</p> */}
//       </section>

//       <section className="about-content">
//         <div className="about-image">
//           <img src={doctorImage} alt="Doctors" />
//         </div>
//         <div className="about-text">
//           <p>Welcome to Prescripto, your trusted partner in managing your healthcare needs conveniently and efficiently.At Prescripto, we understand the challenges individuals face when it comes to scheduling doctor appointments and managing their health records.</p>
//           <p>Prescripto is committed to excellence in healthcare technology. We continuously strive to enhance our platform, integrating the latest advancements to improve user experience and deliver superior service. Whether you're booking your first appointment or managing ongoing care, Prescripto is here to support you every step of the way.</p>
//           <h3>Our Vision</h3>
//           <p>Our vision at Prescripto is to create a seamless healthcare experience for every user. We aim to bridge the gap between patients and healthcare providers, making it easier for you to access the care you need, when you need it.</p>
//         </div>
//       </section>
//     <br /><br />
//       <section className="why-choose-us">
//         <h2>WHY <span>CHOOSE US</span></h2>
//         <div className="features">
//           <div className="feature-box">
//             <h3>EFFICIENCY:</h3>
//             <p>Streamlined appointment scheduling that fits into your busy lifestyle.</p>
//           </div>
//           <div className="feature-box feature-highlighted">
//             <h3>CONVENIENCE:</h3>
//             <p>Access to a network of trusted healthcare professionals in your area.</p>
//           </div>
//           <div className="feature-box">
//             <h3>PERSONALIZATION:</h3>
//             <p>Tailored recommendations and reminders to help you stay on top of your health.</p>
//           </div>
//         </div>
//       </section>
//     </div> <br /><br /><br />
//     <Footer/>
//     </>
//   );
// };

// export default About;
import React, { useState } from "react";
import "./About.css";
import doctorImage from "../../assets/d2.jpg"; // Replace with your image
import Footer from "../Footer/Footer";
import Navbar from "../Navbar";

const About = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const features = [
    {
      title: "EFFICIENCY:",
      text: "Streamlined appointment scheduling that fits into your busy lifestyle.",
    },
    {
      title: "CONVENIENCE:",
      text: "Access to a network of trusted healthcare professionals in your area.",
    },
    {
      title: "PERSONALIZATION:",
      text: "Tailored recommendations and reminders to help you stay on top of your health.",
    },
  ];

  return (
    <>
      <Navbar />
      <div className="about-container">
        <section className="about-header">
          <h1>
            ABOUT <span>US</span>
          </h1>
          {/* <p>
            Welcome to Prescripto, your trusted partner in managing your
            healthcare needs conveniently and efficiently.
          </p> */}
        </section>

        <section className="about-content">
          <div className="about-image">
            <img src={doctorImage} alt="Doctors" />
          </div>
          <div className="about-text">
            <p>
              Welcome to Prescripto, your trusted partner in managing your
              healthcare needs conveniently and efficiently. At Prescripto, we
              understand the challenges individuals face when it comes to
              scheduling doctor appointments and managing their health records.
            </p>
            <p>
              Prescripto is committed to excellence in healthcare technology. We
              continuously strive to enhance our platform, integrating the
              latest advancements to improve user experience and deliver
              superior service.
            </p>
            <h3>Our Vision</h3>
            <p>
              Our vision at Prescripto is to create a seamless healthcare
              experience for every user. We aim to bridge the gap between
              patients and healthcare providers, making it easier for you to
              access the care you need, when you need it.
            </p>
          </div>
        </section>

        <section className="why-choose-us">
          <h2>
            WHY <span>CHOOSE US</span>
          </h2>
          <div className="features">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`feature-box ${
                  activeIndex === index ? "active" : ""
                }`}
                onClick={() => setActiveIndex(index)}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default About;
