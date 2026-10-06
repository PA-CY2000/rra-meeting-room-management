package com.rra.roommanagement.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

// This class represents a user in the system (admin or regular user)
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column
    private String passwordResetToken;

    @Column
    private LocalDateTime resetTokenExpiry;

    // false = user has not changed their default password yet
    @Column(columnDefinition = "boolean default false")
    private Boolean passwordChanged = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    // Two roles: ADMIN manages everything, USER books rooms
    public enum Role {
        ADMIN, USER
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getPasswordResetToken() { return passwordResetToken; }
    public void setPasswordResetToken(String token) { this.passwordResetToken = token; }

    public LocalDateTime getResetTokenExpiry() { return resetTokenExpiry; }
    public void setResetTokenExpiry(LocalDateTime expiry) { this.resetTokenExpiry = expiry; }

    public Boolean getPasswordChanged() { return passwordChanged; }
    public void setPasswordChanged(Boolean changed) { this.passwordChanged = changed; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
}
