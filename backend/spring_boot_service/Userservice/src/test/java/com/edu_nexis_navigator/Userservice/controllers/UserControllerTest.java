package com.edu_nexis_navigator.Userservice.controllers;

import com.edu_nexis_navigator.Userservice.dto.UserProfileResponse;
import com.edu_nexis_navigator.Userservice.exception.GlobalExceptionHandler;
import com.edu_nexis_navigator.Userservice.exception.UserNotFoundException;
import com.edu_nexis_navigator.Userservice.services.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.security.Principal;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController userController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(userController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("GET /user/profile - Should return 200 OK with user details when authenticated")
    void shouldReturnProfileWhenAuthenticated() throws Exception {
        Principal principal = () -> "testuser";
        UserProfileResponse profileResponse = new UserProfileResponse("testuser", "test@example.com");

        when(userService.getUserProfile("testuser")).thenReturn(profileResponse);

        mockMvc.perform(get("/user/profile").principal(principal))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    @Test
    @DisplayName("GET /user/profile - Should return 404 Not Found when user does not exist in DB")
    void shouldReturn404WhenUserNotFound() throws Exception {
        Principal principal = () -> "deleteduser";

        when(userService.getUserProfile("deleteduser"))
                .thenThrow(new UserNotFoundException("User not found with username: deleteduser"));

        mockMvc.perform(get("/user/profile").principal(principal))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.message").value("User not found with username: deleteduser"));
    }

    @Test
    @DisplayName("GET /user/profile - Should return 401 Unauthorized when Principal is missing")
    void shouldReturn401WhenPrincipalMissing() throws Exception {
        mockMvc.perform(get("/user/profile"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"))
                .andExpect(jsonPath("$.message").value("Full authentication is required to access this resource"));
    }
}

