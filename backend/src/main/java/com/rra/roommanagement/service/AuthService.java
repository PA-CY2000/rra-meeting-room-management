package com.rra.roommanagement.service;

import com.rra.roommanagement.dto.AuthResponse;
import com.rra.roommanagement.dto.LoginRequest;
import com.rra.roommanagement.dto.RegisterRequest;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    AuthResponse register(RegisterRequest request);
    void forgotPassword(String email);
    void resetPassword(String token, String newPassword);
}
