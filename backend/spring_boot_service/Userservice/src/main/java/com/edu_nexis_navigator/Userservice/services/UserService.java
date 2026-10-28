package com.edu_nexis_navigator.Userservice.services;

import com.edu_nexis_navigator.Userservice.dto.*;
import com.edu_nexis_navigator.Userservice.entity.UserEntity;
import com.edu_nexis_navigator.Userservice.exception.UserAlreadyExistsException;
import com.edu_nexis_navigator.Userservice.exception.UserNotFoundException;
import com.edu_nexis_navigator.Userservice.repository.UserRepository;
import com.edu_nexis_navigator.Userservice.security.JwtUtil;
import com.edu_nexis_navigator.Userservice.security.TokenBlacklistService;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final TokenBlacklistService tokenBlacklistService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtils,
            AuthenticationManager authenticationManager, TokenBlacklistService tokenBlacklistService) {
        super();
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.authenticationManager = authenticationManager;
        this.tokenBlacklistService = tokenBlacklistService;
    }

    public RegisterResponse registerUser(RegisterRequest request) {
        if (request.password() != null && request.password().getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new IllegalArgumentException("Password must not exceed 72 bytes");
        }
        if (userRepository.existsByUsername(request.username())) {
            throw new UserAlreadyExistsException("Error: Username is already taken!");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new UserAlreadyExistsException("Error: Email is already in use!");
        }

        UserEntity user = new UserEntity();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        
        userRepository.save(user);

        return new RegisterResponse("User registered successfully!", user.getUsername(), user.getEmail());
    }

    public LoginResponse loginUser(LoginRequest request) {
        if (request.password() != null && request.password().getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new BadCredentialsException("Invalid username or password");
        }
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );

        String token = jwtUtils.generateToken(request.username());
        return new LoginResponse(token, request.username());
    }

    public void logout(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Authorization header with Bearer token is required for logout");
        }
        String token = authHeader.substring(7);
        if (jwtUtils.validateJwtToken(token)) {
            Date expiration = jwtUtils.getExpirationDateFromToken(token);
            if (expiration != null) {
                tokenBlacklistService.blacklistToken(token, expiration);
            }
        }
        SecurityContextHolder.clearContext();
    }

    public UserProfileResponse getUserProfile(String username) {
        if (username == null || username.trim().isEmpty()) {
            throw new BadCredentialsException("Unauthenticated or invalid user identity");
        }
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found with username: " + username));
        return new UserProfileResponse(user.getUsername(), user.getEmail());
    }
    
    public UserEntity getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));
    }

}
