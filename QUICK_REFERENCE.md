# ⚡ QUICK REFERENCE - URLs & Routes

## 🌐 Production URLs

```
Frontend:  https://and-navy.vercel.app/
Backend:   https://and-api-ten.vercel.app/
```

---

## 📍 Frontend Routes

```
/                    Landing Page
/register            Register Account
/login               Login Page
/home                Main Page (Protected)
/dashboard           Chat Dashboard (Protected)
```

---

## 🔐 Protected Routes

```
/home       Requires: Valid JWT cookie
/dashboard  Requires: Valid JWT cookie
```

---

## 🔗 Backend API Endpoints

```
Auth
  POST   /result              Register user
  POST   /login               Login user
  GET    /check-session       Verify session

Chat
  POST   /dhasboard           Access/join group
  DELETE /chatDirect/:id      Delete message

Groups
  POST   /groups              Create group
  GET    /groups              List all groups
  GET    /groups/:id          Get group detail

Socket.io
  userOnline                  Emit: User online
  sendMessage                 Emit: Send message
  getMessages                 Emit: Get all messages
  getOnlineUsers              Emit: Get online users
  receiveMessage              Listen: New message
  onlineUsersList             Listen: Users list
  userStatusUpdate            Listen: User status
```

---

## 🔑 Environment Variables

### Frontend (login/.env)
```
VITE_API_URL=https://and-api-ten.vercel.app
```

### Backend (api/.env)
```
DB_USERNAME=your_username
DB_PASSWORD=your_password
AUTH_KEY=your_jwt_secret
ACC_TOKEN=access_token
FRONTEND_URL=https://and-navy.vercel.app
NODE_ENV=production
PORT=3000
```

---

## ✅ Main.jsx Routes Definition

```javascript
[
  {
    path: "/",
    element: <h1>Welcome to landing page</h1>,
    errorElement: <ErrorPages />
  },
  {
    path: "/register",
    element: <RegisterPage/>
  },
  {
    path: "/login",
    element: <LoginPage/>
  },
  {
    path: "/home",
    element: <ProtectedRoute><Main/></ProtectedRoute>
  },
  {
    path: "/dashboard",
    element: <ProtectedRoute><Dashboard/></ProtectedRoute>
  }
]
```

---

## 🧪 Quick Test URLs

```
Landing:    https://and-navy.vercel.app/
Register:   https://and-navy.vercel.app/register
Login:      https://and-navy.vercel.app/login
Dashboard:  https://and-navy.vercel.app/dashboard
```

---

## 📱 Mobile Access

Same URLs work on mobile with responsive design:
- Hamburger menu (left sidebar toggle)
- User menu (right sidebar toggle)
- Swipe gestures supported

---

## 🚀 Deployment Links

```
Vercel Frontend:  https://vercel.com/projects/and-navy
Vercel Backend:   https://vercel.com/projects/and-api-ten
MongoDB Atlas:    https://cloud.mongodb.com/
```

---

## 💡 Common Tasks

### Restart Backend
```
Vercel Dashboard → and-api-ten → Redeploy
```

### Restart Frontend
```
Vercel Dashboard → and-navy → Redeploy
```

### View Logs
```
Backend:  vercel logs and-api-ten -f
Frontend: Browser DevTools → Console
```

### Update Environment Variables
```
Vercel Dashboard → Settings → Environment Variables
```

---

## 🔍 Debugging

### Check Backend Connection
```
Visit: https://and-api-ten.vercel.app/
Should return: "home"
```

### Check Frontend Build
```
Visit: https://and-navy.vercel.app/
Should load landing page
```

### Check Socket.io
```
Open DevTools → Network → WS
Look for WebSocket connection to and-api-ten
```

### Check API Calls
```
DevTools → Network → XHR
Monitor POST /login, POST /result, GET /check-session
```

---

## ✨ Status

```
🟢 LIVE PRODUCTION
🟢 FULLY CONFIGURED
🟢 READY TO USE
```

---

**Quick Deploy**: `cd api && vercel deploy --prod && cd ../login && vercel deploy --prod`
