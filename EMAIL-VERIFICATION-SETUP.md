# 📧 Email Verification Setup Guide

## ✅ Email Verification Implemented!

Users must now verify their email before they can log in to HireFlow.

---

## 🎯 How It Works

### Registration Flow
```
1. User signs up → Account created (email NOT verified)
2. Verification email sent with unique token
3. User clicks link in email
4. Email verified → Auto-logged in
5. Can now use the application
```

### Login Flow
```
1. User tries to login
2. System checks if email is verified
3. If NOT verified → Login blocked with message
4. If verified → Login successful
```

---

## 🔧 Setup Email Service (Required for Production)

### Option 1: Gmail (Easiest for Testing)

1. **Enable 2-Factor Authentication** on your Gmail account
   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password

3. **Update `application-dev.properties`**
   ```properties
   spring.mail.host=smtp.gmail.com
   spring.mail.port=587
   spring.mail.username=your-email@gmail.com
   spring.mail.password=your-16-char-app-password
   ```

### Option 2: SendGrid (Recommended for Production)

1. **Sign up** at https://sendgrid.com/
2. **Create API Key**
3. **Update `application-prod.properties`**
   ```properties
   spring.mail.host=smtp.sendgrid.net
   spring.mail.port=587
   spring.mail.username=apikey
   spring.mail.password=YOUR_SENDGRID_API_KEY
   ```

### Option 3: AWS SES (Enterprise)

1. **Set up AWS SES**
2. **Verify domain**
3. **Update properties**
   ```properties
   spring.mail.host=email-smtp.us-east-1.amazonaws.com
   spring.mail.port=587
   spring.mail.username=YOUR_SMTP_USERNAME
   spring.mail.password=YOUR_SMTP_PASSWORD
   ```

---

## 📝 Configuration Files

### Backend Configuration

**File:** `application-dev.properties`
```properties
# Email Configuration
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true

# Application Base URL (for verification links)
app.base-url=http://localhost:5173

# Email Verification
email.verification.enabled=true
```

---

## 🚀 Testing Email Verification

### Test Without Real Email (Development)

For testing, you can temporarily disable email verification:

**Option A: Auto-verify in DataSeeder**
```java
// In DataSeeder.java
user.setEmailVerified(true); // Already done for demo users
```

**Option B: Disable verification check in AuthController**
```java
// Comment out this block in login method:
// if (!user.isEmailVerified()) {
//     return ResponseEntity.status(HttpStatus.FORBIDDEN)
//             .body(Map.of("message", "Please verify your email first"));
// }
```

### Test With Real Email

1. **Configure Gmail** (see Option 1 above)

2. **Start backend**
   ```powershell
   cd hireflow-backend\hireflow-backend
   .\mvnw.cmd spring-boot:run
   ```

3. **Register new account**
   - Go to: http://localhost:5173
   - Click "Sign Up"
   - Fill in details
   - Submit

4. **Check email**
   - Open your inbox
   - Find "HireFlow - Verify Your Email Address"
   - Click verification link

5. **Auto-login**
   - You'll be redirected and logged in automatically

---

## 📧 Email Templates

### Verification Email
```
Subject: HireFlow - Verify Your Email Address

Welcome to HireFlow!

Thank you for registering. Please verify your email address by clicking the link below:

http://localhost:5173/verify-email?token=abc123...

This link will expire in 24 hours.

If you didn't create an account with HireFlow, please ignore this email.

Best regards,
The HireFlow Team
```

### Welcome Email (After Verification)
```
Subject: Welcome to HireFlow!

Hello [Name],

Welcome to HireFlow! Your email has been verified successfully.

You can now log in and start using all features:
• Post and manage job listings
• Track applications
• Manage your recruitment pipeline

Login at: http://localhost:5173

Best regards,
The HireFlow Team
```

---

## 🔍 API Endpoints

### Registration
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!",
  "fullName": "John Doe",
  "role": "CANDIDATE"
}

Response:
{
  "message": "Registration successful! Please check your email to verify your account.",
  "email": "user@example.com"
}
```

### Email Verification
```http
GET /auth/verify-email?token=abc123...

Response:
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "tokenType": "Bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "CANDIDATE",
    "emailVerified": true
  }
}
```

### Resend Verification
```http
POST /auth/resend-verification
Content-Type: application/json

{
  "email": "user@example.com"
}

Response:
{
  "message": "Verification email sent successfully"
}
```

### Login (Blocked if Not Verified)
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!"
}

Response (if not verified):
{
  "message": "Please verify your email first. Check your inbox for the verification link."
}
```

---

## 🗄️ Database Changes

### New Fields in `users` Table
```sql
verification_token VARCHAR(255)
verification_token_expiry TIMESTAMP
```

### Check Verification Status
```sql
SELECT email, email_verified, verification_token_expiry 
FROM users 
WHERE email = 'user@example.com';
```

### Manually Verify User (for testing)
```sql
UPDATE users 
SET email_verified = true, 
    verification_token = NULL,
    verification_token_expiry = NULL
WHERE email = 'user@example.com';
```

---

## 🎨 Frontend Changes

### New Files Created
- ✅ `src/pages/VerifyEmail.jsx` - Verification page
- ✅ Updated `src/services/api.js` - Added verification methods
- ✅ Updated `src/pages/Login.jsx` - Shows verification message
- ✅ Updated `src/App.jsx` - Added verification route

### New Routes
- `/verify-email?token=...` - Email verification page

---

## 🐛 Troubleshooting

### Email Not Sending

**Check 1: Email Configuration**
```bash
# In backend logs, look for:
✅ Verification email sent to: user@example.com

# Or error:
❌ Failed to send verification email
```

**Check 2: Gmail App Password**
- Make sure you're using App Password, not regular password
- App Password should be 16 characters without spaces

**Check 3: SMTP Settings**
```properties
# Verify these are correct:
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

### Verification Link Not Working

**Check 1: Token Expiry**
- Tokens expire after 24 hours
- Request new verification email

**Check 2: Base URL**
```properties
# Make sure this matches your frontend URL:
app.base-url=http://localhost:5173
```

**Check 3: Frontend Route**
- Verify `/verify-email` route exists in App.jsx

### Can't Login After Registration

**Check 1: Email Verified?**
```sql
SELECT email_verified FROM users WHERE email = 'user@example.com';
```

**Check 2: Check Email**
- Look for verification email in inbox
- Check spam folder

**Check 3: Resend Verification**
- Use `/auth/resend-verification` endpoint

---

## 🔐 Security Features

### Token Security
- ✅ Unique UUID token per user
- ✅ 24-hour expiration
- ✅ One-time use (cleared after verification)
- ✅ Stored securely in database

### Email Security
- ✅ SMTP with TLS encryption
- ✅ Authentication required
- ✅ No sensitive data in emails

### Login Security
- ✅ Blocks unverified users
- ✅ Clear error messages
- ✅ Account lockout still active

---

## ✅ Testing Checklist

### Registration
- [ ] Can register new account
- [ ] Receives verification email
- [ ] Email contains correct link
- [ ] Link format: `http://localhost:5173/verify-email?token=...`

### Verification
- [ ] Click link opens verification page
- [ ] Shows "Verifying..." message
- [ ] Successful verification shows success message
- [ ] Auto-redirects to dashboard
- [ ] User is logged in automatically

### Login
- [ ] Unverified user cannot login
- [ ] Shows clear error message
- [ ] Verified user can login normally
- [ ] JWT tokens generated correctly

### Resend
- [ ] Can request new verification email
- [ ] Old token invalidated
- [ ] New token works

---

## 📊 Demo Users (Pre-Verified)

These users are already verified for testing:

```
Email: marcus@hireflow.com
Password: Demo123!
Status: ✅ Verified

Email: admin@hireflow.com
Password: Admin123!
Status: ✅ Verified
```

---

## 🎯 Production Checklist

Before deploying:
- [ ] Configure production email service (SendGrid/AWS SES)
- [ ] Update `app.base-url` to production domain
- [ ] Test email delivery
- [ ] Set up email monitoring
- [ ] Configure email rate limiting
- [ ] Add email templates with branding
- [ ] Set up bounce handling
- [ ] Configure SPF/DKIM records

---

## 🚀 Quick Start

### With Email Service Configured
1. Update `application-dev.properties` with Gmail credentials
2. Start backend: `.\mvnw.cmd spring-boot:run`
3. Start frontend: `npm run dev`
4. Register new account
5. Check email and click verification link
6. Done! ✅

### Without Email Service (Testing)
1. Register account
2. Manually verify in database:
   ```sql
   UPDATE users SET email_verified = true WHERE email = 'test@example.com';
   ```
3. Login normally

---

*Last Updated: May 2026*
*Version: 2.0.0 - Email Verification Complete*
