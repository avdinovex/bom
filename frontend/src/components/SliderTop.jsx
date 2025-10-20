import React from 'react';
import Navbar from './Navbar';
import Footer from '../pages/Footer.jsx'
const SliderTop = ({ image, testimonial, name, title, date, locations }) => {
  return (
    <>
      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(1.1);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          .slider-top-content {
            animation: fadeInUp 0.8s ease-out 0.3s both;
          }

          .slider-top-image-container {
            animation: scaleIn 1s ease-out both;
          }

          .slider-top-image-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(to bottom, transparent 60%, rgba(239, 68, 68, 0.3) 100%);
            z-index: 1;
            pointer-events: none;
          }

          .slider-top-quote {
            transition: all 0.3s ease;
          }

          .slider-top-content:hover .slider-top-quote {
            transform: scale(1.1);
            color: rgba(255, 255, 255, 0.3) !important;
          }

          @media (max-width: 1200px) {
            .slider-top-content {
              padding: 60px 70px !important;
            }
            .slider-top-date {
              font-size: 17px !important;
            }
            .slider-top-locations {
              font-size: 14px !important;
            }
            .slider-top-testimonial {
              font-size: 15px !important;
              margin-bottom: 25px !important;
            }
            .slider-top-name {
              font-size: 36px !important;
            }
            .slider-top-title {
              font-size: 17px !important;
            }
            .slider-top-quote {
              font-size: 170px !important;
              right: 60px !important;
            }
          }

          @media (max-width: 968px) {
            .slider-top-full-container {
              padding: 80px 20px 40px 20px !important;
            }
            .slider-top-image-container {
              height: 400px !important;
            }
            .slider-top-content {
              padding: 50px 40px !important;
              min-height: 300px !important;
              margin-bottom: 0 !important;
            }
            .slider-top-date {
              font-size: 16px !important;
            }
            .slider-top-locations {
              font-size: 13px !important;
            }
            .slider-top-testimonial {
              font-size: 14px !important;
              margin-bottom: 20px !important;
            }
            .slider-top-name {
              font-size: 30px !important;
            }
            .slider-top-title {
              font-size: 16px !important;
            }
            .slider-top-quote {
              font-size: 140px !important;
              right: 40px !important;
            }
          }

          @media (max-width: 768px) {
            .slider-top-full-container {
              padding: 70px 15px 30px 15px !important;
            }
            .slider-top-image-container {
              height: 350px !important;
            }
            .slider-top-content {
              padding: 40px 30px !important;
              min-height: 280px !important;
            }
            .slider-top-date {
              font-size: 15px !important;
            }
            .slider-top-locations {
              font-size: 12px !important;
              margin-bottom: 18px !important;
            }
            .slider-top-testimonial {
              font-size: 13px !important;
              margin-bottom: 18px !important;
            }
            .slider-top-name {
              font-size: 26px !important;
            }
            .slider-top-title {
              font-size: 15px !important;
            }
            .slider-top-quote {
              font-size: 120px !important;
              right: 35px !important;
              bottom: 30px !important;
            }
          }

          @media (max-width: 480px) {
            .slider-top-full-container {
              padding: 60px 10px 20px 10px !important;
            }
            .slider-top-image-container {
              height: 280px !important;
            }
            .slider-top-content {
              padding: 30px 20px !important;
              min-height: 250px !important;
            }
            .slider-top-date {
              font-size: 14px !important;
            }
            .slider-top-locations {
              font-size: 11px !important;
              margin-bottom: 15px !important;
            }
            .slider-top-testimonial {
              font-size: 12px !important;
              line-height: 1.6 !important;
              margin-bottom: 15px !important;
            }
            .slider-top-name {
              font-size: 22px !important;
              margin-bottom: 8px !important;
            }
            .slider-top-title {
              font-size: 13px !important;
            }
            .slider-top-quote {
              font-size: 100px !important;
              right: 20px !important;
              bottom: 20px !important;
            }
          }
        `}
      </style>
      <Navbar />
      <div style={styles.fullPageContainer} className="slider-top-full-container">
        <div style={styles.container}>
          <div style={styles.imageContainer} className="slider-top-image-container">
            {image ? (
              <img 
                src={image} 
                alt={name || 'Event'} 
                style={styles.image}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 24px; font-weight: bold;">IMAGE NOT FOUND</div>';
                }}
              />
            ) : (
              <div style={styles.placeholderText}>IMAGE</div>
            )}
          </div>
          <div style={styles.contentContainer} className="slider-top-content">
            <div style={styles.textWrapper}>
              <h3 style={styles.name} className="slider-top-name">{name}</h3>
              {date && (
                <div style={styles.dateContainer}>
                  <span style={styles.dateIcon}>📅</span>
                  <p style={styles.date} className="slider-top-date">
                    {date}
                  </p>
                </div>
              )}
              {locations && (
                <div style={styles.locationContainer}>
                  <span style={styles.locationIcon}>📍</span>
                  <p style={styles.locations} className="slider-top-locations">
                    {locations}
                  </p>
                </div>
              )}
              <div style={styles.divider}></div>
              <p style={styles.testimonial} className="slider-top-testimonial">{testimonial}</p>
              <p style={styles.title} className="slider-top-title">— {title}</p>
            </div>
            <div style={styles.quoteIcon} className="slider-top-quote">"</div>
          </div>
           <Footer/>
        </div>
       
      </div>
    </>
  );
};

const styles = {
  fullPageContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '100px 20px 40px',
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '1400px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
    overflow: 'hidden',
    backgroundColor: 'white',
    borderRadius: '12px',
  },
  imageContainer: {
    width: '100%',
    height: '500px',
    overflow: 'hidden',
    backgroundColor: '#2a2a2a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  placeholderText: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    color: '#888',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontWeight: 'bold',
  },
  contentContainer: {
    background: 'linear-gradient(135deg, #ff4757 0%, #e63946 100%)',
    padding: '70px 90px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    position: 'relative',
    minHeight: '350px',
  },
  textWrapper: {
    position: 'relative',
    zIndex: 2,
  },
  name: {
    color: 'white',
    fontSize: '48px',
    fontWeight: '800',
    marginBottom: '20px',
    margin: '0 0 20px 0',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)',
  },
  dateContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '12px',
  },
  dateIcon: {
    fontSize: '18px',
  },
  date: {
    color: 'white',
    fontSize: '18px',
    fontWeight: '600',
    margin: '0',
    letterSpacing: '0.5px',
  },
  locationContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    marginBottom: '25px',
    paddingBottom: '25px',
    borderBottom: '2px solid rgba(255, 255, 255, 0.25)',
  },
  locationIcon: {
    fontSize: '18px',
    marginTop: '2px',
  },
  locations: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: '15px',
    fontWeight: '400',
    lineHeight: '1.7',
    margin: '0',
    flex: 1,
  },
  divider: {
    width: '60px',
    height: '3px',
    backgroundColor: 'white',
    marginBottom: '25px',
    borderRadius: '2px',
  },
  testimonial: {
    color: 'white',
    fontSize: '17px',
    fontStyle: 'italic',
    lineHeight: '1.9',
    marginBottom: '25px',
    fontWeight: '300',
    maxWidth: '1200px',
    textAlign: 'left',
    position: 'relative',
    paddingLeft: '20px',
    borderLeft: '3px solid rgba(255, 255, 255, 0.4)',
  },
  title: {
    color: 'white',
    fontSize: '18px',
    fontWeight: '600',
    margin: '0',
    letterSpacing: '1px',
  },
  quoteIcon: {
    position: 'absolute',
    bottom: '30px',
    right: '70px',
    fontSize: '200px',
    color: 'rgba(255, 255, 255, 0.15)',
    fontFamily: 'Georgia, serif',
    lineHeight: '1',
    zIndex: 1,
  },
};

export default SliderTop;