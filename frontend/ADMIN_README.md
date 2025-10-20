# BOM Admin Dashboard

A comprehensive admin dashboard for the BOM (Bus Operations Management) system built with React and Tailwind CSS.

## Features

### 🔐 Authentication
- JWT-based authentication
- Role-based access control (admin only)
- Secure login/logout functionality
- Protected routes with automatic redirection

### 📊 Dashboard Overview
- Real-time statistics and metrics
- Quick action buttons
- Recent activity feed
- Popular rides tracking
- Revenue analytics

### 👥 User Management
- View all users with pagination
- Create, edit, and delete users
- Filter by role (admin/user)
- Search functionality
- Export to CSV
- User status management (active/inactive)

### 🚌 Ride Management
- Complete CRUD operations for rides
- Route management (from/to locations)
- Schedule management (departure/arrival times)
- Fare and seat management
- Status tracking (scheduled/ongoing/completed/cancelled)
- Real-time seat availability
- Revenue tracking per ride

### 🎉 Event Management
- Event creation and management
- Date and location tracking
- Attendee management
- Event type categorization
- Image upload support
- Capacity management

### 📝 Blog Management
- Article creation and editing
- Rich text content support
- Category management
- Tag system
- Publication status (published/draft)
- Author management
- View and engagement tracking

### 💳 Bookings & Payments
- Comprehensive booking overview
- Payment status tracking
- Refund management
- Booking cancellation
- Passenger information
- Revenue analytics
- Export functionality

## Technical Stack

### Frontend
- **React 19.1.1** - Main UI library
- **React Router DOM 7.9.4** - Client-side routing
- **Tailwind CSS 4.1.14** - Utility-first CSS framework
- **React Icons** - Icon library
- **React Hot Toast** - Notification system
- **Axios** - HTTP client for API calls

### Backend Integration
- RESTful API endpoints
- JWT authentication
- Role-based authorization
- Error handling and validation
- Razorpay payment integration

## Admin Routes

```
/admin/login          - Admin login page
/admin                - Main dashboard
/admin/dashboard      - Dashboard (alias)
/admin/users          - User management
/admin/rides          - Ride management
/admin/events         - Event management  
/admin/blogs          - Blog management
/admin/bookings       - Bookings & payments
```

## Components Architecture

### Layout Components
- `AdminLayout` - Main admin layout with sidebar navigation
- `ProtectedRoute` - Authentication wrapper for admin routes
- `DataTable` - Reusable data table with CRUD actions
- `Modal` - Reusable modal component
- `LoadingSpinner` - Loading state indicator

### Page Components
- `AdminLogin` - Login form with demo credentials
- `Dashboard` - Overview with statistics and quick actions
- `Users` - User management interface
- `Rides` - Ride management interface
- `Events` - Event management interface
- `Blogs` - Blog management interface
- `Bookings` - Bookings and payments interface

### Context & Services
- `AuthContext` - Authentication state management
- `api.js` - Centralized API service with interceptors

## Key Features

### 🎨 User Interface
- Responsive design for all screen sizes
- Clean and modern admin interface
- Consistent design system
- Mobile-friendly sidebar navigation
- Toast notifications for user feedback

### 🔒 Security
- Protected admin routes
- JWT token management
- Automatic token refresh
- Role-based access control
- Secure logout functionality

### 📱 Responsive Design
- Mobile-first approach
- Collapsible sidebar for mobile
- Responsive data tables
- Touch-friendly interface
- Optimized for tablets and desktops

### 🚀 Performance
- Lazy loading for components
- Optimized API calls
- Efficient state management
- Minimal re-renders
- Fast navigation

## Demo Credentials

For testing purposes, the admin login accepts:
- **Email:** admin@bom.com
- **Password:** admin123

## Usage Instructions

### 1. User Management
- Navigate to `/admin/users`
- View all users in a searchable table
- Click "Add User" to create new users
- Use edit/delete actions in the table
- Filter by role or search by name/email
- Export user data to CSV

### 2. Ride Management
- Navigate to `/admin/rides`
- View all rides with status indicators
- Create new rides with complete details
- Manage seat availability and pricing
- Track ride status and completion
- Monitor revenue per ride

### 3. Event Management
- Navigate to `/admin/events`
- Create and manage community events
- Set capacity and track attendees
- Upload event images
- Categorize by event type
- Monitor upcoming and past events

### 4. Blog Management
- Navigate to `/admin/blogs`
- Create and edit articles
- Manage categories and tags
- Control publication status
- Track views and engagement
- SEO-friendly content management

### 5. Bookings & Payments
- Navigate to `/admin/bookings`
- Monitor all bookings and payments
- Process refunds when needed
- Cancel bookings if necessary
- Track payment status
- Export booking reports

## Data Management

### Statistics Tracking
- Real-time user counts
- Revenue calculations
- Booking analytics
- Popular ride tracking
- Event attendance metrics

### Export Capabilities
- CSV export for users
- Booking reports
- Revenue analytics
- Custom date ranges
- Filtered exports

### Search & Filter
- Global search across all entities
- Status-based filtering
- Date range filtering
- Role-based user filtering
- Category-based content filtering

## Error Handling

- Graceful API error handling
- User-friendly error messages
- Loading states for all operations
- Form validation
- Network error recovery

## Future Enhancements

- Advanced analytics dashboard
- Real-time notifications
- Bulk operations
- Advanced reporting
- Data visualization charts
- Email notification system
- Advanced user permissions
- Audit logging
- Data backup functionality

## Development Notes

### File Structure
```
src/
├── components/
│   ├── admin/
│   │   ├── AdminLayout.jsx
│   │   ├── DataTable.jsx
│   │   ├── Modal.jsx
│   │   └── LoadingSpinner.jsx
│   └── ProtectedRoute.jsx
├── pages/
│   └── admin/
│       ├── AdminLogin.jsx
│       ├── Dashboard.jsx
│       ├── Users.jsx
│       ├── Rides.jsx
│       ├── Events.jsx
│       ├── Blogs.jsx
│       └── Bookings.jsx
├── context/
│   └── AuthContext.jsx
└── services/
    └── api.js
```

### API Endpoints
All admin endpoints are prefixed with `/admin` and require authentication:
- `GET /admin/stats` - Dashboard statistics
- `GET|POST|PUT|DELETE /admin/users` - User management
- `GET|POST|PUT|DELETE /admin/rides` - Ride management
- `GET|POST|PUT|DELETE /admin/events` - Event management
- `GET|POST|PUT|DELETE /admin/blogs` - Blog management
- `GET /admin/bookings` - Booking overview
- `POST /admin/bookings/:id/refund` - Process refunds

This admin system provides a complete solution for managing all aspects of the BOM platform with a professional, user-friendly interface.