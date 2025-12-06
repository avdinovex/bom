import React, { useState, useEffect } from 'react';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

const GuidelinesPopup = ({ onAccept }) => {
  const [acknowledged, setAcknowledged] = useState(false);

  // Auto-close when checkbox is checked
  useEffect(() => {
    if (acknowledged) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        onAccept && onAccept();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [acknowledged, onAccept]);

  const termsAndConditions = [
    'I confirm that all information provided is accurate and complete.',
    'I agree to follow all event rules, regulations, and safety guidelines.',
    'I understand that participation is at my own risk and I release the organizers from any liability.',
    'I will wear appropriate safety gear including helmet and protective clothing during the ride.',
    'I will not carry any prohibited items, contraband, or illegal substances.',
    'I will follow all traffic rules and speed limits during the event.',
    'I will respect other participants and maintain proper riding etiquette.',
    'I will not consume alcohol or drugs before or during the event.',
    'I understand that non-compliance may result in removal from the event without refund.',
    'I authorize the organizers to use photographs/videos taken during the event for promotional purposes.'
  ];

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div style={styles.headerIcon}>
            <FiAlertCircle size={32} />
          </div>
          <h2 style={styles.title}>Terms & Conditions</h2>
          <p style={styles.subtitle}>Please read and accept before proceeding</p>
        </div>

        <div style={styles.content}>
          <div style={styles.warningBanner}>
            <FiAlertCircle size={20} />
            <span>These terms are mandatory for all participants. Please read carefully.</span>
          </div>

          <div style={styles.termsContainer}>
            <ul style={styles.termsList}>
              {termsAndConditions.map((term, index) => (
                <li key={index} style={styles.termItem}>
                  <div style={styles.bulletPoint}>{index + 1}</div>
                  <span style={styles.termText}>{term}</span>
                </li>
              ))}
            </ul>
          </div>

          <div style={styles.acknowledgmentSection}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                style={styles.checkbox}
              />
              <span style={styles.checkboxText}>
                <FiCheckCircle 
                  size={20} 
                  style={{
                    ...styles.checkIcon,
                    color: acknowledged ? '#4CAF50' : '#666'
                  }} 
                />
                I have read and agree to all the terms and conditions
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: '20px',
    overflowY: 'auto'
  },
  modal: {
    backgroundColor: '#0a0a0a',
    borderRadius: '16px',
    maxWidth: '700px',
    width: '100%',
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    border: '2px solid #ff4757',
    boxShadow: '0 20px 60px rgba(255, 71, 87, 0.4)',
    animation: 'slideIn 0.3s ease-out'
  },
  header: {
    textAlign: 'center',
    padding: '30px 30px 20px 30px',
    borderBottom: '2px solid #222'
  },
  headerIcon: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    backgroundColor: '#ff4757',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    margin: '0 auto 20px',
    boxShadow: '0 4px 20px rgba(255, 71, 87, 0.5)'
  },
  title: {
    margin: '0 0 10px 0',
    fontSize: '2rem',
    fontWeight: '800',
    color: '#fff',
    letterSpacing: '0.5px'
  },
  subtitle: {
    margin: 0,
    fontSize: '0.95rem',
    color: '#aaa',
    fontWeight: '500'
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '30px'
  },
  warningBanner: {
    backgroundColor: 'rgba(255, 71, 87, 0.1)',
    border: '2px solid #ff4757',
    borderRadius: '10px',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#fff',
    fontSize: '0.95rem',
    marginBottom: '30px',
    fontWeight: '500'
  },
  termsContainer: {
    backgroundColor: '#111',
    borderRadius: '12px',
    padding: '25px',
    border: '1px solid #222',
    marginBottom: '25px'
  },
  termsList: {
    margin: 0,
    padding: 0,
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  termItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '15px'
  },
  bulletPoint: {
    minWidth: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#ff4757',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.9rem',
    fontWeight: '700',
    flexShrink: 0
  },
  termText: {
    color: '#ddd',
    fontSize: '0.95rem',
    lineHeight: '1.7',
    paddingTop: '5px'
  },
  acknowledgmentSection: {
    backgroundColor: '#111',
    border: '2px solid #ff4757',
    borderRadius: '12px',
    padding: '25px',
    boxShadow: '0 4px 20px rgba(255, 71, 87, 0.2)'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    cursor: 'pointer',
    userSelect: 'none'
  },
  checkbox: {
    width: '24px',
    height: '24px',
    cursor: 'pointer',
    accentColor: '#ff4757',
    flexShrink: 0
  },
  checkboxText: {
    color: '#fff',
    fontSize: '1.05rem',
    lineHeight: '1.6',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  checkIcon: {
    flexShrink: 0,
    transition: 'color 0.3s ease'
  }
};

// Add animations and hover effects
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.innerHTML = `
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @media (max-width: 768px) {
      .guidelines-modal {
        margin: 10px !important;
        max-height: 90vh !important;
      }
      
      .guidelines-header {
        padding: 20px 20px 15px 20px !important;
      }
      
      .guidelines-title {
        font-size: 1.5rem !important;
      }
      
      .guidelines-content {
        padding: 20px !important;
      }
      
      .guidelines-term-text {
        font-size: 0.9rem !important;
      }
    }

    @media (max-width: 480px) {
      .guidelines-title {
        font-size: 1.3rem !important;
      }
      
      .guidelines-bullet {
        min-width: 28px !important;
        height: 28px !important;
        font-size: 0.85rem !important;
      }
      
      .guidelines-term-text {
        font-size: 0.85rem !important;
      }
    }
  `;
  if (!document.querySelector('#guidelines-popup-styles')) {
    styleSheet.id = 'guidelines-popup-styles';
    document.head.appendChild(styleSheet);
  }
}

export default GuidelinesPopup;