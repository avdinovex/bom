import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";

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

  // Fetch next ride from backend
  useEffect(() => {
    const fetchNextRide = async () => {
      try {
        setLoading(true);
        const response = await api.get('/rides/next/upcoming');
        
        if (response.data?.success && response.data?.data?.ride) {
          setNextRide(response.data.data.ride);
        } else {
          setNextRide(null);
        }
      } catch (error) {
        console.error('Error fetching next ride:', error);
        setError('Failed to load next ride');
      } finally {
        setLoading(false);
      }
    };

    fetchNextRide();
  }, []);

  // Timer effect for countdown
  useEffect(() => {
    if (!nextRide || !nextRide.startTime) return;

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
        // Ride has started, refetch next ride
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        // Optionally refetch the next ride when current one has started
        window.location.reload();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [nextRide]);

  const formatNumber = (num) => String(num).padStart(2, '0');

  const formatRideDate = (dateString) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN",
      "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    const time = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    
    return { day, month, year, time };
  };

  // Show loading state
  if (loading) {
    return (
      <div style={{...styles.container, justifyContent: 'center'}}>
        <div style={{color: '#666', fontSize: '18px'}}>Loading next ride...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div style={{...styles.container, justifyContent: 'center'}}>
        <div style={{color: '#d9434d', fontSize: '18px'}}>Error: {error}</div>
      </div>
    );
  }

  // Show no rides state
  if (!nextRide) {
    return (
      <div style={{...styles.container, justifyContent: 'center'}}>
        <div style={{color: '#666', fontSize: '18px'}}>No upcoming rides scheduled</div>
      </div>
    );
  }

  const rideDate = formatRideDate(nextRide.startTime);

  return (
    <div style={styles.container} className="countdown-container">
      <div style={styles.banner} className="countdown-banner">
        <div style={styles.redSection}>
          <div style={styles.textContainer}>
            <h2 style={styles.title}>NEXT RIDE START AT</h2>
            <h2 style={{...styles.title}}>{rideDate.month} {rideDate.day}, {rideDate.year} - {rideDate.time}</h2>
            {nextRide.title && (
              <h3 style={styles.rideTitle}>{nextRide.title}</h3>
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
        onClick={() => navigate("/upcoming-rides")}
      >
        {timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0
          ? "RIDE STARTED - VIEW OTHER RIDES"
          : "REGISTER FOR THIS RIDE"
        }
        <span style={styles.arrows}> »</span>
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
    fontSize: 'clamp(14px, 2.5vw, 20px)',
    fontWeight: 'bold',
    margin: '2px 0',
    letterSpacing: '1px'
  },
  monthTitle: {
    color: 'white',
    fontSize: 'clamp(28px, 5vw, 42px)',
    fontWeight: '900',
    margin: '5px 0',
    letterSpacing: '2px',
    textAlign: 'center'
  },
  rideTitle: {
    color: 'white',
    fontSize: 'clamp(12px, 2.5vw, 16px)',
    fontWeight: '600',
    margin: '8px 0 0 0',
    letterSpacing: '0.5px',
    opacity: 0.9,
    lineHeight: '1.2'
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
  }
};

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.innerHTML = `
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