// import React, { useState, useEffect } from "react";
// import { getAuth } from "firebase/auth";
// import "./appointment.css"
// import {
//   getFirestore,
//   collection,
//   query,
//   where,
//   getDocs,
// } from "firebase/firestore";

// const Appointments = () => {
//   const [appointments, setAppointments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const user = getAuth().currentUser; // Get current logged-in user

//   useEffect(() => {
//     const fetchAppointments = async () => {
//       if (user) {
//         const db = getFirestore();
//         const appointmentsRef = collection(db, "appointments");
//         const q = query(appointmentsRef, where("patientId", "==", user.uid)); // Fetch appointments for logged-in user

//         try {
//           const querySnapshot = await getDocs(q);
//           const userAppointments = [];

//           querySnapshot.forEach((doc) => {
//             const appointmentData = doc.data();
//             userAppointments.push({
//               id: doc.id,
//               doctorName: appointmentData.DoctorName,
//               appointmentDate: appointmentData.appointmentDate,
//               status: appointmentData.status,
//               Timing: appointmentData.appointmentTime,
//               meetingid: appointmentData.meetingId,
//             });
//           });

//           console.log("Fetched Appointments:", userAppointments);

//           // Sort appointments by date
//           userAppointments.sort(
//             (a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate)
//           );

//           setAppointments(userAppointments);
//         } catch (error) {
//           console.error("Error fetching appointments:", error);
//         } finally {
//           setLoading(false);
//         }
//       }
//     };

//     fetchAppointments();
//   }, [user]);

//   if (loading) return <div>Loading appointments...</div>;

//   return (
//     <div className="appointments-container">
//       <h2>Your Appointments</h2>
//       {appointments.length === 0 ? (
//         <p>You have no appointments.</p>
//       ) : (
//         <ul>
//           {appointments.map((appointment) => (
//             <li key={appointment.id} className="appointment-card">
//               <p>
//                 <strong>Doctor Name:</strong> {appointment.doctorName}
//               </p>
//               <p>
//                 <strong>Appointment Date:</strong> {appointment.appointmentDate}
//               </p>
//               <p>
//                 <strong>Status:</strong> {appointment.status}
//               </p>
//               {appointment.status !== "Rejected" && (
//                 <p>
//                   <strong>Timing:</strong>{" "}
//                   {!appointment.Timing
//                     ? "Not selected by the doctor"
//                     : appointment.Timing}
//                 </p>
//               )}
//               <p>
//                 <strong>Meeting ID:</strong>{" "}
//                 {appointment.meetingid &&
//                 appointment.meetingid !== "not yet decided" ? (
//                   <a
//                     href={appointment.meetingid}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                   >
//                     Join Meeting
//                   </a>
//                 ) : (
//                   "Not yet decided"
//                 )}
//               </p>
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// };

// export default Appointments;

import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import "./appointment.css";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = getAuth().currentUser; // Get current logged-in user

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

  if (loading) return <div className="loading">Loading appointments...</div>;

  return (
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
                        ? "status-accepted" // Add this condition for "Accepted"
                        : "status-pending"
                      // ? "status-approved"
                      // : appointment.status === "Rejected"
                      // ? "status-rejected"
                      // : "status-pending"
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Appointments;
