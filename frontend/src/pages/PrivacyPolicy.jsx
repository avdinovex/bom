import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* <button onClick={() => navigate(-1)} style={styles.backButton}>
          <FaArrowLeft style={styles.backIcon} /> Back
        </button> */}

        <h1 style={styles.title}>Privacy Policy</h1>
        <p style={styles.subtitle}>Brotherhood of Mumbai (BOM)</p>
        <p style={styles.lastUpdated}>Effective Date: October 22, 2025</p>

        <div style={styles.section}>
          <h2 style={styles.heading}>1. Information We Collect</h2>
          <p style={styles.text}>
            We collect personal information that you provide to us when registering for rides, including your name, contact number, email address, and vehicle details. We may also collect payment information necessary to process your registration fees.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.heading}>2. How We Use Your Information</h2>
          <p style={styles.text}>
            The information we collect is used to process your ride registrations, communicate ride details and updates, ensure participant safety and compliance with ride guidelines, maintain records of participation, and improve our services and ride experiences.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.heading}>3. Information Sharing</h2>
          <p style={styles.text}>
            We do not sell, trade, or rent your personal information to third parties. We may share your information with authorized ride marshals and organizers for safety purposes, payment processors for transaction processing, and when required by law or to protect the safety of participants.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.heading}>4. Data Security</h2>
          <p style={styles.text}>
            We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.heading}>5. Data Retention</h2>
          <p style={styles.text}>
            We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, comply with legal obligations, resolve disputes, and enforce our agreements.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.heading}>6. Your Rights</h2>
          <p style={styles.text}>
            You have the right to access the personal information we hold about you, request correction of inaccurate data, request deletion of your data (subject to legal requirements), and opt-out of marketing communications.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.heading}>7. Cookies and Tracking</h2>
          <p style={styles.text}>
            Our website may use cookies to enhance user experience and analyze website traffic. You can control cookie preferences through your browser settings.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.heading}>8. Contact Information</h2>
          <p style={styles.text}>
            If you have any questions or concerns about this Privacy Policy, please contact us at:
          </p>
          <div style={styles.contactBox}>
            <p style={styles.contactText}>📧 brotherhoodofmumbai@gmail.com</p>
            <p style={styles.contactText}>📞 9821945661</p>
            <p style={styles.contactText}>📍 Dahisar, West 400 068</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#0a0a0a",
    color: "#fff",
    fontFamily: "'Poppins', sans-serif",
    padding: "40px 20px",
  },
  content: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "40px",
    backgroundColor: "#111",
    borderRadius: "8px",
    boxShadow: "0 4px 20px rgba(230, 57, 70, 0.1)",
  },
  backButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "transparent",
    border: "1px solid #e63946",
    color: "#e63946",
    padding: "10px 20px",
    borderRadius: "4px",
    fontSize: "14px",
    cursor: "pointer",
    marginBottom: "30px",
    transition: "all 0.3s ease",
  },
  backIcon: {
    fontSize: "14px",
  },
  title: {
    fontSize: "clamp(28px, 4vw, 36px)",
    fontWeight: "700",
    color: "#e63946",
    marginBottom: "10px",
  },
  subtitle: {
    fontSize: "clamp(16px, 2.5vw, 20px)",
    color: "#ccc",
    marginBottom: "5px",
  },
  lastUpdated: {
    fontSize: "clamp(13px, 2vw, 14px)",
    color: "#999",
    marginBottom: "40px",
  },
  section: {
    marginBottom: "35px",
  },
  heading: {
    fontSize: "clamp(18px, 2.5vw, 22px)",
    fontWeight: "600",
    color: "#fff",
    marginBottom: "15px",
  },
  text: {
    fontSize: "clamp(14px, 2vw, 16px)",
    color: "#ccc",
    lineHeight: "1.8",
    marginBottom: "10px",
  },
  contactBox: {
    backgroundColor: "#1a1a1a",
    padding: "20px",
    borderRadius: "6px",
    marginTop: "15px",
    borderLeft: "3px solid #e63946",
  },
  contactText: {
    fontSize: "clamp(14px, 2vw, 16px)",
    color: "#ccc",
    marginBottom: "8px",
  },
};

export default PrivacyPolicy;