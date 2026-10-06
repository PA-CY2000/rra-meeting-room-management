package com.rra.roommanagement.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

// Data sent from frontend when registering a new user
public class RegisterRequest {

    @NotBlank
    private String fullName;

    @NotBlank
    @Email
    private String email;

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
