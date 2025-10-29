import React, { useState, useEffect } from 'react';
import { Instagram, Youtube } from 'lucide-react';
import api from '../services/api';

export default function CoreMembers() {
  const [hoveredId, setHoveredId] = useState(null);
  const [coreMembers, setCoreMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch core team members from API
  useEffect(() => {
    const fetchCoreMembers = async () => {
      try {
        setLoading(true);
        const response = await api.get('/team/core/list');
        const membersData = response.data.data.coreMembers || [];
        setCoreMembers(membersData);
        setError(null);
      } catch (error) {
        console.error('Error fetching core members:', error);
        setError('Failed to load core team members. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCoreMembers();
  }, []);

  const leadershipMembers = coreMembers.filter(m => m.isLeadership);
  const regularMembers = coreMembers.filter(m => !m.isLeadership);

  // Loading state
  if (loading) {
    return (
      <div style={{
        width: '100%',
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #333',
            borderTop: '4px solid #ef4444',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: '#999', fontSize: '1.1rem' }}>Loading core team members...</p>
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
        background: '#0a0a0a',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column'
      }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
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
  if (coreMembers.length === 0) {
    return (
      <div style={{
        width: '100%',
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column'
      }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: '#999', fontSize: '1.2rem' }}>No core team members available at the moment.</p>
        </div>
      </div>
    );
  }

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
              key={member._id}
              onMouseEnter={() => setHoveredId(member._id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                position: 'relative',
                background: '#141414',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                transition: 'all 0.3s ease',
                transform: hoveredId === member._id ? 'translateY(-8px)' : 'translateY(0)',
                boxShadow: hoveredId === member._id 
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
                {member.imgUrl ? (
                  <img 
                    src={member.imgUrl}
                    alt={member.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transform: hoveredId === member._id ? 'scale(1.05)' : 'scale(1)',
                      transition: 'transform 0.5s ease'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '4rem',
                    color: '#666'
                  }}>
                    {member.name.charAt(0)}
                  </div>
                )}
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
                  {member.social?.instagram && (
                    <a
                      href={member.social.instagram}
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
                  {member.social?.youtube && (
                    <a
                      href={member.social.youtube}
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
              key={member._id}
              onMouseEnter={() => setHoveredId(member._id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                position: 'relative',
                background: '#141414',
                borderRadius: '10px',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                transition: 'all 0.3s ease',
                transform: hoveredId === member._id ? 'translateY(-5px)' : 'translateY(0)',
                boxShadow: hoveredId === member._id 
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
                {member.imgUrl ? (
                  <img 
                    src={member.imgUrl}
                    alt={member.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transform: hoveredId === member._id ? 'scale(1.05)' : 'scale(1)',
                      transition: 'transform 0.5s ease'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '3rem',
                    color: '#666'
                  }}>
                    {member.name.charAt(0)}
                  </div>
                )}
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
                  {member.social?.instagram && (
                    <a
                      href={member.social.instagram}
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
                  {member.social?.youtube && (
                    <a
                      href={member.social.youtube}
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