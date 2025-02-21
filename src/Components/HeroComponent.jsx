import React from "react";
import hero from "../assets/than1.jpg";
import hero2 from "../assets/hero2.jpg";
import "./HeroComponent.css";
import { Button } from "bootstrap";
const HeroComponent = ({ flag }) => {
  return (
    <div className="hero">
      <img src={flag ? hero : hero2} alt="" className="hero-image" />
      {hero && (
        <button className="btn" style={{position:"absolute",bottom:"7vh",left:"20vw"}}>Create an account</button>
      ) }
      {/* {!flag && (
        <button className="btn" style={{position:"absolute",bottom:"0vh"}}>Create Account ? </button>
      )} */}
    </div>
  );
};

export default HeroComponent;
