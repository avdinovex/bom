import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const TermsConditions = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* <button onClick={() => navigate(-1)} style={styles.backButton}>
          <FaArrowLeft style={styles.backIcon} /> Back
        </button> */}

        <h1 style={styles.title}>Terms & Conditions</h1>
        <p style={styles.subtitle}>Brotherhood of Mumbai (BOM)</p>
        <p style={styles.lastUpdated}>Effective Date: October 22, 2025</p>

        <div style={styles.section}>
          <h2 style={styles.heading}>1. Registration & Payment</h2>
          <p style={styles.text}>
            All participants must complete registration and full payment to confirm their participation in any BOM ride. Participation is subject to seat availability and organizer approval. By registering, you agree to provide accurate information and accept responsibility for your participation.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.heading}>2. Mandatory Riding Gear</h2>
          <p style={styles.text}>
            All riders must wear full riding gear including Helmet, Riding Jacket, Gloves, Knee Guards or Riding Pants, and Proper Riding Shoes or Boots. No rider will be allowed to join the ride without complete riding gear. Pillion riders, if allowed, must also wear a helmet and protective gear. This is non-negotiable and enforced for your safety.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.heading}>3. Ride Guidelines</h2>
          <p style={styles.text}>
            Riders must strictly follow all traffic rules, safety protocols, and instructions given by the BOM organizing team. Consumption of alcohol or any intoxicating substances before or during the ride is strictly prohibited. The ride itinerary and schedule may change due to weather, safety, or other unavoidable circumstances at the discretion of the organizers.
          </p>
          <div style={styles.warningBox}>
            <p style={styles.warningText}>
              ⚠️ Violation of ride guidelines may result in immediate removal from the ride without refund.
            </p>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.heading}>4. Liability & Responsibility</h2>
          <p style={styles.text}>
            BOM and its organizing team will not be held responsible for any personal injury, accident, vehicle damage, or loss of belongings during the ride. Every rider is responsible for ensuring their motorcycle is in good condition, insured, and carries valid documents including driving license, registration certificate, and insurance papers.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.heading}>5. Code of Conduct</h2>
          <p style={styles.text}>
            Participants are expected to maintain respectful behavior towards fellow riders, organizers, and the general public. Any form of harassment, discrimination, or misconduct will not be tolerated and may result in immediate removal from the ride and future events.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.heading}>6. Media & Photography</h2>
          <p style={styles.text}>
            By participating in BOM rides, you consent to being photographed and filmed. These images and videos may be used for promotional purposes on BOM's social media platforms and marketing materials. If you do not wish to be featured, please inform the organizers in writing before the ride.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.heading}>7. Modification of Terms</h2>
          <p style={styles.text}>
            BOM reserves the right to modify these terms and conditions at any time. Participants will be notified of significant changes via email or through our official communication channels. Continued participation in rides constitutes acceptance of the modified terms.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.heading}>8. Contact Us</h2>
          <p style={styles.text}>
            For any questions or clarifications regarding these terms and conditions, please reach out to us:
          </p>
          <div style={styles.contactBox}>
            <p style={styles.contactText}>📧 brotherhoodofmumbai@gmail.com</p>
            <p style={styles.contactText}>📞 9821945661</p>
            <p style={styles.contactText}>📍 Dahisar, West 400 068</p>
            <p style={styles.contactText}>🕒 Mon - Sat: 7am to 4:30pm</p>
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
  warningBox: {
    backgroundColor: "rgba(230, 57, 70, 0.1)",
    padding: "15px",
    borderRadius: "6px",
    marginTop: "15px",
    borderLeft: "3px solid #e63946",
  },
  warningText: {
    fontSize: "clamp(13px, 2vw, 15px)",
    color: "#e63946",
    fontWeight: "500",
    margin: 0,
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

export default TermsConditions;