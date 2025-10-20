// import React, { useState, useEffect } from 'react';
// import Kunal from "../assets/Kunal Mestry.png";
// import Parth from "../assets/Parth Mehta.jpg";
// import Aditya from '../assets/Aditya Gajare.jpg';
// import Ajay from '../assets/Ajay Yadav.jpg';
// import Arijit from '../assets/Arijit Das.jpg';
// import Ashish from '../assets/Ashish Mestry.jpg';
// import Jigar from '../assets/Jigar Thakkar.jpg';
// import Poonam from '../assets/Poonam Sanas.jpg';
// import Pralad from '../assets/Pralad Parab.jpg';
// import Soumen from '../assets/Soumen Roy.jpg';

// const ClientSuccessStories = () => {
//   const testimonials = [
//     {
//       id: 1,
//       name: "Kunal Mestry",
//       role: "Founder",
//       image: Kunal
//     },
//     {
//       id: 2,
//       name: "Poonam Sanas",
//       role: "Secretary",
//       image: Poonam
//     },
//     {
//       id: 3,
//       name: "Jigar Thakkar",
//       role: "Treasurer",
//       image: Jigar
//     },
//     {
//       id: 4,
//       name: "Ashish Mestry",
//       role: "Core Member",
//       image: Ashish
//     },
//     {
//       id: 5,
//       name: "Ajay Yadav",
//       role: "Core Member",
//       image: Ajay
//     },
//     {
//       id: 6,
//       name: "Aditya Gajare",
//       role: "Core Member",
//       image: Aditya
//     },
//     {
//       id: 7,
//       name: "Arijit Das",
//       role: "Core Member",
//       image: Arijit
//     },
//     {
//       id: 8,
//       name: "Pralad Parab",
//       role: "Core Member",
//       image: Pralad
//     },
//     {
//       id: 9,
//       name: "Soumen Roy",
//       role: "Core Member",
//       image: Soumen
//     },
//     {
//       id: 10,
//       name: "Parth Mehta",
//       role: "Core Member",
//       image: Parth
//     }
//   ];

//   const [activeIndex, setActiveIndex] = useState(0);
//   const [isAutoPlaying, setIsAutoPlaying] = useState(true);

//   useEffect(() => {
//     if (!isAutoPlaying) return;
    
//     const interval = setInterval(() => {
//       setActiveIndex((prev) => (prev + 1) % testimonials.length);
//     }, 4000);

//     return () => clearInterval(interval);
//   }, [testimonials.length, isAutoPlaying]);

//   const handleAvatarClick = (index) => {
//     setActiveIndex(index);
//     setIsAutoPlaying(false);
//     setTimeout(() => setIsAutoPlaying(true), 8000);
//   };

//   const getPrevIndex = () => {
//     return activeIndex === 0 ? testimonials.length - 1 : activeIndex - 1;
//   };

//   const getNextIndex = () => {
//     return (activeIndex + 1) % testimonials.length;
//   };

//   const handlePrev = () => {
//     setActiveIndex(getPrevIndex());
//     setIsAutoPlaying(false);
//     setTimeout(() => setIsAutoPlaying(true), 8000);
//   };

//   const handleNext = () => {
//     setActiveIndex(getNextIndex());
//     setIsAutoPlaying(false);
//     setTimeout(() => setIsAutoPlaying(true), 8000);
//   };

//   const scrollToTop = () => {
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   return (
//     <>
//       <style>
//         {`
//           @keyframes fadeInUp {
//             from {
//               opacity: 0;
//               transform: translateY(30px);
//             }
//             to {
//               opacity: 1;
//               transform: translateY(0);
//             }
//           }

//           @keyframes shimmer {
//             0% {
//               background-position: -1000px 0;
//             }
//             100% {
//               background-position: 1000px 0;
//             }
//           }

//           @keyframes float {
//             0%, 100% {
//               transform: translateY(0px);
//             }
//             50% {
//               transform: translateY(-10px);
//             }
//           }

//           @keyframes pulse {
//             0%, 100% {
//               box-shadow: 0 0 0 0 rgba(230, 57, 70, 0.7);
//             }
//             50% {
//               box-shadow: 0 0 0 15px rgba(230, 57, 70, 0);
//             }
//           }

//           .core-members-container {
//             animation: fadeInUp 0.8s ease-out;
//           }

//           .testimonial-card {
//             animation: fadeInUp 0.6s ease-out;
//           }

//           .active-card {
//             animation: float 3s ease-in-out infinite;
//           }

//           .card-image-wrapper {
//             position: relative;
//           }

//           .card-image-wrapper::before {
//             content: '';
//             position: absolute;
//             top: -5px;
//             left: -5px;
//             right: -5px;
//             bottom: -5px;
//             border-radius: 50%;
//             background: linear-gradient(45deg, #e63946, #ff6b6b, #e63946);
//             z-index: -1;
//             opacity: 0;
//             transition: opacity 0.3s ease;
//           }

//           .active-card .card-image-wrapper::before {
//             opacity: 1;
//             animation: pulse 2s ease-in-out infinite;
//           }

//           .arrow-button:hover {
//             background: linear-gradient(135deg, #d43240 0%, #e63946 100%) !important;
//             transform: scale(1.1) !important;
//             box-shadow: 0 8px 25px rgba(230, 57, 70, 0.4) !important;
//           }

//           .arrow-button:active {
//             transform: scale(0.95) !important;
//           }

//           .scroll-top:hover {
//             background: linear-gradient(135deg, #d43240 0%, #e63946 100%) !important;
//             transform: rotate(180deg) scale(1.1) !important;
//             box-shadow: 0 8px 25px rgba(230, 57, 70, 0.4) !important;
//           }

//           .avatar:hover {
//             transform: scale(1.15) !important;
//             opacity: 1 !important;
//             box-shadow: 0 8px 20px rgba(230, 57, 70, 0.3) !important;
//           }

//           .header-badge {
//             position: relative;
//             overflow: hidden;
//           }

//           .header-badge::before {
//             content: '';
//             position: absolute;
//             top: -50%;
//             left: -50%;
//             width: 200%;
//             height: 200%;
//             background: linear-gradient(
//               90deg,
//               transparent,
//               rgba(255, 255, 255, 0.3),
//               transparent
//             );
//             animation: shimmer 3s infinite;
//           }

//           @media (max-width: 1024px) {
//             .testimonials-wrapper {
//               gap: 20px !important;
//             }
//             .inactive-card {
//               margin-left: 0 !important;
//               margin-right: 0 !important;
//             }
//             .navigation-arrows {
//               gap: 400px !important;
//             }
//             .avatar-container {
//               gap: 15px !important;
//             }
//             .avatar-container > div {
//               width: 80px !important;
//               height: 80px !important;
//             }
//           }
          
//           @media (max-width: 768px) {
//             .left-card, .right-card {
//               display: none !important;
//             }
//             .testimonials-wrapper {
//               min-height: 450px !important;
//             }
//             .active-card {
//               max-width: 90% !important;
//             }
//             .navigation-arrows {
//               gap: 200px !important;
//             }
//             .avatar-container {
//               gap: 12px !important;
//             }
//             .avatar-container > div {
//               width: 70px !important;
//               height: 70px !important;
//             }
//           }
          
//           @media (max-width: 480px) {
//             .navigation-arrows {
//               gap: 100px !important;
//             }
//             .navigation-arrows button {
//               width: 40px !important;
//               height: 40px !important;
//               font-size: 20px !important;
//             }
//             .avatar-container > div {
//               width: 60px !important;
//               height: 60px !important;
//             }
//             .testimonial-card {
//               padding: 30px 20px !important;
//             }
//           }
//         `}
//       </style>

//       <div style={styles.container} className="core-members-container">
//         {/* Animated Background Elements */}
//         <div style={styles.bgDecoration1}></div>
//         <div style={styles.bgDecoration2}></div>

//         <div style={styles.header}>
//           <div style={styles.headerBadge} className="header-badge">
//             <span style={styles.chevronLeft}>«</span>
//             <span style={styles.headerText}>BROTHERHOOD OF MUMBAI</span>
//             <span style={styles.chevronRight}>»</span>
//           </div>
//         </div>
        
//         <h1 style={styles.title}>
//           <span style={styles.titleHighlight}>Core Team</span>
//           <br />
//           The Heart of BOM
//         </h1>
//         <div style={styles.titleUnderline}></div>

//         <div style={styles.testimonialsWrapper} className="testimonials-wrapper">
//           <div style={{...styles.testimonialCard, ...styles.inactiveLeft}} className="testimonial-card inactive-card left-card">
//             <div className="card-image-wrapper" style={styles.imageWrapper}>
//               <img 
//                 src={testimonials[getPrevIndex()].image} 
//                 alt={testimonials[getPrevIndex()].name}
//                 style={styles.cardImage}
//               />
//             </div>
//             <div style={styles.authorInfo}>
//               <span style={styles.name}>{testimonials[getPrevIndex()].name}</span>
//               <span style={styles.role}>{testimonials[getPrevIndex()].role}</span>
//             </div>
//           </div>

//           <div style={{...styles.testimonialCard, ...styles.activeCard}} className="testimonial-card active-card">
//             <div style={styles.rankBadge}>#{activeIndex + 1}</div>
//             <div className="card-image-wrapper" style={styles.imageWrapper}>
//               <img 
//                 src={testimonials[activeIndex].image} 
//                 alt={testimonials[activeIndex].name}
//                 style={styles.cardImage}
//               />
//             </div>
//             <div style={styles.activeAuthorInfo}>
//               <span style={styles.activeName}>{testimonials[activeIndex].name}</span>
//               <div style={styles.roleBadge}>{testimonials[activeIndex].role}</div>
//             </div>
//           </div>

//           <div style={{...styles.testimonialCard, ...styles.inactiveRight}} className="testimonial-card inactive-card right-card">
//             <div className="card-image-wrapper" style={styles.imageWrapper}>
//               <img 
//                 src={testimonials[getNextIndex()].image} 
//                 alt={testimonials[getNextIndex()].name}
//                 style={styles.cardImage}
//               />
//             </div>
//             <div style={styles.authorInfo}>
//               <span style={styles.name}>{testimonials[getNextIndex()].name}</span>
//               <span style={styles.role}>{testimonials[getNextIndex()].role}</span>
//             </div>
//           </div>
//         </div>

//         <div style={styles.navigationArrows} className="navigation-arrows">
//           <button 
//             style={styles.arrowButton}
//             className="arrow-button"
//             onClick={handlePrev}
//           >
//             «
//           </button>
//           <button 
//             style={styles.arrowButton}
//             className="arrow-button"
//             onClick={handleNext}
//           >
//             »
//           </button>
//         </div>

//         <div style={styles.avatarSection}>
//           <p style={styles.avatarLabel}>SELECT MEMBER</p>
//           <div style={styles.avatarContainer} className="avatar-container">
//             {testimonials.map((testimonial, index) => (
//               <div
//                 key={testimonial.id}
//                 style={{
//                   ...styles.avatar,
//                   ...(index === activeIndex ? styles.activeAvatar : {})
//                 }}
//                 className="avatar"
//                 onClick={() => handleAvatarClick(index)}
//               >
//                 <img 
//                   src={testimonial.image} 
//                   alt={testimonial.name}
//                   style={styles.avatarImage}
//                 />
//                 {index === activeIndex && <div style={styles.activeRing}></div>}
//               </div>
//             ))}
//           </div>
//         </div>

//         <button style={styles.scrollTop} className="scroll-top" onClick={scrollToTop}>
//           ⌃
//         </button>
//       </div>
//     </>
//   );
// };

// const styles = {
//   container: {
//     width: '100%',
//     minHeight: '100vh',
//     background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
//     padding: '60px 20px',
//     fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
//     position: 'relative',
//     overflow: 'hidden'
//   },
//   bgDecoration1: {
//     position: 'absolute',
//     top: '10%',
//     right: '-100px',
//     width: '400px',
//     height: '400px',
//     background: 'radial-gradient(circle, rgba(230, 57, 70, 0.1) 0%, transparent 70%)',
//     borderRadius: '50%',
//     pointerEvents: 'none'
//   },
//   bgDecoration2: {
//     position: 'absolute',
//     bottom: '20%',
//     left: '-150px',
//     width: '500px',
//     height: '500px',
//     background: 'radial-gradient(circle, rgba(230, 57, 70, 0.08) 0%, transparent 70%)',
//     borderRadius: '50%',
//     pointerEvents: 'none'
//   },
//   header: {
//     display: 'flex',
//     justifyContent: 'center',
//     marginBottom: '30px'
//   },
//   headerBadge: {
//     display: 'flex',
//     alignItems: 'center',
//     gap: '15px',
//     background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
//     padding: '12px 35px',
//     borderRadius: '30px',
//     boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
//     position: 'relative'
//   },
//   chevronLeft: {
//     color: '#e63946',
//     fontSize: 'clamp(20px, 3vw, 24px)',
//     fontWeight: 'bold'
//   },
//   chevronRight: {
//     color: '#e63946',
//     fontSize: 'clamp(20px, 3vw, 24px)',
//     fontWeight: 'bold'
//   },
//   headerText: {
//     color: '#fff',
//     fontSize: 'clamp(11px, 2vw, 13px)',
//     fontWeight: '700',
//     letterSpacing: '3px'
//   },
//   title: {
//     textAlign: 'center',
//     fontSize: 'clamp(32px, 6vw, 52px)',
//     fontWeight: '900',
//     color: '#1a1a1a',
//     marginBottom: '15px',
//     letterSpacing: '1px',
//     lineHeight: '1.2'
//   },
//   titleHighlight: {
//     background: 'linear-gradient(135deg, #e63946 0%, #ff6b6b 100%)',
//     WebkitBackgroundClip: 'text',
//     WebkitTextFillColor: 'transparent',
//     backgroundClip: 'text'
//   },
//   titleUnderline: {
//     width: '120px',
//     height: '5px',
//     background: 'linear-gradient(90deg, transparent, #e63946, transparent)',
//     margin: '0 auto 60px',
//     borderRadius: '3px'
//   },
//   testimonialsWrapper: {
//     display: 'flex',
//     justifyContent: 'center',
//     alignItems: 'center',
//     gap: '0',
//     marginBottom: '50px',
//     position: 'relative',
//     minHeight: '450px',
//     zIndex: 1
//   },
//   testimonialCard: {
//     padding: '50px 35px',
//     borderRadius: '20px',
//     textAlign: 'center',
//     transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
//     display: 'flex',
//     flexDirection: 'column',
//     alignItems: 'center',
//     width: '400px',
//     minHeight: '350px',
//     position: 'relative'
//   },
//   activeCard: {
//     background: 'linear-gradient(135deg, #e63946 0%, #d43240 100%)',
//     transform: 'scale(1)',
//     zIndex: 3,
//     opacity: 1,
//     boxShadow: '0 25px 60px rgba(230, 57, 70, 0.35)'
//   },
//   inactiveLeft: {
//     backgroundColor: '#fff',
//     transform: 'scale(0.85)',
//     opacity: 0.6,
//     zIndex: 1,
//     marginRight: '-50px',
//     boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
//   },
//   inactiveRight: {
//     backgroundColor: '#fff',
//     transform: 'scale(0.85)',
//     opacity: 0.6,
//     zIndex: 1,
//     marginLeft: '-50px',
//     boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
//   },
//   rankBadge: {
//     position: 'absolute',
//     top: '20px',
//     right: '25px',
//     background: 'rgba(255, 255, 255, 0.2)',
//     color: '#fff',
//     padding: '6px 14px',
//     borderRadius: '20px',
//     fontSize: '14px',
//     fontWeight: '700',
//     backdropFilter: 'blur(10px)',
//     border: '1px solid rgba(255, 255, 255, 0.3)'
//   },
//   imageWrapper: {
//     position: 'relative',
//     marginBottom: '30px'
//   },
//   cardImage: {
//     width: '160px',
//     height: '160px',
//     borderRadius: '50%',
//     objectFit: 'cover',
//     border: '6px solid rgba(255,255,255,0.3)',
//     position: 'relative',
//     zIndex: 1
//   },
//   authorInfo: {
//     display: 'flex',
//     flexDirection: 'column',
//     gap: '8px',
//     backgroundColor: '#f8f9fa',
//     padding: '18px 35px',
//     borderRadius: '15px',
//     boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)'
//   },
//   activeAuthorInfo: {
//     display: 'flex',
//     flexDirection: 'column',
//     gap: '12px',
//     alignItems: 'center'
//   },
//   activeName: {
//     color: '#fff',
//     fontSize: 'clamp(20px, 3vw, 26px)',
//     fontWeight: '800',
//     textShadow: '2px 2px 8px rgba(0, 0, 0, 0.3)',
//     letterSpacing: '1px'
//   },
//   roleBadge: {
//     background: 'rgba(255, 255, 255, 0.95)',
//     color: '#e63946',
//     padding: '8px 24px',
//     borderRadius: '20px',
//     fontSize: 'clamp(13px, 2vw, 15px)',
//     fontWeight: '700',
//     letterSpacing: '1px',
//     boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)'
//   },
//   name: {
//     color: '#1a1a1a',
//     fontSize: 'clamp(15px, 2vw, 17px)',
//     fontWeight: '700'
//   },
//   role: {
//     color: '#666',
//     fontSize: 'clamp(12px, 2vw, 14px)',
//     fontWeight: '500'
//   },
//   navigationArrows: {
//     display: 'flex',
//     justifyContent: 'center',
//     gap: '620px',
//     marginTop: '-10px',
//     marginBottom: '20px',
//     position: 'relative',
//     zIndex: 1
//   },
//   arrowButton: {
//     background: 'linear-gradient(135deg, #e63946 0%, #d43240 100%)',
//     color: '#fff',
//     border: 'none',
//     width: '60px',
//     height: '40px',
//     borderRadius: '15px',
//     fontSize: '22px',
//     cursor: 'pointer',
//     transition: 'all 0.3s ease',
//     fontWeight: 'bold',
//     boxShadow: '0 6px 20px rgba(230, 57, 70, 0.3)',
//     outline: 'none',
//     // marginBottom: '25px'
//   },
//   avatarSection: {
//     position: 'relative',
//     zIndex: 1,
//     marginBottom: '30px'
//   },
//   avatarLabel: {
//     textAlign: 'center',
//     fontSize: 'clamp(11px, 1.5vw, 13px)',
//     fontWeight: '700',
//     letterSpacing: '3px',
//     color: '#666',
//     marginBottom: '25px'
//   },
//   avatarContainer: {
//     display: 'flex',
//     justifyContent: 'center',
//     alignItems: 'center',
//     gap: '20px',
//     flexWrap: 'wrap',
//     padding: '0 20px'
//   },
//   avatar: {
//     width: '90px',
//     height: '90px',
//     borderRadius: '50%',
//     overflow: 'hidden',
//     cursor: 'pointer',
//     transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
//     border: '4px solid transparent',
//     opacity: 0.6,
//     position: 'relative'
//   },
//   activeAvatar: {
//     border: '4px solid #e63946',
//     transform: 'scale(1.25)',
//     opacity: 1,
//     boxShadow: '0 8px 25px rgba(230, 57, 70, 0.4)'
//   },
//   activeRing: {
//     position: 'absolute',
//     top: '-8px',
//     left: '-8px',
//     right: '-8px',
//     bottom: '-8px',
//     border: '3px solid #e63946',
//     borderRadius: '50%',
//     opacity: 0.3
//   },
//   avatarImage: {
//     width: '100%',
//     height: '100%',
//     objectFit: 'cover'
//   },
//   scrollTop: {
//     position: 'fixed',
//     bottom: '40px',
//     right: '40px',
//     background: 'linear-gradient(135deg, #e63946 0%, #d43240 100%)',
//     color: '#fff',
//     border: 'none',
//     width: '55px',
//     height: '55px',
//     borderRadius: '50%',
//     fontSize: '26px',
//     cursor: 'pointer',
//     transition: 'all 0.4s ease',
//     fontWeight: 'bold',
//     zIndex: 1000,
//     boxShadow: '0 8px 25px rgba(230, 57, 70, 0.3)',
//     outline: 'none'
//   }
// };

// export default ClientSuccessStories;



import React, { useState, useEffect } from 'react';
import { FaInstagram, FaYoutube } from 'react-icons/fa';
import Kunal from "../assets/Kunal Mestry.png";
import Parth from "../assets/Parth Mehta.jpg";
import Aditya from '../assets/Aditya Gajare.jpg';
import Ajay from '../assets/Ajay Yadav.jpg';
import Arijit from '../assets/Arijit Das.jpg';
import Ashish from '../assets/Ashish Mestry.jpg';
import Jigar from '../assets/Jigar Thakkar.jpg';
import Poonam from '../assets/Poonam Sanas.jpg';
import Pralad from '../assets/Pralad Parab.jpg';
import Soumen from '../assets/Soumen Roy.jpg';

const ClientSuccessStories = () => {
  const testimonials = [
    {
      id: 1,
      name: "Kunal Mestry",
      role: "Founder",
      instagram: "https://www.instagram.com/mumbiker_kunal?igsh=emU1a2I0eDE5NmZ3",
      youtube: "https://youtube.com/@mumbikerkunal10?si=O1xM8dlXRp48Evwy",
      image: Kunal
    },
    {
      id: 2,
      name: "Poonam Sanas",
      role: "Secretary",
      instagram: "https://instagram.com/poonamsanas",  // no active insta link
      image: Poonam
    },
    {
      id: 3,
      name: "Jigar Thakkar",
      role: "Treasurer",
      instagram: "https://instagram.com/jigarthakkar",  // no active link 
      youtube: "https://youtube.com/@jigarthakkar",
      image: Jigar
    },
    {
      id: 4,
      name: "Ashish Mestry",
      role: "Core Member",
      instagram: "https://www.instagram.com/_ashish_mestry?igsh=NnZ3OW45ZWp5anhx",
      image: Ashish
    },
    {
      id: 5,
      name: "Ajay Yadav",
      role: "Core Member",
      instagram: "https://instagram.com/ajayyadav",  // no active link 
      image: Ajay
    },
    {
      id: 6,
      name: "Aditya Gajare",
      role: "Core Member",
      instagram: "https://instagram.com/adityagajare",  //  no active link
      
      image: Aditya
    },
    {
      id: 7,
      name: "Arijit Das",
      role: "Core Member",
      instagram: "https://www.instagram.com/a_r_i_j_i_t_d_a_s?igsh=MXdrODlnemkweWpmNw==",
      image: Arijit
    },
    {
      id: 8,
      name: "Pralad Parab",
      role: "Core Member",
      instagram: "https://www.instagram.com/mumbikerkasafar?igsh=bGhyamM1OThpNjQy&utm_source=qr",
      youtube: "https://www.youtube.com/@MumbikerKaSafar",
      image: Pralad
    },
    {
      id: 9,
      name: "Soumen Roy",
      role: "Core Member",
      instagram: "https://instagram.com/soumenroy",  // no active link
      image: Soumen
    },
    {
      id: 10,
      name: "Parth Mehta",
      role: "Core Member",
      instagram: "https://www.instagram.com/parmeh.san?igsh=MXZ5M25udTlhMDd6bw%3D%3D&utm_source=qr",  
      youtube: "https://youtube.com/@rolodexdiaries?si=XUZiQ6Q1Q8vRdtQW",
      image: Parth
    }
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [testimonials.length, isAutoPlaying]);

  const handleAvatarClick = (index) => {
    setActiveIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  const getPrevIndex = () => {
    return activeIndex === 0 ? testimonials.length - 1 : activeIndex - 1;
  };

  const getNextIndex = () => {
    return (activeIndex + 1) % testimonials.length;
  };

  const handlePrev = () => {
    setActiveIndex(getPrevIndex());
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  const handleNext = () => {
    setActiveIndex(getNextIndex());
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

          @keyframes shimmer {
            0% {
              background-position: -1000px 0;
            }
            100% {
              background-position: 1000px 0;
            }
          }

          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
            }
          }

          @keyframes pulse {
            0%, 100% {
              box-shadow: 0 0 0 0 rgba(230, 57, 70, 0.7);
            }
            50% {
              box-shadow: 0 0 0 15px rgba(230, 57, 70, 0);
            }
          }

          .core-members-container {
            animation: fadeInUp 0.8s ease-out;
          }

          .testimonial-card {
            animation: fadeInUp 0.6s ease-out;
          }

          .active-card {
            animation: float 3s ease-in-out infinite;
          }

          .card-image-wrapper {
            position: relative;
          }

          .card-image-wrapper::before {
            content: '';
            position: absolute;
            top: -5px;
            left: -5px;
            right: -5px;
            bottom: -5px;
            border-radius: 50%;
            background: linear-gradient(45deg, #e63946, #ff6b6b, #e63946);
            z-index: -1;
            opacity: 0;
            transition: opacity 0.3s ease;
          }

          .active-card .card-image-wrapper::before {
            opacity: 1;
            animation: pulse 2s ease-in-out infinite;
          }

          .arrow-button:hover {
            background: linear-gradient(135deg, #d43240 0%, #e63946 100%) !important;
            transform: scale(1.1) !important;
            box-shadow: 0 8px 25px rgba(230, 57, 70, 0.4) !important;
          }

          .arrow-button:active {
            transform: scale(0.95) !important;
          }

          .scroll-top:hover {
            background: linear-gradient(135deg, #d43240 0%, #e63946 100%) !important;
            transform: rotate(180deg) scale(1.1) !important;
            box-shadow: 0 8px 25px rgba(230, 57, 70, 0.4) !important;
          }

          .avatar:hover {
            transform: scale(1.15) !important;
            opacity: 1 !important;
            box-shadow: 0 8px 20px rgba(230, 57, 70, 0.3) !important;
          }

          .header-badge {
            position: relative;
            overflow: hidden;
          }

          .header-badge::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(
              90deg,
              transparent,
              rgba(255, 255, 255, 0.3),
              transparent
            );
            animation: shimmer 3s infinite;
          }

          .social-button:hover {
            transform: translateY(-2px) scale(1.05);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
          }

          @media (max-width: 1024px) {
            .testimonials-wrapper {
              gap: 20px !important;
            }
            .inactive-card {
              margin-left: 0 !important;
              margin-right: 0 !important;
            }
            .navigation-arrows {
              gap: 400px !important;
            }
            .avatar-container {
              gap: 15px !important;
            }
            .avatar-container > div {
              width: 80px !important;
              height: 80px !important;
            }
          }
          
          @media (max-width: 768px) {
            .left-card, .right-card {
              display: none !important;
            }
            .testimonials-wrapper {
              min-height: 450px !important;
            }
            .active-card {
              max-width: 90% !important;
            }
            .navigation-arrows {
              gap: 200px !important;
            }
            .avatar-container {
              gap: 12px !important;
            }
            .avatar-container > div {
              width: 70px !important;
              height: 70px !important;
            }
          }
          
          @media (max-width: 480px) {
            .navigation-arrows {
              gap: 100px !important;
            }
            .navigation-arrows button {
              width: 40px !important;
              height: 40px !important;
              font-size: 20px !important;
            }
            .avatar-container > div {
              width: 60px !important;
              height: 60px !important;
            }
            .testimonial-card {
              padding: 30px 20px !important;
            }
          }
        `}
      </style>

      <div style={styles.container} className="core-members-container">
        {/* Animated Background Elements */}
        <div style={styles.bgDecoration1}></div>
        <div style={styles.bgDecoration2}></div>

        <div style={styles.header}>
          <div style={styles.headerBadge} className="header-badge">
            <span style={styles.chevronLeft}>«</span>
            <span style={styles.headerText}>BROTHERHOOD OF MUMBAI</span>
            <span style={styles.chevronRight}>»</span>
          </div>
        </div>
        
        <h1 style={styles.title}>
          <span style={styles.titleHighlight}>Core Team</span>
          <br />
          The Heart of BOM
        </h1>
        <div style={styles.titleUnderline}></div>

        <div style={styles.testimonialsWrapper} className="testimonials-wrapper">
          <div style={{...styles.testimonialCard, ...styles.inactiveLeft}} className="testimonial-card inactive-card left-card">
            <div className="card-image-wrapper" style={styles.imageWrapper}>
              <img 
                src={testimonials[getPrevIndex()].image} 
                alt={testimonials[getPrevIndex()].name}
                style={styles.cardImage}
              />
            </div>
            <div style={styles.authorInfo}>
              <span style={styles.name}>{testimonials[getPrevIndex()].name}</span>
              <span style={styles.role}>{testimonials[getPrevIndex()].role}</span>
            </div>
          </div>

          <div style={{...styles.testimonialCard, ...styles.activeCard}} className="testimonial-card active-card">
            <div style={styles.rankBadge}>#{activeIndex + 1}</div>
            <div className="card-image-wrapper" style={styles.imageWrapper}>
              <img 
                src={testimonials[activeIndex].image} 
                alt={testimonials[activeIndex].name}
                style={styles.cardImage}
              />
            </div>
            <div style={styles.activeAuthorInfo}>
              <span style={styles.activeName}>{testimonials[activeIndex].name}</span>
              <div style={styles.roleBadge}>{testimonials[activeIndex].role}</div>
              
              {/* Social Media Buttons */}
              <div style={styles.socialButtons}>
                <a
                  href={testimonials[activeIndex].instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.socialButton}
                  className="social-button"
                >
                  <FaInstagram size={18} />
                </a>
                <a
                  href={testimonials[activeIndex].youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{...styles.socialButton, ...styles.youtubeButton}}
                  className="social-button"
                >
                  <FaYoutube size={18} />
                </a>
              </div>
            </div>
          </div>

          <div style={{...styles.testimonialCard, ...styles.inactiveRight}} className="testimonial-card inactive-card right-card">
            <div className="card-image-wrapper" style={styles.imageWrapper}>
              <img 
                src={testimonials[getNextIndex()].image} 
                alt={testimonials[getNextIndex()].name}
                style={styles.cardImage}
              />
            </div>
            <div style={styles.authorInfo}>
              <span style={styles.name}>{testimonials[getNextIndex()].name}</span>
              <span style={styles.role}>{testimonials[getNextIndex()].role}</span>
            </div>
          </div>
        </div>

        <div style={styles.navigationArrows} className="navigation-arrows">
          <button 
            style={styles.arrowButton}
            className="arrow-button"
            onClick={handlePrev}
          >
            «
          </button>
          <button 
            style={styles.arrowButton}
            className="arrow-button"
            onClick={handleNext}
          >
            »
          </button>
        </div>

        <div style={styles.avatarSection}>
          <p style={styles.avatarLabel}>SELECT MEMBER</p>
          <div style={styles.avatarContainer} className="avatar-container">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                style={{
                  ...styles.avatar,
                  ...(index === activeIndex ? styles.activeAvatar : {})
                }}
                className="avatar"
                onClick={() => handleAvatarClick(index)}
              >
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name}
                  style={styles.avatarImage}
                />
                {index === activeIndex && <div style={styles.activeRing}></div>}
              </div>
            ))}
          </div>
        </div>

        <button style={styles.scrollTop} className="scroll-top" onClick={scrollToTop}>
          ⌃
        </button>
      </div>
    </>
  );
};

const styles = {
  container: {
    width: '100%',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
    padding: '60px 20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    position: 'relative',
    overflow: 'hidden'
  },
  bgDecoration1: {
    position: 'absolute',
    top: '10%',
    right: '-100px',
    width: '400px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(230, 57, 70, 0.1) 0%, transparent 70%)',
    borderRadius: '50%',
    pointerEvents: 'none'
  },
  bgDecoration2: {
    position: 'absolute',
    bottom: '20%',
    left: '-150px',
    width: '500px',
    height: '500px',
    background: 'radial-gradient(circle, rgba(230, 57, 70, 0.08) 0%, transparent 70%)',
    borderRadius: '50%',
    pointerEvents: 'none'
  },
  header: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '30px'
  },
  headerBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
    padding: '12px 35px',
    borderRadius: '30px',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
    position: 'relative'
  },
  chevronLeft: {
    color: '#e63946',
    fontSize: 'clamp(20px, 3vw, 24px)',
    fontWeight: 'bold'
  },
  chevronRight: {
    color: '#e63946',
    fontSize: 'clamp(20px, 3vw, 24px)',
    fontWeight: 'bold'
  },
  headerText: {
    color: '#fff',
    fontSize: 'clamp(11px, 2vw, 13px)',
    fontWeight: '700',
    letterSpacing: '3px'
  },
  title: {
    textAlign: 'center',
    fontSize: 'clamp(32px, 6vw, 52px)',
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: '15px',
    letterSpacing: '1px',
    lineHeight: '1.2'
  },
  titleHighlight: {
    background: 'linear-gradient(135deg, #e63946 0%, #ff6b6b 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  titleUnderline: {
    width: '120px',
    height: '5px',
    background: 'linear-gradient(90deg, transparent, #e63946, transparent)',
    margin: '0 auto 60px',
    borderRadius: '3px'
  },
  testimonialsWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '0',
    marginBottom: '50px',
    position: 'relative',
    minHeight: '450px',
    zIndex: 1
  },
  testimonialCard: {
    padding: '50px 35px',
    borderRadius: '20px',
    textAlign: 'center',
    transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '400px',
    minHeight: '350px',
    position: 'relative'
  },
  activeCard: {
    background: 'linear-gradient(135deg, #e63946 0%, #d43240 100%)',
    transform: 'scale(1)',
    zIndex: 3,
    opacity: 1,
    boxShadow: '0 25px 60px rgba(230, 57, 70, 0.35)'
  },
  inactiveLeft: {
    backgroundColor: '#fff',
    transform: 'scale(0.85)',
    opacity: 0.6,
    zIndex: 1,
    marginRight: '-50px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
  },
  inactiveRight: {
    backgroundColor: '#fff',
    transform: 'scale(0.85)',
    opacity: 0.6,
    zIndex: 1,
    marginLeft: '-50px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
  },
  rankBadge: {
    position: 'absolute',
    top: '20px',
    right: '25px',
    background: 'rgba(255, 255, 255, 0.2)',
    color: '#fff',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '700',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)'
  },
  imageWrapper: {
    position: 'relative',
    marginBottom: '30px'
  },
  cardImage: {
    width: '160px',
    height: '160px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '6px solid rgba(255,255,255,0.3)',
    position: 'relative',
    zIndex: 1
  },
  authorInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    backgroundColor: '#f8f9fa',
    padding: '18px 35px',
    borderRadius: '15px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)'
  },
  activeAuthorInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    alignItems: 'center'
  },
  activeName: {
    color: '#fff',
    fontSize: 'clamp(20px, 3vw, 26px)',
    fontWeight: '800',
    textShadow: '2px 2px 8px rgba(0, 0, 0, 0.3)',
    letterSpacing: '1px'
  },
  roleBadge: {
    background: 'rgba(255, 255, 255, 0.95)',
    color: '#e63946',
    padding: '8px 24px',
    borderRadius: '20px',
    fontSize: 'clamp(13px, 2vw, 15px)',
    fontWeight: '700',
    letterSpacing: '1px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)'
  },
  socialButtons: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px'
  },
  socialButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.95)',
    color: '#e63946',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    cursor: 'pointer'
  },
  youtubeButton: {
    color: '#FF0000'
  },
  name: {
    color: '#1a1a1a',
    fontSize: 'clamp(15px, 2vw, 17px)',
    fontWeight: '700'
  },
  role: {
    color: '#666',
    fontSize: 'clamp(12px, 2vw, 14px)',
    fontWeight: '500'
  },
  navigationArrows: {
    display: 'flex',
    justifyContent: 'center',
    gap: '620px',
    marginTop: '-10px',
    marginBottom: '20px',
    position: 'relative',
    zIndex: 1
  },
  arrowButton: {
    background: 'linear-gradient(135deg, #e63946 0%, #d43240 100%)',
    color: '#fff',
    border: 'none',
    width: '60px',
    height: '40px',
    borderRadius: '15px',
    fontSize: '22px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontWeight: 'bold',
    boxShadow: '0 6px 20px rgba(230, 57, 70, 0.3)',
    outline: 'none'
  },
  avatarSection: {
    position: 'relative',
    zIndex: 1,
    marginBottom: '30px'
  },
  avatarLabel: {
    textAlign: 'center',
    fontSize: 'clamp(11px, 1.5vw, 13px)',
    fontWeight: '700',
    letterSpacing: '3px',
    color: '#666',
    marginBottom: '25px'
  },
  avatarContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap',
    padding: '0 20px'
  },
  avatar: {
    width: '90px',
    height: '90px',
    borderRadius: '50%',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
    border: '4px solid transparent',
    opacity: 0.6,
    position: 'relative'
  },
  activeAvatar: {
    border: '4px solid #e63946',
    transform: 'scale(1.25)',
    opacity: 1,
    boxShadow: '0 8px 25px rgba(230, 57, 70, 0.4)'
  },
  activeRing: {
    position: 'absolute',
    top: '-8px',
    left: '-8px',
    right: '-8px',
    bottom: '-8px',
    border: '3px solid #e63946',
    borderRadius: '50%',
    opacity: 0.3
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  scrollTop: {
    position: 'fixed',
    bottom: '40px',
    right: '40px',
    background: 'linear-gradient(135deg, #e63946 0%, #d43240 100%)',
    color: '#fff',
    border: 'none',
    width: '55px',
    height: '55px',
    borderRadius: '50%',
    fontSize: '26px',
    cursor: 'pointer',
    transition: 'all 0.4s ease',
    fontWeight: 'bold',
    zIndex: 1000,
    boxShadow: '0 8px 25px rgba(230, 57, 70, 0.3)',
    outline: 'none'
  }
};

export default ClientSuccessStories;