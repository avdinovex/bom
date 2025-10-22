import Navbar from '../components/Navbar';
import Footer from './Footer';
import Background from '../assets/bgBlogs.png';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { publicCompletedRidesAPI } from '../services/api';
import { toast } from 'react-hot-toast';

const Blogs = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch completed rides from backend
  useEffect(() => {
    const fetchRides = async () => {
      try {
        setLoading(true);
        const response = await publicCompletedRidesAPI.getAll({
          limit: 10,
          sortBy: 'date',
          sortOrder: 'desc'
        });
        
        if (response.data?.data) {
          setRides(response.data.data);
        } else {
          setRides([]);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching completed rides:', err);
        setError('Failed to load rides');
        toast.error('Failed to load rides');
        setRides([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRides();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Get date range for rides
  const getDateRange = (ride) => {
    const startDate = new Date(ride.date);
    if (ride.duration && ride.duration.includes('day')) {
      const days = parseInt(ride.duration);
      if (days > 1) {
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + days - 1);
        return `${formatDate(startDate)} - ${formatDate(endDate)}`;
      }
    }
    return formatDate(startDate);
  };
  const styles = {
    pageContainer: { width: '100%', backgroundColor: '#0a0a0a', minHeight: '100vh' },
    heroSection: {
      position: 'relative',
      height: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '120px 40px 80px',
      overflow: 'hidden',
    },
    heroBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: `url(${Background})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      filter: 'brightness(0.4)',
    },
    heroOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'radial-gradient(circle at 50% 50%, rgba(230, 57, 70, 0.2) 0%, rgba(0,0,0,0.4) 70%)',
    },
    glassContainer: {
      position: 'relative',
      zIndex: 2,
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '60px 80px',
      maxWidth: '900px',
      width: '100%',
    },
    heroContent: { textAlign: 'center' },
    heroBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '30px',
      padding: '10px 25px',
      background: 'rgba(230, 57, 70, 0.25)',
      borderRadius: '30px',
      border: '1px solid rgba(230, 57, 70, 0.4)',
    },
    chevronLeft: { color: '#e63946', fontSize: '20px', fontWeight: 'bold' },
    chevronRight: { color: '#e63946', fontSize: '20px', fontWeight: 'bold' },
    badgeText: { color: '#fff', fontSize: '13px', fontWeight: '700', letterSpacing: '2px' },
    heroTitle: {
      fontSize: '4.5rem',
      fontWeight: '900',
      color: '#fff',
      marginBottom: '25px',
      letterSpacing: '3px',
      lineHeight: '1.1',
    },
    heroSubtitle: { fontSize: '1.2rem', color: '#fff', lineHeight: '1.8' },
    contentSection: { backgroundColor: '#0a0a0a', padding: '80px 40px' },
    sectionHeader: { textAlign: 'center', marginBottom: '60px', maxWidth: '800px', margin: '0 auto 60px' },
    sectionTitle: { fontSize: '3rem', fontWeight: '800', color: '#fff', marginBottom: '20px', letterSpacing: '2px' },
    sectionSubtitle: { fontSize: '1.1rem', color: '#999', lineHeight: '1.8' },
    ridesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '40px',
      maxWidth: '1400px',
      margin: '0 auto 80px',
    },
    rideCard: {
      backgroundColor: '#1a1a1a',
      borderRadius: '12px',
      overflow: 'hidden',
      transition: 'all 0.4s ease',
      cursor: 'pointer',
    },
    imageWrapper: { position: 'relative', height: '280px', overflow: 'hidden' },
    rideImage: { width: '100%', height: '100%', objectFit: 'cover', transition: '0.5s' },
    imageOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.7))',
      display: 'flex',
      alignItems: 'flex-end',
      padding: '20px',
    },
    dateTag: {
      backgroundColor: '#e63946',
      color: '#fff',
      padding: '8px 18px',
      borderRadius: '20px',
      fontSize: '13px',
      fontWeight: '700',
    },
    cardContent: { padding: '30px' },
    locationBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      color: '#e63946',
      fontSize: '14px',
      fontWeight: '600',
      marginBottom: '15px',
    },
    rideTitle: { fontSize: '1.8rem', fontWeight: '800', color: '#fff', marginBottom: '15px', letterSpacing: '1px' },
    rideDescription: { fontSize: '15px', color: '#aaa', lineHeight: '1.7', marginBottom: '25px' },
    statsRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'stretch',
      gap: '20px',
      marginBottom: '20px',
    },
    statBox: {
      flex: 1,
      backgroundColor: '#0a0a0a',
      padding: '20px 15px',
      borderRadius: '8px',
      textAlign: 'center',
      border: '1px solid rgba(255,255,255,0.05)',
    },
    statIcon: { fontSize: '24px', marginBottom: '8px' },
    statLabel: { fontSize: '11px', color: '#666', marginBottom: '5px', letterSpacing: '1px', textTransform: 'uppercase' },
    statValue: { fontSize: '14px', color: '#fff', fontWeight: '700' },
    ctaSection: {
      textAlign: 'center',
      padding: '80px 40px',
      background: 'linear-gradient(135deg, rgba(211, 15, 31, 0.1) 0%, transparent 100%)',
      borderRadius: '16px',
      maxWidth: '1000px',
      margin: '0 auto',
    },
    ctaTitle: { fontSize: '2.5rem', fontWeight: '800', color: '#fff', marginBottom: '20px', letterSpacing: '2px' },
    ctaText: { fontSize: '1.1rem', color: '#aaa', marginBottom: '35px', lineHeight: '1.8' },
    ctaButton: {
      display: 'inline-flex',
      alignItems: 'stretch',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      overflow: 'hidden',
    },
    buttonIcon: {
      backgroundColor: '#e63946',
      color: 'white',
      padding: '0 25px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
      fontWeight: 'bold',
      transition: 'background-color 0.3s ease',
      minHeight: '60px',
    },
    ctaButtonText: {
      backgroundColor: '#2b2b2b',
      color: 'white',
      padding: '0 35px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      fontWeight: 'bold',
      letterSpacing: '1.5px',
      minHeight: '60px',
    },
  };

  return (
    <>
      <style>
        {`
          /* Tablet Responsive (768px - 1024px) */
          @media (max-width: 1024px) {
            .rides-grid {
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 30px !important;
            }
            
            .hero-title {
              font-size: 3.5rem !important;
            }
            
            .glass-container {
              padding: 50px 60px !important;
            }
          }

          /* Mobile Responsive (max-width: 767px) */
          @media (max-width: 767px) {
            .hero-section {
              height: auto !important;
              min-height: 100vh !important;
              padding: 80px 20px 60px !important;
            }
            
            .glass-container {
              padding: 40px 30px !important;
              border-radius: 16px !important;
            }
            
            .hero-badge {
              padding: 8px 20px !important;
              gap: 8px !important;
              margin-bottom: 20px !important;
            }
            
            .badge-text {
              font-size: 11px !important;
            }
            
            .hero-title {
              font-size: 2.5rem !important;
              margin-bottom: 20px !important;
              letter-spacing: 2px !important;
            }
            
            .hero-subtitle {
              font-size: 1rem !important;
            }
            
            .content-section {
              padding: 60px 20px !important;
            }
            
            .section-header {
              margin-bottom: 40px !important;
            }
            
            .section-title {
              font-size: 2rem !important;
              margin-bottom: 15px !important;
            }
            
            .section-subtitle {
              font-size: 0.95rem !important;
            }
            
            .rides-grid {
              grid-template-columns: 1fr !important;
              gap: 30px !important;
              margin-bottom: 60px !important;
            }
            
            .card-content {
              padding: 25px !important;
            }
            
            .ride-title {
              font-size: 1.5rem !important;
            }
            
            .ride-description {
              font-size: 14px !important;
            }
            
            .stats-row {
              flex-direction: row !important;
              gap: 15px !important;
            }
            
            .stat-box {
              padding: 15px 10px !important;
            }
            
            .stat-value {
              font-size: 12px !important;
            }
            
            .cta-section {
              padding: 60px 20px !important;
            }
            
            .cta-title {
              font-size: 1.8rem !important;
            }
            
            .cta-text {
              font-size: 1rem !important;
              margin-bottom: 30px !important;
            }
            
            .cta-button-text {
              padding: 0 25px !important;
              font-size: 12px !important;
            }
            
            .button-icon {
              padding: 0 20px !important;
              font-size: 18px !important;
            }
          }

          /* Small Mobile (max-width: 480px) */
          @media (max-width: 480px) {
            .hero-title {
              font-size: 2rem !important;
            }
            
            .section-title {
              font-size: 1.75rem !important;
            }
            
            .glass-container {
              padding: 30px 20px !important;
            }
            
            .cta-title {
              font-size: 1.5rem !important;
            }
          }
        `}
      </style>

      <div style={styles.pageContainer}>
        {/* Hero Section */}
       
        <div style={styles.heroSection} className="hero-section">
           <Navbar/>
          <div style={styles.heroBackground}></div>
          <div style={styles.heroOverlay}></div>
          <div style={styles.glassContainer} className="glass-container">
            <div style={styles.heroContent}>
              <div style={styles.heroBadge} className="hero-badge">
                <span style={styles.chevronLeft}>«</span>
                <span style={styles.badgeText} className="badge-text">EXPLORE OUR JOURNEYS</span>
                <span style={styles.chevronRight}>»</span>
              </div>
              <h1 style={styles.heroTitle} className="hero-title">
                EPIC RIDES.<br />EPIC MEMORIES.
              </h1>
              <p style={styles.heroSubtitle} className="hero-subtitle">
                Join us on thrilling adventures across breathtaking landscapes and unforgettable routes
              </p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div style={styles.contentSection} className="content-section">
          <div style={styles.sectionHeader} className="section-header">
            <h2 style={styles.sectionTitle} className="section-title">OUR RECENT RIDES</h2>
            <p style={styles.sectionSubtitle} className="section-subtitle">
              Every ride tells a story. Every journey creates a bond. Discover the adventures that define the Brotherhood of Mumbai.
            </p>
          </div>

          <div style={styles.ridesGrid} className="rides-grid">
            {loading ? (
              <div className="col-span-3 text-center text-white py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mb-4"></div>
                <p>Loading rides...</p>
              </div>
            ) : error ? (
              <div className="col-span-3 text-center text-white py-12">
                <p className="text-red-400 mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : rides.length === 0 ? (
              <div className="col-span-3 text-center text-white py-12">
                <p>No rides available at the moment.</p>
              </div>
            ) : (
              rides.map((ride) => (
                <div
                  key={ride._id}
                  style={{
                    ...styles.rideCard,
                    transform: hoveredCard === ride._id ? 'translateY(-10px)' : 'translateY(0)',
                    boxShadow: hoveredCard === ride._id ? '0 20px 50px rgba(230, 57, 70, 0.3)' : '0 5px 20px rgba(0,0,0,0.1)',
                  }}
                  onMouseEnter={() => setHoveredCard(ride._id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div style={styles.imageWrapper}>
                    <img
                      src={ride.imgUrl || '/images/default-ride.jpg'}
                      alt={ride.title}
                      style={{
                        ...styles.rideImage,
                        transform: hoveredCard === ride._id ? 'scale(1.1)' : 'scale(1)',
                      }}
                      onError={(e) => {
                        e.target.src = '/images/default-ride.jpg';
                      }}
                    />
                    <div style={styles.imageOverlay}>
                      <span style={styles.dateTag}>{getDateRange(ride)}</span>
                    </div>
                  </div>

                  <div style={styles.cardContent} className="card-content">
                    <div style={styles.locationBadge}>
                      <span>📍</span>
                      {ride.venue}
                    </div>

                    <h3 style={styles.rideTitle} className="ride-title">{ride.title}</h3>
                    <p style={styles.rideDescription} className="ride-description">
                      {ride.details && ride.details.length > 200 
                        ? `${ride.details.substring(0, 200)}...` 
                        : ride.details || 'No description available.'}
                    </p>

                    <div style={styles.statsRow} className="stats-row">
                      <div style={styles.statBox} className="stat-box">
                        <div style={styles.statIcon}>📅</div>
                        <div style={styles.statLabel}>Date</div>
                        <div style={styles.statValue} className="stat-value">{formatDate(ride.date)}</div>
                      </div>
                      <div style={styles.statBox} className="stat-box">
                        <div style={styles.statIcon}>📍</div>
                        <div style={styles.statLabel}>Venue</div>
                        <div style={styles.statValue} className="stat-value">{ride.venue}</div>
                      </div>
                    </div>

                    {ride.participants && (
                      <div style={styles.statsRow} className="stats-row">
                        <div style={styles.statBox} className="stat-box">
                          <div style={styles.statIcon}>�</div>
                          <div style={styles.statLabel}>Participants</div>
                          <div style={styles.statValue} className="stat-value">{ride.participants}</div>
                        </div>
                        <div style={styles.statBox} className="stat-box">
                          <div style={styles.statIcon}>📏</div>
                          <div style={styles.statLabel}>Distance</div>
                          <div style={styles.statValue} className="stat-value">{ride.distance ? `${ride.distance} km` : 'N/A'}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Call to Action */}
          <div style={styles.ctaSection} className="cta-section">
            <h2 style={styles.ctaTitle} className="cta-title">READY FOR YOUR NEXT ADVENTURE?</h2>
            <p style={styles.ctaText} className="cta-text">
              Join the Brotherhood and be part of our next epic ride. New adventures await!
            </p>
            <button 
              style={styles.ctaButton}
              onClick={() => {window.scrollTo(0,0);
                navigate('/upcoming-rides')}}
              onMouseEnter={(e) => {
                const icon = e.currentTarget.querySelector('.button-icon');
                const text = e.currentTarget.querySelector('.cta-button-text');
                if (icon) icon.style.backgroundColor = '#d43f4d';
                if (text) text.style.backgroundColor = '#1a1a1a';
              }}
              onMouseLeave={(e) => {
                const icon = e.currentTarget.querySelector('.button-icon');
                const text = e.currentTarget.querySelector('.cta-button-text');
                if (icon) icon.style.backgroundColor = '#e63946';
                if (text) text.style.backgroundColor = '#2b2b2b';
              }}
            >
              <span style={styles.buttonIcon} className="button-icon">»</span>
              <span style={styles.ctaButtonText} className="cta-button-text">JOIN OUR NEXT RIDE</span>
            </button>
          </div>
        </div>
        <Footer/>
      </div>
    </>
  );
};

export default Blogs;