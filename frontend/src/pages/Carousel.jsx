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
    centerMode: false,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          dots: false,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          dots: false,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: false,
          centerMode: true,
          centerPadding: '40px',
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: false,
          centerMode: false,
          centerPadding: '0px',
        },
      },
    ],
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>OUR RIDING MOMENTS</h2>
      <div style={styles.sliderWrapper}>
        <Slider {...settings}>
          {images.map((img, index) => (
            <div key={index} style={styles.slideContainer}>
              <div style={styles.imageWrapper}>
                <img src={img} alt={`cycling-${index}`} style={styles.image} className="carousel-image" />
              </div>
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
    padding: "60px 20px",
    textAlign: "center",
    overflow: "hidden",
  },
  heading: {
    fontSize: "32px",
    fontWeight: "800",
    marginBottom: "40px",
    color: "#111",
  },
  sliderWrapper: {
    width: "100%",
    // maxWidth: "1400px",
    // margin: "0 auto",
    // padding: "0 10px",
  },
  slideContainer: {
    // padding: "0 10px",
  },
  imageWrapper: {
    position: "relative",
    width: "100%",
    // borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
  image: {
    width: "100%",
    height: "auto",
    minHeight: "200px",
    aspectRatio: "16 / 9",
    objectFit: "cover",
    display: "block",
    transition: "transform 0.4s ease, box-shadow 0.4s ease",
    cursor: "pointer",
  },
};

// Enhanced styles with better mobile responsiveness
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.innerHTML = `
    .slick-list {
      margin: 0 !important;
      padding: 20px 0 !important;
    }

    .slick-slide {
      opacity: 0.7;
      transition: opacity 0.3s ease;
    }

    .slick-slide.slick-active {
      opacity: 1;
    }

    .slick-dots {
      bottom: -40px !important;
      display: none !important;
    }

    .carousel-image:hover {
      transform: scale(1.05);
      box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.25);
    }

    /* Desktop - 4 images */
    @media (min-width: 1280px) {
      .carousel-image {
        aspect-ratio: 16 / 9;
        min-height: 250px;
      }
    }

    /* Laptop - 3 images */
    @media (min-width: 1024px) and (max-width: 1279px) {
      .carousel-image {
        aspect-ratio: 16 / 9;
        min-height: 220px;
      }
    }

    /* Tablet - 2 images */
    @media (min-width: 768px) and (max-width: 1023px) {
      .carousel-image {
        aspect-ratio: 4 / 3;
        min-height: 280px;
      }
    }

    /* Mobile Large - 1 image with preview */
    @media (min-width: 640px) and (max-width: 767px) {
      .carousel-image {
        aspect-ratio: 1 / 1;
        min-height: 320px;
      }
    }

    /* Mobile Small - 1 full image */
    @media (max-width: 639px) {
      .carousel-image {
        aspect-ratio: 4 / 3;
        min-height: 280px;
        max-height: 400px;
      }

      .slick-list {
        padding: 10px 0 !important;
      }

      .slick-slide > div {
        padding: 0 5px !important;
      }
    }

    /* Extra small mobile */
    @media (max-width: 480px) {
      .carousel-image {
        aspect-ratio: 1 / 1;
        min-height: 300px;
        max-height: 350px;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default GalleryCarousel;