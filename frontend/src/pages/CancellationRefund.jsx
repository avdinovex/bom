import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const CancellationRefund = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* <button onClick={() => navigate(-1)} style={styles.backButton}>
          <FaArrowLeft style={styles.backIcon} /> Back
        </button> */}

        <h1 style={styles.title}>Cancellation & Refund Policy</h1>
        <p style={styles.subtitle}>Brotherhood of Mumbai (BOM)</p>
        <p style={styles.lastUpdated}>Effective Date: October 22, 2025</p>

        <div style={styles.alertBox}>
          <p style={styles.alertText}>
            ⚠️ Please read this policy carefully before making your payment. All cancellations must be communicated via email or phone to be processed.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.heading}>1. Cancellation by Rider</h2>
          
          <div style={styles.policyCard}>
            <h3 style={styles.subHeading}>Before 48 Hours of Ride Start</h3>
            <p style={styles.text}>
              If you cancel your registration more than 48 hours before the scheduled ride start time, you will receive a 50% refund of the total paid amount. The remaining 50% will be retained to cover administrative and organizational costs.
            </p>
            <div style={styles.refundBox}>
              <span style={styles.refundLabel}>Refund Amount:</span>
              <span style={styles.refundAmount}>50% of Payment</span>
            </div>
          </div>

          <div style={styles.policyCard}>
            <h3 style={styles.subHeading}>Before 24 Hours of Ride Start</h3>
            <p style={styles.text}>
              If you cancel your registration between 24-48 hours before the scheduled ride start time, no refund will be provided. This is due to last-minute logistical arrangements and commitments already made.
            </p>
            <div style={styles.refundBox}>
              <span style={styles.refundLabel}>Refund Amount:</span>
              <span style={styles.refundAmount}>No Refund</span>
            </div>
          </div>

          <div style={styles.policyCard}>
            <h3 style={styles.subHeading}>Within 24 Hours & After Ride Start</h3>
            <p style={styles.text}>
              Any cancellation made within 24 hours of the ride start time or after the ride has commenced is non-refundable. This includes no-shows and last-minute cancellations.
            </p>
            <div style={styles.refundBox}>
              <span style={styles.refundLabel}>Refund Amount:</span>
              <span style={styles.refundAmount}>Non-Refundable</span>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.heading}>2. Cancellation by Organizers (BOM)</h2>
          <p style={styles.text}>
            If BOM is forced to cancel or postpone a ride due to unforeseen circumstances such as severe weather conditions, safety concerns, natural disasters, or government restrictions, participants will have two options:
          </p>
          <div style={styles.optionBox}>
            <div style={styles.option}>
              <span style={styles.optionNumber}>Option 1</span>
              <p style={styles.optionText}>Receive a full 100% refund of the paid amount</p>
            </div>
            <div style={styles.option}>
              <span style={styles.optionNumber}>Option 2</span>
              <p style={styles.optionText}>Receive a credit voucher for a future BOM ride of equal or higher value</p>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.heading}>3. Payment Transfer Policy</h2>
          <p style={styles.text}>
            Payments made for a specific ride are non-transferable to other participants or different rides unless explicitly approved by BOM management. Transfer requests must be submitted in writing at least 72 hours before the ride.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.heading}>4. Refund Processing</h2>
          <p style={styles.text}>
            Approved refunds will be processed within 7-10 business days from the date of cancellation approval. Refunds will be credited to the original payment method used during registration. Please note that depending on your bank or payment provider, it may take an additional 3-5 business days for the refund to reflect in your account.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.heading}>5. How to Request Cancellation</h2>
          <p style={styles.text}>
            To request a cancellation, please contact us through:
          </p>
          <div style={styles.contactBox}>
            <p style={styles.contactText}>📧 Email: brotherhoodofmumbai@gmail.com</p>
            <p style={styles.contactText}>📞 Phone: 9821945661</p>
            <p style={styles.contactText}>🕒 Working Hours: Mon - Sat, 7:00 AM to 4:30 PM</p>
          </div>
          <p style={styles.text} style={{...styles.text, marginTop: "15px"}}>
            Please include your booking reference number, registered name, and reason for cancellation in your request.
          </p>
        </div>

        <div style={styles.noteBox}>
          <h3 style={styles.noteHeading}>Important Notes:</h3>
          <ul style={styles.noteList}>
            <li style={styles.noteItem}>All cancellation requests must be made in writing via email or confirmed over phone</li>
            <li style={styles.noteItem}>Cancellation requests are processed based on the time they are received, not when payment was made</li>
            <li style={styles.noteItem}>Processing fees and transaction charges are non-refundable</li>
            <li style={styles.noteItem}>No refunds will be issued for incomplete participation or early departure from rides</li>
          </ul>
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
    marginBottom: "30px",
  },
  alertBox: {
    backgroundColor: "rgba(230, 57, 70, 0.15)",
    padding: "20px",
    borderRadius: "6px",
    marginBottom: "35px",
    borderLeft: "4px solid #e63946",
  },
  alertText: {
    fontSize: "clamp(14px, 2vw, 15px)",
    color: "#fff",
    margin: 0,
    fontWeight: "500",
  },
  section: {
    marginBottom: "35px",
  },
  heading: {
    fontSize: "clamp(20px, 2.5vw, 24px)",
    fontWeight: "600",
    color: "#fff",
    marginBottom: "20px",
  },
  subHeading: {
    fontSize: "clamp(16px, 2vw, 18px)",
    fontWeight: "600",
    color: "#e63946",
    marginBottom: "12px",
  },
  text: {
    fontSize: "clamp(14px, 2vw, 16px)",
    color: "#ccc",
    lineHeight: "1.8",
    marginBottom: "10px",
  },
  policyCard: {
    backgroundColor: "#1a1a1a",
    padding: "25px",
    borderRadius: "6px",
    marginBottom: "20px",
    border: "1px solid rgba(230, 57, 70, 0.2)",
  },
  refundBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0f0f0f",
    padding: "15px 20px",
    borderRadius: "4px",
    marginTop: "15px",
  },
  refundLabel: {
    fontSize: "clamp(14px, 2vw, 15px)",
    color: "#ccc",
  },
  refundAmount: {
    fontSize: "clamp(15px, 2vw, 17px)",
    color: "#e63946",
    fontWeight: "600",
  },
  optionBox: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginTop: "20px",
  },
  option: {
    backgroundColor: "#1a1a1a",
    padding: "20px",
    borderRadius: "6px",
    textAlign: "center",
    border: "1px solid rgba(230, 57, 70, 0.3)",
  },
  optionNumber: {
    display: "block",
    fontSize: "clamp(14px, 2vw, 16px)",
    color: "#e63946",
    fontWeight: "600",
    marginBottom: "10px",
  },
  optionText: {
    fontSize: "clamp(13px, 2vw, 15px)",
    color: "#ccc",
    margin: 0,
    lineHeight: "1.6",
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
  noteBox: {
    backgroundColor: "#1a1a1a",
    padding: "25px",
    borderRadius: "6px",
    border: "1px solid rgba(230, 57, 70, 0.2)",
  },
  noteHeading: {
    fontSize: "clamp(16px, 2vw, 18px)",
    fontWeight: "600",
    color: "#e63946",
    marginBottom: "15px",
  },
  noteList: {
    listStyleType: "none",
    padding: 0,
    margin: 0,
  },
  noteItem: {
    fontSize: "clamp(13px, 2vw, 15px)",
    color: "#ccc",
    marginBottom: "12px",
    paddingLeft: "20px",
    position: "relative",
    lineHeight: "1.6",
  },
};

// Add bullet points styling
if (typeof document !== "undefined") {
  const styleTag = document.createElement("style");
  styleTag.innerHTML = `
    @media (max-width: 768px) {
      .option-box {
        grid-template-columns: 1fr !important;
      }
    }
  `;
  document.head.appendChild(styleTag);
}

// Add custom bullet points
const noteItemStyle = document.createElement("style");
noteItemStyle.innerHTML = `
  li::before {
    content: "▪";
    color: #e63946;
    font-weight: bold;
    position: absolute;
    left: 0;
  }
`;
if (typeof document !== "undefined") {
  document.head.appendChild(noteItemStyle);
}

export default CancellationRefund;