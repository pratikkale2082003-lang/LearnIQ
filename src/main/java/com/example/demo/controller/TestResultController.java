package com.example.demo.controller;

import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.model.TestResult;
import com.example.demo.repository.TestResultRepository;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/results")
@CrossOrigin(origins = "*")
public class TestResultController {

    private final TestResultRepository repo;

    public TestResultController(TestResultRepository repo) {
        this.repo = repo;
    }

    // Student: save the result after submitting a test
    @PostMapping
    public TestResult save(@RequestBody TestResult result) {
        result.setId(null);
        result.setDeletedByAdmin(false);   // a new result is never hidden
        return repo.save(result);
    }

    // Admin: all results, except the ones the admin has deleted (newest first)
    @GetMapping
    public List<TestResult> getAll() {
        return repo.findAll(Sort.by(Sort.Direction.DESC, "submittedAt"))
                   .stream()
                   .filter(r -> !Boolean.TRUE.equals(r.getDeletedByAdmin()))
                   .toList();
    }

    // Student: own results (includes results the admin has deleted)
    @GetMapping("/student/{studentId}")
    public List<TestResult> getByStudent(@PathVariable Long studentId) {
        return repo.findAll(Sort.by(Sort.Direction.DESC, "submittedAt"))
                   .stream()
                   .filter(r -> r.getStudentId().equals(studentId))
                   .toList();
    }

    // Admin: delete a result from the admin list only (soft delete).
    // The row stays in the database so the student can still see it.
    @DeleteMapping("/{id}/admin")
    public ResponseEntity<Map<String, String>> deleteForAdmin(@PathVariable Long id) {
        return repo.findById(id)
                .map(r -> {
                    r.setDeletedByAdmin(true);
                    repo.save(r);
                    return ResponseEntity.ok(Map.of("message", "Result removed from admin list"));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Result not found")));
    }

    // Student: permanently delete own result from the database.
    // Only the owner can delete it (studentId must match the result's studentId).
    // Because the row is removed, it disappears from the admin list as well.
    @DeleteMapping("/{id}/student/{studentId}")
    public ResponseEntity<Map<String, String>> deleteByStudent(@PathVariable Long id,
                                                               @PathVariable Long studentId) {
        return repo.findById(id)
                .map(r -> {
                    if (!r.getStudentId().equals(studentId)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(Map.of("message", "You can delete only your own results"));
                    }
                    repo.delete(r);
                    return ResponseEntity.ok(Map.of("message", "Result deleted"));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Result not found")));
    }
}