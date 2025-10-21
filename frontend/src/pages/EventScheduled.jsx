import React from 'react';
import { useNavigate } from 'react-router-dom';
import DamanHero from '../assets/DamanHero.jpg';
import MalshejHero from '../assets/MalshejHero.jpg';
import DamanRide from '../assets/DamanRide.jpg';
import MalshejRide from '../assets/MalshejRide.jpg'

export default function EventSchedule() {
  const navigate = useNavigate();

  const damanEventData = {
    image: DamanRide,
    date: "7th & 8th June 2025",
    locations: "Devka Beach • St. Jerome Fort – Portuguese Colony (Colorful Heritage Structures) • Moti Daman Fort • Daman Lighthouse • Moti Daman Beach • Jampore Beach",
    testimonial: "The Brotherhood of Mumbai (BOM) embarked on yet another unforgettable chapter — the Explore Daman Ride, a weekend filled with coastal winds, heritage trails, and the spirit of brotherhood. The journey began with a scenic coastal route leading towards Daman, where the riders cruised through smooth highways and charming seaside roads. From the vibrant St. Jerome Fort to the serene Moti Daman Beach, every stop offered a blend of culture, history, and stunning views. Riders explored the Portuguese colony's colorful structures, soaked in sunsets at Devka and Jampore Beach, and admired the majestic Daman Lighthouse standing tall by the sea — a true symbol of direction and resilience. The evening came alive with laughter, stories, and the shared pride of the Brotherhood. Surrounded by waves and warm camaraderie, the riders celebrated their bond — built not just on machines, but on memories. The Explore Daman Ride perfectly captured BOM's ethos — Ride. Explore. Celebrate. From the coastal breeze to the historic charm, every mile echoed the spirit of freedom and togetherness that defines the Brotherhood of Mumbai.",
    name: "Explore Daman Ride",
    title: "Host by: Brotherhood Of Mumbai"
  };

  const malshejEventData = {
    image: MalshejRide,
    date: "19th & 20th July 2025",
    locations: "Sahyadri's Heritage Agrotourism Resort • Kalu Waterfall",
    testimonial: "The Brotherhood of Mumbai (BOM) celebrated its 7th Anniversary Ride with a memorable journey to Malshej Ghat. The two-day, one-night ride was filled with adventure, scenic routes, and the true spirit of brotherhood that defines BOM. The ride began with thrilling mountain roads leading towards Malshej, surrounded by lush greenery and fog-covered valleys. Riders experienced an exciting off-road trail to reach the famous Kalu Waterfall, where the terrain tested both skill and spirit. The group stayed at Sahyadri's Heritage Agrotourism Resort, offering a perfect mix of comfort and countryside charm. The evening was spent relaxing, sharing stories, and celebrating BOM's 7th anniversary together. This ride beautifully captured the essence of what BOM stands for — Ride. Explore. Celebrate. From challenging roads to serene moments by the waterfall, every part of this journey added to the legacy of the Brotherhood of Mumbai.",
    name: "Malshej Ghat – BOM 7th Anniversary Ride",
    title: "Host by: Brotherhood Of Mumbai"
  };

  return (
    <div style={styles.container}>
      <div style={styles.mainGrid} className="event-main-grid">
        <div style={styles.leftColumn} className="event-left-column">
          <div style={styles.header}>
            <div style={styles.eventBadge}>
              <span style={styles.chevronLeft}>«</span>
              <span style={styles.eventText}>EVENT</span>
              <span style={styles.chevronRight}>»</span>
            </div>
            <h1 style={styles.mainTitle}>EVENT AND SCHEDULE</h1>
            <p style={styles.description}>
              Experience the freedom of the ride like never before! Whether you're
              cruising through scenic highways.
            </p>
            <button 
              style={styles.viewButton}
              onClick={() => {
  window.scrollTo(0, 0);
  navigate('/events');
}}
              onMouseEnter={(e) => {
                e.currentTarget.querySelector('.button-icon').style.backgroundColor = '#d43f4d';
                e.currentTarget.querySelector('.button-text').style.backgroundColor = '#1a1a1a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.querySelector('.button-icon').style.backgroundColor = '#e74c5a';
                e.currentTarget.querySelector('.button-text').style.backgroundColor = '#2b2b2b';
              }}
            >
              <span style={styles.buttonIcon} className="button-icon">»</span>
              <span style={styles.buttonText} className="button-text">VIEW MORE EVENT</span>
            </button>
          </div>

          <div style={styles.eventCard}>
            <div style={styles.imageContainer}>
              <img 
                src={MalshejHero}
                alt="Malshej Ghat Ride" 
                style={styles.eventImage}
              />
            </div>
            <div style={styles.cardContent}>
              <h3 style={styles.eventTitle}>Malshej Ghat – BOM 7th Anniversary Ride</h3>
              <p style={styles.hostText}>Host by : <span style={styles.hostName}>Brotherhood Of Mumbai</span></p>
              <button 
                style={styles.cardButton}
                onClick={() => {
  window.scrollTo(0, 0);
  navigate('/event-detail', { state: malshejEventData });
}}
                onMouseEnter={(e) => {
                  e.currentTarget.querySelector('.button-icon').style.backgroundColor = '#d43f4d';
                  e.currentTarget.querySelector('.button-text').style.backgroundColor = '#1a1a1a';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.querySelector('.button-icon').style.backgroundColor = '#e74c5a';
                  e.currentTarget.querySelector('.button-text').style.backgroundColor = '#2b2b2b';
                }}
              >
                <span style={styles.buttonIcon} className="button-icon">»</span>
                <span style={styles.buttonText} className="button-text">VIEW MORE EVENT</span>
              </button>
            </div>
          </div>
        </div>

        <div style={styles.rightColumn} className="event-right-column">
          <div style={styles.eventCard}>
            <div style={styles.imageContainer}>
              <img 
                src={DamanHero}
                alt="Explore Daman Ride" 
                style={styles.eventImage}
              />
            </div>
            <div style={styles.cardContent}>
              <h3 style={styles.eventTitle}>Explore Daman Ride</h3>
              <p style={styles.hostText}>Host by : <span style={styles.hostName}>Brotherhood Of Mumbai</span></p>
              <button 
                style={styles.cardButton}
                onClick={() => {
  window.scrollTo(0, 0);
  navigate('/event-detail', { state: damanEventData });
}}
                onMouseEnter={(e) => {
                  e.currentTarget.querySelector('.button-icon').style.backgroundColor = '#d43f4d';
                  e.currentTarget.querySelector('.button-text').style.backgroundColor = '#1a1a1a';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.querySelector('.button-icon').style.backgroundColor = '#e74c5a';
                  e.currentTarget.querySelector('.button-text').style.backgroundColor = '#2b2b2b';
                }}
              >
                <span style={styles.buttonIcon} className="button-icon">»</span>
                <span style={styles.buttonText} className="button-text">VIEW MORE EVENT</span>
              </button>
            </div>
          </div>

          <div style={styles.statsGrid} className="event-stats-grid">
            <div style={styles.statCard}>
              <h2 style={styles.statNumber}>160+</h2>
              <p style={styles.statText}>Brotherhood Of<br />Mumbai Family</p>
            </div>
            <div style={styles.statCard}>
              <h2 style={styles.statNumber}>80+</h2>
              <p style={styles.statText}>Completed<br />Rides</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '1400px',
    margin: '60px auto',
    padding: '60px 40px'
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '30px'
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px'
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px'
  },
  header: {
    paddingRight: '20px'
  },
  eventBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px'
  },
  chevronLeft: {
    color: '#e74c5a',
    fontSize: 'clamp(20px, 3vw, 30px)',
    fontWeight: 'bold'
  },
  eventText: {
    fontSize: 'clamp(14px, 2.5vw, 20px)',
    fontWeight: 'bold',
    letterSpacing: '3px',
    color: '#333'
  },
  chevronRight: {
    color: '#e74c5a',
    fontSize: 'clamp(20px, 3vw, 30px)',
    fontWeight: 'bold'
  },
  mainTitle: {
    fontSize: 'clamp(28px, 5vw, 48px)',
    fontWeight: 'bold',
    margin: '20px 0',
    color: '#1a1a1a'
  },
  description: {
    fontSize: 'clamp(14px, 2vw, 16px)',
    color: '#666',
    lineHeight: '1.6',
    marginBottom: '30px'
  },
  viewButton: {
    display: 'inline-flex',
    alignItems: 'stretch',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    margin: 0,
    transition: 'all 0.3s ease',
    lineHeight: 1
  },
  buttonIcon: {
    backgroundColor: '#e74c5a',
    color: 'white',
    padding: 'clamp(14px, 2.5vw, 18px) clamp(20px, 3.5vw, 26px)',
    fontSize: 'clamp(20px, 3.5vw, 24px)',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.3s ease',
    lineHeight: 1,
    border: 'none',
    margin: 0
  },
  buttonText: {
    backgroundColor: '#2b2b2b',
    color: 'white',
    padding: 'clamp(14px, 2.5vw, 18px) clamp(24px, 4vw, 30px)',
    fontSize: 'clamp(11px, 2vw, 14px)',
    fontWeight: 'bold',
    letterSpacing: '1px',
    transition: 'background-color 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    lineHeight: 1,
    border: 'none',
    margin: 0
  },
  eventCard: {
    backgroundColor: 'white',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  imageContainer: {
    width: '100%',
    height: '350px',
    overflow: 'hidden',
    position: 'relative'
  },
  eventImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block'
  },
  cardContent: {
    padding: 'clamp(20px, 4vw, 30px)',
    backgroundColor: '#f5f5f5'
  },
  eventTitle: {
    fontSize: 'clamp(18px, 3vw, 28px)',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#1a1a1a'
  },
  hostText: {
    fontSize: 'clamp(13px, 2vw, 16px)',
    color: '#666',
    marginBottom: '25px'
  },
  hostName: {
    color: '#1a1a1a',
    fontWeight: '500'
  },
  cardButton: {
    display: 'inline-flex',
    alignItems: 'stretch',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    margin: 0,
    transition: 'all 0.3s ease',
    lineHeight: 1
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px'
  },
  statCard: {
    backgroundColor: '#f5f5f5',
    padding: 'clamp(30px, 6vw, 45px) clamp(20px, 4vw, 30px)',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  statNumber: {
    fontSize: 'clamp(50px, 10vw, 100px)',
    fontWeight: 'bold',
    margin: '0',
    color: '#1a1a1a',
    lineHeight: '1'
  },
  statText: {
    fontSize: 'clamp(13px, 2vw, 18px)',
    color: '#666',
    marginTop: '15px',
    lineHeight: '1.6'
  }
};

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.innerHTML = `
    @media (max-width: 992px) {
      .event-main-grid {
        grid-template-columns: 1fr !important;
      }
      .event-left-column, .event-right-column {
        gap: 20px !important;
      }
    }
    
    @media (max-width: 768px) {
      .event-stats-grid {
        grid-template-columns: 1fr !important;
      }
    }
    
    @media (max-width: 480px) {
      .event-main-grid {
        gap: 20px !important;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}