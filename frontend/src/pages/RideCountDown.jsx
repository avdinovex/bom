import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { publicRidesAPI } from '../services/api';

export default function RideCountdown() {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [nextRide, setNextRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the next upcoming ride
  useEffect(() => {
    const fetchNextRide = async () => {
      try {
        setLoading(true);
        const response = await publicRidesAPI.getNextUpcoming();
        if (response.data?.ride) {
          setNextRide(response.data.ride);
        } else {
          setError('No upcoming rides found');
        }
      } catch (err) {
        console.error('Error fetching next ride:', err);
        setError('Failed to fetch ride information');
      } finally {
        setLoading(false);
      }
    };

    fetchNextRide();
  }, []);

  // Update countdown timer
  useEffect(() => {
    if (!nextRide?.startTime) return;

    const targetDate = new Date(nextRide.startTime).getTime();
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [nextRide]);

  const formatNumber = (num) => String(num).padStart(2, '0');

  const formatRideDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = { 
      month: 'long', 
      day: '2-digit', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    };
    return date.toLocaleDateString('en-US', options).toUpperCase();
  };

  const getRideDateParts = (dateString) => {
    if (!dateString) return { monthDay: '', year: '', time: '' };
    const date = new Date(dateString);
    const monthDay = date.toLocaleDateString('en-US', { month: 'long', day: '2-digit' }).toUpperCase();
    const year = date.getFullYear();
    const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
    return { monthDay, year, time };
  };

  if (loading) {
    return (
      <div style={styles.container} className="countdown-container">
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
          <p style={styles.loadingText}>Loading next ride...</p>
        </div>
      </div>
    );
  }

  if (error || !nextRide) {
    return (
      <div style={styles.container} className="countdown-container">
        <div style={styles.errorContainer}>
          <h2 style={styles.errorTitle}>No Upcoming Rides</h2>
          <p style={styles.errorText}>
            {error || 'No rides are currently scheduled. Check back later for new adventures!'}
          </p>
          <button
            style={styles.registerButton}
            onClick={() => {
              window.scrollTo(0, 0);
              navigate("/upcoming-rides");
            }}
          >
            VIEW ALL RIDES
          </button>
        </div>
      </div>
    );
  }

  const rideDateParts = getRideDateParts(nextRide.startTime);

  return (
    <div style={styles.container} className="countdown-container">
      <div style={styles.banner} className="countdown-banner">
        <div style={styles.redSection}>
          <div style={styles.textContainer}>
            <h2 style={styles.title}>NEXT RIDE START AT {rideDateParts.monthDay}</h2>
            <h2 style={styles.title}>{rideDateParts.year} - {rideDateParts.time}</h2>
            {nextRide.venue && (
              <p style={styles.venue}> {nextRide.venue}</p>
            )}
          </div>
          <div style={styles.slant}></div>
        </div>
        <div style={styles.blackBlock}></div>
      </div>

      <div style={styles.timerSection} className="timer-section">
        <div style={styles.timeBlock}>
          <div style={styles.number}>{formatNumber(timeLeft.days)}</div>
          <div style={styles.label}>DAYS</div>
        </div>
        <div style={styles.colon}>:</div>
        <div style={styles.timeBlock}>
          <div style={styles.number}>{formatNumber(timeLeft.hours)}</div>
          <div style={styles.label}>HRS</div>
        </div>
        <div style={styles.colon}>:</div>
        <div style={styles.timeBlock}>
          <div style={styles.number}>{formatNumber(timeLeft.minutes)}</div>
          <div style={styles.label}>MINS</div>
        </div>
        <div style={styles.colon}>:</div>
        <div style={styles.timeBlock}>
          <div style={styles.number}>{formatNumber(timeLeft.seconds)}</div>
          <div style={styles.label}>SECS</div>
        </div>
      </div>

      <button
        style={styles.registerButton}
        className="register-button"
        onClick={() => {
          window.scrollTo(0, 0);
          navigate("/upcoming-rides");
        }}
      >
        REGISTER NOW 
       
      </button>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    padding: '40px 40px 60px 40px',
    fontFamily: 'Arial, sans-serif',
    maxWidth: '100%',
    marginTop: '30px',
    position: 'relative',
    flexWrap: 'wrap',
    gap: '30px'
  },
  banner: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    height: '129.5px',
    flex: '0 0 auto'
  },
  redSection: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#d9434d',
    padding: '30px 40px',
    paddingRight: '60px',
    minWidth: '400px'
  },
  textContainer: {
    position: 'relative',
    zIndex: 2
  },
  title: {
    color: 'white',
    fontSize: 'clamp(16px, 3vw, 24px)',
    fontWeight: 'bold',
    margin: '5px 0',
    letterSpacing: '1px'
  },
  slant: {
    position: 'absolute',
    right: '-30px',
    top: 0,
    bottom: 0,
    width: '60px',
    backgroundColor: '#d9434d',
    transform: 'skewX(-15deg)',
    zIndex: 1
  },
  blackBlock: {
    width: '80px',
    height: '100%',
    backgroundColor: '#2b2b2b',
    transform: 'skewX(-15deg)',
    marginLeft: '-10px'
  },
  timerSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    flex: '1 1 auto',
    justifyContent: 'center',
    minWidth: '280px'
  },
  timeBlock: {
    textAlign: 'center'
  },
  number: {
    fontSize: 'clamp(40px, 8vw, 64px)',
    fontWeight: 'bold',
    color: '#333',
    lineHeight: '1'
  },
  label: {
    fontSize: 'clamp(12px, 2vw, 14px)',
    color: '#666',
    marginTop: '5px',
    fontWeight: '600',
    letterSpacing: '1px'
  },
  colon: {
    fontSize: 'clamp(32px, 6vw, 48px)',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '20px'
  },
  registerButton: {
    backgroundColor: '#e74c5a',
    color: 'white',
    border: 'none',
    padding: '18px 40px',
    fontSize: 'clamp(13px, 2vw, 16px)',
    fontWeight: 'bold',
    cursor: 'pointer',
    letterSpacing: '1px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'background-color 0.3s ease',
    flex: '0 0 auto',
    whiteSpace: 'nowrap'
  },
  arrows: {
    fontSize: '20px'
  },
  venue: {
    color: 'white',
    fontSize: 'clamp(12px, 2vw, 16px)',
    fontWeight: 'normal',
    margin: '5px 0 0 0',
    letterSpacing: '0.5px',
    opacity: 0.9
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px',
    gap: '20px'
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #d9434d',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    fontSize: '18px',
    color: '#666',
    margin: 0
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px',
    gap: '20px',
    textAlign: 'center',
    padding: '20px'
  },
  errorTitle: {
    fontSize: 'clamp(24px, 4vw, 32px)',
    color: '#333',
    margin: 0,
    fontWeight: 'bold'
  },
  errorText: {
    fontSize: 'clamp(14px, 2.5vw, 18px)',
    color: '#666',
    margin: 0,
    maxWidth: '600px',
    lineHeight: '1.5'
  }
};

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.innerHTML = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @media (max-width: 1200px) {
      .countdown-container {
        justify-content: center !important;
      }
      .countdown-banner {
        flex: 1 1 100% !important;
        justify-content: center;
      }
      .timer-section {
        flex: 1 1 100% !important;
      }
      .register-button {
        flex: 1 1 100% !important;
        justify-content: center !important;
      }
    }
    
    @media (max-width: 768px) {
      .countdown-container {
        padding: 30px 20px 40px 20px !important;
        gap: 20px !important;
      }
      .countdown-banner {
        height: auto !important;
        flex-direction: column;
      }
      .countdown-banner > div:first-child {
        min-width: 300px !important;
        padding: 20px 30px !important;
        padding-right: 50px !important;
      }
      .countdown-banner > div:last-child {
        display: none;
      }
      .timer-section {
        gap: 10px !important;
        flex-wrap: wrap;
      }
      .register-button {
        padding: 15px 30px !important;
      }
    }
    
    @media (max-width: 480px) {
      .countdown-banner > div:first-child {
        min-width: 250px !important;
        padding: 15px 20px !important;
        padding-right: 40px !important;
      }
      .timer-section {
        gap: 8px !important;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}