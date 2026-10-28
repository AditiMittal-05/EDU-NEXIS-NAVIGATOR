package com.edu_nexis_navigator.Userservice.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

class TokenBlacklistServiceTest {

    private TokenBlacklistService tokenBlacklistService;

    @BeforeEach
    void setUp() {
        tokenBlacklistService = new TokenBlacklistService();
    }

    @Test
    @DisplayName("Should blacklist token and recognize it as blacklisted")
    void shouldBlacklistAndRecognizeToken() {
        String token = "sample.jwt.token";
        Date futureDate = new Date(System.currentTimeMillis() + 60000); // 1 minute in future

        tokenBlacklistService.blacklistToken(token, futureDate);

        assertTrue(tokenBlacklistService.isBlacklisted(token));
    }

    @Test
    @DisplayName("Should return false for non-blacklisted token")
    void shouldReturnFalseForNonBlacklistedToken() {
        assertFalse(tokenBlacklistService.isBlacklisted("unknown.jwt.token"));
    }

    @Test
    @DisplayName("Should return false for null token")
    void shouldReturnFalseForNullToken() {
        assertFalse(tokenBlacklistService.isBlacklisted(null));
    }

    @Test
    @DisplayName("Should return false and remove token once expired")
    void shouldReturnFalseAndRemoveTokenOnceExpired() {
        String token = "expired.jwt.token";
        Date pastDate = new Date(System.currentTimeMillis() - 1000); // 1 second ago

        tokenBlacklistService.blacklistToken(token, pastDate);

        assertFalse(tokenBlacklistService.isBlacklisted(token));
    }

    @Test
    @DisplayName("Should clean up expired tokens from memory")
    void shouldCleanupExpiredTokens() {
        String expiredToken = "expired.token";
        String validToken = "valid.token";

        tokenBlacklistService.blacklistToken(expiredToken, new Date(System.currentTimeMillis() - 5000));
        tokenBlacklistService.blacklistToken(validToken, new Date(System.currentTimeMillis() + 60000));

        tokenBlacklistService.cleanupExpiredTokens();

        assertFalse(tokenBlacklistService.isBlacklisted(expiredToken));
        assertTrue(tokenBlacklistService.isBlacklisted(validToken));
    }
}

