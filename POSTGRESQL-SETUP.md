# 🐘 PostgreSQL Setup Guide for HireFlow

## Complete Guide to Switch from H2 to PostgreSQL

---

## Step 1: Install PostgreSQL

### Option A: Using Chocolatey (Recommended)
```powershell
# Install Chocolatey if not installed
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install PostgreSQL
choco install postgresql
```

### Option B: Manual Download
1. Download from: https://www.postgresql.org/download/windows/
2. Run the installer
3. Remember the password you set for the `postgres` user
4. Default port: 5432

---

## Step 2: Create Database and User

### Open PostgreSQL Command Line (psql)

**Method 1: Using Start Menu**
- Search for "SQL Shell (psql)"
- Press Enter for default values (localhost, 5432, postgres)
- Enter the password you set during installation

**Method 2: Using PowerShell**
```powershell
# Navigate to PostgreSQL bin directory
cd "C:\Program Files\PostgreSQL\16\bin"

# Connect to PostgreSQL
.\psql.exe -U postgres
```

### Run These SQL Commands

```sql
-- Create the database
CREATE DATABASE hireflow;

-- Create a dedicated user
CREATE USER hireflow_user WITH ENCRYPTED PASSWORD 'HireFlow2026!Secure';

-- Grant all privileges on the database
GRANT ALL PRIVILEGES ON DATABASE hireflow TO hireflow_user;

-- Connect to the hireflow database
\c hireflow

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO hireflow_user;

-- Grant default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO hireflow_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO hireflow_user;

-- Verify the database was created
\l

-- Exit psql
\q
```

---

## Step 3: Update Application Configuration

### Update `application-prod.properties`

<function_calls>
<invoke name="read_file">
<parameter name="path">c:\Users\kumar\Downloads\Hireflow\hireflow-backend\hireflow-backend\src\main\resources\application-prod.properties


The file is located at:
`hireflow-backend\hireflow-backend\src\main\resources\application-prod.properties`

**Current configuration:**
```properties
spring.datasource.url=${DATABASE_URL:jdbc:postgresql://localhost:5432/hireflow}
spring.datasource.username=${DATABASE_USERNAME:hireflow_user}
spring.datasource.password=${DATABASE_PASSWORD:change_this_password}
```

**Update the password to match what you set in Step 2:**
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/hireflow
spring.datasource.username=hireflow_user
spring.datasource.password=HireFlow2026!Secure
```

---

## Step 4: Set Spring Profile to Production

### Option A: Using Environment Variable (Recommended)
```powershell
# Set for current PowerShell session
$env:SPRING_PROFILES_ACTIVE = "prod"

# Verify it's set
echo $env:SPRING_PROFILES_ACTIVE
```

### Option B: Using Command Line Argument
```powershell
.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=prod
```

### Option C: Set Permanently (Windows)
```powershell
# Set system-wide (requires admin)
[System.Environment]::SetEnvironmentVariable('SPRING_PROFILES_ACTIVE', 'prod', 'User')

# Restart PowerShell after this
```

---

## Step 5: Update Database Schema

Since we're switching from H2 to PostgreSQL, we need to create the tables.

### Option A: Let Spring Boot Create Tables (Development)

Update `application-prod.properties` temporarily:
```properties
# Change from validate to update (for first run only)
spring.jpa.hibernate.ddl-auto=update
```

After first successful run, change it back to:
```properties
spring.jpa.hibernate.ddl-auto=validate
```

### Option B: Use SQL Script (Production - Recommended)

Create the tables manually using this SQL script:

```sql
-- Connect to hireflow database
\c hireflow

-- Create users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    failed_login_attempts INTEGER DEFAULT 0,
    account_locked_until TIMESTAMP,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create jobs table
CREATE TABLE job (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    description TEXT,
    requirements TEXT,
    salary_range VARCHAR(100),
    status VARCHAR(50) NOT NULL,
    posted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    recruiter_id BIGINT,
    FOREIGN KEY (recruiter_id) REFERENCES users(id)
);

-- Create applications table
CREATE TABLE application (
    id BIGSERIAL PRIMARY KEY,
    job_id BIGINT NOT NULL,
    candidate_id BIGINT NOT NULL,
    candidate_name VARCHAR(255) NOT NULL,
    candidate_email VARCHAR(255) NOT NULL,
    resume_url VARCHAR(500),
    cover_letter TEXT,
    stage VARCHAR(50) NOT NULL,
    applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES job(id),
    FOREIGN KEY (candidate_id) REFERENCES users(id)
);

-- Create notifications table
CREATE TABLE notification (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_job_recruiter ON job(recruiter_id);
CREATE INDEX idx_application_job ON application(job_id);
CREATE INDEX idx_application_candidate ON application(candidate_id);
CREATE INDEX idx_notification_user ON notification(user_id);

-- Verify tables were created
\dt
```

---

## Step 6: Run the Application with PostgreSQL

### Start Backend with Production Profile

```powershell
# Navigate to backend directory
cd C:\Users\kumar\Downloads\Hireflow\hireflow-backend\hireflow-backend

# Set JAVA_HOME (if needed)
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-25.0.3.9-hotspot"

# Set production profile
$env:SPRING_PROFILES_ACTIVE = "prod"

# Run the application
.\mvnw.cmd spring-boot:run
```

### Watch for Success Messages

You should see:
```
Started HireflowBackendApplication in X.XXX seconds
```

If you see errors about tables not existing, use Option A or B from Step 5.

---

## Step 7: Test Signup Function

### Using Frontend

1. Start frontend:
```powershell
cd C:\Users\kumar\Downloads\Hireflow\hireflow-frontend
npm run dev
```

2. Open browser: `http://localhost:5173`

3. Click "Sign Up"

4. Fill in the form:
   - Full Name: Test User
   - Email: test@example.com
   - Role: CANDIDATE
   - Password: Test123!

5. Click "Create Account"

6. You should be automatically logged in and redirected to dashboard

### Using cURL (Command Line Test)

```powershell
# Test signup
curl -X POST http://localhost:8080/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"Test123!\",\"fullName\":\"Test User\",\"role\":\"CANDIDATE\"}'
```

### Verify in PostgreSQL

```sql
-- Connect to database
psql -U postgres -d hireflow

-- Check if user was created
SELECT id, email, full_name, role, email_verified, created_at FROM users;

-- You should see your new user!
```

---

## Step 8: Verify Everything Works

### Check Database Connection
```sql
-- In psql
\c hireflow
\dt  -- List all tables
SELECT COUNT(*) FROM users;  -- Should show at least 1 user
```

### Check Application Logs
Look for these in the backend console:
```
✅ HikariPool-1 - Start completed
✅ Started HireflowBackendApplication
✅ No errors about database connection
```

### Test All Features
- ✅ Signup new account
- ✅ Login with new account
- ✅ Create a job (if recruiter/admin)
- ✅ Submit application
- ✅ View dashboard
- ✅ Logout

---

## 🔧 Troubleshooting

### Error: "Connection refused"
```
Problem: PostgreSQL is not running
Solution:
# Check if PostgreSQL is running
Get-Service -Name postgresql*

# Start PostgreSQL service
Start-Service postgresql-x64-16  # Replace with your version
```

### Error: "password authentication failed"
```
Problem: Wrong password in application-prod.properties
Solution: Update the password to match what you set in Step 2
```

### Error: "database does not exist"
```
Problem: Database not created
Solution: Go back to Step 2 and create the database
```

### Error: "relation does not exist"
```
Problem: Tables not created
Solution: Use Step 5 Option A or B to create tables
```

### Error: "role does not exist"
```
Problem: User not created
Solution: Go back to Step 2 and create the user
```

---

## 📊 PostgreSQL vs H2 Comparison

### H2 (Development)
- ✅ No installation needed
- ✅ Embedded in application
- ✅ Fast startup
- ❌ Data lost on restart (file mode saves)
- ❌ Not for production

### PostgreSQL (Production)
- ✅ Production-ready
- ✅ Data persists
- ✅ Better performance at scale
- ✅ Advanced features
- ❌ Requires installation
- ❌ Requires configuration

---

## 🎯 Quick Reference Commands

### PostgreSQL Commands
```sql
-- Connect to database
psql -U postgres -d hireflow

-- List databases
\l

-- List tables
\dt

-- View table structure
\d users

-- View all users
SELECT * FROM users;

-- Delete a user (for testing)
DELETE FROM users WHERE email = 'test@example.com';

-- Exit
\q
```

### PowerShell Commands
```powershell
# Set production profile
$env:SPRING_PROFILES_ACTIVE = "prod"

# Check PostgreSQL service
Get-Service postgresql*

# Start PostgreSQL
Start-Service postgresql-x64-16

# Stop PostgreSQL
Stop-Service postgresql-x64-16
```

---

## 🔐 Security Best Practices

### For Production Deployment

1. **Change Default Password**
```properties
# Don't use the example password!
spring.datasource.password=YourVerySecurePassword123!@#
```

2. **Use Environment Variables**
```properties
spring.datasource.password=${DATABASE_PASSWORD}
```

Then set in PowerShell:
```powershell
$env:DATABASE_PASSWORD = "YourSecurePassword"
```

3. **Restrict Database Access**
```sql
-- Only allow connections from localhost
-- Edit pg_hba.conf file
```

4. **Regular Backups**
```powershell
# Backup database
pg_dump -U postgres hireflow > backup.sql

# Restore database
psql -U postgres hireflow < backup.sql
```

---

## ✅ Success Checklist

- [ ] PostgreSQL installed
- [ ] Database `hireflow` created
- [ ] User `hireflow_user` created
- [ ] Privileges granted
- [ ] `application-prod.properties` updated
- [ ] Spring profile set to `prod`
- [ ] Tables created (auto or manual)
- [ ] Backend starts without errors
- [ ] Can signup new user
- [ ] Can login with new user
- [ ] Data persists after restart

---

## 🎉 You're Done!

Your HireFlow application is now running with PostgreSQL!

**Signup function will now:**
- ✅ Store users in PostgreSQL database
- ✅ Persist data across restarts
- ✅ Support production workloads
- ✅ Provide better performance
- ✅ Enable advanced features

---

*Last Updated: May 2026*
*Version: 2.0.0 - PostgreSQL Integration*
