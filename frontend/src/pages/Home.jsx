import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import HomeSection from "../components/HeroSection.jsx";
import { X, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Home = () => {
  const [showSponsor1, setShowSponsor1] = useState(true);
  const [showSponsor2, setShowSponsor2] = useState(true);
  const [featuredSponsors, setFeaturedSponsors] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedSponsors();
  }, []);

  const fetchFeaturedSponsors = async () => {
    try {
      const response = await api.get('/sponsors/featured');
      setFeaturedSponsors(response.data.data || []);
    } catch (error) {
      console.error('Error fetching featured sponsors:', error);
    }
  };

  const navigateToSponsors = () => {
    navigate('/sponsors');
  };

  return (
    <>
      <div id="home" style={{ position: 'relative' }}>
        <Navbar />
        <HomeSection />

        {/* Sponsor Card 1 */}
        {showSponsor1 && featuredSponsors[0] && (
          <div style={styles.sponsorCard1} className="sponsor-card">
            <button 
              onClick={() => setShowSponsor1(false)}
              style={styles.closeBtn}
              className="close-btn"
            >
              <X size={18} />
            </button>
            <div style={styles.sponsorBadge}>FEATURED</div>
            <div style={styles.sponsorImgWrapper}>
              <img 
                src={featuredSponsors[0].logoUrl} 
                alt={featuredSponsors[0].name}
                style={styles.sponsorImg}
              />
              <div style={styles.sponsorOverlay}></div>
            </div>
            <div style={styles.sponsorInfo}>
              <h3 style={styles.sponsorTitle}>{featuredSponsors[0].name}</h3>
              <p style={styles.sponsorDesc}>{featuredSponsors[0].tagline}</p>
              <button 
                onClick={navigateToSponsors}
                style={styles.sponsorBtn}
                className="sponsor-btn"
              >
                <span>Discover More</span>
                <ExternalLink size={16} style={styles.btnIcon} />
              </button>
            </div>
          </div>
        )}

        {/* Sponsor Card 2 */}
        {showSponsor2 && featuredSponsors[1] && (
          <div style={styles.sponsorCard2} className="sponsor-card">
            <button 
              onClick={() => setShowSponsor2(false)}
              style={styles.closeBtn}
              className="close-btn"
            >
              <X size={18} />
            </button>
            <div style={{...styles.sponsorBadge, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>PARTNER</div>
            <div style={styles.sponsorImgWrapper}>
              <img 
                src={featuredSponsors[1].logoUrl} 
                alt={featuredSponsors[1].name}
                style={styles.sponsorImg}
              />
              <div style={styles.sponsorOverlay}></div>
            </div>
            <div style={styles.sponsorInfo}>
              <h3 style={styles.sponsorTitle}>{featuredSponsors[1].name}</h3>
              <p style={styles.sponsorDesc}>{featuredSponsors[1].tagline}</p>
              <button 
                onClick={navigateToSponsors}
                style={{...styles.sponsorBtn, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}
                className="sponsor-btn"
              >
                <span>Explore Deals</span>
                <ExternalLink size={16} style={styles.btnIcon} />
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .sponsor-card {
          animation: fadeInScale 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .sponsor-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255, 71, 87, 0.4);
        }

        .close-btn:hover {
          background: rgba(255, 71, 87, 0.9) !important;
          transform: rotate(90deg);
        }

        @media (min-width: 1024px) {
          .sponsor-card:hover {
            transform: translateY(-5px);
          }
        }

        @media (max-width: 1024px) and (min-width: 769px) {
          .sponsor-card {
            width: 280px !important;
          }
        }

        @media (max-width: 768px) {
          .sponsor-card {
            width: 200px !important;
          }
          
          .sponsor-card:first-of-type {
            top: 80px !important;
            left: 10px !important;
          }
          
          .sponsor-card:last-of-type {
            bottom: 80px !important;
            right: 10px !important;
          }
        }

        @media (max-width: 480px) {
          .sponsor-card {
            width: 180px !important;
          }
          
          .sponsor-card:first-of-type {
            top: 70px !important;
            left: 8px !important;
          }
          
          .sponsor-card:last-of-type {
            bottom: 70px !important;
            right: 8px !important;
          }
        }
      `}</style>
    </>
  );
};

const styles = {
  sponsorCard1: {
    position: 'fixed',
    top: '120px',
    left: '40px',
    width: '320px',
    backgroundColor: '#1a1a1a',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6)',
    border: '1px solid #2a2a2a',
    zIndex: 999,
    transition: 'all 0.3s ease',
  },
  sponsorCard2: {
    position: 'fixed',
    bottom: '40px',
    right: '40px',
    width: '320px',
    backgroundColor: '#1a1a1a',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6)',
    border: '1px solid #2a2a2a',
    zIndex: 999,
    transition: 'all 0.3s ease',
  },
  closeBtn: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(10px)',
    border: 'none',
    color: '#fff',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 10,
    transition: 'all 0.3s ease',
  },
  sponsorBadge: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    background: 'linear-gradient(135deg, #ff4757 0%, #ff6b7a 100%)',
    color: '#fff',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.7rem',
    fontWeight: '700',
    letterSpacing: '0.5px',
    zIndex: 10,
    boxShadow: '0 2px 10px rgba(255, 71, 87, 0.4)',
  },
  sponsorImgWrapper: {
    position: 'relative',
    width: '100%',
    height: '160px',
    overflow: 'hidden',
  },
  sponsorImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  sponsorOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    background: 'linear-gradient(to top, #1a1a1a 0%, transparent 100%)',
  },
  sponsorInfo: {
    padding: '20px',
  },
  sponsorTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '8px',
    marginTop: 0,
  },
  sponsorDesc: {
    fontSize: '0.85rem',
    color: '#999',
    lineHeight: '1.5',
    marginBottom: '16px',
  },
  sponsorBtn: {
    width: '100%',
    background: 'linear-gradient(135deg, #ff4757 0%, #ff6b7a 100%)',
    color: '#fff',
    padding: '12px 20px',
    border: 'none',
    borderRadius: '10px',
    fontSize: '0.9rem',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(255, 71, 87, 0.3)',
  },
  btnIcon: {
    fontSize: '1rem',
  },
};

export default Home;