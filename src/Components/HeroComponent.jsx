import React, { useState } from "react";
import hero from "../assets/than1.jpg";
import hero2 from "../assets/hero2.jpg";
import "./HeroComponent.css";
import { Button } from "bootstrap";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
const HeroComponent = ({ flag }) => {
  const [user,setUser] = useState(false);
  const unsubscribe = onAuthStateChanged(auth, (user) => {
       if (user) {
         setUser(true)
       }
     });
  const nav = useNavigate();
  return (
    <div className="hero">
      <img src={flag ? hero : hero2} alt="" className="hero-image" />
      {!user && hero && (
        <button className="btn" onClick = {() => nav("/login")} style={{position:"absolute",bottom:"7vh",left:"20vw"}}>Create an account</button>
      ) }
      {/* {!flag && (
        <button className="btn" style={{position:"absolute",bottom:"0vh"}}>Create Account ? </button>
      )} */}
    </div>
  );
};

export default HeroComponent;
