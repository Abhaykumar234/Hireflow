# 🎯 Quick Guide: Signup with PostgreSQL

## TL;DR - 5 Steps to Get Signup Working with PostgreSQL

### Step 1: Install PostgreSQL
```powershell
# Using Chocolatey (easiest)
choco install postgresql

# OR download from: https://www.postgresql.org/download/windows/
```

### Step 2: Create Database
```powershell
# Open SQL Shell (psql) from Start Menu
# Then run:
psql -U postgres -f setup-database.sql

# OR manually:
psql -U postgres
```

```sql
CREATE DATABASE hireflow;
CREATE USER hireflow_user WITH ENCRYPTED PASSWORD 'HireFlow2026!Secure';
GRANT ALL PRIVILEGES ON DATABASE hireflow TO hireflow_user;
\c hireflow
GRANT ALL ON SCHEMA public TO hireflow_user;
\q
```

### Step 3: Update Password
Edit: `hireflow-backend\hireflow-backend\src\main\resources\application-prod.properties`

Change this line:
```properties
spring.datasource.password=HireFlow2026!Secure
```

### Step 4: Run Backend with PostgreSQL
```powershell
# Option A: Use batch file
.\RUN-WITH-POSTGRESQL.bat

# Option B: Manual
cd hireflow-backend\hireflow-backend
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-25.0.3.9-hotspot"
$env:SPRING_PROFILES_ACTIVE = "prod"
.\mvnw.cmd spring-boot:run
```

### Step 5: Test Signup
1. Start frontend: `cd hireflow-frontend && npm run dev`
2. Open: `http://localhost:5173`
3. Click "Sign Up"
4. Fill form and submit
5. ✅ User saved to PostgreSQL!

---

## 🔍 How to Verify It's Working

### Check in PostgreSQL
```sql
psql -U postgres -d hireflow
SELECT * FROM users;
```

You should see your new user!

### Check Backend Logs
Look for:
```
✅ HikariPool-1 - Start completed
✅ Using PostgreSQL database
✅ Started HireflowBackendApplication
```

---

## 🐛 Common Issues

### "Connection refused"
**Problem:** PostgreSQL not running  
**Solution:**
```powershell
Start-Service postgresql-x64-16
```

### "password authentication failed"
**Problem:** Wrong password in config  
**Solution:** Update `application-prod.properties` with correct password

### "database does not exist"
**Problem:** Database not created  
**Solution:** Run Step 2 again

### "relation does not exist"
**Problem:** Tables not created  
**Solution:** Let Spring Boot create them automatically:

Edit `application-prod.properties`:
```properties
# Change this line temporarily
spring.jpa.hibernate.ddl-auto=update
```

Run backend once, then change back to:
```properties
spring.jpa.hibernate.ddl-auto=validate
```

---

## 📁 Files You Need

### Created for You
- ✅ `POSTGRESQL-SETUP.md` - Complete detailed guide
- ✅ `setup-postgresql.ps1` - PowerShell setup script
- ✅ `setup-database.sql` - SQL script to create database
- ✅ `RUN-WITH-POSTGRESQL.bat` - Batch file to run with PostgreSQL

### Already Configured
- ✅ `application-prod.properties` - PostgreSQL configuration
- ✅ Backend code - Already supports PostgreSQL
- ✅ Frontend code - Works with any database

---

## 🎯 What Happens When You Signup

### With H2 (Development)
```
User signs up → Saved to H2 file → Data lost on restart
```

### With PostgreSQL (Production)
```
User signs up → Saved to PostgreSQL → Data persists forever ✅
```

---

## ✅ Quick Checklist

Before running:
- [ ] PostgreSQL installed
- [ ] PostgreSQL service running
- [ ] Database `hireflow` created
- [ ] User `hireflow_user` created
- [ ] Password updated in `application-prod.properties`
- [ ] `SPRING_PROFILES_ACTIVE=prod` set
- [ ] Backend starts without errors

After signup:
- [ ] User appears in PostgreSQL database
- [ ] Can login with new account
- [ ] Data persists after backend restart

---

## 🚀 Alternative: Keep Using H2 (Easier)

If PostgreSQL is too complex right now, you can keep using H2:

```powershell
# Just run normally (no profile needed)
cd hireflow-backend\hireflow-backend
.\mvnw.cmd spring-boot:run

# Signup will work with H2 database
# Data saved to: hireflow-backend\hireflow-backend\data\hireflow-dev.mv.db
```

**H2 is fine for:**
- ✅ Development
- ✅ Testing
- ✅ Learning
- ✅ Demo purposes

**Use PostgreSQL for:**
- ✅ Production deployment
- ✅ Multiple users
- ✅ Data that must persist
- ✅ Better performance

---

## 📞 Need Help?

1. **Detailed guide:** See `POSTGRESQL-SETUP.md`
2. **Quick start:** See `QUICKSTART.md`
3. **General setup:** See `HOW-TO-RUN.md`

---

## 🎉 Success!

Once you see this in PostgreSQL:
```sql
hireflow=# SELECT email, full_name, role FROM users;
         email          |  full_name  |    role
------------------------+-------------+------------
 test@example.com       | Test User   | CANDIDATE
```

**Your signup function is working with PostgreSQL! 🎊**

---

*Last Updated: May 2026*
*Version: 2.0.0 - PostgreSQL Integration*
