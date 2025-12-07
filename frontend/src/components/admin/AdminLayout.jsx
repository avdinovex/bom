import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
  FiHome,
  FiUsers,
  FiCreditCard,
  FiCalendar,
  FiMap,
  FiFileText,
  FiMenu,
  FiX,
  FiLogOut,
  FiUser,
  FiBarChart2,
  FiCheckCircle,
  FiGift,
  FiTag,
  FiUserCheck,
  FiStar,
  FiSettings
} from 'react-icons/fi';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: FiHome
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: FiUsers
    },
    {
      name: 'Team Members',
      href: '/admin/team',
      icon: FiUserCheck
    },
    {
      name: 'Bookings',
      href: '/admin/bookings',
      icon: FiCreditCard
    },
    {
      name: 'Event Bookings',
      href: '/admin/event-bookings',
      icon: FiCreditCard
    },
    {
      name: 'Audience Registrations',
      href: '/admin/audience-registrations',
      icon: FiUsers
    },
    {
      name: 'Events',
      href: '/admin/events',
      icon: FiCalendar
    },
    {
      name: 'Upcoming Rides',
      href: '/admin/upcoming-rides',
      icon: FiMap
    },
    {
      name: 'Completed Rides',
      href: '/admin/completed-rides',
      icon: FiCheckCircle
    },
    {
      name: 'Blogs',
      href: '/admin/blogs',
      icon: FiFileText
    },
    {
      name: 'Sponsors',
      href: '/admin/sponsors',
      icon: FiGift
    },
    {
      name: 'Sponsor Categories',
      href: '/admin/sponsor-categories',
      icon: FiTag
    },
    {
      name: 'Coupons',
      href: '/admin/coupons',
      icon: FiTag
    },
    {
      name: 'Registration Entities',
      href: '/admin/registration-entities',
      icon: FiSettings
    },
    {
      name: 'Testimonials',
      href: '/admin/testimonials',
      icon: FiStar
    }
  ];

  const isActive = (href) => location.pathname === href;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col`}>
        
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 bg-blue-600 flex-shrink-0">
          <div className="flex items-center">
            <FiBarChart2 className="h-8 w-8 text-white" />
            <span className="ml-2 text-lg font-semibold text-white">BOM Admin</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-gray-200"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`${
                isActive(item.href)
                  ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
              } group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200`}
            >
              <item.icon className={`${
                isActive(item.href) ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'
              } mr-3 h-5 w-5 transition-colors duration-200 flex-shrink-0`} />
              {item.name}
            </Link>
          ))}
        </nav>

        {/* User Info & Logout - Fixed at bottom */}
        <div className="border-t border-gray-200 p-4 flex-shrink-0">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                <FiUser className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-3 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.fullName}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
          >
            <FiLogOut className="mr-3 h-5 w-5 flex-shrink-0" />
            Logout
          </button>
        </div>
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-600"
              >
                <FiMenu className="h-6 w-6" />
              </button>
              <h1 className="ml-4 text-2xl font-semibold text-gray-900 lg:ml-0">
                {menuItems.find(item => item.href === location.pathname)?.name || 'Admin Panel'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Welcome back, {user?.fullName}
              </span>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;