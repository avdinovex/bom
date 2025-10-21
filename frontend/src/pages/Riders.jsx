
import React, { useState, useEffect } from 'react';
import { Instagram, Youtube } from 'lucide-react';

// Import images
import Amit from "../assets/Amit Gala.jpg";
import Chand from "../assets/Chand.jpg";
import Deep from "../assets/Deep Shah.jpg";
import Dipesh from "../assets/Dipesh lale.jpg";
import Ketan from "../assets/Ketan.jpg";
import Krutali from "../assets/Krutali naik.jpg";
import Kuldeep from "../assets/Kuldeep Singh.jpg";
import Kunal from "../assets/Kunal Jadhav.jpg";
import Mandar from "../assets/Mandar Rane.jpg";
import Manthan from "../assets/Manthan Vichare.jpg";
import Narinder from "../assets/Narinder singh kalsi.png";
import Nikhil from "../assets/Nikhil Naik.jpg";
import Parth from "../assets/Parth Patil.jpg";
import Prasad from "../assets/Prasad Sanas.jpg";
import Prashant from "../assets/Prashant Chalke.jpg";
import Priyanka from "../assets/Priyanka Parab.jpg";
import Rohit from "../assets/Rohit Kulkarni.jpg";
import Sagar from "../assets/Sagar Sharma.jpg";
import Samruddhi from "../assets/Samruddhi Rane.jpg";
import Sarvesh from "../assets/Sarvesh Dewalkar.jpg";
import Shantanu from "../assets/Shantanu Vartak.jpg";
import Swarup from "../assets/Swarup patil.jpg";
import Sameet from '../assets/Sameet.jpeg';

const members = [
  { id: 1, name: "Amit Gala", instagram: "https://www.instagram.com/dr_amitgala_urologist?igsh=MXVoOW1jbnJpbGJlMg==", image: Amit },
  { id: 2, name: "Chand", instagram: "https://instagram.com/chand", image: Chand },
  { id: 3, name: "Deep Shah", instagram: "https://www.instgaram.com/kamehameha612", image: Deep },
  { id: 4, name: "Dipesh Lale", instagram: "https://www.instagram.com/dipeshlale?igsh=MXQ5cm12MWJ4OG9nMg==", image: Dipesh },
  { id: 5, name: "Ketan", instagram: "https://www.instagram.com/k2_snaps?igsh=MW0wbWlnZTYyaXQ5bg==", image: Ketan },
  { id: 6, name: "Krutali Naik", instagram: "https://instagram.com/krutalinaik", image: Krutali },
  { id: 7, name: "Kuldeep Singh", instagram: "https://www.instagram.com/kuldeepsingh.sohal?igsh=MWljZ3VnMjYyNTRtcg==", image: Kuldeep },
  { id: 8, name: "Kunal Jadhav", instagram: "https://www.instagram.com/ride_along_kunal?igsh=MWw0ZDJkaWNwZjQzNA==", youtube: "https://www.youtube.com/@RideAlongKunal", image: Kunal },
  { id: 9, name: "Mandar Rane", instagram: "https://instagram.com/mandarrane", image: Mandar },
  { id: 10, name: "Manthan Vichare", instagram: "https://www.instagram.com/_manthan_99?igsh=cnJwZG12dHphc2Jj", image: Manthan },
  { id: 11, name: "Narinder Singh", instagram: "https://instagram.com/narindersinghkalsi", image: Narinder },
  { id: 12, name: "Nikhil Naik", instagram: "https://instagram.com/nikhilnaik", image: Nikhil },
  { id: 13, name: "Parth Patil", instagram: "https://www.instagram.com/parthpatil__24?igsh=MTJ1dWljdmJveDB1Nw==", image: Parth },
  { id: 14, name: "Prasad Sanas", instagram: "https://www.instagram.com/sanasganesh.sanasd9?igsh=dmVmZDZ5cmVpc2ky", image: Prasad },
  { id: 15, name: "Prashant Chalke", instagram: "https://www.instagram.com/cruising_rider?igsh=MW10Y2ZpZ2xqbDlwaA==", youtube: "https://youtube.com/@cruising_rider?si=vpN9bgekH_v6ljqu", image: Prashant },
  { id: 16, name: "Priyanka Parab", instagram: "https://www.instagram.com/pri_chops?igsh=MmE0ZTk0emVma3J3", image: Priyanka },
  { id: 17, name: "Rohit Kulkarni", instagram: "https://www.instagram.com/_.rohitkulkarni._?igsh=c3lrOTJxY2Zxa2Fz", image: Rohit },
  { id: 18, name: "Sagar Sharma", instagram: "https://www.instagram.com/jimlaurac_ss?igsh=NHdsZG1mdDgzY3hm", image: Sagar },
  { id: 19, name: "Samruddhi Rane", instagram: "https://www.instagram.com/samu.sawant?igsh=MXNqM21lMWZxb21mdA==", image: Samruddhi },
  { id: 20, name: "Sarvesh Dewalkar", instagram: "https://www.instagram.com/mh02deva?igsh=MXAwdXpmZnYxczBrMA==", image: Sarvesh },
  { id: 21, name: "Shantanu Vartak", instagram: "https://www.instagram.com/shon___06?igsh=MnBjNWJkN3Znd3Fy&utm_source=qr", image: Shantanu },
  { id: 22, name: "Swarup Patil", instagram: "https://instagram.com/swaruppatil", youtube: "https://youtube.com/@swaruppatil7117?si=_9j3q_3hVGBjFfHF", image: Swarup },
  { id: 23, name: "Sameet Raut", instagram: "https://www.instagram.com/samsameetsam?igsh=MTQxaDN2aHo2aHF4eQ==", image: Sameet }
];

export default function Riders() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredId, setHoveredId] = useState(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % members.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handleMemberClick = (index) => {
    setActiveIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: '#ffffff',
      padding: '4rem 2rem',
      position: 'relative'
    }}>
      {/* Subtle Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.03) 1px, transparent 0)',
        backgroundSize: '40px 40px',
        opacity: 0.4
      }}></div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{
            display: 'inline-block',
            padding: '0.6rem 2rem',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '50px',
            marginBottom: '1.5rem'
          }}>
            <span style={{
              color: '#ef4444',
              fontSize: '0.85rem',
              fontWeight: '600',
              letterSpacing: '0.15em',
              textTransform: 'uppercase'
            }}>
              The Brotherhood
            </span>
          </div>
          
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: '700',
            color: '#1a1a1a',
            marginBottom: '1rem',
            letterSpacing: '0.02em'
          }}>
            OUR RIDERS
          </h1>
          
          <div style={{
            width: '60px',
            height: '3px',
            background: '#ef4444',
            margin: '0 auto'
          }}></div>
        </div>

        {/* Featured Member Circle */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '4rem'
        }}>
          <div style={{
            position: 'relative',
            width: '300px',
            height: '300px'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '4px solid #ef4444',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
              position: 'relative'
            }}>
              <img 
                src={members[activeIndex].image}
                alt={members[activeIndex].name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent 50%)'
              }}></div>

              <div style={{
                position: 'absolute',
                bottom: '0',
                left: '0',
                right: '0',
                padding: '1.5rem',
                textAlign: 'center'
              }}>
                <h2 style={{
                  fontSize: '1.4rem',
                  fontWeight: '600',
                  color: 'white',
                  marginBottom: '1rem',
                  textShadow: '2px 2px 8px rgba(0,0,0,0.8)'
                }}>
                  {members[activeIndex].name}
                </h2>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '0.8rem'
                }}>
                  {members[activeIndex].instagram && (
                    <a
                      href={members[activeIndex].instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.9)',
                        color: '#ec4899',
                        textDecoration: 'none',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                        transition: 'all 0.3s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                        e.currentTarget.style.background = '#ec4899';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                        e.currentTarget.style.color = '#ec4899';
                      }}
                    >
                      <Instagram size={18} />
                    </a>
                  )}
                  {members[activeIndex].youtube && (
                    <a
                      href={members[activeIndex].youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.9)',
                        color: '#dc2626',
                        textDecoration: 'none',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                        transition: 'all 0.3s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                        e.currentTarget.style.background = '#dc2626';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                        e.currentTarget.style.color = '#dc2626';
                      }}
                    >
                      <Youtube size={18} />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Decorative Ring */}
            <div style={{
              position: 'absolute',
              top: '-15px',
              left: '-15px',
              right: '-15px',
              bottom: '-15px',
              borderRadius: '50%',
              border: '2px dashed rgba(239, 68, 68, 0.2)',
              animation: 'rotate 30s linear infinite',
              pointerEvents: 'none'
            }}></div>
          </div>
        </div>

        {/* All Riders Grid - Circles */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
          gap: '2rem',
          justifyItems: 'center',
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          {members.map((member, index) => (
            <div
              key={member.id}
              onClick={() => handleMemberClick(index)}
              onMouseEnter={() => setHoveredId(member.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: activeIndex === index 
                  ? '3px solid #ef4444' 
                  : '3px solid rgba(0, 0, 0, 0.08)',
                boxShadow: activeIndex === index 
                  ? '0 12px 30px rgba(239, 68, 68, 0.3)' 
                  : hoveredId === member.id 
                    ? '0 8px 20px rgba(0, 0, 0, 0.15)' 
                    : '0 4px 12px rgba(0, 0, 0, 0.08)',
                transform: activeIndex === index 
                  ? 'scale(1.15)' 
                  : hoveredId === member.id 
                    ? 'scale(1.08)' 
                    : 'scale(1)',
                transition: 'all 0.3s ease',
                position: 'relative'
              }}>
                <img 
                  src={member.image}
                  alt={member.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: activeIndex === index ? 'grayscale(0%)' : 'grayscale(30%)',
                    transition: 'filter 0.3s ease'
                  }}
                />
                
                {/* Name Tooltip on Hover */}
                {(hoveredId === member.id || activeIndex === index) && (
                  <div style={{
                    position: 'absolute',
                    bottom: '-35px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#1a1a1a',
                    color: 'white',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    zIndex: 10,
                    animation: 'fadeIn 0.2s ease'
                  }}>
                    {member.name}
                    <div style={{
                      position: 'absolute',
                      top: '-4px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '0',
                      height: '0',
                      borderLeft: '5px solid transparent',
                      borderRight: '5px solid transparent',
                      borderBottom: '5px solid #1a1a1a'
                    }}></div>
                  </div>
                )}
              </div>

              {/* Active Ring Animation */}
              {activeIndex === index && (
                <div style={{
                  position: 'absolute',
                  top: '-8px',
                  left: '-8px',
                  right: '-8px',
                  bottom: '-8px',
                  borderRadius: '50%',
                  border: '2px solid rgba(239, 68, 68, 0.4)',
                  animation: 'pulse 2s ease-in-out infinite',
                  pointerEvents: 'none'
                }}></div>
              )}
            </div>
          ))}
        </div>

        {/* Progress Dots */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.5rem',
          marginTop: '4rem',
          flexWrap: 'wrap'
        }}>
          {members.map((_, index) => (
            <div
              key={index}
              onClick={() => handleMemberClick(index)}
              style={{
                width: activeIndex === index ? '32px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: activeIndex === index 
                  ? '#ef4444' 
                  : 'rgba(0, 0, 0, 0.15)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: activeIndex === index ? '0 2px 8px rgba(239, 68, 68, 0.4)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (activeIndex !== index) {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeIndex !== index) {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.15)';
                }
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { 
            opacity: 1; 
            transform: scale(1); 
          }
          50% { 
            opacity: 0.6; 
            transform: scale(1.05); 
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-5px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}