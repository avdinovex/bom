import React, { useState, useEffect } from 'react';

// Import images
import Amit from "../assets/Amit Gala.jpg"
import Chand from "../assets/Chand.jpg"
import Deep from "../assets/Deep Shah.jpg"
import Dipesh from "../assets/Dipesh lale.jpg"
import Ketan from "../assets/Ketan.jpg"
import Krutali from "../assets/Krutali naik.jpg"
import Kuldeep from "../assets/Kuldeep Singh.jpg"
import Kunal from "../assets/Kunal Jadhav.jpg"
import Mandar from "../assets/Mandar Rane.jpg"
import Manthan from "../assets/Manthan Vichare.jpg"
import Narinder from "../assets/Narinder singh kalsi.png"
import Nikhil from "../assets/Nikhil Naik.jpg"
import Parth from "../assets/Parth Patil.jpg"
import Prasad from "../assets/Prasad Sanas.jpg"
import Prashant from "../assets/Prashant Chalke.jpg"
import Priyanka from "../assets/Priyanka Parab.jpg"
import Rohit from "../assets/Rohit Kulkarni.jpg"
import Sagar from "../assets/Sagar Sharma.jpg"
import Samruddhi from "../assets/Samruddhi Rane.jpg"
import Sarvesh from "../assets/Sarvesh Dewalkar.jpg"
import Shantanu from "../assets/Shantanu Vartak.jpg"
import Swarup from "../assets/Swarup patil.jpg"

const members = [
  { id: 1, name: "Amit Gala",  instagram: "https://www.instagram.com/dr_amitgala_urologist?igsh=MXVoOW1jbnJpbGJlMg==",  image: Amit },
  { id: 2, name: "Chand", instagram: "https://instagram.com/chand",  image: Chand },   //no insta link
  { id: 3, name: "Deep Shah",  instagram: "https://www.instgaram.com/kamehameha612", image: Deep },
  { id: 4, name: "Dipesh Lale", instagram: "https://www.instagram.com/dipeshlale?igsh=MXQ5cm12MWJ4OG9nMg==", image: Dipesh },
  { id: 5, name: "Ketan",  instagram: "https://www.instagram.com/k2_snaps?igsh=MW0wbWlnZTYyaXQ5bg==", image: Ketan },
  { id: 6, name: "Krutali Naik",  instagram: "https://instagram.com/krutalinaik",  image: Krutali },  // no insta link
  { id: 7, name: "Kuldeep Singh",  instagram: "https://www.instagram.com/kuldeepsingh.sohal?igsh=MWljZ3VnMjYyNTRtcg==",  image: Kuldeep },
  { id: 8, name: "Kunal Jadhav", instagram: "https://www.instagram.com/ride_along_kunal?igsh=MWw0ZDJkaWNwZjQzNA==", youtube: " https://www.youtube.com/@RideAlongKunal", image: Kunal },
  { id: 9, name: "Mandar Rane", instagram: "https://instagram.com/mandarrane", image: Mandar },  // link nhi hai only insta account handle hai 
  { id: 10, name: "Manthan Vichare",  instagram: "https://www.instagram.com/_manthan_99?igsh=cnJwZG12dHphc2Jj", image: Manthan },
  { id: 11, name: "Narinder Singh Kalsi",  instagram: "https://instagram.com/narindersinghkalsi",  image: Narinder },   // no insta link
  { id: 12, name: "Nikhil Naik", instagram: "https://instagram.com/nikhilnaik",  image: Nikhil },  // no link
  { id: 13, name: "Parth Patil", instagram: "https://www.instagram.com/parthpatil__24?igsh=MTJ1dWljdmJveDB1Nw==", image: Parth },
  { id: 14, name: "Prasad Sanas",  instagram: "https://www.instagram.com/sanasganesh.sanasd9?igsh=dmVmZDZ5cmVpc2ky",  image: Prasad },
  { id: 15, name: "Prashant Chalke",instagram: "https://www.instagram.com/cruising_rider?igsh=MW10Y2ZpZ2xqbDlwaA==",youtube:"https://youtube.com/@cruising_rider?si=vpN9bgekH_v6ljqu", image: Prashant },
  { id: 16, name: "Priyanka Parab", instagram: "https://www.instagram.com/pri_chops?igsh=MmE0ZTk0emVma3J3",  image: Priyanka },
  { id: 17, name: "Rohit Kulkarni",  instagram: "https://www.instagram.com/_.rohitkulkarni._?igsh=c3lrOTJxY2Zxa2Fz",  image: Rohit },
  { id: 18, name: "Sagar Sharma", instagram: "https://www.instagram.com/jimlaurac_ss?igsh=NHdsZG1mdDgzY3hm",  image: Sagar },
  { id: 19, name: "Samruddhi Rane",  instagram: "https://www.instagram.com/samu.sawant?igsh=MXNqM21lMWZxb21mdA==e", image: Samruddhi },
  { id: 20, name: "Sarvesh Dewalkar", instagram: "https://www.instagram.com/mh02deva?igsh=MXAwdXpmZnYxczBrMA==",  image: Sarvesh },
  { id: 21, name: "Shantanu Vartak", instagram: "https://www.instagram.com/shon___06?igsh=MnBjNWJkN3Znd3Fy&utm_source=qr",  image: Shantanu },
  { id: 22, name: "Swarup Patil",  instagram: "https://instagram.com/swaruppatil", youtube:"https://youtube.com/@swaruppatil7117?si=_9j3q_3hVGBjFfHF",  image: Swarup },    //no active link
];

const ChevronLeft = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

const ChevronRight = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const YoutubeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export default function MembersCarousel() {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    if (!autoplay) return;
    
    const interval = setInterval(() => {
      handleNext();
    }, 4000);

    return () => clearInterval(interval);
  }, [current, autoplay]);

  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setAutoplay(false);
    setCurrent((prev) => (prev === 0 ? members.length - 1 : prev - 1));
    setTimeout(() => setIsAnimating(false), 700);
  };

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrent((prev) => (prev === members.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsAnimating(false), 700);
  };

  const getCardStyle = (index) => {
    const diff = index - current;
    const absPos = Math.abs(diff);
    
    if (absPos > 2) return { display: 'none' };
    
    let transform = '';
    let zIndex = 0;
    let opacity = 0;
    let filter = 'blur(0px) brightness(1)';
    
    if (diff === 0) {
      transform = 'translateX(0%) translateZ(0px) rotateY(0deg) scale(1.1)';
      zIndex = 10;
      opacity = 1;
      filter = 'blur(0px) brightness(1)';
    } else if (diff === -1) {
      transform = 'translateX(-90%) translateZ(-300px) rotateY(30deg) scale(0.8)';
      zIndex = 5;
      opacity = 0.6;
      filter = 'blur(1.5px) brightness(0.7)';
    } else if (diff === 1) {
      transform = 'translateX(90%) translateZ(-300px) rotateY(-30deg) scale(0.8)';
      zIndex = 5;
      opacity = 0.6;
      filter = 'blur(1.5px) brightness(0.7)';
    } else if (diff === -2) {
      transform = 'translateX(-150%) translateZ(-500px) rotateY(40deg) scale(0.65)';
      zIndex = 1;
      opacity = 0.3;
      filter = 'blur(3px) brightness(0.5)';
    } else if (diff === 2) {
      transform = 'translateX(150%) translateZ(-500px) rotateY(-40deg) scale(0.65)';
      zIndex = 1;
      opacity = 0.3;
      filter = 'blur(3px) brightness(0.5)';
    }
    
    return {
      transform,
      zIndex,
      opacity,
      filter,
      transition: 'all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      pointerEvents: diff === 0 ? 'auto' : 'none'
    };
  };

  return (
    <>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }

          .carousel-button:hover {
            background: rgba(255, 71, 87, 0.9) !important;
            border-color: rgba(255, 71, 87, 1) !important;
            transform: translateY(-50%) scale(1.1) !important;
            box-shadow: 0 0 30px rgba(255, 71, 87, 0.6) !important;
          }

          .carousel-button:active {
            transform: translateY(-50%) scale(0.95) !important;
          }

          .member-card:hover .card-shine {
            opacity: 1 !important;
          }

          .progress-dot {
            transition: all 0.3s ease;
          }

          .progress-dot:hover {
            transform: scale(1.3);
            background: #ff4757 !important;
          }

          .social-icon:hover {
            transform: scale(1.15);
            background: rgba(255, 255, 255, 0.25) !important;
          }

          @media (max-width: 1200px) {
            .member-card {
              width: 340px !important;
              height: 480px !important;
            }
          }

          @media (max-width: 968px) {
            .member-card {
              width: 300px !important;
              height: 440px !important;
            }
            .carousel-button {
              width: 55px !important;
              height: 55px !important;
            }
            .carousel-button svg {
              width: 24px !important;
              height: 24px !important;
            }
          }

          @media (max-width: 768px) {
            .carousel-wrapper {
              perspective: 1500px !important;
            }
            .member-card {
              width: 270px !important;
              height: 400px !important;
            }
            .carousel-button-left {
              left: 20px !important;
            }
            .carousel-button-right {
              right: 20px !important;
            }
          }

          @media (max-width: 480px) {
            .carousel-wrapper {
              perspective: 1200px !important;
            }
            .member-card {
              width: 250px !important;
              height: 370px !important;
              border-radius: 16px !important;
            }
            .card-content {
              padding: 25px 20px !important;
            }
            .carousel-button {
              width: 48px !important;
              height: 48px !important;
            }
            .carousel-button svg {
              width: 20px !important;
              height: 20px !important;
            }
            .carousel-button-left {
              left: 15px !important;
            }
            .carousel-button-right {
              right: 15px !important;
            }
            .carousel-header h1 {
              font-size: 2rem !important;
            }
            .carousel-header p {
              font-size: 0.9rem !important;
            }
          }
        `}
      </style>

      <div style={styles.container}>
        {/* Animated Background */}
        <div style={styles.background}>
          <div style={styles.bgPattern}></div>
          <div style={styles.overlay}></div>
        </div>

        {/* Header Section */}
        <div style={styles.header} className="carousel-header">
          <h1 style={styles.headerTitle}>OUR BROTHERHOOD</h1>
          <p style={styles.headerSubtitle}>Meet the riders who make the brotherhood legendary</p>
          <div style={styles.headerDivider}></div>
        </div>

        {/* Carousel */}
        <div style={styles.carouselWrapper} className="carousel-wrapper">
          <div style={styles.carousel}>
            {members.map((member, index) => (
              <div
                key={member.id}
                style={{
                  ...styles.card,
                  ...getCardStyle(index)
                }}
                className="member-card"
              >
                <img 
                  src={member.image} 
                  alt={member.name}
                  style={styles.cardImage}
                />
                <div style={styles.cardGradient}></div>
                <div style={styles.cardShine} className="card-shine"></div>
                
                {/* Card Content */}
                <div style={styles.cardContent} className="card-content">
                  <h2 style={styles.memberName}>{member.name}</h2>
                  <div style={styles.divider}></div>
                  {/* <p style={styles.motto}>"{member.motto}"</p> */}
                  
                  {/* Social Icons */}
                  <div style={styles.socialIcons}>
                    <a 
                      href={member.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={styles.socialIcon}
                      className="social-icon"
                    >
                      <InstagramIcon />
                    </a>
                    <a 
                      href={member.youtube} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={styles.socialIcon}
                      className="social-icon"
                    >
                      <YoutubeIcon />
                    </a>
                  </div>
                </div>

                {/* Border Glow */}
                <div style={styles.borderGlow}></div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <button 
            onClick={handlePrev} 
            style={{...styles.navButton, ...styles.navLeft}}
            disabled={isAnimating}
            className="carousel-button carousel-button-left"
            onMouseEnter={() => setAutoplay(false)}
          >
            <ChevronLeft />
          </button>
          
          <button 
            onClick={handleNext} 
            style={{...styles.navButton, ...styles.navRight}}
            disabled={isAnimating}
            className="carousel-button carousel-button-right"
            onMouseEnter={() => setAutoplay(false)}
          >
            <ChevronRight />
          </button>
        </div>

        {/* Progress Indicators */}
        <div style={styles.progressBar}>
          {members.map((_, index) => (
            <div
              key={index}
              onClick={() => {
                if (!isAnimating) {
                  setIsAnimating(true);
                  setAutoplay(false);
                  setCurrent(index);
                  setTimeout(() => setIsAnimating(false), 700);
                }
              }}
              style={{
                ...styles.progressDot,
                background: index === current ? '#ff4757' : 'rgba(255, 255, 255, 0.3)',
                width: index === current ? '40px' : '10px'
              }}
              className="progress-dot"
            />
          ))}
        </div>
      </div>
    </>
  );
}

const styles = {
  container: {
    width: '100vw',
    minHeight: '100vh',
    overflow: 'hidden',
    position: 'relative',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    background: '#0a0a0a',
    display: 'flex',
    flexDirection: 'column',
    paddingTop: '80px'
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 0
  },
  bgPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle at 20% 50%, rgba(255, 71, 87, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 71, 87, 0.1) 0%, transparent 50%)',
    animation: 'pulse 8s ease-in-out infinite'
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(180deg, rgba(10,10,10,0.7) 0%, rgba(10,10,10,0.95) 100%)'
  },
  header: {
    position: 'relative',
    zIndex: 2,
    textAlign: 'center',
    padding: '40px 20px 30px',
    marginBottom: '20px'
  },
  headerTitle: {
    fontSize: 'clamp(2.5rem, 5vw, 4rem)',
    fontWeight: '900',
    color: '#ffffff',
    margin: '0 0 15px 0',
    letterSpacing: '4px',
    textTransform: 'uppercase',
    textShadow: '0 0 30px rgba(255, 71, 87, 0.5)'
  },
  headerSubtitle: {
    fontSize: 'clamp(1rem, 2vw, 1.2rem)',
    color: 'rgba(255, 255, 255, 0.7)',
    margin: '0',
    letterSpacing: '2px',
    fontWeight: '300'
  },
  headerDivider: {
    width: '80px',
    height: '4px',
    background: 'linear-gradient(90deg, transparent, #ff4757, transparent)',
    margin: '25px auto 0',
    borderRadius: '2px'
  },
  carouselWrapper: {
    position: 'relative',
    flex: 1,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    perspective: '2000px',
    zIndex: 1,
    minHeight: '550px'
  },
  carousel: {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transformStyle: 'preserve-3d'
  },
  card: {
    position: 'absolute',
    width: '380px',
    height: '400px',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 30px 80px rgba(0,0,0,0.9)',
    transformStyle: 'preserve-3d',
    cursor: 'pointer'
  },
  cardImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.5s ease'
  },
  cardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 60%, rgba(10,10,10,0.95) 100%)',
    zIndex: 1
  },
  cardShine: {
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
    transform: 'rotate(45deg)',
    opacity: 0,
    transition: 'opacity 0.5s ease',
    zIndex: 2,
    pointerEvents: 'none'
  },
  borderGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    border: '2px solid transparent',
    borderRadius: '20px',
    background: 'linear-gradient(135deg, rgba(255,71,87,0.5), transparent) border-box',
    WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',
    zIndex: 3,
    pointerEvents: 'none'
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '35px 30px',
    color: 'white',
    zIndex: 4
  },
  memberName: {
    fontSize: 'clamp(1.6rem, 3vw, 2rem)',
    fontWeight: '800',
    margin: '0 0 12px 0',
    letterSpacing: '1px',
    textShadow: '2px 2px 10px rgba(0,0,0,0.8)',
    lineHeight: '1.2'
  },
  divider: {
    width: '50px',
    height: '3px',
    background: '#ff4757',
    margin: '12px 0',
    borderRadius: '2px'
  },
  motto: {
    fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)',
    fontWeight: '300',
    fontStyle: 'italic',
    margin: '0 0 15px 0',
    opacity: 0.95,
    letterSpacing: '0.5px',
    lineHeight: '1.5'
  },
  socialIcons: {
    display: 'flex',
    gap: '12px',
    marginTop: '12px'
  },
  socialIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.15)',
    color: 'white',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '2px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '50%',
    width: '65px',
    height: '65px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'white',
    backdropFilter: 'blur(15px)',
    transition: 'all 0.3s ease',
    zIndex: 20,
    outline: 'none'
  },
  navLeft: {
    left: '40px'
  },
  navRight: {
    right: '40px'
  },
  progressBar: {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    padding: '30px 20px',
    flexWrap: 'wrap'
  },
  progressDot: {
    height: '10px',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  }
};