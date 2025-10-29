# Team Management System Documentation

## Overview
This document describes the Team Management system for managing both Core Team Members and Riders in the Brotherhood of Mumbai application.

## Database Schema

### TeamMember Model
The unified schema handles both core team members and riders:

```javascript
{
  name: String (required),
  role: String (e.g., "Founder", "Secretary", "Core Member"),
  memberType: String (enum: ['core', 'rider'], required),
  imgUrl: String,
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
  isActive: Boolean (default: true),
  displayOrder: Number (default: 0),
  isLeadership: Boolean (default: false)
}
```

## API Endpoints

### Public Endpoints (No Authentication Required)

#### 1. Get All Team Members
```
GET /api/team?memberType=core&page=1&limit=10
```
Query Parameters:
- `memberType`: Filter by 'core' or 'rider'
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `sortBy`: Field to sort by (default: 'displayOrder')
- `sortOrder`: 'asc' or 'desc' (default: 'asc')

#### 2. Get Single Team Member
```
GET /api/team/:id
```

#### 3. Get Core Team Members
```
GET /api/team/core/list
```

#### 4. Get Riders
```
GET /api/team/riders/list
```

#### 5. Get Leadership Team
```
GET /api/team/leadership/list
```

#### 6. Get Member Types
```
GET /api/team/types/list
```

### Admin Endpoints (Requires Admin Authentication)

#### 1. Get All Team Members (Admin)
```
GET /api/admin/team?memberType=core&isActive=true&search=kunal
```
Query Parameters:
- `memberType`: Filter by 'core' or 'rider'
- `isActive`: Filter by active status (true/false)
- `isLeadership`: Filter by leadership status (true/false)
- `search`: Search by name or role
- `page`, `limit`, `sortBy`, `sortOrder`: Pagination options

#### 2. Create Team Member
```
POST /api/admin/team
Content-Type: multipart/form-data

Body (Form Data):
{
  name: "John Doe",
  role: "Core Member",
  memberType: "core",
  bio: "Passionate rider...",
  email: "john@example.com",
  phone: "+919876543210",
  instagram: "https://instagram.com/johndoe",
  youtube: "https://youtube.com/@johndoe",
  displayOrder: 1,
  isActive: true,
  isLeadership: false,
  memberImage: <file>
}
```

#### 3. Get Single Team Member (Admin)
```
GET /api/admin/team/:id
```

#### 4. Update Team Member
```
PUT /api/admin/team/:id
Content-Type: multipart/form-data

Body (Form Data):
{
  name: "John Doe Updated",
  role: "Senior Core Member",
  ...
  memberImage: <file> (optional)
}
```

#### 5. Delete Team Member
```
DELETE /api/admin/team/:id
```

#### 6. Toggle Active Status
```
PATCH /api/admin/team/:id/toggle
```
This endpoint toggles the `isActive` status of a team member.

## Image Upload Flow

### Process
1. **Frontend**: User selects an image file
2. **Multer**: Receives the file in memory (memory storage)
3. **Cloudinary**: File is uploaded from memory buffer
4. **Database**: Cloudinary URL is saved to TeamMember document

### Configuration
- **Max File Size**: 5MB
- **Allowed Types**: Images only (image/*)
- **Storage**: Memory storage (no local file system usage)
- **Cloudinary Folders**: 
  - Core team: `ride-booking/team/core`
  - Riders: `ride-booking/team/riders`
  - Member images: `ride-booking/memberImage`

### Image Update Flow
When updating a member's image:
1. New image is uploaded to Cloudinary
2. Old image is deleted from Cloudinary (if exists)
3. Database is updated with new image URL

### Image Deletion Flow
When deleting a member:
1. Member document is retrieved
2. Associated image is deleted from Cloudinary
3. Member document is deleted from database

## Seeding Data

### Running the Seed Script
To populate the database with initial data from the frontend assets folder:

```bash
cd backend
npm run seed:team
```

### What the Seed Script Does
1. Connects to MongoDB
2. Clears existing team members
3. Reads image files from `frontend/src/assets/`
4. Uploads each image to Cloudinary
5. Creates team member records with Cloudinary URLs
6. Logs progress and results

### Seed Data Includes
- **10 Core Team Members**: Including Founder, Secretary, Treasurer, and Core Members
- **23 Riders**: Active riders with their social media links

## Environment Variables

Ensure these are set in your `.env` file:

```env
MONGODB_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Frontend Integration

### Fetching Core Team Members
```javascript
import api from './services/api';

const getCoreTeam = async () => {
  const response = await api.get('/team/core/list');
  return response.data.data.coreMembers;
};
```

### Fetching Riders
```javascript
const getRiders = async () => {
  const response = await api.get('/team/riders/list');
  return response.data.data.riders;
};
```

### Admin: Creating a Member
```javascript
const createMember = async (formData) => {
  const response = await api.post('/admin/team', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};
```

### Admin: Toggling Active Status
```javascript
const toggleMemberStatus = async (id) => {
  const response = await api.patch(`/admin/team/${id}/toggle`);
  return response.data;
};
```

## Error Handling

### Common Errors
- **400**: Invalid request data or file type
- **404**: Team member not found
- **413**: File size exceeds limit (5MB)
- **500**: Server error (check logs)

### Error Response Format
```json
{
  "status": "error",
  "message": "Error description",
  "errors": ["Detailed error messages"]
}
```

## Testing

### Using Postman/Thunder Client

#### 1. Login as Admin
```
POST /api/auth/login
{
  "email": "admin@example.com",
  "password": "your_password"
}
```
Copy the `token` from response.

#### 2. Create Team Member
```
POST /api/admin/team
Headers:
  Authorization: Bearer <your_token>
  Content-Type: multipart/form-data

Body (form-data):
  name: "Test Member"
  role: "Rider"
  memberType: "rider"
  instagram: "https://instagram.com/test"
  isActive: true
  memberImage: <select file>
```

#### 3. Toggle Member Status
```
PATCH /api/admin/team/<member_id>/toggle
Headers:
  Authorization: Bearer <your_token>
```

## Best Practices

1. **Image Optimization**: Images are automatically optimized by Cloudinary
2. **Display Order**: Use `displayOrder` field to control the sequence of members
3. **Active Status**: Use `isActive` to hide/show members without deleting them
4. **Leadership Flag**: Use `isLeadership` to identify leadership members
5. **Member Types**: Always specify 'core' or 'rider' for proper categorization

## Maintenance

### Cleaning Up Unused Images
Cloudinary images are automatically deleted when:
- A member is deleted
- A member's image is updated

### Backup Recommendations
- Regular database backups
- Export Cloudinary assets periodically
- Keep seed data updated with current members

## Support

For issues or questions:
1. Check the logs in `backend/logs/`
2. Verify environment variables
3. Ensure Cloudinary credentials are correct
4. Check MongoDB connection
