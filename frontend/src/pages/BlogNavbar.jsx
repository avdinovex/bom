


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from './Footer';
import api from '../services/api';
import mbm1 from '../assets/mbm2.jpg'
const BlogNavbar = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchBlogs();
    fetchCategories();
  }, [selectedCategory]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (selectedCategory && selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      
      const response = await api.get(`/blogs?${params.toString()}`);
      
      if (response.data?.success && response.data?.data?.data) {
        setBlogs(response.data.data.data);
      } else {
        setBlogs([]);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast.error('Failed to load blogs');
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/blogs/categories/list');
      if (response.data?.success && response.data?.data?.categories) {
        setCategories(['all', ...response.data.data.categories]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleBlogClick = (blog) => {
    navigate(`/blog/${blog.slug}`, { state: blog });
  };

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #000000ff 0%, #6e3b3bff 50%, #1a2332 100%)',
    paddingTop: '100px',
    paddingBottom: '80px'
  };

  const contentWrapperStyle = {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 40px'
  };

  const headingStyle = {
    fontSize: '3rem',
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: '60px',
    color: '#fff',
    letterSpacing: '1px'
  };

  const articlesGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '40px',
    marginBottom: '60px'
  };

  const articleCardStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(201, 21, 21, 0.1)',
    transition: 'transform 0.3s, box-shadow 0.3s',
    cursor: 'pointer'
  };

  const imageStyle = {
    width: '100%',
    height: '280px',
    objectFit: 'cover'
  };

  const cardContentStyle = {
    padding: '30px'
  };

  const dateStyle = {
    fontSize: '0.9rem',
    color: '#888',
    marginBottom: '12px',
    fontWeight: '500'
  };

  const titleStyle = {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#000103ff',
    marginBottom: '16px',
    lineHeight: '1.3'
  };

  const descriptionStyle = {
    fontSize: '1rem',
    lineHeight: '1.7',
    color: '#666',
    marginBottom: '20px',
    display: '-webkit-box',
    WebkitLineClamp: 4, // ✅ shows only 4 lines
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  };

  const readMoreStyle = {
    color: '#000000ff',
    fontSize: '0.95rem',
    fontWeight: '600',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'color 0.3s'
  };

  const arrowStyle = {
    fontSize: '1.2rem',
    transition: 'transform 0.3s'
  };

  // New styles for additional features
  const filterSectionStyle = {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '15px',
    marginBottom: '50px'
  };

  const filterButtonStyle = {
    padding: '10px 20px',
    backgroundColor: 'transparent',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '25px',
    color: '#fff',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textTransform: 'capitalize'
  };

  const activeFilterButtonStyle = {
    backgroundColor: '#ff4757',
    borderColor: '#ff4757',
    transform: 'scale(1.05)'
  };

  const categoryBadgeStyle = {
    display: 'inline-block',
    backgroundColor: '#ff4757',
    color: '#fff',
    padding: '4px 12px',
    borderRadius: '15px',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '10px'
  };

  const metaInfoStyle = {
    display: 'flex',
    gap: '15px',
    fontSize: '0.8rem',
    color: '#888',
    marginBottom: '15px',
    flexWrap: 'wrap'
  };

  const loadingStyle = {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '50px',
    color: '#fff',
    fontSize: '1.1rem'
  };

  const noBlogsStyle = {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '50px',
    color: '#aaa',
    fontSize: '1.1rem'
  };

  return (
    <>
      <style>
        {`
          @media (max-width: 968px) {
            .articles-grid {
              grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)) !important;
              gap: 30px !important;
            }
            .blog-heading {
              font-size: 2.5rem !important;
            }
            .content-wrapper {
              padding: 0 25px !important;
            }
            .blog-container {
              padding-top: 80px !important;
            }
          }

          @media (max-width: 768px) {
            .blog-heading {
              font-size: 2rem !important;
              margin-bottom: 40px !important;
            }
            .article-image {
              height: 240px !important;
            }
            .card-content {
              padding: 25px !important;
            }
          }

          @media (max-width: 480px) {
            .blog-heading {
              font-size: 1.8rem !important;
            }
            .content-wrapper {
              padding: 0 20px !important;
            }
            .blog-container {
              padding-top: 60px !important;
            }
            .articles-grid {
              grid-template-columns: 1fr !important;
            }
            .article-image {
              height: 220px !important;
            }
            .card-content {
              padding: 20px !important;
            }
            .article-title {
              font-size: 1.3rem !important;
            }
          }

          .article-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 15px 40px rgba(0,0,0,0.15);
          }

          .read-more:hover {
            color: #ff4757 !important;
          }

          .read-more:hover .arrow {
            transform: translateX(5px);
          }

          .filter-button:hover {
            border-color: #ff4757 !important;
            color: #ff4757 !important;
            transform: translateY(-2px);
          }

          @media (max-width: 768px) {
            .filter-section {
              margin-bottom: 30px !important;
            }
            .filter-button {
              font-size: 0.8rem !important;
              padding: 8px 16px !important;
            }
          }
        `}
      </style>

      <div style={containerStyle} className="blog-container">
        <div style={contentWrapperStyle} className="content-wrapper">
          <Navbar />

          <h1 style={headingStyle} className="blog-heading">
            Latest Articles
          </h1>

          {/* Category Filter */}
          <div style={filterSectionStyle} className="filter-section">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  ...filterButtonStyle,
                  ...(selectedCategory === category ? activeFilterButtonStyle : {})
                }}
                className="filter-button"
              >
                {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          {/* Articles Grid */}
          <div style={articlesGridStyle} className="articles-grid">
            {loading ? (
              <div style={loadingStyle}>
                <p>Loading articles...</p>
              </div>
            ) : blogs.length > 0 ? (
              blogs.map((blog) => (
                <div key={blog._id} style={articleCardStyle} className="article-card">
                  <img
                    src={blog.imgUrl || mbm1}
                    alt={blog.title}
                    style={imageStyle}
                    className="article-image"
                  />
                  <div style={cardContentStyle} className="card-content">
                    <div style={categoryBadgeStyle}>
                      {blog.category}
                    </div>
                    <p style={dateStyle}>
                      {blog.publishedAt ? formatDate(blog.publishedAt) : formatDate(blog.createdAt)}
                    </p>
                    <h2 style={titleStyle} className="article-title">
                      {blog.title}
                    </h2>
                    <p style={descriptionStyle}>
                      {blog.excerpt || blog.content?.substring(0, 200) + '...'}
                    </p>
                    <div style={metaInfoStyle}>
                      <span>📖 {blog.readTime || 5} min read</span>
                      <span>👁️ {blog.views || 0} views</span>
                      <span>❤️ {blog.likes?.length || 0} likes</span>
                    </div>
                    <button
                      onClick={() => handleBlogClick(blog)}
                      style={readMoreStyle}
                      className="read-more"
                    >
                      Read More
                      <span style={arrowStyle} className="arrow">→</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={noBlogsStyle}>
                <p>No articles found for the selected category.</p>
              </div>
            )}
          </div>

          <Footer />
        </div>
      </div>
    </>
  );
};

export default BlogNavbar;
