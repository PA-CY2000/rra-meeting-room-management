package com.rra.roommanagement.service.impl;

import com.rra.roommanagement.dto.AuthResponse;
import com.rra.roommanagement.dto.LoginRequest;
import com.rra.roommanagement.dto.RegisterRequest;
import com.rra.roommanagement.entity.User;
import com.rra.roommanagement.exception.BadRequestException;
import com.rra.roommanagement.exception.ResourceNotFoundException;
import com.rra.roommanagement.repository.UserRepository;
import com.rra.roommanagement.security.JwtUtil;
import com.rra.roommanagement.service.AuthService;
import com.rra.roommanagement.service.EmailProducer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailProducer emailProducer;

    @Value("${app.default-password}")
    private String defaultPassword;

    @Value("${app.base-url}")
    private String baseUrl;

    // Constructor injection
    public AuthServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder,
                           JwtUtil jwtUtil, EmailProducer emailProducer) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.emailProducer = emailProducer;
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        // Check if password matches
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }

        // If first login, send password reset email
        if (!Boolean.TRUE.equals(user.getPasswordChanged())) {
            sendPasswordResetEmail(user);
        }

        // Generate JWT token and return user info
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getEmail(), user.getFullName(), user.getRole().name());
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        // Create new user with default password and USER role
        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(defaultPassword));
        user.setRole(User.Role.USER);
        user.setPasswordChanged(false);
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getEmail(), user.getFullName(), user.getRole().name());
    }

    @Override
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No account found with that email"));

        // Generate reset token valid for 1 hour
        String token = UUID.randomUUID().toString();
        user.setPasswordResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
        userRepository.save(user);

        String resetLink = baseUrl + "/reset-password?token=" + token;
        emailProducer.sendEmail(
                user.getEmail(),
                "RRA Room Management - Password Reset",
                "Hello " + user.getFullName() + ",\n\n" +
                "Click the link below to reset your password (valid 1 hour):\n" +
                resetLink + "\n\n" +
                "If you did not request this, ignore this email.\n\n" +
                "Rwanda Revenue Authority"
        );
    }

    @Override
    public void resetPassword(String token, String newPassword) {
        // Find user by reset token
        User user = userRepository.findByPasswordResetToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset token"));

        // Check if token has expired
        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Reset token has expired");
        }

        // Save new password and clear the token
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setResetTokenExpiry(null);
        user.setPasswordChanged(true);
        userRepository.save(user);
    }

    // Helper method to send password reset email on first login
    private void sendPasswordResetEmail(User user) {
        String token = UUID.randomUUID().toString();
        user.setPasswordResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(24));
        userRepository.save(user);

        String resetLink = baseUrl + "/reset-password?token=" + token;
        emailProducer.sendEmail(
                user.getEmail(),
                "RRA Room Management - Set Your Password",
                "Hello " + user.getFullName() + ",\n\n" +
                "You have logged in for the first time.\n" +
                "Please set your own password using the link below (valid 24 hours):\n" +
                resetLink + "\n\n" +
                "Rwanda Revenue Authority"
        );
    }
}
