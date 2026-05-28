# 🚀 HireFlow - Quick Start Guide

## ⚡ Get Running in 2 Minutes

### Prerequisites
- Java 17+ installed
- Node.js 16+ installed
- Ports 8080 and 5173 available

---

## 🎯 Quick Start (Development Mode)

### 1️⃣ Start Backend (Terminal 1)
```bash
cd hireflow-backend\hireflow-backend
.\mvnw.cmd spring-boot:run
```

Wait for: `Started HireflowBackendApplication`

### 2️⃣ Start Frontend (Terminal 2)
```bash

npm install
npm run dev
```

Wait for: `Local: http://localhost:5173`

### 3️⃣ Open Browser
Navigate to: `http://localhost:5173`

### 4️⃣ Login
```
Email: marcus@hireflow.com
Password: Demo123!
```

**That's it! You're in! 🎉**

---

## 🔐 Demo Accounts

### Recruiter Account
```
Email: marcus@hireflow.com
Password: Demo123!
Role: RECRUITER
Can: Post jobs, manage applications
```

### Admin Account
```
Email: admin@hireflow.com
Password: Admin123!
Role: ADMIN
Can: Everything
cd hireflow-frontend```

### Candidate Account
```
Email: john@example.com
Password: Candidate123!
Role: CANDIDATE
Can: Apply to jobs, view applications
```

---

## 📋 What You Get

### ✅ Security Features
- JWT authentication (24h access tokens)
- Automatic token refresh (7 day refresh tokens)
- Password requirements (8+ chars, uppercase, lowercase, number)
- Account lockout (5 failed attempts = 30min lock)
- Role-based access control

### ✅ Sample Data
- 3 demo users (recruiter, admin, candidate)
- Sample jobs
- Sample applications
- Sample notifications

### ✅ Features
- Dashboard with analytics
- Job posting and management
- Application tracking
- Candidate pipeline
- Notifications
- User settings

---

## 🛠️ Troubleshooting

### Backend won't start?
```bash
# Check Java version
java -version

# Should be 17 or higher
# If not, install from: https://adoptium.net/
```

### Frontend won't start?
```bash
# Check Node version
node -v

# Should be 16 or higher
# If not, install from: https://nodejs.org/
```

### Can't login?
- Make sure backend is running (check Terminal 1)
- Use exact credentials: `marcus@hireflow.com` / `Demo123!`
- Password is case-sensitive
- Check for typos

### Port already in use?
```bash
# Backend (8080)
# Find and kill process using port 8080

# Frontend (5173)
# Vite will automatically try port 5174
```

---

## 📚 More Information

- **FRONTEND-JWT-UPDATES.md** - Frontend changes explained
- **HOW-TO-RUN.md** - Detailed setup guide
- **SECURITY-IMPROVEMENTS.md** - Security features
- **IMPLEMENTATION-STATUS.md** - Project status

---

## 🎊 You're All Set!

The application is now running with:
- ✅ Secure JWT authentication
- ✅ Role-based access control
- ✅ Complete frontend-backend integration
- ✅ Sample data loaded

**Start exploring! 🚀**

---

*Version: 2.0.0 - Security Enhanced*
*Last Updated: May 2026*
