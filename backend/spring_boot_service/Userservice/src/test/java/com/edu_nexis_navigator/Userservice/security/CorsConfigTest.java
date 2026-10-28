package com.edu_nexis_navigator.Userservice.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class CorsConfigTest {

    @Test
    @DisplayName("Should allow configured trusted origins and reject untrusted origins")
    void shouldAllowConfiguredTrustedOriginsOnly() {
        List<String> trustedOrigins = List.of("http://localhost:3000", "http://localhost:5173");
        SecurityConfig securityConfig = new SecurityConfig(null, trustedOrigins);

        CorsConfigurationSource source = securityConfig.corsConfigurationSource();
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/auth/login");

        CorsConfiguration config = source.getCorsConfiguration(request);
        assertNotNull(config);

        // Verify trusted origins are allowed
        assertEquals("http://localhost:3000", config.checkOrigin("http://localhost:3000"));
        assertEquals("http://localhost:5173", config.checkOrigin("http://localhost:5173"));

        // Verify untrusted origin is rejected
        assertNull(config.checkOrigin("http://malicious-website.com"));
        assertNull(config.checkOrigin("http://attacker.com"));

        // Verify credentials and headers
        assertTrue(Boolean.TRUE.equals(config.getAllowCredentials()));
        assertTrue(config.getAllowedMethods().containsAll(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS")));
        assertTrue(config.getAllowedHeaders().containsAll(List.of("Authorization", "Content-Type")));
    }
}

