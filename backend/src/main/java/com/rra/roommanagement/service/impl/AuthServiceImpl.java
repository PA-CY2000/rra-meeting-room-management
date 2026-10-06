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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailProducer emailProducer;

    @Value("${app.default-password}")
    private String defaultPassword;

    @Value("${app.base-url}")
    private String baseUrl;

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }
        log.info("User logged in: {}", user.getEmail());

        // Send password reset email on first login (password not yet changed)
        if (!Boolean.TRUE.equals(user.getPasswordChanged())) {
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
            log.info("First login - password reset email sent to: {}", user.getEmail());
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getEmail(), user.getFullName(), user.getRole().name());
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }
        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(defaultPassword))
                .role(User.Role.USER)
                .passwordChanged(false)
                .build();
        userRepository.save(user);
        log.info("New admin registered: {}", user.getEmail());
        String jwtToken = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(jwtToken, user.getEmail(), user.getFullName(), user.getRole().name());
    }

    @Override
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No account found with that email"));
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
        log.info("Password reset email queued for: {}", email);
    }

    @Override
    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByPasswordResetToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset token"));
        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Reset token has expired");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setResetTokenExpiry(null);
        user.setPasswordChanged(true);
        userRepository.save(user);
        log.info("Password reset for: {}", user.getEmail());
    }
}
