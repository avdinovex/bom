

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // Handle scroll to section
  useEffect(() => {
    if (location.state?.scrollTo) {
      setTimeout(() => {
        const element = document.getElementById(location.state.scrollTo);
        if (element) element.scrollIntoView({ behavior: "smooth" });
      }, 100);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const navStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "25px 70px",
    zIndex: 1000,
    background: "linear-gradient(to bottom, rgba(0,0,0,0.9), rgba(0,0,0,0))",
    boxSizing: "border-box",
  };

  const logoImageStyle = {
    height: "80px",
    width: "auto",
    objectFit: "contain",
    cursor: "pointer",
  };

  const navLinksContainer = {
    display: "flex",
    gap: "45px",
    alignItems: "center",
  };

  const linkStyle = {
    color: "#fff",
    textDecoration: "none",
    fontSize: "0.95rem",
    fontWeight: "700",
    letterSpacing: "1.5px",
    transition: "color 0.3s ease",
    position: "relative",
    cursor: "pointer",
  };

  const buttonStyle = {
    backgroundColor: "#ff4757",
    color: "#fff",
    border: "none",
    padding: "14px 30px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "0.85rem",
    letterSpacing: "1.5px",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    whiteSpace: "nowrap",
  };

  const arrowStyle = {
    fontSize: "1.3rem",
    fontWeight: "bold",
  };

  const hamburgerStyle = {
    display: "none",
    flexDirection: "column",
    gap: "5px",
    cursor: "pointer",
    zIndex: 1001,
  };

  const barStyle = {
    width: "25px",
    height: "3px",
    backgroundColor: "#fff",
    transition: "all 0.3s ease",
  };

  const mobileMenuStyle = {
    position: "fixed",
    top: 0,
    right: mobileMenuOpen ? "0" : "-100%",
    width: "100%",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.98)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "30px",
    transition: "right 0.3s ease",
    zIndex: 999,
  };

  const navItems = [
    { text: "HOME", path: "/", section: "home" },
    { text: "RIDES", path: "/rides" },
    { text: "EVENT", path: "/events" },
    { text: "BLOG", path: "/blog" },
    { text: "RIDERS", path: "/riders"},
    { text: "CONTACT US", path: "/", section: "contactus" },
  ];

  const handleNavClick = (item) => {
    const isOnMainPage = location.pathname === "/";
    if (item.section) {
      if (isOnMainPage) {
        const element = document.getElementById(item.section);
        if (element) element.scrollIntoView({ behavior: "smooth" });
      } else {
        navigate("/", { state: { scrollTo: item.section } });
      }
    } else {
      navigate(item.path);
      window.scrollTo(0, 0);
    }
    setMobileMenuOpen(false); // close menu after clicking a link
  };

  const handleAuthAction = () => {
    if (user) {
      logout();
      navigate('/');
    } else {
      navigate('/login', { state: { from: location } });
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      <style>
        {`
          @media (max-width: 1024px) {
            .nav-links-container {
              gap: 25px !important;
            }
            .nav-link {
              font-size: 0.85rem !important;
            }
            .join-btn {
              padding: 10px 22px !important;
              font-size: 0.8rem !important;
            }
          }

          @media (max-width: 968px) {
            .navbar {
              padding: 20px 40px !important;
            }
            .nav-links-container {
              display: none !important;
            }
            .join-btn-desktop {
              display: none !important;
            }
            .hamburger {
              display: flex !important;
            }
          }

          @media (max-width: 768px) {
            .navbar {
              padding: 18px 35px !important;
            }
            .logo-image {
              height: 42px !important;
            }
          }

          @media (max-width: 480px) {
            .navbar {
              padding: 15px 20px !important;
            }
            .logo-image {
              height: 38px !important;
            }
          }
        `}
      </style>

      <nav style={navStyle} className="navbar">
        <div>
          <img
            src={logo}
            alt="BOM Logo"
            style={logoImageStyle}
            className="logo-image"
            onClick={() => handleNavClick({ path: "/", section: "home" })}
          />
        </div>

        <div style={navLinksContainer} className="nav-links-container">
          {navItems.map((item, index) => (
            <div
              key={index}
              style={linkStyle}
              className="nav-link"
              onClick={() => handleNavClick(item)}
              onMouseEnter={(e) => (e.target.style.color = "#ff4757")}
              onMouseLeave={(e) => (e.target.style.color = "#fff")}
            >
              {item.text}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {user && (
            <span style={{ color: '#fff', fontSize: '0.9rem' }}>
              Welcome, {user.fullName}
            </span>
          )}
          <button
            style={buttonStyle}
            className="join-btn join-btn-desktop"
            onClick={handleAuthAction}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#ff3345";
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#ff4757";
              e.target.style.transform = "translateY(0)";
            }}
          >
            <span style={arrowStyle}>»</span>
            <span>{user ? 'LOGOUT' : 'LOGIN'}</span>
          </button>
        </div>

        {/* SINGLE HAMBURGER ICON — toggles open/close */}
        <div
          style={hamburgerStyle}
          className="hamburger"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <div style={barStyle}></div>
          <div style={barStyle}></div>
          <div style={barStyle}></div>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div style={mobileMenuStyle}>
        {navItems.map((item, index) => (
          <div
            key={index}
            style={{ ...linkStyle, fontSize: "1.2rem" }}
            onClick={() => handleNavClick(item)}
          >
            {item.text}
          </div>
        ))}

        {user && (
          <div style={{ color: '#fff', fontSize: '1rem', textAlign: 'center' }}>
            Welcome, {user.fullName}
          </div>
        )}
        <button
          style={{ ...buttonStyle, marginTop: "20px" }}
          onClick={handleAuthAction}
        >
          <span style={arrowStyle}>»</span>
          <span>{user ? 'LOGOUT' : 'LOGIN'}</span>
        </button>
      </div>
    </>
  );
};

export default Navbar;
