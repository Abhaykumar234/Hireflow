package com.hireflow.hireflow_backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.base-url:http://localhost:5173}")
    private String baseUrl;

    public void sendVerificationEmail(String toEmail, String verificationToken) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("HireFlow - Verify Your Email Address");
            
            String verificationLink = baseUrl + "/verify-email?token=" + verificationToken;
            
            String emailBody = "Welcome to HireFlow!\n\n" +
                    "Thank you for registering. Please verify your email address by clicking the link below:\n\n" +
                    verificationLink + "\n\n" +
                    "This link will expire in 24 hours.\n\n" +
                    "If you didn't create an account with HireFlow, please ignore this email.\n\n" +
                    "Best regards,\n" +
                    "The HireFlow Team";
            
            message.setText(emailBody);
            
            mailSender.send(message);
            System.out.println("✅ Verification email sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("❌ Failed to send verification email to: " + toEmail);
            System.err.println("Error: " + e.getMessage());
            throw new RuntimeException("Failed to send verification email", e);
        }
    }

    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("HireFlow - Password Reset Request");
            
            String resetLink = baseUrl + "/reset-password?token=" + resetToken;
            
            String emailBody = "Hello,\n\n" +
                    "We received a request to reset your password for your HireFlow account.\n\n" +
                    "Click the link below to reset your password:\n\n" +
                    resetLink + "\n\n" +
                    "This link will expire in 1 hour.\n\n" +
                    "If you didn't request a password reset, please ignore this email.\n\n" +
                    "Best regards,\n" +
                    "The HireFlow Team";
            
            message.setText(emailBody);
            
            mailSender.send(message);
            System.out.println("✅ Password reset email sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("❌ Failed to send password reset email to: " + toEmail);
            System.err.println("Error: " + e.getMessage());
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }

    public void sendWelcomeEmail(String toEmail, String fullName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Welcome to HireFlow!");
            
            String emailBody = "Hello " + fullName + ",\n\n" +
                    "Welcome to HireFlow! Your email has been verified successfully.\n\n" +
                    "You can now log in and start using all features:\n" +
                    "• Post and manage job listings\n" +
                    "• Track applications\n" +
                    "• Manage your recruitment pipeline\n\n" +
                    "Login at: " + baseUrl + "\n\n" +
                    "If you have any questions, feel free to reach out to our support team.\n\n" +
                    "Best regards,\n" +
                    "The HireFlow Team";
            
            message.setText(emailBody);
            
            mailSender.send(message);
            System.out.println("✅ Welcome email sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("⚠️ Failed to send welcome email to: " + toEmail);
            // Don't throw exception for welcome email - it's not critical
        }
    }
}
