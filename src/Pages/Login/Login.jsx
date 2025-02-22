// import React, { useState } from "react";
// import { loginUser } from "../../firebase";
// import { Link, useNavigate } from "react-router-dom";
// import "./Login.css"; // Import the CSS file

// const Login = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [name,setname] = useState("")
//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       await loginUser(email, password);
//       localStorage.setItem('name',name)
//       navigate("/");
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   return (
//     <div className="container">
//       <h2 className="title">Login</h2>
//       {error && <p className="error">{error}</p>}
//       <form onSubmit={handleLogin} className="form">
//       <input
//           type="text"
//           placeholder="User name"
//           value={name}
//           onChange={(e) => setname(e.target.value)}
//           required
//           className="input"
//         />
//         <input
//           type="email"
//           placeholder="Email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           required
//           className="input"
//         />
//         <input
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           required
//           className="input"
//         />
//         <button type="submit" className="button">
//           Login
//         </button>
//       </form>
//       <p style={{ marginTop: "10px" }}>
//         Don't have an account? <Link to="/signup">Create an account</Link>
//       </p>
//     </div>
//   );
// };

// export default Login;

import React, { useState, useEffect } from "react";
import { loginUser } from "../../firebase";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import "./Login.css"; // Import the CSS file

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home page if the user is already logged in
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/"); // Redirect to home page if the user is logged in
      }
    });

    return unsubscribe; // Clean up the subscription when the component unmounts
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await loginUser(email, password);
      localStorage.setItem("name", name);
      navigate("/"); // Redirect to home page after successful login
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container">
      <h2 className="title">Login</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleLogin} className="form">
        <input
          type="text"
          placeholder="User name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="input"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="input"
        />
        <button type="submit" className="button">
          Login
        </button>
      </form>
      <p style={{ marginTop: "10px" }}>
        Don't have an account? <Link to="/signup">Create an account</Link>
      </p>
    </div>
  );
};

export default Login;
