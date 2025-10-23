import React from "react";
import logo1 from "../assets/logo.png";
import logo2 from "../assets/logo.png";
import logo3 from "../assets/logo.png";
import logo4 from "../assets/logo.png";
import logo5 from "../assets/logo.png";
import logo6 from "../assets/logo.png";

const SponsorBand = () => {
  const containerStyle = {
    width: "100%",
    overflow: "hidden",
    backgroundColor: "#000",
    padding: "20px 0",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "50px"
  };

  const sliderStyle = {
    display: "flex",
    alignItems: "center",
    animation: "scroll 25s linear infinite",
    width: "calc(200px * 12)", // duplicates for smooth loop
  };

  const logoStyle = {
    height: "70px",
    width: "auto",
    margin: "0 40px",
    objectFit: "contain",
    filter: "brightness(0) invert(1)", // makes logos white on dark bg
  };

  const keyframes = `
    @keyframes scroll {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
  `;

  return (
    <div style={containerStyle}>
      <style>{keyframes}</style>
      <div style={sliderStyle}>
        {[logo1, logo2, logo3, logo4, logo5, logo6, logo1, logo2, logo3, logo4, logo5, logo6].map(
          (logo, index) => (
            <img key={index} src={logo} alt={`Sponsor ${index + 1}`} style={logoStyle} />
          )
        )}
      </div>
    </div>
  );
};

export default SponsorBand;
