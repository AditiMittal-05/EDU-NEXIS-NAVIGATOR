package com.edu_nexis_navigator.Userservice.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;


@RestController 
@RequestMapping ("/user")
public class UserController {

    @GetMapping
    public String getMethodName() {
        return "Hello from User Service";
    }
    

}
