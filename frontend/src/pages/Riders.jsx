import React, { useState, useEffect } from 'react';
import { Instagram, Youtube } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../services/api';

export default function Riders() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredId, setHoveredId] = useState(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch riders from API
  useEffect(() => {
    const fetchRiders = async () => {
      try {
        setLoading(true);
        const response = await api.get('/team/riders/list');
        const ridersData = response.data.data.riders || [];
        setMembers(ridersData);
        setError(null);
      } catch (error) {
        console.error('Error fetching riders:', error);
        setError('Failed to load riders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRiders();
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || members.length === 0) return;
    
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % members.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, members.length]);

  const handleMemberClick = (index) => {
    setActiveIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  // Loading state
  if (loading) {
    return (
      <div style={{
        width: '100%',
        minHeight: '100vh',
        background: '#ffffff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column'
      }}>
        <Navbar />
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #ef4444',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>Loading riders...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{
        width: '100%',
        minHeight: '100vh',
        background: '#ffffff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column'
      }}>
        <Navbar />
        <div style={{ textAlign: 'center', marginTop: '2rem', padding: '2rem' }}>
          <p style={{ color: '#ef4444', fontSize: '1.2rem', marginBottom: '1rem' }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.8rem 2rem',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No members state
  if (members.length === 0) {
    return (
      <div style={{
        width: '100%',
        minHeight: '100vh',
        background: '#ffffff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column'
      }}>
        <Navbar />
        <div style={{ textAlign: 'center', marginTop: '2rem', padding: '2rem' }}>
          <p style={{ color: '#666', fontSize: '1.2rem' }}>No riders available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: '#ffffff',
      padding: '4rem 2rem',
      position: 'relative'
    }}>
      
      <Navbar/> 

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

      <div style={{ maxWidth: '1400px', margin: '20px auto', position: 'relative', zIndex: 10 }}>
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

        {/* Featured Member Square */}
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
              borderRadius: '12px',
              overflow: 'hidden',
              border: '4px solid #ef4444',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
            position: 'relative'
          }}>
            {members[activeIndex]?.imgUrl ? (
              <img 
                src={members[activeIndex].imgUrl}
                alt={members[activeIndex].name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)'
              }}>
                <span style={{ color: '#999', fontSize: '0.9rem' }}>No Image</span>
              </div>
            )}              <div style={{
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
                  {members[activeIndex]?.social?.instagram && (
                    <a
                      href={members[activeIndex].social.instagram}
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
                  {members[activeIndex]?.social?.youtube && (
                    <a
                      href={members[activeIndex].social.youtube}
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

            {/* Decorative Border */}
            <div style={{
              position: 'absolute',
              top: '-15px',
              left: '-15px',
              right: '-15px',
              bottom: '-15px',
              borderRadius: '16px',
              border: '2px dashed rgba(239, 68, 68, 0.2)',
              animation: 'rotate 30s linear infinite',
              pointerEvents: 'none'
            }}></div>
          </div>
        </div>

        {/* All Riders Grid - Squares */}
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
              key={member._id || member.id}
              onClick={() => handleMemberClick(index)}
              onMouseEnter={() => setHoveredId(member._id || member.id)}
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
                borderRadius: '8px',
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
                  : hoveredId === (member._id || member.id)
                    ? 'scale(1.08)' 
                    : 'scale(1)',
                transition: 'all 0.3s ease',
                position: 'relative'
              }}>
                {member.imgUrl ? (
                  <img 
                    src={member.imgUrl}
                    alt={member.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: activeIndex === index ? 'grayscale(0%)' : 'grayscale(30%)',
                      transition: 'filter 0.3s ease'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    color: '#999'
                  }}>
                    {member.name.charAt(0)}
                  </div>
                )}
                
                {/* Name Tooltip on Hover */}
                {(hoveredId === (member._id || member.id) || activeIndex === index) && (
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

              {/* Active Border Animation */}
              {activeIndex === index && (
                <div style={{
                  position: 'absolute',
                  top: '-8px',
                  left: '-8px',
                  right: '-8px',
                  bottom: '-8px',
                  borderRadius: '12px',
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