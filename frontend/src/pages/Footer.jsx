import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaMapMarkerAlt, FaClock, FaInstagram } from "react-icons/fa";
import logo from "../assets/logo.png";

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scrolling when navigating to main page with scroll state
  useEffect(() => {
    if (location.state?.scrollTo) {
      setTimeout(() => {
        const element = document.getElementById(location.state.scrollTo);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      // Clear the state after scrolling
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleNavClick = (path, sectionId = null) => {
    const isOnMainPage = location.pathname === '/';
    
    if (sectionId) {
      if (isOnMainPage) {
        // Already on main page, just scroll to section
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        // Navigate to main page with scroll state
        navigate('/', { state: { scrollTo: sectionId } });
      }
    } else {
      // Regular navigation
      navigate(path);
      if (path !== location.pathname) {
        window.scrollTo(0, 0);
      }
    }
  };

  const handleInstagramClick = () => {
    window.open("https://www.instagram.com/brotherhoodofmumbai/?hl=en", "_blank");
  };

  return (
    <footer id="contactus" style={styles.footer}>
      <div style={styles.container} className="footer-container">
        <div style={styles.column}>
          <h3 style={styles.heading}>Get In Touch</h3>
          <p style={styles.text}>
            <FaMapMarkerAlt style={styles.icon} /> Dahisar, west 400 068
          </p>
          <p style={styles.text}>
            <FaClock style={styles.icon} /> Mon - Sat: 7am to 4.30pm <br /> Sunday: Holiday
          </p>
        </div>

        <div style={styles.column}>
          <img src={logo} alt="Xriders Logo" style={styles.logo} />
          <p style={styles.text}>
           Brotherhood Of Mumbai: Experience the ride you never did!!
          </p>

          <div style={styles.contactBox}>
            <p style={styles.phone}>9821945661</p>
            <p style={styles.email}> brotherhoodofmumbai@gmail.com </p>
          </div>
        </div>
      </div>

      <div style={styles.bottom} className="footer-bottom">
        <p style={styles.copyright}>
           <span style={{ color: "#e63946", fontWeight: "bold" }}>BOM</span>. All Rights Reserved.
        </p>
        <div style={styles.navLinks} className="footer-nav">
          <span onClick={() => handleNavClick("/", "home")} style={styles.navLink}>Home</span>
          <span onClick={() => handleNavClick("/events")} style={styles.navLink}>Event Info</span>
          <span onClick={() => handleNavClick("/register")} style={styles.navLink}>Registered?</span>
          <span onClick={() => handleNavClick("/", "contactus")} style={styles.navLink}>Contact Us</span>
        </div>
        <div style={styles.policyLinks} className="footer-policy">
          <span onClick={() => handleNavClick("/privacy-policy")} style={styles.navLink}>Privacy Policy</span>
          <span onClick={() => handleNavClick("/terms-conditions")} style={styles.navLink}>Terms & Conditions</span>
          <span onClick={() => handleNavClick("/cancellation-refund")} style={styles.navLink}>Cancellation & Refund</span>
          {/* <span onClick={() => handleNavClick("/shipping-delivery")} style={styles.navLink}>Shipping & Delivery</span> */}
        </div>
        <div style={styles.socialIcons}>
          <div 
            style={styles.iconBox} 
            className="iconBox"
            onClick={handleInstagramClick}
          >
            <FaInstagram />
          </div>
        </div>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: "#111",
    color: "#fff",
    padding: "40px 100px 20px",
    fontFamily: "'Poppins', sans-serif",
  },
  container: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "40px",
    marginBottom: "30px",
    maxWidth: "1400px",
    margin: "0 auto 30px auto",
    alignItems: "start",
  },
  column: {
    display: "flex",
    flexDirection: "column",
  },
  logo: {
    width: "180px",
    marginBottom: "15px",
  },
  heading: {
    fontSize: "clamp(20px, 3vw, 24px)",
    fontWeight: "700",
    marginBottom: "20px",
  },
  text: {
    fontSize: "clamp(14px, 2vw, 16px)",
    color: "#ccc",
    marginBottom: "12px",
    lineHeight: "1.8",
  },
  contactBox: {
    backgroundColor: "#e63946",
    color: "#fff",
    padding: "10px 25px 25px",
    borderRadius: "4px",
    marginTop: "10px",
  },
  phone: {
    fontSize: "clamp(16px, 2.5vw, 18px)",
    fontWeight: "600",
    marginBottom: "5px",
  },
  email: {
    fontSize: "clamp(14px, 2vw, 16px)",
    margin: "0",
  },
  icon: {
    color: "#e63946",
    marginRight: "10px",
  },
  bottom: {
    borderTop: "1px solid rgba(255,255,255,0.1)",
    paddingTop: "25px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "18px",
    textAlign: "center",
  },
  copyright: {
    fontSize: "clamp(13px, 2vw, 15px)",
    color: "#ccc",
  },
  navLinks: {
    display: "flex",
    gap: "30px",
    flexWrap: "wrap",
    justifyContent: "center",
    fontSize: "clamp(13px, 2vw, 15px)",
    color: "#ccc",
  },
  policyLinks: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
    justifyContent: "center",
    fontSize: "clamp(12px, 1.8vw, 14px)",
    color: "#999",
  },
  navLink: {
    cursor: "pointer",
    transition: "color 0.3s ease",
  },
  socialIcons: {
    display: "flex",
    gap: "15px",
    justifyContent: "center",
  },
  iconBox: {
    width: "45px",
    height: "25px",
    backgroundColor: "#1c1c1c",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "4px",
    fontSize: "20px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
};

if (typeof document !== "undefined") {
  const styleTag = document.createElement("style");
  styleTag.innerHTML = `
    .iconBox:hover {
      background-color: #e63946 !important;
    }
    
    .footer-nav span:hover {
      color: #e63946 !important;
    }
    
    .footer-policy span:hover {
      color: #e63946 !important;
    }
    
    @media (max-width: 768px) {
      footer {
        padding: 30px 20px 20px !important;
      }
      .footer-container {
        grid-template-columns: 1fr !important;
        gap: 30px !important;
      }
      .footer-nav {
        gap: 15px !important;
      }
      .footer-policy {
        gap: 12px !important;
      }
    }
    
    @media (max-width: 480px) {
      .footer-nav span {
        font-size: 13px;
      }
      .footer-policy span {
        font-size: 11px;
      }
    }
  `;
  document.head.appendChild(styleTag);
}

export default Footer;