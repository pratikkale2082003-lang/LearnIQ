package com.example.demo.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.example.demo.model.User;
import com.example.demo.service.UserService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5000")
public class HomeController {

    @Autowired
    private UserService userService;

    // REGISTER
    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return userService.registerUser(user);
    }

    // LOGIN
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody User loginUser) {

        User user = userService.findByEmail(loginUser.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getPassword().equals(loginUser.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("userId", user.getUserid());      // <-- getter cha naav check kar
        response.put("email", user.getEmail());
        response.put("role", user.getRole());
        response.put("firstname", user.getFirstname());
        response.put("lastname", user.getLastname());
        return response;
    }
}