package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;

@Service
public class UserService {

    private static final int MIN_PASSWORD_LENGTH = 4;

    @Autowired
    private UserRepository userRepo;

    // REGISTER USER
    public User registerUser(User user) {
        if (user.getEmail() == null || user.getEmail().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }
        if (user.getPassword() == null || user.getPassword().length() < MIN_PASSWORD_LENGTH) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Password must be at least " + MIN_PASSWORD_LENGTH + " characters");
        }

        user.setEmail(user.getEmail().trim());

        // Reject duplicate emails (frontend shows "already registered" on 409)
        if (userRepo.findByEmail(user.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }

        if (user.getRole() == null) {
            user.setRole(User.Role.student);
        }
        user.setCreatedAt(LocalDateTime.now());
        return userRepo.save(user);
    }

    // FIND USER BY EMAIL (USED IN LOGIN)
    public Optional<User> findByEmail(String email) {
        return userRepo.findByEmail(email);
    }

    // GET ALL USERS (ADMIN)
    public List<User> getAllUsers() {
        return userRepo.findAll();
    }

    // FORGOT PASSWORD: reset the password if the email is registered
    public boolean resetPassword(String email, String newPassword) {
        if (email == null || newPassword == null || newPassword.length() < MIN_PASSWORD_LENGTH) return false;

        Optional<User> opt = userRepo.findByEmail(email.trim());
        if (opt.isEmpty()) return false;

        User u = opt.get();
        u.setPassword(newPassword);
        userRepo.save(u);
        return true;
    }

    // GET USER BY ID
    public User getUserById(Long id) {
        return userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}