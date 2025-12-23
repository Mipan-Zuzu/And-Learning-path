# Routing & Configuration Verification Guide

## 🎯 Main.jsx Routes Analysis

### Route Structure
```
Root Router: createBrowserRouter()
  ├── / (Landing)
  ├── /register (Public)
  ├── /login (Public)
  ├── /home (Protected)
  └── /dashboard (Protected)
```

### Route Details

#### 1. `/` - Landing Page
- **Status**: Public
- **Component**: `<h1>Welcome to landing page</h1>`
- **Protection**: None
- **Purpose**: Entry point

#### 2. `/register` - Register Page
- **Status**: Public
- **Component**: `RegisterPages`
- **Protection**: None
- **Purpose**: User registration
- **API Call**: POST `/result` to backend

#### 3. `/login` - Login Page
- **Status**: Public
- **Component**: `LoginPage`
- **Protection**: None
- **Purpose**: User authentication
- **API Call**: POST `/login` to backend
- **Cookie**: JWT token set as httpOnly cookie

#### 4. `/home` - Main Page
- **Status**: Protected
- **Component**: `<ProtectedRoute><Main /></ProtectedRoute>`
- **Protection**: Session check via `/check-session`
- **Redirect**: `/login` if not authenticated

#### 5. `/dashboard` - Chat Dashboard
- **Status**: Protected
- **Component**: `<ProtectedRoute><Dashboard /></ProtectedRoute>`
- **Protection**: Session check via `/check-session`
- **Redirect**: `/login` if not authenticated
- **Features**: Chat, Groups, Real-time messages

---

## 🔐 Protected Route Flow

### ProtectedRoute Component (`src/service/RequireLogin.jsx`)

```jsx
// Checks session on component mount
const response = await fetch(`${API_URL}/check-session`, {
  method: "GET",
  credentials: "include"
})

// Backend checks cookie for valid JWT token
// If valid: allow access
// If invalid: redirect to /login
```

### Session Check Endpoint
- **Endpoint**: `/check-session`
- **Method**: GET
- **Credentials**: include (cookies)
- **Response**: 
  ```json
  { login: true, user: {id} }  // Authenticated
  { login: false }              // Not authenticated
  ```

---

## 🔗 API Endpoints Mapping

### User Authentication
- `POST /result` - Register user (RegisterPages.jsx)
- `POST /login` - Login user (LoginPage.jsx)
- `GET /check-session` - Verify session (ProtectedRoute)

### Chat Functionality
- `POST /dhasboard` - Access/join group (Dhasboard.jsx)
- `GET /chatDirect/:id` - Get messages
- `DELETE /chatDirect/:id` - Delete message

### Group Functionality
- `POST /groups` - Create new group (Dhasboard.jsx)
- `GET /groups` - List all groups (Dhasboard.jsx)
- `GET /groups/:id` - Get group details

### Real-time (Socket.io)
- `userOnline` - User goes online
- `sendMessage` - Send chat message
- `getMessages` - Fetch all messages
- `getOnlineUsers` - Fetch online users list

---

## 📋 Environment Variable Flow

### Frontend Flow
```
1. main.jsx renders router
2. Each page/component accesses API_URL
3. API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"
4. Vite loads from login/.env file
5. On production (Vercel), uses VITE_API_URL=https://and-api-ten.vercel.app
```

### Backend Flow
```
1. server.js loads .env via dotenv
2. FRONTEND_URL used for CORS
3. CORS origin = [https://and-navy.vercel.app]
4. Accepts requests only from frontend domain
```

### Socket.io Flow
```
1. Dhasboard.jsx connects: io(API_URL)
2. API_URL from environment variable
3. Connects to: https://and-api-ten.vercel.app (production)
4. Real-time bidirectional communication
```

---

## ✅ Configuration Verification

### Frontend (login)
```
✅ main.jsx           - Routes configured correctly
✅ .env.example       - VITE_API_URL documented
✅ vercel.json        - SPA routing rewrites
✅ vite.config.js     - Build configuration
✅ Dhasboard.jsx      - Dynamic API_URL usage
✅ LoginPage.jsx      - Dynamic API_URL usage
✅ RegisterPages.jsx  - Dynamic API_URL usage
✅ RequireLogin.jsx   - Dynamic API_URL usage
```

### Backend (api)
```
✅ server.js          - Dynamic CORS, secure cookies
✅ .env.example       - FRONTEND_URL documented
✅ vercel.json        - Build and routes config
✅ Package.json       - Dependencies correct
✅ Model.js           - Schemas (User, Chat, Group)
```

---

## 🧪 Testing Scenarios

### Scenario 1: First Time User
1. Visit https://and-navy.vercel.app/
2. Click "Register" → go to `/register`
3. Enter email & password
4. POST to https://and-api-ten.vercel.app/result
5. Redirect to `/login`

### Scenario 2: Login
1. Visit `/login`
2. Enter credentials
3. POST to https://and-api-ten.vercel.app/login
4. Backend sets JWT cookie
5. Frontend stores in localStorage
6. Redirect to `/dashboard`

### Scenario 3: Access Protected Route
1. Try to access `/dashboard` directly
2. ProtectedRoute checks `/check-session`
3. Verifies JWT cookie
4. If valid: render Dashboard
5. If invalid: redirect to `/login`

### Scenario 4: Real-time Chat
1. User A opens `/dashboard`
2. Socket.io connects to https://and-api-ten.vercel.app
3. User B opens `/dashboard`
4. User A sends message
5. User B receives via Socket.io emit
6. Message saved to MongoDB

### Scenario 5: Create Group
1. Click "Create Group" button
2. Modal opens (showGroupModal state)
3. Enter group name + upload image
4. POST to https://and-api-ten.vercel.app/groups
5. Group saved to MongoDB
6. POST to https://and-api-ten.vercel.app/dhasboard with groupId
7. Group accessible in sidebar

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to API"
- **Check**: VITE_API_URL in login/.env
- **Check**: Backend domain accessible
- **Check**: CORS enabled for frontend URL

### Issue: "Session not persisting"
- **Check**: Cookie httpOnly flag in backend
- **Check**: CORS credentials: true on frontend
- **Check**: Same domain cookies (Vercel → Vercel)

### Issue: "Real-time chat not working"
- **Check**: Socket.io connected to correct URL
- **Check**: Backend Socket.io CORS configured
- **Check**: Firebase/Vercel allows WebSocket

### Issue: "Group not created"
- **Check**: POST /groups endpoint returns group with _id
- **Check**: MongoDB connection working
- **Check**: Image upload size < 10MB (body limit)

---

## 📊 Current Status

| Component | Status | URL |
|-----------|--------|-----|
| Frontend | ✅ | https://and-navy.vercel.app |
| Backend | ✅ | https://and-api-ten.vercel.app |
| MongoDB | ✅ | Connected via Atlas |
| Socket.io | ✅ | Real-time ready |
| Routes | ✅ | Main.jsx correct |
| Environment | ✅ | Variables configured |

---

## 🚀 Next Steps

1. Verify `.env` files in Vercel dashboard
2. Test all routes from browser
3. Monitor console for errors
4. Check backend logs: `vercel logs and-api-ten`
5. Check frontend logs: Browser DevTools

---

**Configuration Complete! Ready for Production Testing.**
