package com.hireflow.hireflow_backend.service;

import com.hireflow.hireflow_backend.entity.User;
import com.hireflow.hireflow_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;
    
    @Autowired(required = false)
    private EmailService emailService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, NotificationService notificationService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.notificationService = notificationService;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already registered: " + user.getEmail());
        }
        
        // Encode password
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        // Set default role if not provided
        if (user.getRole() == null) {
            user.setRole(User.Role.RECRUITER);
        }
        
        // Initialize security fields - email NOT verified by default
        user.setEmailVerified(false);
        user.setAccountLocked(false);
        user.setFailedLoginAttempts(0);
        
        // Generate verification token
        String verificationToken = UUID.randomUUID().toString();
        user.setVerificationToken(verificationToken);
        user.setVerificationTokenExpiry(LocalDateTime.now().plusHours(24));
        
        User saved = userRepository.save(user);
        
        // Send verification email
        if (emailService != null) {
            try {
                emailService.sendVerificationEmail(saved.getEmail(), verificationToken);
                System.out.println("✅ Verification email sent to: " + saved.getEmail());
            } catch (Exception e) {
                System.err.println("⚠️ Failed to send verification email: " + e.getMessage());
                // Don't fail registration if email fails
            }
        } else {
            System.out.println("⚠️ Email service not configured - verification email not sent");
        }
        
        try {
            notificationService.createNotification(saved.getId(), 
                "Welcome to HireFlow, " + saved.getFullName() + "! Please verify your email to access all features.");
        } catch (Exception e) {
            // Ignore notification failure
        }
        
        return saved;
    }
    
    public User verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid verification token"));
        
        if (user.getVerificationTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Verification token has expired");
        }
        
        user.setEmailVerified(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiry(null);
        
        User verified = userRepository.save(user);
        
        // Send welcome email
        if (emailService != null) {
            try {
                emailService.sendWelcomeEmail(verified.getEmail(), verified.getFullName());
            } catch (Exception e) {
                // Ignore welcome email failure
            }
        }
        
        try {
            notificationService.createNotification(verified.getId(), 
                "Email verified successfully! You now have full access to HireFlow.");
        } catch (Exception e) {
            // Ignore notification failure
        }
        
        return verified;
    }
    
    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.isEmailVerified()) {
            throw new RuntimeException("Email already verified");
        }
        
        // Generate new token
        String verificationToken = UUID.randomUUID().toString();
        user.setVerificationToken(verificationToken);
        user.setVerificationTokenExpiry(LocalDateTime.now().plusHours(24));
        
        userRepository.save(user);
        
        // Send verification email
        if (emailService != null) {
            emailService.sendVerificationEmail(user.getEmail(), verificationToken);
        } else {
            throw new RuntimeException("Email service not configured");
        }
    }

    public User updateUser(Long id, User updateDetails) {
        User existing = getUserById(id);
        
        // Only update email if it changed and is not taken
        if (!existing.getEmail().equalsIgnoreCase(updateDetails.getEmail())) {
            if (userRepository.existsByEmail(updateDetails.getEmail())) {
                throw new RuntimeException("Email already taken: " + updateDetails.getEmail());
            }
            existing.setEmail(updateDetails.getEmail());
        }
        
        existing.setFullName(updateDetails.getFullName());
        existing.setEmailNotificationsEnabled(updateDetails.isEmailNotificationsEnabled());
        existing.setApplicationAlertsEnabled(updateDetails.isApplicationAlertsEnabled());
        
        return userRepository.save(existing);
    }

    public void updatePassword(Long id, String oldPassword, String newPassword) {
        User user = getUserById(id);
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Incorrect current password");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}
