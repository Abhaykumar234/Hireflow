# 🚀 How to Run HireFlow (Security Enhanced Version)

## Quick Start Guide

### Prerequisites
- ✅ Java 17 or higher
- ✅ Node.js 16+ and npm
- ✅ Maven (included via mvnw)

---

## Option 1: Run with H2 Database (Development - Easiest)

### Step 1: Start Backend
```bash
cd hireflow-backend\hireflow-backend

# Windows
mvnw.cmd clean install
mvnw.cmd spring-boot:run

# The backend will start on http://localhost:8080
# H2 Console: http://localhost:8080/h2-console
```

### Step 2: Start Frontend
```bash
cd hireflow-frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev

# Frontend will start on http://localhost:5173
```

### Step 3: Login
Open browser to `http://localhost:5173`

**Updated Demo Credentials:**
```
Email: marcus@hireflow.com
Password: Demo123!

OR

Email: admin@hireflow.com
Password: Admin123!
```

**Note:** Passwords now require:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

---

## Option 2: Run with PostgreSQL (Production)

### Step 1: Install PostgreSQL

**Windows:**
```bash
# Using Chocolatey
choco install postgresql

# Or download from: https://www.postgresql.org/download/windows/
```

### Step 2: Create Database
```bash
# Open PostgreSQL command line
psql -U postgres

# Run these commands:
CREATE DATABASE hireflow;
CREATE USER hireflow_user WITH ENCRYPTED PASSWORD 'YourSecurePassword123!';
GRANT ALL PRIVILEGES ON DATABASE hireflow TO hireflow_user;
\c hireflow
GRANT ALL ON SCHEMA public TO hireflow_user;
\q
```

### Step 3: Configure Application
Edit `application-prod.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/hireflow
spring.datasource.username=hireflow_user
spring.datasource.password=YourSecurePassword123!
```

### Step 4: Run with Production Profile
```bash
cd hireflow-backend\hireflow-backend

# Set environment variable
set SPRING_PROFILES_ACTIVE=prod

# Run
mvnw.cmd spring-boot:run
```

---

## 🔐 What's New (Security Features)

### 1. JWT Authentication
- All API requests now require authentication
- Access tokens expire after 24 hours
- Refresh tokens expire after 7 days

### 2. Password Requirements
- Minimum 8 characters
- Must contain uppercase, lowercase, and number
- Passwords are hashed with BCrypt (strength 12)

### 3. Account Security
- Account locks after 5 failed login attempts
- Auto-unlocks after 30 minutes
- Email verification (currently auto-verified for demo)

### 4. Role-Based Access
- **ADMIN**: Full access to all endpoints
- **RECRUITER**: Can manage jobs and applications
- **CANDIDATE**: Limited access

---

## 📝 API Usage with JWT

### 1. Login to Get Token
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"marcus@hireflow.com\",\"password\":\"Demo123!\"}"
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "user": {
    "id": 1,
    "email": "marcus@hireflow.com",
    "fullName": "Marcus Chen",
    "role": "RECRUITER",
    "emailVerified": true
  }
}
```

### 2. Use Token in Requests
```bash
curl -X GET http://localhost:8080/jobs \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

### 3. Refresh Token When Expired
```bash
curl -X POST http://localhost:8080/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"YOUR_REFRESH_TOKEN_HERE\"}"
```

---

## 🔧 Frontend Configuration

The frontend needs to be updated to handle JWT tokens. Here's what needs to change:

### Update `src/services/api.js`

Add token management:
```javascript
const API_BASE_URL = 'http://localhost:8080';

// Get token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const api = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
    const data = await response.json();
    // Store tokens
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  // All other API calls need Authorization header
  getJobs: async () => {
    const response = await fetch(`${API_BASE_URL}/jobs`, {
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch jobs');
    return response.json();
  },
  
  // ... add getAuthHeader() to all other API calls
};
```

### Update `src/pages/Login.jsx`

Handle new response format:
```javascript
const handleLogin = async (e) => {
  e.preventDefault()
  setLoading(true)
  setError('')
  try {
    const data = await api.login(email, password)
    // Tokens are already stored by api.login()
    navigate('/dashboard')
  } catch (err) {
    setError(err.message)
  } finally {
    setLoading(false)
  }
}
```

---

## 🐛 Troubleshooting

### Backend Won't Start

**Error: "Failed to configure a DataSource"**
```bash
# Solution: Check your database configuration
# For H2 (dev): Make sure spring.profiles.active=dev
# For PostgreSQL (prod): Verify database is running and credentials are correct
```

**Error: "Port 8080 already in use"**
```bash
# Solution: Change port in application.properties
server.port=8081
```

**Error: "JWT secret key too short"**
```bash
# Solution: JWT secret must be at least 256 bits (32 characters)
# Update in application.properties:
jwt.secret=your-very-long-secret-key-at-least-32-characters-long-for-security
```

### Frontend Issues

**Error: "401 Unauthorized"**
```bash
# Solution: Token expired or missing
# 1. Login again to get new token
# 2. Check that Authorization header is being sent
# 3. Verify token is stored in localStorage
```

**Error: "CORS policy"**
```bash
# Solution: Backend CORS is configured for localhost:5173
# If using different port, update application-dev.properties:
cors.allowed-origins=http://localhost:YOUR_PORT
```

### Database Issues

**H2 Console Not Accessible**
```bash
# Solution: Only available in dev profile
# 1. Check spring.profiles.active=dev
# 2. Access: http://localhost:8080/h2-console
# 3. JDBC URL: jdbc:h2:file:./data/hireflow-dev
# 4. Username: sa
# 5. Password: dev_password_123
```

**PostgreSQL Connection Failed**
```bash
# Solution: 
# 1. Verify PostgreSQL is running: pg_ctl status
# 2. Check credentials in application-prod.properties
# 3. Ensure database exists: psql -U postgres -l
# 4. Check firewall allows port 5432
```

---

## 📊 Testing the Security

### Test Account Lockout
```bash
# Try logging in with wrong password 5 times
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"marcus@hireflow.com\",\"password\":\"wrong\"}"

# After 5 attempts, account will be locked for 30 minutes
```

### Test Role-Based Access
```bash
# Login as CANDIDATE
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"john@example.com\",\"password\":\"Candidate123!\"}"

# Try to create a job (should fail - requires RECRUITER or ADMIN)
curl -X POST http://localhost:8080/jobs \
  -H "Authorization: Bearer CANDIDATE_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Test Job\",\"company\":\"Test\",\"status\":\"OPEN\"}"
```

### Test Token Expiration
```bash
# Tokens expire after 24 hours
# Use refresh token to get new access token
curl -X POST http://localhost:8080/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"YOUR_REFRESH_TOKEN\"}"
```

---

## 🎯 Quick Checklist

Before running:
- [ ] Java 17+ installed (`java -version`)
- [ ] Node.js 16+ installed (`node -v`)
- [ ] Database configured (H2 for dev, PostgreSQL for prod)
- [ ] Environment variables set (if using prod)
- [ ] JWT secret configured (min 32 characters)

After starting:
- [ ] Backend running on port 8080
- [ ] Frontend running on port 5173
- [ ] Can login with demo credentials
- [ ] JWT tokens being generated
- [ ] API requests include Authorization header
- [ ] Database tables created automatically

---

## 🚀 Production Deployment

### Before deploying to production:

1. **Change JWT Secret**
```properties
jwt.secret=generate-a-strong-random-256-bit-secret-key-here
```

2. **Use PostgreSQL**
```properties
spring.profiles.active=prod
```

3. **Set Strong Database Password**
```properties
spring.datasource.password=VeryStrongPassword123!@#
```

4. **Configure Email SMTP**
```properties
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
```

5. **Update CORS Origins**
```properties
cors.allowed-origins=https://yourdomain.com
```

6. **Enable HTTPS**
```properties
server.ssl.enabled=true
server.ssl.key-store=classpath:keystore.p12
server.ssl.key-store-password=your-keystore-password
```

---

## 📞 Need Help?

1. Check this guide first
2. Review SECURITY-IMPROVEMENTS.md
3. Check application logs
4. Verify environment variables
5. Test with curl/Postman first

---

## 🎉 Success!

If everything is working:
- ✅ Backend starts without errors
- ✅ Frontend loads in browser
- ✅ Can login with demo credentials
- ✅ JWT tokens are generated
- ✅ API requests are authenticated
- ✅ Database is populated with sample data

**You're ready to go! 🚀**

---

*Last Updated: May 2026*
*Version: 2.0.0 - Security Enhanced*
