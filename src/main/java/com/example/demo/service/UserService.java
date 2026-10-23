package com.example.demo.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;

@Service
public class UserService {

    private static final int MIN_PASSWORD_LENGTH = 4;
    private static final int MAX_PASSWORD_BYTES = 72; // BCrypt limit

    // passwords are stored as BCrypt hashes, never as plain text (bean defined in SecurityConfig)
    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private UserRepository userRepo;

    // REGISTER USER
    public User registerUser(User user) {
        if (user.getEmail() == null || user.getEmail().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }
        if (!isValidPassword(user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Password must be " + MIN_PASSWORD_LENGTH + " to " + MAX_PASSWORD_BYTES + " characters");
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
        user.setPassword(encoder.encode(user.getPassword()));
        return userRepo.save(user);
    }

    // LOGIN: returns the user only if the password is correct.
    // Old accounts that still have a plain-text password are upgraded to BCrypt on their first login.
    public Optional<User> authenticate(String email, String rawPassword) {
        if (email == null || rawPassword == null
                || rawPassword.getBytes(StandardCharsets.UTF_8).length > MAX_PASSWORD_BYTES) {
            return Optional.empty();
        }
        Optional<User> opt = userRepo.findByEmail(email.trim());
        if (opt.isEmpty() || opt.get().getPassword() == null) return Optional.empty();

        User u = opt.get();
        String stored = u.getPassword();

        if (stored.matches("^\\$2[aby]\\$\\d{2}\\$.{53}$")) { // already a BCrypt hash
            return encoder.matches(rawPassword, stored) ? Optional.of(u) : Optional.empty();
        }

        // legacy plain-text password
        boolean same = MessageDigest.isEqual(
                stored.getBytes(StandardCharsets.UTF_8), rawPassword.getBytes(StandardCharsets.UTF_8));
        if (!same) return Optional.empty();

        u.setPassword(encoder.encode(rawPassword));
        return Optional.of(userRepo.save(u));
    }

    public boolean adminExists() {
        return userRepo.existsByRole(User.Role.admin);
    }

    private boolean isValidPassword(String p) {
        return p != null && p.length() >= MIN_PASSWORD_LENGTH
                && p.getBytes(StandardCharsets.UTF_8).length <= MAX_PASSWORD_BYTES;
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
        if (email == null || !isValidPassword(newPassword)) return false;

        Optional<User> opt = userRepo.findByEmail(email.trim());
        if (opt.isEmpty()) return false;

        User u = opt.get();
        u.setPassword(encoder.encode(newPassword));
        userRepo.save(u);
        return true;
    }

    // UPDATE PROFILE (student or admin edits their own details)
    // password, role and createdAt are never changed here
    public User updateProfile(Long id, User in) {
        User u = userRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (in.getFirstname() == null || in.getFirstname().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name is required");
        }
        if (in.getEmail() == null || in.getEmail().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }

        String email = in.getEmail().trim();
        Optional<User> other = userRepo.findByEmail(email);
        if (other.isPresent() && !other.get().getUserid().equals(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }

        u.setFirstname(in.getFirstname().trim());
        u.setLastname(in.getLastname() == null ? "" : in.getLastname().trim());
        u.setEmail(email);
        u.setGender(in.getGender());
        u.setMobile(in.getMobile());
        u.setDob(in.getDob());
        u.setRollNo(in.getRollNo());
        u.setCollege(in.getCollege());
        u.setBranch(in.getBranch());
        u.setProfileImage(in.getProfileImage()); // null = photo removed
        return userRepo.save(u);
    }

    // GET USER BY ID
    public User getUserById(Long id) {
        return userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
 // GET ALL STUDENTS (ADMIN)
    public List<User> getAllStudents() {
        return userRepo.findByRole(User.Role.student);
    }
}