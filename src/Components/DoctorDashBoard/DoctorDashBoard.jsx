// import React, { useEffect, useState } from "react";
// import { db } from "../../firebase";
// import {
//   collection,
//   getDocs,
//   query,
//   where,
//   doc,
//   updateDoc,
// } from "firebase/firestore";
// import { onAuthStateChanged } from "firebase/auth";
// import { auth } from "../../firebase";
// import "./DoctorDashBoard.css";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// const DoctorDashBoard = () => {
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [uid, setUid] = useState();
//   const [appointments, setAppointments] = useState([]);
//   const [consultationReports, setConsultationReports] = useState({});
//   const [selectedTime, setSelectedTime] = useState({});
//   const [showTimeInput, setShowTimeInput] = useState(false);
//   const [currentAppointmentId, setCurrentAppointmentId] = useState(null);
//   const [googleMeetLink, setGoogleMeetLink] = useState("");
//   const [meetingIdInputs, setMeetingIdInputs] = useState({});

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (user) {
//         setUid(user.uid);
//       }
//     });
//     return unsubscribe;
//   }, []);

//   useEffect(() => {
//     const fetchAppointments = async () => {
//       if (uid) {
//         const q = query(
//           collection(db, "appointments"),
//           where("doctorId", "==", uid)
//         );
//         const querySnapshot = await getDocs(q);
//         const appointmentsData = querySnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));
//         setAppointments(appointmentsData);
//       }
//     };
//     fetchAppointments();
//   }, [uid]);

//   useEffect(() => {
//     const fetchConsultationReports = async () => {
//       try {
//         const reportsSnapshot = await getDocs(
//           collection(db, "consultationReports")
//         );
//         const reportsData = {};
//         reportsSnapshot.forEach((doc) => {
//           const data = doc.data();
//           const appointmentId = data.appointmentId;
//           if (!reportsData[appointmentId]) {
//             reportsData[appointmentId] = [];
//           }
//           reportsData[appointmentId].push(data.report);
//         });
//         setConsultationReports(reportsData);
//       } catch (error) {
//         console.error("Error fetching consultation reports:", error);
//       }
//     };
//     fetchConsultationReports();
//   }, []);
//   const [ismobile, setmobile] = useState(false);
//   useEffect(() => {
//     if (window.innerWidth <= 800) setmobile(true);
//   }),
//     [];
//   const closeModal = () => {
//     setSelectedImage(null);
//     setIsModalOpen(false);
//   };

//   const handleAcceptAppointment = (appointmentId) => {
//     setCurrentAppointmentId(appointmentId);
//     setShowTimeInput(true);
//     const meetLink = "https://meet.google.com/landing";
//     setGoogleMeetLink(meetLink);
//   };

//   const handleRejectAppointment = async (appointmentId) => {
//     try {
//       const appointmentRef = doc(db, "appointments", appointmentId);
//       await updateDoc(appointmentRef, { status: "Rejected" });
//       setAppointments((prevAppointments) =>
//         prevAppointments.map((appt) =>
//           appt.id === appointmentId ? { ...appt, status: "Rejected" } : appt
//         )
//       );
//     } catch (error) {
//       console.error("Error rejecting appointment:", error);
//     }
//   };

//   const handleTimeChange = (event) => {
//     setSelectedTime({
//       ...selectedTime,
//       [currentAppointmentId]: event.target.value,
//     });
//   };

//   const handleConfirmTime = async () => {
//     if (!selectedTime[currentAppointmentId]) {
//       toast.error("Please select a time for the appointment.");
//       return;
//     }

//     try {
//       const appointmentRef = doc(db, "appointments", currentAppointmentId);
//       await updateDoc(appointmentRef, {
//         status: "Accepted",
//         appointmentTime: selectedTime[currentAppointmentId],
//         googleMeetLink,
//       });

//       setAppointments((prevAppointments) =>
//         prevAppointments.map((appt) =>
//           appt.id === currentAppointmentId
//             ? {
//                 ...appt,
//                 status: "Accepted",
//                 appointmentTime: selectedTime[currentAppointmentId],
//                 googleMeetLink,
//               }
//             : appt
//         )
//       );
//       setShowTimeInput(false);
//       setCurrentAppointmentId(null);
//       setGoogleMeetLink("");
//     } catch (error) {
//       console.error("Error accepting appointment:", error);
//     }
//   };

//   const handleMeetingIdChange = (appointmentId, event) => {
//     setMeetingIdInputs({
//       ...meetingIdInputs,
//       [appointmentId]: event.target.value,
//     });
//   };

//   const openModal = (imageUrl) => {
//     setSelectedImage(imageUrl);
//     setIsModalOpen(true);
//   };

//   const handleSaveMeetingId = async (appointmentId) => {
//     const meetingId = meetingIdInputs[appointmentId];

//     if (!meetingId) {
//       toast.success("Meeting ID saved successfully!",{
//         style:{
//           color:"white"
//         }
//       });
//       return;
//     }

//     try {

//       const appointmentRef = doc(db, "appointments", appointmentId);
//       await updateDoc(appointmentRef, { meetingId });

//       setAppointments((prevAppointments) =>
//         prevAppointments.map((appt) =>
//           appt.id === appointmentId ? { ...appt, meetingId } : appt
//         )
//       );
//       setMeetingIdInputs((prevInputs) => {
//         const updatedInputs = { ...prevInputs };
//         delete updatedInputs[appointmentId];
//         //toast.success("Meeting ID saved successfully!");
//         return updatedInputs;
//       });toast.success("Meeting ID saved successfully!");
//     } catch (error) {
//       toast.error("Failed to save Meeting ID.");
//       console.error("Error saving meeting ID:", error);
//     }
//   };

//   return (
//     <>
//       {!ismobile ? (
//         <div className="doctor-dashboard">
//           <h2>Doctor Dashboard</h2>
//           <h3>Your Appointments</h3>
//           {appointments.length === 0 ? (
//             <p className="no-appointments">No appointments scheduled.</p>
//           ) : (
//             <div className="appointments-table-container">
//               <table className="appointments-table">
//                 <thead>
//                   <tr>
//                     <th>Patient</th>
//                     <th>Date</th>
//                     <th>Status</th>
//                     <th>Actions</th>
//                     <th>Time</th>
//                     <th>Google Meet Link</th>
//                     <th>Meeting ID</th>
//                     <th>Consultation Reports</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {appointments.map((appointment) => (
//                     <tr key={appointment.id}>
//                       <td>{appointment.patientName}</td>
//                       <td>{appointment.appointmentDate}</td>
//                       <td
//                         className={`status-${appointment.status.toLowerCase()}`}
//                       >
//                         {appointment.status}
//                       </td>
//                       <td>
//                         {appointment.status === "Pending" && (
//                           <>
//                             <button
//                               onClick={() =>
//                                 handleAcceptAppointment(appointment.id)
//                               }
//                             >
//                               Accept
//                             </button>
//                             <button
//                               onClick={() =>
//                                 handleRejectAppointment(appointment.id)
//                               }
//                             >
//                               Reject
//                             </button>
//                           </>
//                         )}
//                         {(appointment.status === "Accepted" ||
//                           appointment.status === "Rejected") && <span>-</span>}
//                       </td>
//                       <td>
//                         {appointment.status === "Rejected" ? (
//                           <span>-</span>
//                         ) : showTimeInput &&
//                           currentAppointmentId === appointment.id ? (
//                           <div>
//                             <input
//                             className="meeting-id"
//                               type="time"
//                               value={selectedTime[currentAppointmentId] || ""}
//                               onChange={handleTimeChange}
//                             />
//                             <button onClick={handleConfirmTime}>Confirm</button>
//                           </div>
//                         ) : (
//                           appointment.appointmentTime || "-"
//                         )}
//                       </td>
//                       <td>
//                         {appointment.status === "Rejected" ? (
//                           <span>-</span>
//                         ) : appointment.googleMeetLink ? (
//                           <a
//                             href={appointment.googleMeetLink}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                           >
//                             Create Meeting
//                           </a>
//                         ) : (
//                           "-"
//                         )}
//                       </td>
//                       <td>
//                         {appointment.status === "Rejected" ? (
//                           <span>-</span>
//                         ) : appointment.status === "Accepted" ? (
//                           <div>
//                             <input
//                               type="text"
//                               className="meeting-id"
//                               value={
//                                 meetingIdInputs[appointment.id] ||
//                                 appointment.meetingId ||
//                                 ""
//                               }
//                               onChange={(e) =>
//                                 handleMeetingIdChange(appointment.id, e)
//                               }
//                               placeholder="Enter Meeting ID"
//                             />
//                             <button
//                               onClick={() =>
//                                 handleSaveMeetingId(appointment.id)
//                               }
//                             >
//                               Save
//                             </button>
//                           </div>
//                         ) : (
//                           "-"
//                         )}
//                       </td>
//                       <td>
//                         {consultationReports[appointment.id]?.length > 0 ? (
//                           <ul className="report-list">
//                             {consultationReports[appointment.id].map(
//                               (reportUrl, index) => (
//                                 <li
//                                   key={index}
//                                   onClick={() => openModal(reportUrl)}
//                                 >
//                                   <img
//                                     src={reportUrl}
//                                     alt={`Report ${index + 1}`}
//                                     className="report-thumbnail"
//                                   />
//                                 </li>
//                               )
//                             )}
//                           </ul>
//                         ) : (
//                           <span>No reports</span>
//                         )}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//           {isModalOpen && selectedImage && (
//             <div className="modal-overlay" onClick={closeModal}>
//               <div
//                 className="modal-content"
//                 onClick={(e) => e.stopPropagation()}
//               >
//                 <span className="close-btn" onClick={closeModal}>
//                   &times;
//                 </span>
//                 <img
//                   src={selectedImage}
//                   alt="Consultation Report"
//                   className="modal-image"
//                 />
//               </div>
//             </div>
//           )}
//         </div>
//       ) : (
//         <div className="doctor-dashboard">
//           <h2>Doctor Dashboard</h2>
//           <h3>Your Appointments</h3>
//           {appointments.length === 0 ? (
//             <p className="no-appointments">No appointments scheduled.</p>
//           ) : (
//             <div className="appointments-container">
//               {appointments.map((appointment) => (
//                 <div className="appointment-card" key={appointment.id}>
//                   <div className="appointment-header">
//                     <h4>{appointment.patientName}</h4>
//                     <p>{appointment.appointmentDate}</p>
//                   </div>
//                   <div className="appointment-details">
//                     <p>
//                       Status:{" "}
//                       <span
//                         className={`status-${appointment.status.toLowerCase()}`}
//                       >
//                         {appointment.status}
//                       </span>
//                     </p>
//                     {appointment.status === "Pending" && (
//                       <div>
//                         <button
//                           onClick={() =>
//                             handleAcceptAppointment(appointment.id)
//                           }
//                         >
//                           Accept
//                         </button>
//                         <button
//                           onClick={() =>
//                             handleRejectAppointment(appointment.id)
//                           }
//                         >
//                           Reject
//                         </button>
//                       </div>
//                     )}
//                     {(appointment.status === "Accepted" ||
//                       appointment.status === "Rejected") && <span>-</span>}
//                     {appointment.status === "Rejected" ? (
//                       <span>-</span>
//                     ) : showTimeInput &&
//                       currentAppointmentId === appointment.id ? (
//                       <div>
//                         <input
//                           type="time"
//                           value={selectedTime[currentAppointmentId] || ""}
//                           onChange={handleTimeChange}
//                         />
//                         <button onClick={handleConfirmTime}>Confirm</button>
//                       </div>
//                     ) : (
//                       appointment.appointmentTime || "-"
//                     )}
//                     {appointment.status === "Rejected" ? (
//                       <span>-</span>
//                     ) : appointment.googleMeetLink ? (
//                       <a
//                         href={appointment.googleMeetLink}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                       >
//                         Create Meeting
//                       </a>
//                     ) : (
//                       "-"
//                     )}
//                     {appointment.status === "Rejected" ? (
//                       <span>-</span>
//                     ) : appointment.status === "Accepted" ? (
//                       <div>
//                         <input
//                           type="text"
//                           value={
//                             meetingIdInputs[appointment.id] ||
//                             appointment.meetingId ||
//                             ""
//                           }
//                           onChange={(e) =>
//                             handleMeetingIdChange(appointment.id, e)
//                           }
//                           placeholder="Enter Meeting ID"
//                         />
//                         <button
//                           onClick={() => handleSaveMeetingId(appointment.id)}
//                         >
//                           Save
//                         </button>
//                       </div>
//                     ) : (
//                       "-"
//                     )}
//                   </div>
//                   <div className="consultation-reports">
//                     {consultationReports[appointment.id]?.length > 0 ? (
//                       <ul className="report-list">
//                         {consultationReports[appointment.id].map(
//                           (reportUrl, index) => (
//                             <li
//                               key={index}
//                               onClick={() => openModal(reportUrl)}
//                             >
//                               <img
//                                 src={reportUrl}
//                                 alt={`Report ${index + 1}`}
//                                 className="report-thumbnail"
//                               />
//                             </li>
//                           )
//                         )}
//                       </ul>
//                     ) : (
//                       <span>No reports</span>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//           {isModalOpen && selectedImage && (
//             <div className="modal-overlay" onClick={closeModal}>
//               <div
//                 className="modal-content"
//                 onClick={(e) => e.stopPropagation()}
//               >
//                 <span className="close-btn" onClick={closeModal}>
//                   &times;
//                 </span>
//                 <img
//                   src={selectedImage}
//                   alt="Consultation Report"
//                   className="modal-image"
//                 />
//               </div>
             
//             </div>
//           )}
//         </div>
//       )}
//       <ToastContainer/>
//     </>
//   );
// };

// export default DoctorDashBoard;


import React, { useEffect, useState } from "react";
import { db, auth } from "../../firebase";
import { deleteDoc } from "firebase/firestore"; 
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./DoctorDashBoard.css";

const DoctorDashboard = () => {
  const [uid, setUid] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [consultationReports, setConsultationReports] = useState({});
  const [selectedTime, setSelectedTime] = useState({});
  const [showTimeInput, setShowTimeInput] = useState(false);
  const [currentAppointmentId, setCurrentAppointmentId] = useState(null);
  const [googleMeetLink, setGoogleMeetLink] = useState("");
  const [meetingIdInputs, setMeetingIdInputs] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 800);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUid(user.uid);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!uid) return;
    const fetchAppointments = async () => {
      const q = query(collection(db, "appointments"), where("doctorId", "==", uid));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAppointments(data);
    };
    fetchAppointments();
  }, [uid]);

  useEffect(() => {
    const fetchReports = async () => {
      const snapshot = await getDocs(collection(db, "consultationReports"));
      const data = {};
      snapshot.forEach((doc) => {
        const report = doc.data();
        const id = report.appointmentId;
        if (!data[id]) data[id] = [];
        data[id].push(report.report);
      });
      setConsultationReports(data);
    };
    fetchReports();
  }, []);

  // const handleAccept = (id) => {
  //   setCurrentAppointmentId(id);
  //   setShowTimeInput(true);
  //   setGoogleMeetLink("https://meet.google.com/landing");
  // };
//   const handleAccept = async (id) => {
//  //   alert(id)
//     const acceptedAppointment = appointments.find((appt) => appt.id === id);
//     if (!acceptedAppointment) return;
  
//     const { appointment_id } = acceptedAppointment;
//     alert(appointment_id)
  
//     // Update current appointment to Accepted
//     await updateDoc(doc(db, "appointments", id), {
//       status: "Accepted",
//     });
  
//     // Delete all other appointments with same appointment_id
//     const q = query(
//       collection(db, "appointments"),
//       where("appointment_id", "==", appointment_id),
//       where("status", "==", "Pending")
//     );
  
//     const snapshot = await getDocs(q);
//     const batchDeletes = [];
  
//     snapshot.forEach((docSnap) => {
//       if (docSnap.id !== id) {
//         batchDeletes.push(docSnap.ref.delete());
//       }
//     });
  
//     await Promise.all(batchDeletes);
  
//     // Update local state
//     setAppointments((prev) =>
//       prev
//         .filter((appt) => appt.id === id)
//         .map((appt) =>
//           appt.id === id ? { ...appt, status: "Accepted" } : appt
//         )
//     );


  
//     setCurrentAppointmentId(id);
//     setShowTimeInput(true);
//     setGoogleMeetLink("https://meet.google.com/landing");
//   };


const handleAccept = async (id) => {
  const acceptedAppointment = appointments.find((appt) => appt.id === id);
  if (!acceptedAppointment) return;

  const { appointment_id } = acceptedAppointment;

  // Update the accepted appointment
  await updateDoc(doc(db, "appointments", id), {
    status: "Accepted",
  });

  // Query other pending appointments with the same appointment_id
  const q = query(
    collection(db, "appointments"),
    where("appointment_id", "==", appointment_id),
    where("status", "==", "Pending")
  );

  const snapshot = await getDocs(q);
  const deletePromises = [];

  snapshot.forEach((docSnap) => {
    if (docSnap.id !== id) {
      deletePromises.push(deleteDoc(doc(db, "appointments", docSnap.id)));
    }
  });

  await Promise.all(deletePromises);

  // Filter out deleted appointments and update the accepted one in state
  const updatedAppointments = appointments
    .filter((appt) => appt.appointment_id !== appointment_id || appt.id === id)
    .map((appt) =>
      appt.id === id ? { ...appt, status: "Accepted" } : appt
    );

  setAppointments(updatedAppointments);
  setCurrentAppointmentId(id);
  setShowTimeInput(true);
  setGoogleMeetLink("https://meet.google.com/landing");
};

  const handleReject = async (id) => {
    await updateDoc(doc(db, "appointments", id), { status: "Rejected" });
    setAppointments((prev) =>
      prev.map((appt) => (appt.id === id ? { ...appt, status: "Rejected" } : appt))
    );
  };

  const handleTimeChange = (e) => {
    setSelectedTime({ ...selectedTime, [currentAppointmentId]: e.target.value });
  };

  const handleConfirmTime = async () => {
    const time = selectedTime[currentAppointmentId];
    if (!time) return toast.error("Please select a time.");

    await updateDoc(doc(db, "appointments", currentAppointmentId), {
      status: "Accepted",
      appointmentTime: time,
      googleMeetLink,
    });

    setAppointments((prev) =>
      prev.map((appt) =>
        appt.id === currentAppointmentId
          ? { ...appt, status: "Accepted", appointmentTime: time, googleMeetLink }
          : appt
      )
    );

    setShowTimeInput(false);
    setCurrentAppointmentId(null);
    setGoogleMeetLink("");
  };

  const handleMeetingIdChange = (id, e) => {
    setMeetingIdInputs({ ...meetingIdInputs, [id]: e.target.value });
  };

  const handleSaveMeetingId = async (id) => {
    const meetingId = meetingIdInputs[id];
    if (!meetingId) return toast.error("Meeting ID cannot be empty");

    await updateDoc(doc(db, "appointments", id), { meetingId });
    setAppointments((prev) =>
      prev.map((appt) => (appt.id === id ? { ...appt, meetingId } : appt))
    );
    toast.success("Meeting ID saved successfully!");
  };

  const openModal = (url) => {
    setSelectedImage(url);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  const AppointmentActions = ({ appointment }) => {
    if (appointment.status === "Pending") {
      return (
        <>
          <button onClick={() => handleAccept(appointment.id)}>Accept</button>
          <button onClick={() => handleReject(appointment.id)}>Reject</button>
        </>
      );
    }
    return <span>-</span>;
  };

  return (
    <div className="doctor-dashboard">
      <h2>Doctor Dashboard</h2>
      <h3>Your Appointments</h3>

      {appointments.length === 0 ? (
        <p className="no-appointments">No appointments scheduled.</p>
      ) : isMobile ? (
        appointments.map((appointment) => (
          <div className="appointment-card" key={appointment.id}>
            <h4>{appointment.patientName}</h4>
            <p>Date: {appointment.appointmentDate}</p>
            <p>Status: <span className={`status-${appointment.status.toLowerCase()}`}>{appointment.status}</span></p>
            <AppointmentActions appointment={appointment} />
            <p>Time: {appointment.status === "Rejected" ? "-" : (showTimeInput && currentAppointmentId === appointment.id ? (
              <><input type="time" onChange={handleTimeChange} value={selectedTime[appointment.id] || ""} /><button onClick={handleConfirmTime}>Confirm</button></>
            ) : appointment.appointmentTime || "-")}</p>
            <p>Meet Link: {appointment.googleMeetLink ? <a href={appointment.googleMeetLink} target="_blank" rel="noopener noreferrer">Meeting</a> : "-"}</p>
            {appointment.status === "Accepted" && (
              <>
                <input
                  type="text"
                  className="meeting-id"
                  value={meetingIdInputs[appointment.id] || appointment.meetingId || ""}
                  onChange={(e) => handleMeetingIdChange(appointment.id, e)}
                  placeholder="Enter Meeting ID"
                />
                <button onClick={() => handleSaveMeetingId(appointment.id)}>Save</button>
              </>
            )}
            <div className="report-list">
              {consultationReports[appointment.id]?.length > 0 ? (
                consultationReports[appointment.id].map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Report ${i + 1}`}
                    className="report-thumbnail"
                    onClick={() => openModal(url)}
                  />
                ))
              ) : (
                <span>No reports</span>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="appointments-table-container">
          <table className="appointments-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
                <th>Time</th>
                <th>Google Meet Link</th>
                <th>Meeting ID</th>
                <th>Reports</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>{appointment.patientName}</td>
                  <td>{appointment.appointmentDate}</td>
                  <td className={`status-${appointment.status.toLowerCase()}`}>{appointment.status}</td>
                  <td><AppointmentActions appointment={appointment} /></td>
                  <td>
                    {appointment.status === "Rejected" ? "-" :
                      showTimeInput && currentAppointmentId === appointment.id ? (
                        <>
                          <input
                            type="time"
                            value={selectedTime[appointment.id] || ""}
                            onChange={handleTimeChange}
                          />
                          <button onClick={handleConfirmTime}>Confirm</button>
                        </>
                      ) : appointment.appointmentTime || "-"}
                  </td>
                  <td>
                    {appointment.status === "Rejected" ? "-" : appointment.googleMeetLink ? (
                      <a href={appointment.googleMeetLink} target="_blank" rel="noopener noreferrer">Meeting</a>
                    ) : "-"}
                  </td>
                  <td>
                    {appointment.status === "Accepted" ? (
                      <>
                        <input
                          type="text"
                          className="meeting-id"
                          value={meetingIdInputs[appointment.id] || appointment.meetingId || ""}
                          onChange={(e) => handleMeetingIdChange(appointment.id, e)}
                        />
                        <button onClick={() => handleSaveMeetingId(appointment.id)}>Save</button>
                      </>
                    ) : "-"}
                  </td>
                  <td>
                    {consultationReports[appointment.id]?.length > 0 ? (
                      <ul className="report-list">
                        {consultationReports[appointment.id].map((url, i) => (
                          <li key={i} onClick={() => openModal(url)}>
                            <img src={url} alt={`Report ${i + 1}`} className="report-thumbnail" />
                          </li>
                        ))}
                      </ul>
                    ) : "No reports"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && selectedImage && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-btn" onClick={closeModal}>&times;</span>
            <img src={selectedImage} alt="Consultation Report" className="modal-image" />
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default DoctorDashboard;
