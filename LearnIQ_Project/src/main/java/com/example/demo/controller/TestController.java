package com.example.demo.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.demo.model.Test;
import com.example.demo.service.TestService;

@RestController
@RequestMapping("/api/tests")
@CrossOrigin(origins = "http://localhost:5000")
public class TestController {

    @Autowired
    private TestService testService;

    @PostMapping
    public Test createTest(@RequestBody Test test) {
        return testService.createTest(test);
    }

    @GetMapping
    public List<Test> getAllTests() {
        return testService.getAllTests();
    }

    @GetMapping("/{id}")
    public Test getTestById(@PathVariable Long id) {
        return testService.getTestById(id);
    }

    @PostMapping("/schedule")
    public Test scheduleTest(@RequestBody Map<String, String> payload) {
        Long testId = Long.valueOf(payload.get("testId"));
        LocalDate date = LocalDate.parse(payload.get("scheduleDate"));
        LocalTime time = LocalTime.parse(payload.get("scheduleTime"));
        LocalDateTime scheduleDateTime = LocalDateTime.of(date, time);
        return testService.scheduleTest(testId, scheduleDateTime);
    }

    @PostMapping("/student/request")
    public Test studentRequestTest(@RequestBody Map<String, String> payload) {
        Long testId = Long.valueOf(payload.get("testId"));
        Long studentId = Long.valueOf(payload.get("studentId"));
        return testService.requestTest(testId, studentId);
    }

    @PostMapping("/admin/approve")
    public Test adminApproveTest(@RequestBody Map<String, String> payload) {
        Long testId = Long.valueOf(payload.get("testId"));
        return testService.approveTest(testId);
    }

    @GetMapping("/student/{studentId}/approved")
    public List<Test> getApprovedTests(@PathVariable Long studentId) {
        return testService.getApprovedTestsForStudent(studentId);
    }
}
