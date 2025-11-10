import React, { useState, useEffect } from 'react';
import * as FiIcons from 'react-icons/fi';
import { FiGift, FiCheckCircle, FiArrowRight, FiMail, FiPhone, FiTrendingUp } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import Footer from './Footer';
import api from '../services/api';

const Sponsors = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sponsorDeals, setSponsorDeals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchSponsors();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/sponsor-categories');
      const fetchedCategories = response.data.data;
      setCategories([
        { value: 'all', label: 'All Offers', icon: 'FiGift' },
        ...fetchedCategories.map(cat => ({
          value: cat.value,
          label: cat.name,
          icon: cat.icon
        }))
      ]);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to default categories
      setCategories([
        { value: 'all', label: 'All Offers', icon: 'FiGift' }
      ]);
    }
  };

  const fetchSponsors = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      
      const response = await api.get('/sponsors', { params });
      setSponsorDeals(response.data.data);
    } catch (error) {
      console.error('Error fetching sponsors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDeals = selectedCategory === 'all' 
    ? sponsorDeals 
    : sponsorDeals.filter(deal => deal.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black text-white">
      {/* Hero Section */}
      <Navbar/>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/40 via-red-700/30 to-red-900/40"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                <FiGift className="text-4xl text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-red-400 to-red-600">
              Exclusive Partner Offers
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8">
              Maximize your earnings with incredible discounts from our trusted partners. Save more, earn more!
            </p>
            {/* <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-red-900/30 backdrop-blur-lg rounded-full px-6 py-3 border border-red-500/30">
                <p className="text-sm font-semibold">🎉 50+ Premium Partners</p>
              </div>
              <div className="bg-red-900/30 backdrop-blur-lg rounded-full px-6 py-3 border border-red-500/30">
                <p className="text-sm font-semibold">💰 Save up to 40%</p>
              </div>
              <div className="bg-red-900/30 backdrop-blur-lg rounded-full px-6 py-3 border border-red-500/30">
                <p className="text-sm font-semibold">⚡ Instant Activation</p>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((cat) => {
            const IconComponent = FiIcons[cat.icon] || FiGift;
            return (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-6 py-3 rounded-full font-semibold transition-all flex items-center gap-2 ${
                  selectedCategory === cat.value
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/30 scale-105'
                    : 'bg-gray-900 text-gray-300 hover:bg-gray-800 border border-gray-800'
                }`}
              >
                <IconComponent className="text-lg" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Deals Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500"></div>
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl">No sponsors available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDeals.map((deal) => (
              <div
                key={deal._id}
                className="bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden border border-gray-800 hover:border-red-500 transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/20 hover:-translate-y-2"
              >
                {/* Discount Banner at Top */}
                {deal.discount && (
                  <div className="relative bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 text-center">
                    <h4 className="text-lg font-bold uppercase tracking-wide">{deal.discount}</h4>
                  </div>
                )}

                {/* Card Header with Logo */}
                <div 
                  className="relative h-48 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900"
                >
                  <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
                    <img 
                      src={deal.logoUrl} 
                      alt={deal.name} 
                      className="w-full h-full object-cover rounded-lg" 
                    />
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2 text-white">{deal.name}</h3>
                  <p className="text-red-400 font-semibold mb-4 text-sm flex items-center gap-1">
                    <FiCheckCircle className="text-red-500" />
                    {deal.tagline}
                  </p>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6">{deal.description}</p>

                  {/* Benefits */}
                  {deal.benefits && deal.benefits.length > 0 && (
                    <div className="space-y-2 mb-6">
                      {deal.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <FiCheckCircle className="text-red-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-300">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Validity */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-800">
                    <span className="text-xs text-gray-500">Valid until</span>
                    <span className="text-sm font-semibold text-red-400">
                      {new Date(deal.validUntil).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: '2-digit', 
                        day: '2-digit' 
                      })}
                    </span>
                  </div>

                  {/* CTA Button */}
                  <button className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:from-red-700 hover:to-red-800 hover:shadow-lg hover:shadow-red-500/30 hover:scale-105 transition-all">
                    Claim Offer
                    <FiArrowRight className="text-lg" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Become a Sponsor CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-gradient-to-r from-red-900 via-red-800 to-red-900 rounded-3xl p-12 text-center relative overflow-hidden border border-red-700/50">
          <div className="absolute inset-0 bg-black opacity-30"></div>
          <div className="relative z-10">
            <FiTrendingUp className="text-6xl mx-auto mb-6 text-white" />
            <h2 className="text-4xl font-extrabold mb-4 text-white">Want to Become a Sponsor?</h2>
            <p className="text-xl text-white text-opacity-90 mb-8 max-w-2xl mx-auto">
              Reach thousands of drivers and boost your business. Join our exclusive sponsor network today!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href="mailto:brotherhoodofmumbai@gmail.com"
                className="bg-white text-red-600 px-8 py-4 rounded-full font-bold text-lg flex items-center gap-2 hover:bg-gray-100 transition-all hover:shadow-xl hover:scale-105"
              >
                <FiMail />
                brotherhoodofmumbai@gmail.com
              </a>
              <a 
                href="tel:9821945661"
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg flex items-center gap-2 hover:bg-white hover:text-red-600 transition-all hover:shadow-xl hover:scale-105"
              >
                <FiPhone />
                9821945661
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer/>
    

      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        
        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Sponsors;