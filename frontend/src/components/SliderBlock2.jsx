import React from 'react';

const SliderBlock2 = ({ image, testimonial, name, title }) => {
  return (
    <>
      <style>
        {`
          @media (max-width: 968px) {
            .slider-container-2 {
              flex-direction: column !important;
              min-height: auto !important;    
            }
            .slider-image-container-2 {
              flex: 0 0 300px !important;
              width: 100% !important;
              order: 1 !important;
            }
            .slider-content-2 {
              padding: 40px 30px !important;
              order: 2 !important;
            }
            .slider-testimonial-2 {
              font-size: 20px !important;
              margin-bottom: 30px !important;
            }
            .slider-name-2 {
              font-size: 28px !important;
            }
            .slider-title-2 {
              font-size: 16px !important;
            }
            .slider-quote-2 {
              font-size: 140px !important;
              right: 40px !important;
            }
          }

          @media (max-width: 768px) {
            .slider-content-2 {
              padding: 30px 25px !important;
            }
            .slider-testimonial-2 {
              font-size: 18px !important;
              margin-bottom: 25px !important;
            }
            .slider-name-2 {
              font-size: 24px !important;
            }
            .slider-title-2 {
              font-size: 15px !important;
            }
            .slider-quote-2 {
              font-size: 120px !important;
              right: 30px !important;
              bottom: 20px !important;
            }
          }

          @media (max-width: 480px) {
            .slider-image-container-2 {
              flex: 0 0 250px !important;
            }
            .slider-content-2 {
              padding: 25px 20px !important;
            }
            .slider-testimonial-2 {
              font-size: 16px !important;
              line-height: 1.5 !important;
            }
            .slider-name-2 {
              font-size: 22px !important;
            }
            .slider-title-2 {
              font-size: 14px !important;
            }
            .slider-quote-2 {
              font-size: 100px !important;
              right: 20px !important;
            }
          }
        `}
      </style>
      <div style={styles.container} className="slider-container-2">
        <div style={styles.contentContainer} className="slider-content-2">
          <p style={styles.testimonial} className="slider-testimonial-2">{testimonial}</p>
          <h3 style={styles.name} className="slider-name-2">{name}</h3>
          <p style={styles.title} className="slider-title-2">{title}</p>
          <div style={styles.quoteIcon} className="slider-quote-2">"</div>
        </div>
        <div style={styles.imageContainer} className="slider-image-container-2">
          <img src={image} alt={name} style={styles.image} />
        </div>
      </div>
    </>
  );
};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'stretch',
    maxWidth: '1400px',
    margin: '0 auto 40px auto',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    minHeight: '450px',
  },
  imageContainer: {
    flex: '0 0 40%',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  contentContainer: {
    flex: '1',
    backgroundColor: '#EF4444',
    padding: '60px 80px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    position: 'relative',
  },
  testimonial: {
    color: 'white',
    fontSize: '24px',
    fontStyle: 'italic',
    lineHeight: '1.6',
    marginBottom: '40px',
    fontWeight: '500',
    whiteSpace: 'pre-line', // This preserves line breaks from \n
  },
  name: {
    color: 'white',
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '8px',
    margin: '0',
  },
  title: {
    color: 'white',
    fontSize: '18px',
    fontWeight: '400',
    margin: '0',
  },
  quoteIcon: {
    position: 'absolute',
    bottom: '30px',
    right: '60px',
    fontSize: '180px',
    color: 'rgba(255, 255, 255, 0.2)',
    fontFamily: 'Georgia, serif',
    lineHeight: '1',
  },
};

export default SliderBlock2;