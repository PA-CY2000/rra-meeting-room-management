package com.rra.roommanagement.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

// This class handles creating and reading JWT tokens
@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    // Create a secret key from the configured secret string
    private SecretKey getKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    // Generate a JWT token with user email and role
    public String generateToken(String email, String role) {
        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getKey())
                .compact();
    }

    // Get email from token
    public String extractEmail(String token) {
        return getClaims(token).getSubject();
    }

    // Get role from token
    public String extractRole(String token) {
        return getClaims(token).get("role", String.class);
    }

    // Check if token is valid
    public boolean isTokenValid(String token) {
        try {
            getClaims(token);
            return true;
        } catch (JwtException e) {
            return false;
        }
    }

    private Claims getClaims(String token) {
        return Jwts.parser().verifyWith(getKey()).build()
                .parseSignedClaims(token).getPayload();
    }
}
