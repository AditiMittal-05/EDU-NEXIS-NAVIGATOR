package com.edu_nexis_navigator.Userservice.services;

import com.edu_nexis_navigator.Userservice.dto.LoginRequest;
import com.edu_nexis_navigator.Userservice.dto.LoginResponse;
import com.edu_nexis_navigator.Userservice.dto.RegisterRequest;
import com.edu_nexis_navigator.Userservice.dto.RegisterResponse;
import com.edu_nexis_navigator.Userservice.dto.UserProfileResponse;
import com.edu_nexis_navigator.Userservice.entity.UserEntity;
import com.edu_nexis_navigator.Userservice.exception.UserAlreadyExistsException;
import com.edu_nexis_navigator.Userservice.exception.UserNotFoundException;
import com.edu_nexis_navigator.Userservice.repository.UserRepository;
import com.edu_nexis_navigator.Userservice.security.JwtUtil;
import com.edu_nexis_navigator.Userservice.security.TokenBlacklistService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Date;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private TokenBlacklistService tokenBlacklistService;

    private UserService userService;

    @BeforeEach
    void setUp() {
        userService = new UserService(userRepository, passwordEncoder, jwtUtil, authenticationManager, tokenBlacklistService);
    }

    @Test
    @DisplayName("Should successfully register a new user")
    void shouldRegisterNewUserSuccessfully() {
        RegisterRequest request = new RegisterRequest("testuser", "test@example.com", "securePassword123");

        when(userRepository.existsByUsername(request.username())).thenReturn(false);
        when(userRepository.existsByEmail(request.email())).thenReturn(false);
        when(passwordEncoder.encode(request.password())).thenReturn("encodedPassword");

        RegisterResponse response = userService.registerUser(request);

        assertNotNull(response);
        assertEquals("User registered successfully!", response.message());
        assertEquals("testuser", response.username());
        assertEquals("test@example.com", response.email());
        verify(userRepository).save(any(UserEntity.class));
    }

    @Test
    @DisplayName("Should throw UserAlreadyExistsException when username is duplicate")
    void shouldThrowExceptionWhenUsernameAlreadyExists() {
        RegisterRequest request = new RegisterRequest("existinguser", "test@example.com", "password123");

        when(userRepository.existsByUsername(request.username())).thenReturn(true);

        UserAlreadyExistsException ex = assertThrows(UserAlreadyExistsException.class, () ->
                userService.registerUser(request)
        );
        assertEquals("Error: Username is already taken!", ex.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw UserAlreadyExistsException when email is duplicate")
    void shouldThrowExceptionWhenEmailAlreadyExists() {
        RegisterRequest request = new RegisterRequest("newuser", "existing@example.com", "password123");

        when(userRepository.existsByUsername(request.username())).thenReturn(false);
        when(userRepository.existsByEmail(request.email())).thenReturn(true);

        UserAlreadyExistsException ex = assertThrows(UserAlreadyExistsException.class, () ->
                userService.registerUser(request)
        );
        assertEquals("Error: Email is already in use!", ex.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when registration password exceeds 72 bytes")
    void shouldThrowExceptionWhenRegisterPasswordExceeds72Bytes() {
        // 73 ASCII characters = 73 bytes
        String oversizedPassword = "A".repeat(73);
        RegisterRequest request = new RegisterRequest("user", "user@example.com", oversizedPassword);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                userService.registerUser(request)
        );
        assertEquals("Password must not exceed 72 bytes", ex.getMessage());
    }

    @Test
    @DisplayName("Should successfully authenticate and return JWT on login")
    void shouldLoginSuccessfully() {
        LoginRequest request = new LoginRequest("testuser", "password123");
        String fakeToken = "mocked.jwt.token";

        when(jwtUtil.generateToken(request.username())).thenReturn(fakeToken);

        LoginResponse response = userService.loginUser(request);

        assertNotNull(response);
        assertEquals(fakeToken, response.token());
        assertEquals("Bearer", response.type());
        assertEquals("testuser", response.username());
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    @DisplayName("Should throw BadCredentialsException on invalid credentials during login")
    void shouldThrowExceptionOnInvalidLoginCredentials() {
        LoginRequest request = new LoginRequest("testuser", "wrongPassword");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThrows(BadCredentialsException.class, () -> userService.loginUser(request));
    }

    @Test
    @DisplayName("Should reject login password exceeding 72 bytes before authentication")
    void shouldRejectOversizedLoginPassword() {
        String oversizedPassword = "A".repeat(73);
        LoginRequest request = new LoginRequest("testuser", oversizedPassword);

        assertThrows(BadCredentialsException.class, () -> userService.loginUser(request));
        verify(authenticationManager, never()).authenticate(any());
    }

    @Test
    @DisplayName("Should successfully logout and blacklist valid token")
    void shouldLogoutAndBlacklistToken() {
        String token = "valid.token.to.revoke";
        String authHeader = "Bearer " + token;
        Date expiry = new Date(System.currentTimeMillis() + 60000);

        when(jwtUtil.validateJwtToken(token)).thenReturn(true);
        when(jwtUtil.getExpirationDateFromToken(token)).thenReturn(expiry);

        userService.logout(authHeader);

        verify(tokenBlacklistService).blacklistToken(token, expiry);
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when logout header is invalid")
    void shouldThrowExceptionWhenLogoutHeaderIsInvalid() {
        assertThrows(IllegalArgumentException.class, () -> userService.logout(null));
        assertThrows(IllegalArgumentException.class, () -> userService.logout("InvalidHeader"));
        verify(tokenBlacklistService, never()).blacklistToken(anyString(), any());
    }

    @Test
    @DisplayName("Should retrieve user profile successfully")
    void shouldRetrieveUserProfileSuccessfully() {
        String username = "john";
        UserEntity user = new UserEntity();
        user.setUsername(username);
        user.setEmail("john@example.com");

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));

        UserProfileResponse profile = userService.getUserProfile(username);

        assertNotNull(profile);
        assertEquals("john", profile.username());
        assertEquals("john@example.com", profile.email());
    }

    @Test
    @DisplayName("Should throw UserNotFoundException when profile user is missing from DB")
    void shouldThrowExceptionWhenProfileUserNotFound() {
        when(userRepository.findByUsername("unknown")).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> userService.getUserProfile("unknown"));
    }

    @Test
    @DisplayName("Should throw BadCredentialsException when profile username is null or blank")
    void shouldThrowExceptionWhenProfileUsernameBlank() {
        assertThrows(BadCredentialsException.class, () -> userService.getUserProfile(null));
        assertThrows(BadCredentialsException.class, () -> userService.getUserProfile("  "));
    }
}

