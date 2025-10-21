import Navbar from '../components/Navbar';
import Footer from './Footer';
import Saphale from '../assets/Saphale.jpg';
import Trungali from "../assets/Trungali.jpg";
import Vandri from '../assets/Vandri.jpg';
import Kasmal from '../assets/Kasmal.jpg';
import Freedom from "../assets/FreedomRide.jpg";
import Background from '../assets/bgBlogs.png';
import Satara from '../assets/Satara.jpg'
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Blogs = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);

  const rides = [
    {
      id: 1,
      image: Saphale,
      title: 'Saphale Ride',
      location: 'Saphale, Maharashtra',
      date: 'March 15-16, 2024',
      description: 'The Brotherhood of Mumbai (BOM) set out on an amazing ride to Saphale, a peaceful coastal destination surrounded by hills and scenic roads. The route featured smooth highways mixed with beautiful ghat sections, offering the perfect blend of curves, climbs, and coastal breeze. During the ride, the group visited a temple dedicated to Mata, located close to the beach. The spot offered a serene atmosphere with a breathtaking sea view, making it a peaceful and spiritually refreshing halt for all riders. After exploring the area, the group enjoyed a delicious lunch at a local restaurant, known for its amazing food and warm hospitality — the perfect way to end the day\'s journey. The Saphale ride brought together everything that defines BOM — brotherhood, devotion, adventure, and the joy of riding through nature\'s best routes',
      stats: { date: 'March 15-16, 2024', stay: 'Saphale, Maharashtra' },
    },
    {
      id: 2,
      image: Trungali,
      title: 'Tungrali Dam Adventure',
      location: 'Tungrali Dam',
      date: 'February 22-23, 2024',
      description: 'The Brotherhood of Mumbai (BOM) explored the scenic beauty of Tungrali Dam in Lonavala — a destination known for its calm waters, lush greenery, and breathtaking hilltop views. The ride included an exciting off-road trail that led the riders to an elevated point overlooking the dam. The climb was thrilling, and once on top, the panoramic view of the valley and water below made every effort worth it. As the group reached the off-road section, light rain showers added to the adventure, making the trail even more exciting and memorable. Mud, mist, and machine — the perfect combination for any true rider. The Tungrali Dam ride was not just about the destination, but the journey itself — full of energy, brotherhood, and the spirit of exploration that defines BOM. This ride perfectly blended adventure and scenic beauty, leaving everyone with memories of laughter, rain, and stunning landscapes.',
      stats: { date: 'Feb 22-23, 2024', stay: 'Lonavala, Maharashtra' },
    },
    {
      id: 3,
      image: Freedom,
      title: 'Freedom Ride',
      location: 'Mumbai Coast',
      date: 'August 15, 2025',
      description: 'The Brotherhood of Mumbai (BOM) celebrated Independence Day with a spirited Freedom Ride to Karnala. Riders proudly displayed the Indian flag on their bikes, riding through scenic roads that offered both excitement and a sense of national pride. The route featured smooth stretches and gentle curves, perfect for a morning ride. After reaching Karnala, the group enjoyed a hearty breakfast at a comfortable hotel, setting the tone for the rest of the day\'s adventure. The ride captured the essence of freedom, brotherhood, and joy — riding together, exploring nature, and celebrating the spirit of India. The beautiful landscape, crisp morning air, and camaraderie among riders made the Freedom Ride a truly memorable experience. This ride reminded everyone that riding is not just about the destination — it\'s about celebrating liberty, adventure, and the bonds of brotherhood on the open road.',
      stats: { date: 'August 15, 2025', stay: 'Karnala, Maharashtra' },
    },
    {
      id: 4,
      image: Kasmal,
      title: 'Kasmal Plateau Expedition',
      location: 'Kasmal Plateau',
      date: 'September 14, 2025',
      description: 'The Brotherhood of Mumbai (BOM) rode into another refreshing chapter — the Kasmal Plateau Breakfast Ride, a perfect blend of early-morning chill, scenic countryside trails, and the strong bond that unites every brother on two wheels. The ride kicked off before sunrise as engines roared to life across the city, heading towards the serene Kasmal Plateau near Pen. The route, surrounded by rolling hills, misty paths, and winding turns, offered every rider a pure taste of freedom and nature. Upon reaching the plateau, riders were greeted with breathtaking panoramic views — a peaceful escape from city chaos. Over a hearty breakfast and hot tea, the group shared laughter, conversations, and the unspoken connection that comes from the open road. The return ride carried the same energy — filled with smiles beneath helmets and hearts full of contentment. The Kasmal Plateau Breakfast Ride perfectly reflected the BOM spirit — Ride. Explore. Celebrate. A short journey that reminded everyone why mornings are best spent with bikes, brothers, and endless horizons.',
      stats: { date: 'September 14, 2025', stay: 'Pen, Maharashtra' },
    },
    {
      id: 5,
      image: Vandri,
      title: 'Vandri Lake Ride',
      location: 'Vandri Lake',
      date: 'May 5-6, 2024',
      description: 'The Brotherhood of Mumbai (BOM) explored one of the most peaceful hidden gems near the city — Vandri Lake. Tucked away from the usual chaos, Vandri offered calm waters, open skies, and the perfect spot for a relaxing early morning ride. The group began the day with a refreshing breakfast by the lakeside, followed by some amazing drone shots capturing the serene blue waters and green surroundings. Riders also took the opportunity to photograph nature and scenic landscapes, preserving the beauty of the moment. The peaceful environment, light breeze, and reflection of the hills on the water made the entire experience feel calm and refreshing — a perfect short escape from the city hustle. The Vandri Lake ride reminded everyone that sometimes the best rides aren\'t about distance, but about peace, simplicity, and pure connection with nature.',
      stats: { date: 'May 5-6, 2024', stay: 'Near Mumbai' },
    },
    {
      id: 6,
      image: Satara,
      title: 'Wai-Satara Ride',
      location: 'Wai - Satara',
      date: 'October 10-12, 2025',
      description: 'The Brotherhood of Mumbai (BOM) explored one of the most peaceful hidden gems near the city — Vandri Lake. Tucked away from the usual chaos, Vandri offered calm waters, open skies, and the perfect spot for a relaxing early morning ride. The group began the day with a refreshing breakfast by the lakeside, followed by some amazing drone shots capturing the serene blue waters and green surroundings. Riders also took the opportunity to photograph nature and scenic landscapes, preserving the beauty of the moment. The peaceful environment, light breeze, and reflection of the hills on the water made the entire experience feel calm and refreshing — a perfect short escape from the city hustle. The Vandri Lake ride reminded everyone that sometimes the best rides aren\'t about distance, but about peace, simplicity, and pure connection with nature.',
      stats: { date: 'October 10-12, 2025', stay: 'Farmhouse,Wai' },
    },
  ];

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
            {rides.map((ride) => (
              <div
                key={ride.id}
                style={{
                  ...styles.rideCard,
                  transform: hoveredCard === ride.id ? 'translateY(-10px)' : 'translateY(0)',
                  boxShadow: hoveredCard === ride.id ? '0 20px 50px rgba(230, 57, 70, 0.3)' : '0 5px 20px rgba(0,0,0,0.1)',
                }}
                onMouseEnter={() => setHoveredCard(ride.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div style={styles.imageWrapper}>
                  <img
                    src={ride.image}
                    alt={ride.title}
                    style={{
                      ...styles.rideImage,
                      transform: hoveredCard === ride.id ? 'scale(1.1)' : 'scale(1)',
                    }}
                  />
                  <div style={styles.imageOverlay}>
                    <span style={styles.dateTag}>{ride.date}</span>
                  </div>
                </div>

                <div style={styles.cardContent} className="card-content">
                  <div style={styles.locationBadge}>
                    <span>📍</span>
                    {ride.location}
                  </div>

                  <h3 style={styles.rideTitle} className="ride-title">{ride.title}</h3>
                  <p style={styles.rideDescription} className="ride-description">{ride.description}</p>

                  <div style={styles.statsRow} className="stats-row">
                    <div style={styles.statBox} className="stat-box">
                      <div style={styles.statIcon}>📅</div>
                      <div style={styles.statLabel}>Date</div>
                      <div style={styles.statValue} className="stat-value">{ride.stats.date}</div>
                    </div>
                    <div style={styles.statBox} className="stat-box">
                      <div style={styles.statIcon}>📍</div>
                      <div style={styles.statLabel}>Location</div>
                      <div style={styles.statValue} className="stat-value">{ride.stats.stay}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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