package com.example.demo.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.model.User;
import com.example.demo.service.UserService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5000")
public class HomeController {

    @Autowired
    private UserService userService;

    // REGISTER
    // Accepts: firstname, lastname, email, password, role,
    //          gender, mobile, dob (yyyy-MM-dd), rollNo, college, branch, profileImage (base64)
    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody User user) {
        User saved = userService.registerUser(user);

        // Do not return the whole entity (it contains the password and the large profile image)
        Map<String, Object> response = new HashMap<>();
        response.put("userId", saved.getUserid());
        response.put("email", saved.getEmail());
        response.put("role", saved.getRole());
        response.put("message", "Registered successfully");
        return response;
    }

    // LOGIN
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody User loginUser) {

        User user = userService.findByEmail(loginUser.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (user.getPassword() == null || !user.getPassword().equals(loginUser.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("userId", user.getUserid());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());
        response.put("firstname", user.getFirstname());
        response.put("lastname", user.getLastname());
        return response;
    }

    // FORGOT PASSWORD (email + new password)
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> body) {
        boolean ok = userService.resetPassword(body.get("email"), body.get("newPassword"));

        if (!ok) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Email not found"));
        }
        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }

    // PROFILE: all registration details EXCEPT the password
    @GetMapping("/profile/{userId}")
    public ResponseEntity<Map<String, Object>> getProfile(@PathVariable Long userId) {
        User u;
        try {
            u = userService.getUserById(userId);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        Map<String, Object> profile = new HashMap<>();
        profile.put("userId", u.getUserid());
        profile.put("firstname", u.getFirstname());
        profile.put("lastname", u.getLastname());
        profile.put("email", u.getEmail());
        profile.put("role", u.getRole());
        profile.put("gender", u.getGender());
        profile.put("mobile", u.getMobile());
        profile.put("dob", u.getDob());
        profile.put("rollNo", u.getRollNo());
        profile.put("college", u.getCollege());
        profile.put("branch", u.getBranch());
        profile.put("profileImage", u.getProfileImage());
        profile.put("createdAt", u.getCreatedAt());
        // NOTE: password is intentionally never returned
        return ResponseEntity.ok(profile);
    }
}