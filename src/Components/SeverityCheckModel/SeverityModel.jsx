
// // // // // // import React, { useState } from "react";
// // // // // // import run from "../firebaseGemini";
// // // // // // import "./Severity.css";
// // // // // // const MedicalForm = () => {
// // // // // //   const [symptom, setSymptom] = useState("");
// // // // // //   const [additionalSymptoms, setAdditionalSymptoms] = useState([]);
// // // // // //   const [questionAnswers, setQuestionAnswers] = useState({});
// // // // // //   const [severity, setSeverity] = useState("normal");
// // // // // //   const [previousSymptoms, setPreviousSymptoms] = useState("no");
// // // // // //   const [loading, setLoading] = useState(false);
// // // // // //   const [geminiResponse, setGeminiResponse] = useState("");
// // // // // //   const [showAppointmentButton, setShowAppointmentButton] = useState(false);

// // // // // //   const sampleQuestions = [
// // // // // //     { question: "When did the symptoms start?", options: ["Before 1 day", "2-3 days ago", "More than a week ago"] },
// // // // // //     { question: "Are you currently taking any medications?", options: ["Yes", "No"] },
// // // // // //     { question: "Are you able to perform your daily activities normally?", options: ["Yes", "No"] },
// // // // // //     { question: "Did you check your body temperature? If yes, is it:", options: ["< 100°F (37.8°C)", "> 100°F- 102°F", "> 102°F"] },
// // // // // //     { question: "Do the symptoms interfere with your work, sleep, or daily routine?", options: ["Yes", "No"] }
// // // // // //   ];

// // // // // //   const handleQuestionChange = (index, value) => {
// // // // // //     setQuestionAnswers((prev) => ({ ...prev, [index]: value }));
// // // // // //   };

// // // // // //   const addSymptom = () => {
// // // // // //     setAdditionalSymptoms([...additionalSymptoms, ""]);
// // // // // //   };

// // // // // //   const handleAdditionalSymptomChange = (index, value) => {
// // // // // //     const newSymptoms = [...additionalSymptoms];
// // // // // //     newSymptoms[index] = value;
// // // // // //     setAdditionalSymptoms(newSymptoms);
// // // // // //   };

// // // // // //   const handleSubmitGemini = async (e) => {
// // // // // //     e.preventDefault();
// // // // // //     setLoading(true);
// // // // // //     setGeminiResponse("");
// // // // // //     setShowAppointmentButton(false);

// // // // // //     try {
// // // // // //       const prompt = `
// // // // // //         Symptom: ${symptom}
// // // // // //         Additional Symptoms: ${additionalSymptoms.join(", ")}
// // // // // //         Severity: ${severity}
// // // // // //         Previous Symptoms: ${previousSymptoms}
// // // // // //         Answers: ${Object.entries(questionAnswers).map(([q, ans]) => `${sampleQuestions[q].question}: ${ans}`).join("\n")}
// // // // // //       `;

// // // // // //       const res = await run(prompt);
// // // // // //       setGeminiResponse(res);
// // // // // //       setShowAppointmentButton(true);
// // // // // //     } catch (error) {
// // // // // //       console.error("Error fetching response from Gemini:", error);
// // // // // //     } finally {
// // // // // //       setLoading(false);
// // // // // //     }
// // // // // //   };

// // // // // //   return (
// // // // // //     <div className="medical-form-container">
// // // // // //       <h2>Medical Bot</h2>
// // // // // //       <form onSubmit={handleSubmitGemini}>
// // // // // //         <label>Symptom:</label>
// // // // // //         <input type="text" value={symptom} onChange={(e) => setSymptom(e.target.value)} required />

// // // // // //         {/* <label>Severity:</label>
// // // // // //         <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
// // // // // //           <option value="normal">Normal</option>
// // // // // //           <option value="moderate">Moderate</option>
// // // // // //           <option value="high">High</option>
// // // // // //         </select> */}

// // // // // //         <label>Previous Symptoms:</label>
// // // // // //         <select value={previousSymptoms} onChange={(e) => setPreviousSymptoms(e.target.value)}>
// // // // // //           <option value="yes">Yes</option>
// // // // // //           <option value="no">No</option>
// // // // // //         </select>

// // // // // //         <div className="severity-section">
// // // // // //           <h4>Severity Questions</h4>
// // // // // //           {sampleQuestions.map((item, index) => (
// // // // // //             <div key={index}>
// // // // // //               <label>{item.question}</label>
// // // // // //               <select
// // // // // //                 value={questionAnswers[index] || ""}
// // // // // //                 onChange={(e) => handleQuestionChange(index, e.target.value)}
// // // // // //               >
// // // // // //                 {item.options.map((option, optionIndex) => (
// // // // // //                   <option key={optionIndex} value={option}>
// // // // // //                     {option}
// // // // // //                   </option>
// // // // // //                 ))}
// // // // // //               </select>
// // // // // //             </div>
// // // // // //           ))}
// // // // // //         </div>

// // // // // //         <div className="additional-symptoms">
// // // // // //           <h4>Additional Symptoms</h4>
// // // // // //           {additionalSymptoms.map((sym, index) => (
// // // // // //             <input key={index} type="text" value={sym} onChange={(e) => handleAdditionalSymptomChange(index, e.target.value)} />
// // // // // //           ))}
// // // // // //           <button type="button" onClick={addSymptom}>+ Add Symptom</button>
// // // // // //         </div>

// // // // // //         <button type="submit" disabled={loading}>{loading ? "Loading..." : "Get Assistance"}</button>
// // // // // //       </form>

// // // // // //       {geminiResponse && <div className="response-container">{geminiResponse}</div>}
// // // // // //       {showAppointmentButton && <button className="book-appointment-btn">Book Appointment</button>}
// // // // // //     </div>
// // // // // //   );
// // // // // // };

// // // // // // export default MedicalForm;


// // // // // import React, { useState } from "react";
// // // // // import run from "../firebaseGemini";
// // // // // import "./Severity.css";

// // // // // const MedicalForm = () => {
// // // // //   const [symptom, setSymptom] = useState("");
// // // // //   const [additionalSymptoms, setAdditionalSymptoms] = useState([]);
// // // // //   const [questionAnswers, setQuestionAnswers] = useState({});
// // // // //   const [severity, setSeverity] = useState("normal");
// // // // //   const [previousSymptoms, setPreviousSymptoms] = useState("no");
// // // // //   const [loading, setLoading] = useState(false);
// // // // //   const [geminiResponse, setGeminiResponse] = useState("");
// // // // //   const [showAppointmentButton, setShowAppointmentButton] = useState(false);
// // // // //   const [showModal, setShowModal] = useState(false); // To manage modal visibility

// // // // //   const sampleQuestions = [
// // // // //     { question: "When did the symptoms start?", options: ["Before 1 day", "2-3 days ago", "More than a week ago"] },
// // // // //     { question: "Are you currently taking any medications?", options: ["Yes", "No"] },
// // // // //     { question: "Are you able to perform your daily activities normally?", options: ["Yes", "No"] },
// // // // //     { question: "Did you check your body temperature? If yes, is it:", options: ["< 100°F (37.8°C)", "> 100°F- 102°F", "> 102°F"] },
// // // // //     { question: "Do the symptoms interfere with your work, sleep, or daily routine?", options: ["Yes", "No"] }
// // // // //   ];

// // // // //   const handleQuestionChange = (index, value) => {
// // // // //     setQuestionAnswers((prev) => ({ ...prev, [index]: value }));
// // // // //   };

// // // // //   const addSymptom = () => {
// // // // //     setAdditionalSymptoms([...additionalSymptoms, ""]);
// // // // //   };

// // // // //   const handleAdditionalSymptomChange = (index, value) => {
// // // // //     const newSymptoms = [...additionalSymptoms];
// // // // //     newSymptoms[index] = value;
// // // // //     setAdditionalSymptoms(newSymptoms);
// // // // //   };

// // // // //   const handleSubmitGemini = async (e) => {
// // // // //     e.preventDefault();
// // // // //     setLoading(true);
// // // // //     setGeminiResponse("");
// // // // //     setShowAppointmentButton(false);

// // // // //     try {
// // // // //       const prompt = `
// // // // //         Symptom: ${symptom}
// // // // //         Additional Symptoms: ${additionalSymptoms.join(", ")}
// // // // //         Severity: ${severity}
// // // // //         Previous Symptoms: ${previousSymptoms}
// // // // //         Answers: ${Object.entries(questionAnswers).map(([q, ans]) => `${sampleQuestions[q].question}: ${ans}`).join("\n")}
// // // // //       `;

// // // // //       const res = await run(prompt);
// // // // //       setGeminiResponse(res);
// // // // //       setShowAppointmentButton(true);
// // // // //     } catch (error) {
// // // // //       console.error("Error fetching response from Gemini:", error);
// // // // //     } finally {
// // // // //       setLoading(false);
// // // // //     }
// // // // //   };

// // // // //   const handleModalClose = () => {
// // // // //     setShowModal(false);
// // // // //   };

// // // // //   return (
// // // // //     <div className="medical-form-container">
// // // // //       <h2>Medical Bot</h2>
// // // // //       <form onSubmit={handleSubmitGemini}>
// // // // //         <label>Symptom:</label>
// // // // //         <input type="text" value={symptom} onChange={(e) => setSymptom(e.target.value)} required />

// // // // //         <label>Previous Symptoms:</label>
// // // // //         <select value={previousSymptoms} onChange={(e) => setPreviousSymptoms(e.target.value)}>
// // // // //           <option value="yes">Yes</option>
// // // // //           <option value="no">No</option>
// // // // //         </select>

// // // // //         <div className="additional-symptoms">
// // // // //           <h4>Additional Symptoms</h4>
// // // // //           {additionalSymptoms.map((sym, index) => (
// // // // //             <input key={index} type="text" value={sym} onChange={(e) => handleAdditionalSymptomChange(index, e.target.value)} />
// // // // //           ))}
// // // // //           <button type="button" onClick={addSymptom}>+ Add Symptom</button>
// // // // //         </div>

// // // // //         <button type="submit" disabled={loading}>{loading ? "Loading..." : "Get Assistance"}</button>
// // // // //       </form>

// // // // //       {/* Check Severity Button */}
// // // // //       {symptom && (
// // // // //         <button type="button" onClick={() => setShowModal(true)} className="check-severity-btn">
// // // // //           Check Severity
// // // // //         </button>
// // // // //       )}

// // // // //       {geminiResponse && <div className="response-container">{geminiResponse}</div>}
// // // // //       {showAppointmentButton && <button className="book-appointment-btn">Book Appointment</button>}

// // // // //       {/* Modal */}
// // // // //       {showModal && (
// // // // //         <div className="modal-overlay">
// // // // //           <div className="modal-container">
// // // // //             <h3>Severity Questions</h3>
// // // // //             <form>
// // // // //               {sampleQuestions.map((item, index) => (
// // // // //                 <div key={index}>
// // // // //                   <label>{item.question}</label>
// // // // //                   <select
// // // // //                     value={questionAnswers[index] || ""}
// // // // //                     onChange={(e) => handleQuestionChange(index, e.target.value)}
// // // // //                   >
// // // // //                     {item.options.map((option, optionIndex) => (
// // // // //                       <option key={optionIndex} value={option}>
// // // // //                         {option}
// // // // //                       </option>
// // // // //                     ))}
// // // // //                   </select>
// // // // //                 </div>
// // // // //               ))}
// // // // //             </form>

// // // // //             <button type="button" onClick={handleModalClose} className="close-modal-btn">
// // // // //               Close
// // // // //             </button>
// // // // //           </div>
// // // // //         </div>
// // // // //       )}
// // // // //     </div>
// // // // //   );
// // // // // };

// // // // // export default MedicalForm;


// // // // // import React, { useState } from "react";
// // // // // import run from "../firebaseGemini";
// // // // // import "./Severity.css";
// // // // // import { PlusCircle, AlertCircle, Loader, X, CheckCircle, ThermometerIcon, CalendarIcon, PillIcon, ActivityIcon, MoonIcon } from 'lucide-react';

// // // // // const MedicalForm = () => {
// // // // //   const [symptom, setSymptom] = useState("");
// // // // //   const [additionalSymptoms, setAdditionalSymptoms] = useState([]);
// // // // //   const [questionAnswers, setQuestionAnswers] = useState({});
// // // // //   const [severity, setSeverity] = useState("normal");
// // // // //   const [previousSymptoms, setPreviousSymptoms] = useState("no");
// // // // //   const [loading, setLoading] = useState(false);
// // // // //   const [geminiResponse, setGeminiResponse] = useState("");
// // // // //   const [showAppointmentButton, setShowAppointmentButton] = useState(false);
// // // // //   const [showModal, setShowModal] = useState(false);

// // // // //   const sampleQuestions = [
// // // // //     { 
// // // // //       question: "When did the symptoms start?", 
// // // // //       options: ["Before 1 day", "2-3 days ago", "More than a week ago"],
// // // // //       icon: CalendarIcon
// // // // //     },
// // // // //     { 
// // // // //       question: "Are you currently taking any medications?", 
// // // // //       options: ["Yes", "No"],
// // // // //       icon: PillIcon
// // // // //     },
// // // // //     { 
// // // // //       question: "Are you able to perform your daily activities normally?", 
// // // // //       options: ["Yes", "No"],
// // // // //       icon: ActivityIcon
// // // // //     },
// // // // //     { 
// // // // //       question: "Did you check your body temperature? If yes, is it:", 
// // // // //       options: ["< 100°F (37.8°C)", "> 100°F- 102°F", "> 102°F"],
// // // // //       icon: ThermometerIcon
// // // // //     },
// // // // //     { 
// // // // //       question: "Do the symptoms interfere with your work, sleep, or daily routine?", 
// // // // //       options: ["Yes", "No"],
// // // // //       icon: MoonIcon
// // // // //     }
// // // // //   ];

// // // // //   const handleQuestionChange = (index, value) => {
// // // // //     setQuestionAnswers((prev) => ({ ...prev, [index]: value }));
// // // // //   };

// // // // //   const addSymptom = () => {
// // // // //     setAdditionalSymptoms([...additionalSymptoms, ""]);
// // // // //   };

// // // // //   const handleAdditionalSymptomChange = (index, value) => {
// // // // //     const newSymptoms = [...additionalSymptoms];
// // // // //     newSymptoms[index] = value;
// // // // //     setAdditionalSymptoms(newSymptoms);
// // // // //   };

// // // // //   const handleSubmitGemini = async (e) => {
// // // // //     e.preventDefault();
// // // // //     setLoading(true);
// // // // //     setGeminiResponse("");
// // // // //     setShowAppointmentButton(false);

// // // // //     try {
// // // // //       const prompt = `
// // // // //         Symptom: ${symptom}
// // // // //         Additional Symptoms: ${additionalSymptoms.join(", ")}
// // // // //         Severity: ${severity}
// // // // //         Previous Symptoms: ${previousSymptoms}
// // // // //         Answers: ${Object.entries(questionAnswers).map(([q, ans]) => `${sampleQuestions[q].question}: ${ans}`).join("\n")}
// // // // //       `;

// // // // //       const res = await run(prompt);
// // // // //       setGeminiResponse(res);
// // // // //       setShowAppointmentButton(true);
// // // // //     } catch (error) {
// // // // //       console.error("Error fetching response from Gemini:", error);
// // // // //     } finally {
// // // // //       setLoading(false);
// // // // //     }
// // // // //   };

// // // // //   const handleModalClose = () => {
// // // // //     setShowModal(false);
// // // // //   };

// // // // //   return (
// // // // //     <div className="medical-form-container">
// // // // //       <h2>
// // // // //         <AlertCircle className="inline-block mr-2 text-blue-500" size={32} />
// // // // //         Medical Assistant
// // // // //       </h2>
      
  
      
// // // // //       <form onSubmit={handleSubmitGemini}>
// // // // //         <div className="input-group">
// // // // //           <label>Primary Symptom:</label>
// // // // //           <input 
// // // // //             type="text" 
// // // // //             value={symptom} 
// // // // //             onChange={(e) => setSymptom(e.target.value)} 
// // // // //             placeholder="Enter your main symptom"
// // // // //             required 
// // // // //           />
// // // // //         </div>
// // // // //         {symptom && (
// // // // //         <button type="button" onClick={() => setShowModal(true)} className="check-severity-btn">
// // // // //           <AlertCircle size={18} className="mr-1" />
// // // // //           Check Symptom Severity
// // // // //         </button>
// // // // //       )}

// // // // //         <div className="input-group">
// // // // //           <label>Previous History:</label>
// // // // //           <select 
// // // // //             value={previousSymptoms} 
// // // // //             onChange={(e) => setPreviousSymptoms(e.target.value)}
// // // // //           >
// // // // //             <option value="yes">Yes, I had similar symptoms before</option>
// // // // //             <option value="no">No, this is the first time</option>
// // // // //           </select>
// // // // //         </div>

// // // // //         <div className="additional-symptoms">
// // // // //           <h4>Additional Symptoms</h4>
// // // // //           {additionalSymptoms.map((sym, index) => (
// // // // //             <div key={index} className="input-group">
// // // // //               <input 
// // // // //                 type="text" 
// // // // //                 value={sym} 
// // // // //                 onChange={(e) => handleAdditionalSymptomChange(index, e.target.value)}
// // // // //                 placeholder={`Symptom ${index + 2}`}
// // // // //               />
// // // // //             </div>
// // // // //           ))}
// // // // //           <button type="button" onClick={addSymptom}>
// // // // //             <PlusCircle size={18} className="mr-1" />
// // // // //             Add Another Symptom
// // // // //           </button>
// // // // //         </div>

// // // // //         <button type="submit" disabled={loading}>
// // // // //           {loading ? (
// // // // //             <>
// // // // //               <Loader className="animate-spin mr-2" size={18} />
// // // // //               Analyzing...
// // // // //             </>
// // // // //           ) : (
// // // // //             'Get Medical Assistance'
// // // // //           )}
// // // // //         </button>
// // // // //       </form>
// // // // // {/* 
// // // // //       {symptom && (
// // // // //         <button type="button" onClick={() => setShowModal(true)} className="check-severity-btn">
// // // // //           <AlertCircle size={18} className="mr-1" />
// // // // //           Check Symptom Severity
// // // // //         </button>
// // // // //       )} */}

// // // // //       {geminiResponse && (
// // // // //         <div className="response-container">
// // // // //           <CheckCircle className="text-green-500 mb-2" size={24} />
// // // // //           <div dangerouslySetInnerHTML={{ __html: geminiResponse }} />
// // // // //         </div>
// // // // //       )}
      
// // // // //       {showAppointmentButton && (
// // // // //         <button className="book-appointment-btn">
// // // // //           <CalendarIcon size={18} className="mr-1" />
// // // // //           Schedule Doctor Appointment
// // // // //         </button>
// // // // //       )}

// // // // //       {showModal && (
// // // // //         <div className="modal-overlay" onClick={handleModalClose}>
// // // // //           <div className="modal-container" onClick={e => e.stopPropagation()}>
// // // // //             <h3>
// // // // //               <AlertCircle className="inline-block mr-2 text-blue-500" size={24} />
// // // // //               Severity Assessment
// // // // //             </h3>
            
// // // // //             <form>
// // // // //               {sampleQuestions.map((item, index) => {
// // // // //                 const Icon = item.icon;
// // // // //                 return (
// // // // //                   <div key={index} className="input-group">
// // // // //                     <label>
// // // // //                       <Icon size={18} className="inline-block mr-2 text-blue-500" />
// // // // //                       {item.question}
// // // // //                     </label>
// // // // //                     <select
// // // // //                       value={questionAnswers[index] || ""}
// // // // //                       onChange={(e) => handleQuestionChange(index, e.target.value)}
// // // // //                     >
// // // // //                       <option value="">Select an answer</option>
// // // // //                       {item.options.map((option, optionIndex) => (
// // // // //                         <option key={optionIndex} value={option}>
// // // // //                           {option}
// // // // //                         </option>
// // // // //                       ))}
// // // // //                     </select>
// // // // //                   </div>
// // // // //                 );
// // // // //               })}
// // // // //             </form>

// // // // //             <button type="button" onClick={handleModalClose} className="close-modal-btn">
// // // // //               <X size={18} className="mr-1" />
// // // // //               Close Assessment
// // // // //             </button>
// // // // //           </div>
// // // // //         </div>
// // // // //       )}
// // // // //     </div>
// // // // //   );
// // // // // };

// // // // // export default MedicalForm;



// // // // import React, { useState } from "react";
// // // // import run from "../firebaseGemini"; // Assume this function sends a request to Gemini API
// // // // import "./Severity.css";
// // // // import { PlusCircle, AlertCircle, Loader, X, CheckCircle, ThermometerIcon, CalendarIcon, PillIcon, ActivityIcon, MoonIcon } from 'lucide-react';

// // // // const MedicalForm = () => {
// // // //   const [symptom, setSymptom] = useState("");
// // // //   const [additionalSymptoms, setAdditionalSymptoms] = useState([]);
// // // //   const [questionAnswers, setQuestionAnswers] = useState({});
// // // //   const [severity, setSeverity] = useState("normal");
// // // //   const [previousSymptoms, setPreviousSymptoms] = useState("no");
// // // //   const [loading, setLoading] = useState(false);
// // // //   const [geminiResponse, setGeminiResponse] = useState("");
// // // //   const [showAppointmentButton, setShowAppointmentButton] = useState(false);
// // // //   const [showModal, setShowModal] = useState(false);
// // // //   const [diseaseQuestions, setDiseaseQuestions] = useState([]); // State to hold questions for the disease

// // // //   const sampleQuestions = [
// // // //     { 
// // // //       question: "When did the symptoms start?", 
// // // //       options: ["Before 1 day", "2-3 days ago", "More than a week ago"],
// // // //       icon: CalendarIcon
// // // //     },
// // // //     { 
// // // //       question: "Are you currently taking any medications?", 
// // // //       options: ["Yes", "No"],
// // // //       icon: PillIcon
// // // //     },
// // // //     { 
// // // //       question: "Are you able to perform your daily activities normally?", 
// // // //       options: ["Yes", "No"],
// // // //       icon: ActivityIcon
// // // //     },
// // // //     { 
// // // //       question: "Did you check your body temperature? If yes, is it:", 
// // // //       options: ["< 100°F (37.8°C)", "> 100°F- 102°F", "> 102°F"],
// // // //       icon: ThermometerIcon
// // // //     },
// // // //     { 
// // // //       question: "Do the symptoms interfere with your work, sleep, or daily routine?", 
// // // //       options: ["Yes", "No"],
// // // //       icon: MoonIcon
// // // //     }
// // // //   ];

// // // //   const handleQuestionChange = (index, value) => {
// // // //     setQuestionAnswers((prev) => ({ ...prev, [index]: value }));
// // // //   };

// // // //   const addSymptom = () => {
// // // //     setAdditionalSymptoms([...additionalSymptoms, ""]);
// // // //   };

// // // //   const handleAdditionalSymptomChange = (index, value) => {
// // // //     const newSymptoms = [...additionalSymptoms];
// // // //     newSymptoms[index] = value;
// // // //     setAdditionalSymptoms(newSymptoms);
// // // //   };

// // // //   const fetchDiseaseQuestions = async (symptom) => {
// // // //     try {
// // // //       const prompt = `Symptom: ${symptom}. Please provide the relevant questions to assess the severity of this disease.`;
// // // //       const res = await run(prompt); // Call the Gemini API to get questions for the symptom/disease
// // // //       setDiseaseQuestions(res); // Assuming the response contains the questions
// // // //     } catch (error) {
// // // //       console.error("Error fetching disease-specific questions:", error);
// // // //     }
// // // //   };

// // // //   const handleSubmitGemini = async (e) => {
// // // //     e.preventDefault();
// // // //     setLoading(true);
// // // //     setGeminiResponse("");
// // // //     setShowAppointmentButton(false);
// // // //     setShowModal(false); // Close the modal if form is submitted

// // // //     try {
// // // //       const prompt = `
// // // //         Symptom: ${symptom}
// // // //         Additional Symptoms: ${additionalSymptoms.join(", ")}
// // // //         Severity: ${severity}
// // // //         Previous Symptoms: ${previousSymptoms}
// // // //         Answers: ${Object.entries(questionAnswers).map(([q, ans]) => `${sampleQuestions[q].question}: ${ans}`).join("\n")}
// // // //       `;

// // // //       const res = await run(prompt);
// // // //       setGeminiResponse(res);
// // // //       setShowAppointmentButton(true);
// // // //     } catch (error) {
// // // //       console.error("Error fetching response from Gemini:", error);
// // // //     } finally {
// // // //       setLoading(false);
// // // //     }
// // // //   };

// // // //   const handleModalOpen = () => {
// // // //     fetchDiseaseQuestions(symptom); // Fetch disease-specific questions when the modal is opened
// // // //     setShowModal(true); // Open the modal
// // // //   };

// // // //   const handleModalClose = () => {
// // // //     setShowModal(false);
// // // //   };

// // // //   return (
// // // //     <div className="medical-form-container">
// // // //       <h2>
// // // //         <AlertCircle className="inline-block mr-2 text-blue-500" size={32} />
// // // //         Medical Assistant
// // // //       </h2>
  
// // // //       <form onSubmit={handleSubmitGemini}>
// // // //         <div className="input-group">
// // // //           <label>Primary Symptom:</label>
// // // //           <input 
// // // //             type="text" 
// // // //             value={symptom} 
// // // //             onChange={(e) => setSymptom(e.target.value)} 
// // // //             placeholder="Enter your main symptom"
// // // //             required 
// // // //           />
// // // //         </div>

// // // //         {symptom && (
// // // //           <button type="button" onClick={handleModalOpen} className="check-severity-btn">
// // // //             <AlertCircle size={18} className="mr-1" />
// // // //             Check Symptom Severity
// // // //           </button>
// // // //         )}

// // // //         <div className="input-group">
// // // //           <label>Previous History:</label>
// // // //           <select 
// // // //             value={previousSymptoms} 
// // // //             onChange={(e) => setPreviousSymptoms(e.target.value)}
// // // //           >
// // // //             <option value="yes">Yes, I had similar symptoms before</option>
// // // //             <option value="no">No, this is the first time</option>
// // // //           </select>
// // // //         </div>

// // // //         <div className="additional-symptoms">
// // // //           <h4>Additional Symptoms</h4>
// // // //           {additionalSymptoms.map((sym, index) => (
// // // //             <div key={index} className="input-group">
// // // //               <input 
// // // //                 type="text" 
// // // //                 value={sym} 
// // // //                 onChange={(e) => handleAdditionalSymptomChange(index, e.target.value)}
// // // //                 placeholder={`Symptom ${index + 2}`}
// // // //               />
// // // //             </div>
// // // //           ))}
// // // //           <button type="button" onClick={addSymptom}>
// // // //             <PlusCircle size={18} className="mr-1" />
// // // //             Add Another Symptom
// // // //           </button>
// // // //         </div>

// // // //         <button type="submit" disabled={loading}>
// // // //           {loading ? (
// // // //             <>
// // // //               <Loader className="animate-spin mr-2" size={18} />
// // // //               Analyzing...
// // // //             </>
// // // //           ) : (
// // // //             'Get Medical Assistance'
// // // //           )}
// // // //         </button>
// // // //       </form>

// // // //       {geminiResponse && (
// // // //         <div className="response-container">
// // // //           <CheckCircle className="text-green-500 mb-2" size={24} />
// // // //           <div dangerouslySetInnerHTML={{ __html: geminiResponse }} />
// // // //         </div>
// // // //       )}
      
// // // //       {showAppointmentButton && (
// // // //         <button className="book-appointment-btn">
// // // //           <CalendarIcon size={18} className="mr-1" />
// // // //           Schedule Doctor Appointment
// // // //         </button>
// // // //       )}

// // // //       {showModal && (
// // // //         <div className="modal-overlay" onClick={handleModalClose}>
// // // //           <div className="modal-container" onClick={e => e.stopPropagation()}>
// // // //             <h3>
// // // //               <AlertCircle className="inline-block mr-2 text-blue-500" size={24} />
// // // //               Severity Assessment
// // // //             </h3>
            
// // // //             <form>
// // // //               {diseaseQuestions.length > 0 ? (
// // // //                 diseaseQuestions.map((item, index) => {
// // // //                   const Icon = item.icon;
// // // //                   return (
// // // //                     <div key={index} className="input-group">
// // // //                       <label>
// // // //                         <Icon size={18} className="inline-block mr-2 text-blue-500" />
// // // //                         {item.question}
// // // //                       </label>
// // // //                       <select
// // // //                         value={questionAnswers[index] || ""}
// // // //                         onChange={(e) => handleQuestionChange(index, e.target.value)}
// // // //                       >
// // // //                         <option value="">Select an answer</option>
// // // //                         {item.options.map((option, optionIndex) => (
// // // //                           <option key={optionIndex} value={option}>
// // // //                             {option}
// // // //                           </option>
// // // //                         ))}
// // // //                       </select>
// // // //                     </div>
// // // //                   );
// // // //                 })
// // // //               ) : (
// // // //                 <p>Loading questions for this disease...</p>
// // // //               )}
// // // //             </form>

// // // //             <button type="button" onClick={handleModalClose} className="close-modal-btn">
// // // //               <X size={18} className="mr-1" />
// // // //               Close Assessment
// // // //             </button>
// // // //           </div>
// // // //         </div>
// // // //       )}
// // // //     </div>
// // // //   );
// // // // };

// // // // export default MedicalForm;



// // // import React, { useState } from "react";
// // // import run from "../firebaseGemini";
// // // import "./Severity.css";
// // // import { PlusCircle, AlertCircle, Loader, X, CheckCircle, ThermometerIcon, CalendarIcon, PillIcon, ActivityIcon, MoonIcon } from 'lucide-react';

// // // const MedicalForm = () => {
// // //   const [symptom, setSymptom] = useState("");
// // //   const [additionalSymptoms, setAdditionalSymptoms] = useState([]);
// // //   const [questionAnswers, setQuestionAnswers] = useState({});
// // //   const [severity, setSeverity] = useState("normal");
// // //   const [previousSymptoms, setPreviousSymptoms] = useState("no");
// // //   const [loading, setLoading] = useState(false);
// // //   const [geminiResponse, setGeminiResponse] = useState("");
// // //   const [showAppointmentButton, setShowAppointmentButton] = useState(false);
// // //   const [showModal, setShowModal] = useState(false);

// // //   const sampleQuestions = [
// // //     { 
// // //       question: "When did the symptoms start?", 
// // //       options: ["Before 1 day", "2-3 days ago", "More than a week ago"],
// // //       icon: CalendarIcon
// // //     },
// // //     { 
// // //       question: "Are you currently taking any medications?", 
// // //       options: ["Yes", "No"],
// // //       icon: PillIcon
// // //     },
// // //     { 
// // //       question: "Are you able to perform your daily activities normally?", 
// // //       options: ["Yes", "No"],
// // //       icon: ActivityIcon
// // //     },
// // //     { 
// // //       question: "Did you check your body temperature? If yes, is it:", 
// // //       options: ["< 100°F (37.8°C)", "> 100°F- 102°F", "> 102°F"],
// // //       icon: ThermometerIcon
// // //     },
// // //     { 
// // //       question: "Do the symptoms interfere with your work, sleep, or daily routine?", 
// // //       options: ["Yes", "No"],
// // //       icon: MoonIcon
// // //     }
// // //   ];

// // //   const handleQuestionChange = (index, value) => {
// // //     setQuestionAnswers((prev) => ({ ...prev, [index]: value }));
// // //   };

// // //   const addSymptom = () => {
// // //     setAdditionalSymptoms([...additionalSymptoms, ""]);
// // //   };

// // //   const handleAdditionalSymptomChange = (index, value) => {
// // //     const newSymptoms = [...additionalSymptoms];
// // //     newSymptoms[index] = value;
// // //     setAdditionalSymptoms(newSymptoms);
// // //   };

// // //   const handleSubmitGemini = async (e) => {
// // //     e.preventDefault();
// // //     setLoading(true);
// // //     setGeminiResponse("");
// // //     setShowAppointmentButton(false);

// // //     try {
// // //       const prompt = `
// // //         Symptom: ${symptom}
// // //         Additional Symptoms: ${additionalSymptoms.join(", ")}
// // //         Severity: ${severity}
// // //         Previous Symptoms: ${previousSymptoms}
// // //         Answers: ${Object.entries(questionAnswers).map(([q, ans]) => `${sampleQuestions[q].question}: ${ans}`).join("\n")}
// // //       `;

// // //       const res = await run(prompt);
// // //       setGeminiResponse(res);
// // //       setShowAppointmentButton(true);
// // //     } catch (error) {
// // //       console.error("Error fetching response from Gemini:", error);
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   const handleModalClose = () => {
// // //     setShowModal(false);
// // //   };

// // //   return (
// // //     <div className="medical-form-container">
// // //       <h2>
// // //         <AlertCircle className="inline-block mr-2 text-blue-500" size={32} />
// // //         Medical Assistant
// // //       </h2>
      
// // //       <form onSubmit={handleSubmitGemini}>
// // //         <div className="input-group">
// // //           <label>Primary Symptom:</label>
// // //           <input 
// // //             type="text" 
// // //             value={symptom} 
// // //             onChange={(e) => setSymptom(e.target.value)} 
// // //             placeholder="Enter your main symptom"
// // //             required 
// // //           />
// // //         </div>

// // //         {symptom && (
// // //         <button type="button" onClick={() => setShowModal(true)} className="check-severity-btn">
// // //           <AlertCircle size={18} className="mr-1" />
// // //           Check Symptom Severity
// // //         </button>
// // //       )}

// // //         <div className="input-group">
// // //           <label>Previous History:</label>
// // //           <select 
// // //             value={previousSymptoms} 
// // //             onChange={(e) => setPreviousSymptoms(e.target.value)}
// // //           >
// // //             <option value="yes">Yes, I had similar symptoms before</option>
// // //             <option value="no">No, this is the first time</option>
// // //           </select>
// // //         </div>

// // //         <div className="additional-symptoms">
// // //           <h4>Additional Symptoms</h4>
// // //           {additionalSymptoms.map((sym, index) => (
// // //             <div key={index} className="input-group">
// // //               <input 
// // //                 type="text" 
// // //                 value={sym} 
// // //                 onChange={(e) => handleAdditionalSymptomChange(index, e.target.value)}
// // //                 placeholder={`Symptom ${index + 2}`}
// // //               />
// // //             </div>
// // //           ))}
// // //           <button type="button" onClick={addSymptom}>
// // //             <PlusCircle size={18} className="mr-1" />
// // //             Add Another Symptom
// // //           </button>
// // //         </div>

// // //         <button type="submit" disabled={loading}>
// // //           {loading ? (
// // //             <>
// // //               <Loader className="animate-spin mr-2" size={18} />
// // //               Analyzing...
// // //             </>
// // //           ) : (
// // //             'Get Medical Assistance'
// // //           )}
// // //         </button>
// // //       </form>

// // //       {/* {symptom && (
// // //         <button type="button" onClick={() => setShowModal(true)} className="check-severity-btn">
// // //           <AlertCircle size={18} className="mr-1" />
// // //           Check Symptom Severity
// // //         </button>
// // //       )} */}

// // //       {geminiResponse && (
// // //         <div className="response-container">
// // //           <CheckCircle className="text-green-500 mb-2" size={24} />
// // //           <div dangerouslySetInnerHTML={{ __html: geminiResponse }} />
// // //         </div>
// // //       )}
      
// // //       {showAppointmentButton && (
// // //         <button className="book-appointment-btn">
// // //           <CalendarIcon size={18} className="mr-1" />
// // //           Schedule Doctor Appointment
// // //         </button>
// // //       )}

// // //       {showModal && (
// // //         <div className="modal-overlay" onClick={handleModalClose}>
// // //           <div className="modal-container" onClick={e => e.stopPropagation()}>
// // //             <h3>
// // //               <AlertCircle className="inline-block mr-2 text-blue-500" size={24} />
// // //               Severity Assessment
// // //             </h3>
            
// // //             <form>
// // //               {sampleQuestions.map((item, index) => {
// // //                 const Icon = item.icon;
// // //                 return (
// // //                   <div key={index} className="input-group">
// // //                     <label>
// // //                       <Icon size={18} className="inline-block mr-2 text-blue-500" />
// // //                       {item.question}
// // //                     </label>
// // //                     <select
// // //                       value={questionAnswers[index] || ""}
// // //                       onChange={(e) => handleQuestionChange(index, e.target.value)}
// // //                     >
// // //                       <option value="">Select an answer</option>
// // //                       {item.options.map((option, optionIndex) => (
// // //                         <option key={optionIndex} value={option}>
// // //                           {option}
// // //                         </option>
// // //                       ))}
// // //                     </select>
// // //                   </div>
// // //                 );
// // //               })}
// // //             </form>

// // //             <button type="button" onClick={handleModalClose} className="close-modal-btn">
// // //               <X size={18} className="mr-1" />
// // //               Close Assessment
// // //             </button>
// // //           </div>
// // //         </div>
// // //       )}
// // //     </div>
// // //   );
// // // };

// // // export default MedicalForm;


// // import React, { useState } from "react";
// // import run from "../firebaseGemini";
// // import "./Severity.css";
// // import { PlusCircle, AlertCircle, Loader, X, CheckCircle, ThermometerIcon, CalendarIcon, PillIcon, ActivityIcon, MoonIcon } from 'lucide-react';

// // const MedicalForm = () => {
// //   const [symptom, setSymptom] = useState("");
// //   const [additionalSymptoms, setAdditionalSymptoms] = useState([]);
// //   const [questionAnswers, setQuestionAnswers] = useState({});
// //   const [severity, setSeverity] = useState("normal");
// //   const [previousSymptoms, setPreviousSymptoms] = useState("no");
// //   const [loading, setLoading] = useState(false);
// //   const [questionsLoading, setQuestionsLoading] = useState(false);
// //   const [geminiResponse, setGeminiResponse] = useState("");
// //   const [showAppointmentButton, setShowAppointmentButton] = useState(false);
// //   const [showModal, setShowModal] = useState(false);
// //   const [dynamicQuestions, setDynamicQuestions] = useState([]);

// //   const addSymptom = () => {
// //     setAdditionalSymptoms([...additionalSymptoms, ""]);
// //   };

// //   const handleAdditionalSymptomChange = (index, value) => {
// //     const newSymptoms = [...additionalSymptoms];
// //     newSymptoms[index] = value;
// //     setAdditionalSymptoms(newSymptoms);
// //   };

// //   const handleQuestionChange = (index, value) => {
// //     setQuestionAnswers((prev) => ({ ...prev, [index]: value }));
// //   };

// //   const getDynamicQuestions = async () => {
// //     setQuestionsLoading(true);
// //     try {
// //       const prompt = `
// //         Given the symptom/condition "${symptom}", generate a list of 5 specific medical assessment questions that would help determine the severity of this condition. 
// //         Format the response as a JSON array of objects, where each object has:
// //         - question: the question text
// //         - options: array of possible answers
// //         - icon: one of these values only: "calendar", "pill", "activity", "thermometer", "moon"
        
// //         Make the questions and options very specific to ${symptom}.
// //         Example format:
// //         [
// //           {
// //             "question": "How severe is the chest pain?",
// //             "options": ["Mild", "Moderate", "Severe", "Unbearable"],
// //             "icon": "activity"
// //           }
// //         ]
// //       `;

// //       const response = await run(prompt);
// //       let questions;
// //       try {
// //         questions = JSON.parse(response);
// //       } catch (e) {
// //         // If parsing fails, use a simplified format
// //         questions = [
// //           { 
// //             question: "When did the symptoms start?",
// //             options: ["Today", "2-3 days ago", "More than a week ago"],
// //             icon: "calendar"
// //           },
// //           {
// //             question: "How severe is your condition?",
// //             options: ["Mild", "Moderate", "Severe"],
// //             icon: "activity"
// //           },
// //           {
// //             question: "Are you taking any medications?",
// //             options: ["Yes", "No"],
// //             icon: "pill"
// //           }
// //         ];
// //       }
// //       setDynamicQuestions(questions);
// //       setQuestionAnswers({});
// //     } catch (error) {
// //       console.error("Error getting dynamic questions:", error);
// //     } finally {
// //       setQuestionsLoading(false);
// //     }
// //   };

// //   const handleModalOpen = async () => {
// //     await getDynamicQuestions();
// //     setShowModal(true);
// //   };

// //   const handleModalClose = () => {
// //     setShowModal(false);
// //   };

// //   const handleSubmitGemini = async (e) => {
// //     e.preventDefault();
// //     setLoading(true);
// //     setGeminiResponse("");
// //     setShowAppointmentButton(false);

// //     try {
// //       const prompt = `
// //         Symptom: ${symptom}
// //         Additional Symptoms: ${additionalSymptoms.join(", ")}
// //         Previous Symptoms: ${previousSymptoms}
// //         Assessment Results:
// //         ${Object.entries(questionAnswers)
// //           .map(([index, answer]) => `${dynamicQuestions[index]?.question}: ${answer}`)
// //           .join("\n")}

// //         Based on these symptoms and assessment results, provide:
// //         1. A detailed analysis of the condition
// //         2. Potential severity level
// //         3. Recommended next steps
// //         4. Whether immediate medical attention is needed
// //       `;

// //       const res = await run(prompt);
// //       setGeminiResponse(res);
// //       setShowAppointmentButton(true);
// //     } catch (error) {
// //       console.error("Error fetching response from Gemini:", error);
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
      
// //       <form onSubmit={handleSubmitGemini}>
// //         <div className="input-group">
// //           <label>Primary Symptom:</label>
// //           <input 
// //             type="text" 
// //             value={symptom} 
// //             onChange={(e) => setSymptom(e.target.value)} 
// //             placeholder="Enter your main symptom or condition"
// //             required 
// //           />
// //         </div>

// //         <div className="input-group">
// //           <label>Previous History:</label>
// //           <select 
// //             value={previousSymptoms} 
// //             onChange={(e) => setPreviousSymptoms(e.target.value)}
// //           >
// //             <option value="yes">Yes, I had similar symptoms before</option>
// //             <option value="no">No, this is the first time</option>
// //           </select>
// //         </div>

// //         <div className="additional-symptoms">
// //           <h4>Additional Symptoms</h4>
// //           {additionalSymptoms.map((sym, index) => (
// //             <div key={index} className="input-group">
// //               <input 
// //                 type="text" 
// //                 value={sym} 
// //                 onChange={(e) => handleAdditionalSymptomChange(index, e.target.value)}
// //                 placeholder={`Symptom ${index + 2}`}
// //               />
// //             </div>
// //           ))}
// //           <button type="button" onClick={addSymptom}>
// //             <PlusCircle size={18} className="mr-1" />
// //             Add Another Symptom
// //           </button>
// //         </div>

// //         <button type="submit" disabled={loading}>
// //           {loading ? (
// //             <>
// //               <Loader className="animate-spin mr-2" size={18} />
// //               Analyzing...
// //             </>
// //           ) : (
// //             'Get Medical Assistance'
// //           )}
// //         </button>
// //       </form>

// //       {symptom && (
// //         <button 
// //           type="button" 
// //           onClick={handleModalOpen} 
// //           className="check-severity-btn"
// //           disabled={questionsLoading}
// //         >
// //           {questionsLoading ? (
// //             <>
// //               <Loader className="animate-spin mr-2" size={18} />
// //               Loading Questions...
// //             </>
// //           ) : (
// //             <>
// //               <AlertCircle size={18} className="mr-1" />
// //               Check Symptom Severity
// //             </>
// //           )}
// //         </button>
// //       )}

// //       {geminiResponse && (
// //         <div className="response-container">
// //           <CheckCircle className="text-green-500 mb-2" size={24} />
// //           <div dangerouslySetInnerHTML={{ __html: geminiResponse }} />
// //         </div>
// //       )}
      
// //       {showAppointmentButton && (
// //         <button className="book-appointment-btn">
// //           <CalendarIcon size={18} className="mr-1" />
// //           Schedule Doctor Appointment
// //         </button>
// //       )}

// //       {showModal && (
// //         <div className="modal-overlay" onClick={handleModalClose}>
// //           <div className="modal-container" onClick={e => e.stopPropagation()}>
// //             <h3>
// //               <AlertCircle className="inline-block mr-2 text-blue-500" size={24} />
// //               Severity Assessment for {symptom}
// //             </h3>
            
// //             <form>
// //               {dynamicQuestions.map((item, index) => {
// //                 const Icon = getIconComponent(item.icon);
// //                 return (
// //                   <div key={index} className="input-group">
// //                     <label>
// //                       <Icon size={18} className="inline-block mr-2 text-blue-500" />
// //                       {item.question}
// //                     </label>
// //                     <select
// //                       value={questionAnswers[index] || ""}
// //                       onChange={(e) => handleQuestionChange(index, e.target.value)}
// //                     >
// //                       <option value="">Select an answer</option>
// //                       {item.options.map((option, optionIndex) => (
// //                         <option key={optionIndex} value={option}>
// //                           {option}
// //                         </option>
// //                       ))}
// //                     </select>
// //                   </div>
// //                 );
// //               })}
// //             </form>

// //             <button type="button" onClick={handleModalClose} className="close-modal-btn">
// //               <X size={18} className="mr-1" />
// //               Close Assessment
// //             </button>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default MedicalForm;


// import React, { useState } from "react";
// import run from "../firebaseGemini";
// import "./Severity.css";
// import { PlusCircle, AlertCircle, Loader, X, CheckCircle, ThermometerIcon, CalendarIcon, PillIcon, ActivityIcon, MoonIcon } from 'lucide-react';

// const MedicalForm = () => {
//   const [symptom, setSymptom] = useState("");
//   const [additionalSymptoms, setAdditionalSymptoms] = useState([]);
//   const [questionAnswers, setQuestionAnswers] = useState({});
//   const [severity, setSeverity] = useState("normal");
//   const [previousSymptoms, setPreviousSymptoms] = useState("no");
//   const [loading, setLoading] = useState(false);
//   const [questionsLoading, setQuestionsLoading] = useState(false);
//   const [geminiResponse, setGeminiResponse] = useState("");
//   const [showAppointmentButton, setShowAppointmentButton] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [dynamicQuestions, setDynamicQuestions] = useState([]);

//   const addSymptom = () => {
//     setAdditionalSymptoms([...additionalSymptoms, ""]);
//   };

//   const handleAdditionalSymptomChange = (index, value) => {
//     const newSymptoms = [...additionalSymptoms];
//     newSymptoms[index] = value;
//     setAdditionalSymptoms(newSymptoms);
//   };

//   const handleQuestionChange = (index, value) => {
//     setQuestionAnswers((prev) => ({ ...prev, [index]: value }));
//   };

//   const getDynamicQuestions = async () => {
//     setQuestionsLoading(true);
//     try {
//       const prompt = `
//         Given the symptom/condition "${symptom}", generate a list of 5 specific medical assessment questions that would help determine the severity of this condition. 
//         Format the response as a JSON array of objects, where each object has:
//         - question: the question text
//         - options: array of possible answers
//         - icon: one of these values only: "calendar", "pill", "activity", "thermometer", "moon"
        
//         Make the questions and options very specific to ${symptom}.
//         Example format:
//         [
//           {
//             "question": "How severe is the chest pain?",
//             "options": ["Mild", "Moderate", "Severe", "Unbearable"],
//             "icon": "activity"
//           }
//         ]
//       `;

//       const response = await run(prompt);
//       let questions;
//       try {
//         questions = JSON.parse(response);
//       } catch (e) {
//         // If parsing fails, use a simplified format
//         questions = [
//           { 
//             question: "When did the symptoms start?",
//             options: ["Today", "2-3 days ago", "More than a week ago"],
//             icon: "calendar"
//           },
//           {
//             question: "How severe is your condition?",
//             options: ["Mild", "Moderate", "Severe"],
//             icon: "activity"
//           },
//           {
//             question: "Are you taking any medications?",
//             options: ["Yes", "No"],
//             icon: "pill"
//           }
//         ];
//       }
//       setDynamicQuestions(questions);
//       setQuestionAnswers({});
//     } catch (error) {
//       console.error("Error getting dynamic questions:", error);
//     } finally {
//       setQuestionsLoading(false);
//     }
//   };

//   const handleModalOpen = async () => {
//     await getDynamicQuestions();
//     setShowModal(true);
//   };

//   const handleModalClose = () => {
//     setShowModal(false);
//   };

//   const handleSubmitGemini = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setGeminiResponse("");
//     setShowAppointmentButton(false);

//     try {
//       const prompt = `
//         Symptom: ${symptom}
//         Additional Symptoms: ${additionalSymptoms.join(", ")}
//         Previous Symptoms: ${previousSymptoms}
//         Assessment Results:
//         ${Object.entries(questionAnswers)
//           .map(([index, answer]) => `${dynamicQuestions[index]?.question}: ${answer}`)
//           .join("\n")}

//         Based on these symptoms and assessment results, provide:
//         1. A detailed analysis of the condition
//         2. Potential severity level
//         3. Recommended next steps
//         4. Whether immediate medical attention is needed
//       `;

//       const res = await run(prompt);
//       setGeminiResponse(res);
//       setShowAppointmentButton(true);
//     } catch (error) {
//       console.error("Error fetching response from Gemini:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getIconComponent = (iconName) => {
//     const iconMap = {
//       calendar: CalendarIcon,
//       pill: PillIcon,
//       activity: ActivityIcon,
//       thermometer: ThermometerIcon,
//       moon: MoonIcon
//     };
//     return iconMap[iconName] || ActivityIcon;
//   };

//   return (
//     <div className="medical-form-container">
//       <h2>
//         <AlertCircle className="inline-block mr-2 text-blue-500" size={32} />
//         Medical Assistant
//       </h2>
      
//       <form onSubmit={handleSubmitGemini}>
//         <div className="input-group">
//           <label>Primary Symptom:</label>
//           <input 
//             type="text" 
//             value={symptom} 
//             onChange={(e) => setSymptom(e.target.value)} 
//             placeholder="Enter your main symptom or condition"
//             required 
//           />
//         </div>

//         <div className="input-group">
//           <label>Previous History:</label>
//           <select 
//             value={previousSymptoms} 
//             onChange={(e) => setPreviousSymptoms(e.target.value)}
//           >
//             <option value="yes">Yes, I had similar symptoms before</option>
//             <option value="no">No, this is the first time</option>
//           </select>
//         </div>

//         <div className="additional-symptoms">
//           <h4>Additional Symptoms</h4>
//           {additionalSymptoms.map((sym, index) => (
//             <div key={index} className="input-group">
//               <input 
//                 type="text" 
//                 value={sym}
//                 onChange={(e) => handleAdditionalSymptomChange(index, e.target.value)}
//                 placeholder={`Symptom ${index + 2}`}
//               />
//             </div>
//           ))}
//           <button type="button" onClick={addSymptom}>
//             <PlusCircle size={18} className="mr-1" />
//             Add Another Symptom
//           </button>
//         </div>

//         <button type="submit" disabled={loading}>
//           {loading ? (
//             <>
//               <Loader className="animate-spin mr-2" size={18} />
//               Analyzing...
//             </>
//           ) : (
//             'Get Medical Assistance'
//           )}
//         </button>
//       </form>

//       {symptom && (
//         <button 
//           type="button" 
//           onClick={handleModalOpen} 
//           className="check-severity-btn"
//           disabled={questionsLoading}
//         >
//           {questionsLoading ? (
//             <>
//               <Loader className="animate-spin mr-2" size={18} />
//               Loading Questions...
//             </>
//           ) : (
//             <>
//               <AlertCircle size={18} className="mr-1" />
//               Check Symptom Severity
//             </>
//           )}
//         </button>
//       )}

//       {geminiResponse && (
//         <div className="response-container">
//           <CheckCircle className="text-green-500 mb-2" size={24} />
//           <div dangerouslySetInnerHTML={{ __html: geminiResponse }} />
//         </div>
//       )}
      
//       {showAppointmentButton && (
//         <button className="book-appointment-btn">
//           <CalendarIcon size={18} className="mr-1" />
//           Schedule Doctor Appointment
//         </button>
//       )}

//       {showModal && (
//         <div className="modal-overlay" onClick={handleModalClose}>
//           <div className="modal-container" onClick={e => e.stopPropagation()}>
//             <h3>
//               <AlertCircle className="inline-block mr-2 text-blue-500" size={24} />
//               Severity Assessment for {symptom}
//             </h3>
            
//             <form>
//               {dynamicQuestions.map((item, index) => {
//                 const Icon = getIconComponent(item.icon);
//                 return (
//                   <div key={index} className="input-group">
//                     <label>
//                       <Icon size={18} className="inline-block mr-2 text-blue-500" />
//                       {item.question}
//                     </label>
//                     <select
//                       value={questionAnswers[index] || ""}
//                       onChange={(e) => handleQuestionChange(index, e.target.value)}
//                     >
//                       <option value="">Select an answer</option>
//                       {item.options.map((option, optionIndex) => (
//                         <option key={optionIndex} value={option}>
//                           {option}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 );
//               })}
//             </form>

//             <button type="button" onClick={handleModalClose} className="close-modal-btn">
//               <X size={18} className="mr-1" />
//               Close Assessment
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default MedicalForm;






import React, { useState } from "react";
import run from "../firebaseGemini";
import "./Severity.css";
import { PlusCircle, AlertCircle, Loader, X, CheckCircle, ThermometerIcon, CalendarIcon, PillIcon, ActivityIcon, MoonIcon } from 'lucide-react';

const MedicalForm = () => {
  const [symptom, setSymptom] = useState("");
  const [additionalSymptoms, setAdditionalSymptoms] = useState([]);
  const [questionAnswers, setQuestionAnswers] = useState({});
  const [severity, setSeverity] = useState("normal");
  const [previousSymptoms, setPreviousSymptoms] = useState("no");
  const [loading, setLoading] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [geminiResponse, setGeminiResponse] = useState("");
  const [showAppointmentButton, setShowAppointmentButton] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [dynamicQuestions, setDynamicQuestions] = useState([]);
  const [error, setError] = useState("");

  const addSymptom = () => {
    setAdditionalSymptoms([...additionalSymptoms, ""]);
  };

  const handleAdditionalSymptomChange = (index, value) => {
    const newSymptoms = [...additionalSymptoms];
    newSymptoms[index] = value;
    setAdditionalSymptoms(newSymptoms);
  };

  const handleQuestionChange = (index, value) => {
    setQuestionAnswers((prev) => ({ ...prev, [index]: value }));
  };

  const getDynamicQuestions = async () => {
    setQuestionsLoading(true);
    setError("");
    try {
      const prompt = `
        You are an experienced medical specialist conducting a detailed clinical assessment for a patient with: "${symptom}".
        
        Create exactly 10 specific medical assessment questions that a doctor would ask during a consultation for ${symptom}.
        
        CRITICAL REQUIREMENTS:
        1. Questions MUST be specific to ${symptom}
        2. Each question MUST have exactly 4 answer options
        3. Each question MUST use one of these icons: "calendar", "pill", "activity", "thermometer", "moon"
        4. Follow this EXACT format - no additional text or explanations:
        [
          {
            "question": "Question text here?",
            "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
            "icon": "activity"
          }
        ]
        
        Include questions about:
        - Symptom onset and duration
        - Severity and characteristics
        - Pattern and frequency
        - Aggravating/alleviating factors
        - Associated symptoms
        - Impact on daily life
        - Previous occurrences
        - Current treatments
        - Medical history
        - Risk factors

        REMEMBER: Return ONLY the JSON array with exactly 10 questions, each with 4 options.
      `;

      const response = await run(prompt);
      
      try {
        const questions = JSON.parse(response.trim());
        
        if (!Array.isArray(questions) || questions.length !== 10) {
          throw new Error("Invalid number of questions");
        }

        questions.forEach((q, idx) => {
          if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || !q.icon) {
            throw new Error(`Invalid question format at index ${idx}`);
          }
          if (!["calendar", "pill", "activity", "thermometer", "moon"].includes(q.icon)) {
            q.icon = "activity"; // Default to activity if invalid icon
          }
        });

        setDynamicQuestions(questions);
        setQuestionAnswers({});
        setError("");
      } catch (e) {
        console.error("Parse error:", e);
        throw new Error("Failed to generate valid questions");
      }
    } catch (error) {
      console.error("Question generation error:", error);
      setError("Failed to generate questions. Please try again.");
      
      // Generate fallback questions specific to the symptom
      const fallbackQuestions = [
        {
          question: `When did your ${symptom} first start?`,
          options: ["Today", "Yesterday", "Past week", "Over a week ago"],
          icon: "calendar"
        },
        {
          question: `How would you rate the severity of your ${symptom}?`,
          options: ["Mild", "Moderate", "Severe", "Very severe"],
          icon: "activity"
        },
        {
          question: `How often do you experience ${symptom}?`,
          options: ["Constantly", "Several times daily", "Few times weekly", "Occasionally"],
          icon: "calendar"
        },
        {
          question: "Have you taken any medication for this?",
          options: ["No medication", "OTC medicine", "Prescription medicine", "Both OTC and prescription"],
          icon: "pill"
        },
        {
          question: "Have you noticed any fever?",
          options: ["No fever", "Low grade", "Moderate fever", "High fever"],
          icon: "thermometer"
        },
        {
          question: "How is your sleep affected?",
          options: ["Not affected", "Slightly affected", "Moderately affected", "Severely affected"],
          icon: "moon"
        },
        {
          question: "What makes it worse?",
          options: ["Physical activity", "Specific foods", "Time of day", "Stress"],
          icon: "activity"
        },
        {
          question: "What provides relief?",
          options: ["Rest", "Medication", "Position change", "Nothing helps"],
          icon: "activity"
        },
        {
          question: "Impact on daily activities?",
          options: ["No impact", "Slight impact", "Moderate impact", "Severe impact"],
          icon: "activity"
        },
        {
          question: "Have you had similar symptoms before?",
          options: ["Never", "Once", "Several times", "Regularly"],
          icon: "calendar"
        }
      ];
      
      setDynamicQuestions(fallbackQuestions);
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleModalOpen = async () => {
    await getDynamicQuestions();
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleSubmitGemini = async (e) => {
    e.preventDefault();
    setLoading(true);
    setGeminiResponse("");
    setShowAppointmentButton(false);
    setError("");

    try {
      const prompt = `
        Act as a medical professional analyzing the following patient symptoms and assessment:

        Primary Symptom: ${symptom}
        Additional Symptoms: ${additionalSymptoms.filter(s => s).join(", ")}
        Previous History: ${previousSymptoms === 'yes' ? 'Patient reports similar symptoms in the past' : 'No previous history'}
        
        Assessment Results:
        ${Object.entries(questionAnswers)
          .map(([index, answer]) => `- ${dynamicQuestions[index]?.question}: ${answer}`)
          .join("\n")}

        Provide a structured clinical assessment including:
        1. Detailed analysis of the condition and its potential causes
        2. Severity assessment based on the provided symptoms and answers
        3. Clear recommendations for next steps
        4. Urgency level (whether immediate medical attention is needed)
        5. Potential red flags or warning signs to watch for

        Format the response in clear sections with HTML paragraphs and lists for readability.
      `;

      const res = await run(prompt);
      setGeminiResponse(res);
      setShowAppointmentButton(true);
    } catch (error) {
      console.error("Error fetching response from Gemini:", error);
      setError("Failed to analyze symptoms. Please try again.");
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
      moon: MoonIcon
    };
    return iconMap[iconName] || ActivityIcon;
  };

  return (
    <div className="medical-form-container">
      <h2>
        <AlertCircle className="inline-block mr-2 text-blue-500" size={32} />
        Medical Assistant
      </h2>
      
      <form onSubmit={handleSubmitGemini}>
        <div className="input-group">
          <label>Primary Symptom:</label>
          <input 
            type="text" 
            value={symptom} 
            onChange={(e) => setSymptom(e.target.value)} 
            placeholder="Enter your main symptom or condition"
            required 
          />
        </div>

        <div className="input-group">
          <label>Previous History:</label>
          <select 
            value={previousSymptoms} 
            onChange={(e) => setPreviousSymptoms(e.target.value)}
          >
            <option value="yes">Yes, I had similar symptoms before</option>
            <option value="no">No, this is the first time</option>
          </select>
        </div>

        <div className="additional-symptoms">
          <h4>Additional Symptoms</h4>
          {additionalSymptoms.map((sym, index) => (
            <div key={index} className="input-group">
              <input 
                type="text" 
                value={sym} 
                onChange={(e) => handleAdditionalSymptomChange(index, e.target.value)}
                placeholder={`Symptom ${index + 2}`}
              />
            </div>
          ))}
          <button type="button" onClick={addSymptom}>
            <PlusCircle size={18} className="mr-1" />
            Add Another Symptom
          </button>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader className="animate-spin mr-2" size={18} />
              Analyzing...
            </>
          ) : (
            'Get Medical Assistance'
          )}
        </button>
      </form>

      {error && (
        <div className="error-message">
          <AlertCircle size={18} className="mr-1 text-red-500" />
          {error}
        </div>
      )}

      {symptom && (
        <button 
          type="button" 
          onClick={handleModalOpen} 
          className="check-severity-btn"
          disabled={questionsLoading}
        >
          {questionsLoading ? (
            <>
              <Loader className="animate-spin mr-2" size={18} />
              Loading Questions...
            </>
          ) : (
            <>
              <AlertCircle size={18} className="mr-1" />
              Check Symptom Severity
            </>
          )}
        </button>
      )}

      {geminiResponse && (
        <div className="response-container">
          <CheckCircle className="text-green-500 mb-2" size={24} />
          <div dangerouslySetInnerHTML={{ __html: geminiResponse }} />
        </div>
      )}
      
      {showAppointmentButton && (
        <button className="book-appointment-btn">
          <CalendarIcon size={18} className="mr-1" />
          Schedule Doctor Appointment
        </button>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={handleModalClose}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <h3>
              <AlertCircle className="inline-block mr-2 text-blue-500" size={24} />
              Severity Assessment for {symptom}
            </h3>
            
            <form>
              {dynamicQuestions.map((item, index) => {
                const Icon = getIconComponent(item.icon);
                return (
                  <div key={index} className="input-group">
                    <label>
                      <Icon size={18} className="inline-block mr-2 text-blue-500" />
                      {item.question}
                    </label>
                    <select
                      value={questionAnswers[index] || ""}
                      onChange={(e) => handleQuestionChange(index, e.target.value)}
                    >
                      <option value="">Select an answer</option>
                      {item.options.map((option, optionIndex) => (
                        <option key={optionIndex} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </form>

            <button type="button" onClick={handleModalClose} className="close-modal-btn">
              <X size={18} className="mr-1" />
              Close Assessment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalForm;