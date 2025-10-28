import React from 'react';
import Carousel from './Carousel';
import Navbar from '../components/Navbar';
import Footer from './Footer';
import img1 from "../assets/discover1.jpg"
import img3 from '../assets/discover2.jpg'
import img2 from '../assets/discover3.jpg'
import img4 from '../assets/discover4.jpg'
import img5 from '../assets/discover.jpg'
import img11 from '../assets/img11.jpg'
import img13 from '../assets/img13.jpg'
import img12 from '../assets/img12.jpg'
import img14 from '../assets/img14.jpg'
import img15 from '../assets/img15.jpg'
import img16 from '../assets/img16.jpg'
import img17 from '../assets/img17.jpg'
const GalleryPage = () => {
  const galleryImages = [
    img11,
    img16,
    img17,
    img12,
    img14,
    img13,
    img15
  ];

  return (
    <>
      <style>
        {`
          /* Tablet Responsive (768px - 1024px) */
          @media (max-width: 1024px) and (min-width: 769px) {
            .gallery-grid {
              grid-template-columns: repeat(3, 1fr) !important;
              grid-template-rows: repeat(4, 220px) !important;
              gap: 12px !important;
            }
            
            .grid-item-1 {
              grid-column: span 2 !important;
              grid-row: span 2 !important;
            }
            
            .grid-item-2 {
              grid-column: span 1 !important;
              grid-row: span 1 !important;
            }
            
            .grid-item-3 {
              grid-column: span 1 !important;
              grid-row: span 1 !important;
            }
            
            .grid-item-4 {
              grid-column: span 1 !important;
              grid-row: span 2 !important;
            }
            
            .grid-item-5 {
              grid-column: span 2 !important;
              grid-row: span 1 !important;
            }
            
            .grid-item-6 {
              grid-column: span 2 !important;
              grid-row: span 1 !important;
            }
            
            .grid-item-7 {
              grid-column: span 1 !important;
              grid-row: span 1 !important;
            }
          }
          
          /* Mobile Responsive (max-width: 768px) */
          @media (max-width: 768px) {
            .gallery-grid {
              grid-template-columns: repeat(2, 1fr) !important;
              grid-template-rows: auto !important;
              gap: 10px !important;
            }
            
            .grid-item-1 {
              grid-column: span 2 !important;
              grid-row: span 1 !important;
              height: 250px !important;
            }
            
            .grid-item-2,
            .grid-item-3,
            .grid-item-4,
            .grid-item-5,
            .grid-item-7 {
              grid-column: span 1 !important;
              grid-row: span 1 !important;
              height: 200px !important;
            }
            
            .grid-item-6 {
              grid-column: span 2 !important;
              grid-row: span 1 !important;
              height: 200px !important;
            }
            
            .grid-section {
              padding: 40px 20px !important;
            }
          }
          
          /* Small Mobile (max-width: 480px) */
          @media (max-width: 480px) {
            .gallery-grid {
              grid-template-columns: 1fr !important;
              gap: 10px !important;
            }
            
            .grid-item-1,
            .grid-item-2,
            .grid-item-3,
            .grid-item-4,
            .grid-item-5,
            .grid-item-6,
            .grid-item-7 {
              grid-column: span 1 !important;
              grid-row: span 1 !important;
              height: 250px !important;
            }
            
            .grid-section {
              padding: 30px 15px !important;
            }
          }
        `}
      </style>

      <div style={styles.pageContainer}>
        <Navbar/>
        <div style={styles.gridSection} className="grid-section">
          <div style={styles.gridContainer} className="gallery-grid">
            <div style={{...styles.imageWrapper, gridColumn: 'span 2', gridRow: 'span 2'}} className="grid-item-1">
              <img src={galleryImages[0]} alt="Bike ride 1" style={styles.gridImage} />
            </div>
            
            <div style={styles.imageWrapper} className="grid-item-2">
              <img src={galleryImages[1]} alt="Bike ride 2" style={styles.gridImage} />
            </div>
            
            <div style={styles.imageWrapper} className="grid-item-3">
              <img src={galleryImages[2]} alt="Bike ride 3" style={styles.gridImage} />
            </div>
            
            <div style={{...styles.imageWrapper, gridRow: 'span 2'}} className="grid-item-4">
              <img src={galleryImages[3]} alt="Bike ride 4" style={styles.gridImage} />
            </div>
            
            <div style={styles.imageWrapper} className="grid-item-5">
              <img src={galleryImages[4]} alt="Bike ride 5" style={styles.gridImage} />
            </div>
            
            <div style={{...styles.imageWrapper, gridColumn: 'span 2'}} className="grid-item-6">
              <img src={galleryImages[5]} alt="Bike ride 6" style={styles.gridImage} />
            </div>
            
            <div style={styles.imageWrapper} className="grid-item-7">
              <img src={galleryImages[6]} alt="Bike ride 7" style={styles.gridImage} />
            </div>
          </div>
        </div>

        <div style={styles.textSection}>
          <div style={styles.textContent}>
            <h2 style={styles.heading}>WHAT BOM IS ALL ABOUT?</h2>
            <p style={styles.paragraph}>
              Founded in July 2018, Brotherhood of Mumbai is a passionate and welcoming biking community that brings together riders with bikes above 150cc, united by their love for the open road. Led by Team Leader Kunal Mestry, the club has steadily grown to 32 official members and a strong extended family of over 160 biking enthusiasts.
            </p>
            <p style={styles.paragraph}>
              Over the past seven years, the Brotherhood of Mumbai has successfully completed 80+ rides, maintaining an impeccable record with their unwavering focus on safety and zero-accident rides. Their dedication goes beyond biking, reflecting a deep commitment to social responsibility. The group has actively contributed to society through initiatives such as donating educational supplies to children in remote tribal regions, tree plantation drives, and providing support during the COVID-19 pandemic. These efforts embody the true essence of brotherhood — riding with purpose and giving back to the community.
            </p>
            <p style={styles.paragraph}>
              The Brotherhood of Mumbai has embarked on several iconic journeys, including the unforgettable Ladakh Ride in 2022, where 16 riders conquered one of India's most breathtaking landscapes. In 2023, they explored the scenic South Coastal route covering Gokarna, Murudeshwar, and Hampi with 8 dedicated riders. Continuing their legacy, the following year witnessed an adventurous Spiti Valley Ride with 9 riders, along with a memorable Satara Ride featuring 10 participants.
            </p>
            <p style={styles.paragraph}>
              Each ride not only fuels their passion for biking but also strengthens the bond of friendship, unity, and mutual respect among members. Today, the Brotherhood of Mumbai stands as a symbol of adventure, discipline, community spirit, and camaraderie, proving that biking is not just about reaching a destination — it's about the journey, the brotherhood, and the positive impact created along the way.
            </p>
            
          </div>
        </div>

      <div style={styles.carouselSection}>
  <Carousel />
</div>
<Footer/>
      </div>
    </>
  );
};

const styles = {
  pageContainer: {
    width: '100%',
    backgroundColor: '#f5f5f5',
  },
  gridSection: {
    backgroundColor: 'white',
    padding: '60px 40px',
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gridTemplateRows: 'repeat(3, 250px)',
    gap: '15px',
    maxWidth: '1600px',
    margin: '0 auto',
  },
  imageWrapper: {
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  textSection: {
    backgroundColor: '#EF4444',
    padding: '80px 40px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContent: {
    maxWidth: '1200px',
    textAlign: 'center',
  },
  heading: {
    color: 'white',
    fontSize: 'clamp(32px, 6vw, 48px)',
    fontWeight: 'bold',
    marginBottom: '30px',
    letterSpacing: '2px',
  },
  paragraph: {
    color: 'white',
    fontSize: 'clamp(15px, 2vw, 18px)',
    lineHeight: '1.8',
    marginBottom: '25px',
    textAlign: 'center',
  },
  carouselSection: {
    backgroundColor: '#f5f5f5',
    padding: '60px 0',
  },
  carouselPlaceholder: {
    height: '400px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e5e5e5',
    margin: '0 40px',
    borderRadius: '12px',
  },
};

export default GalleryPage;