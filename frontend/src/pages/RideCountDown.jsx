import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

export default function RideCountdown() {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });  

  useEffect(() => {
    const targetDate = new Date('2022-06-06T10:30:00').getTime();
    
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
  }, []);

  const formatNumber = (num) => String(num).padStart(2, '0');

  return (
    <div style={styles.container} className="countdown-container">
      <div style={styles.banner} className="countdown-banner">
        <div style={styles.redSection}>
          <div style={styles.textContainer}>
            <h2 style={styles.title}>NEXT RIDE START AT JUNE</h2>
            <h2 style={styles.title}>06, 2022 - 10:30 AM</h2>
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
  REGISTER NOW NEXT RIDE
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