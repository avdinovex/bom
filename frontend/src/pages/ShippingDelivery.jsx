import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const ShippingDelivery = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* <button onClick={() => navigate(-1)} style={styles.backButton}>
          <FaArrowLeft style={styles.backIcon} /> Back
        </button> */}

        <h1 style={styles.title}>Shipping & Delivery Policy</h1>
        <p style={styles.subtitle}>Brotherhood of Mumbai (BOM)</p>
        <p style={styles.lastUpdated}>Effective Date: October 22, 2025</p>

        <div style={styles.infoBox}>
          <p style={styles.infoText}>
            ℹ️ Brotherhood of Mumbai primarily operates as a ride organizing service. This policy applies to any merchandise, riding gear, or materials that may be ordered through our platform.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.heading}>1. Service Nature</h2>
          <p style={styles.text}>
            BOM primarily provides experiential riding services and event organization. Most of our services are delivered on-site during scheduled rides and events. Physical delivery of items is limited to merchandise, riding gear, or event-related materials when applicable.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.heading}>2. Digital Confirmations & Documents</h2>
          <p style={styles.text}>
            Upon successful registration and payment for any ride, you will receive instant digital confirmation via email. This includes your booking confirmation, ride details, itinerary, and any necessary documents. Please ensure your email address is correct during registration.
          </p>
          <div style={styles.deliveryCard}>
            <h3 style={styles.cardTitle}>Instant Digital Delivery</h3>
            <p style={styles.cardText}>✓ Registration Confirmation</p>
            <p style={styles.cardText}>✓ Ride Itinerary & Schedule</p>
            <p style={styles.cardText}>✓ Safety Guidelines</p>
            <p style={styles.cardText}>✓ Event Updates & Notifications</p>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.heading}>3. Merchandise Delivery (If Applicable)</h2>
          <p style={styles.text}>
            For any physical merchandise such as BOM branded apparel, riding accessories, or event kits, the following delivery terms apply:
          </p>
          
          <div style={styles.timelineBox}>
            <div style={styles.timelineItem}>
              <span style={styles.timelineNumber}>1-2 Days</span>
              <p style={styles.timelineText}>Order Processing & Confirmation</p>
            </div>
            <div style={styles.timelineItem}>
              <span style={styles.timelineNumber}>3-7 Days</span>
              <p style={styles.timelineText}>Delivery within Mumbai & Suburbs</p>
            </div>
            <div style={styles.timelineItem}>
              <span style={styles.timelineNumber}>7-14 Days</span>
              <p style={styles.timelineText}>Delivery to Other Cities in India</p>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.heading}>4. Delivery Locations</h2>
          <p style={styles.text}>
            We currently deliver physical items across India. International shipping is not available at this time. For local Mumbai deliveries, we may offer pickup options from our office in Dahisar, West.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.heading}>5. Delivery Charges</h2>
          <div style={styles.chargeBox}>
            <div style={styles.chargeItem}>
              <span style={styles.chargeLabel}>Within Mumbai</span>
              <span style={styles.chargeAmount}>Free or Nominal Charges</span>
            </div>
            <div style={styles.chargeItem}>
              <span style={styles.chargeLabel}>Outside Mumbai</span>
              <span style={styles.chargeAmount}>As per courier charges</span>
            </div>
            <div style={styles.chargeItem}>
              <span style={styles.chargeLabel}>Self Pickup</span>
              <span style={styles.chargeAmount}>Free</span>
            </div>
          </div>
          <p style={styles.text} style={{...styles.text, marginTop: "15px"}}>
            Delivery charges, if applicable, will be clearly displayed at checkout before you confirm your order.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.heading}>6. Order Tracking</h2>
          <p style={styles.text}>
            Once your order is dispatched, you will receive a tracking number via email or SMS. You can use this to track your shipment through the courier partner's website. For any delivery-related queries, please contact our support team.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.heading}>7. Failed Delivery Attempts</h2>
          <p style={styles.text}>
            If the courier is unable to deliver your order due to incorrect address, unavailability, or refusal to accept, multiple delivery attempts will be made. After failed attempts, the order will be returned to us. Re-delivery charges may apply for reshipping the order.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.heading}>8. Damaged or Incorrect Items</h2>
          <p style={styles.text}>
            Please inspect your package upon delivery. If you receive damaged or incorrect items, please contact us within 48 hours of delivery with photographic evidence. We will arrange for a replacement or refund as per our return policy.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.heading}>9. Contact for Delivery Issues</h2>
          <p style={styles.text}>
            For any queries or issues related to shipping and delivery, please reach out to us:
          </p>
          <div style={styles.contactBox}>
            <p style={styles.contactText}>📧 brotherhoodofmumbai@gmail.com</p>
            <p style={styles.contactText}>📞 9821945661</p>
            <p style={styles.contactText}>📍 Dahisar, West 400 068</p>
            <p style={styles.contactText}>🕒 Mon - Sat: 7:00 AM to 4:30 PM</p>
          </div>
        </div>

        <div style={styles.noteBox}>
          <h3 style={styles.noteHeading}>Important Notes:</h3>
          <ul style={styles.noteList}>
            <li style={styles.noteItem}>Delivery timelines are estimates and may vary during peak seasons or due to unforeseen circumstances</li>
            <li style={styles.noteItem}>Please provide accurate and complete delivery addresses to avoid delays</li>
            <li style={styles.noteItem}>BOM is not responsible for delays caused by courier partners or natural calamities</li>
            <li style={styles.noteItem}>For ride-related services, all confirmations are delivered digitally and instantly</li>
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
  infoBox: {
    backgroundColor: "rgba(70, 130, 230, 0.15)",
    padding: "20px",
    borderRadius: "6px",
    marginBottom: "35px",
    borderLeft: "4px solid #4682e6",
  },
  infoText: {
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
    marginBottom: "15px",
  },
  text: {
    fontSize: "clamp(14px, 2vw, 16px)",
    color: "#ccc",
    lineHeight: "1.8",
    marginBottom: "10px",
  },
  deliveryCard: {
    backgroundColor: "#1a1a1a",
    padding: "25px",
    borderRadius: "6px",
    marginTop: "20px",
    border: "1px solid rgba(230, 57, 70, 0.2)",
  },
  cardTitle: {
    fontSize: "clamp(16px, 2vw, 18px)",
    fontWeight: "600",
    color: "#e63946",
    marginBottom: "15px",
  },
  cardText: {
    fontSize: "clamp(14px, 2vw, 15px)",
    color: "#ccc",
    marginBottom: "8px",
  },
  timelineBox: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
    marginTop: "20px",
  },
  timelineItem: {
    backgroundColor: "#1a1a1a",
    padding: "20px",
    borderRadius: "6px",
    textAlign: "center",
    border: "1px solid rgba(230, 57, 70, 0.2)",
  },
  timelineNumber: {
    display: "block",
    fontSize: "clamp(16px, 2.5vw, 18px)",
    color: "#e63946",
    fontWeight: "700",
    marginBottom: "10px",
  },
  timelineText: {
    fontSize: "clamp(13px, 2vw, 14px)",
    color: "#ccc",
    margin: 0,
    lineHeight: "1.6",
  },
  chargeBox: {
    backgroundColor: "#1a1a1a",
    padding: "20px",
    borderRadius: "6px",
    marginTop: "15px",
  },
  chargeItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  chargeLabel: {
    fontSize: "clamp(14px, 2vw, 16px)",
    color: "#ccc",
  },
  chargeAmount: {
    fontSize: "clamp(14px, 2vw, 16px)",
    color: "#e63946",
    fontWeight: "600",
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

// Add custom bullet points
if (typeof document !== "undefined") {
  const noteItemStyle = document.createElement("style");
  noteItemStyle.innerHTML = `
    li::before {
      content: "▪";
      color: #e63946;
      font-weight: bold;
      position: absolute;
      left: 0;
    }
    
    @media (max-width: 768px) {
      .charge-item:last-child {
        border-bottom: none !important;
      }
    }
  `;
  document.head.appendChild(noteItemStyle);
}

export default ShippingDelivery;