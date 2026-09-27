package com.edu_nexis_navigator.Userservice.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.edu_nexis_navigator.Userservice.dto.LoginRequest;
import com.edu_nexis_navigator.Userservice.dto.LoginResponse;
import com.edu_nexis_navigator.Userservice.dto.RegisterRequest;
import com.edu_nexis_navigator.Userservice.dto.RegisterResponse;
import com.edu_nexis_navigator.Userservice.services.UserService;

import jakarta.validation.Valid;
@RestController
@RequestMapping("/auth")
public class AuthController {

	private final UserService userService;
	

    public AuthController(UserService userService) {
		super();
		this.userService = userService;
	}

	@PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
        RegisterResponse response = userService.registerUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = userService.loginUser(request);
        return ResponseEntity.ok(response);
    }
}
