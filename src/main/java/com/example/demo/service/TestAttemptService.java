package com.example.demo.service;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.Test_Attempt;
import com.example.demo.repository.Test_AttemptRepository;

@Service
public class TestAttemptService {

	
	@Autowired
	 private Test_AttemptRepository testattemptrepo;
	 
//	 Start test
	 public Test_Attempt startTest(Test_Attempt  attempt) {
		 attempt.setAttemptdate(LocalDateTime.now());
		 attempt.setStatus("started");
		 return testattemptrepo.save(attempt);
		 
	 }
	 
//	 submit test 
	 public Test_Attempt submittest(Long attemptId) {
		 Test_Attempt attempt = testattemptrepo.findById(attemptId).orElseThrow(() -> new RuntimeException("Attempt not found"));
		 
attempt.setStatus("submitted");
return testattemptrepo.save(attempt);
	 }
}
