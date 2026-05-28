# 🚀 HireFlow Quick Reference Card

## 🏃 Quick Start

```bash
# 1. Start Backend
cd hireflow-backend\hireflow-backend
mvnw.cmd spring-boot:run

# 2. Start Frontend  
cd hireflow-frontend
npm install && npm run dev

# 3. Open Browser
http://localhost:5173
```

**Or just double-click:** `RUN-SECURE-VERSION.bat`

---

## 🔐 Login Credentials

```
Email: marcus@hireflow.com
Password: Demo123!

Email: admin@hireflow.com
Password: Admin123!
```

**⚠️ Old passwords (demo123, admin123) NO LONGER WORK!**

---

## 🌐 URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8080 |
| H2 Console | http://localhost:8080/h2-console |

---

## 🔑 API Authentication

### 1. Login
```bash
POST /auth/login
{
  "email": "marcus@hireflow.com",
  "password": "Demo123!"
}

Response:
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": { ... }
}
```

### 2. Use Token
```bash
GET /jobs
Headers:
  Authorization: Bearer YOUR_ACCESS_TOKEN
```

### 3. Refresh Token
```bash
POST /auth/refresh
{
  "refreshToken": "YOUR_REFRESH_TOKEN"
}
```

---

## 🛡️ Security Features

✅ JWT Authentication (24h access, 7d refresh)
✅ Role-Based Access Control
✅ Password Requirements (8+ chars, uppercase, lowercase, number)
✅ Account Lockout (5 failed attempts = 30min lock)
✅ Input Validation
✅ Security Headers
✅ BCrypt Hashing (strength 12)

---

## 👥 User Roles

| Role | Permissions |
|------|-------------|
| **ADMIN** | Full access to all endpoints |
| **RECRUITER** | Manage jobs & applications |
| **CANDIDATE** | Limited access |

---

## 📊 Database

### Development (H2)
```
URL: jdbc:h2:file:./data/hireflow-dev
Username: sa
Password: dev_password_123
```

### Production (PostgreSQL)
```
URL: jdbc:postgresql://localhost:5432/hireflow
Username: hireflow_user
Password: YourSecurePassword123!
```

---

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `application.properties` | Main config |
| `application-dev.properties` | H2 development |
| `application-prod.properties` | PostgreSQL production |

---

## ⚠️ Frontend Updates Needed

The frontend needs JWT token handling:

```javascript
// In api.js - Add to all requests:
headers: {
  'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
}

// In Login.jsx - Store tokens:
localStorage.setItem('accessToken', data.accessToken);
localStorage.setItem('refreshToken', data.refreshToken);
```

See **HOW-TO-RUN.md** for complete frontend changes.

---

## 🐛 Common Issues

### "401 Unauthorized"
→ Token expired or missing. Login again.

### "403 Forbidden"  
→ Insufficient permissions for your role.

### "Account locked"
→ Too many failed attempts. Wait 30 minutes.

### "Password does not meet requirements"
→ Need 8+ chars with uppercase, lowercase, number.

### Backend won't start
→ Check Java version: `java -version` (need 17+)

### Frontend can't connect
→ Ensure backend is running on port 8080

---

## 📝 Password Requirements

- ✅ Minimum 8 characters
- ✅ At least one uppercase letter (A-Z)
- ✅ At least one lowercase letter (a-z)
- ✅ At least one number (0-9)

**Valid:** `Demo123!`, `Admin123!`, `Password1`
**Invalid:** `demo123`, `PASSWORD`, `12345678`

---

## 🔄 Token Lifecycle

```
Login → Get Access Token (24h) + Refresh Token (7d)
  ↓
Use Access Token for API calls
  ↓
Token Expires (24h)
  ↓
Use Refresh Token to get new Access Token
  ↓
Refresh Token Expires (7d) → Login Again
```

---

## 📚 Documentation

| File | Description |
|------|-------------|
| **HOW-TO-RUN.md** | Complete startup guide |
| **SECURITY-IMPROVEMENTS.md** | Security changes details |
| **IMPLEMENTATION-STATUS.md** | What's done, what's pending |
| **QUICK-REFERENCE.md** | This file |

---

## 🎯 Quick Tests

### Test Login
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"marcus@hireflow.com\",\"password\":\"Demo123!\"}"
```

### Test Protected Endpoint
```bash
curl -X GET http://localhost:8080/jobs \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Account Lockout
Try wrong password 5 times → Account locks

---

## ⚡ Environment Variables

```bash
# Production
set SPRING_PROFILES_ACTIVE=prod
set DATABASE_URL=jdbc:postgresql://localhost:5432/hireflow
set DATABASE_USERNAME=hireflow_user
set DATABASE_PASSWORD=YourPassword
set JWT_SECRET=your-256-bit-secret-key
set ALLOWED_ORIGINS=https://yourdomain.com
```

---

## 🎉 Success Indicators

✅ Backend starts on port 8080
✅ Frontend loads on port 5173
✅ Can login with Demo123!
✅ JWT token received
✅ API calls work with token
✅ Database has sample data

---

## 📞 Need Help?

1. Check **HOW-TO-RUN.md**
2. Review error messages
3. Check application logs
4. Verify credentials
5. Ensure ports are free

---

**Quick Tip:** Keep this file open while developing! 📌

*Version: 2.0.0 - Security Enhanced*
