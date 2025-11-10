import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { publicEventsAPI } from '../services/api';

export default function EventCountdown() {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [nextEvent, setNextEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the next upcoming event
  useEffect(() => {
    const fetchNextEvent = async () => {
      try {
        setLoading(true);
        const response = await publicEventsAPI.getByType('upcoming', { 
          category: 'mumbai-bikers-mania',
          limit: 1 
        });
        
        // Extract the first upcoming event
        let upcomingEvent = null;
        if (Array.isArray(response.data?.data?.data)) {
          upcomingEvent = response.data.data.data[0];
        } else if (Array.isArray(response.data?.data)) {
          upcomingEvent = response.data.data[0];
        } else if (Array.isArray(response.data)) {
          upcomingEvent = response.data[0];
        }
        
        if (upcomingEvent) {
          setNextEvent(upcomingEvent);
        } else {
          setError('No upcoming events found');
        }
      } catch (err) {
        console.error('Error fetching next event:', err);
        setError('Failed to fetch event information');
      } finally {
        setLoading(false);
      }
    };

    fetchNextEvent();
  }, []);

  // Update countdown timer
  useEffect(() => {
    if (!nextEvent?.startDate) return;

    const targetDate = new Date(nextEvent.startDate).getTime();
    
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
  }, [nextEvent]);

  const formatNumber = (num) => String(num).padStart(2, '0');

  const getEventDateParts = (dateString) => {
    if (!dateString) return { monthDay: '', year: '', time: '' };
    const date = new Date(dateString);
    const monthDay = date.toLocaleDateString('en-US', { month: 'long', day: '2-digit' }).toUpperCase();
    const year = date.getFullYear();
    const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
    return { monthDay, year, time };
  };

  if (loading) {
    return (
      <div style={styles.container} className="event-countdown-container">
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
          <p style={styles.loadingText}>Loading next event...</p>
        </div>
      </div>
    );
  }

  if (error || !nextEvent) {
    return (
      <div style={styles.container} className="event-countdown-container">
        <div style={styles.errorContainer}>
          <h2 style={styles.errorTitle}>No Upcoming Events</h2>
          <p style={styles.errorText}>
            {error || 'No events are currently scheduled. Check back later for new adventures!'}
          </p>
          <button
            style={styles.registerButton}
            onClick={() => {
              window.scrollTo(0, 0);
              navigate("/events");
            }}
          >
            VIEW ALL EVENTS
          </button>
        </div>
      </div>
    );
  }

  const eventDateParts = getEventDateParts(nextEvent.startDate);

  return (
    <div style={styles.container} className="event-countdown-container">
      {/* Register Button - LEFT SIDE */}
      <button
        style={styles.registerButton}
        className="event-register-button"
        onClick={() => {
          window.scrollTo(0, 0);
          navigate("/events");
        }}
      >
        REGISTER NOW 
      </button>

      {/* Timer Section - CENTER */}
      <div style={styles.timerSection} className="event-timer-section">
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

      {/* Banner - RIGHT SIDE */}
      <div style={styles.banner} className="event-countdown-banner">
        <div style={styles.blackBlock}></div>
        <div style={styles.redSection}>
          <div style={styles.slant}></div>
          <div style={styles.textContainer}>
            {nextEvent.title && (
              <h2 style={styles.title}>{nextEvent.title.toUpperCase()}</h2>
            )}
            <h3 style={styles.dateTime}>{eventDateParts.monthDay} {eventDateParts.year} - {eventDateParts.time}</h3>
            {nextEvent.location && (
              <p style={styles.route}>{nextEvent.location}</p>
            )}
          </div>
        </div>
      </div>
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
    padding: '20px 35px',
    paddingLeft: '55px',
    minWidth: '450px'
  },
  textContainer: {
    position: 'relative',
    zIndex: 2
  },
  title: {
    color: 'white',
    fontSize: 'clamp(14px, 2.8vw, 20px)',
    fontWeight: 'bold',
    margin: '0 0 3px 0',
    letterSpacing: '0.8px',
    lineHeight: '1.3'
  },
  dateTime: {
    color: 'white',
    fontSize: 'clamp(13px, 2.3vw, 17px)',
    fontWeight: '600',
    margin: '3px 0',
    letterSpacing: '0.5px',
    opacity: 0.95
  },
  route: {
    color: 'white',
    fontSize: 'clamp(12px, 2vw, 15px)',
    fontWeight: 'normal',
    margin: '3px 0 0 0',
    letterSpacing: '0.5px',
    opacity: 0.9,
    lineHeight: '1.3'
  },
  slant: {
    position: 'absolute',
    left: '-30px',
    top: 0,
    bottom: 0,
    width: '60px',
    backgroundColor: '#d9434d',
    transform: 'skewX(15deg)',
    zIndex: 1
  },
  blackBlock: {
    width: '80px',
    height: '100%',
    backgroundColor: '#2b2b2b',
    transform: 'skewX(15deg)',
    marginRight: '-10px'
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
    
    .event-register-button:hover {
      background-color: #d93844 !important;
    }
    
    @media (max-width: 1200px) {
      .event-countdown-container {
        justify-content: center !important;
        flex-direction: column !important;
      }
      .event-countdown-banner {
        flex: 1 1 100% !important;
        justify-content: center;
        order: 1;
      }
      .event-timer-section {
        flex: 1 1 100% !important;
        order: 2;
      }
      .event-register-button {
        flex: 1 1 100% !important;
        justify-content: center !important;
        order: 3;
      }
    }
    
    @media (max-width: 768px) {
      .event-countdown-container {
        padding: 30px 20px 40px 20px !important;
        gap: 20px !important;
      }
      .event-countdown-banner {
        height: auto !important;
        flex-direction: column;
      }
      .event-countdown-banner > div:last-child {
        min-width: 300px !important;
        padding: 20px 30px !important;
        padding-left: 50px !important;
      }
      .event-countdown-banner > div:first-child {
        display: none;
      }
      .event-timer-section {
        gap: 10px !important;
        flex-wrap: wrap;
      }
      .event-register-button {
        padding: 15px 30px !important;
      }
    }
    
    @media (max-width: 480px) {
      .event-countdown-banner > div:last-child {
        min-width: 250px !important;
        padding: 15px 20px !important;
        padding-left: 40px !important;
      }
      .event-timer-section {
        gap: 8px !important;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}
