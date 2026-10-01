package com.example.demo.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.model.TestRequest;

public interface TestRequestRepository extends JpaRepository<TestRequest, Long> {
    List<TestRequest> findByStudentIdAndApprovedTrue(Long studentId);
    List<TestRequest> findByStudentId(Long studentId);
    boolean existsByTest_TestidAndStudentId(Long testId, Long studentId);
  List<TestRequest> findByApprovedFalse();
}