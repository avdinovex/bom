import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

// Main website components
import Home from "./pages/Home";  
import RideCountdown from "./pages/RideCountDown";
import EventSchedule from "./pages/EventScheduled";
import About from "./pages/About";
import Testimonials from "./pages/Testimonials";
import Carousel from "./pages/Carousel";
import Footer from "./pages/Footer";
import Member from "./pages/Members";
import Discover from "./pages/DiscoverMore.jsx";
import Blogs from "./pages/RidesNavbar.jsx";
import EventNavbar from "./pages/EventNavbar";
import BlogNavbar from "./pages/BlogNavbar";
import SliderTop from "./components/SliderTop";
import Riders from "./pages/Riders.jsx";
import UpcomingRides from "./pages/UpcomingRides";
import Login from "./pages/Login";
import Registration from "./pages/Registration";
import OTPVerification from "./pages/OTPage";
import OTPForgot from "./pages/OTPForgotPass";
import EmailVerify from "./pages/EmailVerify";
import ResetPassword from "./pages/ResetPassword";
import ScrollToTop from "./pages/ScrollToTop.jsx";

// Policy Pages
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsCondition";
import CancellationRefund from "./pages/CancellationRefund";
import ShippingDelivery from "./pages/ShippingDelivery";

// Admin components
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import Rides from './pages/admin/Rides';
import AdminUpcomingRides from './pages/admin/UpcomingRides';
import AdminCompletedRides from './pages/admin/CompletedRides';
import AdminEvents from './pages/admin/Events';
import AdminBlogs from './pages/admin/Blogs';
import Bookings from './pages/admin/Bookings';
import BlogDetails from "./pages/BlogDetails.jsx";

// Event Detail Wrapper Component
function EventDetail() {
  const location = useLocation();
  const eventData = location.state || {
    image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1200&h=600&fit=crop",
    testimonial: "Join us for an unforgettable adventure! This event brings together passionate riders from across the region.",
    name: "Bike Event",
    title: "Host by: Racer Club"
  };

  return (
    <SliderTop
      image={eventData.image}
      testimonial={eventData.testimonial}
      name={eventData.name}
      title={eventData.title}
    />
  );
}

// Main Page Component with scroll handling
function MainPage() {
  const location = useLocation();

  useEffect(() => {
    // Handle scroll to section if state is provided
    if (location.state?.scrollTo) {
      setTimeout(() => {
        const element = document.getElementById(location.state.scrollTo);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      // Clear the state after scrolling
      window.history.replaceState({}, document.title);
    } else {
      // Default scroll to top for fresh page loads
      window.scrollTo(0, 0);
    }
  }, [location]);

  return (
    <div style={{ position: "relative", fontFamily: "Poppins, sans-serif" }}>
      <Home />
      <RideCountdown />
      <Member/>
      <Testimonials />
      <EventSchedule />
      <About />
      <Carousel />
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Toaster position="top-right" />
        <ScrollToTop />
        <Routes>
          {/* Main Website Routes */}
          <Route path="/" element={<MainPage />} />
          <Route path="/upcoming-rides" element={<UpcomingRides />} /> 
          <Route path="/rides" element={<Blogs />} />
          <Route path="/blog" element={<BlogNavbar />} />
          <Route path="/blog/:id" element={<BlogDetails />} />
          <Route path="/events" element={<EventNavbar />} />
          <Route path="/discover-more" element={<Discover />} />
          <Route path="/testimonials-stories" element={<Blogs />} />
          <Route path="/event-detail" element={<EventDetail />} />
         
           <Route path="/riders" element={<Riders />} />
          {/* User Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/verify-otp" element={<OTPVerification />} />
          
          {/* Password Reset Routes */}
          <Route path="/forgot-password" element={<EmailVerify />} />
          <Route path="/verify-otp-forgot" element={<OTPForgot />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Policy Routes */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="/cancellation-refund" element={<CancellationRefund />} />
          {/* <Route path="/shipping-delivery" element={<ShippingDelivery />} /> */}
        
          {/* Admin Login Route */}
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* Admin Dashboard Routes */}
          <Route path="/admin" element={
            <ErrorBoundary>
              <AdminLayout />
            </ErrorBoundary>
          }>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="rides" element={<Rides />} />
            <Route path="upcoming-rides" element={<AdminUpcomingRides />} />
            <Route path="completed-rides" element={<AdminCompletedRides />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="blogs" element={<AdminBlogs />} />
            <Route path="bookings" element={<Bookings />} />
          </Route>
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;