import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  getDoc,
  doc,
  setDoc,
} from "firebase/firestore";
import "./appointment.css";
import Navbar from "../Navbar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedReports, setUploadedReports] = useState({});
  const user = getAuth().currentUser; // Get current logged-in user
  const [ismobile, setmobile] = useState(false);

  useEffect(() => {
    if (window.innerWidth <= 500) setmobile(true);
  }, []);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (user) {
        const db = getFirestore();
        const appointmentsRef = collection(db, "appointments");
        const q = query(appointmentsRef, where("patientId", "==", user.uid)); // Fetch appointments for logged-in user

        try {
          const querySnapshot = await getDocs(q);
          const userAppointments = [];

          querySnapshot.forEach((doc) => {
            const appointmentData = doc.data();
            userAppointments.push({
              id: doc.id,
              doctorName: appointmentData.DoctorName,
              appointmentDate: appointmentData.appointmentDate,
              status: appointmentData.status,
              timing: appointmentData.appointmentTime,
              meetingId: appointmentData.meetingId,
            });
          });

          // Sort appointments by date
          userAppointments.sort(
            (a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate)
          );

          setAppointments(userAppointments);
        } catch (error) {
          console.error("Error fetching appointments:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAppointments();
  }, [user]);

  const handleFileChange = (e, appointmentId) => {
    const files = e.target.files;
    const filesArray = Array.from(files).map((file) => ({
      file,
      base64: "",
    }));
    setSelectedFiles((prevFiles) => ({
      ...prevFiles,
      [appointmentId]: filesArray,
    }));

    // Convert files to Base64
    filesArray.forEach((fileObj, index) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        const updatedFiles = [...filesArray];
        updatedFiles[index].base64 = base64String;
        setSelectedFiles((prevFiles) => ({
          ...prevFiles,
          [appointmentId]: updatedFiles,
        }));
      };
      reader.readAsDataURL(fileObj.file);
    });
  };

  const handleUpload = async (appointmentId) => {
    if (!selectedFiles[appointmentId]) return;

    toast.success("Reports added!", {
      style: {
        color: "white",
      },
    });

    const db = getFirestore();
    const reportsRef = collection(db, "consultationReports");

    try {
      const reportPromises = selectedFiles[appointmentId].map(
        async (fileObj) => {
          const reportDocRef = await addDoc(reportsRef, {
            appointmentId,
            report: fileObj.base64,
            createdAt: new Date(),
          });
          return reportDocRef.id;
        }
      );

      const reportIds = await Promise.all(reportPromises);

      // Save the report IDs in the appointment document
      const appointmentDocRef = doc(db, "appointments", appointmentId);
      const appointmentDocSnap = await getDoc(appointmentDocRef);
      if (appointmentDocSnap.exists()) {
        await setDoc(
          appointmentDocRef,
          { reportIds: reportIds },
          { merge: true }
        );
      }

      alert("Reports uploaded successfully.");
    } catch (error) {
      console.error("Error uploading reports:", error);
    }
  };

  const fetchReports = async (appointmentId) => {
    const db = getFirestore();
    const reportsRef = collection(db, "consultationReports");
    const q = query(reportsRef, where("appointmentId", "==", appointmentId));
    const querySnapshot = await getDocs(q);

    const reports = [];
    querySnapshot.forEach((doc) => {
      reports.push(doc.data().report);
    });

    setUploadedReports((prevReports) => ({
      ...prevReports,
      [appointmentId]: reports,
    }));
  };

  useEffect(() => {
    if (appointments.length > 0) {
      appointments.forEach((appointment) => {
        if (appointment.status === "Accepted") {
          fetchReports(appointment.id);
        }
      });
    }
  }, [appointments]);

  useEffect(() => {
    if (appointments.length > 0) {
      appointments.forEach((appointment) => {
        if (appointment.status === "Accepted") {
          fetchReports(appointment.id);
        }
      });
    }
  }, []);

  if (loading) return <div className="loading">Loading appointments...</div>;

  return (
    <>
      <Navbar />
      {!ismobile ? (
        <div className="appointments-container">
          <h2>Your Appointments</h2>
          {appointments.length === 0 ? (
            <p className="no-appointments">You have no appointments.</p>
          ) : (
            <div className="table-container">
              <table className="appointments-table">
                <thead>
                  <tr>
                    <th>Doctor Name</th>
                    <th>Appointment Date</th>
                    <th>Status</th>
                    <th>Timing</th>
                    <th>Meeting</th>
                    <th>Upload Reports</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td>{appointment.doctorName}</td>
                      <td>{appointment.appointmentDate}</td>
                      <td
                        className={
                          appointment.status === "Approved"
                            ? "status-approved"
                            : appointment.status === "Rejected"
                            ? "status-rejected"
                            : appointment.status === "Accepted"
                            ? "status-accepted"
                            : "status-pending"
                        }
                      >
                        {appointment.status}
                      </td>
                      <td>
                        {appointment.timing
                          ? appointment.timing
                          : "Not selected by doctor"}
                      </td>
                      <td className="meeting-link">
                        {appointment.meetingId &&
                        appointment.meetingId !== "not yet decided" ? (
                          <a
                            href={appointment.meetingId}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Join Meeting
                          </a>
                        ) : (
                          "Not yet decided"
                        )}
                      </td>
                      {appointment.status === "Accepted" && (
                        <td>
                          <input
                            type="file"
                            multiple
                            onChange={(e) =>
                              handleFileChange(e, appointment.id)
                            }
                          />
                          <button
                            onClick={() => handleUpload(appointment.id)}
                            disabled={!selectedFiles[appointment.id]}
                          >
                            Upload Reports
                          </button>
                          <div
                            className="flex"
                            style={{ display: "flex", gap: "10px" }}
                          >
                            {uploadedReports[appointment.id] &&
                              uploadedReports[appointment.id].map(
                                (report, index) => (
                                  <div key={index}>
                                    <img
                                      style={{ width: "50px", height: "50px" }}
                                      src={report}
                                      alt={`Report ${index + 1}`}
                                    />
                                  </div>
                                )
                              )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="appointments-container">
          <h2>Your Appointments</h2>
          {appointments.length === 0 ? (
            <p className="no-appointments">You have no appointments.</p>
          ) : (
            <div className="appointments-list">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="appointment-card">
                  <h3>{appointment.doctorName}</h3>
                  <p>Date: {appointment.appointmentDate}</p>
                  <p>
                    Status:{" "}
                    <span
                      className={`status-${appointment.status.toLowerCase()}`}
                    >
                      {appointment.status}
                    </span>
                  </p>
{/* <<<<<<< HEAD */}
                  <p>Time: {appointment.timing}</p>
=======
                  <p>
                    Time:{" "}
{/* <<<<<<< HEAD */}
                    {appointment.timing}
=======
                    {appointment.timing || "Not selected by doctor"}
{/* >>>>>>> c53e11d70cd00d48b6e5e619c1aaec386518c6c6 */}
                  </p>
{/* >>>>>>> 6e25ac09abb624d5f901ce22d955e109c8662e93 */}
                  {appointment.meetingId !== "not yet decided" && (
                    <a
                      href={appointment.meetingId}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="join-meeting"
                    >
                      Join Meeting
                    </a>
                  )}
                  {appointment.status === "Accepted" && (
                    <div className="upload-section">
                      <input
                        type="file"
                        multiple
                        onChange={(e) => handleFileChange(e, appointment.id)}
                      />
                      <button onClick={() => handleUpload(appointment.id)}>
                        Upload Reports
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <ToastContainer />
    </>
  );
};

export default Appointments;

// // // // import React, { useState, useEffect } from "react";
// // // // import { getAuth } from "firebase/auth";
// // // // import {
// // // //   getFirestore,
// // // //   collection,
// // // //   query,
// // // //   where,
// // // //   getDocs,
// // // //   addDoc,
// // // //   getDoc,
// // // //   doc,
// // // //   setDoc,
// // // //   deleteDoc,
// // // //   writeBatch,
// // // // } from "firebase/firestore";
// // // // import "./appointment.css";
// // // // import Navbar from "../Navbar";
// // // // import { toast, ToastContainer } from "react-toastify";
// // // // import "react-toastify/dist/ReactToastify.css";

// // // // const Appointments = () => {
// // // //   const [appointments, setAppointments] = useState([]);
// // // //   const [loading, setLoading] = useState(true);
// // // //   const [selectedFiles, setSelectedFiles] = useState({});
// // // //   const [uploadedReports, setUploadedReports] = useState({});
// // // //   const user = getAuth().currentUser;
// // // //   const [ismobile, setmobile] = useState(false);

// // // //   useEffect(() => {
// // // //     if (window.innerWidth <= 500) setmobile(true);
// // // //   }, []);

// // // //   useEffect(() => {
// // // //     const fetchAppointments = async () => {
// // // //       if (user) {
// // // //         const db = getFirestore();
// // // //         const appointmentsRef = collection(db, "appointments");
// // // //         const q = query(appointmentsRef, where("patientId", "==", user.uid));

// // // //         try {
// // // //           const snapshot = await getDocs(q);
// // // //           const results = snapshot.docs.map((doc) => ({
// // // //             id: doc.id,
// // // //             ...doc.data(),
// // // //           }));

// // // //           results.sort(
// // // //             (a, b) =>
// // // //               new Date(a.appointmentDate) - new Date(b.appointmentDate)
// // // //           );
// // // //           setAppointments(results);
// // // //         } catch (err) {
// // // //           console.error("Error fetching appointments:", err);
// // // //         } finally {
// // // //           setLoading(false);
// // // //         }
// // // //       }
// // // //     };

// // // //     fetchAppointments();
// // // //   }, [user]);

// // // //   const handleFileChange = (e, appointmentId) => {
// // // //     const files = Array.from(e.target.files).map((file) => ({
// // // //       file,
// // // //       base64: "",
// // // //     }));

// // // //     files.forEach((fileObj, idx) => {
// // // //       const reader = new FileReader();
// // // //       reader.onloadend = () => {
// // // //         files[idx].base64 = reader.result;
// // // //         setSelectedFiles((prev) => ({
// // // //           ...prev,
// // // //           [appointmentId]: files,
// // // //         }));
// // // //       };
// // // //       reader.readAsDataURL(fileObj.file);
// // // //     });
// // // //   };

// // // //   const handleUpload = async (appointmentId) => {
// // // //     if (!selectedFiles[appointmentId]) return;

// // // //     const db = getFirestore();
// // // //     const reportsRef = collection(db, "consultationReports");

// // // //     try {
// // // //       const uploadPromises = selectedFiles[appointmentId].map((fileObj) =>
// // // //         addDoc(reportsRef, {
// // // //           appointmentId,
// // // //           report: fileObj.base64,
// // // //           createdAt: new Date(),
// // // //         })
// // // //       );

// // // //       const reportDocs = await Promise.all(uploadPromises);
// // // //       const reportIds = reportDocs.map((doc) => doc.id);

// // // //       await setDoc(
// // // //         doc(db, "appointments", appointmentId),
// // // //         { reportIds },
// // // //         { merge: true }
// // // //       );

// // // //       toast.success("Reports uploaded successfully.");
// // // //     } catch (error) {
// // // //       console.error("Upload error:", error);
// // // //     }
// // // //   };

// // // //   const fetchReports = async (appointmentId) => {
// // // //     const db = getFirestore();
// // // //     const reportsRef = collection(db, "consultationReports");
// // // //     const q = query(reportsRef, where("appointmentId", "==", appointmentId));
// // // //     const snapshot = await getDocs(q);

// // // //     const reports = snapshot.docs.map((doc) => doc.data().report);
// // // //     setUploadedReports((prev) => ({
// // // //       ...prev,
// // // //       [appointmentId]: reports,
// // // //     }));
// // // //   };

// // // //   const deleteOtherAppointments = async (acceptedAppointment) => {
// // // //     const db = getFirestore();
// // // //     const q = query(
// // // //       collection(db, "appointments"),
// // // //       where("appointment_id", "==", acceptedAppointment.appointment_id)
// // // //     );
// // // //     const snapshot = await getDocs(q);
// // // //     const batch = writeBatch(db);

// // // //     snapshot.forEach((docSnap) => {
// // // //       if (docSnap.id !== acceptedAppointment.id) {
// // // //         batch.delete(doc(db, "appointments", docSnap.id));
// // // //       }
// // // //     });

// // // //     await batch.commit();
// // // //     console.log("Other appointments with same ID deleted.");
// // // //   };

// // // //   const handleAccept = async (appointment) => {
// // // //     const db = getFirestore();
// // // //     const ref = doc(db, "appointments", appointment.id);

// // // //     try {
// // // //       await setDoc(ref, { status: "Accepted" }, { merge: true });
// // // //       toast.success("Appointment accepted!");

// // // //       await deleteOtherAppointments(appointment);

// // // //       // Refresh appointment list
// // // //       setAppointments((prev) =>
// // // //         prev.filter((appt) =>
// // // //           appt.appointment_id === appointment.appointment_id
// // // //             ? appt.id === appointment.id
// // // //             : true
// // // //         )
// // // //       );
// // // //     } catch (err) {
// // // //       console.error("Error accepting appointment:", err);
// // // //     }
// // // //   };

// // // //   useEffect(() => {
// // // //     appointments.forEach((appt) => {
// // // //       if (appt.status === "Accepted") fetchReports(appt.id);
// // // //     });
// // // //   }, [appointments]);

// // // //   if (loading) return <div className="loading">Loading appointments...</div>;

// // // //   return (
// // // //     <>
// // // //       <Navbar />
// // // //       <div className="appointments-container">
// // // //         <h2>Your Appointments</h2>
// // // //         {appointments.length === 0 ? (
// // // //           <p className="no-appointments">You have no appointments.</p>
// // // //         ) : ismobile ? (
// // // //           appointments.map((a) => (
// // // //             <div className="appointment-card" key={a.id}>
// // // //               <h3>{a.DoctorName}</h3>
// // // //               <p>Date: {a.appointmentDate}</p>
// // // //               <p>Status: {a.status}</p>
// // // //               <p>Time: {a.appointmentTime || "Not selected"}</p>
// // // //               {a.meetingId && a.meetingId !== "not yet decided" && (
// // // //                 <a href={a.meetingId} target="_blank" rel="noreferrer">
// // // //                   Join Meeting
// // // //                 </a>
// // // //               )}
// // // //               {a.status === "Accepted" && (
// // // //                 <>
// // // //                   <input
// // // //                     type="file"
// // // //                     multiple
// // // //                     onChange={(e) => handleFileChange(e, a.id)}
// // // //                   />
// // // //                   <button onClick={() => handleUpload(a.id)}>
// // // //                     Upload Reports
// // // //                   </button>
// // // //                 </>
// // // //               )}
// // // //             </div>
// // // //           ))
// // // //         ) : (
// // // //           <table className="appointments-table">
// // // //             <thead>
// // // //               <tr>
// // // //                 <th>Doctor Name</th>
// // // //                 <th>Appointment Date</th>
// // // //                 <th>Status</th>
// // // //                 <th>Time</th>
// // // //                 <th>Meeting</th>
// // // //                 <th>Upload</th>
// // // //               </tr>
// // // //             </thead>
// // // //             <tbody>
// // // //               {appointments.map((a) => (
// // // //                 <tr key={a.id}>
// // // //                   <td>{a.DoctorName}</td>
// // // //                   <td>{a.appointmentDate}</td>
// // // //                   <td>{a.status}</td>
// // // //                   <td>{a.appointmentTime || "Not selected"}</td>
// // // //                   <td>
// // // //                     {a.meetingId && a.meetingId !== "not yet decided" ? (
// // // //                       <a href={a.meetingId} target="_blank" rel="noreferrer">
// // // //                         Join
// // // //                       </a>
// // // //                     ) : (
// // // //                       "Pending"
// // // //                     )}
// // // //                   </td>
// // // //                   <td>
// // // //                     {a.status === "Accepted" && (
// // // //                       <>
// // // //                         <input
// // // //                           type="file"
// // // //                           multiple
// // // //                           onChange={(e) => handleFileChange(e, a.id)}
// // // //                         />
// // // //                         <button onClick={() => handleUpload(a.id)}>
// // // //                           Upload
// // // //                         </button>
// // // //                         <div className="report-thumbs">
// // // //                           {uploadedReports[a.id]?.map((r, i) => (
// // // //                             <img
// // // //                               key={i}
// // // //                               src={r}
// // // //                               alt={`report-${i}`}
// // // //                               style={{ width: 40, height: 40 }}
// // // //                             />
// // // //                           ))}
// // // //                         </div>
// // // //                       </>
// // // //                     )}
// // // //                   </td>
// // // //                 </tr>
// // // //               ))}
// // // //             </tbody>
// // // //           </table>
// // // //         )}
// // // //       </div>
// // // //       <ToastContainer />
// // // //     </>
// // // //   );
// // // // };

// // // // export default Appointments;

// // // // // import React, { useState, useEffect } from "react";
// // // // // import { getAuth } from "firebase/auth";
// // // // // import {
// // // // //   getFirestore,
// // // // //   collection,
// // // // //   query,
// // // // //   where,
// // // // //   getDocs,
// // // // //   addDoc,
// // // // //   getDoc,
// // // // //   doc,
// // // // //   setDoc,
// // // // //   deleteDoc,
// // // // // } from "firebase/firestore";
// // // // // import "./appointment.css";
// // // // // import Navbar from "../Navbar";
// // // // // import { toast, ToastContainer } from "react-toastify";
// // // // // import "react-toastify/dist/ReactToastify.css";

// // // // // const Appointments = () => {
// // // // //   const [appointments, setAppointments] = useState([]);
// // // // //   const [loading, setLoading] = useState(true);
// // // // //   const [selectedFiles, setSelectedFiles] = useState([]);
// // // // //   const [uploadedReports, setUploadedReports] = useState({});
// // // // //   const user = getAuth().currentUser;
// // // // //   const [ismobile, setmobile] = useState(false);

// // // // //   useEffect(() => {
// // // // //     if (window.innerWidth <= 500) setmobile(true);
// // // // //   }, []);

// // // // //   const fetchAppointments = async () => {
// // // // //     if (user) {
// // // // //       const db = getFirestore();
// // // // //       const appointmentsRef = collection(db, "appointments");
// // // // //       const q = query(appointmentsRef, where("patientId", "==", user.uid));
// // // // //       try {
// // // // //         const querySnapshot = await getDocs(q);
// // // // //         const userAppointments = [];

// // // // //         querySnapshot.forEach((docSnap) => {
// // // // //           const data = docSnap.data();
// // // // //           userAppointments.push({
// // // // //             id: docSnap.id,
// // // // //             ...data,
// // // // //           });
// // // // //         });

// // // // //         userAppointments.sort(
// // // // //           (a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate)
// // // // //         );

// // // // //         setAppointments(userAppointments);
// // // // //       } catch (err) {
// // // // //         console.error("Error fetching appointments:", err);
// // // // //       } finally {
// // // // //         setLoading(false);
// // // // //       }
// // // // //     }
// // // // //   };

// // // // //   useEffect(() => {
// // // // //     fetchAppointments();
// // // // //   }, [user]);

// // // // //   const handleAccept = async (appointment) => {
// // // // //     const db = getFirestore();
// // // // //     const { id, appointment_id } = appointment; // Get the unique document ID 'id' and the shared 'appointment_id'

// // // // //     try {
// // // // //       // Get a reference to the specific appointment document being accepted
// // // // //       const currentRef = doc(db, "appointments", id);

// // // // //       // Update this specific appointment document:
// // // // //       // Set its status to "Accepted" AND set not_acceptable to true
// // // // //       await setDoc(
// // // // //         currentRef,
// // // // //         { status: "Accepted", not_acceptable: true }, // <-- Added not_acceptable: true here
// // // // //         { merge: true } // Use merge: true to only update these fields, not overwrite the whole doc
// // // // //       );

// // // // //       // Now, find and delete all *other* appointment proposals related to the same request
// // // // //       // (i.e., same appointment_id but different document id)
// // // // //       const q = query(collection(db, "appointments"), where("appointment_id", "==", appointment_id));
// // // // //       const snapshot = await getDocs(q);

// // // // //       const deletePromises = [];
// // // // //       snapshot.forEach((docSnap) => {
// // // // //         // IMPORTANT: Only delete documents that are NOT the one we just accepted
// // // // //         if (docSnap.id !== id) {
// // // // //           deletePromises.push(deleteDoc(doc(db, "appointments", docSnap.id)));
// // // // //         }
// // // // //       });

// // // // //       // Wait for all deletions to complete
// // // // //       await Promise.all(deletePromises);

// // // // //       toast.success("Appointment accepted and conflicting proposals removed!");

// // // // //       // Refresh the list to show the updated status and remove deleted items
// // // // //       fetchAppointments();

// // // // //     } catch (err) {
// // // // //       console.error("Error accepting appointment:", err);
// // // // //       toast.error("Something went wrong while accepting the appointment.");
// // // // //     }
// // // // //   };
// // // // //   const handleFileChange = (e, appointmentId) => {
// // // // //     const filesArray = Array.from(e.target.files).map((file) => ({
// // // // //       file,
// // // // //       base64: "",
// // // // //     }));

// // // // //     setSelectedFiles((prev) => ({
// // // // //       ...prev,
// // // // //       [appointmentId]: filesArray,
// // // // //     }));

// // // // //     filesArray.forEach((fileObj, index) => {
// // // // //       const reader = new FileReader();
// // // // //       reader.onloadend = () => {
// // // // //         const updated = [...filesArray];
// // // // //         updated[index].base64 = reader.result;
// // // // //         setSelectedFiles((prev) => ({
// // // // //           ...prev,
// // // // //           [appointmentId]: updated,
// // // // //         }));
// // // // //       };
// // // // //       reader.readAsDataURL(fileObj.file);
// // // // //     });
// // // // //   };

// // // // //   const handleUpload = async (appointmentId) => {
// // // // //     const db = getFirestore();
// // // // //     const files = selectedFiles[appointmentId];
// // // // //     if (!files) return;

// // // // //     try {
// // // // //       const reportRefs = await Promise.all(
// // // // //         files.map((fileObj) =>
// // // // //           addDoc(collection(db, "consultationReports"), {
// // // // //             appointmentId,
// // // // //             report: fileObj.base64,
// // // // //             createdAt: new Date(),
// // // // //           })
// // // // //         )
// // // // //       );

// // // // //       const reportIds = reportRefs.map((ref) => ref.id);
// // // // //       await setDoc(doc(db, "appointments", appointmentId), { reportIds }, { merge: true });

// // // // //       toast.success("Reports uploaded successfully!");
// // // // //     } catch (err) {
// // // // //       console.error("Upload failed:", err);
// // // // //       toast.error("Upload failed.");
// // // // //     }
// // // // //   };

// // // // //   const fetchReports = async (appointmentId) => {
// // // // //     const db = getFirestore();
// // // // //     const q = query(collection(db, "consultationReports"), where("appointmentId", "==", appointmentId));
// // // // //     const snapshot = await getDocs(q);
// // // // //     const reports = snapshot.docs.map((doc) => doc.data().report);

// // // // //     setUploadedReports((prev) => ({
// // // // //       ...prev,
// // // // //       [appointmentId]: reports,
// // // // //     }));
// // // // //   };

// // // // //   useEffect(() => {
// // // // //     appointments.forEach((appt) => {
// // // // //       if (appt.status === "Accepted") {
// // // // //         fetchReports(appt.id);
// // // // //       }
// // // // //     });
// // // // //   }, [appointments]);

// // // // //   if (loading) return <div className="loading">Loading appointments...</div>;

// // // // //   return (
// // // // //     <>
// // // // //       <Navbar />
// // // // //       <div className="appointments-container">
// // // // //         <h2>Your Appointments</h2>
// // // // //         {appointments.length === 0 ? (
// // // // //           <p className="no-appointments">You have no appointments.</p>
// // // // //         ) : (
// // // // //           <div className={ismobile ? "appointments-list" : "table-container"}>
// // // // //             {!ismobile ? (
// // // // //               <table className="appointments-table">
// // // // //                 <thead>
// // // // //                   <tr>
// // // // //                     <th>Doctor</th>
// // // // //                     <th>Date</th>
// // // // //                     <th>Status</th>
// // // // //                     <th>Time</th>
// // // // //                     <th>Meeting</th>
// // // // //                     <th>Actions</th>
// // // // //                   </tr>
// // // // //                 </thead>
// // // // //                 <tbody>
// // // // //                   {appointments.map((appt) => (
// // // // //                     <tr key={appt.id}>
// // // // //                       <td>{appt.DoctorName}</td>
// // // // //                       <td>{appt.appointmentDate}</td>
// // // // //                       <td className={`status-${appt.status.toLowerCase()}`}>
// // // // //                         {appt.status}
// // // // //                       </td>
// // // // //                       <td>{appt.appointmentTime || "Not chosen"}</td>
// // // // //                       <td>
// // // // //                         {appt.meetingId && appt.meetingId !== "not yet decided" ? (
// // // // //                           <a href={appt.meetingId} target="_blank" rel="noopener noreferrer">
// // // // //                             Join Meeting
// // // // //                           </a>
// // // // //                         ) : (
// // // // //                           "Not yet decided"
// // // // //                         )}
// // // // //                       </td>
// // // // //                       <td>
// // // // //                         {appt.status === "Pending" && (
// // // // //                           <button onClick={() => handleAccept(appt)}>Accept</button>
// // // // //                         )}
// // // // //                         {appt.status === "Accepted" && (
// // // // //                           <>
// // // // //                             <input type="file" multiple onChange={(e) => handleFileChange(e, appt.id)} />
// // // // //                             <button
// // // // //                               onClick={() => handleUpload(appt.id)}
// // // // //                               disabled={!selectedFiles[appt.id]}
// // // // //                             >
// // // // //                               Upload
// // // // //                             </button>
// // // // //                             <div className="flex" style={{ display: "flex", gap: "10px" }}>
// // // // //                               {uploadedReports[appt.id]?.map((report, idx) => (
// // // // //                                 <img key={idx} src={report} alt={`Report ${idx + 1}`} width={50} height={50} />
// // // // //                               ))}
// // // // //                             </div>
// // // // //                           </>
// // // // //                         )}
// // // // //                       </td>
// // // // //                     </tr>
// // // // //                   ))}
// // // // //                 </tbody>
// // // // //               </table>
// // // // //             ) : (
// // // // //               appointments.map((appt) => (
// // // // //                 <div key={appt.id} className="appointment-card">
// // // // //                   <h3>{appt.DoctorName}</h3>
// // // // //                   <p>Date: {appt.appointmentDate}</p>
// // // // //                   <p>Status: <span className={`status-${appt.status.toLowerCase()}`}>{appt.status}</span></p>
// // // // //                   <p>Time: {appt.appointmentTime || "Not chosen"}</p>
// // // // //                   {appt.meetingId !== "not yet decided" && (
// // // // //                     <a href={appt.meetingId} target="_blank" rel="noopener noreferrer">
// // // // //                       Join Meeting
// // // // //                     </a>
// // // // //                   )}
// // // // //                   {appt.status === "Pending" && (
// // // // //                     <button onClick={() => handleAccept(appt)}>Accept</button>
// // // // //                   )}
// // // // //                   {appt.status === "Accepted" && (
// // // // //                     <div className="upload-section">
// // // // //                       <input type="file" multiple onChange={(e) => handleFileChange(e, appt.id)} />
// // // // //                       <button onClick={() => handleUpload(appt.id)}>Upload Reports</button>
// // // // //                       <div className="flex" style={{ display: "flex", gap: "10px" }}>
// // // // //                         {uploadedReports[appt.id]?.map((report, idx) => (
// // // // //                           <img key={idx} src={report} alt={`Report ${idx + 1}`} width={50} height={50} />
// // // // //                         ))}
// // // // //                       </div>
// // // // //                     </div>
// // // // //                   )}
// // // // //                 </div>
// // // // //               ))
// // // // //             )}
// // // // //           </div>
// // // // //         )}
// // // // //       </div>
// // // // //       <ToastContainer />
// // // // //     </>
// // // // //   );
// // // // // };

// // // // // export default Appointments;

// // // // // import React, { useState, useEffect } from "react";
// // // // // import { getAuth } from "firebase/auth";
// // // // // import {
// // // // //   getFirestore,
// // // // //   collection,
// // // // //   query,
// // // // //   where,
// // // // //   getDocs,
// // // // //   addDoc,
// // // // //   doc,
// // // // //   setDoc,
// // // // //   deleteDoc,
// // // // // } from "firebase/firestore";
// // // // // import "./appointment.css";
// // // // // import Navbar from "../Navbar";
// // // // // import { toast, ToastContainer } from "react-toastify";
// // // // // import "react-toastify/dist/ReactToastify.css";

// // // // // const Appointments = () => {
// // // // //   const [appointments, setAppointments] = useState([]);
// // // // //   const [loading, setLoading] = useState(true);
// // // // //   const [selectedFiles, setSelectedFiles] = useState([]);
// // // // //   const [uploadedReports, setUploadedReports] = useState({});
// // // // //   const [isMobile, setIsMobile] = useState(false);
// // // // //   const user = getAuth().currentUser;

// // // // //   useEffect(() => {
// // // // //     setIsMobile(window.innerWidth <= 500);
// // // // //   }, []);

// // // // //   const fetchAppointments = async () => {
// // // // //     if (!user) return;

// // // // //     const db = getFirestore();
// // // // //     const q = query(collection(db, "appointments"), where("patientId", "==", user.uid));
// // // // //     try {
// // // // //       const querySnapshot = await getDocs(q);
// // // // //       const data = querySnapshot.docs.map((doc) => ({
// // // // //         id: doc.id,
// // // // //         ...doc.data(),
// // // // //       }));

// // // // //       data.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
// // // // //       setAppointments(data);
// // // // //     } catch (err) {
// // // // //       console.error("Error fetching appointments:", err);
// // // // //     } finally {
// // // // //       setLoading(false);
// // // // //     }
// // // // //   };

// // // // //   useEffect(() => {
// // // // //     fetchAppointments();
// // // // //   }, [user]);

// // // // //   const deleteAppointmentsById = async (id) => {
// // // // //     const db = getFirestore();
// // // // //     const q = query(
// // // // //       collection(db, "appointments"),
// // // // //       where("appointment_Id", "==", id)
// // // // //     );

// // // // //     const snapshot = await getDocs(q);
// // // // //     snapshot.forEach(async (docSnap) => {
// // // // //       await deleteDoc(doc(db, "appointments", docSnap.id));
// // // // //       console.log("Deleted appointment with date:");
// // // // //     });
// // // // //   };

// // // // //   const handleAccept = async (appointment) => {
// // // // //     const db = getFirestore();
// // // // //     const { id, appointment_id } = appointment;

// // // // //     if (!appointment_id) {
// // // // //       toast.error("Appointment ID missing. Cannot proceed.");
// // // // //       return;
// // // // //     }

// // // // //     try {
// // // // //       // Step 1: Accept current appointment
// // // // //       const currentRef = doc(db, "appointments", id);
// // // // //       await setDoc(currentRef, { status: "Accepted" }, { merge: true });
// // // // //       deleteAppointmentsById(appointment_id)
// // // // //       // Step 2: Delete other appointments with the same appointment_id
// // // // //       // const q = query(
// // // // //       //   collection(db, "appointments"),
// // // // //       //   where("appointment_id", "==", appointment_id)
// // // // //       // );

// // // // //       // const snapshot = await getDocs(q);
// // // // //       // console.log("Fetched docs:", snapshot.docs.length);

// // // // //       // const deletePromises = [];

// // // // //       // snapshot.forEach((docSnap) => {
// // // // //       //   const docId = docSnap.id;
// // // // //       //   const data = docSnap.data();

// // // // //       //   console.log("Found doc:", docId, data.status);

// // // // //       //   if (docId !== id) {
// // // // //       //     console.log("Deleting duplicate appointment:", docId);
// // // // //       //     deletePromises.push(deleteDoc(doc(db, "appointments", docId)));
// // // // //       //   }
// // // // //       // });

// // // // //       // await Promise.all(deletePromises);
// // // // //       // toast.success("Appointment accepted and other slots deleted!");
// // // // //       fetchAppointments();

// // // // //     } catch (err) {
// // // // //       console.error("Error accepting appointment:", err);
// // // // //       toast.error("Failed to accept appointment.");
// // // // //     }
// // // // //   };

// // // // //   // const handleAccept = async (appointment) => {
// // // // //   //   const db = getFirestore();
// // // // //   //   const { id, appointment_id } = appointment;

// // // // //   //   try {
// // // // //   //     // Mark current appointment as "Accepted"
// // // // //   //     await setDoc(doc(db, "appointments", appointment_id), { status: "Accepted" }, { merge: true });

// // // // //   //     // Delete all other appointments with same appointment_id
// // // // //   //     const q = query(collection(db, "appointments"), where("appointment_id", "==", appointment_id));
// // // // //   //     const snapshot = await getDocs(q);

// // // // //   //     const deletePromises = snapshot.docs
// // // // //   //       .filter((docSnap) => docSnap.id !== id)
// // // // //   //       .map((docSnap) => deleteDoc(doc(db, "appointments", docSnap.id)));

// // // // //   //     await Promise.all(deletePromises);
// // // // //   //     toast.success("Appointment accepted and others removed!");
// // // // //   //     fetchAppointments();
// // // // //   //   } catch (err) {
// // // // //   //     console.error("Error accepting appointment:", err);
// // // // //   //     toast.error("Failed to accept appointment.");
// // // // //   //   }
// // // // //   // };

// // // // //   const handleFileChange = (e, appointmentId) => {
// // // // //     const filesArray = Array.from(e.target.files).map((file) => ({
// // // // //       file,
// // // // //       base64: "",
// // // // //     }));

// // // // //     setSelectedFiles((prev) => ({
// // // // //       ...prev,
// // // // //       [appointmentId]: filesArray,
// // // // //     }));

// // // // //     filesArray.forEach((fileObj, index) => {
// // // // //       const reader = new FileReader();
// // // // //       reader.onloadend = () => {
// // // // //         const updated = [...filesArray];
// // // // //         updated[index].base64 = reader.result;
// // // // //         setSelectedFiles((prev) => ({
// // // // //           ...prev,
// // // // //           [appointmentId]: updated,
// // // // //         }));
// // // // //       };
// // // // //       reader.readAsDataURL(fileObj.file);
// // // // //     });
// // // // //   };

// // // // //   const handleUpload = async (appointmentId) => {
// // // // //     const db = getFirestore();
// // // // //     const files = selectedFiles[appointmentId];
// // // // //     if (!files) return;

// // // // //     try {
// // // // //       const refs = await Promise.all(
// // // // //         files.map((fileObj) =>
// // // // //           addDoc(collection(db, "consultationReports"), {
// // // // //             appointmentId,
// // // // //             report: fileObj.base64,
// // // // //             createdAt: new Date(),
// // // // //           })
// // // // //         )
// // // // //       );

// // // // //       const reportIds = refs.map((ref) => ref.id);
// // // // //       await setDoc(doc(db, "appointments", appointmentId), { reportIds }, { merge: true });
// // // // //       toast.success("Reports uploaded!");
// // // // //     } catch (err) {
// // // // //       console.error("Upload failed:", err);
// // // // //       toast.error("Upload failed.");
// // // // //     }
// // // // //   };

// // // // //   const fetchReports = async (appointmentId) => {
// // // // //     const db = getFirestore();
// // // // //     const q = query(collection(db, "consultationReports"), where("appointmentId", "==", appointmentId));
// // // // //     const snapshot = await getDocs(q);
// // // // //     const reports = snapshot.docs.map((doc) => doc.data().report);

// // // // //     setUploadedReports((prev) => ({
// // // // //       ...prev,
// // // // //       [appointmentId]: reports,
// // // // //     }));
// // // // //   };

// // // // //   useEffect(() => {
// // // // //     appointments.forEach((appt) => {
// // // // //       if (appt.status === "Accepted") {
// // // // //         fetchReports(appt.id);
// // // // //       }
// // // // //     });
// // // // //   }, [appointments]);

// // // // //   if (loading) return <div className="loading">Loading appointments...</div>;

// // // // //   return (
// // // // //     <>
// // // // //       <Navbar />
// // // // //       <div className="appointments-container">
// // // // //         <h2>Your Appointments</h2>
// // // // //         {appointments.length === 0 ? (
// // // // //           <p className="no-appointments">You have no appointments.</p>
// // // // //         ) : (
// // // // //           <div className={isMobile ? "appointments-list" : "table-container"}>
// // // // //             {!isMobile ? (
// // // // //               <table className="appointments-table">
// // // // //                 <thead>
// // // // //                   <tr>
// // // // //                     <th>Doctor</th>
// // // // //                     <th>Date</th>
// // // // //                     <th>Status</th>
// // // // //                     <th>Time</th>
// // // // //                     <th>Meeting</th>
// // // // //                     <th>Actions</th>
// // // // //                   </tr>
// // // // //                 </thead>
// // // // //                 <tbody>
// // // // //                   {appointments.map((appt) => (
// // // // //                     <tr key={appt.id}>
// // // // //                       <td>{appt.DoctorName}</td>
// // // // //                       <td>{appt.appointmentDate}</td>
// // // // //                       <td className={`status-${appt.status.toLowerCase()}`}>{appt.status}</td>
// // // // //                       <td>{appt.appointmentTime || "Not chosen"}</td>
// // // // //                       <td>
// // // // //                         {appt.meetingId && appt.meetingId !== "not yet decided" ? (
// // // // //                           <a href={appt.meetingId} target="_blank" rel="noopener noreferrer">Join Meeting</a>
// // // // //                         ) : (
// // // // //                           "Not yet decided"
// // // // //                         )}
// // // // //                       </td>
// // // // //                       <td>
// // // // //                         {appt.status === "Pending" && (
// // // // //                           <button onClick={() => handleAccept(appt)}>Accept</button>
// // // // //                         )}
// // // // //                         {appt.status === "Accepted" && (
// // // // //                           <>
// // // // //                             <input type="file" multiple onChange={(e) => handleFileChange(e, appt.id)} />
// // // // //                             <button onClick={() => handleUpload(appt.id)} disabled={!selectedFiles[appt.id]}>
// // // // //                               Upload
// // // // //                             </button>
// // // // //                             <div className="flex" style={{ display: "flex", gap: "10px" }}>
// // // // //                               {uploadedReports[appt.id]?.map((report, idx) => (
// // // // //                                 <img key={idx} src={report} alt={`Report ${idx + 1}`} width={50} height={50} />
// // // // //                               ))}
// // // // //                             </div>
// // // // //                           </>
// // // // //                         )}
// // // // //                       </td>
// // // // //                     </tr>
// // // // //                   ))}
// // // // //                 </tbody>
// // // // //               </table>
// // // // //             ) : (
// // // // //               appointments.map((appt) => (
// // // // //                 <div key={appt.id} className="appointment-card">
// // // // //                   <h3>{appt.DoctorName}</h3>
// // // // //                   <p>Date: {appt.appointmentDate}</p>
// // // // //                   <p>Status: <span className={`status-${appt.status.toLowerCase()}`}>{appt.status}</span></p>
// // // // //                   <p>Time: {appt.appointmentTime || "Not chosen"}</p>
// // // // //                   {appt.meetingId !== "not yet decided" && (
// // // // //                     <a href={appt.meetingId} target="_blank" rel="noopener noreferrer">
// // // // //                       Join Meeting
// // // // //                     </a>
// // // // //                   )}
// // // // //                   {appt.status === "Pending" && (
// // // // //                     <button onClick={() => handleAccept(appt)}>Accept</button>
// // // // //                   )}
// // // // //                   {appt.status === "Accepted" && (
// // // // //                     <div className="upload-section">
// // // // //                       <input type="file" multiple onChange={(e) => handleFileChange(e, appt.id)} />
// // // // //                       <button onClick={() => handleUpload(appt.id)}>Upload Reports</button>
// // // // //                       <div className="flex" style={{ display: "flex", gap: "10px" }}>
// // // // //                         {uploadedReports[appt.id]?.map((report, idx) => (
// // // // //                           <img key={idx} src={report} alt={`Report ${idx + 1}`} width={50} height={50} />
// // // // //                         ))}
// // // // //                       </div>
// // // // //                     </div>
// // // // //                   )}
// // // // //                 </div>
// // // // //               ))
// // // // //             )}
// // // // //           </div>
// // // // //         )}
// // // // //       </div>
// // // // //       <ToastContainer />
// // // // //     </>
// // // // //   );
// // // // // };

// // // // // export default Appointments;

// // // // // // // // // // // // import React, { useState, useEffect } from "react";
// // // // // // // // // // // // import { getAuth } from "firebase/auth";
// // // // // // // // // // // // import {
// // // // // // // // // // // //   getFirestore,
// // // // // // // // // // // //   collection,
// // // // // // // // // // // //   query,
// // // // // // // // // // // //   where,
// // // // // // // // // // // //   getDocs,
// // // // // // // // // // // //   addDoc,
// // // // // // // // // // // //   getDoc,
// // // // // // // // // // // //   doc,
// // // // // // // // // // // //   setDoc,
// // // // // // // // // // // //   updateDoc,
// // // // // // // // // // // // } from "firebase/firestore";
// // // // // // // // // // // // import "./appointment.css";
// // // // // // // // // // // // import Navbar from "../Navbar";
// // // // // // // // // // // // import { toast, ToastContainer } from "react-toastify";
// // // // // // // // // // // // import "react-toastify/dist/ReactToastify.css";

// // // // // // // // // // // // const Appointments = () => {
// // // // // // // // // // // //   const [appointments, setAppointments] = useState([]);
// // // // // // // // // // // //   const [loading, setLoading] = useState(true);
// // // // // // // // // // // //   const [selectedFiles, setSelectedFiles] = useState([]);
// // // // // // // // // // // //   const [uploadedReports, setUploadedReports] = useState({});
// // // // // // // // // // // //   const [ismobile, setmobile] = useState(false);
// // // // // // // // // // // //   const user = getAuth().currentUser;

// // // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // // //     if (window.innerWidth <= 500) setmobile(true);
// // // // // // // // // // // //   }, []);

// // // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // // //     const fetchAppointments = async () => {
// // // // // // // // // // // //       if (user) {
// // // // // // // // // // // //         const db = getFirestore();
// // // // // // // // // // // //         const appointmentsRef = collection(db, "appointments");
// // // // // // // // // // // //         const q = query(appointmentsRef, where("patientId", "==", user.uid));

// // // // // // // // // // // //         try {
// // // // // // // // // // // //           const querySnapshot = await getDocs(q);
// // // // // // // // // // // //           const userAppointments = [];

// // // // // // // // // // // //           querySnapshot.forEach((docSnap) => {
// // // // // // // // // // // //             const data = docSnap.data();
// // // // // // // // // // // //             userAppointments.push({
// // // // // // // // // // // //               id: docSnap.id,
// // // // // // // // // // // //               doctorName: data.DoctorName,
// // // // // // // // // // // //               appointmentDate: data.appointmentDate,
// // // // // // // // // // // //               status: data.status,
// // // // // // // // // // // //               timing: data.appointmentTime,
// // // // // // // // // // // //               meetingId: data.meetingId,
// // // // // // // // // // // //               appointment_id: data.appointment_id, // required for filtering
// // // // // // // // // // // //               not_acceptable: data.not_acceptable || false,
// // // // // // // // // // // //             });
// // // // // // // // // // // //           });

// // // // // // // // // // // //           userAppointments.sort(
// // // // // // // // // // // //             (a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate)
// // // // // // // // // // // //           );

// // // // // // // // // // // //           setAppointments(userAppointments);
// // // // // // // // // // // //         } catch (error) {
// // // // // // // // // // // //           console.error("Error fetching appointments:", error);
// // // // // // // // // // // //         } finally {
// // // // // // // // // // // //           setLoading(false);
// // // // // // // // // // // //         }
// // // // // // // // // // // //       }
// // // // // // // // // // // //     };

// // // // // // // // // // // //     fetchAppointments();
// // // // // // // // // // // //   }, [user]);

// // // // // // // // // // // //   const handleFileChange = (e, appointmentId) => {
// // // // // // // // // // // //     const files = Array.from(e.target.files).map((file) => ({
// // // // // // // // // // // //       file,
// // // // // // // // // // // //       base64: "",
// // // // // // // // // // // //     }));

// // // // // // // // // // // //     setSelectedFiles((prev) => ({
// // // // // // // // // // // //       ...prev,
// // // // // // // // // // // //       [appointmentId]: files,
// // // // // // // // // // // //     }));

// // // // // // // // // // // //     files.forEach((fileObj, index) => {
// // // // // // // // // // // //       const reader = new FileReader();
// // // // // // // // // // // //       reader.onloadend = () => {
// // // // // // // // // // // //         const updatedFiles = [...files];
// // // // // // // // // // // //         updatedFiles[index].base64 = reader.result;

// // // // // // // // // // // //         setSelectedFiles((prev) => ({
// // // // // // // // // // // //           ...prev,
// // // // // // // // // // // //           [appointmentId]: updatedFiles,
// // // // // // // // // // // //         }));
// // // // // // // // // // // //       };
// // // // // // // // // // // //       reader.readAsDataURL(fileObj.file);
// // // // // // // // // // // //     });
// // // // // // // // // // // //   };

// // // // // // // // // // // //   const handleUpload = async (appointmentId) => {
// // // // // // // // // // // //     if (!selectedFiles[appointmentId]) return;
// // // // // // // // // // // //     toast.success("Reports added!", { style: { color: "white" } });

// // // // // // // // // // // //     const db = getFirestore();
// // // // // // // // // // // //     const reportsRef = collection(db, "consultationReports");

// // // // // // // // // // // //     try {
// // // // // // // // // // // //       const reportIds = await Promise.all(
// // // // // // // // // // // //         selectedFiles[appointmentId].map(async (fileObj) => {
// // // // // // // // // // // //           const reportDoc = await addDoc(reportsRef, {
// // // // // // // // // // // //             appointmentId,
// // // // // // // // // // // //             report: fileObj.base64,
// // // // // // // // // // // //             createdAt: new Date(),
// // // // // // // // // // // //           });
// // // // // // // // // // // //           return reportDoc.id;
// // // // // // // // // // // //         })
// // // // // // // // // // // //       );

// // // // // // // // // // // //       const appointmentDocRef = doc(db, "appointments", appointmentId);
// // // // // // // // // // // //       await setDoc(appointmentDocRef, { reportIds }, { merge: true });

// // // // // // // // // // // //       alert("Reports uploaded successfully.");
// // // // // // // // // // // //     } catch (error) {
// // // // // // // // // // // //       console.error("Error uploading reports:", error);
// // // // // // // // // // // //     }
// // // // // // // // // // // //   };

// // // // // // // // // // // //   const fetchReports = async (appointmentId) => {
// // // // // // // // // // // //     const db = getFirestore();
// // // // // // // // // // // //     const reportsRef = collection(db, "consultationReports");
// // // // // // // // // // // //     const q = query(reportsRef, where("appointmentId", "==", appointmentId));
// // // // // // // // // // // //     const snapshot = await getDocs(q);

// // // // // // // // // // // //     const reports = [];
// // // // // // // // // // // //     snapshot.forEach((doc) => {
// // // // // // // // // // // //       reports.push(doc.data().report);
// // // // // // // // // // // //     });

// // // // // // // // // // // //     setUploadedReports((prev) => ({
// // // // // // // // // // // //       ...prev,
// // // // // // // // // // // //       [appointmentId]: reports,
// // // // // // // // // // // //     }));
// // // // // // // // // // // //   };

// // // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // // //     appointments.forEach((appt) => {
// // // // // // // // // // // //       if (appt.status === "Accepted") {
// // // // // // // // // // // //         fetchReports(appt.id);
// // // // // // // // // // // //       }
// // // // // // // // // // // //     });
// // // // // // // // // // // //   }, [appointments]);

// // // // // // // // // // // //   const handleAcceptAppointment = async (appointmentId, sharedId) => {
// // // // // // // // // // // //     const db = getFirestore();
// // // // // // // // // // // //     const appointmentRef = doc(db, "appointments", appointmentId);

// // // // // // // // // // // //     try {
// // // // // // // // // // // //       await updateDoc(appointmentRef, { not_acceptable: true });
// // // // // // // // // // // //       const filteredAppointments = appointments.filter(
// // // // // // // // // // // //         (appt) => appt.appointment_id === sharedId
// // // // // // // // // // // //       );
// // // // // // // // // // // //       setAppointments(filteredAppointments);
// // // // // // // // // // // //     } catch (err) {
// // // // // // // // // // // //       console.error("Failed to update not_acceptable:", err);
// // // // // // // // // // // //     }
// // // // // // // // // // // //   };

// // // // // // // // // // // //   if (loading) return <div className="loading">Loading appointments...</div>;

// // // // // // // // // // // //   return (
// // // // // // // // // // // //     <>
// // // // // // // // // // // //       <Navbar />
// // // // // // // // // // // //       <ToastContainer />
// // // // // // // // // // // //       <div className="appointments-container">
// // // // // // // // // // // //         <h2>Your Appointments</h2>
// // // // // // // // // // // //         {appointments.length === 0 ? (
// // // // // // // // // // // //           <p className="no-appointments">You have no appointments.</p>
// // // // // // // // // // // //         ) : !ismobile ? (
// // // // // // // // // // // //           <div className="table-container">
// // // // // // // // // // // //             <table className="appointments-table">
// // // // // // // // // // // //               <thead>
// // // // // // // // // // // //                 <tr>
// // // // // // // // // // // //                   <th>Doctor Name</th>
// // // // // // // // // // // //                   <th>Appointment Date</th>
// // // // // // // // // // // //                   <th>Status</th>
// // // // // // // // // // // //                   <th>Timing</th>
// // // // // // // // // // // //                   <th>Meeting</th>
// // // // // // // // // // // //                   <th>Upload Reports</th>
// // // // // // // // // // // //                   <th>Accept</th>
// // // // // // // // // // // //                 </tr>
// // // // // // // // // // // //               </thead>
// // // // // // // // // // // //               <tbody>
// // // // // // // // // // // //                 {appointments.map((appt) => (
// // // // // // // // // // // //                   <tr key={appt.id}>
// // // // // // // // // // // //                     <td>{appt.doctorName}</td>
// // // // // // // // // // // //                     <td>{appt.appointmentDate}</td>
// // // // // // // // // // // //                     <td className={`status-${appt.status.toLowerCase()}`}>
// // // // // // // // // // // //                       {appt.status}
// // // // // // // // // // // //                     </td>
// // // // // // // // // // // //                     <td>{appt.timing || "Not selected by doctor"}</td>
// // // // // // // // // // // //                     <td className="meeting-link">
// // // // // // // // // // // //                       {appt.meetingId &&
// // // // // // // // // // // //                       appt.meetingId !== "not yet decided" ? (
// // // // // // // // // // // //                         <a
// // // // // // // // // // // //                           href={appt.meetingId}
// // // // // // // // // // // //                           target="_blank"
// // // // // // // // // // // //                           rel="noopener noreferrer"
// // // // // // // // // // // //                         >
// // // // // // // // // // // //                           Join Meeting
// // // // // // // // // // // //                         </a>
// // // // // // // // // // // //                       ) : (
// // // // // // // // // // // //                         "Not yet decided"
// // // // // // // // // // // //                       )}
// // // // // // // // // // // //                     </td>
// // // // // // // // // // // //                     <td>
// // // // // // // // // // // //                       {appt.status === "Accepted" && (
// // // // // // // // // // // //                         <>
// // // // // // // // // // // //                           <input
// // // // // // // // // // // //                             type="file"
// // // // // // // // // // // //                             multiple
// // // // // // // // // // // //                             onChange={(e) => handleFileChange(e, appt.id)}
// // // // // // // // // // // //                           />
// // // // // // // // // // // //                           <button
// // // // // // // // // // // //                             onClick={() => handleUpload(appt.id)}
// // // // // // // // // // // //                             disabled={!selectedFiles[appt.id]}
// // // // // // // // // // // //                           >
// // // // // // // // // // // //                             Upload Reports
// // // // // // // // // // // //                           </button>
// // // // // // // // // // // //                           <div style={{ display: "flex", gap: "10px" }}>
// // // // // // // // // // // //                             {uploadedReports[appt.id]?.map((r, i) => (
// // // // // // // // // // // //                               <img
// // // // // // // // // // // //                                 key={i}
// // // // // // // // // // // //                                 src={r}
// // // // // // // // // // // //                                 alt={`Report ${i + 1}`}
// // // // // // // // // // // //                                 style={{ width: 50, height: 50 }}
// // // // // // // // // // // //                               />
// // // // // // // // // // // //                             ))}
// // // // // // // // // // // //                           </div>
// // // // // // // // // // // //                         </>
// // // // // // // // // // // //                       )}
// // // // // // // // // // // //                     </td>
// // // // // // // // // // // //                     <td>
// // // // // // // // // // // //                       {appt.status !== "Accepted" && !appt.not_acceptable && (
// // // // // // // // // // // //                         <button
// // // // // // // // // // // //                           onClick={() =>
// // // // // // // // // // // //                             handleAcceptAppointment(appt.id, appt.appointment_id)
// // // // // // // // // // // //                           }
// // // // // // // // // // // //                         >
// // // // // // // // // // // //                           Accept
// // // // // // // // // // // //                         </button>
// // // // // // // // // // // //                       )}
// // // // // // // // // // // //                     </td>
// // // // // // // // // // // //                   </tr>
// // // // // // // // // // // //                 ))}
// // // // // // // // // // // //               </tbody>
// // // // // // // // // // // //             </table>
// // // // // // // // // // // //           </div>
// // // // // // // // // // // //         ) : (
// // // // // // // // // // // //           <div className="appointments-list">
// // // // // // // // // // // //             {appointments.map((appt) => (
// // // // // // // // // // // //               <div key={appt.id} className="appointment-card">
// // // // // // // // // // // //                 <h3>{appt.doctorName}</h3>
// // // // // // // // // // // //                 <p>Date: {appt.appointmentDate}</p>
// // // // // // // // // // // //                 <p>
// // // // // // // // // // // //                   Status:{" "}
// // // // // // // // // // // //                   <span className={`status-${appt.status.toLowerCase()}`}>
// // // // // // // // // // // //                     {appt.status}
// // // // // // // // // // // //                   </span>
// // // // // // // // // // // //                 </p>
// // // // // // // // // // // //                 <p>Time: {appt.timing || "Not selected"}</p>
// // // // // // // // // // // //                 {appt.meetingId !== "not yet decided" && (
// // // // // // // // // // // //                   <a
// // // // // // // // // // // //                     href={appt.meetingId}
// // // // // // // // // // // //                     target="_blank"
// // // // // // // // // // // //                     rel="noopener noreferrer"
// // // // // // // // // // // //                     className="join-meeting"
// // // // // // // // // // // //                   >
// // // // // // // // // // // //                     Join Meeting
// // // // // // // // // // // //                   </a>
// // // // // // // // // // // //                 )}
// // // // // // // // // // // //                 {appt.status === "Accepted" && (
// // // // // // // // // // // //                   <div className="upload-section">
// // // // // // // // // // // //                     <input
// // // // // // // // // // // //                       type="file"
// // // // // // // // // // // //                       multiple
// // // // // // // // // // // //                       onChange={(e) => handleFileChange(e, appt.id)}
// // // // // // // // // // // //                     />
// // // // // // // // // // // //                     <button onClick={() => handleUpload(appt.id)}>
// // // // // // // // // // // //                       Upload Reports
// // // // // // // // // // // //                     </button>
// // // // // // // // // // // //                   </div>
// // // // // // // // // // // //                 )}
// // // // // // // // // // // //                 {appt.status !== "Accepted" && !appt.not_acceptable && (
// // // // // // // // // // // //                   <button
// // // // // // // // // // // //                     onClick={() =>
// // // // // // // // // // // //                       handleAcceptAppointment(appt.id, appt.appointment_id)
// // // // // // // // // // // //                     }
// // // // // // // // // // // //                   >
// // // // // // // // // // // //                     Accept
// // // // // // // // // // // //                   </button>
// // // // // // // // // // // //                 )}
// // // // // // // // // // // //               </div>
// // // // // // // // // // // //             ))}
// // // // // // // // // // // //           </div>
// // // // // // // // // // // //         )}
// // // // // // // // // // // //       </div>
// // // // // // // // // // // //     </>
// // // // // // // // // // // //   );
// // // // // // // // // // // // };

// // // // // // // // // // // // export default Appointments;

// // // // // // // // // // // import React, { useState, useEffect } from "react";
// // // // // // // // // // // import { getAuth } from "firebase/auth";
// // // // // // // // // // // import {
// // // // // // // // // // //   getFirestore,
// // // // // // // // // // //   collection,
// // // // // // // // // // //   query,
// // // // // // // // // // //   where,
// // // // // // // // // // //   getDocs,
// // // // // // // // // // //   addDoc,
// // // // // // // // // // //   doc,
// // // // // // // // // // //   setDoc,
// // // // // // // // // // //   updateDoc,
// // // // // // // // // // // } from "firebase/firestore";
// // // // // // // // // // // import Navbar from "../Navbar";
// // // // // // // // // // // import { toast, ToastContainer } from "react-toastify";
// // // // // // // // // // // import "react-toastify/dist/ReactToastify.css";
// // // // // // // // // // // import "./appointment.css";

// // // // // // // // // // // const Appointments = () => {
// // // // // // // // // // //   const [appointments, setAppointments] = useState([]);
// // // // // // // // // // //   const [loading, setLoading] = useState(true);
// // // // // // // // // // //   const [selectedFiles, setSelectedFiles] = useState({});
// // // // // // // // // // //   const [uploadedReports, setUploadedReports] = useState({});
// // // // // // // // // // //   const [isMobile, setIsMobile] = useState(false);

// // // // // // // // // // //   const user = getAuth().currentUser;

// // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // //     setIsMobile(window.innerWidth <= 500);
// // // // // // // // // // //   }, []);

// // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // //     if (!user) return;
// // // // // // // // // // //     const db = getFirestore();
// // // // // // // // // // //     const appointmentsRef = collection(db, "appointments");
// // // // // // // // // // //     const q = query(appointmentsRef, where("patientId", "==", user.uid));

// // // // // // // // // // //     const fetchAppointments = async () => {
// // // // // // // // // // //       try {
// // // // // // // // // // //         const querySnapshot = await getDocs(q);
// // // // // // // // // // //         const appts = querySnapshot.docs.map((docSnap) => {
// // // // // // // // // // //           const data = docSnap.data();
// // // // // // // // // // //           return {
// // // // // // // // // // //             id: docSnap.id,
// // // // // // // // // // //             doctorName: data.DoctorName,
// // // // // // // // // // //             appointmentDate: data.appointmentDate,
// // // // // // // // // // //             status: data.status,
// // // // // // // // // // //             timing: data.appointmentTime || "",
// // // // // // // // // // //             meetingId: data.meetingId || "",
// // // // // // // // // // //             appointment_id: data.appointment_id,
// // // // // // // // // // //             not_acceptable: data.not_acceptable || false,
// // // // // // // // // // //           };
// // // // // // // // // // //         });

// // // // // // // // // // //         // Sort by appointment date
// // // // // // // // // // //         appts.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
// // // // // // // // // // //         setAppointments(appts);
// // // // // // // // // // //       } catch (error) {
// // // // // // // // // // //         console.error("Error fetching appointments:", error);
// // // // // // // // // // //       } finally {
// // // // // // // // // // //         setLoading(false);
// // // // // // // // // // //       }
// // // // // // // // // // //     };

// // // // // // // // // // //     fetchAppointments();
// // // // // // // // // // //   }, [user]);

// // // // // // // // // // //   const handleFileChange = (e, appointmentId) => {
// // // // // // // // // // //     const files = Array.from(e.target.files).map((file) => ({ file, base64: "" }));

// // // // // // // // // // //     setSelectedFiles((prev) => ({ ...prev, [appointmentId]: files }));

// // // // // // // // // // //     files.forEach((fileObj, index) => {
// // // // // // // // // // //       const reader = new FileReader();
// // // // // // // // // // //       reader.onloadend = () => {
// // // // // // // // // // //         files[index].base64 = reader.result;
// // // // // // // // // // //         setSelectedFiles((prev) => ({
// // // // // // // // // // //           ...prev,
// // // // // // // // // // //           [appointmentId]: [...files],
// // // // // // // // // // //         }));
// // // // // // // // // // //       };
// // // // // // // // // // //       reader.readAsDataURL(fileObj.file);
// // // // // // // // // // //     });
// // // // // // // // // // //   };

// // // // // // // // // // //   const handleUpload = async (appointmentId) => {
// // // // // // // // // // //     if (!selectedFiles[appointmentId]) return;

// // // // // // // // // // //     toast.success("Reports added!");

// // // // // // // // // // //     const db = getFirestore();
// // // // // // // // // // //     const reportsRef = collection(db, "consultationReports");

// // // // // // // // // // //     try {
// // // // // // // // // // //       const reportIds = await Promise.all(
// // // // // // // // // // //         selectedFiles[appointmentId].map(async (fileObj) => {
// // // // // // // // // // //           const docRef = await addDoc(reportsRef, {
// // // // // // // // // // //             appointmentId,
// // // // // // // // // // //             report: fileObj.base64,
// // // // // // // // // // //             createdAt: new Date(),
// // // // // // // // // // //           });
// // // // // // // // // // //           return docRef.id;
// // // // // // // // // // //         })
// // // // // // // // // // //       );

// // // // // // // // // // //       const appointmentDocRef = doc(db, "appointments", appointmentId);
// // // // // // // // // // //       await setDoc(appointmentDocRef, { reportIds }, { merge: true });

// // // // // // // // // // //       toast.success("Reports uploaded successfully.");
// // // // // // // // // // //     } catch (err) {
// // // // // // // // // // //       console.error("Error uploading reports:", err);
// // // // // // // // // // //     }
// // // // // // // // // // //   };

// // // // // // // // // // //   const fetchReports = async (appointmentId) => {
// // // // // // // // // // //     const db = getFirestore();
// // // // // // // // // // //     const q = query(collection(db, "consultationReports"), where("appointmentId", "==", appointmentId));
// // // // // // // // // // //     const snapshot = await getDocs(q);

// // // // // // // // // // //     const reports = snapshot.docs.map((doc) => doc.data().report);
// // // // // // // // // // //     setUploadedReports((prev) => ({ ...prev, [appointmentId]: reports }));
// // // // // // // // // // //   };

// // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // //     appointments.forEach((appt) => {
// // // // // // // // // // //       if (appt.status === "Accepted") {
// // // // // // // // // // //         fetchReports(appt.id);
// // // // // // // // // // //       }
// // // // // // // // // // //     });
// // // // // // // // // // //   }, [appointments]);

// // // // // // // // // // //   const handleAcceptAppointment = async (appointmentId, sharedId) => {
// // // // // // // // // // //     const db = getFirestore();
// // // // // // // // // // //     try {
// // // // // // // // // // //       await updateDoc(doc(db, "appointments", appointmentId), { not_acceptable: true });
// // // // // // // // // // //       setAppointments((prev) =>
// // // // // // // // // // //         prev.filter((appt) => appt.appointment_id === sharedId)
// // // // // // // // // // //       );
// // // // // // // // // // //     } catch (err) {
// // // // // // // // // // //       console.error("Failed to accept appointment:", err);
// // // // // // // // // // //     }
// // // // // // // // // // //   };

// // // // // // // // // // //   if (loading) return <div className="loading">Loading appointments...</div>;

// // // // // // // // // // //   const renderDesktopTable = () => (
// // // // // // // // // // //     <div className="table-container">
// // // // // // // // // // //       <table className="appointments-table">
// // // // // // // // // // //         <thead>
// // // // // // // // // // //           <tr>
// // // // // // // // // // //             <th>Doctor Name</th>
// // // // // // // // // // //             <th>Date</th>
// // // // // // // // // // //             <th>Status</th>
// // // // // // // // // // //             <th>Time</th>
// // // // // // // // // // //             <th>Meeting</th>
// // // // // // // // // // //             <th>Reports</th>
// // // // // // // // // // //             <th>Accept</th>
// // // // // // // // // // //           </tr>
// // // // // // // // // // //         </thead>
// // // // // // // // // // //         <tbody>
// // // // // // // // // // //           {appointments.map((appt) => (
// // // // // // // // // // //             <tr key={appt.id}>
// // // // // // // // // // //               <td>{appt.doctorName}</td>
// // // // // // // // // // //               <td>{appt.appointmentDate}</td>
// // // // // // // // // // //               <td className={`status-${appt.status.toLowerCase()}`}>{appt.status}</td>
// // // // // // // // // // //               <td>{appt.timing || "Not selected"}</td>
// // // // // // // // // // //               <td>
// // // // // // // // // // //                 {appt.meetingId && appt.meetingId !== "not yet decided" ? (
// // // // // // // // // // //                   <a href={appt.meetingId} target="_blank" rel="noopener noreferrer">
// // // // // // // // // // //                     Join
// // // // // // // // // // //                   </a>
// // // // // // // // // // //                 ) : (
// // // // // // // // // // //                   "Not decided"
// // // // // // // // // // //                 )}
// // // // // // // // // // //               </td>
// // // // // // // // // // //               <td>
// // // // // // // // // // //                 {appt.status === "Accepted" && (
// // // // // // // // // // //                   <>
// // // // // // // // // // //                     <input type="file" multiple onChange={(e) => handleFileChange(e, appt.id)} />
// // // // // // // // // // //                     <button onClick={() => handleUpload(appt.id)} disabled={!selectedFiles[appt.id]}>
// // // // // // // // // // //                       Upload
// // // // // // // // // // //                     </button>
// // // // // // // // // // //                     <div style={{ display: "flex", gap: 10 }}>
// // // // // // // // // // //                       {uploadedReports[appt.id]?.map((r, i) => (
// // // // // // // // // // //                         <img key={i} src={r} alt={`Report ${i + 1}`} style={{ width: 50, height: 50 }} />
// // // // // // // // // // //                       ))}
// // // // // // // // // // //                     </div>
// // // // // // // // // // //                   </>
// // // // // // // // // // //                 )}
// // // // // // // // // // //               </td>
// // // // // // // // // // //               <td>
// // // // // // // // // // //                 {appt.status !== "Accepted" && !appt.not_acceptable && (
// // // // // // // // // // //                   <button onClick={() => handleAcceptAppointment(appt.id, appt.appointment_id)}>
// // // // // // // // // // //                     Accept
// // // // // // // // // // //                   </button>
// // // // // // // // // // //                 )}
// // // // // // // // // // //               </td>
// // // // // // // // // // //             </tr>
// // // // // // // // // // //           ))}
// // // // // // // // // // //         </tbody>
// // // // // // // // // // //       </table>
// // // // // // // // // // //     </div>
// // // // // // // // // // //   );

// // // // // // // // // // //   const renderMobileCards = () => (
// // // // // // // // // // //     <div className="appointments-list">
// // // // // // // // // // //       {appointments.map((appt) => (
// // // // // // // // // // //         <div key={appt.id} className="appointment-card">
// // // // // // // // // // //           <h3>{appt.doctorName}</h3>
// // // // // // // // // // //           <p>Date: {appt.appointmentDate}</p>
// // // // // // // // // // //           <p>Status: <span className={`status-${appt.status.toLowerCase()}`}>{appt.status}</span></p>
// // // // // // // // // // //           <p>Time: {appt.timing || "Not selected"}</p>
// // // // // // // // // // //           {appt.meetingId !== "not yet decided" && (
// // // // // // // // // // //             <a href={appt.meetingId} target="_blank" rel="noopener noreferrer" className="join-meeting">
// // // // // // // // // // //               Join Meeting
// // // // // // // // // // //             </a>
// // // // // // // // // // //           )}
// // // // // // // // // // //           {appt.status === "Accepted" && (
// // // // // // // // // // //             <div className="upload-section">
// // // // // // // // // // //               <input type="file" multiple onChange={(e) => handleFileChange(e, appt.id)} />
// // // // // // // // // // //               <button onClick={() => handleUpload(appt.id)}>Upload Reports</button>
// // // // // // // // // // //               <div style={{ display: "flex", gap: 10 }}>
// // // // // // // // // // //                 {uploadedReports[appt.id]?.map((r, i) => (
// // // // // // // // // // //                   <img key={i} src={r} alt={`Report ${i + 1}`} style={{ width: 50, height: 50 }} />
// // // // // // // // // // //                 ))}
// // // // // // // // // // //               </div>
// // // // // // // // // // //             </div>
// // // // // // // // // // //           )}
// // // // // // // // // // //           {appt.status !== "Accepted" && !appt.not_acceptable && (
// // // // // // // // // // //             <button onClick={() => handleAcceptAppointment(appt.id, appt.appointment_id)}>
// // // // // // // // // // //               Accept
// // // // // // // // // // //             </button>
// // // // // // // // // // //           )}
// // // // // // // // // // //         </div>
// // // // // // // // // // //       ))}
// // // // // // // // // // //     </div>
// // // // // // // // // // //   );

// // // // // // // // // // //   return (
// // // // // // // // // // //     <>
// // // // // // // // // // //       <Navbar />
// // // // // // // // // // //       <ToastContainer />
// // // // // // // // // // //       <div className="appointments-container">
// // // // // // // // // // //         <h2>Your Appointments</h2>
// // // // // // // // // // //         {appointments.length === 0 ? (
// // // // // // // // // // //           <p className="no-appointments">You have no appointments.</p>
// // // // // // // // // // //         ) : isMobile ? renderMobileCards() : renderDesktopTable()}
// // // // // // // // // // //       </div>
// // // // // // // // // // //     </>
// // // // // // // // // // //   );
// // // // // // // // // // // };

// // // // // // // // // // // export default Appointments;

// // // // // // // // // // import React, { useState, useEffect } from "react";
// // // // // // // // // // import { getAuth } from "firebase/auth";

// // // // // // // // // // import {
// // // // // // // // // //   getFirestore,
// // // // // // // // // //   collection,
// // // // // // // // // //   query,
// // // // // // // // // //   where,
// // // // // // // // // //   getDocs,
// // // // // // // // // //   addDoc,
// // // // // // // // // //   doc,
// // // // // // // // // //   setDoc,
// // // // // // // // // //   updateDoc,
// // // // // // // // // // } from "firebase/firestore";
// // // // // // // // // // import Navbar from "../Navbar";
// // // // // // // // // // import { toast, ToastContainer } from "react-toastify";
// // // // // // // // // // import "react-toastify/dist/ReactToastify.css";
// // // // // // // // // // import "./appointment.css";

// // // // // // // // // // const Appointments = () => {
// // // // // // // // // //   const [appointments, setAppointments] = useState([]);
// // // // // // // // // //   const [loading, setLoading] = useState(true);
// // // // // // // // // //   const [selectedFiles, setSelectedFiles] = useState({});
// // // // // // // // // //   const [uploadedReports, setUploadedReports] = useState({});
// // // // // // // // // //   const [isMobile, setIsMobile] = useState(false);
// // // // // // // // // //   const user = getAuth().currentUser;

// // // // // // // // // //   useEffect(() => {
// // // // // // // // // //     setIsMobile(window.innerWidth <= 500);
// // // // // // // // // //   }, []);

// // // // // // // // // //   useEffect(() => {
// // // // // // // // // //     const fetchAppointments = async () => {
// // // // // // // // // //       if (!user) return;

// // // // // // // // // //       try {
// // // // // // // // // //         const db = getFirestore();
// // // // // // // // // //         const q = query(
// // // // // // // // // //           collection(db, "appointments"),
// // // // // // // // // //           where("patientId", "==", user.uid)
// // // // // // // // // //         );

// // // // // // // // // //         const snapshot = await getDocs(q);
// // // // // // // // // //         const userAppointments = snapshot.docs.map((docSnap) => {
// // // // // // // // // //           const data = docSnap.data();
// // // // // // // // // //           return {
// // // // // // // // // //             id: docSnap.id,
// // // // // // // // // //             doctorName: data.DoctorName,
// // // // // // // // // //             appointmentDate: data.appointmentDate,
// // // // // // // // // //             status: data.status,
// // // // // // // // // //             timing: data.appointmentTime || "Not selected",
// // // // // // // // // //             meetingId: data.meetingId || "Not yet decided",
// // // // // // // // // //             appointment_id: data.appointment_id,
// // // // // // // // // //             not_acceptable: data.not_acceptable || false,
// // // // // // // // // //           };
// // // // // // // // // //         });

// // // // // // // // // //         userAppointments.sort(
// // // // // // // // // //           (a, b) =>
// // // // // // // // // //             new Date(a.appointmentDate) - new Date(b.appointmentDate)
// // // // // // // // // //         );

// // // // // // // // // //         setAppointments(userAppointments);
// // // // // // // // // //       } catch (error) {
// // // // // // // // // //         console.error("Error fetching appointments:", error);
// // // // // // // // // //       } finally {
// // // // // // // // // //         setLoading(false);
// // // // // // // // // //       }
// // // // // // // // // //     };

// // // // // // // // // //     fetchAppointments();
// // // // // // // // // //   }, [user]);

// // // // // // // // // //   const handleFileChange = (e, appointmentId) => {
// // // // // // // // // //     const files = Array.from(e.target.files);
// // // // // // // // // //     const updatedFiles = files.map((file) => ({
// // // // // // // // // //       file,
// // // // // // // // // //       base64: "",
// // // // // // // // // //     }));

// // // // // // // // // //     setSelectedFiles((prev) => ({
// // // // // // // // // //       ...prev,
// // // // // // // // // //       [appointmentId]: updatedFiles,
// // // // // // // // // //     }));

// // // // // // // // // //     updatedFiles.forEach((fileObj, index) => {
// // // // // // // // // //       const reader = new FileReader();
// // // // // // // // // //       reader.onloadend = () => {
// // // // // // // // // //         updatedFiles[index].base64 = reader.result;
// // // // // // // // // //         setSelectedFiles((prev) => ({
// // // // // // // // // //           ...prev,
// // // // // // // // // //           [appointmentId]: [...updatedFiles],
// // // // // // // // // //         }));
// // // // // // // // // //       };
// // // // // // // // // //       reader.readAsDataURL(fileObj.file);
// // // // // // // // // //     });
// // // // // // // // // //   };

// // // // // // // // // //   const handleUpload = async (appointmentId) => {
// // // // // // // // // //     if (!selectedFiles[appointmentId]) return;

// // // // // // // // // //     const db = getFirestore();
// // // // // // // // // //     const reportsRef = collection(db, "consultationReports");

// // // // // // // // // //     try {
// // // // // // // // // //       await Promise.all(
// // // // // // // // // //         selectedFiles[appointmentId].map(async (fileObj) => {
// // // // // // // // // //           await addDoc(reportsRef, {
// // // // // // // // // //             appointmentId,
// // // // // // // // // //             report: fileObj.base64,
// // // // // // // // // //             createdAt: new Date(),
// // // // // // // // // //           });
// // // // // // // // // //         })
// // // // // // // // // //       );

// // // // // // // // // //       const appointmentDocRef = doc(db, "appointments", appointmentId);
// // // // // // // // // //       await setDoc(appointmentDocRef, { reportUploaded: true }, { merge: true });

// // // // // // // // // //       toast.success("Reports uploaded successfully!");
// // // // // // // // // //     } catch (error) {
// // // // // // // // // //       console.error("Error uploading reports:", error);
// // // // // // // // // //       toast.error("Failed to upload reports.");
// // // // // // // // // //     }
// // // // // // // // // //   };

// // // // // // // // // //   const fetchReports = async (appointmentId) => {
// // // // // // // // // //     const db = getFirestore();
// // // // // // // // // //     const q = query(
// // // // // // // // // //       collection(db, "consultationReports"),
// // // // // // // // // //       where("appointmentId", "==", appointmentId)
// // // // // // // // // //     );
// // // // // // // // // //     const snapshot = await getDocs(q);
// // // // // // // // // //     const reports = snapshot.docs.map((doc) => doc.data().report);
// // // // // // // // // //     setUploadedReports((prev) => ({ ...prev, [appointmentId]: reports }));
// // // // // // // // // //   };

// // // // // // // // // //   useEffect(() => {
// // // // // // // // // //     appointments.forEach((appt) => {
// // // // // // // // // //       if (appt.status === "Accepted") fetchReports(appt.id);
// // // // // // // // // //     });
// // // // // // // // // //   }, [appointments]);

// // // // // // // // // //   // const handleAcceptAppointment = async (appointmentId, sharedId) => {
// // // // // // // // // //   //   const db = getFirestore();
// // // // // // // // // //   //   try {
// // // // // // // // // //   //     await updateDoc(doc(db, "appointments", appointmentId), {
// // // // // // // // // //   //       not_acceptable: true,
// // // // // // // // // //   //     });

// // // // // // // // // //   //     // Remove all appointments with same appointment_id from UI
// // // // // // // // // //   //     const updated = appointments.filter(
// // // // // // // // // //   //       (appt) => appt.appointment_id !== sharedId
// // // // // // // // // //   //     );
// // // // // // // // // //   //     setAppointments(updated);
// // // // // // // // // //   //   } catch (error) {
// // // // // // // // // //   //     console.error("Error accepting appointment:", error);
// // // // // // // // // //   //   }
// // // // // // // // // //   // };
// // // // // // // // // //   // const handleAcceptAppointment = async (appointmentId, sharedId) => {
// // // // // // // // // //   //   const db = getFirestore();
// // // // // // // // // //   //   const appointmentRef = doc(db, "appointments", appointmentId);

// // // // // // // // // //   //   try {
// // // // // // // // // //   //     console.log("Updating appointment:", appointmentId);

// // // // // // // // // //   //     await updateDoc(appointmentRef, {
// // // // // // // // // //   //       not_acceptable: true,
// // // // // // // // // //   //     });

// // // // // // // // // //   //     console.log("Successfully set not_acceptable to true");

// // // // // // // // // //   //     // Remove other appointments with same appointment_id from UI
// // // // // // // // // //   //     const updated = appointments.filter(
// // // // // // // // // //   //       (appt) => appt.appointment_id !== sharedId
// // // // // // // // // //   //     );
// // // // // // // // // //   //     setAppointments(updated);

// // // // // // // // // //   //     toast.success("Appointment accepted successfully!");
// // // // // // // // // //   //   } catch (error) {
// // // // // // // // // //   //     console.error("Error updating appointment:", error);

// // // // // // // // // //   //     // Optional: Force add the field if update fails
// // // // // // // // // //   //     try {
// // // // // // // // // //   //       await setDoc(appointmentRef, { not_acceptable: true }, { merge: true });
// // // // // // // // // //   //       console.log("Fallback: Field added using setDoc");
// // // // // // // // // //   //     } catch (fallbackError) {
// // // // // // // // // //   //       console.error("Fallback setDoc also failed:", fallbackError);
// // // // // // // // // //   //     }
// // // // // // // // // //   //   }
// // // // // // // // // //   // };

// // // // // // // // // // const handleAcceptAppointment = async (appointmentId) => {
// // // // // // // // // //   const db = getFirestore();

// // // // // // // // // //   try {
// // // // // // // // // //     const appointmentRef = doc(db, "appointments", appointmentId);

// // // // // // // // // //     await updateDoc(appointmentRef, {
// // // // // // // // // //       not_acceptable: true,
// // // // // // // // // //     });

// // // // // // // // // //     toast.success("Appointment marked as accepted!");
// // // // // // // // // //   } catch (error) {
// // // // // // // // // //     console.error("Error updating appointment:", error);
// // // // // // // // // //     toast.error("Failed to accept the appointment.");
// // // // // // // // // //   }
// // // // // // // // // // };

// // // // // // // // // //   if (loading) return <div className="loading">Loading appointments...</div>;

// // // // // // // // // //   return (
// // // // // // // // // //     <>
// // // // // // // // // //       <Navbar />
// // // // // // // // // //       <ToastContainer />
// // // // // // // // // //       <div className="appointments-container">
// // // // // // // // // //         <h2>Your Appointments</h2>

// // // // // // // // // //         {appointments.length === 0 ? (
// // // // // // // // // //           <p className="no-appointments">You have no appointments.</p>
// // // // // // // // // //         ) : isMobile ? (
// // // // // // // // // //           <div className="appointments-list">
// // // // // // // // // //             {appointments.map((appt) => (
// // // // // // // // // //               <div key={appt.id} className="appointment-card">
// // // // // // // // // //                 <h3>{appt.doctorName}</h3>
// // // // // // // // // //                 <p>Date: {appt.appointmentDate}</p>
// // // // // // // // // //                 <p>Status: <span className={`status-${appt.status.toLowerCase()}`}>{appt.status}</span></p>
// // // // // // // // // //                 <p>Time: {appt.timing}</p>

// // // // // // // // // //                 {appt.meetingId !== "not yet decided" && (
// // // // // // // // // //                   <a href={appt.meetingId} target="_blank" rel="noopener noreferrer">Join Meeting</a>
// // // // // // // // // //                 )}

// // // // // // // // // //                 {appt.status === "Accepted" && (
// // // // // // // // // //                   <div>
// // // // // // // // // //                     <input
// // // // // // // // // //                       type="file"
// // // // // // // // // //                       multiple
// // // // // // // // // //                       onChange={(e) => handleFileChange(e, appt.id)}
// // // // // // // // // //                     />
// // // // // // // // // //                     <button onClick={() => handleUpload(appt.id)}>Upload Reports</button>
// // // // // // // // // //                     <div style={{ display: "flex", gap: "10px", marginTop: "5px" }}>
// // // // // // // // // //                       {uploadedReports[appt.id]?.map((r, i) => (
// // // // // // // // // //                         <img key={i} src={r} alt={`report-${i}`} width={50} height={50} />
// // // // // // // // // //                       ))}
// // // // // // // // // //                     </div>
// // // // // // // // // //                   </div>
// // // // // // // // // //                 )}

// // // // // // // // // //                 {appt.status !== "Accepted" && !appt.not_acceptable && (
// // // // // // // // // //                   <button
// // // // // // // // // //                     onClick={() =>
// // // // // // // // // //                       handleAcceptAppointment(appt.id, appt.appointment_id)
// // // // // // // // // //                     }
// // // // // // // // // //                   >
// // // // // // // // // //                     Accept
// // // // // // // // // //                   </button>
// // // // // // // // // //                 )}
// // // // // // // // // //               </div>
// // // // // // // // // //             ))}
// // // // // // // // // //           </div>
// // // // // // // // // //         ) : (
// // // // // // // // // //           <div className="table-container">
// // // // // // // // // //             <table className="appointments-table">
// // // // // // // // // //               <thead>
// // // // // // // // // //                 <tr>
// // // // // // // // // //                   <th>Doctor</th>
// // // // // // // // // //                   <th>Date</th>
// // // // // // // // // //                   <th>Status</th>
// // // // // // // // // //                   <th>Time</th>
// // // // // // // // // //                   <th>Meeting</th>
// // // // // // // // // //                   <th>Reports</th>
// // // // // // // // // //                   <th>Accept</th>
// // // // // // // // // //                 </tr>
// // // // // // // // // //               </thead>
// // // // // // // // // //               <tbody>
// // // // // // // // // //                 {appointments.map((appt) => (
// // // // // // // // // //                   <tr key={appt.id}>
// // // // // // // // // //                     <td>{appt.doctorName}</td>
// // // // // // // // // //                     <td>{appt.appointmentDate}</td>
// // // // // // // // // //                     <td className={`status-${appt.status.toLowerCase()}`}>{appt.status}</td>
// // // // // // // // // //                     <td>{appt.timing}</td>
// // // // // // // // // //                     <td>
// // // // // // // // // //                       {appt.meetingId !== "not yet decided" ? (
// // // // // // // // // //                         <a href={appt.meetingId} target="_blank" rel="noopener noreferrer">Join</a>
// // // // // // // // // //                       ) : (
// // // // // // // // // //                         "Not decided"
// // // // // // // // // //                       )}
// // // // // // // // // //                     </td>
// // // // // // // // // //                     <td>
// // // // // // // // // //                       {appt.status === "Accepted" && (
// // // // // // // // // //                         <>
// // // // // // // // // //                           <input
// // // // // // // // // //                             type="file"
// // // // // // // // // //                             multiple
// // // // // // // // // //                             onChange={(e) => handleFileChange(e, appt.id)}
// // // // // // // // // //                           />
// // // // // // // // // //                           <button
// // // // // // // // // //                             onClick={() => handleUpload(appt.id)}
// // // // // // // // // //                             disabled={!selectedFiles[appt.id]}
// // // // // // // // // //                           >
// // // // // // // // // //                             Upload
// // // // // // // // // //                           </button>
// // // // // // // // // //                           <div style={{ display: "flex", gap: "10px", marginTop: "5px" }}>
// // // // // // // // // //                             {uploadedReports[appt.id]?.map((r, i) => (
// // // // // // // // // //                               <img key={i} src={r} alt={`report-${i}`} width={50} height={50} />
// // // // // // // // // //                             ))}
// // // // // // // // // //                           </div>
// // // // // // // // // //                         </>
// // // // // // // // // //                       )}
// // // // // // // // // //                     </td>
// // // // // // // // // //                     <td>
// // // // // // // // // //                       {appt.status !== "Accepted" && !appt.not_acceptable && (
// // // // // // // // // //                         <button
// // // // // // // // // //                           onClick={() =>
// // // // // // // // // //                             handleAcceptAppointment(appt.id, appt.appointment_id)
// // // // // // // // // //                           }
// // // // // // // // // //                         >
// // // // // // // // // //                           Accept
// // // // // // // // // //                         </button>
// // // // // // // // // //                       )}
// // // // // // // // // //                     </td>
// // // // // // // // // //                   </tr>
// // // // // // // // // //                 ))}
// // // // // // // // // //               </tbody>
// // // // // // // // // //             </table>
// // // // // // // // // //           </div>
// // // // // // // // // //         )}
// // // // // // // // // //       </div>
// // // // // // // // // //     </>
// // // // // // // // // //   );
// // // // // // // // // // };

// // // // // // // // // // export default Appointments;

// // // // // // // // // import React, { useState, useEffect } from "react";
// // // // // // // // // import { getAuth } from "firebase/auth";
// // // // // // // // // import {
// // // // // // // // //   getFirestore,
// // // // // // // // //   collection,
// // // // // // // // //   query,
// // // // // // // // //   where,
// // // // // // // // //   getDocs,
// // // // // // // // //   addDoc,
// // // // // // // // //   doc,
// // // // // // // // //   setDoc,
// // // // // // // // //   deleteDoc,
// // // // // // // // //   updateDoc,
// // // // // // // // // } from "firebase/firestore";
// // // // // // // // // import Navbar from "../Navbar";
// // // // // // // // // import { toast, ToastContainer } from "react-toastify";
// // // // // // // // // import "react-toastify/dist/ReactToastify.css";
// // // // // // // // // import "./appointment.css";

// // // // // // // // // const Appointments = () => {
// // // // // // // // //   const [appointments, setAppointments] = useState([]);
// // // // // // // // //   const [loading, setLoading] = useState(true);
// // // // // // // // //   const [selectedFiles, setSelectedFiles] = useState({});
// // // // // // // // //   const [uploadedReports, setUploadedReports] = useState({});
// // // // // // // // //   const [isMobile, setIsMobile] = useState(false);
// // // // // // // // //   const user = getAuth().currentUser;

// // // // // // // // //   useEffect(() => {
// // // // // // // // //     setIsMobile(window.innerWidth <= 500);
// // // // // // // // //   }, []);

// // // // // // // // //   useEffect(() => {
// // // // // // // // //     const fetchAppointments = async () => {
// // // // // // // // //       if (!user) return;
// // // // // // // // //       try {
// // // // // // // // //         const db = getFirestore();
// // // // // // // // //         const q = query(
// // // // // // // // //           collection(db, "appointments"),
// // // // // // // // //           where("patientId", "==", user.uid)
// // // // // // // // //         );
// // // // // // // // //         const snapshot = await getDocs(q);
// // // // // // // // //         const userAppointments = snapshot.docs.map((docSnap) => {
// // // // // // // // //           const data = docSnap.data();
// // // // // // // // //           return {
// // // // // // // // //             id: docSnap.id,
// // // // // // // // //             doctorName: data.DoctorName,
// // // // // // // // //             appointmentDate: data.appointmentDate,
// // // // // // // // //             status: data.status,
// // // // // // // // //             timing: data.appointmentTime || "Not selected",
// // // // // // // // //             meetingId: data.meetingId || "Not yet decided",
// // // // // // // // //             appointment_id: data.appointment_id,
// // // // // // // // //             not_acceptable: data.not_acceptable || false,
// // // // // // // // //           };
// // // // // // // // //         });

// // // // // // // // //         userAppointments.sort(
// // // // // // // // //           (a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate)
// // // // // // // // //         );

// // // // // // // // //         setAppointments(userAppointments);
// // // // // // // // //       } catch (error) {
// // // // // // // // //         console.error("Error fetching appointments:", error);
// // // // // // // // //       } finally {
// // // // // // // // //         setLoading(false);
// // // // // // // // //       }
// // // // // // // // //     };

// // // // // // // // //     fetchAppointments();
// // // // // // // // //   }, [user]);

// // // // // // // // //   const handleFileChange = (e, appointmentId) => {
// // // // // // // // //     const files = Array.from(e.target.files);
// // // // // // // // //     const updatedFiles = files.map((file) => ({ file, base64: "" }));

// // // // // // // // //     setSelectedFiles((prev) => ({
// // // // // // // // //       ...prev,
// // // // // // // // //       [appointmentId]: updatedFiles,
// // // // // // // // //     }));

// // // // // // // // //     updatedFiles.forEach((fileObj, index) => {
// // // // // // // // //       const reader = new FileReader();
// // // // // // // // //       reader.onloadend = () => {
// // // // // // // // //         updatedFiles[index].base64 = reader.result;
// // // // // // // // //         setSelectedFiles((prev) => ({
// // // // // // // // //           ...prev,
// // // // // // // // //           [appointmentId]: [...updatedFiles],
// // // // // // // // //         }));
// // // // // // // // //       };
// // // // // // // // //       reader.readAsDataURL(fileObj.file);
// // // // // // // // //     });
// // // // // // // // //   };

// // // // // // // // //   const handleUpload = async (appointmentId) => {
// // // // // // // // //     if (!selectedFiles[appointmentId]) return;

// // // // // // // // //     const db = getFirestore();
// // // // // // // // //     const reportsRef = collection(db, "consultationReports");

// // // // // // // // //     try {
// // // // // // // // //       await Promise.all(
// // // // // // // // //         selectedFiles[appointmentId].map(async (fileObj) => {
// // // // // // // // //           await addDoc(reportsRef, {
// // // // // // // // //             appointmentId,
// // // // // // // // //             report: fileObj.base64,
// // // // // // // // //             createdAt: new Date(),
// // // // // // // // //           });
// // // // // // // // //         })
// // // // // // // // //       );

// // // // // // // // //       const appointmentDocRef = doc(db, "appointments", appointmentId);
// // // // // // // // //       await setDoc(appointmentDocRef, { reportUploaded: true }, { merge: true });

// // // // // // // // //       toast.success("Reports uploaded successfully!");
// // // // // // // // //     } catch (error) {
// // // // // // // // //       console.error("Error uploading reports:", error);
// // // // // // // // //       toast.error("Failed to upload reports.");
// // // // // // // // //     }
// // // // // // // // //   };

// // // // // // // // //   const fetchReports = async (appointmentId) => {
// // // // // // // // //     const db = getFirestore();
// // // // // // // // //     const q = query(
// // // // // // // // //       collection(db, "consultationReports"),
// // // // // // // // //       where("appointmentId", "==", appointmentId)
// // // // // // // // //     );
// // // // // // // // //     const snapshot = await getDocs(q);
// // // // // // // // //     const reports = snapshot.docs.map((doc) => doc.data().report);
// // // // // // // // //     setUploadedReports((prev) => ({ ...prev, [appointmentId]: reports }));
// // // // // // // // //   };

// // // // // // // // //   useEffect(() => {
// // // // // // // // //     appointments.forEach((appt) => {
// // // // // // // // //       if (appt.status === "Accepted") fetchReports(appt.id);
// // // // // // // // //     });
// // // // // // // // //   }, [appointments]);

// // // // // // // // //   const handleAcceptAppointment = async (appointmentId, sharedId) => {
// // // // // // // // //     const db = getFirestore();

// // // // // // // // //     try {
// // // // // // // // //       // 1. Mark this appointment as accepted and not_acceptable
// // // // // // // // //       const appointmentRef = doc(db, "appointments", appointmentId);
// // // // // // // // //       await updateDoc(appointmentRef, {
// // // // // // // // //         status: "Accepted",
// // // // // // // // //         not_acceptable: true,
// // // // // // // // //       });

// // // // // // // // //       // 2. Query and delete other appointments with same appointment_id
// // // // // // // // //       const q = query(
// // // // // // // // //         collection(db, "appointments"),
// // // // // // // // //         where("appointment_id", "==", sharedId)
// // // // // // // // //       );
// // // // // // // // //       const snapshot = await getDocs(q);
// // // // // // // // //       const deletions = snapshot.docs.map((docSnap) => {
// // // // // // // // //         if (docSnap.id !== appointmentId) {
// // // // // // // // //           return deleteDoc(doc(db, "appointments", docSnap.id));
// // // // // // // // //         }
// // // // // // // // //         return null;
// // // // // // // // //       });

// // // // // // // // //       await Promise.all(deletions);

// // // // // // // // //       toast.success("Appointment accepted successfully!");

// // // // // // // // //       // 3. Update local state
// // // // // // // // //       setAppointments((prev) =>
// // // // // // // // //         prev.filter((appt) => appt.appointment_id === sharedId && appt.id === appointmentId)
// // // // // // // // //       );
// // // // // // // // //     } catch (error) {
// // // // // // // // //       console.error("Error accepting appointment:", error);
// // // // // // // // //       toast.error("Failed to accept the appointment.");
// // // // // // // // //     }
// // // // // // // // //   };

// // // // // // // // //   if (loading) return <div className="loading">Loading appointments...</div>;

// // // // // // // // //   return (
// // // // // // // // //     <>
// // // // // // // // //       <Navbar />
// // // // // // // // //       <ToastContainer />
// // // // // // // // //       <div className="appointments-container">
// // // // // // // // //         <h2>Your Appointments</h2>

// // // // // // // // //         {appointments.length === 0 ? (
// // // // // // // // //           <p className="no-appointments">You have no appointments.</p>
// // // // // // // // //         ) : isMobile ? (
// // // // // // // // //           <div className="appointments-list">
// // // // // // // // //             {appointments.map((appt) => (
// // // // // // // // //               <div key={appt.id} className="appointment-card">
// // // // // // // // //                 <h3>{appt.doctorName}</h3>
// // // // // // // // //                 <p>Date: {appt.appointmentDate}</p>
// // // // // // // // //                 <p>
// // // // // // // // //                   Status:{" "}
// // // // // // // // //                   <span className={`status-${appt.status.toLowerCase()}`}>
// // // // // // // // //                     {appt.status}
// // // // // // // // //                   </span>
// // // // // // // // //                 </p>
// // // // // // // // //                 <p>Time: {appt.timing}</p>

// // // // // // // // //                 {appt.meetingId !== "not yet decided" && (
// // // // // // // // //                   <a href={appt.meetingId} target="_blank" rel="noopener noreferrer">
// // // // // // // // //                     Join Meeting
// // // // // // // // //                   </a>
// // // // // // // // //                 )}

// // // // // // // // //                 {appt.status === "Accepted" && (
// // // // // // // // //                   <div>
// // // // // // // // //                     <input
// // // // // // // // //                       type="file"
// // // // // // // // //                       multiple
// // // // // // // // //                       onChange={(e) => handleFileChange(e, appt.id)}
// // // // // // // // //                     />
// // // // // // // // //                     <button onClick={() => handleUpload(appt.id)}>Upload Reports</button>
// // // // // // // // //                     <div style={{ display: "flex", gap: "10px", marginTop: "5px" }}>
// // // // // // // // //                       {uploadedReports[appt.id]?.map((r, i) => (
// // // // // // // // //                         <img key={i} src={r} alt={`report-${i}`} width={50} height={50} />
// // // // // // // // //                       ))}
// // // // // // // // //                     </div>
// // // // // // // // //                   </div>
// // // // // // // // //                 )}

// // // // // // // // //                 {appt.status !== "Accepted" && !appt.not_acceptable && (
// // // // // // // // //                   <button
// // // // // // // // //                     onClick={() =>
// // // // // // // // //                       handleAcceptAppointment(appt.id, appt.appointment_id)
// // // // // // // // //                     }
// // // // // // // // //                   >
// // // // // // // // //                     Accept
// // // // // // // // //                   </button>
// // // // // // // // //                 )}
// // // // // // // // //               </div>
// // // // // // // // //             ))}
// // // // // // // // //           </div>
// // // // // // // // //         ) : (
// // // // // // // // //           <div className="table-container">
// // // // // // // // //             <table className="appointments-table">
// // // // // // // // //               <thead>
// // // // // // // // //                 <tr>
// // // // // // // // //                   <th>Doctor</th>
// // // // // // // // //                   <th>Date</th>
// // // // // // // // //                   <th>Status</th>
// // // // // // // // //                   <th>Time</th>
// // // // // // // // //                   <th>Meeting</th>
// // // // // // // // //                   <th>Reports</th>
// // // // // // // // //                   <th>Accept</th>
// // // // // // // // //                 </tr>
// // // // // // // // //               </thead>
// // // // // // // // //               <tbody>
// // // // // // // // //                 {appointments.map((appt) => (
// // // // // // // // //                   <tr key={appt.id}>
// // // // // // // // //                     <td>{appt.doctorName}</td>
// // // // // // // // //                     <td>{appt.appointmentDate}</td>
// // // // // // // // //                     <td className={`status-${appt.status.toLowerCase()}`}>{appt.status}</td>
// // // // // // // // //                     <td>{appt.timing}</td>
// // // // // // // // //                     <td>
// // // // // // // // //                       {appt.meetingId !== "not yet decided" ? (
// // // // // // // // //                         <a href={appt.meetingId} target="_blank" rel="noopener noreferrer">
// // // // // // // // //                           Join
// // // // // // // // //                         </a>
// // // // // // // // //                       ) : (
// // // // // // // // //                         "Not decided"
// // // // // // // // //                       )}
// // // // // // // // //                     </td>
// // // // // // // // //                     <td>
// // // // // // // // //                       {appt.status === "Accepted" && (
// // // // // // // // //                         <>
// // // // // // // // //                           <input
// // // // // // // // //                             type="file"
// // // // // // // // //                             multiple
// // // // // // // // //                             onChange={(e) => handleFileChange(e, appt.id)}
// // // // // // // // //                           />
// // // // // // // // //                           <button
// // // // // // // // //                             onClick={() => handleUpload(appt.id)}
// // // // // // // // //                             disabled={!selectedFiles[appt.id]}
// // // // // // // // //                           >
// // // // // // // // //                             Upload
// // // // // // // // //                           </button>
// // // // // // // // //                           <div style={{ display: "flex", gap: "10px", marginTop: "5px" }}>
// // // // // // // // //                             {uploadedReports[appt.id]?.map((r, i) => (
// // // // // // // // //                               <img key={i} src={r} alt={`report-${i}`} width={50} height={50} />
// // // // // // // // //                             ))}
// // // // // // // // //                           </div>
// // // // // // // // //                         </>
// // // // // // // // //                       )}
// // // // // // // // //                     </td>
// // // // // // // // //                     <td>
// // // // // // // // //                       {appt.status !== "Accepted" && !appt.not_acceptable && (
// // // // // // // // //                         <button
// // // // // // // // //                           onClick={() =>
// // // // // // // // //                             handleAcceptAppointment(appt.id, appt.appointment_id)
// // // // // // // // //                           }
// // // // // // // // //                         >
// // // // // // // // //                           Accept
// // // // // // // // //                         </button>
// // // // // // // // //                       )}
// // // // // // // // //                     </td>
// // // // // // // // //                   </tr>
// // // // // // // // //                 ))}
// // // // // // // // //               </tbody>
// // // // // // // // //             </table>
// // // // // // // // //           </div>
// // // // // // // // //         )}
// // // // // // // // //       </div>
// // // // // // // // //     </>
// // // // // // // // //   );
// // // // // // // // // };

// // // // // // // // // export default Appointments;

// // // // // // // // // All imports remain the same
// // // // // // // // import React, { useState, useEffect } from "react";
// // // // // // // // import { getAuth } from "firebase/auth";
// // // // // // // // import {
// // // // // // // //   getFirestore,
// // // // // // // //   collection,
// // // // // // // //   query,
// // // // // // // //   where,
// // // // // // // //   getDocs,
// // // // // // // //   addDoc,
// // // // // // // //   doc,
// // // // // // // //   setDoc,
// // // // // // // //   deleteDoc,
// // // // // // // //   updateDoc,
// // // // // // // // } from "firebase/firestore";
// // // // // // // // import Navbar from "../Navbar";
// // // // // // // // import { toast, ToastContainer } from "react-toastify";
// // // // // // // // import "react-toastify/dist/ReactToastify.css";
// // // // // // // // import "./appointment.css";

// // // // // // // // const Appointments = () => {
// // // // // // // //   const [appointments, setAppointments] = useState([]);
// // // // // // // //   const [loading, setLoading] = useState(true);
// // // // // // // //   const [selectedFiles, setSelectedFiles] = useState({});
// // // // // // // //   const [uploadedReports, setUploadedReports] = useState({});
// // // // // // // //   const [isMobile, setIsMobile] = useState(false);
// // // // // // // //   const user = getAuth().currentUser;

// // // // // // // //   useEffect(() => {
// // // // // // // //     setIsMobile(window.innerWidth <= 500);
// // // // // // // //   }, []);

// // // // // // // //   useEffect(() => {
// // // // // // // //     const fetchAppointments = async () => {
// // // // // // // //       if (!user) return;
// // // // // // // //       try {
// // // // // // // //         const db = getFirestore();
// // // // // // // //         const q = query(
// // // // // // // //           collection(db, "appointments"),
// // // // // // // //           where("patientId", "==", user.uid)
// // // // // // // //         );
// // // // // // // //         const snapshot = await getDocs(q);
// // // // // // // //         const userAppointments = snapshot.docs.map((docSnap) => {
// // // // // // // //           const data = docSnap.data();
// // // // // // // //           return {
// // // // // // // //             id: docSnap.id,
// // // // // // // //             doctorName: data.DoctorName,
// // // // // // // //             appointmentDate: data.appointmentDate,
// // // // // // // //             status: data.status,
// // // // // // // //             timing: data.appointmentTime || "Not selected",
// // // // // // // //             meetingId: data.meetingId || "Not yet decided",
// // // // // // // //             appointment_id: data.appointment_id,
// // // // // // // //             not_acceptable: data.not_acceptable || false,
// // // // // // // //           };
// // // // // // // //         });

// // // // // // // //         userAppointments.sort(
// // // // // // // //           (a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate)
// // // // // // // //         );

// // // // // // // //         setAppointments(userAppointments);
// // // // // // // //       } catch (error) {
// // // // // // // //         console.error("Error fetching appointments:", error);
// // // // // // // //       } finally {
// // // // // // // //         setLoading(false);
// // // // // // // //       }
// // // // // // // //     };

// // // // // // // //     fetchAppointments();
// // // // // // // //   }, [user]);

// // // // // // // //   const handleFileChange = (e, appointmentId) => {
// // // // // // // //     const files = Array.from(e.target.files);
// // // // // // // //     const updatedFiles = files.map((file) => ({ file, base64: "" }));

// // // // // // // //     setSelectedFiles((prev) => ({
// // // // // // // //       ...prev,
// // // // // // // //       [appointmentId]: updatedFiles,
// // // // // // // //     }));

// // // // // // // //     updatedFiles.forEach((fileObj, index) => {
// // // // // // // //       const reader = new FileReader();
// // // // // // // //       reader.onloadend = () => {
// // // // // // // //         updatedFiles[index].base64 = reader.result;
// // // // // // // //         setSelectedFiles((prev) => ({
// // // // // // // //           ...prev,
// // // // // // // //           [appointmentId]: [...updatedFiles],
// // // // // // // //         }));
// // // // // // // //       };
// // // // // // // //       reader.readAsDataURL(fileObj.file);
// // // // // // // //     });
// // // // // // // //   };

// // // // // // // //   const handleUpload = async (appointmentId) => {
// // // // // // // //     if (!selectedFiles[appointmentId]) return;

// // // // // // // //     const db = getFirestore();
// // // // // // // //     const reportsRef = collection(db, "consultationReports");

// // // // // // // //     try {
// // // // // // // //       await Promise.all(
// // // // // // // //         selectedFiles[appointmentId].map(async (fileObj) => {
// // // // // // // //           await addDoc(reportsRef, {
// // // // // // // //             appointmentId,
// // // // // // // //             report: fileObj.base64,
// // // // // // // //             createdAt: new Date(),
// // // // // // // //           });
// // // // // // // //         })
// // // // // // // //       );

// // // // // // // //       const appointmentDocRef = doc(db, "appointments", appointmentId);
// // // // // // // //       await setDoc(appointmentDocRef, { reportUploaded: true }, { merge: true });

// // // // // // // //       toast.success("Reports uploaded successfully!");
// // // // // // // //     } catch (error) {
// // // // // // // //       console.error("Error uploading reports:", error);
// // // // // // // //       toast.error("Failed to upload reports.");
// // // // // // // //     }
// // // // // // // //   };

// // // // // // // //   const fetchReports = async (appointmentId) => {
// // // // // // // //     const db = getFirestore();
// // // // // // // //     const q = query(
// // // // // // // //       collection(db, "consultationReports"),
// // // // // // // //       where("appointmentId", "==", appointmentId)
// // // // // // // //     );
// // // // // // // //     const snapshot = await getDocs(q);
// // // // // // // //     const reports = snapshot.docs.map((doc) => doc.data().report);
// // // // // // // //     setUploadedReports((prev) => ({ ...prev, [appointmentId]: reports }));
// // // // // // // //   };

// // // // // // // //   useEffect(() => {
// // // // // // // //     appointments.forEach((appt) => {
// // // // // // // //       if (appt.status === "Accepted") fetchReports(appt.id);
// // // // // // // //     });
// // // // // // // //   }, [appointments]);

// // // // // // // //   const handleAcceptAppointment = async (appointmentId, sharedId) => {
// // // // // // // //     const db = getFirestore();

// // // // // // // //     try {
// // // // // // // //       const appointmentRef = doc(db, "appointments", appointmentId);

// // // // // // // //       // ✅ Update selected appointment: status + not_acceptable
// // // // // // // //       await updateDoc(appointmentRef, {
// // // // // // // //         status: "Accepted",
// // // // // // // //         not_acceptable: true,
// // // // // // // //       });

// // // // // // // //       // ✅ Fetch all with same shared appointment_id
// // // // // // // //       const q = query(
// // // // // // // //         collection(db, "appointments"),
// // // // // // // //         where("appointment_id", "==", sharedId)
// // // // // // // //       );
// // // // // // // //       const snapshot = await getDocs(q);

// // // // // // // //       // ✅ Delete other appointments (not the accepted one)
// // // // // // // //       const deletions = snapshot.docs
// // // // // // // //         .filter((docSnap) => docSnap.id !== appointmentId)
// // // // // // // //         .map((docSnap) => deleteDoc(doc(db, "appointments", docSnap.id)));

// // // // // // // //       await Promise.all(deletions);

// // // // // // // //       toast.success("Appointment accepted successfully!");

// // // // // // // //       // ✅ Update state to show only accepted appointment
// // // // // // // //       setAppointments((prev) =>
// // // // // // // //         prev.filter(
// // // // // // // //           (appt) =>
// // // // // // // //             appt.appointment_id === sharedId && appt.id === appointmentId
// // // // // // // //         )
// // // // // // // //       );
// // // // // // // //     } catch (error) {
// // // // // // // //       console.error("Error accepting appointment:", error);
// // // // // // // //       toast.error("Failed to accept the appointment.");
// // // // // // // //     }
// // // // // // // //   };

// // // // // // // //   if (loading) return <div className="loading">Loading appointments...</div>;

// // // // // // // //   // ✨ UI remains unchanged from your code above
// // // // // // // //   // (Feel free to keep or tweak the rendering structure)

// // // // // // // //   return (
// // // // // // // //     <>
// // // // // // // //       <Navbar />
// // // // // // // //       <ToastContainer />
// // // // // // // //       {/* Render logic remains the same, shortened for brevity */}
// // // // // // // //     </>
// // // // // // // //   );
// // // // // // // // };

// // // // // // // // export default Appointments;

// // // // // // // import React, { useState, useEffect } from "react";
// // // // // // // import { getAuth } from "firebase/auth";
// // // // // // // import {
// // // // // // //   getFirestore,
// // // // // // //   collection,
// // // // // // //   query,
// // // // // // //   where,
// // // // // // //   getDocs,
// // // // // // //   addDoc,
// // // // // // //   doc,
// // // // // // //   setDoc,
// // // // // // //   deleteDoc,
// // // // // // //   updateDoc,
// // // // // // // } from "firebase/firestore";
// // // // // // // import Navbar from "../Navbar";
// // // // // // // import { toast, ToastContainer } from "react-toastify";
// // // // // // // import "react-toastify/dist/ReactToastify.css";
// // // // // // // import "./appointment.css";

// // // // // // // const Appointments = () => {
// // // // // // //   const [appointments, setAppointments] = useState([]);
// // // // // // //   const [loading, setLoading] = useState(true);
// // // // // // //   const [selectedFiles, setSelectedFiles] = useState({});
// // // // // // //   const [uploadedReports, setUploadedReports] = useState({});
// // // // // // //   const [isMobile, setIsMobile] = useState(false);
// // // // // // //   const user = getAuth().currentUser;

// // // // // // //   useEffect(() => {
// // // // // // //     setIsMobile(window.innerWidth <= 500);
// // // // // // //   }, []);

// // // // // // //   useEffect(() => {
// // // // // // //     const fetchAppointments = async () => {
// // // // // // //       if (!user) return;
// // // // // // //       try {
// // // // // // //         const db = getFirestore();
// // // // // // //         const q = query(
// // // // // // //           collection(db, "appointments"),
// // // // // // //           where("patientId", "==", user.uid)
// // // // // // //         );
// // // // // // //         const snapshot = await getDocs(q);
// // // // // // //         const userAppointments = snapshot.docs.map((docSnap) => {
// // // // // // //           const data = docSnap.data();
// // // // // // //           return {
// // // // // // //             id: docSnap.id,
// // // // // // //             doctorName: data.DoctorName,
// // // // // // //             appointmentDate: data.appointmentDate,
// // // // // // //             status: data.status,
// // // // // // //             timing: data.appointmentTime || "Not selected",
// // // // // // //             meetingId: data.meetingId || "Not yet decided",
// // // // // // //             appointment_id: data.appointment_id,
// // // // // // //             not_acceptable: data.not_acceptable || false,
// // // // // // //           };
// // // // // // //         });

// // // // // // //         userAppointments.sort(
// // // // // // //           (a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate)
// // // // // // //         );

// // // // // // //         setAppointments(userAppointments);
// // // // // // //       } catch (error) {
// // // // // // //         console.error("Error fetching appointments:", error);
// // // // // // //       } finally {
// // // // // // //         setLoading(false);
// // // // // // //       }
// // // // // // //     };

// // // // // // //     fetchAppointments();
// // // // // // //   }, [user]);

// // // // // // //   const handleFileChange = (e, appointmentId) => {
// // // // // // //     const files = Array.from(e.target.files);
// // // // // // //     const updatedFiles = files.map((file) => ({ file, base64: "" }));

// // // // // // //     setSelectedFiles((prev) => ({
// // // // // // //       ...prev,
// // // // // // //       [appointmentId]: updatedFiles,
// // // // // // //     }));

// // // // // // //     updatedFiles.forEach((fileObj, index) => {
// // // // // // //       const reader = new FileReader();
// // // // // // //       reader.onloadend = () => {
// // // // // // //         updatedFiles[index].base64 = reader.result;
// // // // // // //         setSelectedFiles((prev) => ({
// // // // // // //           ...prev,
// // // // // // //           [appointmentId]: [...updatedFiles],
// // // // // // //         }));
// // // // // // //       };
// // // // // // //       reader.readAsDataURL(fileObj.file);
// // // // // // //     });
// // // // // // //   };

// // // // // // //   const handleUpload = async (appointmentId) => {
// // // // // // //     if (!selectedFiles[appointmentId]) return;

// // // // // // //     const db = getFirestore();
// // // // // // //     const reportsRef = collection(db, "consultationReports");

// // // // // // //     try {
// // // // // // //       await Promise.all(
// // // // // // //         selectedFiles[appointmentId].map(async (fileObj) => {
// // // // // // //           await addDoc(reportsRef, {
// // // // // // //             appointmentId,
// // // // // // //             report: fileObj.base64,
// // // // // // //             createdAt: new Date(),
// // // // // // //           });
// // // // // // //         })
// // // // // // //       );

// // // // // // //       const appointmentDocRef = doc(db, "appointments", appointmentId);
// // // // // // //       await setDoc(appointmentDocRef, { reportUploaded: true }, { merge: true });

// // // // // // //       toast.success("Reports uploaded successfully!");
// // // // // // //     } catch (error) {
// // // // // // //       console.error("Error uploading reports:", error);
// // // // // // //       toast.error("Failed to upload reports.");
// // // // // // //     }
// // // // // // //   };

// // // // // // //   const fetchReports = async (appointmentId) => {
// // // // // // //     const db = getFirestore();
// // // // // // //     const q = query(
// // // // // // //       collection(db, "consultationReports"),
// // // // // // //       where("appointmentId", "==", appointmentId)
// // // // // // //     );
// // // // // // //     const snapshot = await getDocs(q);
// // // // // // //     const reports = snapshot.docs.map((doc) => doc.data().report);
// // // // // // //     setUploadedReports((prev) => ({ ...prev, [appointmentId]: reports }));
// // // // // // //   };

// // // // // // //   useEffect(() => {
// // // // // // //     appointments.forEach((appt) => {
// // // // // // //       if (appt.status === "Accepted") fetchReports(appt.id);
// // // // // // //     });
// // // // // // //   }, [appointments]);

// // // // // // //   const handleAcceptAppointment = async (appointmentId, sharedId) => {

// // // // // // //     const db = getFirestore();

// // // // // // //     try {
// // // // // // //       const appointmentRef = doc(db, "appointments", appointmentId);
// // // // // // //       console.log("Updating appointment:", appointmentId);

// // // // // // //       // Update selected appointment: status + not_acceptable
// // // // // // //       await updateDoc(appointmentRef, {
// // // // // // //         not_acceptable: true,
// // // // // // //         status: "Accepted",
// // // // // // //       });

// // // // // // //       console.log("Update successful");

// // // // // // //       // Fetch all with the same shared appointment_id
// // // // // // //       const q = query(
// // // // // // //         collection(db, "appointments"),
// // // // // // //         where("appointment_id", "==", sharedId)
// // // // // // //       );
// // // // // // //       const snapshot = await getDocs(q);

// // // // // // //       // Delete other appointments (not the accepted one)
// // // // // // //       const deletions = snapshot.docs
// // // // // // //         .filter((docSnap) => docSnap.id !== appointmentId)
// // // // // // //         .map((docSnap) => deleteDoc(doc(db, "appointments", docSnap.id)));

// // // // // // //       await Promise.all(deletions);

// // // // // // //       toast.success("Appointment accepted successfully!");

// // // // // // //       // Update state to show only the accepted appointment with not_acceptable: true
// // // // // // //       setAppointments((prevAppointments) =>
// // // // // // //         prevAppointments
// // // // // // //           .map((appt) => {
// // // // // // //             if (appt.id === appointmentId) {
// // // // // // //               return { ...appt, status: "Accept", not_acceptable: true };
// // // // // // //             }
// // // // // // //             return appt;
// // // // // // //           })
// // // // // // //           .filter((appt) => appt.appointment_id === sharedId)
// // // // // // //       );
// // // // // // //     } catch (error) {
// // // // // // //       console.error("Error accepting appointment:", error);
// // // // // // //       toast.error("Failed to accept the appointment.");
// // // // // // //     }
// // // // // // //   };

// // // // // // //   if (loading) return <div className="loading">Loading appointments...</div>;

// // // // // // //   return (
// // // // // // //     <>
// // // // // // //       <Navbar />
// // // // // // //       <ToastContainer />
// // // // // // //       <div className="appointments-container">
// // // // // // //         <h2>Your Appointments</h2>
// // // // // // //         {appointments.length === 0 ? (
// // // // // // //           <p>No appointments found.</p>
// // // // // // //         ) : (
// // // // // // //           appointments.map((appointment) => (
// // // // // // //             <div key={appointment.id} className="appointment-card">
// // // // // // //               <h3>{appointment.doctorName}</h3>
// // // // // // //               <p>Date: {appointment.appointmentDate}</p>
// // // // // // //               <p>Time: {appointment.timing}</p>
// // // // // // //               <p>Status: {appointment.status}</p>
// // // // // // //               <p>Meeting ID: {appointment.meetingId}</p>

// // // // // // //               {appointment.status === "Pending" && !appointment.not_acceptable && (
// // // // // // //                 <button
// // // // // // //                   className="accept-button"
// // // // // // //                   onClick={() =>
// // // // // // //                     handleAcceptAppointment(appointment.id, appointment.appointment_id)
// // // // // // //                   }
// // // // // // //                 >
// // // // // // //                   Accept Appointment
// // // // // // //                 </button>
// // // // // // //               )}

// // // // // // //               {appointment.status === "Accepted" && (
// // // // // // //                 <>
// // // // // // //                   <h4>Uploaded Reports</h4>
// // // // // // //                   {!uploadedReports[appointment.id] ||
// // // // // // //                   uploadedReports[appointment.id].length === 0 ? (
// // // // // // //                     <>
// // // // // // //                       <input
// // // // // // //                         type="file"
// // // // // // //                         multiple
// // // // // // //                         onChange={(e) => handleFileChange(e, appointment.id)}
// // // // // // //                       />
// // // // // // //                       {selectedFiles[appointment.id] &&
// // // // // // //                         selectedFiles[appointment.id].length > 0 && (
// // // // // // //                           <button onClick={() => handleUpload(appointment.id)}>
// // // // // // //                             Upload Selected Reports
// // // // // // //                           </button>
// // // // // // //                         )}
// // // // // // //                       {selectedFiles[appointment.id] &&
// // // // // // //                         selectedFiles[appointment.id].map((fileObj, index) => (
// // // // // // //                           <div key={index}>
// // // // // // //                             {fileObj.file.name} ({(
// // // // // // //                               fileObj.file.size / (1024 * 1024)
// // // // // // //                             ).toFixed(2)} MB)
// // // // // // //                           </div>
// // // // // // //                         ))}
// // // // // // //                     </>
// // // // // // //                   ) : (
// // // // // // //                     <>
// // // // // // //                       <h4>Uploaded Reports:</h4>
// // // // // // //                       {uploadedReports[appointment.id].map((report, index) => (
// // // // // // //                         <img
// // // // // // //                           key={index}
// // // // // // //                           src={report}
// // // // // // //                           alt={`Report ${index + 1}`}
// // // // // // //                           className="uploaded-report-thumbnail"
// // // // // // //                         />
// // // // // // //                       ))}
// // // // // // //                     </>
// // // // // // //                   )}
// // // // // // //                 </>
// // // // // // //               )}
// // // // // // //             </div>
// // // // // // //           ))
// // // // // // //         )}
// // // // // // //       </div>
// // // // // // //     </>
// // // // // // //   );
// // // // // // // };

// // // // // // // export default Appointments;

// // // // // // import React, { useState, useEffect } from "react";
// // // // // // import { getAuth } from "firebase/auth";
// // // // // // import {
// // // // // //   getFirestore,
// // // // // //   collection,
// // // // // //   query,
// // // // // //   where,
// // // // // //   getDocs,
// // // // // //   addDoc,
// // // // // //   doc,
// // // // // //   setDoc,
// // // // // //   deleteDoc,
// // // // // //   updateDoc,
// // // // // // } from "firebase/firestore";
// // // // // // import Navbar from "../Navbar";
// // // // // // import { toast, ToastContainer } from "react-toastify";
// // // // // // import "react-toastify/dist/ReactToastify.css";
// // // // // // import "./appointment.css";

// // // // // // const Appointments = () => {
// // // // // //   const [appointments, setAppointments] = useState([]);
// // // // // //   const [loading, setLoading] = useState(true);
// // // // // //   const [selectedFiles, setSelectedFiles] = useState({});
// // // // // //   const [uploadedReports, setUploadedReports] = useState({});
// // // // // //   const [isMobile, setIsMobile] = useState(false);
// // // // // //   const user = getAuth().currentUser;

// // // // // //   useEffect(() => {
// // // // // //     setIsMobile(window.innerWidth <= 500);
// // // // // //   }, []);

// // // // // //   useEffect(() => {
// // // // // //     const fetchAppointments = async () => {
// // // // // //       if (!user) return;
// // // // // //       try {
// // // // // //         const db = getFirestore();
// // // // // //         const q = query(
// // // // // //           collection(db, "appointments"),
// // // // // //           where("patientId", "==", user.uid)
// // // // // //         );
// // // // // //         const snapshot = await getDocs(q);
// // // // // //         const userAppointments = snapshot.docs.map((docSnap) => {
// // // // // //           const data = docSnap.data();
// // // // // //           return {
// // // // // //             id: docSnap.id,
// // // // // //             doctorName: data.DoctorName,
// // // // // //             appointmentDate: data.appointmentDate,
// // // // // //             status: data.status,
// // // // // //             timing: data.appointmentTime || "Not selected",
// // // // // //             meetingId: data.meetingId || "Not yet decided",
// // // // // //             appointment_id: data.appointment_id,
// // // // // //             not_acceptable: data.not_acceptable || false,
// // // // // //           };
// // // // // //         });

// // // // // //         userAppointments.sort(
// // // // // //           (a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate)
// // // // // //         );

// // // // // //         setAppointments(userAppointments);
// // // // // //       } catch (error) {
// // // // // //         console.error("Error fetching appointments:", error);
// // // // // //       } finally {
// // // // // //         setLoading(false);
// // // // // //       }
// // // // // //     };

// // // // // //     fetchAppointments();
// // // // // //   }, [user]);

// // // // // //   const handleFileChange = (e, appointmentId) => {
// // // // // //     const files = Array.from(e.target.files);
// // // // // //     const updatedFiles = files.map((file) => ({ file, base64: "" }));

// // // // // //     setSelectedFiles((prev) => ({
// // // // // //       ...prev,
// // // // // //       [appointmentId]: updatedFiles,
// // // // // //     }));

// // // // // //     updatedFiles.forEach((fileObj, index) => {
// // // // // //       const reader = new FileReader();
// // // // // //       reader.onloadend = () => {
// // // // // //         updatedFiles[index].base64 = reader.result;
// // // // // //         setSelectedFiles((prev) => ({
// // // // // //           ...prev,
// // // // // //           [appointmentId]: [...updatedFiles],
// // // // // //         }));
// // // // // //       };
// // // // // //       reader.readAsDataURL(fileObj.file);
// // // // // //     });
// // // // // //   };

// // // // // //   const handleUpload = async (appointmentId) => {
// // // // // //     if (!selectedFiles[appointmentId]) return;

// // // // // //     const db = getFirestore();
// // // // // //     const reportsRef = collection(db, "consultationReports");

// // // // // //     try {
// // // // // //       await Promise.all(
// // // // // //         selectedFiles[appointmentId].map(async (fileObj) => {
// // // // // //           await addDoc(reportsRef, {
// // // // // //             appointmentId,
// // // // // //             report: fileObj.base64,
// // // // // //             createdAt: new Date(),
// // // // // //           });
// // // // // //         })
// // // // // //       );

// // // // // //       const appointmentDocRef = doc(db, "appointments", appointmentId);
// // // // // //       await setDoc(appointmentDocRef, { reportUploaded: true }, { merge: true });

// // // // // //       toast.success("Reports uploaded successfully!");
// // // // // //     } catch (error) {
// // // // // //       console.error("Error uploading reports:", error);
// // // // // //       toast.error("Failed to upload reports.");
// // // // // //     }
// // // // // //   };

// // // // // //   const fetchReports = async (appointmentId) => {
// // // // // //     const db = getFirestore();
// // // // // //     const q = query(
// // // // // //       collection(db, "consultationReports"),
// // // // // //       where("appointmentId", "==", appointmentId)
// // // // // //     );
// // // // // //     const snapshot = await getDocs(q);
// // // // // //     const reports = snapshot.docs.map((doc) => doc.data().report);
// // // // // //     setUploadedReports((prev) => ({ ...prev, [appointmentId]: reports }));
// // // // // //   };

// // // // // //   useEffect(() => {
// // // // // //     appointments.forEach((appt) => {
// // // // // //       if (appt.status === "Accepted") fetchReports(appt.id);
// // // // // //     });
// // // // // //   }, [appointments]);

// // // // // //   const handleAcceptAppointment = async (appointmentId, sharedId) => {
// // // // // //     const db = getFirestore();

// // // // // //     try {
// // // // // //       const appointmentRef = doc(db, "appointments", appointmentId);

// // // // // //       // Update the current appointment to be accepted and not acceptable
// // // // // //       await updateDoc(appointmentRef, {
// // // // // //         status: "Accepted",
// // // // // //         not_acceptable: true
// // // // // //       });

// // // // // //       // Get all appointments with the same shared ID
// // // // // //       const q = query(
// // // // // //         collection(db, "appointments"),
// // // // // //         where("appointment_id", "==", sharedId)
// // // // // //       );
// // // // // //       const snapshot = await getDocs(q);

// // // // // //       // Delete all other appointments with the same shared ID
// // // // // //       const deletions = snapshot.docs
// // // // // //         .filter((docSnap) => docSnap.id !== appointmentId)
// // // // // //         .map((docSnap) => deleteDoc(doc(db, "appointments", docSnap.id)));

// // // // // //       await Promise.all(deletions);

// // // // // //       toast.success("Appointment accepted successfully!");

// // // // // //       // Update the local state to reflect the changes
// // // // // //       setAppointments((prevAppointments) =>
// // // // // //         prevAppointments
// // // // // //           .filter((appt) => appt.id === appointmentId)
// // // // // //           .map((appt) => ({
// // // // // //             ...appt,
// // // // // //             status: "Accepted",
// // // // // //             not_acceptable: true
// // // // // //           }))
// // // // // //       );

// // // // // //     } catch (error) {
// // // // // //       console.error("Error accepting appointment:", error);
// // // // // //       toast.error("Failed to accept the appointment.");
// // // // // //     }
// // // // // //   };

// // // // // //   if (loading) return <div className="loading">Loading appointments...</div>;

// // // // // //   return (
// // // // // //     <>
// // // // // //       <Navbar />
// // // // // //       <ToastContainer />
// // // // // //       <div className="appointments-container">
// // // // // //         <h2>Your Appointments</h2>
// // // // // //         {appointments.length === 0 ? (
// // // // // //           <p>No appointments found.</p>
// // // // // //         ) : (
// // // // // //           appointments.map((appointment) => (
// // // // // //             <div key={appointment.id} className="appointment-card">
// // // // // //               <h3>{appointment.doctorName}</h3>
// // // // // //               <p>Date: {appointment.appointmentDate}</p>
// // // // // //               <p>Time: {appointment.timing}</p>
// // // // // //               <p>Status: {appointment.status}</p>
// // // // // //               <p>Meeting ID: {appointment.meetingId}</p>

// // // // // //               {appointment.status === "Pending" && !appointment.not_acceptable && (
// // // // // //                 <button
// // // // // //                   className="accept-button"
// // // // // //                   onClick={() =>
// // // // // //                     handleAcceptAppointment(appointment.id, appointment.appointment_id)
// // // // // //                   }
// // // // // //                 >
// // // // // //                   Accept Appointment
// // // // // //                 </button>
// // // // // //               )}

// // // // // //               {appointment.status === "Accepted" && (
// // // // // //                 <>
// // // // // //                   <h4>Uploaded Reports</h4>
// // // // // //                   {!uploadedReports[appointment.id] ||
// // // // // //                   uploadedReports[appointment.id].length === 0 ? (
// // // // // //                     <>
// // // // // //                       <input
// // // // // //                         type="file"
// // // // // //                         multiple
// // // // // //                         onChange={(e) => handleFileChange(e, appointment.id)}
// // // // // //                       />
// // // // // //                       {selectedFiles[appointment.id] &&
// // // // // //                         selectedFiles[appointment.id].length > 0 && (
// // // // // //                           <button onClick={() => handleUpload(appointment.id)}>
// // // // // //                             Upload Selected Reports
// // // // // //                           </button>
// // // // // //                         )}
// // // // // //                       {selectedFiles[appointment.id] &&
// // // // // //                         selectedFiles[appointment.id].map((fileObj, index) => (
// // // // // //                           <div key={index}>
// // // // // //                             {fileObj.file.name} ({(
// // // // // //                               fileObj.file.size / (1024 * 1024)
// // // // // //                             ).toFixed(2)} MB)
// // // // // //                           </div>
// // // // // //                         ))}
// // // // // //                     </>
// // // // // //                   ) : (
// // // // // //                     <>
// // // // // //                       <h4>Uploaded Reports:</h4>
// // // // // //                       {uploadedReports[appointment.id].map((report, index) => (
// // // // // //                         <img
// // // // // //                           key={index}
// // // // // //                           src={report}
// // // // // //                           alt={`Report ${index + 1}`}
// // // // // //                           className="uploaded-report-thumbnail"
// // // // // //                         />
// // // // // //                       ))}
// // // // // //                     </>
// // // // // //                   )}
// // // // // //                 </>
// // // // // //               )}
// // // // // //             </div>
// // // // // //           ))
// // // // // //         )}
// // // // // //       </div>
// // // // // //     </>
// // // // // //   );
// // // // // // };

// // // // // // export default Appointments;

// // // // // // import React, { useState, useEffect } from "react";
// // // // // // import { getAuth } from "firebase/auth";
// // // // // // import {
// // // // // //   getFirestore,
// // // // // //   collection,
// // // // // //   query,
// // // // // //   where,
// // // // // //   getDocs,
// // // // // //   addDoc,
// // // // // //   doc,
// // // // // //   setDoc,
// // // // // //   deleteDoc,
// // // // // //   updateDoc,
// // // // // // } from "firebase/firestore";
// // // // // // import Navbar from "../Navbar";
// // // // // // import { toast, ToastContainer } from "react-toastify";
// // // // // // import "react-toastify/dist/ReactToastify.css";
// // // // // // import "./appointment.css";

// // // // // // const Appointments = () => {
// // // // // //   const [appointments, setAppointments] = useState([]);
// // // // // //   const [loading, setLoading] = useState(true);
// // // // // //   const [selectedFiles, setSelectedFiles] = useState({});
// // // // // //   const [uploadedReports, setUploadedReports] = useState({});
// // // // // //   const [isMobile, setIsMobile] = useState(false);
// // // // // //   const user = getAuth().currentUser;

// // // // // //   useEffect(() => {
// // // // // //     setIsMobile(window.innerWidth <= 500);
// // // // // //   }, []);

// // // // // //   const fetchAppointments = async () => {
// // // // // //     if (!user) return;
// // // // // //     try {
// // // // // //       const db = getFirestore();
// // // // // //       const q = query(
// // // // // //         collection(db, "appointments"),
// // // // // //         where("patientId", "==", user.uid)
// // // // // //       );
// // // // // //       const snapshot = await getDocs(q);
// // // // // //       const userAppointments = snapshot.docs.map((docSnap) => {
// // // // // //         const data = docSnap.data();
// // // // // //         return {
// // // // // //           id: docSnap.id,
// // // // // //           doctorName: data.DoctorName,
// // // // // //           appointmentDate: data.appointmentDate,
// // // // // //           status: data.status,
// // // // // //           timing: data.appointmentTime || "Not selected",
// // // // // //           meetingId: data.meetingId || "Not yet decided",
// // // // // //           appointment_id: data.appointment_id,
// // // // // //           not_acceptable: data.not_acceptable || false,
// // // // // //         };
// // // // // //       });

// // // // // //       userAppointments.sort(
// // // // // //         (a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate)
// // // // // //       );

// // // // // //       setAppointments(userAppointments);
// // // // // //     } catch (error) {
// // // // // //       console.error("Error fetching appointments:", error);
// // // // // //     } finally {
// // // // // //       setLoading(false);
// // // // // //     }
// // // // // //   };

// // // // // //   useEffect(() => {
// // // // // //     fetchAppointments();
// // // // // //   }, [user]);

// // // // // //   const handleFileChange = (e, appointmentId) => {
// // // // // //     const files = Array.from(e.target.files);
// // // // // //     const updatedFiles = files.map((file) => ({ file, base64: "" }));

// // // // // //     setSelectedFiles((prev) => ({
// // // // // //       ...prev,
// // // // // //       [appointmentId]: updatedFiles,
// // // // // //     }));

// // // // // //     updatedFiles.forEach((fileObj, index) => {
// // // // // //       const reader = new FileReader();
// // // // // //       reader.onloadend = () => {
// // // // // //         updatedFiles[index].base64 = reader.result;
// // // // // //         setSelectedFiles((prev) => ({
// // // // // //           ...prev,
// // // // // //           [appointmentId]: [...updatedFiles],
// // // // // //         }));
// // // // // //       };
// // // // // //       reader.readAsDataURL(fileObj.file);
// // // // // //     });
// // // // // //   };

// // // // // //   const handleUpload = async (appointmentId) => {
// // // // // //     if (!selectedFiles[appointmentId]) return;

// // // // // //     const db = getFirestore();
// // // // // //     const reportsRef = collection(db, "consultationReports");

// // // // // //     try {
// // // // // //       await Promise.all(
// // // // // //         selectedFiles[appointmentId].map(async (fileObj) => {
// // // // // //           await addDoc(reportsRef, {
// // // // // //             appointmentId,
// // // // // //             report: fileObj.base64,
// // // // // //             createdAt: new Date(),
// // // // // //           });
// // // // // //         })
// // // // // //       );

// // // // // //       const appointmentDocRef = doc(db, "appointments", appointmentId);
// // // // // //       await setDoc(appointmentDocRef, { reportUploaded: true }, { merge: true });

// // // // // //       toast.success("Reports uploaded successfully!");
// // // // // //     } catch (error) {
// // // // // //       console.error("Error uploading reports:", error);
// // // // // //       toast.error("Failed to upload reports.");
// // // // // //     }
// // // // // //   };

// // // // // //   const fetchReports = async (appointmentId) => {
// // // // // //     const db = getFirestore();
// // // // // //     const q = query(
// // // // // //       collection(db, "consultationReports"),
// // // // // //       where("appointmentId", "==", appointmentId)
// // // // // //     );
// // // // // //     const snapshot = await getDocs(q);
// // // // // //     const reports = snapshot.docs.map((doc) => doc.data().report);
// // // // // //     setUploadedReports((prev) => ({ ...prev, [appointmentId]: reports }));
// // // // // //   };

// // // // // //   useEffect(() => {
// // // // // //     appointments.forEach((appt) => {
// // // // // //       if (appt.status === "Accepted") fetchReports(appt.id);
// // // // // //     });
// // // // // //   }, [appointments]);

// // // // // //   const handleAcceptAppointment = async (appointmentId, sharedId) => {
// // // // // //     alert("Updating....")
// // // // // //     const db = getFirestore();

// // // // // //     try {
// // // // // //       // First, update the appointment in Firestore
// // // // // //       const appointmentRef = doc(db, "appointments", appointmentId);
// // // // // //       const updateData = {
// // // // // //         status: "Accepted",
// // // // // //         not_acceptable: true,
// // // // // //         patientId: user.uid
// // // // // //       };

// // // // // //       await updateDoc(appointmentRef, updateData);

// // // // // //       // Get all appointments with the same shared ID
// // // // // //       const q = query(
// // // // // //         collection(db, "appointments"),
// // // // // //         where("appointment_id", "==", sharedId)
// // // // // //       );
// // // // // //       const snapshot = await getDocs(q);

// // // // // //       // Delete all other appointments with the same shared ID
// // // // // //       const deletionPromises = snapshot.docs
// // // // // //         .filter((docSnap) => docSnap.id !== appointmentId)
// // // // // //         .map((docSnap) => deleteDoc(doc(db, "appointments", docSnap.id)));

// // // // // //       await Promise.all(deletionPromises);

// // // // // //       // Update local state
// // // // // //       setAppointments(prevAppointments => {
// // // // // //         const updatedAppointments = prevAppointments
// // // // // //           .filter(appt => appt.appointment_id === sharedId)
// // // // // //           .map(appt => ({
// // // // // //             ...appt,
// // // // // //             status: "Accepted",
// // // // // //             not_acceptable: true
// // // // // //           }));
// // // // // //         return updatedAppointments;
// // // // // //       });

// // // // // //       // Refresh appointments to ensure we have the latest data
// // // // // //       await fetchAppointments();

// // // // // //       toast.success("Appointment accepted successfully!");
// // // // // //     } catch (error) {
// // // // // //       console.error("Error accepting appointment:", error);
// // // // // //       toast.error("Failed to accept the appointment.");
// // // // // //     }
// // // // // //   };

// // // // // //   if (loading) return <div className="loading">Loading appointments...</div>;

// // // // // //   return (
// // // // // //     <>
// // // // // //       <Navbar />
// // // // // //       <ToastContainer />
// // // // // //       <div className="appointments-container">
// // // // // //         <h2>Your Appointments</h2>
// // // // // //         {appointments.length === 0 ? (
// // // // // //           <p>No appointments found.</p>
// // // // // //         ) : (
// // // // // //           appointments.map((appointment) => (
// // // // // //             <div key={appointment.id} className="appointment-card">
// // // // // //               <h3>{appointment.doctorName}</h3>
// // // // // //               <p>Date: {appointment.appointmentDate}</p>
// // // // // //               <p>Time: {appointment.timing}</p>
// // // // // //               <p>Status: {appointment.status}</p>
// // // // // //               <p>Meeting ID: {appointment.meetingId}</p>
// // // // // //               <p>Not Acceptable: {appointment.not_acceptable ? "Yes" : "No"}</p>

// // // // // //               {appointment.status === "Pending" && !appointment.not_acceptable && (
// // // // // //                 <button
// // // // // //                   className="accept-button"
// // // // // //                   onClick={() =>
// // // // // //                     handleAcceptAppointment(appointment.id, appointment.appointment_id)
// // // // // //                   }
// // // // // //                 >
// // // // // //                   Accept Appointment
// // // // // //                 </button>
// // // // // //               )}

// // // // // //               {appointment.status === "Accepted" && (
// // // // // //                 <>
// // // // // //                   <h4>Uploaded Reports</h4>
// // // // // //                   {!uploadedReports[appointment.id] ||
// // // // // //                   uploadedReports[appointment.id].length === 0 ? (
// // // // // //                     <>
// // // // // //                       <input
// // // // // //                         type="file"
// // // // // //                         multiple
// // // // // //                         onChange={(e) => handleFileChange(e, appointment.id)}
// // // // // //                       />
// // // // // //                       {selectedFiles[appointment.id] &&
// // // // // //                         selectedFiles[appointment.id].length > 0 && (
// // // // // //                           <button onClick={() => handleUpload(appointment.id)}>
// // // // // //                             Upload Selected Reports
// // // // // //                           </button>
// // // // // //                         )}
// // // // // //                       {selectedFiles[appointment.id] &&
// // // // // //                         selectedFiles[appointment.id].map((fileObj, index) => (
// // // // // //                           <div key={index}>
// // // // // //                             {fileObj.file.name} ({(
// // // // // //                               fileObj.file.size / (1024 * 1024)
// // // // // //                             ).toFixed(2)} MB)
// // // // // //                           </div>
// // // // // //                         ))}
// // // // // //                     </>
// // // // // //                   ) : (
// // // // // //                     <>
// // // // // //                       <h4>Uploaded Reports:</h4>
// // // // // //                       {uploadedReports[appointment.id].map((report, index) => (
// // // // // //                         <img
// // // // // //                           key={index}
// // // // // //                           src={report}
// // // // // //                           alt={`Report ${index + 1}`}
// // // // // //                           className="uploaded-report-thumbnail"
// // // // // //                         />
// // // // // //                       ))}
// // // // // //                     </>
// // // // // //                   )}
// // // // // //                 </>
// // // // // //               )}
// // // // // //             </div>
// // // // // //           ))
// // // // // //         )}
// // // // // //       </div>
// // // // // //     </>
// // // // // //   );
// // // // // // };

// // // // // // export default Appointments;

// // // import React, { useState, useEffect } from "react";
// // // import { getAuth } from "firebase/auth";
// // // import {
// // //   getFirestore,
// // //   collection,
// // //   query,
// // //   where,
// // //   getDocs,
// // //   addDoc,
// // //   doc,
// // //   setDoc,
// // //   deleteDoc,
// // //   writeBatch,
// // // } from "firebase/firestore";
// // // import "./appointment.css";
// // // import Navbar from "../Navbar";
// // // import { toast, ToastContainer } from "react-toastify";
// // // import "react-toastify/dist/ReactToastify.css";

// // // const Appointments = () => {
// // //   const [appointments, setAppointments] = useState([]);
// // //   const [loading, setLoading] = useState(true);
// // //   const [selectedFiles, setSelectedFiles] = useState({});
// // //   const [uploadedReports, setUploadedReports] = useState({});
// // //   const user = getAuth().currentUser;
// // //   const [ismobile, setmobile] = useState(false);

// // //   useEffect(() => {
// // //     if (window.innerWidth <= 500) setmobile(true);
// // //   }, []);

// // //   useEffect(() => {
// // //     const fetchAppointments = async () => {
// // //       if (!user) return;

// // //       const db = getFirestore();
// // //       const q = query(collection(db, "appointments"), where("patientId", "==", user.uid));

// // //       try {
// // //         const snapshot = await getDocs(q);
// // //         const results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
// // //         results.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
// // //         setAppointments(results);
// // //       } catch (err) {
// // //         console.error("Error fetching appointments:", err);
// // //       } finally {
// // //         setLoading(false);
// // //       }
// // //     };

// // //     fetchAppointments();
// // //   }, [user]);

// // //   const handleFileChange = (e, appointmentId) => {
// // //     const files = Array.from(e.target.files).map((file) => ({ file, base64: "" }));

// // //     files.forEach((fileObj, idx) => {
// // //       const reader = new FileReader();
// // //       reader.onloadend = () => {
// // //         files[idx].base64 = reader.result;
// // //         setSelectedFiles((prev) => ({ ...prev, [appointmentId]: files }));
// // //       };
// // //       reader.readAsDataURL(fileObj.file);
// // //     });
// // //   };

// // //   const handleUpload = async (appointmentId) => {
// // //     if (!selectedFiles[appointmentId]) return;

// // //     const db = getFirestore();
// // //     const reportsRef = collection(db, "consultationReports");

// // //     try {
// // //       const uploadPromises = selectedFiles[appointmentId].map((fileObj) =>
// // //         addDoc(reportsRef, {
// // //           appointmentId,
// // //           report: fileObj.base64,
// // //           createdAt: new Date(),
// // //         })
// // //       );

// // //       const reportDocs = await Promise.all(uploadPromises);
// // //       const reportIds = reportDocs.map((doc) => doc.id);

// // //       await setDoc(doc(db, "appointments", appointmentId), { reportIds }, { merge: true });

// // //       toast.success("Reports uploaded successfully.");
// // //     } catch (error) {
// // //       console.error("Upload error:", error);
// // //       toast.error("Failed to upload reports.");
// // //     }
// // //   };

// // //   const fetchReports = async (appointmentId) => {
// // //     const db = getFirestore();
// // //     const q = query(collection(db, "consultationReports"), where("appointmentId", "==", appointmentId));
// // //     const snapshot = await getDocs(q);

// // //     const reports = snapshot.docs.map((doc) => doc.data().report);
// // //     setUploadedReports((prev) => ({ ...prev, [appointmentId]: reports }));
// // //   };

// // //   const deleteOtherAppointments = async (acceptedAppointment) => {
// // //     const db = getFirestore();
// // //     const q = query(
// // //       collection(db, "appointments"),
// // //       where("appointment_id", "==", acceptedAppointment.appointment_id)
// // //     );

// // //     try {
// // //       const snapshot = await getDocs(q);

// // //       if (snapshot.empty) {
// // //         toast.info("No duplicate appointments found.");
// // //         return;
// // //       }

// // //       const batch = writeBatch(db);
// // //       let deleteCount = 0;

// // //       snapshot.forEach((docSnap) => {
// // //         if (docSnap.id !== acceptedAppointment.id) {
// // //           batch.delete(doc(db, "appointments", docSnap.id));
// // //           deleteCount++;
// // //         }
// // //       });

// // //       await batch.commit();
// // //       console.log(`Deleted ${deleteCount} other appointment(s).`);
// // //       toast.success(`Deleted ${deleteCount} other appointment(s).`);
// // //     } catch (err) {
// // //       console.error("Error deleting other appointments:", err);
// // //       toast.error("Failed to delete duplicate appointments.");
// // //     }
// // //   };

// // //   const handleAccept = async (appointment) => {
// // //     const db = getFirestore();
// // //     const ref = doc(db, "appointments", appointment.id);

// // //     try {
// // //       await setDoc(ref, { status: "Accepted" }, { merge: true });
// // //       toast.success("Appointment accepted!");

// // //       await deleteOtherAppointments(appointment);

// // //       setAppointments((prev) =>
// // //         prev.filter((appt) =>
// // //           appt.appointment_id === appointment.appointment_id
// // //             ? appt.id === appointment.id
// // //             : true
// // //         )
// // //       );
// // //     } catch (err) {
// // //       console.error("Error accepting appointment:", err);
// // //       toast.error("Failed to accept appointment.");
// // //     }
// // //   };

// // //   useEffect(() => {
// // //     appointments.forEach((appt) => {
// // //       if (appt.status === "Accepted") fetchReports(appt.id);
// // //     });
// // //   }, [appointments]);

// // //   if (loading) return <div className="loading">Loading appointments...</div>;

// // //   return (
// // //     <>
// // //       <Navbar />
// // //       <div className="appointments-container">
// // //         <h2>Your Appointments</h2>
// // //         {appointments.length === 0 ? (
// // //           <p className="no-appointments">You have no appointments.</p>
// // //         ) : ismobile ? (
// // //           appointments.map((a) => (
// // //             <div className="appointment-card" key={a.id}>
// // //               <h3>{a.DoctorName}</h3>
// // //               <p>Date: {a.appointmentDate}</p>
// // //               <p>Status: {a.status}</p>
// // //               <p>Time: {a.appointmentTime || "Not selected"}</p>
// // //               {a.meetingId && a.meetingId !== "not yet decided" && (
// // //                 <a href={a.meetingId} target="_blank" rel="noreferrer">Join Meeting</a>
// // //               )}
// // //               {a.status === "Accepted" && (
// // //                 <>
// // //                   <input type="file" multiple onChange={(e) => handleFileChange(e, a.id)} />
// // //                   <button onClick={() => handleUpload(a.id)}>Upload Reports</button>
// // //                 </>
// // //               )}
// // //               {a.status !== "Accepted" && (
// // //                 <button onClick={() => handleAccept(a)}>Accept</button>
// // //               )}
// // //             </div>
// // //           ))
// // //         ) : (
// // //           <table className="appointments-table">
// // //             <thead>
// // //               <tr>
// // //                 <th>Doctor Name</th>
// // //                 <th>Appointment Date</th>
// // //                 <th>Status</th>
// // //                 <th>Time</th>
// // //                 <th>Meeting</th>
// // //                 <th>Actions</th>
// // //               </tr>
// // //             </thead>
// // //             <tbody>
// // //               {appointments.map((a) => (
// // //                 <tr key={a.id}>
// // //                   <td>{a.DoctorName}</td>
// // //                   <td>{a.appointmentDate}</td>
// // //                   <td>{a.status}</td>
// // //                   <td>{a.appointmentTime || "Not selected"}</td>
// // //                   <td>
// // //                     {a.meetingId && a.meetingId !== "not yet decided" ? (
// // //                       <a href={a.meetingId} target="_blank" rel="noreferrer">Join</a>
// // //                     ) : (
// // //                       "Pending"
// // //                     )}
// // //                   </td>
// // //                   <td>
// // //                     {a.status === "Accepted" ? (
// // //                       <>
// // //                         <input type="file" multiple onChange={(e) => handleFileChange(e, a.id)} />
// // //                         <button onClick={() => handleUpload(a.id)}>Upload</button>
// // //                         <div className="report-thumbs">
// // //                           {uploadedReports[a.id]?.map((r, i) => (
// // //                             <img key={i} src={r} alt={`report-${i}`} style={{ width: 40, height: 40 }} />
// // //                           ))}
// // //                         </div>
// // //                       </>
// // //                     ) : (
// // //                       <button onClick={() => handleAccept(a)}>Accept</button>
// // //                     )}
// // //                   </td>
// // //                 </tr>
// // //               ))}
// // //             </tbody>
// // //           </table>
// // //         )}
// // //       </div>
// // //       <ToastContainer />
// // //     </>
// // //   );
// // // };

// // // export default Appointments;

// // import React, { useState, useEffect } from "react";
// // import { getAuth } from "firebase/auth";
// // import {
// //   getFirestore,
// //   collection,
// //   query,
// //   where,
// //   getDocs,
// //   addDoc,
// //   doc,
// //   setDoc,
// //   deleteDoc,
// //   writeBatch,
// // } from "firebase/firestore";
// // import "./appointment.css";
// // import Navbar from "../Navbar";
// // import { toast, ToastContainer } from "react-toastify";
// // import "react-toastify/dist/ReactToastify.css";

// // const Appointments = () => {
// //   const [appointments, setAppointments] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [selectedFiles, setSelectedFiles] = useState({});
// //   const [uploadedReports, setUploadedReports] = useState({});
// //   const [ismobile, setmobile] = useState(false);
// //   const user = getAuth().currentUser;

// //   useEffect(() => {
// //     if (window.innerWidth <= 500) setmobile(true);
// //   }, []);

// //   useEffect(() => {
// //     const fetchAppointments = async () => {
// //       if (!user) return;

// //       const db = getFirestore();
// //       const q = query(collection(db, "appointments"), where("patientId", "==", user.uid));

// //       try {
// //         const snapshot = await getDocs(q);
// //         const results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
// //         results.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
// //         setAppointments(results);
// //       } catch (err) {
// //         console.error("Error fetching appointments:", err);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     fetchAppointments();
// //   }, [user]);

// //   const handleFileChange = (e, appointmentId) => {
// //     const files = Array.from(e.target.files).map((file) => ({ file, base64: "" }));

// //     files.forEach((fileObj, idx) => {
// //       const reader = new FileReader();
// //       reader.onloadend = () => {
// //         files[idx].base64 = reader.result;
// //         setSelectedFiles((prev) => ({ ...prev, [appointmentId]: files }));
// //       };
// //       reader.readAsDataURL(fileObj.file);
// //     });
// //   };

// //   const handleUpload = async (appointmentId) => {
// //     if (!selectedFiles[appointmentId]) return;

// //     const db = getFirestore();
// //     const reportsRef = collection(db, "consultationReports");

// //     try {
// //       const uploadPromises = selectedFiles[appointmentId].map((fileObj) =>
// //         addDoc(reportsRef, {
// //           appointmentId,
// //           report: fileObj.base64,
// //           createdAt: new Date(),
// //         })
// //       );

// //       const reportDocs = await Promise.all(uploadPromises);
// //       const reportIds = reportDocs.map((doc) => doc.id);

// //       await setDoc(doc(db, "appointments", appointmentId), { reportIds }, { merge: true });

// //       toast.success("Reports uploaded successfully.");
// //     } catch (error) {
// //       console.error("Upload error:", error);
// //       toast.error("Failed to upload reports.");
// //     }
// //   };

// //   const fetchReports = async (appointmentId) => {
// //     const db = getFirestore();
// //     const q = query(collection(db, "consultationReports"), where("appointmentId", "==", appointmentId));
// //     const snapshot = await getDocs(q);

// //     const reports = snapshot.docs.map((doc) => doc.data().report);
// //     setUploadedReports((prev) => ({ ...prev, [appointmentId]: reports }));
// //   };

// //   const deleteOtherAppointments = async (acceptedAppointment) => {
// //     const db = getFirestore();
// //     const q = query(
// //       collection(db, "appointments"),
// //       where("appointment_id", "==", acceptedAppointment.appointment_id)
// //     );

// //     try {
// //       const snapshot = await getDocs(q);
// //       if (snapshot.empty) {
// //         toast.info("No duplicate appointments found.");
// //         return;
// //       }

// //       const batch = writeBatch(db);
// //       let deleteCount = 0;

// //       snapshot.forEach((docSnap) => {
// //         if (docSnap.id !== acceptedAppointment.id) {
// //           batch.delete(docSnap.ref);
// //           deleteCount++;
// //         }
// //       });

// //       await batch.commit();
// //       toast.success(`Deleted ${deleteCount} duplicate appointment(s).`);
// //     } catch (err) {
// //       console.error("Error deleting duplicates:", err);
// //       toast.error("Failed to delete duplicate appointments.");
// //     }
// //   };

// //   const handleAccept = async (appointment) => {
// //     const db = getFirestore();
// //     const ref = doc(db, "appointments", appointment.id);

// //     try {
// //       await setDoc(ref, { status: "Accepted" }, { merge: true });
// //       toast.success("Appointment accepted!");

// //       await deleteOtherAppointments(appointment);

// //       setAppointments((prev) =>
// //         prev.filter((appt) =>
// //           appt.appointment_id === appointment.appointment_id
// //             ? appt.id === appointment.id
// //             : true
// //         )
// //       );
// //     } catch (err) {
// //       console.error("Error accepting appointment:", err);
// //       toast.error("Failed to accept appointment.");
// //     }
// //   };

// //   useEffect(() => {
// //     appointments.forEach((appt) => {
// //       if (appt.status === "Accepted") fetchReports(appt.id);
// //     });
// //   }, [appointments]);

// //   if (loading) return <div className="loading">Loading appointments...</div>;

// //   return (
// //     <>
// //       <Navbar />
// //       <div className="appointments-container">
// //         <h2>Your Appointments</h2>
// //         {appointments.length === 0 ? (
// //           <p className="no-appointments">You have no appointments.</p>
// //         ) : ismobile ? (
// //           appointments.map((a) => (
// //             <div className="appointment-card" key={a.id}>
// //               <h3>{a.DoctorName}</h3>
// //               <p>Date: {a.appointmentDate}</p>
// //               <p>Status: {a.status}</p>
// //               <p>Time: {a.appointmentTime || "Not selected"}</p>
// //               {a.meetingId && a.meetingId !== "not yet decided" && (
// //                 <a href={a.meetingId} target="_blank" rel="noreferrer">Join Meeting</a>
// //               )}
// //               {a.status === "Accepted" ? (
// //                 <>
// //                   <input type="file" multiple onChange={(e) => handleFileChange(e, a.id)} />
// //                   <button onClick={() => handleUpload(a.id)}>Upload Reports</button>
// //                 </>
// //               ) : (
// //                 <button onClick={() => handleAccept(a)}>Accept</button>
// //               )}
// //             </div>
// //           ))
// //         ) : (
// //           <table className="appointments-table">
// //             <thead>
// //               <tr>
// //                 <th>Doctor Name</th>
// //                 <th>Appointment Date</th>
// //                 <th>Status</th>
// //                 <th>Time</th>
// //                 <th>Meeting</th>
// //                 <th>Actions</th>
// //               </tr>
// //             </thead>
// //             <tbody>
// //               {appointments.map((a) => (
// //                 <tr key={a.id}>
// //                   <td>{a.DoctorName}</td>
// //                   <td>{a.appointmentDate}</td>
// //                   <td>{a.status}</td>
// //                   <td>{a.appointmentTime || "Not selected"}</td>
// //                   <td>
// //                     {a.meetingId && a.meetingId !== "not yet decided" ? (
// //                       <a href={a.meetingId} target="_blank" rel="noreferrer">Join</a>
// //                     ) : (
// //                       "Pending"
// //                     )}
// //                   </td>
// //                   <td>
// //                     {a.status === "Accepted" ? (
// //                       <>
// //                         <input type="file" multiple onChange={(e) => handleFileChange(e, a.id)} />
// //                         <button onClick={() => handleUpload(a.id)}>Upload</button>
// //                         <div className="report-thumbs">
// //                           {uploadedReports[a.id]?.map((r, i) => (
// //                             <img key={i} src={r} alt={`report-${i}`} style={{ width: 40, height: 40 }} />
// //                           ))}
// //                         </div>
// //                       </>
// //                     ) : (
// //                       <button onClick={() => handleAccept(a)}>Accept</button>
// //                     )}
// //                   </td>
// //                 </tr>
// //               ))}
// //             </tbody>
// //           </table>
// //         )}
// //       </div>
// //       <ToastContainer />
// //     </>
// //   );
// // };

// // export default Appointments;

// import React, { useState, useEffect } from "react";
// import { getAuth } from "firebase/auth";
// import {
//   getFirestore,
//   collection,
//   query,
//   where,
//   getDocs,
//   addDoc,
//   doc,
//   setDoc,
//   deleteDoc,
//   writeBatch,
// } from "firebase/firestore";
// import "./appointment.css";
// import Navbar from "../Navbar";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const Appointments = () => {
//   const [appointments, setAppointments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedFiles, setSelectedFiles] = useState({});
//   const [uploadedReports, setUploadedReports] = useState({});
//   const [isMobile, setIsMobile] = useState(false);
//   const user = getAuth().currentUser;

//   useEffect(() => {
//     setIsMobile(window.innerWidth <= 500);
//   }, []);

//   useEffect(() => {
//     const fetchAppointments = async () => {
//       if (!user) return;
//       const db = getFirestore();
//       const q = query(
//         collection(db, "appointments"),
//         where("patientId", "==", user.uid)
//       );

//       try {
//         const snapshot = await getDocs(q);
//         const results = snapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));
//         results.sort(
//           (a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate)
//         );
//         setAppointments(results);
//       } catch (err) {
//         console.error("Error fetching appointments:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAppointments();
//   }, [user]);

//   const handleFileChange = (e, appointmentId) => {
//     const files = Array.from(e.target.files).map((file) => ({
//       file,
//       base64: "",
//     }));

//     files.forEach((fileObj, idx) => {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         files[idx].base64 = reader.result;
//         setSelectedFiles((prev) => ({ ...prev, [appointmentId]: files }));
//       };
//       reader.readAsDataURL(fileObj.file);
//     });
//   };

//   const handleUpload = async (appointmentId) => {
//     if (!selectedFiles[appointmentId]) return;

//     const db = getFirestore();
//     const reportsRef = collection(db, "consultationReports");

//     try {
//       const uploadPromises = selectedFiles[appointmentId].map((fileObj) =>
//         addDoc(reportsRef, {
//           appointmentId,
//           report: fileObj.base64,
//           createdAt: new Date(),
//         })
//       );

//       const reportDocs = await Promise.all(uploadPromises);
//       const reportIds = reportDocs.map((doc) => doc.id);

//       await setDoc(
//         doc(db, "appointments", appointmentId),
//         { reportIds },
//         { merge: true }
//       );

//       toast.success("Reports uploaded successfully.");
//     } catch (error) {
//       console.error("Upload error:", error);
//       toast.error("Failed to upload reports.");
//     }
//   };

//   const fetchReports = async (appointmentId) => {
//     const db = getFirestore();
//     const q = query(
//       collection(db, "consultationReports"),
//       where("appointmentId", "==", appointmentId)
//     );
//     const snapshot = await getDocs(q);

//     const reports = snapshot.docs.map((doc) => doc.data().report);
//     setUploadedReports((prev) => ({ ...prev, [appointmentId]: reports }));
//   };

//   // const deletePendingAppointments = async (acceptedAppointment) => {
//   //   const db = getFirestore();
//   //   const q = query(
//   //     collection(db, "appointments"),
//   //     where("appointment_id", "==", acceptedAppointment.appointment_id)
//   //   );

//   //   try {
//   //     const snapshot = await getDocs(q);
//   //     const batch = writeBatch(db);
//   //     let deleteCount = 0;

//   //     snapshot.forEach((docSnap) => {
//   //       const data = docSnap.data();
//   //       if (docSnap.id !== acceptedAppointment.id && data.status === "Pending") {
//   //         batch.delete(docSnap.ref);
//   //         deleteCount++;
//   //       }
//   //     });

//   //     await batch.commit();
//   //     toast.success(`Removed ${deleteCount} pending appointment(s).`);
//   //   } catch (err) {
//   //     console.error("Error deleting pending appointments:", err);
//   //     toast.error("Could not remove pending appointments.");
//   //   }
//   // };

//   const deleteOtherAppointments = async (acceptedAppointment) => {
//     const db = getFirestore();
//     const q = query(
//       collection(db, "appointments"),
//       where("appointment_id", "==", acceptedAppointment.appointment_id),
//       where("status", "==", "Pending")
//     );

//     try {
//       const snapshot = await getDocs(q);

//       if (snapshot.empty) {
//         toast.info("No pending duplicate appointments found.");
//         return;
//       }

//       const batch = writeBatch(db);
//       let deleteCount = 0;

//       snapshot.forEach((docSnap) => {
//         if (docSnap.id !== acceptedAppointment.id) {
//           batch.delete(docSnap.ref);
//           deleteCount++;
//         }
//       });

//       await batch.commit();
//       toast.success(`Deleted ${deleteCount} pending duplicate appointment(s).`);
//     } catch (err) {
//       console.error("Error deleting pending appointments:", err);
//       toast.error("Failed to delete pending appointments.");
//     }
//   };

//   const handleAccept = async (appointment) => {
//     const db = getFirestore();
//     const ref = doc(db, "appointments", appointment.id); // Use appointment.id to refer to doc ID

//     try {
//       await setDoc(ref, { status: "Accepted" }, { merge: true });
//       toast.success("Appointment accepted!");

//       await deleteOtherAppointments(appointment); // Ensure deletion occurs AFTER acceptance

//       setAppointments((prev) =>
//         prev.filter(
//           (appt) =>
//             appt.appointment_id !== appointment.appointment_id ||
//             appt.id === appointment.id ||
//             appt.status !== "Pending"
//         )
//       );
//     } catch (err) {
//       console.error("Error accepting appointment:", err);
//       toast.error("Failed to accept appointment.");
//     }
//   };

//   useEffect(() => {
//     appointments.forEach((appt) => {
//       if (appt.status === "Accepted") fetchReports(appt.id);
//     });
//   }, [appointments]);

//   if (loading) return <div className="loading">Loading appointments...</div>;

//   return (
//     <>
//       <Navbar />
//       <div className="appointments-container">
//         <h2>Your Appointments</h2>
//         {appointments.length === 0 ? (
//           <p className="no-appointments">You have no appointments.</p>
//         ) : isMobile ? (
//           appointments.map((a) => (
//             <div className="appointment-card" key={a.id}>
//               <h3>{a.DoctorName}</h3>
//               <p>Date: {a.appointmentDate}</p>
//               <p>Status: {a.status}</p>
//               <p>Time: {a.appointmentTime || "Not selected"}</p>
//               {a.meetingId && a.meetingId !== "not yet decided" && (
//                 <a href={a.meetingId} target="_blank" rel="noreferrer">
//                   Join Meeting
//                 </a>
//               )}
//               {a.status === "Accepted" ? (
//                 <>
//                   <input
//                     type="file"
//                     multiple
//                     onChange={(e) => handleFileChange(e, a.id)}
//                   />
//                   <button onClick={() => handleUpload(a.id)}>
//                     Upload Reports
//                   </button>
//                 </>
//               ) : (
//                 <button onClick={() => handleAccept(a)}>Accept</button>
//               )}
//             </div>
//           ))
//         ) : (
//           <table className="appointments-table">
//             <thead>
//               <tr>
//                 <th>Doctor Name</th>
//                 <th>Appointment Date</th>
//                 <th>Status</th>
//                 <th>Time</th>
//                 <th>Meeting</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {appointments.map((a) => (
//                 <tr key={a.id}>
//                   <td>{a.DoctorName}</td>
//                   <td>{a.appointmentDate}</td>
//                   <td>{a.status}</td>
//                   <td>{a.appointmentTime || "Not selected"}</td>
//                   <td>
//                     {a.meetingId && a.meetingId !== "not yet decided" ? (
//                       <a href={a.meetingId} target="_blank" rel="noreferrer">
//                         Join
//                       </a>
//                     ) : (
//                       "Pending"
//                     )}
//                   </td>
//                   <td>
//                     {a.status === "Accepted" ? (
//                       <>
//                         <input
//                           type="file"
//                           multiple
//                           onChange={(e) => handleFileChange(e, a.id)}
//                         />
//                         <button onClick={() => handleUpload(a.id)}>
//                           Upload
//                         </button>
//                         <div className="report-thumbs">
//                           {uploadedReports[a.id]?.map((r, i) => (
//                             <img
//                               key={i}
//                               src={r}
//                               alt={`report-${i}`}
//                               style={{ width: 40, height: 40 }}
//                             />
//                           ))}
//                         </div>
//                       </>
//                     ) : (
//                       <button onClick={() => handleAccept(a)}>Accept</button>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>
//       <ToastContainer />
//     </>
//   );
// };

// export default Appointments;
