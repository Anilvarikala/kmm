// // import React, { useState, useEffect } from "react";
// // import { Link, useNavigate } from "react-router-dom";
// // import Navbar from "../../Components/Navbar";
// // import HeroComponent from "../../Components/HeroComponent";
// // import Footer from "../../Components/Footer/Footer";
// // import Doctors from "../Doctors/Doctors";
// // import Speciality from "../../Components/Speciality/Speciality";
// // import { db, auth } from "../../firebase"; // Assuming Firebase is set up
// // import { doc, getDoc } from "firebase/firestore";
// // import AiQueryComponent from "../../Components/ChatBot/AiQueryComponent";
// // import { getAuth, onAuthStateChanged } from "firebase/auth";

// // const Home = () => {
// //   const [flag, setFlag] = useState(true);
// //   const [fla, setFla] = useState(false);
// //   const [isVerified, setIsVerified] = useState(true); // Default true (won't show button)
// //   const navigate = useNavigate();
// //   const auth = getAuth();
// //   const [user, setUser] = useState();
// //   const unsubscribe = onAuthStateChanged(auth, (user) => {
// //     if (user) {
// //       setUser(true);
// //     }
// //   });

// //   useEffect(() => {
// //     const fetchDoctorVerificationStatus = async () => {
// //       const user = auth.currentUser;
// //       if (user) {
// //         const doctorRef = doc(db, "doctors", user.uid);
// //         const doctorSnap = await getDoc(doctorRef);
// //         if (doctorSnap.exists()) {
// //           setIsVerified(doctorSnap.data().verified); // Set verification status from Firestore
// //         }
// //       }
// //     };

// //     fetchDoctorVerificationStatus();
// //   }, []); // Empty dependency array ensures this runs only once on mount

// //   useEffect(() => {
// //     const user = auth.currentUser;
// //     if (!user) navigate("/login");
// //   }, []);
// //   return (
// //     <div>
// //       <Navbar />
// //       <br />
// //       <br />
// //       <HeroComponent flag={flag} />

// //       {/* Show "Get Verified" button only if the doctor is NOT verified */}
// //       {!isVerified && (
// //         <div style={{ textAlign: "center", marginTop: "38px"}}>
// //           <button
// //             onClick={() => navigate("/verify-account")}
// //             style={{
// //               backgroundColor: "#ff6600",
// //               color: "#fff",
// //               padding: "10px 20px",
// //               borderRadius: "8px",
// //               fontSize: "18px",
// //               cursor: "pointer",
// //               border: "none",
// //             }}
// //           >
// //             Get Verified
// //           </button>
// //         </div>
// //       )}
// //       <AiQueryComponent />
// //       <Speciality />
// //       <Doctors />
// //       {/* <HeroComponent flag={fla} /> */}
// //       {!user && (
// //         <button
// //           className="btn1"
// //           style={{
// //             position: "absolute",
// //             borderRadius: "20px",
// //             left: "15%",
// //             top: "560vh",
// //             border: "2px solid white",
// //           }}
// //         >
// //           <Link
// //             to="/doctor-signup"
// //             style={{ textDecoration: "none", color: "black" }}
// //           >
// //             Create account?
// //           </Link>
// //         </button>
// //       )}
// //       <br />
// //         <br />
// //       <Footer />
// //     </div>
// //   );
// // };

// // export default Home;


// {/* Testimonials Section */}
// <section className="testimonials-section" style={{ backgroundColor: "#f9f9f9", padding: "40px 20px" }}>
//   <h2 style={{ textAlign: "center", marginBottom: "40px", fontWeight: "bold" }}>What Our Users Say</h2>
//   <div className="testimonial-cards" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "30px" }}>
    
//     {/* Testimonial 1 */}
//     <div className="testimonial-card" style={cardStyle}>
//       <p style={quoteStyle}>
//         "This platform helped me connect with a doctor instantly. Super easy to use and very reliable!"
//       </p>
//       <p style={authorStyle}>— Ayesha K, Hyderabad</p>
//     </div>

//     {/* Testimonial 2 */}
//     <div className="testimonial-card" style={cardStyle}>
//       <p style={quoteStyle}>
//         "The AI-based symptom checker was very helpful. I was guided to the right specialist without confusion."
//       </p>
//       <p style={authorStyle}>— Rohan M, Bengaluru</p>
//     </div>

//     {/* Testimonial 3 */}
//     <div className="testimonial-card" style={cardStyle}>
//       <p style={quoteStyle}>
//         "As a doctor, I appreciate the verification system. It builds trust and ensures professionalism."
//       </p>
//       <p style={authorStyle}>— Dr. Neha S, Mumbai</p>
//     </div>

//   </div>
// </section>



import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar";
import HeroComponent from "../../Components/HeroComponent";
import Footer from "../../Components/Footer/Footer";
import Doctors from "../Doctors/Doctors";
import Speciality from "../../Components/Speciality/Speciality";
import { db, auth } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import AiQueryComponent from "../../Components/ChatBot/AiQueryComponent";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const Home = () => {
  const [flag, setFlag] = useState(true);
  const [fla, setFla] = useState(false);
  const [isVerified, setIsVerified] = useState(true);
  const [user, setUser] = useState();
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(true);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchDoctorVerificationStatus = async () => {
      const user = auth.currentUser;
      if (user) {
        const doctorRef = doc(db, "doctors", user.uid);
        const doctorSnap = await getDoc(doctorRef);
        if (doctorSnap.exists()) {
          setIsVerified(doctorSnap.data().verified);
        }
      }
    };
    fetchDoctorVerificationStatus();
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) navigate("/login");
  }, []);

  const cardStyle = {
    backgroundColor: "#ffffff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    maxWidth: "300px",
    width: "100%",
    textAlign: "center",
  };

  const quoteStyle = {
    fontStyle: "italic",
    fontSize: "16px",
    marginBottom: "15px",
  };

  const authorStyle = {
    fontWeight: "bold",
    color: "#555",
  };

  return (
    <div>
      <Navbar />
      <br />
      <br />
      <HeroComponent flag={flag} />

      {!isVerified && (
        <div style={{ textAlign: "center", marginTop: "38px" }}>
          <button
            onClick={() => navigate("/verify-account")}
            style={{
              backgroundColor: "#ff6600",
              color: "#fff",
              padding: "10px 20px",
              borderRadius: "8px",
              fontSize: "18px",
              cursor: "pointer",
              border: "none",
            }}
          >
            Get Verified
          </button>
        </div>
      )}

      <AiQueryComponent />
      <Speciality />
      <Doctors />

      {/* Testimonials Section */}
      <section
        className="testimonials-section"
        style={{ backgroundColor: "#f9f9f9", padding: "40px 20px" }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "40px",
            fontWeight: "bold",
          }}
        >
          What Our Users Say
        </h2>
        <div
          className="testimonial-cards"
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "30px",
          }}
        >
          <div className="testimonial-card" style={cardStyle}>
            <p style={quoteStyle}>
              "This platform helped me connect with a doctor instantly. Super
              easy to use and very reliable!"
            </p>
            <p style={authorStyle}>— Ayesha K, Hyderabad</p>
          </div>

          <div className="testimonial-card" style={cardStyle}>
            <p style={quoteStyle}>
              "The AI-based symptom checker was very helpful. I was guided to
              the right specialist without confusion."
            </p>
            <p style={authorStyle}>— Rohan M, Bengaluru</p>
          </div>

          <div className="testimonial-card" style={cardStyle}>
            <p style={quoteStyle}>
              "As a doctor, I appreciate the verification system. It builds
              trust and ensures professionalism."
            </p>
            <p style={authorStyle}>— Dr. Neha S, Mumbai</p>
          </div>
        </div>
      </section>

      {!user && (
        <button
          className="btn1"
          style={{
            position: "absolute",
            borderRadius: "20px",
            left: "15%",
            top: "560vh",
            border: "2px solid white",
          }}
        >
          <Link
            to="/doctor-signup"
            style={{ textDecoration: "none", color: "black" }}
          >
            Create account?
          </Link>
        </button>
      )}
{/* <<<<<<< HEAD */}

      <br />
      <br />
{/* =======
// <<<<<<< HEAD */}
      <br />
        <br />
=======
      <br/>
      <br/>
{/* >>>>>>> c53e11d70cd00d48b6e5e619c1aaec386518c6c6
>>>>>>> 6e25ac09abb624d5f901ce22d955e109c8662e93 */}
      <Footer />
    </div>
  );
};

export default Home;
