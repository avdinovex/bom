import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiCalendar, FiMapPin, FiMail, FiPhone, FiHome } from 'react-icons/fi';

const RegistrationSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const registration = location.state?.registration;

  if (!registration) {
    return (
      <div style={styles.container}>
        <div style={styles.errorBox}>
          <h2>No Registration Data Found</h2>
          <p>Please complete the registration process first.</p>
          <button onClick={() => navigate('/')} style={styles.homeButton}>
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.card}>
          {/* Success Icon */}
          <div style={styles.iconContainer}>
            <div style={styles.iconCircle}>
              <FiCheckCircle size={64} color="#4CAF50" />
            </div>
          </div>

          {/* Success Message */}
          <div style={styles.header}>
            <h1 style={styles.title}>Registration Successful! 🎉</h1>
            <p style={styles.subtitle}>
              Thank you for registering. Your registration has been confirmed.
            </p>
          </div>

          {/* Ticket Number */}
          {registration.ticketNumber && (
            <div style={styles.ticketBox}>
              <p style={styles.ticketLabel}>Your Ticket Number</p>
              <p style={styles.ticketNumber}>{registration.ticketNumber}</p>
              <p style={styles.ticketNote}>Please save this number for your records</p>
            </div>
          )}

          {/* Registration Details */}
          <div style={styles.detailsSection}>
            <h3 style={styles.sectionTitle}>Registration Details</h3>
            
            {registration.personalInfo && (
              <div style={styles.detailsGrid}>
                <div style={styles.detailItem}>
                  <FiMail style={styles.detailIcon} />
                  <div>
                    <p style={styles.detailLabel}>Email</p>
                    <p style={styles.detailValue}>{registration.personalInfo.email}</p>
                  </div>
                </div>

                <div style={styles.detailItem}>
                  <FiPhone style={styles.detailIcon} />
                  <div>
                    <p style={styles.detailLabel}>Phone</p>
                    <p style={styles.detailValue}>{registration.personalInfo.phoneNumber}</p>
                  </div>
                </div>
              </div>
            )}

            {registration.event && (
              <div style={{ ...styles.detailsGrid, marginTop: '20px' }}>
                <div style={styles.detailItem}>
                  <FiCalendar style={styles.detailIcon} />
                  <div>
                    <p style={styles.detailLabel}>Event</p>
                    <p style={styles.detailValue}>{registration.event.title}</p>
                  </div>
                </div>

                {registration.event.eventDate && (
                  <div style={styles.detailItem}>
                    <FiCalendar style={styles.detailIcon} />
                    <div>
                      <p style={styles.detailLabel}>Date</p>
                      <p style={styles.detailValue}>
                        {new Date(registration.event.eventDate).toLocaleDateString('en-IN', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {registration.event.location && (
                  <div style={styles.detailItem}>
                    <FiMapPin style={styles.detailIcon} />
                    <div>
                      <p style={styles.detailLabel}>Location</p>
                      <p style={styles.detailValue}>{registration.event.location}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Important Info */}
          <div style={styles.infoBox}>
            <h4 style={styles.infoTitle}>📧 Confirmation Email Sent</h4>
            <p style={styles.infoText}>
              A confirmation email with all the details has been sent to your registered email address.
              Please check your inbox and spam folder.
            </p>
          </div>

          <div style={styles.infoBox}>
            <h4 style={styles.infoTitle}>📌 What's Next?</h4>
            <ul style={styles.infoList}>
              <li>Check your email for the confirmation and event details</li>
              <li>Arrive at the venue 30 minutes before the event starts</li>
              <li>Carry a valid ID proof for verification</li>
              <li>Keep this confirmation handy</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div style={styles.buttonContainer}>
            <button 
              onClick={() => navigate('/')} 
              style={styles.primaryButton}
              className="primary-btn"
            >
              <FiHome size={20} />
              Go to Home
            </button>
          </div>
        </div>
      </div>

      <style>
        {`
          .primary-btn:hover {
            background-color: #ff3545 !important;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(255, 71, 87, 0.4);
          }

          @media (max-width: 768px) {
            .card {
              margin: 20px !important;
              padding: 20px !important;
            }
          }
        `}
      </style>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  },
  wrapper: {
    width: '100%',
    maxWidth: '800px',
    margin: '0 auto'
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
    border: '1px solid #333'
  },
  iconContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '30px'
  },
  iconCircle: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    backgroundColor: '#1e4620',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '4px solid #4CAF50'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  title: {
    color: '#fff',
    fontSize: '2rem',
    marginBottom: '10px',
    fontWeight: 'bold'
  },
  subtitle: {
    color: '#aaa',
    fontSize: '1.1rem',
    margin: 0
  },
  ticketBox: {
    backgroundColor: '#2a2a2a',
    border: '2px dashed #ff4757',
    borderRadius: '12px',
    padding: '30px',
    textAlign: 'center',
    marginBottom: '30px'
  },
  ticketLabel: {
    color: '#aaa',
    fontSize: '0.9rem',
    margin: '0 0 10px 0'
  },
  ticketNumber: {
    color: '#ff4757',
    fontSize: '2rem',
    fontWeight: 'bold',
    margin: '10px 0',
    letterSpacing: '2px',
    fontFamily: 'monospace'
  },
  ticketNote: {
    color: '#888',
    fontSize: '0.85rem',
    margin: '10px 0 0 0'
  },
  detailsSection: {
    marginBottom: '30px'
  },
  sectionTitle: {
    color: '#fff',
    fontSize: '1.3rem',
    marginBottom: '20px',
    borderBottom: '2px solid #333',
    paddingBottom: '10px'
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '15px'
  },
  detailItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '15px',
    padding: '15px',
    backgroundColor: '#2a2a2a',
    borderRadius: '8px',
    border: '1px solid #333'
  },
  detailIcon: {
    color: '#ff4757',
    marginTop: '2px',
    fontSize: '20px'
  },
  detailLabel: {
    color: '#aaa',
    fontSize: '0.85rem',
    margin: '0 0 5px 0'
  },
  detailValue: {
    color: '#fff',
    fontSize: '1rem',
    margin: 0,
    fontWeight: '500'
  },
  infoBox: {
    backgroundColor: '#1e3a4f',
    border: '1px solid #2196F3',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px'
  },
  infoTitle: {
    color: '#fff',
    fontSize: '1.1rem',
    margin: '0 0 10px 0'
  },
  infoText: {
    color: '#ccc',
    fontSize: '0.95rem',
    margin: 0,
    lineHeight: '1.6'
  },
  infoList: {
    color: '#ccc',
    fontSize: '0.95rem',
    margin: '10px 0 0 0',
    paddingLeft: '20px',
    lineHeight: '1.8'
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    marginTop: '30px'
  },
  primaryButton: {
    padding: '15px 40px',
    backgroundColor: '#ff4757',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  errorBox: {
    backgroundColor: '#1a1a1a',
    padding: '40px',
    borderRadius: '12px',
    textAlign: 'center',
    color: '#fff'
  },
  homeButton: {
    padding: '12px 30px',
    backgroundColor: '#ff4757',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '20px'
  }
};

export default RegistrationSuccess;
