import React, { useState, useEffect } from "react";
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from "../components/Navbar.jsx";
import Footer from "./Footer.jsx";
import BookingForm from "../components/BookingForm.jsx";
import api from "../services/api.js";
import openRide from "../assets/openride.jpg";

const UpcomingRides = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRide, setSelectedRide] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    try {
      setLoading(true);
      const response = await api.get('/rides');
      
      if (response.data?.success && response.data?.data?.data) {
        setRides(response.data.data.data);
      } else {
        setRides([]);
      }
    } catch (error) {
      console.error('Error fetching rides:', error);
      toast.error('Failed to load rides');
      setRides([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookRide = (ride) => {
    // Check if user is authenticated before opening the form
    if (!user) {
      toast.error('Please sign in to book a ride');
      navigate('/login');
      return;
    }

    setSelectedRide(ride);
    setShowBookingForm(true);
  };

  const handleBookingSuccess = () => {
    setShowBookingForm(false);
    setSelectedRide(null);
    fetchRides(); // Refresh rides to update capacity
  };

  return (
    <>
      <div style={styles.container} className="rides-container">
        <Navbar />
        <div style={styles.contentWrapper}>
          <h1 style={styles.heading}>Upcoming Rides</h1>
          <p style={styles.subText}>
            Discover thrilling upcoming rides organized by the Brotherhood of Mumbai.
          </p>

          <div style={styles.rideGrid} className="rides-grid">
            {loading ? (
              <div style={styles.loadingContainer}>
                <p>Loading rides...</p>
              </div>
            ) : rides.length > 0 ? (
              rides.map((ride, index) => {
                const isActive = ride.isActive && new Date(ride.startTime) > new Date();
                const isFull = ride.registeredCount >= ride.maxCapacity;
                const canBook = isActive && !isFull;
                
                return (
                  <div
                    key={ride._id || index}
                    className="ride-card"
                    style={{
                      ...styles.rideCard,
                      boxShadow: canBook
                        ? "0 0 30px rgba(255, 71, 87, 0.4)"
                        : "0 0 15px rgba(255,255,255,0.1)",
                      border: canBook ? "2px solid #ff4757" : "1px solid #222",
                    }}
                  >
                    <div style={styles.imageContainer}>
                      <img 
                        src={ride.imgUrl || openRide} 
                        alt={ride.title} 
                        style={styles.image} 
                      />
                      {ride.isFeatured && (
                        <div style={styles.featuredBadge}>Featured</div>
                      )}
                    </div>
                    <div style={styles.cardContent}>
                      <h2 style={styles.rideTitle}>{ride.title}</h2>
                      
                      {ride.slogan && (
                        <p style={styles.slogan}>{ride.slogan}</p>
                      )}
                      
                      <div style={styles.dateTimeContainer}>
                        <p style={styles.date}>
                          📅 {ride.startTime ? new Date(ride.startTime).toLocaleDateString('en-IN') : 'Date TBD'}
                        </p>
                        {ride.endTime && (
                          <p style={styles.endDate}>
                            to {new Date(ride.endTime).toLocaleDateString('en-IN')}
                          </p>
                        )}
                      </div>

                      <p style={styles.venue}>📍 {ride.venue}</p>
                      
                      {ride.route && (
                        <div style={styles.routeInfo}>
                          <p style={styles.routeText}>
                            🛣️ Route: {ride.route.startLocation} → {ride.route.endLocation}
                          </p>
                          {ride.route.waypoints && ride.route.waypoints.length > 0 && (
                            <p style={styles.waypointsText}>
                              Via: {ride.route.waypoints.join(' → ')}
                            </p>
                          )}
                        </div>
                      )}
                      
                      <div style={styles.rideStats}>
                        <div style={styles.statItem}>
                          <span style={styles.statLabel}>Difficulty:</span>
                          <span style={styles.statValue}>{ride.difficulty}</span>
                        </div>
                        <div style={styles.statItem}>
                          <span style={styles.statLabel}>Distance:</span>
                          <span style={styles.statValue}>{ride.distance} km</span>
                        </div>
                        <div style={styles.statItem}>
                          <span style={styles.statLabel}>Registered:</span>
                          <span style={styles.statValue}>{ride.registeredCount || 0}</span>
                        </div>
                        <div style={styles.statItem}>
                          <span style={styles.statLabel}>Fee:</span>
                          <span style={styles.priceValue}>₹{ride.price || 0}</span>
                        </div>
                      </div>

                      <div style={styles.descriptionContainer}>
                        <h4 style={styles.descTitle}>What's Included:</h4>
                        <p style={styles.desc}>{ride.description}</p>
                      </div>

                      {ride.organizer && (
                        <p style={styles.organizer}>
                          Organized by: <strong>{ride.organizer.fullName}</strong>
                        </p>
                      )}

                      {canBook ? (
                        <button 
                          style={styles.openBtn}
                          onClick={() => handleBookRide(ride)}
                        >
                          Book Now - ₹{ride.price}
                        </button>
                      ) : isFull ? (
                        <button style={styles.fullBtn}>Fully Booked</button>
                      ) : (
                        <button style={styles.closedBtn}>
                          {isActive ? 'Inactive' : 'Coming Soon'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={styles.noRidesContainer}>
                <p>No upcoming rides available at the moment.</p>
              </div>
            )}
          </div>
        </div>
         
        {/* Booking Form Modal */}
        {showBookingForm && selectedRide && (
          <BookingForm
            ride={selectedRide}
            onClose={() => {
              setShowBookingForm(false);
              setSelectedRide(null);
            }}
            onSuccess={handleBookingSuccess}
          />
        )}
        <Footer />
      </div>
    </>
  );
};

const styles = {
  container: {
    backgroundColor: "#0a0a0a",
    minHeight: "100vh",
    paddingTop: "100px",
    color: "white",
  },
  contentWrapper: {
    maxWidth: "1300px",
    margin: "0 auto",
    padding: "0 20px 80px",
    textAlign: "center",
  },
  heading: {
    fontSize: "2.8rem",
    fontWeight: "800",
    marginBottom: "10px",
    color: "#fff",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  subText: {
    color: "#aaa",
    fontSize: "1.1rem",
    marginBottom: "50px",
    lineHeight: "1.5",
  },
  rideGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "30px",
    maxWidth: "1200px",
    margin: "0 auto",
    justifyContent: "center",
  },
  rideCard: {
    backgroundColor: "#111",
    borderRadius: "12px",
    overflow: "hidden",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    border: "1px solid #222",
    maxWidth: "380px",
    margin: "0 auto",
  },
  imageContainer: {
    height: "240px",
    overflow: "hidden",
    position: "relative",
  },
  featuredBadge: {
    position: "absolute",
    top: "12px",
    right: "12px",
    backgroundColor: "#ff4757",
    color: "white",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "0.75rem",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.3s ease",
  },
  cardContent: {
    padding: "24px",
  },
  rideTitle: {
    fontSize: "1.4rem",
    fontWeight: "700",
    marginBottom: "8px",
    lineHeight: "1.3",
    color: "#fff",
  },
  slogan: {
    color: "#ff4757",
    fontSize: "0.9rem",
    fontStyle: "italic",
    marginBottom: "12px",
    fontWeight: "500",
  },
  dateTimeContainer: {
    marginBottom: "16px",
  },
  date: {
    color: "#ff4757",
    fontWeight: "600",
    fontSize: "0.9rem",
    margin: "0",
  },
  endDate: {
    color: "#ccc",
    fontSize: "0.85rem",
    margin: "2px 0 0 0",
  },
  venue: {
    color: "#ff4757",
    fontSize: "0.9rem",
    marginBottom: "12px",
    fontWeight: "500",
  },
  routeInfo: {
    marginBottom: "16px",
    backgroundColor: "#1a1a1a",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #333",
  },
  routeText: {
    color: "#fff",
    fontSize: "0.85rem",
    margin: "0 0 6px 0",
    fontWeight: "500",
  },
  waypointsText: {
    color: "#aaa",
    fontSize: "0.8rem",
    margin: "0",
    lineHeight: "1.3",
  },
  rideStats: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "18px",
    backgroundColor: "#0a0a0a",
    padding: "16px",
    borderRadius: "8px",
    border: "1px solid #222",
  },
  statItem: {
    textAlign: "center",
    padding: "8px",
  },
  statLabel: {
    fontSize: "0.75rem",
    color: "#888",
    textTransform: "uppercase",
    marginBottom: "4px",
  },
  statValue: {
    fontSize: "0.9rem",
    color: "#fff",
    fontWeight: "600",
  },
  priceValue: {
    fontSize: "1rem",
    color: "#ff4757",
    fontWeight: "700",
  },
  descriptionContainer: {
    marginBottom: "18px",
    textAlign: "left",
  },
  descTitle: {
    fontSize: "1rem",
    color: "#fff",
    marginBottom: "8px",
    fontWeight: "600",
  },
  desc: {
    fontSize: "0.85rem",
    color: "#ccc",
    lineHeight: "1.5",
    whiteSpace: "pre-line",
  },
  organizer: {
    fontSize: "0.8rem",
    color: "#888",
    marginBottom: "18px",
    textAlign: "center",
  },
  openBtn: {
    backgroundColor: "#ff4757",
    color: "#fff",
    padding: "14px 28px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "1rem",
    width: "100%",
    transition: "all 0.3s ease",
  },
  closedBtn: {
    backgroundColor: "#333",
    color: "#888",
    padding: "14px 28px",
    border: "none",
    borderRadius: "6px",
    cursor: "not-allowed",
    fontWeight: "600",
    fontSize: "1rem",
    width: "100%",
  },
  fullBtn: {
    backgroundColor: "#ff6b6b",
    color: "#fff",
    padding: "14px 28px",
    border: "none",
    borderRadius: "6px",
    cursor: "not-allowed",
    fontWeight: "600",
    fontSize: "1rem",
    width: "100%",
    opacity: 0.8,
  },
  venue: {
    color: "#4ecdc4",
    fontSize: "0.9rem",
    marginBottom: "12px",
    fontWeight: "500",
  },
  loadingContainer: {
    gridColumn: "1 / -1",
    textAlign: "center",
    padding: "40px",
    color: "#aaa",
  },
  noRidesContainer: {
    gridColumn: "1 / -1",
    textAlign: "center",
    padding: "40px",
    color: "#aaa",
  },
};

// Hover effects and responsive styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.innerHTML = `
    .ride-card:hover img {
      transform: scale(1.05);
    }
    .ride-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 0 30px rgba(255, 71, 87, 0.4);
      border-color: #ff4757;
    }
    .openBtn:hover {
      background-color: #ff3742;
      transform: translateY(-2px);
    }
    @media (max-width: 768px) {
      .rides-container h1 { 
        font-size: 2.2rem !important; 
      }
      .rides-grid { 
        grid-template-columns: 1fr !important;
        gap: 20px !important;
        padding: 0 15px !important;
      }
    }
    @media (max-width: 480px) {
      .rides-container h1 { 
        font-size: 1.8rem !important; 
      }
      .rideStats {
        grid-template-columns: 1fr !important;
        gap: 8px !important;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default UpcomingRides;
