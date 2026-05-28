package com.hireflow.hireflow_backend.controller;

import com.hireflow.hireflow_backend.dto.AuthRequest;
import com.hireflow.hireflow_backend.dto.AuthResponse;
import com.hireflow.hireflow_backend.entity.User;
import com.hireflow.hireflow_backend.security.JwtUtil;
import com.hireflow.hireflow_backend.service.UserService;
import com.hireflow.hireflow_backend.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserService userService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private UserDetailsService userDetailsService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody User user) {
        try {
            User created = userService.createUser(user);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of(
                        "message", "Registration successful! Please check your email to verify your account.",
                        "email", created.getEmail()
                    ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    @GetMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        try {
            User user = userService.verifyEmail(token);
            
            // Generate tokens for auto-login after verification
            UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
            String accessToken = jwtUtil.generateToken(userDetails);
            String refreshToken = jwtUtil.generateRefreshToken(userDetails);
            
            return ResponseEntity.ok(new AuthResponse(accessToken, refreshToken, user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            userService.resendVerificationEmail(email);
            return ResponseEntity.ok(Map.of("message", "Verification email sent successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/register/verify")
    public ResponseEntity<Map<String, String>> verifyEmailOld(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }
        
        // Check if email already exists
        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already registered"));
        }
        
        // In production, send real OTP via email
        // For now, return success (frontend can proceed to step 2)
        return ResponseEntity.ok(Map.of("message", "Email verification initiated for " + email));
    }

    @PostMapping("/register/complete")
    public ResponseEntity<?> completeRegistration(@Valid @RequestBody User user) {
        try {
            // Set email as verified for demo (in production, verify OTP first)
            user.setEmailVerified(true);
            
            User created = userService.createUser(user);
            
            // Generate tokens
            UserDetails userDetails = userDetailsService.loadUserByUsername(created.getEmail());
            String accessToken = jwtUtil.generateToken(userDetails);
            String refreshToken = jwtUtil.generateRefreshToken(userDetails);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new AuthResponse(accessToken, refreshToken, created));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request) {
        try {
            // Find user
            Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid email or password"));
            }
            
            User user = userOpt.get();
            
            // Check if account is locked
            if (user.isAccountLocked()) {
                if (user.getLockoutEndTime() != null && LocalDateTime.now().isAfter(user.getLockoutEndTime())) {
                    // Unlock account
                    user.setAccountLocked(false);
                    user.setFailedLoginAttempts(0);
                    user.setLockoutEndTime(null);
                    userRepository.save(user);
                } else {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("message", "Account is locked. Please try again later."));
                }
            }
            
            // Verify password
            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                // Increment failed attempts
                user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);
                
                if (user.getFailedLoginAttempts() >= 5) {
                    user.setAccountLocked(true);
                    user.setLockoutEndTime(LocalDateTime.now().plusMinutes(30));
                    userRepository.save(user);
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("message", "Account locked due to too many failed attempts"));
                }
                
                userRepository.save(user);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid email or password"));
            }
            
            // Check email verification - REQUIRED for login
            if (!user.isEmailVerified()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Please verify your email first. Check your inbox for the verification link."));
            }
            
            // Authenticate
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            
            // Reset failed attempts
            user.setFailedLoginAttempts(0);
            user.setLastLoginAt(LocalDateTime.now());
            userRepository.save(user);
            
            // Generate tokens
            UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
            String accessToken = jwtUtil.generateToken(userDetails);
            String refreshToken = jwtUtil.generateRefreshToken(userDetails);
            
            return ResponseEntity.ok(new AuthResponse(accessToken, refreshToken, user));
            
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid email or password"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An error occurred during login"));
        }
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> request) {
        try {
            String refreshToken = request.get("refreshToken");
            
            if (refreshToken == null || !jwtUtil.validateToken(refreshToken)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid refresh token"));
            }
            
            String username = jwtUtil.extractUsername(refreshToken);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            
            String newAccessToken = jwtUtil.generateToken(userDetails);
            String newRefreshToken = jwtUtil.generateRefreshToken(userDetails);
            
            return ResponseEntity.ok(Map.of(
                    "accessToken", newAccessToken,
                    "refreshToken", newRefreshToken,
                    "tokenType", "Bearer"
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Token refresh failed"));
        }
    }
}
