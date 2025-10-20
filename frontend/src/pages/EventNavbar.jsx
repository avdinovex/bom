import React, { useState, useEffect } from 'react';
import mbm1 from '../assets/mbm1.jpg'
import mbm2 from '../assets/mbm2.jpg'
import mbm3 from '../assets/mbm3.jpg'
import mbm4 from '../assets/mbm4.jpg'
import mbm5 from '../assets/mbm5.jpg'
import mbm6 from '../assets/mbm6.jpg'
import mbm7 from '../assets/mbm7.jpg'
import Navbar from '../components/Navbar';
import Footer from '../pages/Footer';
import EventBookingForm from '../components/EventBookingForm';
import { publicEventsAPI } from '../services/api';
import { toast } from 'react-hot-toast';

const Events = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [events, setEvents] = useState({ upcoming: [], past: [] });
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Fallback images
  const fallbackImages = [mbm1, mbm2, mbm3, mbm4, mbm5, mbm6, mbm7];

  useEffect(() => {
    fetchEvents();
    
    // Also call debug endpoint directly
    const debugDB = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/events/debug/all');
        const data = await response.json();
        console.log('Direct debug API call result:', data);
      } catch (error) {
        console.log('Direct debug API call failed:', error);
      }
    };
    
    debugDB();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      // Debug: First check what's in the database
      try {
        const debugResponse = await publicEventsAPI.getDebugAll();
        console.log('Debug - All events in DB:', debugResponse.data);
        
        // Try to fix existing events categories and publish status
        if (debugResponse.data?.events && debugResponse.data.events.length > 0) {
          console.log('Fixing event categories and publish status...');
          try {
            const fixResponse = await publicEventsAPI.fixEventCategories();
            console.log('Events fixed:', fixResponse);
          } catch (fixError) {
            console.log('Failed to fix events:', fixError);
          }
        } else {
          console.log('No events found, creating test event...');
          try {
            const testEventResponse = await publicEventsAPI.createTestEvent();
            console.log('Test event created:', testEventResponse);
          } catch (testError) {
            console.log('Failed to create test event:', testError);
          }
        }
      } catch (debugError) {
        console.log('Debug endpoint failed:', debugError);
      }
      
      // Get all events and filter for Mumbai Bikers Mania manually
      const allEventsResponse = await publicEventsAPI.getAll({ limit: 20 });
      console.log('All events response:', allEventsResponse);
      
      const allDbEvents = allEventsResponse.data?.events || allEventsResponse.data?.data?.events || [];
      console.log('All events from DB:', allDbEvents);
      
      // Filter for Mumbai Bikers Mania events by title since category might be wrong
      const allEvents = allDbEvents.filter(event => 
        event.category === 'mumbai-bikers-mania' || 
        event.title?.toLowerCase().includes('mumbai bikers mania') ||
        event.title?.toLowerCase().includes('mumbai bikers') ||
        event.title?.toLowerCase().includes('mbm')
      );
      
      console.log('Filtered Mumbai Bikers Mania events:', allEvents);
      
      // Manually categorize events based on dates
      const now = new Date();
      const upcomingEvents = allEvents.filter(event => {
        if (!event.startDate) return false;
        const startDate = new Date(event.startDate);
        const endDate = event.endDate ? new Date(event.endDate) : null;
        
        // Event is upcoming if it hasn't started yet or is currently ongoing
        return startDate >= now || (endDate && endDate >= now);
      });
      
      const pastEvents = allEvents.filter(event => {
        if (!event.startDate) return false;
        const startDate = new Date(event.startDate);
        const endDate = event.endDate ? new Date(event.endDate) : null;
        
        // Event is past if it has ended or started more than 24 hours ago without an end date
        if (endDate) {
          return endDate < now;
        } else {
          return startDate < new Date(now.getTime() - 24 * 60 * 60 * 1000);
        }
      });

      setEvents({
        upcoming: upcomingEvents.sort((a, b) => new Date(a.startDate) - new Date(b.startDate)),
        past: pastEvents.sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
      });
      
      console.log('Final categorized events:', {
        upcoming: upcomingEvents.length,
        past: pastEvents.length,
        upcomingEvents,
        pastEvents
      });
      
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
      // Keep fallback content if API fails
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSuccess = (bookingData) => {
    toast.success('Event booking successful!');
    setShowBookingForm(false);
    setSelectedEvent(null);
    // Optionally refresh events to update participant count
    fetchEvents();
  };

  const openBookingForm = (event) => {
    setSelectedEvent(event);
    setShowBookingForm(true);
  };

  const renderContentSection = (section, index, isReverse = false) => {
    const currentSectionStyle = isReverse ? sectionReverseStyle : sectionStyle;
    
    return (
      <div key={section._id || index} style={currentSectionStyle} className="event-section">
        <div style={imageContainerStyle} className="event-image-container">
          <img
            src={section.imageUrl || fallbackImages[index % fallbackImages.length]}
            alt={section.imageAlt || section.heading}
            style={imageStyle}
            className="event-image"
          />
        </div>
        <div style={textContainerStyle}>
          {section.subheading && (
            <p style={subheadingStyle} className="event-subheading">
              {section.subheading}
            </p>
          )}
          <h1 style={headingStyle} className="event-heading">
            {section.heading}
          </h1>
          <p style={paragraphStyle} className="event-paragraph">
            {section.content}
          </p>
        </div>
      </div>
    );
  };

  const renderEventContent = (eventList) => {
    if (loading) {
      return (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading events...</p>
        </div>
      );
    }

    if (eventList.length === 0) {
      return (
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold text-white mb-4">
            {activeTab === 'upcoming' ? 'No Upcoming Events' : 'No Past Events Found'}
          </h2>
          <p className="text-gray-300 mb-8">
            {activeTab === 'upcoming' 
              ? 'Stay tuned for exciting upcoming Mumbai Bikers Mania events! New events are being planned.'
              : 'Previous Mumbai Bikers Mania events will appear here once they are completed.'
            }
          </p>
          {/* Show fallback content as preview for both tabs when no real events */}
          <div className="mt-12">
            <h3 className="text-xl font-semibold text-red-500 mb-6">
              {activeTab === 'upcoming' ? 'What to Expect from Mumbai Bikers Mania' : 'Experience Mumbai Bikers Mania'}
            </h3>
            {renderFallbackContent()}
          </div>
        </div>
      );
    }

    return (
      <>
        {eventList.map((event, eventIndex) => (
          <div key={event._id} className="mb-12">
            {/* Event header with title */}
            {eventList.length > 1 && (
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">{event.title}</h2>
                {event.startDate && (
                  <p className="text-red-500 text-lg font-medium">
                    {new Date(event.startDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                )}
              </div>
            )}

            {/* Render dynamic content sections */}
            {event.contentSections && event.contentSections.length > 0 ? (
              event.contentSections
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((section, index) => 
                  renderContentSection(section, index, section.layout === 'image-right' || index % 2 === 1)
                )
            ) : (
              // Show fallback content only for the first event if no content sections
              eventIndex === 0 && renderFallbackContent()
            )}
            
            {/* Add booking/info section for each event */}
            <div style={sectionStyle} className="event-section">
              <div style={imageContainerStyle} className="event-image-container">
                <img
                  src={event.imgUrl || mbm3}
                  alt={event.title}
                  style={imageStyle}
                  className="event-image"
                />
              </div>
              <div style={textContainerStyle}>
                <p style={subheadingStyle} className="event-subheading">
                  {activeTab === 'upcoming' ? 'JOIN US' : 'EVENT MEMORIES'}
                </p>
                <h1 style={headingStyle} className="event-heading">
                  {event.title?.toUpperCase()}
                </h1>
                {event.description && (
                  <p style={paragraphStyle} className="event-paragraph">
                    {event.description}
                  </p>
                )}
                <p style={finalParagraphStyle}>
                  {event.subtitle || (activeTab === 'upcoming' 
                    ? "Be part of this incredible experience!" 
                    : "Relive the amazing memories from this event!")}
                </p>
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  {activeTab === 'upcoming' && event.isBookingEnabled && (
                    <button 
                      style={buttonStyle} 
                      className="event-button"
                      onClick={() => openBookingForm(event)}
                    >
                      REGISTER NOW
                    </button>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {event.location && (
                      <div className="text-white">
                        <p className="text-sm opacity-75">Location:</p>
                        <p className="font-semibold">{event.location}</p>
                      </div>
                    )}
                    {event.startDate && (
                      <div className="text-white">
                        <p className="text-sm opacity-75">Date:</p>
                        <p className="font-semibold">
                          {new Date(event.startDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    )}
                    {event.pricing && !event.pricing.isFree && (
                      <div className="text-white">
                        <p className="text-sm opacity-75">Price:</p>
                        <p className="font-semibold">₹{event.pricing.basePrice || event.price}</p>
                      </div>
                    )}
                    {event.capacity && (
                      <div className="text-white">
                        <p className="text-sm opacity-75">Capacity:</p>
                        <p className="font-semibold">
                          {event.capacity.currentParticipants || 0}/{event.capacity.maxParticipants || 100}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </>
    );
  };

  const renderFallbackContent = () => {
    return (
      <>
        {/* Fallback content sections using static data */}
        <div style={sectionStyle} className="event-section">
          <div style={imageContainerStyle} className="event-image-container">
            <img
              src={mbm3}
              alt="Mumbai Bikers Mania"
              style={imageStyle}
              className="event-image"
            />
          </div>
          <div style={textContainerStyle}>
            <p style={subheadingStyle} className="event-subheading">
              INTRODUCING
            </p>
            <h1 style={headingStyle} className="event-heading">
              MUMBAI BIKERS<br />MANIA
            </h1>
            <p style={paragraphStyle} className="event-paragraph">
              Mumbai Bikers Mania is a premium biking festival conceptualised by the Brotherhood of Mumbai exclusively for the city's passionate riding community. It is not a meetup, not a casual group ride—but a full-scale motorsport-inspired event.
            </p>
          </div>
        </div>

        {/* Additional fallback sections... */}
        <div style={sectionReverseStyle} className="event-section">
          <div style={imageContainerStyle} className="event-image-container">
            <img
              src={mbm2}
              alt="Professional Platform"
              style={imageStyle}
              className="event-image"
            />
          </div>
          <div style={textContainerStyle}>
            <p style={subheadingStyle} className="event-subheading">
              OUR VISION
            </p>
            <h1 style={headingStyle} className="event-heading">
              PROFESSIONAL<br />BIKING PLATFORM
            </h1>
            <p style={paragraphStyle} className="event-paragraph">
              The vision behind Mumbai Bikers Mania is to create a professional platform dedicated to real biking culture. Riders don't just attend—they experience. A space where the community feels seen, valued, and represented.
            </p>
          </div>
        </div>

        <div style={sectionStyle} className="event-section">
          <div style={imageContainerStyle} className="event-image-container">
            <img
              src={mbm7}
              alt="Off-Road Tracks"
              style={imageStyle}
              className="event-image"
            />
          </div>
          <div style={textContainerStyle}>
            <p style={subheadingStyle} className="event-subheading">
              EXPERIENCE
            </p>
            <h1 style={headingStyle} className="event-heading">
              OFF-ROAD &<br />TRAIL ZONES
            </h1>
            <p style={paragraphStyle} className="event-paragraph">
              The event features purpose-built off-road and trail zones designed for thrill seekers. Motocross-style tracks are introduced to challenge skill, control, and precision.
            </p>
          </div>
        </div>

        {/* Final section with register button */}
        <div style={sectionReverseStyle} className="event-section">
          <div style={imageContainerStyle} className="event-image-container">
            <img
              src={mbm3}
              alt="Mumbai Biking Legacy"
              style={imageStyle}
              className="event-image"
            />
          </div>
          <div style={textContainerStyle}>
            <p style={subheadingStyle} className="event-subheading">
              THE MOVEMENT
            </p>
            <h1 style={headingStyle} className="event-heading">
              WHERE THROTTLE<br />MEETS AMBITION
            </h1>
            <p style={paragraphStyle} className="event-paragraph">
              Mumbai Bikers Mania is a step towards building a recognised biking identity for Mumbai. An identity that speaks of passion, power, and professional-level biking events.
            </p>
            <p style={finalParagraphStyle}>
              This is more than an event—it's the beginning of a movement.
            </p>
            <button style={buttonStyle} className="event-button">
              JOIN THE MANIA
            </button>
          </div>
        </div>
      </>
    );
  };

  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    paddingTop: '100px',
    paddingBottom: '80px'
  };

  const contentWrapperStyle = {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 40px'
  };

  // Hero Section Styles
  const heroSectionStyle = {
    marginBottom: '80px',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '12px',
    boxShadow: '0 20px 60px rgba(255,71,87,0.3)'
  };

  const heroImageStyle = {
    width: '100%',
    height: '600px',
    objectFit: 'cover',
    filter: 'brightness(0.5)'
  };

  const heroOverlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(to bottom, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.8) 100%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '60px 40px'
  };

  const heroTitleStyle = {
    fontSize: '3.5rem',
    fontWeight: '800',
    color: '#ff4757',
    textAlign: 'center',
    marginBottom: '40px',
    letterSpacing: '3px',
    textTransform: 'uppercase',
    textShadow: '0 4px 20px rgba(0,0,0,0.8)'
  };

  const heroSubtitleStyle = {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: '30px',
    fontStyle: 'italic',
    textShadow: '0 2px 10px rgba(0,0,0,0.8)'
  };

  const heroTextStyle = {
    fontSize: '1.2rem',
    lineHeight: '1.8',
    color: '#e0e0e0',
    textAlign: 'center',
    maxWidth: '900px',
    textShadow: '0 2px 10px rgba(0,0,0,0.8)'
  };

  const toggleContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '60px',
    position: 'sticky',
    top: '20px',
    zIndex: 100,
    padding: '20px 0'
  };

  const toggleWrapperStyle = {
    display: 'inline-flex',
    background: 'rgba(20, 20, 20, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '50px',
    padding: '6px',
    border: '1px solid rgba(255, 71, 87, 0.2)',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
  };

  const toggleButtonStyle = (isActive) => ({
    padding: '12px 40px',
    fontSize: '0.95rem',
    fontWeight: '700',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    border: 'none',
    borderRadius: '50px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backgroundColor: isActive ? '#ff4757' : 'transparent',
    color: isActive ? '#ffffff' : '#888888',
    transform: isActive ? 'scale(1)' : 'scale(0.95)',
    boxShadow: isActive ? '0 5px 20px rgba(255, 71, 87, 0.4)' : 'none'
  });

  const sectionStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '60px',
    marginBottom: '80px',
    opacity: 0,
    animation: 'fadeInUp 0.6s ease forwards'
  };

  const sectionReverseStyle = {
    ...sectionStyle,
    flexDirection: 'row-reverse'
  };

  const imageContainerStyle = {
    flex: 1,
    overflow: 'hidden',
    borderRadius: '8px',
    boxShadow: '0 20px 60px rgba(255,71,87,0.3)'
  };

  const imageStyle = {
    width: '100%',
    height: '500px',
    objectFit: 'cover',
    transition: 'transform 0.5s'
  };

  const textContainerStyle = {
    flex: 1,
    color: 'white'
  };

  const subheadingStyle = {
    fontSize: '1.3rem',
    color: '#ff4757',
    fontWeight: 'bold',
    marginBottom: '25px',
    letterSpacing: '3px',
    textTransform: 'uppercase'
  };

  const headingStyle = {
    fontSize: '3rem',
    fontWeight: '800',
    marginBottom: '20px',
    letterSpacing: '2px',
    color: 'white',
    textTransform: 'uppercase',
    lineHeight: '1.2'
  };

  const paragraphStyle = {
    fontSize: '1.125rem',
    lineHeight: '1.8',
    color: '#ccc',
    marginBottom: '16px'
  };

  const buttonStyle = {
    backgroundColor: '#ff4757',
    color: 'white',
    border: 'none',
    padding: '16px 40px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.95rem',
    letterSpacing: '2px',
    transition: 'all 0.3s',
    marginTop: '32px',
    borderRadius: '4px',
    textTransform: 'uppercase'
  };

  const finalParagraphStyle = {
    fontSize: '1.25rem',
    lineHeight: '1.8',
    color: 'white',
    fontWeight: 'bold',
    fontStyle: 'italic',
    marginBottom: '20px'
  };



  return (
    <>
      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .event-section {
            animation-delay: 0.1s;
          }

          .event-section:nth-child(2) {
            animation-delay: 0.2s;
          }

          .event-section:nth-child(3) {
            animation-delay: 0.3s;
          }

          @media (max-width: 968px) {
            .toggle-wrapper {
              padding: 4px !important;
            }
            
            .toggle-button {
              padding: 10px 30px !important;
              font-size: 0.85rem !important;
            }

            .hero-section {
              margin-bottom: 60px !important;
            }

            .hero-image {
              height: 450px !important;
            }

            .hero-title {
              font-size: 2.5rem !important;
            }

            .hero-subtitle {
              font-size: 1.5rem !important;
            }

            .hero-text {
              font-size: 1rem !important;
              padding: 0 20px !important;
            }

            .hero-overlay {
              padding: 40px 20px !important;
            }

            .event-section {
              flex-direction: column !important;
              gap: 40px !important;
              margin-bottom: 60px !important;
            }
            .event-image {
              height: 350px !important;
            }
            .content-wrapper {
              padding: 0 25px !important;
            }
            .event-heading {
              font-size: 2.2rem !important;
            }
            .event-subheading {
              font-size: 1rem !important;
            }
            .event-paragraph {
              font-size: 1rem !important;
            }
            .event-container {
              padding-top: 80px !important;
            }
          }
          @media (max-width: 768px) {
            .hero-title {
              font-size: 2rem !important;
            }

            .hero-subtitle {
              font-size: 1.3rem !important;
              margin-bottom: 20px !important;
            }

            .hero-image {
              height: 400px !important;
            }

            .event-heading {
              font-size: 1.8rem !important;
            }
            .toggle-button {
              padding: 8px 20px !important;
              font-size: 0.8rem !important;
            }
          }
          @media (max-width: 480px) {
            .hero-title {
              font-size: 1.5rem !important;
              margin-bottom: 20px !important;
            }

            .hero-subtitle {
              font-size: 1.1rem !important;
            }

            .hero-text {
              font-size: 0.9rem !important;
            }

            .hero-image {
              height: 350px !important;
            }

            .event-heading {
              font-size: 1.5rem !important;
            }
            .content-wrapper {
              padding: 0 20px !important;
            }
            .event-container {
              padding-top: 60px !important;
            }
            .event-button {
              padding: 12px 32px !important;
              margin-top: 24px !important;
            }
            .toggle-button {
              padding: 8px 18px !important;
              font-size: 0.75rem !important;
              letter-spacing: 1px !important;
            }
          }
          .event-image-container:hover .event-image {
            transform: scale(1.05);
          }
          .event-button:hover {
            background-color: #ff3345 !important;
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(255,71,87,0.4);
          }
        `}
      </style>

      <div style={containerStyle} className="event-container">
        <Navbar />
        <div style={contentWrapperStyle} className="content-wrapper">
          
          {/* Hero Section */}
          <div style={heroSectionStyle} className="hero-section">
            <img
              src={events[activeTab]?.[0]?.imgUrl || mbm1}
              alt="Mumbai Bikers Mania Community"
              style={heroImageStyle}
              className="hero-image"
            />
            <div style={heroOverlayStyle} className="hero-overlay">
              <h1 style={heroTitleStyle} className="hero-title">
                Mumbai Bikers Mania
              </h1>
              <h2 style={heroSubtitleStyle} className="hero-subtitle">
                {events[activeTab]?.[0]?.subtitle || "Riding the Pulse of Mumbai's Motorcycle Culture"}
              </h2>
              {events[activeTab]?.[0] ? (
                <div className="text-center">
                  <p style={heroTextStyle} className="hero-text">
                    {events[activeTab][0].description || "Experience the ultimate biking festival in Mumbai"}
                  </p>
                  {activeTab === 'upcoming' && events[activeTab][0].startDate && (
                    <div className="mt-6 bg-red-500 bg-opacity-20 backdrop-blur-sm rounded-lg p-4 inline-block">
                      <p className="text-white text-lg font-semibold">Next Event:</p>
                      <p className="text-red-300 text-xl font-bold">
                        {new Date(events[activeTab][0].startDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p style={heroTextStyle} className="hero-text">
                  <strong>A Thriving Community on Two Wheels</strong><br/><br/>
                  In the bustling streets of Mumbai, where the city never sleeps, a unique community of motorcycle enthusiasts has carved out its own space – fast, loud, and full of life. Mumbai Bikers Mania is not just an event; it is a living, breathing hub for riders who seek adventure, camaraderie, and the sheer joy of the open road.
                </p>
              )}
            </div>
          </div>

          {/* Toggle Switch */}
          <div style={toggleContainerStyle}>
            <div style={toggleWrapperStyle} className="toggle-wrapper">
              <button
                style={toggleButtonStyle(activeTab === 'upcoming')}
                className="toggle-button"
                onClick={() => setActiveTab('upcoming')}
                onMouseEnter={(e) => {
                  if (activeTab !== 'upcoming') {
                    e.currentTarget.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'upcoming') {
                    e.currentTarget.style.color = '#888888';
                  }
                }}
              >
                Upcoming
              </button>
              <button
                style={toggleButtonStyle(activeTab === 'past')}
                className="toggle-button"
                onClick={() => setActiveTab('past')}
                onMouseEnter={(e) => {
                  if (activeTab !== 'past') {
                    e.currentTarget.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'past') {
                    e.currentTarget.style.color = '#888888';
                  }
                }}
              >
                Past
              </button>
            </div>
          </div>

          {/* Content based on active tab */}
          {renderEventContent(events[activeTab])}
        </div>
        <Footer />
      </div>
      
      {/* Event Booking Form Modal */}
      {showBookingForm && selectedEvent && (
        <EventBookingForm 
          event={selectedEvent}
          onClose={() => {
            setShowBookingForm(false);
            setSelectedEvent(null);
          }}
          onSuccess={handleBookingSuccess}
        />
      )}
    </>
  );
};

export default Events;