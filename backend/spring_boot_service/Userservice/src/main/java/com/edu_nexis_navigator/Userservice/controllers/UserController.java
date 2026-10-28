package com.edu_nexis_navigator.Userservice.controllers;

import java.security.Principal;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.edu_nexis_navigator.Userservice.dto.UserProfileResponse;
import com.edu_nexis_navigator.Userservice.services.UserService;

@RestController
@RequestMapping("/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getCurrentUserProfile(Principal principal) {
        if (principal == null || principal.getName() == null) {
            throw new BadCredentialsException("Full authentication is required to access this resource");
        }

        UserProfileResponse profile = userService.getUserProfile(principal.getName());
        return ResponseEntity.ok(profile);
    }
}
