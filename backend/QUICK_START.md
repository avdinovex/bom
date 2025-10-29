# Quick Start Guide - Team Management System

## 🚀 Getting Started in 5 Minutes

### Step 1: Environment Setup
Make sure your `.env` file has these variables:
```env
MONGODB_URI=mongodb://localhost:27017/your-database
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Step 2: Run the Seed Script
```bash
cd backend
npm run seed:team
```

This will:
- ✅ Upload 33 member images to Cloudinary
- ✅ Create 10 Core Team Members
- ✅ Create 23 Riders
- ✅ Set up all social media links

### Step 3: Verify the Data
Check your MongoDB:
```bash
# Core team members
GET /api/team/core/list

# Riders
GET /api/team/riders/list

# All members
GET /api/team
```

---

## 📋 Admin Operations

### View All Members
```
GET /api/admin/team?memberType=core
GET /api/admin/team?memberType=rider
```

### Create New Member
```
POST /api/admin/team
Content-Type: multipart/form-data

{
  name: "New Member",
  memberType: "rider",
  memberImage: <file>,
  instagram: "https://...",
  isActive: true
}
```

### Toggle Member Status (Active/Inactive)
```
PATCH /api/admin/team/:id/toggle
```

### Update Member
```
PUT /api/admin/team/:id
Content-Type: multipart/form-data

{
  name: "Updated Name",
  role: "Updated Role",
  memberImage: <file> (optional)
}
```

### Delete Member
```
DELETE /api/admin/team/:id
```

---

## 🎨 Frontend Integration

### In Your Component:
```javascript
import api from './services/api';

// Get core team
const coreTeam = await api.get('/team/core/list');

// Get riders
const riders = await api.get('/team/riders/list');

// Admin: Toggle status
await api.patch(`/admin/team/${id}/toggle`);
```

---

## 🗂️ File Structure

```
backend/
├── src/
│   ├── models/
│   │   └── TeamMember.js          ✅ Updated schema
│   ├── routes/
│   │   ├── team.js                ✅ Public routes
│   │   └── admin/
│   │       └── team.js            ✅ Admin CRUD + Toggle
│   └── seeds/
│       └── teamSeed.js            ✅ Seed script
├── TEAM_MANAGEMENT_README.md      📖 Full documentation
└── TEAM_IMPLEMENTATION_SUMMARY.md 📋 Summary

frontend/
└── src/
    └── pages/
        └── admin/
            ├── TeamMembers.jsx     ✅ List component
            └── TeamMemberForm.jsx  ✅ Create/Edit form
```

---

## 🔑 Key Features

| Feature | Endpoint | Description |
|---------|----------|-------------|
| List Members | `GET /api/team` | Paginated list with filters |
| Core Team | `GET /api/team/core/list` | All core members |
| Riders | `GET /api/team/riders/list` | All riders |
| Create | `POST /api/admin/team` | Upload image + data |
| Update | `PUT /api/admin/team/:id` | Update with optional new image |
| Toggle | `PATCH /api/admin/team/:id/toggle` | Quick activate/deactivate |
| Delete | `DELETE /api/admin/team/:id` | Remove member + image |

---

## 🖼️ Image Upload Details

**Flow:**
```
User selects image → Multer (memory) → Cloudinary → Save URL to DB
```

**Limits:**
- Max size: 5MB
- Allowed: Images only
- Storage: Cloudinary (no local files)
- Folders: `ride-booking/team/core` or `ride-booking/team/riders`

**Automatic Cleanup:**
- Old image deleted when updating
- Image deleted when member is removed

---

## 🧪 Testing with Postman

### 1. Login
```
POST http://localhost:5000/api/auth/login
Body (JSON):
{
  "email": "admin@example.com",
  "password": "your_password"
}
```
→ Copy the `token`

### 2. Create Member
```
POST http://localhost:5000/api/admin/team
Headers:
  Authorization: Bearer <your_token>
Body (form-data):
  name: Test Member
  memberType: rider
  instagram: https://instagram.com/test
  memberImage: <select file>
```

### 3. Toggle Status
```
PATCH http://localhost:5000/api/admin/team/<member_id>/toggle
Headers:
  Authorization: Bearer <your_token>
```

---

## 📊 Database Schema Quick Reference

```javascript
{
  name: String,              // Required
  role: String,              // Optional (e.g., "Founder")
  memberType: String,        // Required: "core" or "rider"
  imgUrl: String,            // Cloudinary URL
  bio: String,
  email: String,
  phone: String,
  social: {
    instagram: String,
    youtube: String,
    facebook: String,
    twitter: String,
    linkedin: String
  },
  isActive: Boolean,         // Default: true
  displayOrder: Number,      // Default: 0
  isLeadership: Boolean      // Default: false
}
```

---

## ⚡ Common Tasks

### Activate/Deactivate Member
```javascript
// Toggle status
await api.patch(`/admin/team/${id}/toggle`);
```

### Add New Rider
```javascript
const formData = new FormData();
formData.append('name', 'New Rider');
formData.append('memberType', 'rider');
formData.append('memberImage', file);
formData.append('instagram', 'https://...');

await api.post('/admin/team', formData);
```

### Get Active Members Only
```javascript
const response = await api.get('/team?memberType=core');
// Returns only active core members
```

---

## 🐛 Troubleshooting

**Seed fails?**
- Check Cloudinary credentials in `.env`
- Ensure MongoDB is running
- Verify assets folder path: `frontend/src/assets/`

**Image upload fails?**
- File must be < 5MB
- Must be an image file
- Check Cloudinary API limits

**Toggle not working?**
- Ensure you're authenticated
- Check member ID is correct
- Verify admin authorization

---

## 📚 Full Documentation

For detailed information, see:
- `TEAM_MANAGEMENT_README.md` - Complete API documentation
- `TEAM_IMPLEMENTATION_SUMMARY.md` - Implementation details

---

**Need help?** Check the logs in `backend/logs/` for detailed error messages.
