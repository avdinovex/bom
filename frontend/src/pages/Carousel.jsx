import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import cycling1 from "../assets/cycling.jpg";
import cycling2 from "../assets/cycling1.jpg";
import cycling3 from "../assets/cycling2.jpg";
import cycling4 from "../assets/cycling3.jpg";
import cycling5 from "../assets/cycling4.jpg";
import cycling6 from "../assets/cycling5.jpg";
import cycling7 from "../assets/cycling6.jpg";

const GalleryCarousel = () => {
  const images = [cycling1, cycling2, cycling3, cycling4, cycling5, cycling6, cycling7];

  const settings = {
    dots: false,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 2500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: false,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1280, // large laptop
        settings: { slidesToShow: 3 },
      },
      {
        breakpoint: 1024, // tablet
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 640, // mobile
        settings: { slidesToShow: 1 },
      },
    ],
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>OUR RIDING MOMENTS</h2>
      <div style={styles.sliderWrapper}>
        <Slider {...settings}>
          {images.map((img, index) => (
            <div key={index} style={styles.imageWrapper}>
              <img src={img} alt={`cycling-${index}`} style={styles.image} className="carousel-image" />
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "#fff",
    padding: "60px 0",
    textAlign: "center",
    overflow: "hidden", // removes scrollbars or hidden space
  },
  heading: {
    fontSize: "32px",
    fontWeight: "800",
    marginBottom: "40px",
    color: "#111",
  },
  sliderWrapper: {
    width: "100%",
    margin: 0,
    padding: 0,
  },
  imageWrapper: {
    margin: 0,
    padding: 0,
  },
  image: {
    width: "100%",
    height: "100%",
    aspectRatio: "16 / 9",
    objectFit: "cover",
    transition: "transform 0.4s ease, box-shadow 0.4s ease",
    cursor: "pointer",
  },
};

// ✅ Inline hover + mobile-friendly styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.innerHTML = `
    .slick-list {
      margin: 0 !important;
      padding: 0 !important;
    }

    .slick-slide > div {
      margin: 0 !important;
      padding: 0 !important;
    }

    .carousel-image:hover {
      transform: scale(1.05);
      box-shadow: 0px 6px 18px rgba(0, 0, 0, 0.25);
    }

    @media (max-width: 1024px) {
      .carousel-image {
        aspect-ratio: 4 / 3;
      }
    }

    @media (max-width: 640px) {
      .carousel-image {
        aspect-ratio: 1 / 1;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default GalleryCarousel;
