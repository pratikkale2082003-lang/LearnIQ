package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.Score;
import com.example.demo.service.ScoreService;

@RestController

@RequestMapping("/api/score")
@CrossOrigin(origins = "http://localhost:5000")
public class ScoreController {

	@Autowired
	 private ScoreService scoresr;
	
//	Get Score By Id 
	@GetMapping("/{id}")
	 public Score getScore(@PathVariable Long id) {
		
		 return scoresr.getScoreById(id);
	                
	}
}
