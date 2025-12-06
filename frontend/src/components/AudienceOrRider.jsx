import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiUser, FiUsers } from 'react-icons/fi';
import { Bike, Eye } from 'lucide-react';

const AudienceOrRider = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const event = location.state?.event;
  const [selectedType, setSelectedType] = useState(null);

  const handleSelection = (type) => {
    if (!event) {
      console.error('No event data available');
      return;
    }

    if (type === 'audience') {
      navigate('/audience-registration', { state: { event } });
    } else if (type === 'participant') {
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
              <Eye size={48} className="card-icon-svg" />
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
              <Bike size={48} className="card-icon-svg" />
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

      <style>{`
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

        /* Tablet styles (768px - 1024px) */
        @media (max-width: 1024px) {
          .selection-card {
            padding: 32px !important;
          }
        }

        @media (max-width: 968px) {
          .selection-card {
            padding: 28px !important;
          }
        }

        /* Mobile and small tablet styles */
        @media (max-width: 768px) {
          .selection-card {
            padding: 24px !important;
          }
        }

        /* Mobile-specific styles */
        @media (max-width: 640px) {
          .selection-card {
            padding: 20px !important;
          }
          
          .card-icon-svg {
            width: 40px !important;
            height: 40px !important;
          }
        }

        @media (max-width: 480px) {
          .selection-card {
            padding: 18px !important;
          }
          
          .card-icon-svg {
            width: 36px !important;
            height: 36px !important;
          }
        }
      `}</style>
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
    padding: '40px 20px',
    '@media (maxWidth: 768px)': {
      padding: '30px 16px'
    },
    '@media (maxWidth: 480px)': {
      padding: '20px 12px'
    }
  },
  container: {
    maxWidth: '1200px',
    width: '100%'
  },
  header: {
    textAlign: 'center',
    marginBottom: '60px',
    '@media (maxWidth: 768px)': {
      marginBottom: '40px'
    },
    '@media (maxWidth: 480px)': {
      marginBottom: '30px'
    }
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
    margin: '0 auto 25px',
    '@media (maxWidth: 480px)': {
      width: '60px',
      height: '60px',
      marginBottom: '20px'
    }
  },
  title: {
    fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
    fontWeight: '800',
    color: '#fff',
    marginBottom: '15px',
    letterSpacing: '1px',
    padding: '0 16px'
  },
  subtitle: {
    fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
    color: '#aaa',
    margin: 0,
    padding: '0 16px'
  },
  cardsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))',
    gap: '40px',
    marginBottom: '50px',
    '@media (maxWidth: 768px)': {
      gap: '30px',
      marginBottom: '40px'
    },
    '@media (maxWidth: 640px)': {
      gap: '24px',
      marginBottom: '30px',
      gridTemplateColumns: '1fr'
    }
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
    width: 'clamp(60px, 15vw, 80px)',
    height: 'clamp(60px, 15vw, 80px)',
    borderRadius: '16px',
    backgroundColor: '#0a0a0a',
    border: '2px solid #333',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ff4757',
    marginBottom: '25px',
    '@media (maxWidth: 480px)': {
      marginBottom: '20px',
      borderRadius: '12px'
    }
  },
  cardTitle: {
    fontSize: 'clamp(1.5rem, 4vw, 2rem)',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '15px',
    margin: 0
  },
  cardDescription: {
    fontSize: 'clamp(0.9rem, 2vw, 1rem)',
    color: '#aaa',
    lineHeight: '1.6',
    marginBottom: '30px',
    '@media (maxWidth: 480px)': {
      marginBottom: '24px',
      lineHeight: '1.5'
    }
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
    fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
    '@media (maxWidth: 480px)': {
      marginBottom: '12px',
      gap: '10px'
    }
  },
  checkmark: {
    color: '#4CAF50',
    fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
    fontWeight: 'bold',
    flexShrink: 0
  },
  selectedBadge: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    backgroundColor: '#ff4757',
    color: '#fff',
    padding: '8px 20px',
    borderRadius: '20px',
    fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
    fontWeight: '700',
    letterSpacing: '0.5px',
    boxShadow: '0 4px 15px rgba(255, 71, 87, 0.4)',
    '@media (maxWidth: 480px)': {
      top: '16px',
      right: '16px',
      padding: '6px 16px'
    }
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '20px',
    paddingTop: '20px',
    flexWrap: 'wrap',
    '@media (maxWidth: 640px)': {
      flexDirection: 'column',
      gap: '16px'
    }
  },
  backButton: {
    padding: '16px 40px',
    borderRadius: '10px',
    border: '2px solid #555',
    backgroundColor: 'transparent',
    color: '#fff',
    fontSize: 'clamp(0.9rem, 2vw, 1rem)',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    minWidth: '140px',
    '@media (maxWidth: 640px)': {
      width: '100%',
      padding: '14px 32px'
    }
  },
  continueButton: {
    flex: 1,
    padding: '16px 40px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#ff4757',
    color: '#fff',
    fontSize: 'clamp(0.9rem, 2vw, 1rem)',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    minWidth: '200px',
    '@media (maxWidth: 640px)': {
      width: '100%',
      padding: '14px 32px'
    }
  },
  continueButtonDisabled: {
    backgroundColor: '#444',
    cursor: 'not-allowed',
    opacity: 0.5
  }
};

export default AudienceOrRider;