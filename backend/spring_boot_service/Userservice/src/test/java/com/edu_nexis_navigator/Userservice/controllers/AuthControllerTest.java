package com.edu_nexis_navigator.Userservice.controllers;

import com.edu_nexis_navigator.Userservice.dto.LoginRequest;
import com.edu_nexis_navigator.Userservice.dto.LoginResponse;
import com.edu_nexis_navigator.Userservice.dto.RegisterRequest;
import com.edu_nexis_navigator.Userservice.dto.RegisterResponse;
import com.edu_nexis_navigator.Userservice.exception.GlobalExceptionHandler;
import com.edu_nexis_navigator.Userservice.exception.UserAlreadyExistsException;
import com.edu_nexis_navigator.Userservice.services.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private AuthController authController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("POST /auth/register - Should return 201 Created on valid input")
    void shouldRegisterUserSuccessfully() throws Exception {
        RegisterResponse response = new RegisterResponse("User registered successfully!", "testuser", "test@example.com");
        when(userService.registerUser(any(RegisterRequest.class))).thenReturn(response);

        String json = "{\"username\":\"testuser\",\"email\":\"test@example.com\",\"password\":\"password123\"}";

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("User registered successfully!"))
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    @Test
    @DisplayName("POST /auth/register - Should return 400 Bad Request on missing username")
    void shouldReturn400OnMissingUsername() throws Exception {
        String json = "{\"username\":\"\",\"email\":\"test@example.com\",\"password\":\"password123\"}";

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.validationErrors.username").exists());
    }

    @Test
    @DisplayName("POST /auth/register - Should return 400 Bad Request on invalid email format")
    void shouldReturn400OnInvalidEmail() throws Exception {
        String json = "{\"username\":\"testuser\",\"email\":\"invalid-email\",\"password\":\"password123\"}";

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.validationErrors.email").exists());
    }

    @Test
    @DisplayName("POST /auth/register - Should return 400 Bad Request when password is under 6 characters")
    void shouldReturn400OnShortPassword() throws Exception {
        String json = "{\"username\":\"testuser\",\"email\":\"test@example.com\",\"password\":\"123\"}";

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.validationErrors.password").exists());
    }

    @Test
    @DisplayName("POST /auth/register - Should return 400 Bad Request when password exceeds 72 characters")
    void shouldReturn400OnOversizedPassword() throws Exception {
        String oversized = "A".repeat(73);
        String json = "{\"username\":\"testuser\",\"email\":\"test@example.com\",\"password\":\"" + oversized + "\"}";

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.validationErrors.password").exists());
    }

    @Test
    @DisplayName("POST /auth/register - Should return 409 Conflict when username already exists")
    void shouldReturn409OnDuplicateUsername() throws Exception {
        when(userService.registerUser(any(RegisterRequest.class)))
                .thenThrow(new UserAlreadyExistsException("Error: Username is already taken!"));

        String json = "{\"username\":\"existing\",\"email\":\"test@example.com\",\"password\":\"password123\"}";

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.error").value("Conflict"))
                .andExpect(jsonPath("$.message").value("Error: Username is already taken!"));
    }

    @Test
    @DisplayName("POST /auth/login - Should return 200 OK on valid credentials")
    void shouldLoginSuccessfully() throws Exception {
        LoginResponse response = new LoginResponse("mocked.jwt.token", "testuser");
        when(userService.loginUser(any(LoginRequest.class))).thenReturn(response);

        String json = "{\"username\":\"testuser\",\"password\":\"password123\"}";

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mocked.jwt.token"))
                .andExpect(jsonPath("$.type").value("Bearer"))
                .andExpect(jsonPath("$.username").value("testuser"));
    }

    @Test
    @DisplayName("POST /auth/login - Should return 401 Unauthorized on bad credentials")
    void shouldReturn401OnBadCredentials() throws Exception {
        when(userService.loginUser(any(LoginRequest.class)))
                .thenThrow(new BadCredentialsException("Invalid username or password"));

        String json = "{\"username\":\"testuser\",\"password\":\"wrongpassword\"}";

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"))
                .andExpect(jsonPath("$.message").value("Invalid username or password"));
    }

    @Test
    @DisplayName("POST /auth/logout - Should return 200 OK with Bearer token")
    void shouldLogoutSuccessfully() throws Exception {
        doNothing().when(userService).logout("Bearer valid.token");

        mockMvc.perform(post("/auth/logout")
                        .header("Authorization", "Bearer valid.token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Logged out successfully"));
    }

    @Test
    @DisplayName("POST /auth/logout - Should return 400 Bad Request when header is missing")
    void shouldReturn400WhenLogoutHeaderMissing() throws Exception {
        doThrow(new IllegalArgumentException("Authorization header with Bearer token is required for logout"))
                .when(userService).logout(null);

        mockMvc.perform(post("/auth/logout"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Authorization header with Bearer token is required for logout"));
    }
}

