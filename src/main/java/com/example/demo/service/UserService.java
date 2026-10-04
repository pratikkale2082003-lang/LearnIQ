package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepo;

    // REGISTER USER
    public User registerUser(User user) {
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

    // GET USER BY ID
    public User getUserById(Long id) {
        return userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    // FORGOT PASSWORD: reset the password if the email is registered
    public boolean resetPassword(String email, String newPassword) {
        if (email == null || newPassword == null || newPassword.length() < 4) return false;

        Optional<User> opt = userRepo.findByEmail(email.trim());
        if (opt.isEmpty()) return false;

        User u = opt.get();
        u.setPassword(newPassword);
        userRepo.save(u);
        return true;
    }
}
