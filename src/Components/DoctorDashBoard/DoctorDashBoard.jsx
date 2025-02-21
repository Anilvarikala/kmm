import React, { useEffect, useState } from "react";
import { db } from "../../firebase"; // Firebase initialization
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import "./DoctorDashBoard.css"; // Import your CSS file for styling

const DoctorDashBoard = () => {
  const [uid, setUid] = useState();
  const [appointments, setAppointments] = useState([]);
  const [selectedTime, setSelectedTime] = useState({});
  const [showTimeInput, setShowTimeInput] = useState(false);
  const [currentAppointmentId, setCurrentAppointmentId] = useState(null);
  const [googleMeetLink, setGoogleMeetLink] = useState(""); // State for Google Meet link
  const [meetingIdInputs, setMeetingIdInputs] = useState({}); // State for editable meeting ID for each appointment

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
        console.log("User UID:", user.uid); // Access UID here
      } else {
        console.log("No user is signed in");
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (uid) {
        const q = query(
          collection(db, "appointments"),
          where("doctorId", "==", uid) // Filter by doctorId
        );

        const querySnapshot = await getDocs(q);
        const appointmentsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAppointments(appointmentsData); // Set appointments to state
      }
    };

    fetchAppointments(); // Fetch appointments on component mount
  }, [uid]);

  const handleAcceptAppointment = (appointmentId) => {
    setCurrentAppointmentId(appointmentId);
    setShowTimeInput(true);
    // Generate a new Google Meet link when accepting the appointment
    const meetLink = "https://meet.google.com/landing";
    setGoogleMeetLink(meetLink); // Save Google Meet link in state
  };

  const handleRejectAppointment = async (appointmentId) => {
    try {
      const appointmentRef = doc(db, "appointments", appointmentId);
      await updateDoc(appointmentRef, { status: "Rejected" }); // Update status to "Rejected"
      setAppointments((prevAppointments) =>
        prevAppointments.map((appt) =>
          appt.id === appointmentId ? { ...appt, status: "Rejected" } : appt
        )
      );
    } catch (error) {
      console.error("Error rejecting appointment:", error);
    }
  };

  const handleTimeChange = (event) => {
    setSelectedTime({
      ...selectedTime,
      [currentAppointmentId]: event.target.value,
    });
  };

  const handleConfirmTime = async () => {
    if (!selectedTime[currentAppointmentId]) {
      alert("Please select a time for the appointment.");
      return;
    }

    try {
      const appointmentRef = doc(db, "appointments", currentAppointmentId);
      await updateDoc(appointmentRef, {
        status: "Accepted",
        appointmentTime: selectedTime[currentAppointmentId], // Save the time
        googleMeetLink, // Save the Google Meet link
      });

      setAppointments((prevAppointments) =>
        prevAppointments.map((appt) =>
          appt.id === currentAppointmentId
            ? {
                ...appt,
                status: "Accepted",
                appointmentTime: selectedTime[currentAppointmentId],
                googleMeetLink, // Save Google Meet link
              }
            : appt
        )
      );
      setShowTimeInput(false);
      setCurrentAppointmentId(null);
      setGoogleMeetLink(""); // Reset Google Meet link after saving
    } catch (error) {
      console.error("Error accepting appointment:", error);
    }
  };

  const handleMeetingIdChange = (appointmentId, event) => {
    setMeetingIdInputs({
      ...meetingIdInputs,
      [appointmentId]: event.target.value, // Update meeting ID only for the current appointment
    });
  };

  const handleSaveMeetingId = async (appointmentId) => {
    const meetingId = meetingIdInputs[appointmentId];

    if (!meetingId) {
      alert("Meeting is successfully created!")
      return;
    }

    try {
      const appointmentRef = doc(db, "appointments", appointmentId);
      await updateDoc(appointmentRef, {
        meetingId, // Save the meeting ID for the current appointment
      });

      setAppointments((prevAppointments) =>
        prevAppointments.map((appt) =>
          appt.id === appointmentId
            ? {
                ...appt,
                meetingId, // Update appointment with the new meeting ID
              }
            : appt
        )
      );
      // alert("Meeting is successfully created!")
      // Clear the input field after saving
      setMeetingIdInputs((prevInputs) => {
        const updatedInputs = { ...prevInputs };
        delete updatedInputs[appointmentId]; // Remove the input state for the updated appointment
        return updatedInputs;
      });
    } catch (error) {
      console.error("Error saving meeting ID:", error);
    }
  };

  return (
    <div>
      <h2>Doctor Dashboard</h2>
      <h3>Your Appointments</h3>
      {appointments.length === 0 ? (
        <p>No appointments scheduled.</p>
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
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>{appointment.patientName}</td>
                  <td>{appointment.appointmentDate}</td>
                  <td
                    className={
                      appointment.status === "Accepted"
                        ? "status-accepted"
                        : appointment.status === "Rejected"
                        ? "status-rejected"
                        : "status-pending"
                    }
                  >
                    {appointment.status}
                  </td>
                  <td>
                    {appointment.status === "Pending" && (
                      <>
                        <button
                          onClick={() =>
                            handleAcceptAppointment(appointment.id)
                          }
                        >
                          Accept Appointment
                        </button>
                        <button
                          onClick={() =>
                            handleRejectAppointment(appointment.id)
                          }
                        >
                          Reject Appointment
                        </button>
                      </>
                    )}
                    {(appointment.status === "Accepted" ||
                      appointment.status === "Rejected") && (
                      <span>-</span> // Display dash after completing the action
                    )}
                  </td>
                  <td>
                    {appointment.status === "Rejected" ? (
                      <span>-</span>
                    ) : (
                      showTimeInput &&
                      currentAppointmentId === appointment.id && (
                        <div>
                          <label>Select Time: </label>
                          <input
                            type="time"
                            value={selectedTime[currentAppointmentId] || ""}
                            onChange={handleTimeChange}
                          />
                          <button onClick={handleConfirmTime}>
                            Confirm Time
                          </button>
                        </div>
                      )
                    )}
                    {appointment.status === "Accepted" &&
                      appointment.appointmentTime && (
                        <span>{appointment.appointmentTime}</span>
                      )}
                  </td>
                  <td>
                    {appointment.status === "Rejected" ? (
                      <span>-</span>
                    ) : appointment.googleMeetLink ? (
                      <a
                        href={appointment.googleMeetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Create Meeting
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>
                    {appointment.status === "Rejected" ? (
                      <span>-</span>
                    ) : appointment.status === "Accepted" ? (
                      <div>
                        <label>Meeting ID:</label>
                        <input
                          type="text"
                          value={
                            meetingIdInputs[appointment.id] ||
                            appointment.meetingId ||
                            ""
                          }
                          onChange={(e) =>
                            handleMeetingIdChange(appointment.id, e)
                          }
                          placeholder="Enter Meeting ID"
                        />
                        <button
                          onClick={() => handleSaveMeetingId(appointment.id)}
                        >
                          Save Meeting ID
                        </button>
                      </div>
                    ) : (
                      "-"
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

export default DoctorDashBoard;
