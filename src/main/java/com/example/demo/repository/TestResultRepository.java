package com.example.demo.repository;


import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.TestResult;

public interface TestResultRepository extends JpaRepository<TestResult, Long> {
}
