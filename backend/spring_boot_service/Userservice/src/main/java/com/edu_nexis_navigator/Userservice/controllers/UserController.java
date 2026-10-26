package com.edu_nexis_navigator.Userservice.controllers;

import java.security.Principal;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.edu_nexis_navigator.Userservice.entity.UserEntity;
import com.edu_nexis_navigator.Userservice.repository.UserRepository;

@RestController
@RequestMapping("/user")

public class UserController {
	private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getCurrentUserProfile(Principal principal) {
        // principal.getName() automatically retrieves the username encoded in the JWT token
        String username = principal.getName();

        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Return user details safely (avoid exposing passwords!)
        return ResponseEntity.ok(new UserProfileResponse(user.getUsername(), user.getEmail()));
    }
    
    record UserProfileResponse(String username, String email) {}
}
