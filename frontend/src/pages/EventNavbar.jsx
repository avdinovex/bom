import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
import { X, ExternalLink, Instagram, Youtube } from 'lucide-react';
import api from '../services/api';

const Events = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [events, setEvents] = useState({ upcoming: [], past: [] });
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showSponsor1, setShowSponsor1] = useState(true);
  const [showSponsor2, setShowSponsor2] = useState(true);
  const [featuredSponsors, setFeaturedSponsors] = useState([]);

  // Fallback images
  const fallbackImages = [mbm1, mbm2, mbm3, mbm4, mbm5, mbm6, mbm7];

  useEffect(() => {
    fetchEvents();
    fetchFeaturedSponsors();
  }, []);

  const fetchFeaturedSponsors = async () => {
    try {
      const response = await api.get('/sponsors/featured');
      setFeaturedSponsors(response.data.data || []);
    } catch (error) {
      console.error('Error fetching featured sponsors:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      // Fetch upcoming and past events using the proper type-based API
      const [upcomingResponse, pastResponse] = await Promise.all([
        publicEventsAPI.getByType('upcoming', { 
          category: 'mumbai-bikers-mania',
          limit: 20 
        }),
        publicEventsAPI.getByType('past', { 
          category: 'mumbai-bikers-mania',
          limit: 20 
        })
      ]);
      
      
      // Extract events from the paginated response structure
      // Try multiple levels to handle different response formats
      let upcomingEvents = [];
      let pastEvents = [];
      
      // Check if data.data.data exists (pagination structure)
      if (Array.isArray(upcomingResponse.data?.data?.data)) {
        upcomingEvents = upcomingResponse.data.data.data;
        console.log('✓ Found upcoming events at data.data.data');
      } 
      // Check if data.data is array (direct array)
      else if (Array.isArray(upcomingResponse.data?.data)) {
        upcomingEvents = upcomingResponse.data.data;
        console.log('✓ Found upcoming events at data.data');
      }
      // Check if data is array
      else if (Array.isArray(upcomingResponse.data)) {
        upcomingEvents = upcomingResponse.data;
        console.log('✓ Found upcoming events at data');
      }
      
      if (Array.isArray(pastResponse.data?.data?.data)) {
        pastEvents = pastResponse.data.data.data;
        console.log('✓ Found past events at data.data.data');
      } 
      else if (Array.isArray(pastResponse.data?.data)) {
        pastEvents = pastResponse.data.data;
        console.log('✓ Found past events at data.data');
      }
      else if (Array.isArray(pastResponse.data)) {
        pastEvents = pastResponse.data;
        console.log('✓ Found past events at data');
      }
      
      // Filter events by eventType to ensure correct categorization
      // This is a safety check in case backend returns mixed results
      upcomingEvents = upcomingEvents.filter(event => event.eventType === 'upcoming');
      pastEvents = pastEvents.filter(event => event.eventType === 'past');
      
      console.log('📊 Extracted Mumbai Bikers Mania events:', {
        upcomingCount: upcomingEvents.length,
        pastCount: pastEvents.length,
        upcomingEvents,
        pastEvents
      });

      setEvents({
        upcoming: upcomingEvents,
        past: pastEvents
      });

      // Show success message
      if (upcomingEvents.length > 0 || pastEvents.length > 0) {
        console.log(`✅ Loaded ${upcomingEvents.length} upcoming and ${pastEvents.length} past events`);
        toast.success(`Loaded ${upcomingEvents.length + pastEvents.length} event(s)`);
      } else {
        console.log('⚠️ No Mumbai Bikers Mania events found');
        toast.info('No events found. Create one in the admin panel!');
      }
      
    } catch (error) {
      console.error('❌ Error fetching events:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      toast.error('Failed to load events');
      setEvents({ upcoming: [], past: [] });
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
    // Check if user is authenticated before opening the form
    if (!user) {
      toast.error('Please sign in to book this event');
      navigate('/login', { state: { from: location } });
      return;
    }

    setSelectedEvent(event);
    setShowBookingForm(true);
  };

  const navigateToSponsors = () => {
    navigate('/sponsors');
  };

  const renderContentSection = (section, index) => {
    // Use section.layout to determine image position, default to alternating pattern
    const isImageRight = section.layout === 'image-right' || (!section.layout && index % 2 === 1);
    const currentSectionStyle = isImageRight ? sectionReverseStyle : sectionStyle;
    
    // Check if subheading should be displayed (not empty, not "TEST", not "test")
    const shouldShowSubheading = section.subheading && 
                                  section.subheading.trim() !== '' && 
                                  section.subheading.trim().toUpperCase() !== 'TEST';
    
    // Check if section title should be displayed
    const shouldShowSectionTitle = section.sectionTitle && 
                                    section.sectionTitle.trim() !== '';
    
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
          {shouldShowSectionTitle && (
            <p style={subheadingStyle} className="event-subheading">
              {section.sectionTitle}
            </p>
          )}
          {shouldShowSubheading && (
            <p style={{...subheadingStyle, fontSize: '1rem', marginBottom: '15px'}} className="event-subheading-alt">
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
          <p className="text-white text-lg mb-4">
            {activeTab === 'upcoming' 
              ? 'No upcoming Mumbai Bikers Mania events at the moment. Check back soon!' 
              : 'No past Mumbai Bikers Mania events to display.'}
          </p>
        </div>
      );
    }

    return (
      <>
        {eventList.map((event, eventIndex) => (
          <div key={event._id} className="mb-16">
            {/* Event header with title - Show for multiple events */}
            {eventList.length > 1 && (
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-white mb-3">{event.title}</h2>
                {event.startDate && (
                  <p className="text-red-500 text-xl font-medium">
                    {new Date(event.startDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                )}
                {event.subtitle && (
                  <p className="text-gray-300 text-lg mt-2 italic">{event.subtitle}</p>
                )}
              </div>
            )}

            {/* Main Event details and booking section - FIRST */}
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
                {event.details && (
                  <p style={{...paragraphStyle, whiteSpace: 'pre-line', marginTop: '16px'}} className="event-paragraph">
                    {event.details}
                  </p>
                )}
                {event.subtitle && !event.details && (
                  <p style={finalParagraphStyle}>
                    {event.subtitle}
                  </p>
                )}
                <div className="flex flex-col sm:flex-row gap-6 items-start mt-6">
                  {/* Only show register button for upcoming events with booking enabled */}
                  {activeTab === 'upcoming' && event.isBookingEnabled && (
                    <button 
                      style={buttonStyle} 
                      className="event-button"
                      onClick={() => openBookingForm(event)}
                    >
                      REGISTER NOW
                    </button>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
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
                    {event.pricing && !event.pricing.isFree && event.pricing.basePrice > 0 && (
                      <div className="text-white">
                        <p className="text-sm opacity-75">Price:</p>
                        <div className="font-semibold">
                          {/* Early Bird Price */}
                          {event.pricing.earlyBirdPrice && 
                           event.pricing.earlyBirdDeadline && 
                           new Date(event.pricing.earlyBirdDeadline) > new Date() ? (
                            <div>
                              <span className="text-green-400 text-lg">₹{event.pricing.earlyBirdPrice}</span>
                              <span className="text-xs ml-2 line-through opacity-60">₹{event.pricing.basePrice}</span>
                              <div className="text-xs text-green-400 mt-1">
                                🎉 Early Bird (Until {new Date(event.pricing.earlyBirdDeadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
                              </div>
                            </div>
                          ) : (
                            <span>₹{event.pricing.basePrice}</span>
                          )}
                        </div>
                      </div>
                    )}
                    {event.capacity && event.capacity.maxParticipants > 0 && (
                      <div className="text-white">
                        <p className="text-sm opacity-75">Capacity:</p>
                        <p className="font-semibold">
                          {event.capacity.currentParticipants || 0}/{event.capacity.maxParticipants}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Divider between main section and content sections */}
            {event.contentSections && event.contentSections.length > 0 && (
              <div className="my-16 border-t border-gray-800"></div>
            )}
            
            {/* Render dynamic content sections from backend - AFTER main section */}
            {event.contentSections && event.contentSections.length > 0 && (
              <>
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-white mb-2">Event Highlights</h2>
                  <div className="w-20 h-1 bg-red-500 mx-auto"></div>
                </div>
                {event.contentSections
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((section, index) => renderContentSection(section, index))}
              </>
            )}
          </div>
        ))}
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

  const heroSocialIconsStyle = {
    display: 'flex',
    gap: '20px',
    marginTop: '30px',
    justifyContent: 'center',
    alignItems: 'center'
  };

  const heroIconLinkStyle = {
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'rgba(255, 71, 87, 0.2)',
    backdropFilter: 'blur(10px)',
    border: '2px solid rgba(255, 71, 87, 0.4)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    textDecoration: 'none',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
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

          .hero-icon-link:hover {
            background: rgba(255, 71, 87, 0.4) !important;
            border-color: rgba(255, 71, 87, 0.8) !important;
            transform: scale(1.1) translateY(-3px);
            box-shadow: 0 8px 25px rgba(255, 71, 87, 0.5);
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
              height: 500px !important;
            }

            .hero-title {
              font-size: 2.5rem !important;
              margin-bottom: 25px !important;
            }

            .hero-subtitle {
              font-size: 1.5rem !important;
              margin-bottom: 20px !important;
            }

            .hero-text {
              font-size: 1rem !important;
              padding: 0 20px !important;
              line-height: 1.6 !important;
            }

            .hero-overlay {
              padding: 50px 20px !important;
              justify-content: center !important;
            }

            .hero-social-icons {
              margin-top: 25px !important;
              gap: 15px !important;
            }

            .hero-icon-link {
              width: 45px !important;
              height: 45px !important;
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
              margin-bottom: 20px !important;
            }

            .hero-subtitle {
              font-size: 1.3rem !important;
              margin-bottom: 15px !important;
            }

            .hero-image {
              height: 450px !important;
            }

            .hero-text {
              font-size: 0.95rem !important;
              line-height: 1.5 !important;
            }

            .hero-overlay {
              padding: 40px 15px !important;
            }

            .hero-social-icons {
              margin-top: 20px !important;
              gap: 12px !important;
            }

            .hero-icon-link {
              width: 40px !important;
              height: 40px !important;
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
              margin-bottom: 15px !important;
            }

            .hero-subtitle {
              font-size: 1rem !important;
              margin-bottom: 10px !important;
            }

            .hero-text {
              font-size: 0.85rem !important;
              line-height: 1.4 !important;
              padding: 0 15px !important;
            }

            .hero-image {
              height: 400px !important;
            }

            .hero-overlay {
              padding: 30px 10px !important;
            }

            .hero-social-icons {
              margin-top: 15px !important;
              gap: 10px !important;
            }

            .hero-icon-link {
              width: 38px !important;
              height: 38px !important;
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

          @keyframes fadeInScale {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          .sponsor-card {
            animation: fadeInScale 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          }

          .sponsor-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(255, 71, 87, 0.4);
          }

          .close-btn:hover {
            background: rgba(255, 71, 87, 0.9) !important;
            transform: rotate(90deg);
          }

          @media (min-width: 1024px) {
            .sponsor-card:hover {
              transform: translateY(-5px);
            }
          }

          @media (max-width: 1024px) and (min-width: 769px) {
            .sponsor-card {
              width: 280px !important;
            }
          }

          @media (max-width: 768px) {
            .sponsor-card {
              width: 200px !important;
            }
            
            .sponsor-card:first-of-type {
              top: 80px !important;
              left: 10px !important;
            }
            
            .sponsor-card:last-of-type {
              bottom: 80px !important;
              right: 10px !important;
            }
          }

          @media (max-width: 480px) {
            .sponsor-card {
              width: 180px !important;
            }
            
            .sponsor-card:first-of-type {
              top: 70px !important;
              left: 8px !important;
            }
            
            .sponsor-card:last-of-type {
              bottom: 70px !important;
              right: 8px !important;
            }
          }
        `}
      </style>

      <div style={containerStyle} className="event-container">
        <Navbar />
        <div style={contentWrapperStyle} className="content-wrapper">
          
          {/* Hero Section */}
          <div style={heroSectionStyle} className="hero-section">
            <img
              src={mbm1}
              alt="Mumbai Bikers Mania Community"
              style={heroImageStyle}
              className="hero-image"
            />
            <div style={heroOverlayStyle} className="hero-overlay">
              <h1 style={heroTitleStyle} className="hero-title">
                Mumbai Bikers Mania
              </h1>
              <h2 style={heroSubtitleStyle} className="hero-subtitle">
                Riding the Pulse of Mumbai's Motorcycle Culture
              </h2>
              <p style={heroTextStyle} className="hero-text">
                <strong>A Thriving Community on Two Wheels</strong><br/><br/>
                In the bustling streets of Mumbai, where the city never sleeps, a unique community of motorcycle enthusiasts has carved out its own space – fast, loud, and full of life. Mumbai Bikers Mania is not just an event; it is a living, breathing hub for riders who seek adventure, camaraderie, and the sheer joy of the open road.
              </p>
              
              {/* Social Icons in Hero */}
              <div style={heroSocialIconsStyle} className="hero-social-icons">
                <a 
                  href="https://www.instagram.com/mumbaibikersmania?igsh=M2hjcWVwZ3R5bGdh" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={heroIconLinkStyle}
                  className="hero-icon-link"
                >
                  <Instagram size={24} />
                </a>
                <a 
                  href="https://youtube.com/@mumbaibikersmania?si=K0JmveKd3zjzQNTs" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={heroIconLinkStyle}
                  className="hero-icon-link"
                >
                  <Youtube size={24} />
                </a>
              </div>
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

        {/* Sponsor Card 1 */}
        {showSponsor1 && featuredSponsors[0] && (
          <div style={sponsorCard1Style} className="sponsor-card">
            <button 
              onClick={() => setShowSponsor1(false)}
              style={closeBtnStyle}
              className="close-btn"
            >
              <X size={18} />
            </button>
            <div style={sponsorBadgeStyle}>FEATURED</div>
            <div style={sponsorImgWrapperStyle}>
              <img 
                src={featuredSponsors[0].logoUrl} 
                alt={featuredSponsors[0].name}
                style={sponsorImgStyle}
              />
              <div style={sponsorOverlayStyle}></div>
            </div>
            <div style={sponsorInfoStyle}>
              <h3 style={sponsorTitleStyle}>{featuredSponsors[0].name}</h3>
              <p style={sponsorDescStyle}>{featuredSponsors[0].tagline}</p>
              <button 
                onClick={navigateToSponsors}
                style={sponsorBtnStyle}
                className="sponsor-btn"
              >
                <span>Discover More</span>
                <ExternalLink size={16} style={btnIconStyle} />
              </button>
            </div>
          </div>
        )}

        {/* Sponsor Card 2 */}
        {showSponsor2 && featuredSponsors[1] && (
          <div style={sponsorCard2Style} className="sponsor-card">
            <button 
              onClick={() => setShowSponsor2(false)}
              style={closeBtnStyle}
              className="close-btn"
            >
              <X size={18} />
            </button>
            <div style={{...sponsorBadgeStyle, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>PARTNER</div>
            <div style={sponsorImgWrapperStyle}>
              <img 
                src={featuredSponsors[1].logoUrl} 
                alt={featuredSponsors[1].name}
                style={sponsorImgStyle}
              />
              <div style={sponsorOverlayStyle}></div>
            </div>
            <div style={sponsorInfoStyle}>
              <h3 style={sponsorTitleStyle}>{featuredSponsors[1].name}</h3>
              <p style={sponsorDescStyle}>{featuredSponsors[1].tagline}</p>
              <button 
                onClick={navigateToSponsors}
                style={{...sponsorBtnStyle, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}
                className="sponsor-btn"
              >
                <span>Explore Deals</span>
                <ExternalLink size={16} style={btnIconStyle} />
              </button>
            </div>
          </div>
        )}
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

// Sponsor card styles
const sponsorCard1Style = {
  position: 'fixed',
  top: '120px',
  left: '40px',
  width: '320px',
  backgroundColor: '#1a1a1a',
  borderRadius: '16px',
  overflow: 'hidden',
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6)',
  border: '1px solid #2a2a2a',
  zIndex: 999,
  transition: 'all 0.3s ease',
};

const sponsorCard2Style = {
  position: 'fixed',
  bottom: '40px',
  right: '40px',
  width: '320px',
  backgroundColor: '#1a1a1a',
  borderRadius: '16px',
  overflow: 'hidden',
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6)',
  border: '1px solid #2a2a2a',
  zIndex: 999,
  transition: 'all 0.3s ease',
};

const closeBtnStyle = {
  position: 'absolute',
  top: '12px',
  right: '12px',
  background: 'rgba(0, 0, 0, 0.7)',
  backdropFilter: 'blur(10px)',
  border: 'none',
  color: '#fff',
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  zIndex: 10,
  transition: 'all 0.3s ease',
};

const sponsorBadgeStyle = {
  position: 'absolute',
  top: '12px',
  left: '12px',
  background: 'linear-gradient(135deg, #ff4757 0%, #ff6b7a 100%)',
  color: '#fff',
  padding: '4px 12px',
  borderRadius: '20px',
  fontSize: '0.7rem',
  fontWeight: '700',
  letterSpacing: '0.5px',
  zIndex: 10,
  boxShadow: '0 2px 10px rgba(255, 71, 87, 0.4)',
};

const sponsorImgWrapperStyle = {
  position: 'relative',
  width: '100%',
  height: '160px',
  overflow: 'hidden',
};

const sponsorImgStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const sponsorOverlayStyle = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: '60%',
  background: 'linear-gradient(to top, #1a1a1a 0%, transparent 100%)',
};

const sponsorInfoStyle = {
  padding: '20px',
};

const sponsorTitleStyle = {
  fontSize: '1.25rem',
  fontWeight: '700',
  color: '#fff',
  marginBottom: '8px',
  marginTop: 0,
};

const sponsorDescStyle = {
  fontSize: '0.85rem',
  color: '#999',
  lineHeight: '1.5',
  marginBottom: '16px',
};

const sponsorBtnStyle = {
  width: '100%',
  background: 'linear-gradient(135deg, #ff4757 0%, #ff6b7a 100%)',
  color: '#fff',
  padding: '12px 20px',
  border: 'none',
  borderRadius: '10px',
  fontSize: '0.9rem',
  fontWeight: '700',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 15px rgba(255, 71, 87, 0.3)',
};

const btnIconStyle = {
  fontSize: '1rem',
};

export default Events;