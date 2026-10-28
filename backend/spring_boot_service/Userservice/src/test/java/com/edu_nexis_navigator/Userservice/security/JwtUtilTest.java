package com.edu_nexis_navigator.Userservice.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private static final String VALID_SECRET = "super-secret-key-that-is-at-least-256-bits-long-for-testing-123456";
    private static final long EXPIRATION_MS = 3600000; // 1 hour

    @Test
    @DisplayName("Should initialize and generate/validate token with valid secret")
    void shouldInitializeAndProcessTokenWithValidSecret() {
        JwtUtil jwtUtil = new JwtUtil(VALID_SECRET, EXPIRATION_MS);

        String username = "testuser";
        String token = jwtUtil.generateToken(username);

        assertNotNull(token);
        assertTrue(jwtUtil.validateJwtToken(token));
        assertEquals(username, jwtUtil.getUsernameFromToken(token));
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when secret is null or empty")
    void shouldThrowExceptionWhenSecretIsNullOrEmpty() {
        IllegalArgumentException nullEx = assertThrows(IllegalArgumentException.class, () ->
                new JwtUtil(null, EXPIRATION_MS)
        );
        assertEquals("JWT secret key must not be null or empty.", nullEx.getMessage());

        IllegalArgumentException emptyEx = assertThrows(IllegalArgumentException.class, () ->
                new JwtUtil("   ", EXPIRATION_MS)
        );
        assertEquals("JWT secret key must not be null or empty.", emptyEx.getMessage());
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when secret is less than 256 bits (32 bytes)")
    void shouldThrowExceptionWhenSecretIsTooShort() {
        String shortSecret = "too-short-secret"; // 16 bytes

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                new JwtUtil(shortSecret, EXPIRATION_MS)
        );
        assertTrue(ex.getMessage().contains("at least 256 bits"));
    }

    @Test
    @DisplayName("Should return false for invalid token")
    void shouldReturnFalseForInvalidToken() {
        JwtUtil jwtUtil = new JwtUtil(VALID_SECRET, EXPIRATION_MS);

        assertFalse(jwtUtil.validateJwtToken("invalid.jwt.token"));
    }
}

