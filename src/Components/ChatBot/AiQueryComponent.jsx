// // // import React, { useState } from "react";
// // // import axios from "axios";
// // // import run from "../firebaseGemini";
// // // import img from  "../../assets/medicalBot.jpg"
// // // const AiQueryComponent = () => {
// // //   const [query, setQuery] = useState("");
// // //   const [response, setResponse] = useState("");
// // //   const [loading, setLoading] = useState(false);
// // //   const [error, setError] = useState("");
// // //   const [geminiResponse, setGeminiResponse] = useState(""); // State for Gemini response

// // //   const apiKey =
// // //     "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"; // Replace with your API key

// // //   const handleSubmitOpenAI = async () => {
// // //     // ... (Your existing OpenAI submission logic - no changes needed here)
// // //   };

// // //   const handleSubmitGemini = async () => {
// // //     if (!query.trim()) {
// // //       setError("Please enter a valid query.");
// // //       return;
// // //     }

// // //     setLoading(true);
// // //     setError("");
// // //     setGeminiResponse(""); // Clear previous Gemini response

// // //     try {
// // //       const newQuery = `Iam experiencing ${query}. Which medical specialist will be more accurate to visit? give me the specilist name only.`;
// // //       const res = await run(newQuery);
// // //       setGeminiResponse(res); // Set the Gemini response
// // //     } catch (error) {
// // //       setError("Error fetching response from Gemini. Please try again later.");
// // //       console.error("Error:", error);
// // //     } finally {
// // //       setLoading(false);
// // //     }

// // //     setQuery(""); // Clear input field after submission
// // //   };

// // //   return (
// // //     <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>

// // //       <img style={{marginTop:"25px", height:"240px",width:"50vw"}} src={img} alt="" />
// // //       {/* <h2>Ask AI a Question</h2> */}

// // //       <textarea
// // //         value={query}
// // //         onChange={(e) => setQuery(e.target.value)}
// // //         placeholder="Type your question here..."
// // //         rows="5"
// // //         style={{
// // //           width: "40%",
// // //           backgroundColor: "6AA2E3",
// // //           position:"relative",
// // //           padding: "10px",
// // //           height:"30px",
// // //           fontSize: "16px",
// // //          // marginBottom: "10px",
// // //           borderRadius: "5px",
// // //           border: "1px solid #ccc",
// // //         }}
// // //       />
// // //       <br />

// // //       <button
// // //         onClick={handleSubmitGemini} // Call Gemini submit function
// // //         disabled={loading}
// // //         style={{
// // //           backgroundColor: "green",
// // //           color: "white",
// // //           padding: "10px 20px",
// // //           borderRadius: "5px",
// // //           cursor: loading ? "not-allowed" : "pointer",

// // //         }}
// // //       >
// // //         {loading ? "Loading..." : "Get Answer (Gemini)"}
// // //       </button>

// // //       {/* <button
// // //         onClick={handleSubmitOpenAI} // Call Gemini submit function
// // //         disabled={loading}
// // //         style={{
// // //           backgroundColor: "blue",
// // //           color: "white",
// // //           padding: "10px 20px",
// // //           borderRadius: "5px",
// // //           cursor: loading ? "not-allowed" : "pointer",
// // //           marginTop: "10px",
// // //           marginLeft: "10px",
// // //         }}
// // //       > */}
// // //       {/* {loading ? "Loading..." : "Get Answer (OpenAI)"}
// // //       </button> */}

// // //       {/* Display Gemini Response */}
// // //       {geminiResponse && (
// // //         <div
// // //           style={{
// // //             marginTop: "20px",
// // //             padding: "10px",
// // //             border: "1px solid #ccc",
// // //             backgroundColor: "#f9f9f9",
// // //             borderRadius: "5px",
// // //           }}
// // //         >
// // //           <h3>Gemini's Answer:</h3>
// // //           <p>{geminiResponse}</p> {/* Display Gemini response in the p tag */}
// // //         </div>
// // //       )}

// // //       {/* Display OpenAI Response */}
// // //       {response && (
// // //         <div
// // //           style={{
// // //             marginTop: "20px",
// // //             padding: "10px",
// // //             border: "1px solid #ccc",
// // //             backgroundColor: "#f9f9f9",
// // //             borderRadius: "5px",
// // //           }}
// // //         >
// // //           <h3>OpenAI's Answer:</h3>
// // //           <p>{response}</p> {/* Display OpenAI response in the p tag */}
// // //         </div>
// // //       )}

// // //       {error && (
// // //         <div
// // //           style={{
// // //             marginTop: "20px",
// // //             padding: "10px",
// // //             color: "red",
// // //             border: "1px solid red",
// // //             backgroundColor: "#ffe6e6",
// // //             borderRadius: "5px",
// // //           }}
// // //         >
// // //           <h3>Error:</h3>
// // //           <p>{error}</p>
// // //         </div>
// // //       )}
// // //     </div>
// // //   );
// // // };

// // // export default AiQueryComponent;

// // // // ... (Your firebaseGemini.js file remains the same)

import React, { useState } from "react";
import axios from "axios";
import run from "../firebaseGemini";
import img from  "../../assets/medicalBot.jpg"

const AiQueryComponent = () => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [geminiResponse, setGeminiResponse] = useState(""); // State for Gemini response

  const apiKey =
    "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"; // Replace with your API key

  const handleSubmitOpenAI = async () => {
    // ... (Your existing OpenAI submission logic - no changes needed here)
  };

  const handleSubmitGemini = async () => {
    if (!query.trim()) {
      setError("Please enter a valid query.");
      return;
    }

    setLoading(true);
    setError("");
    setGeminiResponse(""); // Clear previous Gemini response

    try {
      const newQuery = `Iam experiencing ${query}. Which medical specialist will be more accurate to visit? give me the specilist name only.`;
      const res = await run(newQuery);
      setGeminiResponse(res); // Set the Gemini response
    } catch (error) {
      setError("Error fetching response from Gemini. Please try again later.");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }

    setQuery(""); // Clear input field after submission
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <img style={{marginTop:"95px", height:"240px",width:"50vw"}} src={img} alt="" />

      {/* Display Gemini Response */}
      {geminiResponse && (
        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            border: "1px solid #ccc",
            backgroundColor: "#f9f9f9",
            borderRadius: "5px",
          }}
        >
          <h3>Gemini's Answer:</h3>
          <p>{geminiResponse}</p> {/* Display Gemini response in the p tag */}
        </div>
      )}

      {/* Input field and button */}
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Type your symptoms here..."
        rows="5"
        style={{
          width: "48vw",
          backgroundColor: "6AA2E3",
          position:"relative",
          padding: "10px",
           height:"50px",
          fontSize: "16px",
          borderRadius: "5px",
          border: "1px solid black",
          marginTop:"10px"
        }}
      />
      <br />

      <button
        onClick={handleSubmitGemini} // Call Gemini submit function
        disabled={loading}
        style={{
          backgroundColor: "#444242",
          color: "white", 
          padding: "10px 20px",
          borderRadius: "5px",
          border:"2px #444242",
          marginTop:"10px",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Loading..." : "Get Answer"}
      </button>

      {/* Display OpenAI Response */}
      {response && (
        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            border: "1px solid #ccc",
            backgroundColor: "#f9f9f9",
            borderRadius: "5px",
          }}
        >
          <h3>OpenAI's Answer:</h3>
          <p>{response}</p> {/* Display OpenAI response in the p tag */}
        </div>
      )}

      {/* Display error message */}
      {error && (
        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            color: "red",
            border: "1px solid red",
            backgroundColor: "#ffe6e6",
            borderRadius: "5px",
          }}
        >
          <h3>Error:</h3>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default AiQueryComponent;

// import React, { useState } from "react";
// import axios from "axios";
// import run from "../firebaseGemini";
// import img from "../../assets/medicalBot.jpg";

// const AiQueryComponent = () => {
//   const [query, setQuery] = useState("");
//   const [response, setResponse] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [geminiResponse, setGeminiResponse] = useState(""); // State for Gemini response

//   const apiKey =
//     "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"; // Replace with your API key

//   const handleSubmitOpenAI = async () => {
//     // ... (Your existing OpenAI submission logic - no changes needed here)
//   };

//   const handleSubmitGemini = async () => {
//     if (!query.trim()) {
//       setError("Please enter a valid query.");
//       return;
//     }

//     setLoading(true);
//     setError("");
//     setGeminiResponse(""); // Clear previous Gemini response

//     try {
//       const newQuery = `Iam experiencing ${query}. Which medical specialist will be more accurate to visit? give me the specilist name only.`;
//       const res = await run(newQuery);
//       setGeminiResponse(res); // Set the Gemini response
//     } catch (error) {
//       setError("Error fetching response from Gemini. Please try again later.");
//       console.error("Error:", error);
//     } finally {
//       setLoading(false);
//     }

//     setQuery(""); // Clear input field after submission
//   };

//   return (
//     <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
//       {/* Image with input field overlay */}
//       <div style={{ position: "relative", textAlign: "center" }}>
//         <img
//           style={{ marginTop: "25px", height: "240px", width: "50vw" }}
//           src={img}
//           alt="Medical Bot"
//         />

//         {/* Textarea input field over the image */}
//         <textarea
//           value={query}
//           onChange={(e) => setQuery(e.target.value)}
//           placeholder="Type your question here..."
//           rows="1"
//           style={{
//             position: "absolute",
//             bottom: "10px",  // Adjust this value to position the input higher or lower
//             left: "50%",
//             transform: "translateX(-50%)",  // Center the input horizontally
//             width: "60%", // Adjust width as needed
//             backgroundColor: "#6AA2E3",
//             padding: "10px",
//             maxHeight:"70px",
//             color:"#000",
//             fontSize: "16px",
//             borderRadius: "5px",
//             border: "1px solid #ccc",
//             zIndex: 1,
//           }}
//         />
//       </div>

//       {/* Display Gemini Response */}
//       {geminiResponse && (
//         <div
//           style={{
//             marginTop: "20px",
//             padding: "10px",
//             border: "1px solid #ccc",
//             backgroundColor: "#f9f9f9",
//             borderRadius: "5px",
//           }}
//         >
//           <h3>Gemini's Answer:</h3>
//           <p>{geminiResponse}</p> {/* Display Gemini response in the p tag */}
//         </div>
//       )}

//       {/* Submit Button */}
//       <button
//         onClick={handleSubmitGemini} // Call Gemini submit function
//         disabled={loading}
//         style={{
//           backgroundColor: "green",
//           color: "white",
//           padding: "10px 20px",
//           borderRadius: "5px",
//           cursor: loading ? "not-allowed" : "pointer",
//           marginTop: "20px",
//         }}
//       >
//         {loading ? "Loading..." : "Get Answer (Gemini)"}
//       </button>

//       {/* Display OpenAI Response */}
//       {response && (
//         <div
//           style={{
//             marginTop: "20px",
//             padding: "10px",
//             border: "1px solid #ccc",
//             backgroundColor: "#f9f9f9",
//             borderRadius: "5px",
//           }}
//         >
//           <h3>OpenAI's Answer:</h3>
//           <p>{response}</p> {/* Display OpenAI response in the p tag */}
//         </div>
//       )}

//       {/* Display error message */}
//       {error && (
//         <div
//           style={{
//             marginTop: "20px",
//             padding: "10px",
//             color: "red",
//             border: "1px solid red",
//             backgroundColor: "#ffe6e6",
//             borderRadius: "5px",
//           }}
//         >
//           <h3>Error:</h3>
//           <p>{error}</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AiQueryComponent;

// import React, { useState } from "react";
// import axios from "axios";
// import run from "../firebaseGemini";
// import img from "../../assets/medicalBot.jpg";
// import "./Ai.css"
// const AiQueryComponent = () => {
//   const [query, setQuery] = useState("");
//   const [response, setResponse] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [geminiResponse, setGeminiResponse] = useState(""); // State for Gemini response

//   const apiKey =
//     "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"; // Replace with your API key

//   const handleSubmitOpenAI = async () => {
//     // ... (Your existing OpenAI submission logic - no changes needed here)
//   };

//   const handleSubmitGemini = async () => {
//     if (!query.trim()) {
//       setError("Please enter a valid query.");
//       return;
//     }

//     setLoading(true);
//     setError("");
//     setGeminiResponse(""); // Clear previous Gemini response

//     try {
//       const newQuery = `Iam experiencing ${query}. Which medical specialist will be more accurate to visit? give me the specilist name only.`;
//       const res = await run(newQuery);
//       setGeminiResponse(res); // Set the Gemini response
//     } catch (error) {
//       setError("Error fetching response from Gemini. Please try again later.");
//       console.error("Error:", error);
//     } finally {
//       setLoading(false);
//     }

//     setQuery(""); // Clear input field after submission
//   };

//   return (
//     <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
//       {/* Image with input field overlay */}
//       <div style={{ position: "relative", textAlign: "center" }}>
//         <img
//           style={{ marginTop: "25px", height: "290px", width: "50vw" }}
//           src={img}
//           alt="Medical Bot"
//         />

//         {/* Textarea input field over the image */}
//         <input
//         className="query-input"
//           value={query}
//           onChange={(e) => setQuery(e.target.value)}
//           placeholder="Type your question here..."
//           // rows="1"
//           style={{
//             position: "absolute",
//             bottom: "39px", // Adjust this value to position the input higher or lower
//             left: "55%",
//             "::placeholder": {
//               color: "#fff", // Change the placeholder color to white
//             },

//             transform: "translateX(-50%)", // Center the input horizontally
//             width: "60%", // Adjust width as needed
//             backgroundColor: "#6AA2E3",
//             padding: "10px",
//             fontSize: "16px",
//             height: "20px", // Set height to 80px
//             borderRadius: "5px",
//             border: "1px solid #000",
//             zIndex: 1,
//           }}
//         />
//       </div>

//       {/* Display Gemini Response */}
//       {geminiResponse && (
//         <div
//           style={{
//             marginTop: "20px",
//             padding: "10px",
//             border: "1px solid #ccc",
//             backgroundColor: "#f9f9f9",
//             borderRadius: "5px",
//           }}
//         >
//           <h3>Gemini's Answer:</h3>
//           <p>{geminiResponse}</p> {/* Display Gemini response in the p tag */}
//         </div>
//       )}

//       {/* Submit Button */}
//       <button
//         onClick={handleSubmitGemini} // Call Gemini submit function
//         disabled={loading}
//         style={{
//           backgroundColor: "green",
//           color: "white",
//           padding: "10px 20px",
//           borderRadius: "5px",
//           cursor: loading ? "not-allowed" : "pointer",
//           marginTop: "20px",
//         }}
//       >
//         {loading ? "Loading..." : "Get Answer (Gemini)"}
//       </button>

//       {/* Display OpenAI Response */}
//       {response && (
//         <div
//           style={{
//             marginTop: "20px",
//             padding: "10px",
//             border: "1px solid #ccc",
//             backgroundColor: "#f9f9f9",
//             borderRadius: "5px",
//           }}
//         >
//           <h3>OpenAI's Answer:</h3>
//           <p>{response}</p> {/* Display OpenAI response in the p tag */}
//         </div>
//       )}

//       {/* Display error message */}
//       {error && (
//         <div
//           style={{
//             marginTop: "20px",
//             padding: "10px",
//             color: "red",
//             border: "1px solid red",
//             backgroundColor: "#ffe6e6",
//             borderRadius: "5px",
//           }}
//         >
//           <h3>Error:</h3>
//           <p>{error}</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AiQueryComponent;
