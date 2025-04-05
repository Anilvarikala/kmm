import React, { useState } from "react";
import run from "../firebaseGemini";
import { v4 as uuidv4 } from "uuid";
import "./Severity.css";
import {
  PlusCircle,
  AlertCircle,
  Loader,
  X,
  CheckCircle,
  ThermometerIcon,
  CalendarIcon,
  PillIcon,
  ActivityIcon,
  MoonIcon,
  Plus,
  MessageCircle,
  UserCircle2,
} from "lucide-react";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const MedicalForm = () => {
  const [symptom, setSymptom] = useState("");
  const [extraSymptom, setExtraSymptom] = useState("");
  const [extraSymptoms, setExtraSymptoms] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [severity, setSeverity] = useState("");
  const [loading, setLoading] = useState(false);
  const [assistanceInfo, setAssistanceInfo] = useState(null);
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const db = getFirestore();

  const fetchQuestions = async () => {
    if (!symptom.trim()) return;

    setLoading(true);
    try {
      const allSymptoms = [symptom, ...extraSymptoms].join(", ");
      const prompt = `Generate a structured JSON list of 10 medical assessment questions based on the symptoms: "${allSymptoms}".
      Each question should have:
      - "question": (string) - Make it specific to the symptoms
      - "type": "dropdown"
      - "options": array of 4 relevant options
      - "icon": one of these: "calendar", "pill", "activity", "thermometer", "moon"
      Return a valid JSON array with exactly 10 questions.`;
      const res = await run(prompt);
      const jsonStart = res.indexOf("[");
      const jsonEnd = res.lastIndexOf("]") + 1;
      const jsonString = res.substring(jsonStart, jsonEnd);
      try {
        const parsedQuestions = JSON.parse(jsonString);
        setQuestions(parsedQuestions);
        setShowPopup(true);
      } catch (e) {
        console.error("Error parsing JSON:", e, jsonString);
        const fallbackQuestions = [
          {
            question: `When did your ${symptom} start?`,
            type: "dropdown",
            options: ["Today", "Yesterday", "Past week", "Over a week ago"],
            icon: "calendar",
          },
          {
            question: "How severe is the condition?",
            type: "dropdown",
            options: ["Mild", "Moderate", "Severe", "Very severe"],
            icon: "activity",
          },
        ];
        setQuestions(fallbackQuestions);
        setShowPopup(true);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      const fallbackQuestions = [
        {
          question: `When did your ${symptom} start?`,
          type: "dropdown",
          options: ["Today", "Yesterday", "Past week", "Over a week ago"],
          icon: "calendar",
        },
        {
          question: "How severe is the condition?",
          type: "dropdown",
          options: ["Mild", "Moderate", "Severe", "Very severe"],
          icon: "activity",
        },
      ];
      setQuestions(fallbackQuestions);
      setShowPopup(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (index, value) => {
    setAnswers({ ...answers, [index]: value });
  };

  const submitAnswers = async () => {
    setLoading(true);
    try {
      const prompt = `Based on these symptoms: "${symptom}, ${extraSymptoms.join(
        ", "
      )}" and these assessment answers:
      ${Object.entries(answers)
        .map(([index, answer]) => `${questions[index].question}: ${answer}`)
        .join("\n")}

      Determine the severity level as "Normal", "Moderate", or "High".
      Consider:
      1. Symptom duration
      2. Symptom intensity
      3. Impact on daily life
      4. Risk factors

      Return ONLY ONE WORD: Normal, Moderate, or High`;
      const res = await run(prompt);
      const severityLevel = res.trim().replace(/[^a-zA-Z]/g, "");
      setSeverity(severityLevel);
    } catch (error) {
      console.error("Error determining severity:", error);
    } finally {
      setLoading(false);
      setShowPopup(false);
    }
  };

  const handleAddExtraSymptom = () => {
    if (extraSymptom.trim()) {
      setExtraSymptoms([...extraSymptoms, extraSymptom.trim()]);
      setExtraSymptom("");
    }
  };

  const getAssistance = async () => {
    setLoading(true);
    try {
      const allSymptoms = [symptom, ...extraSymptoms].join(", ");
      const prompt = `You are a medical professional. Based on the symptoms: ${allSymptoms}, and severity level: ${severity}, provide ONLY the following information:
      1. For specialist: Return ONLY the exact medical specialist type needed (e.g., "Cardiologist", "Neurologist", etc.)

      2. For severity "Normal":
         - List EXACTLY 3 specific over-the-counter medicines that are commonly recommended for these symptoms
         - List EXACTLY 3 specific foods or drinks that can help alleviate these symptoms
         - List EXACTLY 3 specific foods or drinks that should be avoided with these symptoms

         IMPORTANT:
         - Use ONLY real medicine and food names
         - Be VERY specific (e.g., "Ibuprofen 400mg" instead of just "pain reliever")
         - For foods, specify preparation if relevant (e.g., "Warm ginger tea" instead of just "ginger")

      3. For severity "Low" or "Normal" or "Moderate" or "High":
         Message: "Please schedule an immediate video consultation with our specialist."

      Return as JSON with these exact keys:
      {
        "specialist": "exact specialist name",
        "medicines": ["specific medicine 1", "specific medicine 2", "specific medicine 3"],
        "foodsToEat": ["specific food 1", "specific food 2", "specific food 3"],
        "foodsToAvoid": ["specific food 1", "specific food 2", "specific food 3"],
        "message": "consultation message if needed"
      };`;
      const res = await run(prompt);
      const jsonStart = res.indexOf("{");
      const jsonEnd = res.lastIndexOf("}") + 1;
      const jsonString = res.substring(jsonStart, jsonEnd);
      try {
        const parsedResponse = JSON.parse(jsonString);
        setAssistanceInfo(parsedResponse);
      } catch (e) {
        console.error("Error parsing assistance JSON:", e, jsonString);
        setAssistanceInfo({
          specialist: "General Physician",
          message: "Please consult a doctor.",
        });
      }
    } catch (error) {
      console.error("Error fetching assistance info:", error);
      setAssistanceInfo({
        specialist: "General Physician",
        message: "Please consult a doctor.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName) => {
    const iconMap = {
      calendar: CalendarIcon,
      pill: PillIcon,
      activity: ActivityIcon,
      thermometer: ThermometerIcon,
      moon: MoonIcon,
    };
    return iconMap[iconName] || ActivityIcon;
  };

  const handleScheduleConsultation = async () => {
    if (!assistanceInfo?.specialist || !currentUser) {
      console.error("Specialist information or user not available.");
      return;
    }
    setLoading(true);
    try {
      const assessmentSpecialist = assistanceInfo.specialist;
      const doctorsRef = collection(db, "doctors");
      const q = query(doctorsRef, where("active", "==", true));
      const querySnapshot = await getDocs(q);

      let appointmentCreated = false;
      const appointment_id = uuidv4();
      for (const doctorDoc of querySnapshot.docs) {
        const doctorData = doctorDoc.data();
        const doctorSpecialization = doctorData.fieldOfStudy;

        // const prompt = `According to standard medical terminology, is "${assessmentSpecialist}" the same as or a recognized synonym for "${doctorSpecialization}"? Answer with only "yes" or "no".`;
         const prompt = `Are "${doctorSpecialization}" and "${assessmentSpecialist}" synonymous in medicine? Yes/No`;
        const res = await run(prompt);
       const geminiResponse = res.trim().toLowerCase();
        console.log(geminiResponse);
        if (res.toLowerCase().includes("yes")) {
          const appointmentsRef = collection(db, "appointments");
          await addDoc(appointmentsRef, {
            DoctorName: doctorData.name,
            appointmentDate: new Date().toISOString().split("T")[0], // Today's date
            doctorId: doctorDoc.id,
            patientId: currentUser.uid,
            patientName: localStorage.getItem("name") || "Patient", // Use display name if available
            status: "Pending", // Or 'Scheduled'
            // not_acceptable: false, // Marked as false initially
            appointment_id: appointment_id,
          });
          // alert(
          //   `Video consultation scheduled with ${doctorData.name} (Specialization: ${doctorSpecialization})!`
          // );
          appointmentCreated = true;
          // Schedule with the first matching doctor and exit the loop
        }
      }
      
      alert("Appointment booked successfully!!")

      if (!appointmentCreated) {
        alert(
          `No doctor found with a specialization matching "${assessmentSpecialist}" according to medical terminology.`
        );
      }
    } catch (error) {
      console.error("Error scheduling consultation:", error);
      alert("Failed to schedule consultation. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="medical-form-container">
      <h2>
        <AlertCircle className="inline-block mr-2 text-blue-500" size={32} />
        Medical Assistant
      </h2>

      <div className="form-section">
        <div className="input-group">
          <label>Primary Symptom:</label>
          <div className="symptom-input-group">
            <input
              type="text"
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              placeholder="Enter your main symptom"
              required
            />
            {symptom && (
              <button
                onClick={fetchQuestions}
                disabled={loading}
                className="check-severity-btn-inline"
              >
                {loading ? (
                  <Loader className="animate-spin" size={18} />
                ) : (
                  <AlertCircle size={18} />
                )}
                Check Severity
              </button>
            )}
          </div>
        </div>

        <div className="input-group">
          <label>Additional Symptoms:</label>
          <div className="extra-symptom-input">
            <input
              type="text"
              value={extraSymptom}
              onChange={(e) => setExtraSymptom(e.target.value)}
              placeholder="Enter additional symptom"
            />
            <button
              type="button"
              onClick={handleAddExtraSymptom}
              className="add-symptom-btn"
            >
              <Plus size={18} />
            </button>
          </div>
          {extraSymptoms.length > 0 && (
            <div className="extra-symptoms-list">
              {extraSymptoms.map((item, index) => (
                <div key={index} className="symptom-tag">
                  {item}
                  <X
                    size={14}
                    className="remove-symptom"
                    onClick={() =>
                      setExtraSymptoms(
                        extraSymptoms.filter((_, i) => i !== index)
                      )
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {severity && (
        <div className="severity-result">
          <h3>Assessment Result</h3>
          <div className={`severity-badge ${severity.toLowerCase()}`}>
            {severity} Severity
          </div>
          <button
            onClick={getAssistance}
            disabled={loading}
            className="get-assistance-btn"
          >
            {loading ? (
              <>
                <Loader className="animate-spin mr-2" size={18} />
                Getting Help...
              </>
            ) : (
              <>
                <MessageCircle size={18} className="mr-2" />
                Get Medical Advice
              </>
            )}
          </button>
        </div>
      )}

      {showPopup && (
        <div className="modal-overlay" onClick={() => setShowPopup(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <AlertCircle
                  className="inline-block mr-2 text-blue-500"
                  size={24}
                />
                Medical Assessment for {symptom}
              </h3>
              <button
                className="close-modal"
                onClick={() => setShowPopup(false)}
              >
                <X size={24} />
              </button>
            </div>

            <div className="modal-content">
              {questions.map((q, index) => {
                const Icon = getIconComponent(q.icon);
                return (
                  <div key={index} className="question-item">
                    <label>
                      <Icon
                        size={18}
                        className="inline-block mr-2 text-blue-500"
                      />
                      {q.question}
                    </label>
                    <select
                      onChange={(e) =>
                        handleAnswerChange(index, e.target.value)
                      }
                      value={answers[index] || ""}
                    >
                      <option value="">Select an answer</option>
                      {q.options.map((opt, i) => (
                        <option key={i} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>

            <div className="modal-footer">
              <button
                onClick={submitAnswers}
                disabled={
                  loading || Object.keys(answers).length !== questions.length
                }
                className="submit-assessment-btn"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin mr-2" size={18} />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} className="mr-2" />
                    Submit Assessment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {assistanceInfo && (
        <div className="assistance-container">
          <div className="assistance-content">
            <div className="specialist-section">
              <UserCircle2 className="text-blue-500 mb-2" size={24} />
              <h3>Assessment Results</h3>
              <p className="specialist-name">{assistanceInfo.specialist}</p>
            </div>

            {true ? (
              <>
                <div className="recommendations-section">
                  <div className="recommendation-group">
                    <h4>
                      <PillIcon
                        size={18}
                        className="inline-block mr-2 text-blue-500"
                      />
                      Recommended Medicines
                    </h4>
                    <ul>
                      {assistanceInfo.medicines.map((med, index) => (
                        <li key={index}>{med}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="recommendation-group">
                    <h4>
                      <CheckCircle
                        size={18}
                        className="inline-block mr-2 text-green-500"
                      />
                      Foods to Eat
                    </h4>
                    <ul>
                      {assistanceInfo.foodsToEat.map((food, index) => (
                        <li key={index}>{food}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="recommendation-group">
                    <h4>
                      <X size={18} className="inline-block mr-2 text-red-500" />
                      Foods to Avoid
                    </h4>
                    <ul>
                      {assistanceInfo.foodsToAvoid.map((food, index) => (
                        <li key={index}>{food}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="urgent-message">{assistanceInfo.message}</div>
              </>
            ) : (
              <div className="urgent-message">{assistanceInfo.message}</div>
            )}
          </div>

          {assistanceInfo.specialist && currentUser && (
            <button
              className="book-appointment-btn"
              onClick={handleScheduleConsultation}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="animate-spin mr-2" size={18} />
                  Checking Doctors...
                </>
              ) : (
                <>
                  <CalendarIcon size={18} className="mr-2" />
                  Schedule Video Consultation
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MedicalForm;

// // import React, { useState } from "react";
// // import { v4 as uuidv4 } from "uuid"; // Import uuid for generating unique appointment IDs
// // import run from "../firebaseGemini";
// // import "./Severity.css";
// // import {
// //   PlusCircle,
// //   AlertCircle,
// //   Loader,
// //   X,
// //   CheckCircle,
// //   ThermometerIcon,
// //   CalendarIcon,
// //   PillIcon,
// //   ActivityIcon,
// //   MoonIcon,
// //   Plus,
// //   MessageCircle,
// //   UserCircle2,
// // } from "lucide-react";
// // import {
// //   getFirestore,
// //   collection,
// //   query,
// //   where,
// //   getDocs,
// //   addDoc,
// // } from "firebase/firestore";
// // import { getAuth } from "firebase/auth";

// // const MedicalForm = () => {
// //   const [symptom, setSymptom] = useState("");
// //   const [extraSymptom, setExtraSymptom] = useState("");
// //   const [extraSymptoms, setExtraSymptoms] = useState([]);
// //   const [questions, setQuestions] = useState([]);
// //   const [answers, setAnswers] = useState({});
// //   const [showPopup, setShowPopup] = useState(false);
// //   const [severity, setSeverity] = useState("");
// //   const [loading, setLoading] = useState(false);
// //   const [assistanceInfo, setAssistanceInfo] = useState(null);
// //   const auth = getAuth();
// //   const currentUser = auth.currentUser;
// //   const db = getFirestore();

// //   const fetchQuestions = async () => {
// //     if (!symptom.trim()) return;

// //     setLoading(true);
// //     try {
// //       const allSymptoms = [symptom, ...extraSymptoms].join(", ");
// //       const prompt = `Generate a structured JSON list of 10 medical assessment questions based on the symptoms: "${allSymptoms}". Each question should have: - "question": (string) - Make it specific to the symptoms - "type": "dropdown" - "options": array of 4 relevant options - "icon": one of these: "calendar", "pill", "activity", "thermometer", "moon" Return a valid JSON array with exactly 10 questions.`;
// //       const res = await run(prompt);
// //       const jsonStart = res.indexOf("[");
// //       const jsonEnd = res.lastIndexOf("]") + 1;
// //       const jsonString = res.substring(jsonStart, jsonEnd);
// //       try {
// //         const parsedQuestions = JSON.parse(jsonString);
// //         setQuestions(parsedQuestions);
// //         setShowPopup(true);
// //       } catch (e) {
// //         console.error("Error parsing JSON:", e, jsonString);
// //         const fallbackQuestions = [
// //           {
// //             question: `When did your ${symptom} start?`,
// //             type: "dropdown",
// //             options: ["Today", "Yesterday", "Past week", "Over a week ago"],
// //             icon: "calendar",
// //           },
// //           {
// //             question: "How severe is the condition?",
// //             type: "dropdown",
// //             options: ["Mild", "Moderate", "Severe", "Very severe"],
// //             icon: "activity",
// //           },
// //         ];
// //         setQuestions(fallbackQuestions);
// //         setShowPopup(true);
// //       }
// //     } catch (error) {
// //       console.error("Error fetching questions:", error);
// //       const fallbackQuestions = [
// //         {
// //           question: `When did your ${symptom} start?`,
// //           type: "dropdown",
// //           options: ["Today", "Yesterday", "Past week", "Over a week ago"],
// //           icon: "calendar",
// //         },
// //         {
// //           question: "How severe is the condition?",
// //           type: "dropdown",
// //           options: ["Mild", "Moderate", "Severe", "Very severe"],
// //           icon: "activity",
// //         },
// //       ];
// //       setQuestions(fallbackQuestions);
// //       setShowPopup(true);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleAnswerChange = (index, value) => {
// //     setAnswers({ ...answers, [index]: value });
// //   };

// //   const submitAnswers = async () => {
// //     setLoading(true);
// //     try {
// //       const prompt = `Based on these symptoms: "${symptom}, ${extraSymptoms.join(
// //         ", "
// //       )}" and these assessment answers: ${Object.entries(answers)
// //         .map(([index, answer]) => `${questions[index].question}: ${answer}`)
// //         .join(
// //           "\n"
// //         )} Determine the severity level as "Normal", "Moderate", or "High". Consider: 1. Symptom duration 2. Symptom intensity 3. Impact on daily life 4. Risk factors Return ONLY ONE WORD: Normal, Moderate, or High;`;
// //       const res = await run(prompt);
// //       const severityLevel = res.trim().replace(/[^a-zA-Z]/g, "");
// //       setSeverity(severityLevel);
// //     } catch (error) {
// //       console.error("Error determining severity:", error);
// //     } finally {
// //       setLoading(false);
// //       setShowPopup(false);
// //     }
// //   };

// //   const handleAddExtraSymptom = () => {
// //     if (extraSymptom.trim()) {
// //       setExtraSymptoms([...extraSymptoms, extraSymptom.trim()]);
// //       setExtraSymptom("");
// //     }
// //   };

// //   const getAssistance = async () => {
// //     setLoading(true);
// //     try {
// //       const allSymptoms = [symptom, ...extraSymptoms].join(", ");
// //       const prompt = `You are a medical professional. Based on the symptoms: ${allSymptoms}, and severity level: ${severity}, provide ONLY the following information: 1. For specialist: Return ONLY the exact medical specialist type needed (e.g., "Cardiologist", "Neurologist", etc.) 2. For severity "Normal": - List EXACTLY 3 specific over-the-counter medicines that are commonly recommended for these symptoms - List EXACTLY 3 specific foods or drinks that can help alleviate these symptoms - List EXACTLY 3 specific foods or drinks that should be avoided with these symptoms IMPORTANT: - Use ONLY real medicine and food names - Be VERY specific (e.g., "Ibuprofen 400mg" instead of just "pain reliever") - For foods, specify preparation if relevant (e.g., "Warm ginger tea" instead of just "ginger") 3. For severity "Moderate" or "High": Message: "Please schedule an immediate video consultation with our specialist." Return as JSON with these exact keys: { "specialist": "exact specialist name", "medicines": ["specific medicine 1", "specific medicine 2", "specific medicine 3"], "foodsToEat": ["specific food 1", "specific food 2", "specific food 3"], "foodsToAvoid": ["specific food 1", "specific food 2", "specific food 3"], "message": "consultation message if needed" };`;
// //       const res = await run(prompt);
// //       const jsonStart = res.indexOf("{");
// //       const jsonEnd = res.lastIndexOf("}") + 1;
// //       const jsonString = res.substring(jsonStart, jsonEnd);
// //       try {
// //         const parsedResponse = JSON.parse(jsonString);
// //         setAssistanceInfo(parsedResponse);
// //       } catch (e) {
// //         console.error("Error parsing assistance JSON:", e, jsonString);
// //         setAssistanceInfo({
// //           specialist: "General Physician",
// //           message: "Please consult a doctor.",
// //         });
// //       }
// //     } catch (error) {
// //       console.error("Error fetching assistance info:", error);
// //       setAssistanceInfo({
// //         specialist: "General Physician",
// //         message: "Please consult a doctor.",
// //       });
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const getIconComponent = (iconName) => {
// //     const iconMap = {
// //       calendar: CalendarIcon,
// //       pill: PillIcon,
// //       activity: ActivityIcon,
// //       thermometer: ThermometerIcon,
// //       moon: MoonIcon,
// //     };
// //     return iconMap[iconName] || ActivityIcon;
// //   };

// //   const handleScheduleConsultation = async () => {
// //     if (!assistanceInfo?.specialist || !currentUser) {
// //       console.error("Specialist information or user not available.");
// //       return;
// //     }
// //     setLoading(true);
// //     try {
// //       const assessmentSpecialist = assistanceInfo.specialist;
// //       const doctorsRef = collection(db, "doctors");
// //       const q = query(doctorsRef, where("active", "==", true));
// //       const querySnapshot = await getDocs(q);

// //       let appointmentCreated = false;
// //       const appointmentId = uuidv4();
// //       for (const doctorDoc of querySnapshot.docs) {
// //         const doctorData = doctorDoc.data();
// //         const doctorSpecialization = doctorData.fieldOfStudy;

// //         const prompt = `According to standard medical terminology, is "${assessmentSpecialist}" the same as or a recognized synonym for "${doctorSpecialization}"? Answer with only "yes" or "no".`;
// //         const res = await run(prompt);
// //         const geminiResponse = res.trim().toLowerCase();
// //         console.log(geminiResponse);
// //         if (geminiResponse.toLowerCase() == "yes") {
// //           const appointmentsRef = collection(db, "appointments");

// //           // Generate a unique appointment ID for this specialist
// //           // const appointmentId = uuidv4();

// //           // Add the appointment with the new fields
// //           await addDoc(appointmentsRef, {
// //             DoctorName: doctorData.name,
// //             appointmentDate: new Date().toISOString().split("T")[0], // Today's date
// //             doctorId: doctorDoc.id,
// //             patientId: currentUser.uid,
// //             patientName: localStorage.getItem("name") || "Patient", // Use display name if available
// //             status: "Pending", // Or 'Scheduled'
// //             not_acceptable: false, // Marked as false initially
// //             appointment_id: appointmentId, // Unique appointment ID
// //           });
// //           alert(
// //             `Video consultation scheduled with ${doctorData.name} (Specialization: ${doctorSpecialization})!`
// //           );
// //           appointmentCreated = true;
// //           // Schedule with the first matching doctor and exit the loop
// //           // We exit the loop after scheduling the appointment
// //         }
// //       }

// //       if (!appointmentCreated) {
// //         alert(
// //           `No doctor found with a specialization matching "${assessmentSpecialist}" according to medical terminology.`
// //         );
// //       }
// //     } catch (error) {
// //       console.error("Error scheduling consultation:", error);
// //       alert("Failed to schedule consultation. Please try again later.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <div className="medical-form-container">
// //       <h2>
// //         <AlertCircle className="inline-block mr-2 text-blue-500" size={32} />
// //         Medical Assistant
// //       </h2>

// //       {/* Main form layout with symptoms input and assessment */}
// //       <div className="form-section">
// //         {/* Symptom input */}
// //         <div className="input-group">
// //           <label>Primary Symptom:</label>
// //           <div className="symptom-input-group">
// //             <input
// //               type="text"
// //               value={symptom}
// //               onChange={(e) => setSymptom(e.target.value)}
// //               placeholder="Enter your main symptom"
// //               required
// //             />
// //             {symptom && (
// //               <button
// //                 onClick={fetchQuestions}
// //                 disabled={loading}
// //                 className="check-severity-btn-inline"
// //               >
// //                 {loading ? (
// //                   <Loader className="animate-spin" size={18} />
// //                 ) : (
// //                   <AlertCircle size={18} />
// //                 )}
// //                 Check Severity
// //               </button>
// //             )}
// //           </div>
// //         </div>

// //         {/* Additional symptoms input */}
// //         <div className="input-group">
// //           <label>Additional Symptoms:</label>
// //           <div className="extra-symptom-input">
// //             <input
// //               type="text"
// //               value={extraSymptom}
// //               onChange={(e) => setExtraSymptom(e.target.value)}
// //               placeholder="Enter additional symptom"
// //             />
// //             <button
// //               type="button"
// //               onClick={handleAddExtraSymptom}
// //               className="add-symptom-btn"
// //             >
// //               <Plus size={18} />
// //             </button>
// //           </div>
// //           {extraSymptoms.length > 0 && (
// //             <div className="extra-symptoms-list">
// //               <ul>
// //                 {extraSymptoms.map((symptom, index) => (
// //                   <li key={index}>
// //                     {symptom}{" "}
// //                     <X
// //                       className="remove-symptom-btn"
// //                       size={16}
// //                       onClick={() =>
// //                         setExtraSymptoms(
// //                           extraSymptoms.filter((s, i) => i !== index)
// //                         )
// //                       }
// //                     />
// //                   </li>
// //                 ))}
// //               </ul>
// //             </div>
// //           )}
// //         </div>

// //         {/* Show Popup with Questions */}
// //         {showPopup && (
// //           <div className="questions-popup">
// //             <div className="popup-header">
// //               <h3>Assessment Questions</h3>
// //               <button className="close-btn" onClick={() => setShowPopup(false)}>
// //                 <X size={20} />
// //               </button>
// //             </div>
// //             <div className="questions-container">
// //               {questions.map((question, index) => (
// //                 <div className="question-item" key={index}>
// //                   <div className="question-icon">
// //                     {getIconComponent(question.icon) &&
// //                       React.createElement(getIconComponent(question.icon))}
// //                   </div>
// //                   <div className="question-text">{question.question}</div>
// //                   <select
// //                     onChange={(e) => handleAnswerChange(index, e.target.value)}
// //                     value={answers[index] || ""}
// //                   >
// //                     {question.options.map((option, i) => (
// //                       <option key={i} value={option}>
// //                         {option}
// //                       </option>
// //                     ))}
// //                   </select>
// //                 </div>
// //               ))}
// //             </div>
// //             <button
// //               className="submit-btn"
// //               onClick={submitAnswers}
// //               disabled={loading}
// //             >
// //               {loading ? (
// //                 <Loader className="animate-spin" size={18} />
// //               ) : (
// //                 "Submit Answers"
// //               )}
// //             </button>
// //           </div>
// //         )}

// //         {/* Show Assistance Information */}
// //         {assistanceInfo && (
// //           <div className="assistance-info">
// //             <div>
// //               <h4>Specialist Required:</h4>
// //               <p>{assistanceInfo.specialist}</p>
// //             </div>
// //             <button
// //               onClick={handleScheduleConsultation}
// //               className="schedule-btn"
// //             >
// //               Schedule Consultation
// //             </button>
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // };

// // export default MedicalForm;

// // import React, { useState } from "react";
// // import run from "../firebaseGemini";
// // import "./Severity.css";
// // import { 
// //   PlusCircle, 
// //   AlertCircle, 
// //   Loader, 
// //   X, 
// //   CheckCircle, 
// //   ThermometerIcon, 
// //   CalendarIcon, 
// //   PillIcon, 
// //   ActivityIcon, 
// //   MoonIcon,
// //   Plus,
// //   MessageCircle,
// //   UserCircle2
// // } from 'lucide-react';

// // const MedicalForm = () => {
// //   const [symptom, setSymptom] = useState("");
// //   const [extraSymptom, setExtraSymptom] = useState("");
// //   const [extraSymptoms, setExtraSymptoms] = useState([]);
// //   const [questions, setQuestions] = useState([]);
// //   const [answers, setAnswers] = useState({});
// //   const [showPopup, setShowPopup] = useState(false);
// //   const [severity, setSeverity] = useState("");
// //   const [loading, setLoading] = useState(false);
// //   const [assistanceInfo, setAssistanceInfo] = useState(null);

// //   const fetchQuestions = async () => {
// //     if (!symptom.trim()) return;
    
// //     setLoading(true);
// //     try {
// //       const allSymptoms = [symptom, ...extraSymptoms].join(", ");
// //       const prompt = `Generate a structured JSON list of 10 medical assessment questions based on the symptoms: "${allSymptoms}". 
// //       Each question should have:
// //       - "question": (string) - Make it specific to the symptoms
// //       - "type": "dropdown"
// //       - "options": array of 4 relevant options
// //       - "icon": one of these: "calendar", "pill", "activity", "thermometer", "moon"
// //       Return a valid JSON array with exactly 10 questions.`;

// //       const res = await run(prompt);
// //       const jsonStart = res.indexOf("[");
// //       const jsonEnd = res.lastIndexOf("]") + 1;
// //       const jsonString = res.substring(jsonStart, jsonEnd);
// //       const parsedQuestions = JSON.parse(jsonString);

// //       setQuestions(parsedQuestions);
// //       setShowPopup(true);
// //     } catch (error) {
// //       console.error("Error fetching questions:", error);
// //       // Fallback questions if API fails
// //       const fallbackQuestions = [
// //         {
// //           question: `When did your ${symptom} start?`,
// //           type: "dropdown",
// //           options: ["Today", "Yesterday", "Past week", "Over a week ago"],
// //           icon: "calendar"
// //         },
// //         {
// //           question: "How severe is the condition?",
// //           type: "dropdown",
// //           options: ["Mild", "Moderate", "Severe", "Very severe"],
// //           icon: "activity"
// //         }
// //       ];
// //       setQuestions(fallbackQuestions);
// //       setShowPopup(true);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleAnswerChange = (index, value) => {
// //     setAnswers({ ...answers, [index]: value });
// //   };

// //   const submitAnswers = async () => {
// //     setLoading(true);
// //     try {
// //       const prompt = `Based on these symptoms: "${symptom}, ${extraSymptoms.join(", ")}"
// //       and these assessment answers:
// //       ${Object.entries(answers)
// //         .map(([index, answer]) => `${questions[index].question}: ${answer}`)
// //         .join("\n")}
      
// //       Determine the severity level as "Normal", "Moderate", or "High".
// //       Consider:
// //       1. Symptom duration
// //       2. Symptom intensity
// //       3. Impact on daily life
// //       4. Risk factors
      
// //       Return ONLY ONE WORD: Normal, Moderate, or High`;

// //       const res = await run(prompt);
// //       const severityLevel = res.trim().replace(/[^a-zA-Z]/g, "");
// //       setSeverity(severityLevel);
// //     } catch (error) {
// //       console.error("Error determining severity:", error);
// //     } finally {
// //       setLoading(false);
// //       setShowPopup(false);
// //     }
// //   };

// //   const handleAddExtraSymptom = () => {
// //     if (extraSymptom.trim()) {
// //       setExtraSymptoms([...extraSymptoms, extraSymptom.trim()]);
// //       setExtraSymptom("");
// //     }
// //   };

// //   const getAssistance = async () => {
// //     setLoading(true);
// //     try {
// //       const allSymptoms = [symptom, ...extraSymptoms].join(", ");
// //       const prompt = `You are a medical professional. Based on the symptoms: ${allSymptoms}, and severity level: ${severity}, provide the following information:

// //       1. Specialist: Return the exact medical specialist type needed (e.g., "Dermatologist", "Neurologist", etc.)

// //       2. Regardless of severity, provide:
// //          - List EXACTLY 3 specific over-the-counter medicines that are commonly recommended for these symptoms
// //          - List EXACTLY 3 specific foods or drinks that can help alleviate these symptoms
// //          - List EXACTLY 3 specific foods or drinks that should be avoided with these symptoms
         
// //          IMPORTANT:
// //          - Use ONLY real medicine and food names
// //          - Be VERY specific (e.g., "Ibuprofen 400mg" instead of just "pain reliever")
// //          - For foods, specify preparation if relevant (e.g., "Warm ginger tea" instead of just "ginger")

// //       3. Message:
// //          - For "Normal": "Schedule a consultation with our [specialist] for proper evaluation"
// //          - For "Moderate": "We recommend scheduling a prompt video consultation with our [specialist]"
// //          - For "High": "Please schedule an immediate video consultation with our [specialist]. Urgent medical attention may be required."

// //       Return as JSON with these exact keys:
// //       {
// //         "specialist": "exact specialist name",
// //         "medicines": ["specific medicine 1", "specific medicine 2", "specific medicine 3"],
// //         "foodsToEat": ["specific food 1", "specific food 2", "specific food 3"],
// //         "foodsToAvoid": ["specific food 1", "specific food 2", "specific food 3"],
// //         "message": "consultation message"
// //       }`;

// //       const res = await run(prompt);
// //       const jsonStart = res.indexOf("{");
// //       const jsonEnd = res.lastIndexOf("}") + 1;
// //       const jsonString = res.substring(jsonStart, jsonEnd);
// //       const parsedResponse = JSON.parse(jsonString);
// //       setAssistanceInfo(parsedResponse);
// //     } catch (error) {
// //       console.error("Error fetching assistance info:", error);
// //       setAssistanceInfo({
// //         specialist: "General Physician",
// //         medicines: ["Consult doctor for medication"],
// //         foodsToEat: ["Maintain regular diet"],
// //         foodsToAvoid: ["Avoid trigger foods"],
// //         message: "Please consult a healthcare professional for proper evaluation."
// //       });
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const getIconComponent = (iconName) => {
// //     const iconMap = {
// //       calendar: CalendarIcon,
// //       pill: PillIcon,
// //       activity: ActivityIcon,
// //       thermometer: ThermometerIcon,
// //       moon: MoonIcon
// //     };
// //     return iconMap[iconName] || ActivityIcon;
// //   };

// //   return (
// //     <div className="medical-form-container">
// //       <h2>
// //         <AlertCircle className="inline-block mr-2 text-blue-500" size={32} />
// //         Medical Assistant
// //       </h2>

// //       <div className="form-section">
// //         <div className="input-group">
// //           <label>Primary Symptom:</label>
// //           <div className="symptom-input-group">
// //             <input
// //               type="text"
// //               value={symptom}
// //               onChange={(e) => setSymptom(e.target.value)}
// //               placeholder="Enter your main symptom"
// //               required
// //             />
// //             {symptom && (
// //               <button 
// //                 onClick={fetchQuestions} 
// //                 disabled={loading}
// //                 className="check-severity-btn-inline"
// //               >
// //                 {loading ? (
// //                   <Loader className="animate-spin" size={18} />
// //                 ) : (
// //                   <AlertCircle size={18} />
// //                 )}
// //                 Check Severity
// //               </button>
// //             )}
// //           </div>
// //         </div>

// //         <div className="input-group">
// //           <label>Additional Symptoms:</label>
// //           <div className="extra-symptom-input">
// //             <input
// //               type="text"
// //               value={extraSymptom}
// //               onChange={(e) => setExtraSymptom(e.target.value)}
// //               placeholder="Enter additional symptom"
// //             />
// //             <button 
// //               type="button" 
// //               onClick={handleAddExtraSymptom}
// //               className="add-symptom-btn"
// //             >
// //               <Plus size={18} />
// //             </button>
// //           </div>
// //           {extraSymptoms.length > 0 && (
// //             <div className="extra-symptoms-list">
// //               {extraSymptoms.map((item, index) => (
// //                 <div key={index} className="symptom-tag">
// //                   {item}
// //                   <X
// //                     size={14}
// //                     className="remove-symptom"
// //                     onClick={() => setExtraSymptoms(extraSymptoms.filter((_, i) => i !== index))}
// //                   />
// //                 </div>
// //               ))}
// //             </div>
// //           )}
// //         </div>
// //       </div>

// //       {severity && (
// //         <div className="severity-result">
// //           <h3>Assessment Result</h3>
// //           <div className={`severity-badge ${severity.toLowerCase()}`}>
// //             {severity} Severity
// //           </div>
// //           <button 
// //             onClick={getAssistance} 
// //             disabled={loading}
// //             className="get-assistance-btn"
// //           >
// //             {loading ? (
// //               <>
// //                 <Loader className="animate-spin mr-2" size={18} />
// //                 Getting Help...
// //               </>
// //             ) : (
// //               <>
// //                 <MessageCircle size={18} className="mr-2" />
// //                 Get Medical Advice
// //               </>
// //             )}
// //           </button>
// //         </div>
// //       )}

// //       {showPopup && (
// //         <div className="modal-overlay" onClick={() => setShowPopup(false)}>
// //           <div className="modal-container" onClick={e => e.stopPropagation()}>
// //             <div className="modal-header">
// //               <h3>
// //                 <AlertCircle className="inline-block mr-2 text-blue-500" size={24} />
// //                 Medical Assessment for {symptom}
// //               </h3>
// //               <button 
// //                 className="close-modal"
// //                 onClick={() => setShowPopup(false)}
// //               >
// //                 <X size={24} />
// //               </button>
// //             </div>

// //             <div className="modal-content">
// //               {questions.map((q, index) => {
// //                 const Icon = getIconComponent(q.icon);
// //                 return (
// //                   <div key={index} className="question-item">
// //                     <label>
// //                       <Icon size={18} className="inline-block mr-2 text-blue-500" />
// //                       {q.question}
// //                     </label>
// //                     <select
// //                       onChange={(e) => handleAnswerChange(index, e.target.value)}
// //                       value={answers[index] || ""}
// //                     >
// //                       <option value="">Select an answer</option>
// //                       {q.options.map((opt, i) => (
// //                         <option key={i} value={opt}>{opt}</option>
// //                       ))}
// //                     </select>
// //                   </div>
// //                 );
// //               })}
// //             </div>

// //             <div className="modal-footer">
// //               <button 
// //                 onClick={submitAnswers} 
// //                 disabled={loading || Object.keys(answers).length !== questions.length}
// //                 className="submit-assessment-btn"
// //               >
// //                 {loading ? (
// //                   <>
// //                     <Loader className="animate-spin mr-2" size={18} />
// //                     Processing...
// //                   </>
// //                 ) : (
// //                   <>
// //                     <CheckCircle size={18} className="mr-2" />
// //                     Submit Assessment
// //                   </>
// //                 )}
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {assistanceInfo && (
// //         <div className="assistance-container">
// //           <div className="assistance-content">
// //             <div className="specialist-section">
// //               <UserCircle2 className="text-blue-500 mb-2" size={24} />
// //               <h3>Recommended Specialist</h3>
// //               <p className="specialist-name">{assistanceInfo.specialist}</p>
// //             </div>

// //             <div className={`message-section ${severity.toLowerCase()}`}>
// //               <MessageCircle className="text-blue-500 mb-2" size={24} />
// //               <p className="consultation-message">{assistanceInfo.message}</p>
// //             </div>

// //             <div className="recommendations-section">
// //               <div className="recommendation-group">
// //                 <h4>
// //                   <PillIcon size={18} className="inline-block mr-2 text-blue-500" />
// //                   Recommended Medicines
// //                 </h4>
// //                 <ul>
// //                   {assistanceInfo.medicines.map((med, index) => (
// //                     <li key={index}>{med}</li>
// //                   ))}
// //                 </ul>
// //               </div>

// //               <div className="recommendation-group">
// //                 <h4>
// //                   <CheckCircle size={18} className="inline-block mr-2 text-green-500" />
// //                   Foods to Eat
// //                 </h4>
// //                 <ul>
// //                   {assistanceInfo.foodsToEat.map((food, index) => (
// //                     <li key={index}>{food}</li>
// //                   ))}
// //                 </ul>
// //               </div>

// //               <div className="recommendation-group">
// //                 <h4>
// //                   <X size={18} className="inline-block mr-2 text-red-500" />
// //                   Foods to Avoid
// //                 </h4>
// //                 <ul>
// //                   {assistanceInfo.foodsToAvoid.map((food, index) => (
// //                     <li key={index}>{food}</li>
// //                   ))}
// //                 </ul>
// //               </div>
// //             </div>
// //           </div>

// //           {assistanceInfo.specialist && currentUser && (
// //             <button
// //               className={`book-appointment-btn ${severity.toLowerCase()}`}
// //               onClick={handleScheduleConsultation}
// //               disabled={loading}
// //             >
// //               {loading ? (
// //                 <>
// //                   <Loader className="animate-spin mr-2" size={18} />
// //                   Scheduling Consultation...
// //                 </>
// //               ) : (
// //                 <>
// //                   <CalendarIcon size={18} className="mr-2" />
// //                   Schedule Video Consultation
// //                 </>
// //               )}
// //             </button>
// //           )}
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default MedicalForm;


// // import React, { useState } from "react";
// // import run from "../firebaseGemini";
// // import "./Severity.css";
// // import {
// //   PlusCircle, AlertCircle, Loader, X, CheckCircle,
// //   ThermometerIcon, CalendarIcon, PillIcon,
// //   ActivityIcon, MoonIcon, Plus, MessageCircle, UserCircle2
// // } from 'lucide-react';

// // const iconMap = {
// //   calendar: CalendarIcon,
// //   pill: PillIcon,
// //   activity: ActivityIcon,
// //   thermometer: ThermometerIcon,
// //   moon: MoonIcon
// // };

// // const getIconComponent = (name) => iconMap[name] || ActivityIcon;

// // const fallbackQuestions = (symptom) => [
// //   {
// //     question: `When did your ${symptom} start?`,
// //     type: "dropdown",
// //     options: ["Today", "Yesterday", "Past week", "Over a week ago"],
// //     icon: "calendar"
// //   },
// //   {
// //     question: "How severe is the condition?",
// //     type: "dropdown",
// //     options: ["Mild", "Moderate", "Severe", "Very severe"],
// //     icon: "activity"
// //   }
// // ];

// // const MedicalForm = () => {
// //   const [symptom, setSymptom] = useState("");
// //   const [extraSymptom, setExtraSymptom] = useState("");
// //   const [extraSymptoms, setExtraSymptoms] = useState([]);
// //   const [questions, setQuestions] = useState([]);
// //   const [answers, setAnswers] = useState({});
// //   const [severity, setSeverity] = useState("");
// //   const [showPopup, setShowPopup] = useState(false);
// //   const [loading, setLoading] = useState(false);
// //   const [assistanceInfo, setAssistanceInfo] = useState(null);

// //   const handleAddExtraSymptom = () => {
// //     if (extraSymptom.trim()) {
// //       setExtraSymptoms([...extraSymptoms, extraSymptom.trim()]);
// //       setExtraSymptom("");
// //     }
// //   };

// //   const handleRemoveSymptom = (index) => {
// //     setExtraSymptoms(extraSymptoms.filter((_, i) => i !== index));
// //   };

// //   const handleAnswerChange = (index, value) => {
// //     setAnswers({ ...answers, [index]: value });
// //   };

// //   const fetchQuestions = async () => {
// //     if (!symptom.trim()) return;

// //     setLoading(true);
// //     try {
// //       const allSymptoms = [symptom, ...extraSymptoms].join(", ");
// //       const prompt = `Generate 10 assessment questions for: "${allSymptoms}" as JSON...`;

// //       const res = await run(prompt);
// //       const json = JSON.parse(res.slice(res.indexOf("["), res.lastIndexOf("]") + 1));
// //       setQuestions(json);
// //     } catch {
// //       setQuestions(fallbackQuestions(symptom));
// //     } finally {
// //       setLoading(false);
// //       setShowPopup(true);
// //     }
// //   };

// //   const submitAnswers = async () => {
// //     setLoading(true);
// //     try {
// //       const answerPrompt = Object.entries(answers)
// //         .map(([i, ans]) => `${questions[i].question}: ${ans}`).join("\n");

// //       const prompt = `Based on symptoms: "${symptom}, ${extraSymptoms.join(", ")}"\n${answerPrompt}\nReturn ONLY ONE WORD: Normal, Moderate, or High`;

// //       const res = await run(prompt);
// //       const level = res.trim().replace(/[^a-zA-Z]/g, "");
// //       setSeverity(level);
// //     } catch (e) {
// //       console.error("Severity fetch error", e);
// //     } finally {
// //       setLoading(false);
// //       setShowPopup(false);
// //     }
// //   };

// //   const getAssistance = async () => {
// //     setLoading(true);
// //     try {
// //       const allSymptoms = [symptom, ...extraSymptoms].join(", ");
// //       const prompt = `You are a medical assistant. Based on symptoms: "${allSymptoms}", severity: ${severity}, return JSON...`;

// //       const res = await run(prompt);
// //       const json = JSON.parse(res.slice(res.indexOf("{"), res.lastIndexOf("}") + 1));
// //       setAssistanceInfo(json);
// //     } catch (err) {
// //       console.error("Assistance fetch error", err);
// //       setAssistanceInfo({
// //         specialist: "General Physician",
// //         medicines: ["Consult doctor"],
// //         foodsToEat: ["Regular diet"],
// //         foodsToAvoid: ["Avoid triggers"],
// //         message: "Please consult a doctor."
// //       });
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <div className="medical-form-container">
// //       <h2><AlertCircle className="mr-2 text-blue-500" /> Medical Assistant</h2>

// //       <div className="form-section">
// //         <div className="input-group">
// //           <label>Primary Symptom:</label>
// //           <div className="symptom-input-group">
// //             <input
// //               type="text"
// //               value={symptom}
// //               onChange={(e) => setSymptom(e.target.value)}
// //               placeholder="Enter main symptom"
// //               required
// //             />
// //             {symptom && (
// //               <button onClick={fetchQuestions} disabled={loading} className="check-severity-btn-inline">
// //                 {loading ? <Loader className="animate-spin" size={18} /> : <AlertCircle size={18} />}
// //                 Check Severity
// //               </button>
// //             )}
// //           </div>
// //         </div>

// //         <div className="input-group">
// //           <label>Additional Symptoms:</label>
// //           <div className="extra-symptom-input">
// //             <input
// //               value={extraSymptom}
// //               onChange={(e) => setExtraSymptom(e.target.value)}
// //               placeholder="Enter additional symptom"
// //             />
// //             <button type="button" onClick={handleAddExtraSymptom} className="add-symptom-btn">
// //               <Plus size={18} />
// //             </button>
// //           </div>
// //           <div className="extra-symptoms-list">
// //             {extraSymptoms.map((sym, i) => (
// //               <div key={i} className="symptom-tag">
// //                 {sym}
// //                 <X size={14} onClick={() => handleRemoveSymptom(i)} className="remove-symptom" />
// //               </div>
// //             ))}
// //           </div>
// //         </div>
// //       </div>

// //       {severity && (
// //         <div className="severity-result">
// //           <h3>Assessment Result</h3>
// //           <div className={`severity-badge ${severity.toLowerCase()}`}>{severity} Severity</div>
// //           <button onClick={getAssistance} disabled={loading} className="get-assistance-btn">
// //             {loading ? (
// //               <><Loader className="animate-spin mr-2" /> Getting Help...</>
// //             ) : (
// //               <><MessageCircle className="mr-2" /> Get Medical Advice</>
// //             )}
// //           </button>
// //         </div>
// //       )}

// //       {showPopup && (
// //         <div className="modal-overlay" onClick={() => setShowPopup(false)}>
// //           <div className="modal-container" onClick={e => e.stopPropagation()}>
// //             <div className="modal-header">
// //               <h3><AlertCircle className="text-blue-500 mr-2" />Assessment for {symptom}</h3>
// //               <X onClick={() => setShowPopup(false)} />
// //             </div>
// //             <div className="modal-content">
// //               {questions.map((q, i) => {
// //                 const Icon = getIconComponent(q.icon);
// //                 return (
// //                   <div key={i} className="question-item">
// //                     <label><Icon className="mr-2 text-blue-500" /> {q.question}</label>
// //                     <select value={answers[i] || ""} onChange={e => handleAnswerChange(i, e.target.value)}>
// //                       <option value="">Select an answer</option>
// //                       {q.options.map((opt, idx) => (
// //                         <option key={idx} value={opt}>{opt}</option>
// //                       ))}
// //                     </select>
// //                   </div>
// //                 );
// //               })}
// //             </div>
// //             <div className="modal-footer">
// //               <button
// //                 onClick={submitAnswers}
// //                 disabled={loading || Object.keys(answers).length !== questions.length}
// //                 className="submit-assessment-btn"
// //               >
// //                 {loading ? <><Loader className="animate-spin mr-2" />Processing...</> : <><CheckCircle className="mr-2" />Submit</>}
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {assistanceInfo && (
// //         <div className="assistance-container">
// //           <div className="assistance-content">
// //             <h3><UserCircle2 className="text-blue-500 mb-2" />Consult a {assistanceInfo.specialist}</h3>
// //             <div className="tips-section">
// //               <h4>Medicines:</h4>
// //               <ul>{assistanceInfo.medicines.map((m, i) => <li key={i}>{m}</li>)}</ul>
// //               <h4>Foods to Eat:</h4>
// //               <ul>{assistanceInfo.foodsToEat.map((f, i) => <li key={i}>{f}</li>)}</ul>
// //               <h4>Foods to Avoid:</h4>
// //               <ul>{assistanceInfo.foodsToAvoid.map((f, i) => <li key={i}>{f}</li>)}</ul>
// //             </div>
// //             <div className="consultation-msg">
// //               <p>{assistanceInfo.message}</p>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default MedicalForm;

// import React, { useState, useEffect } from "react";
// import run from "../firebaseGemini";
// import "./Severity.css";
// import { getAuth } from "firebase/auth";
// import {
//   PlusCircle, AlertCircle, Loader, X, CheckCircle,
//   ThermometerIcon, CalendarIcon, PillIcon,
//   ActivityIcon, MoonIcon, Plus, MessageCircle, UserCircle2
// } from 'lucide-react';

// const iconMap = {
//   calendar: CalendarIcon,
//   pill: PillIcon,
//   activity: ActivityIcon,
//   thermometer: ThermometerIcon,
//   moon: MoonIcon
// };

// const getIconComponent = (name) => iconMap[name] || ActivityIcon;

// const fallbackQuestions = (symptom) => [
//   {
//     question: `When did your ${symptom} start?`,
//     type: "dropdown",
//     options: ["Today", "Yesterday", "Past week", "Over a week ago"],
//     icon: "calendar"
//   },
//   {
//     question: "How severe is the condition?",
//     type: "dropdown",
//     options: ["Mild", "Moderate", "Severe", "Very severe"],
//     icon: "activity"
//   }
// ];

// const MedicalForm = () => {
//   const [symptom, setSymptom] = useState("");
//   const [extraSymptom, setExtraSymptom] = useState("");
//   const [extraSymptoms, setExtraSymptoms] = useState([]);
//   const [questions, setQuestions] = useState([]);
//   const [answers, setAnswers] = useState({});
//   const [severity, setSeverity] = useState("");
//   const [showPopup, setShowPopup] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [assistanceInfo, setAssistanceInfo] = useState(null);
//   const [currentUser, setCurrentUser] = useState(null);

//   // Load authenticated user
//   useEffect(() => {
//     const auth = getAuth();
//     setCurrentUser(auth.currentUser);
//   }, []);

//   const handleAddExtraSymptom = () => {
//     if (extraSymptom.trim()) {
//       setExtraSymptoms([...extraSymptoms, extraSymptom.trim()]);
//       setExtraSymptom("");
//     }
//   };

//   const handleRemoveSymptom = (index) => {
//     setExtraSymptoms(extraSymptoms.filter((_, i) => i !== index));
//   };

//   const handleAnswerChange = (index, value) => {
//     setAnswers({ ...answers, [index]: value });
//   };

//   const fetchQuestions = async () => {
//     if (!symptom.trim()) return;

//     setLoading(true);
//     try {
//       const allSymptoms = [symptom, ...extraSymptoms].join(", ");
//       const prompt = `Generate 10 assessment questions for: "${allSymptoms}" as JSON array...`;

//       const res = await run(prompt);
//       const json = JSON.parse(res.slice(res.indexOf("["), res.lastIndexOf("]") + 1));
//       if (!Array.isArray(json)) throw new Error("Questions not an array");
//       setQuestions(json);
//     } catch (err) {
//       console.warn("AI question fetch failed, using fallback", err);
//       setQuestions(fallbackQuestions(symptom));
//     } finally {
//       setLoading(false);
//       setShowPopup(true);
//     }
//   };

//   const submitAnswers = async () => {
//     setLoading(true);
//     try {
//       const answerPrompt = Object.entries(answers)
//         .map(([i, ans]) => `${questions[i].question}: ${ans}`).join("\n");

//       const prompt = `Based on symptoms: "${symptom}, ${extraSymptoms.join(", ")}"\n${answerPrompt}\nReturn ONLY ONE WORD: Normal, Moderate, or High`;

//       const res = await run(prompt);
//       const level = res.trim().match(/Normal|Moderate|High/i)?.[0] || "Normal";
//       setSeverity(level);
//     } catch (e) {
//       console.error("Severity fetch error", e);
//       setSeverity("Normal");
//     } finally {
//       setLoading(false);
//       setShowPopup(false);
//     }
//   };

//   const getAssistance = async () => {
//     setLoading(true);
//     try {
//       const allSymptoms = [symptom, ...extraSymptoms].join(", ");
//       const prompt = `You are a medical assistant. Based on symptoms: "${allSymptoms}", severity: ${severity}, return JSON with specialist, medicines, foodsToEat, foodsToAvoid, and a message.`;

//       const res = await run(prompt);
//       const json = JSON.parse(res.slice(res.indexOf("{"), res.lastIndexOf("}") + 1));
//       setAssistanceInfo(json);
//     } catch (err) {
//       console.error("Assistance fetch error", err);
//       setAssistanceInfo({
//         specialist: "General Physician",
//         medicines: ["Consult doctor"],
//         foodsToEat: ["Regular diet"],
//         foodsToAvoid: ["Avoid triggers"],
//         message: "Please consult a doctor."
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="medical-form-container">
//       <h2><AlertCircle className="mr-2 text-blue-500" /> Medical Assistant</h2>

//       {currentUser && (
//         <p className="user-info">Logged in as: <strong>{currentUser.email}</strong></p>
//       )}

//       <div className="form-section">
//         <div className="input-group">
//           <label>Primary Symptom:</label>
//           <div className="symptom-input-group">
//             <input
//               type="text"
//               value={symptom}
//               onChange={(e) => setSymptom(e.target.value)}
//               placeholder="Enter main symptom"
//               required
//             />
//             {symptom && (
//               <button onClick={fetchQuestions} disabled={loading} className="check-severity-btn-inline">
//                 {loading ? <Loader className="animate-spin" size={18} /> : <AlertCircle size={18} />}
//                 Check Severity
//               </button>
//             )}
//           </div>
//         </div>

//         <div className="input-group">
//           <label>Additional Symptoms:</label>
//           <div className="extra-symptom-input">
//             <input
//               value={extraSymptom}
//               onChange={(e) => setExtraSymptom(e.target.value)}
//               placeholder="Enter additional symptom"
//             />
//             <button type="button" onClick={handleAddExtraSymptom} className="add-symptom-btn">
//               <Plus size={18} />
//             </button>
//           </div>
//           <div className="extra-symptoms-list">
//             {Array.isArray(extraSymptoms) && extraSymptoms.map((sym, i) => (
//               <div key={i} className="symptom-tag">
//                 {sym}
//                 <X size={14} onClick={() => handleRemoveSymptom(i)} className="remove-symptom" />
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {severity && (
//         <div className="severity-result">
//           <h3>Assessment Result</h3>
//           <div className={`severity-badge ${severity.toLowerCase()}`}>{severity} Severity</div>
//           <button onClick={getAssistance} disabled={loading} className="get-assistance-btn">
//             {loading ? (
//               <><Loader className="animate-spin mr-2" /> Getting Help...</>
//             ) : (
//               <><MessageCircle className="mr-2" /> Get Medical Advice</>
//             )}
//           </button>
//         </div>
//       )}

//       {showPopup && (
//         <div className="modal-overlay" onClick={() => setShowPopup(false)}>
//           <div className="modal-container" onClick={e => e.stopPropagation()}>
//             <div className="modal-header">
//               <h3><AlertCircle className="text-blue-500 mr-2" />Assessment for {symptom}</h3>
//               <X onClick={() => setShowPopup(false)} />
//             </div>
//             <div className="modal-content">
//               {questions.map((q, i) => {
//                 const Icon = getIconComponent(q.icon);
//                 return (
//                   <div key={i} className="question-item">
//                     <label><Icon className="mr-2 text-blue-500" /> {q.question}</label>
//                     <select value={answers[i] || ""} onChange={e => handleAnswerChange(i, e.target.value)}>
//                       <option value="">Select an answer</option>
//                       {q && q.options && q.options.map((opt, idx) => (
//                         <option key={idx} value={opt}>{opt}</option>
//                       ))}
//                     </select>
//                   </div>
//                 );
//               })}
//             </div>
//             <div className="modal-footer">
//               <button
//                 onClick={submitAnswers}
//                 disabled={loading || Object.keys(answers).length !== questions.length}
//                 className="submit-assessment-btn"
//               >
//                 {loading ? <><Loader className="animate-spin mr-2" />Processing...</> : <><CheckCircle className="mr-2" />Submit</>}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {assistanceInfo && (
//         <div className="assistance-container">
//           <div className="assistance-content">
//             <h3><UserCircle2 className="text-blue-500 mb-2" />Consult a {assistanceInfo.specialist}</h3>
//             <div className="tips-section">
//               <h4>Medicines:</h4>
//               <ul>{(assistanceInfo.medicines || []).map((m, i) => <li key={i}>{m}</li>)}</ul>
//               <h4>Foods to Eat:</h4>
//               <ul>{(assistanceInfo.foodsToEat || []).map((f, i) => <li key={i}>{f}</li>)}</ul>
//               <h4>Foods to Avoid:</h4>
//               <ul>{(assistanceInfo.foodsToAvoid || []).map((f, i) => <li key={i}>{f}</li>)}</ul>
//             </div>
//             <div className="consultation-msg">
//               <p>{assistanceInfo.message}</p>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default MedicalForm;
