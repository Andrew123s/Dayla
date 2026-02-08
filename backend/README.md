# Dayla Backend API

A comprehensive backend API for Dayla - an adventure planning and community platform built with Node.js, Express, MongoDB, and Socket.io.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Real-time Collaboration**: Socket.io for live dashboard editing and chat
- **File Upload**: Multi-format file uploads (images, documents, audio, video) with Cloudinary
- **Trip Planning**: AI-powered trip suggestions using Google Gemini
- **Community Platform**: Social features with posts, comments, likes, and location-based discovery
- **Dashboard Collaboration**: Real-time sticky notes, active user tracking, and invitation system
- **Eco-Tracking**: Sustainability scoring and carbon footprint calculations

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.io
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary
- **AI Integration**: Google Gemini API
- **Validation**: Joi schemas
- **Logging**: Winston
- **Email**: Nodemailer

## 📁 Project Structure

```
backend/
├── config/
│   ├── db.config.js          # MongoDB connection
│   ├── env.config.js         # Environment validation
│   └── socket.config.js      # Socket.io configuration
├── controllers/
│   ├── auth.controller.js    # Authentication endpoints
│   ├── trip.controller.js    # Trip and dashboard management
│   ├── board.controller.js   # Collaboration features
│   ├── chat.controller.js    # Messaging system
│   ├── community.controller.js # Social features
│   └── storage.controller.js # File upload handling
├── middleware/
│   ├── auth.middleware.js    # JWT authentication
│   ├── upload.middleware.js  # Multer configuration
│   └── error.middleware.js   # Global error handling
├── models/
│   ├── user.model.js         # User profiles
│   ├── trip.model.js         # Trip data
│   ├── dashboard.model.js    # Canvas state & collaboration
│   ├── conversation.model.js # Chat threads
│   ├── message.model.js      # Chat messages
│   └── post.model.js         # Community posts
├── routes/
│   ├── auth.routes.js        # Authentication routes
│   ├── trip.routes.js        # Trip management routes
│   ├── chat.routes.js        # Chat routes
│   └── upload.routes.js      # File upload routes
├── services/
│   ├── socket.service.js     # Real-time event handling
│   ├── gemini.service.js     # AI trip planning
│   └── cloud.service.js      # Cloud storage integration
├── utils/
│   ├── eco.utils.js          # Sustainability calculations
│   ├── logger.js             # Logging utility
│   └── validator.js          # Request validation schemas
├── views/emails/             # Email templates
├── app.js                    # Express app configuration
├── server.js                 # Server entry point
└── package.json              # Dependencies
```

## 🚀 Getting Started

### Prerequisites

- Node.js (>= 16.0.0)
- MongoDB (>= 4.4) - either local installation or MongoDB Atlas
- npm or yarn
- Google Gemini API key (from Google AI Studio)
- Cloudinary account (for file uploads)

### Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Verify setup (recommended)**
   ```bash
   npm run check-setup
   ```
   This will check if all required environment variables are set and dependencies are installed.

3. **Get Required API Keys**

   **MongoDB:**
   - Sign up at [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier available)
   - Create a cluster and get your connection string

   **Google Gemini AI:**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key for your project

   **Cloudinary (for file uploads):**
   - Sign up at [Cloudinary](https://cloudinary.com/)
   - Get your cloud name, API key, and API secret

   **Gmail (optional, for email notifications):**
   - Enable 2-factor authentication
   - Generate an App Password for the EMAIL_PASS variable

4. **Environment Setup**
   ```bash
   cp .env.example .env
   ```

   Fill in your environment variables:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/dayla

   # JWT
   JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
   JWT_EXPIRE=7d

   # Frontend
   FRONTEND_URL=http://localhost:5173

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Google Gemini AI (get from https://makersuite.google.com/app/apikey)
GOOGLE_AI_API_KEY=your_google_ai_api_key

   # Email
   EMAIL_FROM=noreply@dayla.com
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Seed database with sample data (optional)**
   ```bash
   npm run seed
   ```
   This creates sample users, trips, and dashboard notes for testing.

6. **Run the server**
   ```bash
   # Development mode with auto-restart
   npm run dev

   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000` (or your configured PORT).

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `DELETE /api/auth/deactivate` - Deactivate account

### Trips & Dashboard
- `GET /api/trips` - Get user's trips
- `POST /api/trips` - Create new trip
- `GET /api/trips/:id` - Get trip details
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip
- `POST /api/trips/:id/notes` - Create sticky note
- `PUT /api/trips/:id/notes/:noteId` - Update sticky note
- `DELETE /api/trips/:id/notes/:noteId` - Delete sticky note

### Collaboration
- `GET /api/boards/:boardId/active-users` - Get active users
- `POST /api/boards/:boardId/join` - Join dashboard
- `POST /api/boards/:boardId/leave` - Leave dashboard
- `POST /api/boards/:boardId/invite` - Invite user to dashboard
- `POST /api/invitations/:invitationId/accept` - Accept invitation
- `POST /api/invitations/:invitationId/decline` - Decline invitation

### Chat
- `GET /api/chat/conversations` - Get user conversations
- `POST /api/chat/conversations` - Create conversation
- `GET /api/chat/conversations/:id/messages` - Get messages
- `POST /api/chat/conversations/:id/messages` - Send message
- `POST /api/chat/messages/:messageId/reactions` - Add reaction

### Community
- `GET /api/community/posts` - Get posts feed
- `POST /api/community/posts` - Create post
- `GET /api/community/posts/:id` - Get single post
- `PUT /api/community/posts/:id` - Update post
- `DELETE /api/community/posts/:id` - Delete post
- `POST /api/community/posts/:id/likes` - Like/unlike post
- `POST /api/community/posts/:id/comments` - Add comment

### File Upload
- `POST /api/upload/images` - Upload images
- `POST /api/upload/documents` - Upload documents
- `POST /api/upload/audio` - Upload audio files
- `POST /api/upload/videos` - Upload videos

## 🔌 Socket.io Events

### Dashboard Collaboration
- `join_room` - Join a dashboard room
- `leave_room` - Leave a dashboard room
- `start_editing` - Indicate user started editing a note
- `stop_editing` - Indicate user stopped editing
- `note_update` - Real-time note updates
- `user_joined` - User joined dashboard
- `user_left` - User left dashboard
- `user_editing` - User is editing indicator

### Chat
- `send_message` - Send a chat message
- `new_message` - Receive new message
- `user_typing` - User started typing
- `user_stopped_typing` - User stopped typing

## 🧪 Testing

```bash
npm test
```

## 📊 Monitoring & Logging

- **Winston Logger**: Structured logging with different levels
- **Morgan**: HTTP request logging
- **Error Handling**: Centralized error handling middleware
- **Health Check**: `GET /health` endpoint for monitoring

## 🔒 Security Features

- **Helmet**: Security headers
- **Rate Limiting**: API rate limiting
- **CORS**: Cross-origin resource sharing configuration
- **Input Validation**: Joi schema validation
- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt for password security

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dayla
JWT_SECRET=your_production_jwt_secret
CLOUDINARY_CLOUD_NAME=your_prod_cloud_name
# ... other production configs
```

### PM2 Process Manager
```bash
npm install -g pm2
pm2 start server.js --name dayla-backend
pm2 startup
pm2 save
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 📞 Support

For questions or support, please open an issue on GitHub or contact the development team.

---

Built with ❤️ for adventure seekers and nature lovers.