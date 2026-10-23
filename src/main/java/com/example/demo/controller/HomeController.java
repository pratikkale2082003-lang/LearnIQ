package com.example.demo.controller;

import java.util.HashMap;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.model.User;
import com.example.demo.security.JwtAuthFilter;
import com.example.demo.security.JwtUtil;
import com.example.demo.service.OtpService;
import com.example.demo.service.UserService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5000")
public class HomeController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private OtpService otpService;

    // REGISTER
    // Accepts: firstname, lastname, email, password, role,
    //          gender, mobile, dob (yyyy-MM-dd), rollNo, college, branch, profileImage (base64)
    @PostMapping("/register")
    public Map<String, Object> register(
            @RequestBody User user,
            @RequestAttribute(name = JwtAuthFilter.ATTR_ROLE, required = false) String callerRole) {

        // Only a logged-in admin can create another admin
        // (exception: if no admin exists yet, the first admin can be created)
        if (user.getRole() == User.Role.admin
                && !"admin".equals(callerRole)
                && userService.adminExists()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only an admin can create admin accounts");
        }

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

        User user = userService.authenticate(loginUser.getEmail(), loginUser.getPassword())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        Map<String, Object> response = new HashMap<>();
        response.put("userId", user.getUserid());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());
        response.put("firstname", user.getFirstname());
        response.put("lastname", user.getLastname());
        response.put("token", jwtUtil.generate(user.getUserid(), user.getRole() == null ? "student" : user.getRole().name()));
        return response;
    }

    // FORGOT PASSWORD - step 1: email an OTP.
    // The answer is always the same, so nobody can use this to find out which emails are registered.
    @PostMapping("/forgot-password/request")
    public ResponseEntity<Map<String, String>> forgotPasswordRequest(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email != null && !email.isBlank() && userService.findByEmail(email.trim()).isPresent()) {
            otpService.issue(email);
        }
        return ResponseEntity.ok(Map.of("message", "If this email is registered, an OTP has been sent."));
    }

    // FORGOT PASSWORD - step 2: email + OTP + new password
    @PostMapping("/forgot-password/reset")
    public ResponseEntity<Map<String, String>> forgotPasswordReset(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String otp = body.get("otp");
        String newPassword = body.get("newPassword");

        if (email == null || otp == null || newPassword == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Email, OTP and new password are required"));
        }
        if (!otpService.verify(email, otp)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Invalid or expired OTP"));
        }
        if (!userService.resetPassword(email, newPassword)) {
            // OTP is still valid, so the user can retry with a proper password
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Password must be 4 to 72 characters"));
        }
        otpService.invalidate(email); // one OTP = one reset
        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }

    // PROFILE: all registration details EXCEPT the password
    // own profile, or any profile for an admin
    @PreAuthorize("hasRole('ADMIN') or @guard.isSelf(authentication, #userId)")
    @GetMapping("/profile/{userId}")
    public ResponseEntity<Map<String, Object>> getProfile(@PathVariable Long userId) {
        User u;
        try {
            u = userService.getUserById(userId);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.ok(toProfile(u));
    }

    // UPDATE PROFILE (works for both student and admin)
    // Accepts: firstname, lastname, email, gender, mobile, dob (yyyy-MM-dd),
    //          rollNo, college, branch, profileImage (base64 or null)
    // only the owner can edit
    @PreAuthorize("@guard.isSelf(authentication, #userId)")
    @PutMapping("/profile/{userId}")
    public ResponseEntity<Map<String, Object>> updateProfile(@PathVariable Long userId,
                                                             @RequestBody User body) {
        User saved = userService.updateProfile(userId, body);
        return ResponseEntity.ok(toProfile(saved));
    }

    private Map<String, Object> toProfile(User u) {
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
        return profile;
    }
}