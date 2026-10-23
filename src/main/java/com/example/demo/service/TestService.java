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
        if (test.getCreatedAt() == null) {
            test.setCreatedAt(LocalDateTime.now());   // NEW: for daily/monthly report
        }
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

        // NEW: if the previous schedule has EXPIRED (its day is over), old approvals are cleared.
        // Students must send a new request and the admin must approve again.
        LocalDateTime old = test.getScheduleDate();
        if (old != null && LocalDateTime.now().isAfter(old.toLocalDate().atTime(23, 59, 59))) {
            requestRepo.deleteAll(requestRepo.findByTest_Testid(testId));
        }

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
        req.setRequestedAt(LocalDateTime.now());   // NEW
        TestRequest saved = requestRepo.save(req);

        return toMap(saved);
    }

    // Admin: pending requests
    public List<Map<String, Object>> getPendingRequests() {
        return requestRepo.findByApprovedFalse().stream()
                .map(this::toMap)
                .toList();
    }

    // NEW: admin dashboard - all requests (pending + approved)
    public List<Map<String, Object>> getAllRequests() {
        return requestRepo.findAll().stream()
                .map(this::toMap)
                .toList();
    }

    // NEW: admin rejects a request (row is deleted, student can request again)
    public Map<String, Object> rejectRequest(Long requestId) {
        TestRequest req = requestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        requestRepo.delete(req);
        Map<String, Object> m = new HashMap<>();
        m.put("message", "Request rejected");
        return m;
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
        m.put("requestedAt", r.getRequestedAt());                   // NEW
        m.put("studentName", getStudentName(r.getStudentId()));     // NEW
        return m;
    }

    // NEW: studentId varun email (nasel tar "-")
    private String getStudentEmail(Long studentId) {
        if (studentId == null) return "-";
        return userRepo.findById(studentId)
                .map(User::getEmail)
                .orElse("-");
    }

    // NEW: studentId varun full name (nasel tar "-")
    private String getStudentName(Long studentId) {
        if (studentId == null) return "-";
        return userRepo.findById(studentId)
                .map(u -> ((u.getFirstname() == null ? "" : u.getFirstname()) + " "
                        + (u.getLastname() == null ? "" : u.getLastname())).trim())
                .filter(n -> !n.isEmpty())
                .orElse("-");
    }
}