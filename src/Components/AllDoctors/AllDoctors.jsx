import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./AllDoctors.css";

// Importing doctor images
import d1 from "../../assets/d1.png";
import d2 from "../../assets/d2.png";
import d81 from "../../assets/d8.jpg";
import d4 from "../../assets/d4.jpg";
import d5 from "../../assets/d5.jpg";
import d6 from "../../assets/d6.jpg";
import d7 from "../../assets/d7.jpg";
import d8 from "../../assets/d8.jpg";
import d9 from "../../assets/d9.jpg";
import d10 from "../../assets/d10.jpg";
import d11 from "../../assets/d11.jpg";
import d12 from "../../assets/d12.jpg";
import Navbar from "../Navbar";

const AllDoctors = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");

  // Specialties for filtering
  const specialties = [
    { name: "Cardiologist" },
    { name: "Dermatologist" },
    { name: "Neurologist" },
    { name: "Pediatrician" },
    { name: "Orthopedician" },
    { name: "General physician" },
    { name: "Gynecologist" },
    { name: "Gastroenterologist" },
    { name: "ENT" },
    { name: "Pulmonologist" },
  ];

  // Fetch doctors from Firestore
  useEffect(() => {
    const fetchDoctors = async () => {
      const querySnapshot = await getDocs(collection(db, "doctors"));
      const doctorList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDoctors(doctorList);
    };
    fetchDoctors();
  }, []);

  // Assign doctor images dynamically
  const doctorImages = [d1, d2, d81, d4, d5, d6, d7, d8, d9, d10, d11, d12];
  const getDoctorImage = (index) => doctorImages[index % doctorImages.length];

  // // Filter doctors based on search query, selected specialty, and verification status
  // Filter doctors based on search query, selected specialty, and verification status
// const filteredDoctors = doctors.filter((doctor) => {
//   // Ensure doctor has required fields before applying toLowerCase()
//   const doctorName = doctor.name ? doctor.name.toLowerCase() : "";
//   const doctorField = doctor.fieldOfStudy ? doctor.fieldOfStudy.toLowerCase() : "";

//   // Only include verified doctors
//   const isVerified = doctor.verified === true;

//   // Search query filter for name or field of study
//   const matchesSearch =
//     searchQuery === "" ||
//     doctorName.includes(searchQuery.toLowerCase()) ||
//     doctorField.includes(searchQuery.toLowerCase());

//   // Specialty filter
//   const matchesSpecialty =
//     selectedSpecialty === "" || doctor.fieldOfStudy === selectedSpecialty;

//   return isVerified && matchesSearch && matchesSpecialty;
// });
// const filteredDoctors = doctors.filter((doctor) => {
//   const doctorField = doctor.fieldOfStudy ? doctor.fieldOfStudy.toLowerCase() : "";

//   // Only include verified doctors
//   const isVerified = doctor.verified === true;

//   // Convert search query to lowercase
//   const query = searchQuery.toLowerCase();

//   // Check if the search query matches a doctor's specialty
//   const matchesSearch = query === "" || doctorField.includes(query);

//   // Specialty filter
//   const matchesSpecialty =
//     selectedSpecialty === "" || doctor.fieldOfStudy === selectedSpecialty;

//   return isVerified && matchesSearch && matchesSpecialty;
// });
const filteredDoctors = doctors.filter((doctor) => {
  const doctorName = doctor.name ? doctor.name.toLowerCase() : "";
  const doctorField = doctor.fieldOfStudy ? doctor.fieldOfStudy.toLowerCase() : "";

  // Only include verified doctors
  const isVerified = doctor.verified === true;

  // Convert search query to lowercase
  const query = searchQuery.toLowerCase();

  // Check if the search query matches either the doctor's name or their specialty
  const matchesSearch =
    query === "" ||
    doctorName.includes(query) || // Match by name
    doctorField.includes(query);   // Match by specialty

  // Specialty filter
  const matchesSpecialty =
    selectedSpecialty === "" || doctor.fieldOfStudy === selectedSpecialty;

  return isVerified && matchesSearch && matchesSpecialty;
});



  // const filteredDoctors = doctors.filter((doctor) => {
  //   // Only include verified doctors
  //   const isVerified = doctor.verified === true;

  //   // Search query filter for name or field of study
  //   const matchesSearch =
  //     doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     doctor.fieldOfStudy.toLowerCase().includes(searchQuery.toLowerCase());

  //   // Specialty filter
  //   const matchesSpecialty =
  //     selectedSpecialty === "" || doctor.fieldOfStudy === selectedSpecialty;

  //   return isVerified && matchesSearch && matchesSpecialty; // Only return verified doctors
  // });

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSpecialty("");
  };

  return (
    <>
      <Navbar />
      <div className="flex search-container" style={{marginLeft:"30vw"}}>
        <input
          type="text"
          style={{marginTop:"20px",marginRight:"20px"}}  
          className="search-bar"
          placeholder="Search by symptoms or doctor name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="clear-button" onClick={clearFilters}>
          Remove Filter
        </button>
      </div>

      <div className="doctors-container">
        {/* Sidebar for filtering */}
        <div className="sidebar">
          <h3>Filter by Specialization</h3>
          {specialties.map((specialty) => (
            <button
              key={specialty.name}
              className={selectedSpecialty === specialty.name ? "active" : ""}
              onClick={() => setSelectedSpecialty(specialty.name)}
            >
              {specialty.name}
            </button>
          ))}
          <button
            className="clear-button"
            onClick={() => setSelectedSpecialty("")}
          >
            Clear Filter
          </button>
        </div>

        {/* Doctors List */}
        <div className="doctor-grid">
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doctor, index) => (
              <div
                key={doctor.id}
                className="doctor-card"
                onClick={() => navigate(`/doctorprofile/${doctor.id}`)}
              >
                <img
                  src={doctor.profileImage || getDoctorImage(index)}
                  alt={doctor.name}
                  className="doctor-img"
                />
                <h3 className="doctor-name">{doctor.name}</h3>
                <p className="specialty">{doctor.fieldOfStudy}</p>
              </div>
            ))
          ) : (
            <p className="no-results">No doctors found.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default AllDoctors;
