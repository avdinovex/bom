import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import api from "../services/api";

import bgImage from "../assets/testimonial.png";

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await api.get('/testimonials');
      setTestimonials(response.data.data);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  const settings = {
    dots: true,
    infinite: testimonials.length > 1,
    autoplay: testimonials.length > 1,
    autoplaySpeed: 4000,
    arrows: false,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: "#fff" }}>
        <section style={styles.section} className="testimonials-section">
          <h5 style={styles.subheading}>❮❮ PARTICIPANTS ❯❯</h5>
          <h2 style={styles.heading}>REVIEWS FROM OUR PARTICIPANTS</h2>
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
            <p style={{ color: '#fff', marginTop: '20px' }}>Loading testimonials...</p>
          </div>
        </section>
      </div>
    );
  }

  if (testimonials.length === 0) {
    return (
      <div style={{ backgroundColor: "#fff" }}>
        <section style={styles.section} className="testimonials-section">
          <h5 style={styles.subheading}>❮❮ PARTICIPANTS ❯❯</h5>
          <h2 style={styles.heading}>REVIEWS FROM OUR PARTICIPANTS</h2>
          <p style={{ color: '#fff', marginTop: '30px', textAlign: 'center' }}>
            No testimonials available at the moment.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#fff" }}>
      <section style={styles.section} className="testimonials-section">
        <h5 style={styles.subheading}>❮❮ PARTICIPANTS ❯❯</h5>
        <h2 style={styles.heading}>REVIEWS FROM OUR PARTICIPANTS</h2>

        <Slider {...settings} style={{ marginTop: "50px" }}>
          {testimonials.map((t, index) => (
            <div key={t._id || index} style={styles.slide}>
              <div style={styles.testimonial} className="testimonial-content">
                <img src={t.image} alt={t.name} style={styles.avatar} className="testimonial-avatar" />
                <div className="testimonial-text">
                  <div style={styles.stars}>
                    {"★".repeat(t.rating)}
                  </div>
                  <p style={styles.review}>{t.review}</p>
                  <h3 style={styles.name}>{t.name}</h3>
                  {t.role && <p style={styles.role}>{t.role}</p>}
                </div>
              </div>
            </div>
          ))}
        </Slider>

        <img
          src={bgImage}
          alt="decorative bottom"
          style={styles.bottomImage}
          className="testimonials-bg-image"
        />
      </section>
    </div>
  );
};

const styles = {
  section: {
    backgroundColor: "#111",
    color: "#fff",
    textAlign: "center",
    padding: "100px 40px 120px",
    position: "relative",
    overflow: "hidden",
  },
  subheading: {
    color: "#ff004f",
    fontWeight: "bold",
    letterSpacing: "2px",
    marginBottom: "10px",
    fontSize: "clamp(12px, 2vw, 14px)",
  },
  heading: {
    fontSize: "clamp(28px, 5vw, 42px)",
    fontWeight: "800",
    padding: "0 20px",
  },
  slide: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "0 20px",
  },
  testimonial: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "40px",
    maxWidth: "900px",
    margin: "0 auto",
    flexWrap: "wrap",
  },
  avatar: {
    width: "200px",
    height: "200px",
    borderRadius: "50%",
    objectFit: "cover",
    flexShrink: 0,
  },
  stars: {
    color: "#ffb400",
    fontSize: "clamp(18px, 3vw, 22px)",
  },
  review: {
    fontStyle: "italic",
    lineHeight: "1.6",
    margin: "15px 0",
    fontSize: "clamp(14px, 2vw, 16px)",
    textAlign: "left",
  },
  name: {
    fontSize: "clamp(18px, 3vw, 22px)",
    fontWeight: "700",
    textAlign: "left",
  },
  role: {
    color: "#ccc",
    fontSize: "clamp(13px, 2vw, 15px)",
    textAlign: "left",
  },
  bottomImage: {
    width: "100%",
    position: "absolute",
    bottom: "0",
    left: "0",
    pointerEvents: "none",
  },
};

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.innerHTML = `
    @media (max-width: 768px) {
      .testimonials-section {
        padding: 60px 20px 80px !important;
        margin-top: 40px !important;
      }
      .testimonial-content {
        flex-direction: column !important;
        gap: 25px !important;
        text-align: center !important;
      }
      .testimonial-avatar {
        width: 150px !important;
        height: 150px !important;
      }
      .testimonial-text {
        text-align: center !important;
      }
      .testimonial-text p,
      .testimonial-text h3 {
        text-align: center !important;
      }
      .testimonials-bg-image {
        height: 80px;
        object-fit: cover;
      }
    }
    
    @media (max-width: 480px) {
      .testimonials-section {
        padding: 40px 15px 60px !important;
      }
      .testimonial-content {
        gap: 20px !important;
      }
      .testimonial-avatar {
        width: 120px !important;
        height: 120px !important;
      }
      .testimonials-bg-image {
        height: 60px;
      }
    }
    
    .slick-dots {
      bottom: -40px !important;
    }
    
    .slick-dots li button:before {
      color: #ff004f !important;
      font-size: 10px !important;
    }
    
    .slick-dots li.slick-active button:before {
      color: #ff004f !important;
    }
    
    @media (max-width: 768px) {
      .slick-dots {
        bottom: -30px !important;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default Testimonials;
