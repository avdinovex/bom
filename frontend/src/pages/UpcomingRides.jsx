import React, { useState, useEffect } from "react";
import { toast } from 'react-hot-toast';
import Navbar from "../components/Navbar.jsx";
import Footer from "./Footer.jsx";
import BookingForm from "../components/BookingForm.jsx";
import api from "../services/api.js";
import openRide from "../assets/openride.jpg";

const UpcomingRides = () => {
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
      <div style={styles.container}>
        <Navbar />
        <div style={styles.contentWrapper}>
          <h1 style={styles.heading}>Upcoming Rides</h1>
          <p style={styles.subText}>
            Discover thrilling upcoming rides organized by the Brotherhood of Mumbai.
          </p>

          <div style={styles.rideGrid}>
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
                    </div>
                    <div style={styles.cardContent}>
                      <h2 style={styles.rideTitle}>{ride.title}</h2>
                      <p style={styles.date}>
                        {ride.startTime ? new Date(ride.startTime).toLocaleDateString() : 'Date TBD'}
                      </p>
                      <p style={styles.venue}>📍 {ride.venue}</p>
                      <p style={styles.desc}>{ride.description}</p>
                      
                      <div style={styles.rideInfo}>
                        <p style={styles.infoItem}>
                          <strong>Difficulty:</strong> {ride.difficulty}
                        </p>
                        <p style={styles.infoItem}>
                          <strong>Capacity:</strong> {ride.registeredCount || 0}/{ride.maxCapacity}
                        </p>
                        <p style={styles.infoItem}>
                          <strong>Fee:</strong> ₹{ride.price || 0}
                        </p>
                      </div>

                      {canBook ? (
                        <button 
                          style={styles.openBtn}
                          onClick={() => handleBookRide(ride)}
                        >
                          Book Now
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
  },
  subText: {
    color: "#aaa",
    fontSize: "1.1rem",
    marginBottom: "50px",
  },
  rideGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "40px",
  },
  rideCard: {
    backgroundColor: "#111",
    borderRadius: "10px",
    overflow: "hidden",
    transition: "transform 0.3s ease",
  },
  imageContainer: {
    height: "230px",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.4s ease",
  },
  cardContent: {
    padding: "20px",
  },
  rideTitle: {
    fontSize: "1.4rem",
    fontWeight: "700",
    marginBottom: "8px",
  },
  date: {
    color: "#ff4757",
    fontWeight: "600",
    marginBottom: "12px",
  },
  desc: {
    fontSize: "1rem",
    color: "#ccc",
    marginBottom: "18px",
  },
  openBtn: {
    backgroundColor: "#ff4757",
    color: "#fff",
    padding: "12px 28px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "all 0.3s",
  },
  closedBtn: {
    backgroundColor: "#333",
    color: "#888",
    padding: "12px 28px",
    border: "none",
    borderRadius: "4px",
    cursor: "not-allowed",
    fontWeight: "bold",
  },
  fullBtn: {
    backgroundColor: "#ff6b6b",
    color: "#fff",
    padding: "12px 28px",
    border: "none",
    borderRadius: "4px",
    cursor: "not-allowed",
    fontWeight: "bold",
    opacity: 0.7,
  },
  venue: {
    color: "#ff4757",
    fontSize: "0.9rem",
    marginBottom: "8px",
    fontWeight: "500",
  },
  rideInfo: {
    marginBottom: "15px",
  },
  infoItem: {
    fontSize: "0.85rem",
    color: "#bbb",
    margin: "4px 0",
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

// Hover effect
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.innerHTML = `
    .ride-card:hover img {
      transform: scale(1.05);
    }
    @media (max-width: 768px) {
      h1 { font-size: 2rem !important; }
      .ride-grid { gap: 20px !important; }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default UpcomingRides;
