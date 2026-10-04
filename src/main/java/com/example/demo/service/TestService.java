package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.Test;
import com.example.demo.model.TestRequest;
import com.example.demo.model.User;
import com.example.demo.repository.TestRepository;
import com.example.demo.repository.TestRequestRepository;
import com.example.demo.repository.UserRepository;


@Service
public class TestService {

    @Autowired
    private TestRepository testrepo;

    @Autowired
    private TestRequestRepository requestRepo;

    // NEW: student cha email shodhnyasathi
    @Autowired
    private UserRepository userRepo;

    // Create or update test
    public Test createTest(Test test) {
        return testrepo.save(test);
    }

    // Get all tests
    public List<Test> getAllTests() {
        return testrepo.findAll();
    }

    // Get test by ID
    public Test getTestById(Long id) {
        return testrepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Test not found"));
    }

    // Schedule test (admin)
    public Test scheduleTest(Long testId, LocalDateTime scheduleDateTime) {
        Test test = getTestById(testId);
        test.setScheduleDate(scheduleDateTime);
        return testrepo.save(test);
    }

    // Student requests a test (pratyek student cha vegla row)
    public Map<String, Object> requestTest(Long testId, Long studentId) {
        if (requestRepo.existsByTest_TestidAndStudentId(testId, studentId)) {
            throw new RuntimeException("Already requested");
        }

        Test test = getTestById(testId);

        TestRequest req = new TestRequest();
        req.setTest(test);
        req.setStudentId(studentId);
        req.setApproved(false);
        TestRequest saved = requestRepo.save(req);

        return toMap(saved);
    }

    // Admin: pending requests
    public List<Map<String, Object>> getPendingRequests() {
        return requestRepo.findByApprovedFalse().stream()
                .map(this::toMap)
                .toList();
    }

    // Admin approves ek specific request
    public Map<String, Object> approveRequest(Long requestId) {
        TestRequest req = requestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        req.setApproved(true);
        return toMap(requestRepo.save(req));
    }

    // Student cha approved tests
    public List<Map<String, Object>> getApprovedTestsForStudent(Long studentId) {
        return requestRepo.findByStudentIdAndApprovedTrue(studentId).stream()
                .map(this::toMap)
                .toList();
    }

    // Student ne request kelele test IDs
    public List<Long> getRequestedTestIds(Long studentId) {
        return requestRepo.findByStudentId(studentId).stream()
                .map(r -> r.getTest().getTestid())
                .toList();
    }

    // TestRequest -> frontend sathi Map
    private Map<String, Object> toMap(TestRequest r) {
        Map<String, Object> m = new HashMap<>();
        m.put("requestId", r.getId());
        m.put("testid", r.getTest().getTestid());
        m.put("title", r.getTest().getTitle());
        m.put("scheduleDate", r.getTest().getScheduleDate());
        m.put("studentId", r.getStudentId());
        m.put("studentEmail", getStudentEmail(r.getStudentId()));   // NEW
        m.put("approved", r.isApproved());
        return m;
    }

    // NEW: studentId varun email (nasel tar "-")
    private String getStudentEmail(Long studentId) {
        if (studentId == null) return "-";
        return userRepo.findById(studentId)
                .map(User::getEmail)
                .orElse("-");
    }
}