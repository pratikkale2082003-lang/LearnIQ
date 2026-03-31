package com.example.demo.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.demo.model.Question;
import com.example.demo.service.QuestionService;

@RestController
@RequestMapping("/api/questions")
@CrossOrigin(origins = "http://localhost:5000")
public class QuestionController {

    @Autowired
    private QuestionService questionService;

    // ✅ Add Question
    @PostMapping
    public Question addQuestion(@RequestBody Question question) {
        return questionService.addQuestion(question);
    }
    
    @PostMapping("/bulk")
    public List<Question> addQuestions(@RequestBody List<Question> questions) {
        return questionService.addAll(questions);
    }


    // ✅ Get Questions
    @GetMapping("/test/{id}")
    public List<Question> getQuestions(@PathVariable Long id) {
        return questionService.getQuestionsByTest(id);
    }

    // ✅ Submit Test
    @PostMapping("/submit")
    public Map<String, Object> submitTest(@RequestBody Map<String, Object> request) {
        return questionService.submitTest(request);
    }
}
