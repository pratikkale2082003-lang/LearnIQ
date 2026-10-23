package com.example.demo.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.demo.model.Test;
import com.example.demo.security.JwtAuthFilter;
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

    // Student request pathavto
    @PostMapping("/student/request")
    public Map<String, Object> studentRequestTest(
            @RequestBody Map<String, String> payload,
            @RequestAttribute(JwtAuthFilter.ATTR_USER_ID) Long authUserId) {
        Long testId = Long.valueOf(payload.get("testId"));
        // the student is whoever is logged in; a studentId in the body is ignored
        return testService.requestTest(testId, authUserId);
    }

    // Admin: sagle pending requests
    @GetMapping("/admin/requests")
    public List<Map<String, Object>> getPendingRequests() {
        return testService.getPendingRequests();
    }

    // Admin: ek request approve karto (requestId var)
    @PostMapping("/admin/approve")
    public Map<String, Object> adminApproveTest(@RequestBody Map<String, String> payload) {
        Long requestId = Long.valueOf(payload.get("requestId"));
        return testService.approveRequest(requestId);
    }

    // Student: fakt tyache approved tests
    @PreAuthorize("hasRole('ADMIN') or @guard.isSelf(authentication, #studentId)")
    @GetMapping("/student/{studentId}/approved")
    public List<Map<String, Object>> getApprovedTests(@PathVariable Long studentId) {
        return testService.getApprovedTestsForStudent(studentId);
    }

    // Student: tyani request kelele test IDs ("Requested" button sathi)
    @PreAuthorize("hasRole('ADMIN') or @guard.isSelf(authentication, #studentId)")
    @GetMapping("/student/{studentId}/requests")
    public List<Long> getRequestedTestIds(@PathVariable Long studentId) {
        return testService.getRequestedTestIds(studentId);
    }
    
 // Admin: sagle requests (pending + approved)
    @GetMapping("/admin/requests/all")
    public List<Map<String, Object>> getAllRequests() {
        return testService.getAllRequests();
    }

    // Admin: request reject karto
    @PostMapping("/admin/reject")
    public Map<String, Object> adminRejectTest(@RequestBody Map<String, String> payload) {
        Long requestId = Long.valueOf(payload.get("requestId"));
        return testService.rejectRequest(requestId);
    }
    
 // Admin: kontahi request (approved pan) delete karto
    @DeleteMapping("/admin/requests/{requestId}")
    public Map<String, Object> adminDeleteRequest(@PathVariable Long requestId) {
        return testService.rejectRequest(requestId);
    }
}