package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.Test_Attempt;
import com.example.demo.service.TestAttemptService;

@RestController
@RequestMapping("/api/attempt")
@CrossOrigin(origins = "http://localhost:5000")
public class TestAttemptController {

	@Autowired
	private TestAttemptService attemptsr;
	
//	Start Test
	@PostMapping("/start")
	public  Test_Attempt starttest(@RequestBody Test_Attempt attempt) {
		return  attemptsr.startTest(attempt);
		
	}
	@PutMapping("/submit/{id}")
	 public Test_Attempt submittest(@PathVariable Long id) {
		
		 Test_Attempt atempt = attemptsr.startTest(new Test_Attempt());
		
		 atempt.setStatus("submited");
		 
		 return  atempt;
		 
	}
	
}
