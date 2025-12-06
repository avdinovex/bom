import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiUser, FiUsers } from 'react-icons/fi';
import { Bike, Eye } from 'lucide-react';

const AudienceOrRider = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const event = location.state?.event; // Get event data passed from Events page
  const [selectedType, setSelectedType] = useState(null);

  const handleSelection = (type) => {
    if (!event) {
      console.error('No event data available');
      return;
    }

    if (type === 'audience') {
      // Navigate to Audience component with event data
      navigate('/audience-registration', { state: { event } });
    } else if (type === 'participant') {
      // Navigate to EventBookingForm component with event data
      navigate('/participant-registration', { state: { event } });
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.headerIcon}>
            <FiUsers size={40} />
          </div>
          <h1 style={styles.title}>Choose Your Experience</h1>
          <p style={styles.subtitle}>
            {event ? `Register for ${event.title}` : 'Select your registration type'}
          </p>
        </div>

        <div style={styles.cardsContainer}>
          {/* Audience Card */}
          <div
            style={{
              ...styles.card,
              ...(selectedType === 'audience' ? styles.cardSelected : {})
            }}
            className="selection-card"
            onClick={() => setSelectedType('audience')}
            onMouseEnter={(e) => {
              if (selectedType !== 'audience') {
                e.currentTarget.style.borderColor = '#ff4757';
                e.currentTarget.style.transform = 'translateY(-8px)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedType !== 'audience') {
                e.currentTarget.style.borderColor = '#333';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            <div style={styles.cardIcon}>
              <Eye size={48} />
            </div>
            <h2 style={styles.cardTitle}>Audience</h2>
            <p style={styles.cardDescription}>
              Join us as a spectator and witness the thrill of the event. Perfect for enthusiasts who want to experience the excitement without riding.
            </p>
            <ul style={styles.featuresList}>
              <li style={styles.featureItem}>
                <span style={styles.checkmark}>✓</span>
                <span>Event access pass</span>
              </li>
              <li style={styles.featureItem}>
                <span style={styles.checkmark}>✓</span>
                <span>Complimentary refreshments</span>
              </li>
              <li style={styles.featureItem}>
                <span style={styles.checkmark}>✓</span>
                <span>Photo opportunities</span>
              </li>
              <li style={styles.featureItem}>
                <span style={styles.checkmark}>✓</span>
                <span>Meet fellow enthusiasts</span>
              </li>
            </ul>
            {selectedType === 'audience' && (
              <div style={styles.selectedBadge}>Selected</div>
            )}
          </div>

          {/* Participant Card */}
          <div
            style={{
              ...styles.card,
              ...(selectedType === 'participant' ? styles.cardSelected : {})
            }}
            className="selection-card"
            onClick={() => setSelectedType('participant')}
            onMouseEnter={(e) => {
              if (selectedType !== 'participant') {
                e.currentTarget.style.borderColor = '#ff4757';
                e.currentTarget.style.transform = 'translateY(-8px)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedType !== 'participant') {
                e.currentTarget.style.borderColor = '#333';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            <div style={styles.cardIcon}>
              <Bike size={48} />
            </div>
            <h2 style={styles.cardTitle}>Participant</h2>
            <p style={styles.cardDescription}>
              Ride with us! Join the event as an active participant and be part of the motorcycle community on the road.
            </p>
            <ul style={styles.featuresList}>
              <li style={styles.featureItem}>
                <span style={styles.checkmark}>✓</span>
                <span>Full ride participation</span>
              </li>
              <li style={styles.featureItem}>
                <span style={styles.checkmark}>✓</span>
                <span>Event T-shirt</span>
              </li>
              <li style={styles.featureItem}>
                <span style={styles.checkmark}>✓</span>
                <span>Meals & refreshments</span>
              </li>
              <li style={styles.featureItem}>
                <span style={styles.checkmark}>✓</span>
                <span>Rider support & safety</span>
              </li>
              <li style={styles.featureItem}>
                <span style={styles.checkmark}>✓</span>
                <span>Certificate & goodies</span>
              </li>
            </ul>
            {selectedType === 'participant' && (
              <div style={styles.selectedBadge}>Selected</div>
            )}
          </div>
        </div>

        <div style={styles.footer}>
          <button
            onClick={() => navigate(-1)}
            style={styles.backButton}
            className="back-btn"
          >
            Go Back
          </button>
          <button
            onClick={() => selectedType && handleSelection(selectedType)}
            style={{
              ...styles.continueButton,
              ...(selectedType ? {} : styles.continueButtonDisabled)
            }}
            className="continue-btn"
            disabled={!selectedType}
          >
            Continue as {selectedType === 'audience' ? 'Audience' : selectedType === 'participant' ? 'Participant' : '...'}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px'
  },
  container: {
    maxWidth: '1200px',
    width: '100%'
  },
  header: {
    textAlign: 'center',
    marginBottom: '60px'
  },
  headerIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#1a1a1a',
    border: '2px solid #ff4757',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ff4757',
    margin: '0 auto 25px'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#fff',
    marginBottom: '15px',
    letterSpacing: '1px'
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#aaa',
    margin: 0
  },
  cardsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '40px',
    marginBottom: '50px'
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: '16px',
    padding: '40px',
    border: '2px solid #333',
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
    position: 'relative',
    overflow: 'hidden'
  },
  cardSelected: {
    borderColor: '#ff4757',
    backgroundColor: 'rgba(255, 71, 87, 0.05)',
    transform: 'translateY(-8px)',
    boxShadow: '0 15px 40px rgba(255, 71, 87, 0.3)'
  },
  cardIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '16px',
    backgroundColor: '#0a0a0a',
    border: '2px solid #333',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ff4757',
    marginBottom: '25px'
  },
  cardTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '15px',
    margin: 0
  },
  cardDescription: {
    fontSize: '1rem',
    color: '#aaa',
    lineHeight: '1.6',
    marginBottom: '30px'
  },
  featuresList: {
    listStyle: 'none',
    padding: 0,
    margin: 0
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '15px',
    color: '#ccc',
    fontSize: '0.95rem'
  },
  checkmark: {
    color: '#4CAF50',
    fontSize: '1.2rem',
    fontWeight: 'bold'
  },
  selectedBadge: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    backgroundColor: '#ff4757',
    color: '#fff',
    padding: '8px 20px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '700',
    letterSpacing: '0.5px',
    boxShadow: '0 4px 15px rgba(255, 71, 87, 0.4)'
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '20px',
    paddingTop: '20px'
  },
  backButton: {
    padding: '16px 40px',
    borderRadius: '10px',
    border: '2px solid #555',
    backgroundColor: 'transparent',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  continueButton: {
    flex: 1,
    padding: '16px 40px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#ff4757',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    letterSpacing: '0.5px',
    textTransform: 'uppercase'
  },
  continueButtonDisabled: {
    backgroundColor: '#444',
    cursor: 'not-allowed',
    opacity: 0.5
  }
};

// Add hover effects and responsive styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.innerHTML = `
    .back-btn:hover {
      background-color: rgba(255, 255, 255, 0.1);
      border-color: #888;
      transform: translateX(-3px);
    }

    .continue-btn:hover:not(:disabled) {
      background-color: #ff3545;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(255, 71, 87, 0.5);
    }

    @media (max-width: 968px) {
      .selection-card {
        padding: 30px !important;
      }
    }

    @media (max-width: 768px) {
      .cards-container {
        grid-template-columns: 1fr !important;
        gap: 30px !important;
      }
      
      .footer {
        flex-direction: column !important;
      }
      
      .back-btn, .continue-btn {
        width: 100% !important;
      }
    }

    @media (max-width: 480px) {
      .header-title {
        font-size: 2rem !important;
      }
      
      .card-title {
        font-size: 1.5rem !important;
      }
      
      .selection-card {
        padding: 25px !important;
      }
    }
  `;
  if (!document.querySelector('#audience-or-rider-styles')) {
    styleSheet.id = 'audience-or-rider-styles';
    document.head.appendChild(styleSheet);
  }
}

export default AudienceOrRider;