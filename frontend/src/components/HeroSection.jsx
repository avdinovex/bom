
import React, { useState, useEffect } from "react";
import hero1 from "../assets/hero1.jpg";

const HomeSection = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsVisible(true);
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body, html {
            overflow-x: hidden;
            font-family: 'Rajdhani', sans-serif;
          }

          @keyframes fadeInUp {
            from { 
              opacity: 0; 
              transform: translateY(60px);
            }
            to { 
              opacity: 1; 
              transform: translateY(0);
            }
          }

          @keyframes glow {
            0%, 100% { 
              text-shadow: 0 0 20px rgba(255, 71, 87, 0.6),
                           0 0 40px rgba(255, 71, 87, 0.4),
                           0 0 60px rgba(255, 71, 87, 0.2);
            }
            50% { 
              text-shadow: 0 0 30px rgba(255, 71, 87, 0.9),
                           0 0 60px rgba(255, 71, 87, 0.6),
                           0 0 90px rgba(255, 71, 87, 0.3);
            }
          }

          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }

          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.8; }
          }

          @keyframes slideDown {
            0% { transform: translateY(-100%); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }

          @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
          }

          .hero-visible .content-wrapper {
            animation: fadeInUp 1.2s ease-out forwards;
          }

          .hero-visible .badge {
            animation: slideDown 0.8s ease-out 0.2s forwards;
          }

          .hero-visible .main-heading {
            animation: fadeInUp 1s ease-out 0.4s forwards;
          }

          .hero-visible .description {
            animation: fadeInUp 1s ease-out 0.6s forwards;
          }

          .hero-visible .cta-buttons {
            animation: fadeInUp 1s ease-out 0.8s forwards;
          }

          .hero-visible .stats-grid {
            animation: fadeInUp 1s ease-out 1s forwards;
          }

          .btn-primary {
            position: relative;
            overflow: hidden;
          }

          .btn-primary::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            transition: left 0.5s;
          }

          .btn-primary:hover::before {
            left: 100%;
          }

                      @media (max-width: 968px) {
            .hero-section {
              padding: 60px 20px !important;
            }
            
            .main-heading {
              font-size: 3rem !important;
            }
          }

          @media (max-width: 640px) {
            .main-heading {
              font-size: 2.5rem !important;
            }

            .description {
              font-size: 1rem !important;
            }

            .cta-buttons {
              flex-direction: column !important;
            }

            .btn {
              width: 100% !important;
            }
          }
        `}
      </style>

      <section 
        className={`hero-section ${isVisible ? 'hero-visible' : ''}`}
        style={{
          position: "relative",
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          padding: "80px 40px",
        }}
      >
        {/* Background Image with Parallax */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
        }}>
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${hero1})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
            transform: `scale(${1 + scrollY * 0.0003}) translateY(${scrollY * 0.5}px)`,
            transition: "transform 0.1s ease-out",
          }} />
          
          {/* Multi-layer Overlay */}
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "linear-gradient(135deg, rgba(0, 0, 0, 0.85) 0%, rgba(10, 10, 10, 0.7) 50%, rgba(255, 71, 87, 0.15) 100%)",
          }} />
          
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "radial-gradient(circle at 30% 50%, rgba(255, 71, 87, 0.2) 0%, transparent 50%)",
          }} />
        </div>

        {/* Animated Grid Pattern */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(rgba(255, 71, 87, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 71, 87, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          opacity: 0.4,
          transform: `translate(${mousePos.x * 0.02}px, ${mousePos.y * 0.02}px)`,
          transition: "transform 0.3s ease-out",
          zIndex: 0,
        }} />

        {/* Floating Orbs */}
        <div style={{
          position: "absolute",
          top: "15%",
          left: "10%",
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(255, 71, 87, 0.25) 0%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(100px)",
          animation: "float 10s ease-in-out infinite",
          zIndex: 0,
        }} />
        
        <div style={{
          position: "absolute",
          bottom: "15%",
          right: "10%",
          width: "500px",
          height: "500px",
          background: "radial-gradient(circle, rgba(255, 71, 87, 0.2) 0%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(100px)",
          animation: "float 12s ease-in-out infinite reverse",
          zIndex: 0,
        }} />

        {/* Content Container */}
        <div 
          className="content-wrapper"
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "1200px",
            margin: "0 auto",
            textAlign: "center",
            zIndex: 1,
            opacity: 0,
          }}
        >
          {/* Badge */}
          <div 
            className="badge"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 28px",
              background: "rgba(255, 71, 87, 0.15)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 71, 87, 0.4)",
              borderRadius: "50px",
              marginBottom: "40px",
              opacity: 0,
            }}
          >
            <span style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: "#ff4757",
              animation: "pulse 2s ease-in-out infinite",
              boxShadow: "0 0 20px rgba(255, 71, 87, 0.8)",
            }} />
            <span style={{
              color: "#ff4757",
              fontSize: "0.9rem",
              fontWeight: "600",
              letterSpacing: "3px",
              textTransform: "uppercase",
            }}>
              Adventure Awaits
            </span>
          </div>

          {/* Main Heading */}
          <h1 
            className="main-heading"
            style={{
              fontSize: "5.5rem",
              fontWeight: "700",
              lineHeight: "1.1",
              marginBottom: "30px",
              color: "#ffffff",
              letterSpacing: "-3px",
              opacity: 0,
            }}
          >
            Conquer The
            <span style={{
              display: "block",
              background: "linear-gradient(135deg, #ff4757 0%, #ff8a9b 50%, #ff4757 100%)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "glow 3s ease-in-out infinite, shimmer 3s linear infinite",
              marginTop: "10px",
            }}>
              Open Road
            </span>
            <span style={{ display: "block", marginTop: "10px" }}>
              Together
            </span>
          </h1>

          {/* Description */}
          <p 
            className="description"
            style={{
              fontSize: "1.3rem",
              lineHeight: "1.9",
              color: "#e0e0e0",
              marginBottom: "50px",
              maxWidth: "700px",
              margin: "0 auto 50px",
              opacity: 0,
              textShadow: "0 2px 20px rgba(0, 0, 0, 0.8)",
            }}
          >
            Join a community of passionate riders exploring breathtaking routes. 
            Every journey tells a story, every mile brings adventure.
          </p>

          {/* CTA Buttons */}
          <div 
            className="cta-buttons"
            style={{
              display: "flex",
              gap: "20px",
              justifyContent: "center",
              opacity: 0,
              flexWrap: "wrap",
            }}
          >
            <button
              className="btn btn-primary"
              style={{
                padding: "20px 50px",
                fontSize: "1.05rem",
                fontWeight: "600",
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "#ffffff",
                background: "linear-gradient(135deg, #ff4757 0%, #ff3345 100%)",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                transition: "all 0.4s ease",
                boxShadow: "0 15px 40px rgba(255, 71, 87, 0.4), 0 5px 15px rgba(0, 0, 0, 0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px) scale(1.05)";
                e.currentTarget.style.boxShadow = "0 20px 50px rgba(255, 71, 87, 0.6), 0 10px 20px rgba(0, 0, 0, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow = "0 15px 40px rgba(255, 71, 87, 0.4), 0 5px 15px rgba(0, 0, 0, 0.3)";
              }}
            >
              Watch Video
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div style={{
          position: "absolute",
          bottom: "1px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "5px",
          opacity: 0.7,
          zIndex: 1,
        }}>
          <span style={{
            fontSize: "0.75rem",
            color: "#b0b0b0",
            textTransform: "uppercase",
            letterSpacing: "3px",
            fontWeight: "600",
          }}>
            Scroll
          </span>
          <div style={{
            width: "2px",
            height: "50px",
            background: "linear-gradient(180deg, transparent 0%, #ff4757 50%, transparent 100%)",
            animation: "float 2.5s ease-in-out infinite",
          }} />
        </div>
      </section>
    </>
  );
};

export default HomeSection;