import React, { useState } from 'react';
import { Instagram, Youtube } from 'lucide-react';

// Import images
import Kunal from "../assets/Kunal Mestry.png";
import Parth from "../assets/Parth Mehta.png";
import Aditya from '../assets/Aditya Gajare.jpg';
import Ajay from '../assets/Ajay Yadav.jpg';
import Arijit from '../assets/Arijit Das.jpg';
import Ashish from '../assets/Ashish Mestry.jpg';
import Jigar from '../assets/Jigar Thakkar.jpg';
import Poonam from '../assets/Poonam sanas.jpg';
import Pralad from '../assets/Pralad Parab.jpg';
import Soumen from '../assets/Soumen Roy.jpg';

const coreMembers = [
  {
    id: 1,
    name: "Kunal Mestry",
    role: "Founder",
    instagram: "https://www.instagram.com/mumbiker_kunal?igsh=emU1a2I0eDE5NmZ3",
    youtube: "https://youtube.com/@mumbikerkunal10?si=O1xM8dlXRp48Evwy",
    image: Kunal,
    isLeadership: true
  },
  {
    id: 2,
    name: "Poonam Sanas",
    role: "Secretary",
    instagram: "https://www.instagram.com/_pooh_sanas_?igsh=MW5sMGw1aXR1ZTc3Nw==",
    image: Poonam,
    isLeadership: true
  },
  {
    id: 3,
    name: "Jigar Thakkar",
    role: "Treasurer",
    instagram: "https://www.instagram.com/jigsi_4091?igsh=MXU3OTBtbXNvdDlkMg==",
    youtube: "https://youtube.com/@jigarthakkar",
    image: Jigar,
    isLeadership: true
  },
  {
    id: 4,
    name: "Ashish Mestry",
    role: "Core Member",
    instagram: "https://www.instagram.com/_ashish_mestry?igsh=NnZ3OW45ZWp5anhx",
    image: Ashish,
    isLeadership: false
  },
  {
    id: 5,
    name: "Ajay Yadav",
    role: "Core Member",
    instagram: "https://instagram.com/ajayyadav",
    image: Ajay,
    isLeadership: false
  },
  {
    id: 6,
    name: "Aditya Gajare",
    role: "Core Member",
    instagram: "https://www.instagram.com/aditya_gajare05?igsh=ZHE4aHBuNjBlbm90",
    image: Aditya,
    isLeadership: false
  },
  {
    id: 7,
    name: "Arijit Das",
    role: "Core Member",
    instagram: "https://www.instagram.com/a_r_i_j_i_t_d_a_s?igsh=MXdrODlnemkweWpmNw==",
    image: Arijit,
    isLeadership: false
  },
  {
    id: 8,
    name: "Pralad Parab",
    role: "Core Member",
    instagram: "https://www.instagram.com/mumbikerkasafar?igsh=bGhyamM1OThpNjQy&utm_source=qr",
    youtube: "https://www.youtube.com/@MumbikerKaSafar",
    image: Pralad,
    isLeadership: false
  },
  {
    id: 9,
    name: "Soumen Roy",
    role: "Core Member",
    instagram: "https://www.instagram.com/roy.sid?igsh=bXA4YmdlM3pwZXY4",
    image: Soumen,
    isLeadership: false
  },
  {
    id: 10,
    name: "Parth Mehta",
    role: "Core Member",
    instagram: "https://www.instagram.com/parmeh.san?igsh=MXZ5M25udTlhMDd6bw%3D%3D&utm_source=qr",
    youtube: "https://youtube.com/@rolodexdiaries?si=XUZiQ6Q1Q8vRdtQW",
    image: Parth,
    isLeadership: false
  }
];

export default function CoreMembers() {
  const [hoveredId, setHoveredId] = useState(null);

  const leadershipMembers = coreMembers.filter(m => m.isLeadership);
  const regularMembers = coreMembers.filter(m => !m.isLeadership);

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: '#0a0a0a',
      padding: '4rem 2rem',
      position: 'relative'
    }}>
      {/* Subtle Background Grid */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
        opacity: 0.5
      }}></div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <div style={{
            display: 'inline-block',
            padding: '0.6rem 2rem',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '50px',
            marginBottom: '1rem'
          }}>
            <span style={{
              color: '#ef4444',
              fontSize: '0.85rem',
              fontWeight: '600',
              letterSpacing: '0.15em',
              textTransform: 'uppercase'
            }}>
              The Leadership
            </span>
          </div>
          
          <p style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.95rem',
            fontWeight: '400',
            letterSpacing: '0.1em',
            marginBottom: '1.5rem',
            textTransform: 'uppercase'
          }}>
            Brotherhood of Mumbai
          </p>
          
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: '700',
            color: '#ffffff',
            marginBottom: '1rem',
            letterSpacing: '0.02em'
          }}>
            CORE MEMBERS
          </h1>
          
          <div style={{
            width: '60px',
            height: '3px',
            background: '#ef4444',
            margin: '0 auto'
          }}></div>
        </div>

        {/* Leadership - 3 Card Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: '2rem',
          marginBottom: '6rem'
        }}>  
          {leadershipMembers.map((member) => (
            <div
              key={member.id}
              onMouseEnter={() => setHoveredId(member.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                position: 'relative',
                background: '#141414',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                transition: 'all 0.3s ease',
                transform: hoveredId === member.id ? 'translateY(-8px)' : 'translateY(0)',
                boxShadow: hoveredId === member.id 
                  ? '0 20px 60px rgba(239, 68, 68, 0.2)' 
                  : '0 4px 20px rgba(0, 0, 0, 0.3)'
              }}
            >
              {/* Image */}
              <div style={{
                width: '100%',
                height: '400px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <img 
                  src={member.image}
                  alt={member.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: hoveredId === member.id ? 'scale(1.05)' : 'scale(1)',
                    transition: 'transform 0.5s ease'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(10, 10, 10, 0.9), transparent 60%)'
                }}></div>
              </div>

              {/* Content */}
              <div style={{ padding: '2rem' }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#ffffff',
                  marginBottom: '0.5rem'
                }}>
                  {member.name}
                </h3>
                
                <span style={{
                  display: 'inline-block',
                  fontSize: '0.85rem',
                  color: '#ef4444',
                  fontWeight: '500',
                  letterSpacing: '0.05em',
                  marginBottom: '1.5rem'
                }}>
                  {member.role}
                </span>

                {/* Social Links */}
                <div style={{ display: 'flex', gap: '0.8rem' }}>
                  {member.instagram && (
                    <a
                      href={member.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#ffffff',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        transition: 'all 0.3s',
                        textDecoration: 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#ec4899';
                        e.currentTarget.style.borderColor = '#ec4899';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <Instagram size={18} />
                    </a>
                  )}
                  {member.youtube && (
                    <a
                      href={member.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#ffffff',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        transition: 'all 0.3s',
                        textDecoration: 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#dc2626';
                        e.currentTarget.style.borderColor = '#dc2626';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <Youtube size={18} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Core Team Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: '600',
            color: '#ffffff',
            marginBottom: '0.5rem'
          }}>
            CORE TEAM
          </h2>
          <div style={{
            width: '50px',
            height: '2px',
            background: '#ef4444',
            margin: '0 auto'
          }}></div>
        </div>

        {/* Regular Core Members Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1.5rem'
        }}>
          {regularMembers.map((member) => (
            <div
              key={member.id}
              onMouseEnter={() => setHoveredId(member.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                position: 'relative',
                background: '#141414',
                borderRadius: '10px',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                transition: 'all 0.3s ease',
                transform: hoveredId === member.id ? 'translateY(-5px)' : 'translateY(0)',
                boxShadow: hoveredId === member.id 
                  ? '0 12px 40px rgba(239, 68, 68, 0.15)' 
                  : '0 2px 10px rgba(0, 0, 0, 0.2)'
              }}
            >
              <div style={{
                width: '100%',
                height: '280px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <img 
                  src={member.image}
                  alt={member.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: hoveredId === member.id ? 'scale(1.05)' : 'scale(1)',
                    transition: 'transform 0.5s ease'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(10, 10, 10, 0.9), transparent 60%)'
                }}></div>
              </div>

              <div style={{ padding: '1.5rem' }}>
                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  color: '#ffffff',
                  marginBottom: '0.5rem'
                }}>
                  {member.name}
                </h3>
                
                <span style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  color: 'rgba(239, 68, 68, 0.8)',
                  fontWeight: '500',
                  marginBottom: '1rem'
                }}>
                  {member.role}
                </span>

                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  {member.instagram && (
                    <a
                      href={member.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '36px',
                        height: '36px',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#ffffff',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        transition: 'all 0.3s',
                        textDecoration: 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#ec4899';
                        e.currentTarget.style.borderColor = '#ec4899';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      }}
                    >
                      <Instagram size={16} />
                    </a>
                  )}
                  {member.youtube && (
                    <a
                      href={member.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '36px',
                        height: '36px',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#ffffff',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        transition: 'all 0.3s',
                        textDecoration: 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#dc2626';
                        e.currentTarget.style.borderColor = '#dc2626';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      }}
                    >
                      <Youtube size={16} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}