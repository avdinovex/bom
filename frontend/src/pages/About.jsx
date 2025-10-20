import React from "react";
import about from "../assets/about.png";
import bottomPaint from "../assets/background.png";
import { useNavigate } from "react-router-dom";

const AboutUs = () => {
  const navigate = useNavigate();

  return (
    <section style={{ ...styles.section, backgroundImage: `url(${bottomPaint})` }}>
      <div style={styles.imageContainer}>
        <img src={about} alt="About Us" style={styles.image} />
      </div>

      <div style={styles.textContainer}>
        <h4 style={styles.subheading}>🏍️ ABOUT US</h4>
        <h1 style={styles.heading}>
          ⚡ EST. 2018 — BOM GROUP: WHERE BROTHERHOOD RIDES BEYOND BORDERS.
        </h1>
        <p style={styles.paragraph}>
          Yeh kahani shuru hui thi kuch bikers ke junoon se, aur aaj ek exclusive brotherhood ban chuki hai — jahan har ride ek yaad ban jaati hai aur har engine ki awaaz ek kahani sunati hai.
        </p>
        <p style={styles.paragraph}>
          We celebrate the love for 150–1000cc machines — but what truly defines us is not the bikes… it's the people behind the throttle. Riders jo sirf speed nahi, road ke saath ek soulful connection mehsoos karte hain. Yahaan har insaan apni kahani lekar aata hai, lekin ride ke baad sab ek hi fam ka hissa ban jaate hain.
        </p>

        <div style={styles.features}>
          <p style={styles.feature}>
            {/* <span style={styles.arrow}>&#187;</span> */}
            {/* <strong>👑 Founded by @mumbiker_kunal and ⚙️ managed by @pooh_sanas</strong>, BOM Group stands for safe riding, strong bonds, and unforgettable journeys. */}
          </p>
          <p style={styles.feature}>
            <span style={styles.arrow}>&#187;</span>
            Hum believe karte hain ki thrill ke saath discipline, aur passion ke saath respect hona chahiye — kyunki yahi riding ka asli essence hai.
          </p>
          <p style={styles.feature}>
            <span style={styles.arrow}>&#187;</span>
            Here, rides are not measured in kilometers… but in memories created on highways, in laughter shared over chai, and in the unspoken trust between riders.
          </p>
          <div style={styles.paragraph}>
            BOM Group is where machine meets soul, thrill meets brotherhood, and every journey becomes a part of a never-ending saga. BOM Group — more than a community… it's a culture, a family, a legacy. 🛣️✨
          </div>
        </div>

        <button style={styles.button} onClick={() => navigate("/discover-more")}>
          <span style={styles.buttonArrow}>&#187;</span> DISCOVER MORE
        </button>
      </div>
    </section>
  );
};

const styles = {
  section: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111",
    color: "#fff",
    padding: "60px 80px 100px",
    position: "relative",
    overflow: "hidden",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "bottom center",
    backgroundSize: "100% auto",
    flexWrap: "wrap",
  },
  imageContainer: {
    flex: "1 1 450px",
    display: "flex",
    justifyContent: "center",
    minWidth: "300px",
  },
  image: {
    width: "100%",
    height: "auto",
    objectFit: "cover",
    borderRadius: "4px",
  },
  textContainer: {
    flex: "1 1 450px",
    paddingLeft: "60px",
    position: "relative",
    minWidth: "300px",
  },
  subheading: {
    letterSpacing: "3px",
    color: "#ccc",
    marginBottom: "10px",
    fontSize: "clamp(12px, 2vw, 14px)",
  },
  heading: {
    fontSize: "clamp(20px, 3vw, 32px)",
    fontWeight: "800",
    lineHeight: "1.3",
    marginBottom: "20px",
  },
  paragraph: {
    color: "#bbb",
    fontSize: "clamp(14px, 2vw, 16px)",
    marginBottom: "25px",
  },
  features: {
    marginBottom: "40px",
  },
  feature: {
    marginBottom: "10px",
    color: "#ddd",
    fontSize: "clamp(14px, 2vw, 16px)",
  },
  arrow: {
    color: "#e63946",
    fontSize: "20px",
    marginRight: "8px",
  },
  button: {
    backgroundColor: "#e63946",
    color: "#fff",
    border: "none",
    padding: "12px 24px",
    fontSize: "clamp(13px, 2vw, 15px)",
    fontWeight: "600",
    cursor: "pointer",
    borderRadius: "2px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  buttonArrow: {
    fontSize: "20px",
    marginRight: "5px",
  },
};

// Media query styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.innerHTML = `
    @media (max-width: 768px) {
      section > div:first-child {
        padding-left: 0 !important;
      }
      section > div:nth-child(2) {
        padding-left: 20px !important;
        margin-top: 30px;
      }
      section {
        padding: 40px 20px 60px !important;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default AboutUs;