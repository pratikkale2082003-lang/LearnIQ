package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.demo.model.Score;
import com.example.demo.model.Test;
import com.example.demo.model.User;
import com.example.demo.service.ScoreService;
import com.example.demo.service.TestService;
import com.example.demo.service.UserService;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5000")
public class AdminController {

    @Autowired
    private TestService testsr;

    @Autowired
    private UserService usersr;

    @Autowired
    private ScoreService scoresr;

    // ✅ Create new test
    @PostMapping("/tests")
    public Test createTest(@RequestBody Test test) {
        return testsr.createTest(test);
    }

    // ✅ Get all tests
    @GetMapping("/tests")
    public List<Test> getAlltests() {
        return testsr.getAllTests();
    }

    // ✅ Get all users
    @GetMapping("/users")
    public List<User> getAlluseer() {
        return usersr.getAllUsers();
    }

    // ✅ Get all results
    @GetMapping("/results")
    public List<Score> getAllresult() {
        return scoresr.getAllScores();
    }
}
