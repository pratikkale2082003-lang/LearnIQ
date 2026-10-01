package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.demo.model.Test;
import com.example.demo.repository.TestRepository;

@Service
public class TestService {

    @Autowired
    private TestRepository testrepo;

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
        test.setApproved(false); // reset approval
        test.setRequestedByStudentId(null); // reset previous request
        return testrepo.save(test);
    }

    // Student requests a test
    public Test requestTest(Long testId, Long studentId) {
        Test test = getTestById(testId);
        test.setRequestedByStudentId(studentId);
        test.setApproved(false);
        return testrepo.save(test);
    }

    // Admin approves student request
    public Test approveTest(Long testId) {
        Test test = getTestById(testId);
        test.setApproved(true);
        return testrepo.save(test);
    }

    // Get approved tests for student
    public List<Test> getApprovedTestsForStudent(Long studentId) {
        return testrepo.findAll().stream()
                .filter(t -> t.getRequestedByStudentId() != null
                        && t.getRequestedByStudentId().equals(studentId)
                        && t.isApproved())
                .toList();
    }

	
	}

