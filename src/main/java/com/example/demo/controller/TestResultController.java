package com.example.demo.controller;   // <-- package badla


import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import com.example.demo.model.TestResult;
import com.example.demo.repository.TestResultRepository;

import java.util.List;

@RestController
@RequestMapping("/api/results")
@CrossOrigin(origins = "*")   
public class TestResultController {

    private final TestResultRepository repo;

    public TestResultController(TestResultRepository repo) {
        this.repo = repo;
    }

    // Student submit kelyavar result save
    @PostMapping
    public TestResult save(@RequestBody TestResult result) {
        result.setId(null);
        return repo.save(result);
    }

    // Admin: sarva results (navin pahile)
    @GetMapping
    public List<TestResult> getAll() {
        return repo.findAll(Sort.by(Sort.Direction.DESC, "submittedAt"));
    }

    // Student: swatache results
    @GetMapping("/student/{studentId}")
    public List<TestResult> getByStudent(@PathVariable Long studentId) {
        return repo.findAll(Sort.by(Sort.Direction.DESC, "submittedAt"))
                   .stream()
                   .filter(r -> r.getStudentId().equals(studentId))
                   .toList();
    }
}
