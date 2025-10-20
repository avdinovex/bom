import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from './Footer';
import api from '../services/api';

const BlogDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { slug } = useParams();
  const [blog, setBlog] = useState(location.state || null);
  const [loading, setLoading] = useState(!location.state);
  const [relatedBlogs, setRelatedBlogs] = useState([]);

  useEffect(() => {
    if (!blog && slug) {
      fetchBlog();
    } else if (blog) {
      fetchRelatedBlogs();
    }
  }, [slug, blog]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/blogs/${slug}`);
      
      if (response.data?.success && response.data?.data?.blog) {
        setBlog(response.data.data.blog);
      } else {
        toast.error('Blog not found');
        navigate('/blogs');
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
      toast.error('Failed to load blog');
      navigate('/blogs');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedBlogs = async () => {
    try {
      const response = await api.get(`/blogs?category=${blog.category}&limit=3`);
      
      if (response.data?.success && response.data?.data?.data) {
        // Filter out current blog
        const related = response.data.data.data.filter(b => b._id !== blog._id);
        setRelatedBlogs(related.slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching related blogs:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', color: '#fff', paddingTop: '200px', backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
        <p>Loading article...</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div style={{ textAlign: 'center', color: '#fff', paddingTop: '200px', backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
        <p>Article not found.</p>
        <button 
          onClick={() => navigate('/blogs')} 
          style={{ 
            marginTop: '20px', 
            color: '#ff4757',
            background: 'none',
            border: '2px solid #ff4757',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Go Back to Blogs
        </button>
      </div>
    );
  }

  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    color: 'white',
    paddingTop: '100px',
    paddingBottom: '80px'
  };

  const contentWrapperStyle = {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '0 30px'
  };

  const imageStyle = {
    width: '100%',
    maxHeight: '500px',
    objectFit: 'cover',
    borderRadius: '12px',
    marginBottom: '40px'
  };

  const titleStyle = {
    fontSize: '2.5rem',
    fontWeight: '800',
    marginBottom: '20px'
  };

  const metaStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
    alignItems: 'center',
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '1px solid #333'
  };

  const dateStyle = {
    color: '#aaa',
    fontSize: '0.9rem'
  };

  const authorStyle = {
    color: '#ff4757',
    fontSize: '0.9rem',
    fontWeight: '600'
  };

  const categoryBadgeStyle = {
    backgroundColor: '#ff4757',
    color: '#fff',
    padding: '4px 12px',
    borderRadius: '15px',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase'
  };

  const statsStyle = {
    display: 'flex',
    gap: '15px',
    fontSize: '0.8rem',
    color: '#888'
  };

  const contentStyle = {
    fontSize: '1.1rem',
    lineHeight: '1.8',
    color: '#ddd',
    marginBottom: '50px'
  };

  const relatedSectionStyle = {
    marginTop: '60px',
    paddingTop: '40px',
    borderTop: '1px solid #333'
  };

  const relatedTitleStyle = {
    fontSize: '1.8rem',
    fontWeight: '700',
    marginBottom: '30px',
    color: '#fff'
  };

  const relatedGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px'
  };

  const relatedCardStyle = {
    backgroundColor: '#111',
    borderRadius: '10px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'transform 0.3s ease'
  };

  const relatedImageStyle = {
    width: '100%',
    height: '150px',
    objectFit: 'cover'
  };

  const relatedContentStyle = {
    padding: '15px'
  };

  const relatedCardTitleStyle = {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '8px',
    lineHeight: '1.3'
  };

  return (
    <div style={containerStyle}>
      <Navbar />
      <div style={contentWrapperStyle}>
        {/* Back Button */}
        <button
          onClick={() => navigate('/blogs')}
          style={{
            backgroundColor: 'transparent',
            border: '2px solid #ff4757',
            color: '#ff4757',
            padding: '8px 16px',
            borderRadius: '5px',
            cursor: 'pointer',
            marginBottom: '30px',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}
        >
          ← Back to Blogs
        </button>

        {/* Featured Image */}
        {blog.imgUrl && (
          <img src={blog.imgUrl} alt={blog.title} style={imageStyle} />
        )}

        {/* Category Badge */}
        <div style={categoryBadgeStyle}>
          {blog.category}
        </div>

        {/* Title */}
        <h1 style={titleStyle}>{blog.title}</h1>

        {/* Meta Information */}
        <div style={metaStyle}>
          <span style={dateStyle}>
            {blog.publishedAt ? formatDate(blog.publishedAt) : formatDate(blog.createdAt)}
          </span>
          {blog.author && (
            <span style={authorStyle}>
              By {blog.author.fullName}
            </span>
          )}
          <div style={statsStyle}>
            <span>📖 {blog.readTime || 5} min read</span>
            <span>👁️ {blog.views || 0} views</span>
            <span>❤️ {blog.likes?.length || 0} likes</span>
          </div>
        </div>

        {/* Content */}
        <div 
          style={contentStyle}
          dangerouslySetInnerHTML={{ 
            __html: blog.content || blog.excerpt || 'Content not available.' 
          }}
        />

        {/* Related Blogs */}
        {relatedBlogs.length > 0 && (
          <div style={relatedSectionStyle}>
            <h2 style={relatedTitleStyle}>Related Articles</h2>
            <div style={relatedGridStyle}>
              {relatedBlogs.map((relatedBlog) => (
                <div
                  key={relatedBlog._id}
                  style={relatedCardStyle}
                  onClick={() => {
                    setBlog(relatedBlog);
                    navigate(`/blog/${relatedBlog.slug}`, { state: relatedBlog });
                    window.scrollTo(0, 0);
                  }}
                >
                  <img
                    src={relatedBlog.imgUrl || '/default-blog-image.jpg'}
                    alt={relatedBlog.title}
                    style={relatedImageStyle}
                  />
                  <div style={relatedContentStyle}>
                    <h3 style={relatedCardTitleStyle}>{relatedBlog.title}</h3>
                    <p style={{ ...dateStyle, fontSize: '0.8rem' }}>
                      {relatedBlog.publishedAt ? formatDate(relatedBlog.publishedAt) : formatDate(relatedBlog.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default BlogDetails;
