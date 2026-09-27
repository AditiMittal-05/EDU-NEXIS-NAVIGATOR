package com.edu_nexis_navigator.Userservice.services;

import com.edu_nexis_navigator.Userservice.dto.*;
import com.edu_nexis_navigator.Userservice.entity.UserEntity;
import com.edu_nexis_navigator.Userservice.repository.UserRepository;
import com.edu_nexis_navigator.Userservice.security.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

	private final UserRepository userRepository;
	@Autowired
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtils;
    private final AuthenticationManager authenticationManager;
    
    
    
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtils,
			AuthenticationManager authenticationManager) {
		super();
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtUtils = jwtUtils;
		this.authenticationManager = authenticationManager;
	}

	public RegisterResponse registerUser(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new RuntimeException("Error: Username is already taken!");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        UserEntity user = new UserEntity();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        
        userRepository.save(user);

        return new RegisterResponse("User registered successfully!", user.getUsername(), user.getEmail());
    }

    public LoginResponse loginUser(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );

        String token = jwtUtils.generateToken(request.username());
        return new LoginResponse(token, request.username());
    }
    
    public UserEntity getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }
	
	
}
