import { useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { doc, getDoc, setDoc, collection, addDoc } from "firebase/firestore";
import Navbar from "../../Components/Navbar";
import d1 from "../../assets/d1.png";
import d2 from "../../assets/d2.png";
import d81 from "../../assets/d8.jpg";
import { onAuthStateChanged } from "firebase/auth";
// import other doctor images as before
// import { useAuth } from "../../context/AuthContext"; // Assumed Firebase Auth context for user data (optional)
import { auth } from "../../firebase";
import "./DoctorProfile.css"

const Doctorprofile = () => {
  const [userDetails, setUserDetails] = useState(null);
  const { id } = useParams(); // Extract the doctor ID from the URL
  const [doctor, setDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  // const { currentUser } = useAuth(); // Get the current logged-in user (patient)
  const [uid, setuid] = useState();
  const getDoctorImage = (id) => {
    // Your function to fetch the doctor image based on ID
    switch (id) {
      case 1:
        return d1;
      case 2:
        return d2;
      case 3:
        return d81;
      default:
        return d1;
    }
  };

  // Fetch the doctor details
  useEffect(() => {
    const fetchDoctor = async () => {
      const docRef = doc(db, "doctors", id); // Reference to the doctor document using the
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setDoctor(docSnap.data()); // Set doctor data when fetched
      } else {
        console.log("No such doctor!");
      }
    };

    fetchDoctor();
  }, [id]); // Re-fetch data if the ID changes
  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, (user) => {
  //     if (user) {
  //       setuid(user.uid);
  //       console.log("User UID:", user); // You can access the UID here
  //     } else {
  //       console.log("No user is signed in");
  //     }
  //   });

  //   // Clean up the listener when component unmounts
  //   return () => unsubscribe();
  // }, []);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setuid(user.uid); // Store the current user's UID
        console.log(uid);

        const userDocRef = doc(db, "users", uid); // Reference to the user document in Firestore
        const userDocSnap = getDoc(userDocRef);

        if (userDocSnap.exists()) {
          setUserDetails(userDocSnap.data());
          console.log(userDetails);
        } else {
          console.log("No user data found!");
        }
      } else {
        console.log("No user is signed in");
      }
    });
  });

  // Handle booking appointment
  const handleBookAppointment = async () => {
    if (!selectedDate) {
      alert("Please select a date for the appointment.");
      return;
    }

    if (uid) {
      try {
        const appointmentRef = collection(db, "appointments");

        // Create a new appointment document
        await addDoc(appointmentRef, {
          doctorId: id, // The doctor being booked
          patientId: uid,
          DoctorName: doctor.name, // Patient's UID,
          patientName: localStorage.getItem("name"),
          appointmentDate: selectedDate,
          status: "Pending",
          // meetingid:"Not yet decided",
          // The appointment status (can be updated later)
        });

        alert("Appointment successfully booked!");
      } catch (error) {
        console.error("Error booking appointment: ", error);
        alert("There was an error booking your appointment. Please try again.");
      }
    } else {
      alert("You must be logged in to book an appointment.");
    }
  };

  if (!doctor) return <div>Loading...</div>;

  return (
    <>
      <Navbar />
      <div className="curr_Doctor-profile-container">
        {/* curr_Doctor Profile Section */}
        <div className="curr_Doctor-profile">
          <img
            src={doctor.profileImage || getDoctorImage(id)}
            alt={doctor.name}
            className="doctor-image"
            style={{ width: "200px", height: "200px" }}
          />
          <h2>
            {doctor.name} <span className="verified">✔</span>
          </h2>
          <p>
            {doctor.fieldOfStudy} | MBBS {doctor.year} year
          </p>
          <p>
            <strong>Appointment fee:</strong> $50
          </p>
          <p className="about">
            Dr. {doctor.name} is committed to providing excellent medical care.
          </p>
        </div>
      </div>

      {/* Booking Section */}
      <div className="booking-section">
        <h3>Book an Appointment</h3>

        {/* Date Selection */}
        <div className="input-group">
          <label>Select Date</label>
          <input
            type="date"
            className="date-picker"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        <button className="book-button" onClick={handleBookAppointment}>
          Book Appointment
        </button>
      </div>
    </>
  );
};

export default Doctorprofile;
