package com.example.demo.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.Options;
import com.example.demo.model.Question;
import com.example.demo.repository.OptionRepository;
import com.example.demo.repository.QuestionRepository;

@Service
public class QuestionService {

    @Autowired
    private QuestionRepository questionRepo;

    @Autowired
    private OptionRepository optionRepo;

    // ✅ Add Question
    public Question addQuestion(Question question) {

        if (question.getOptions() != null) {
            question.getOptions().forEach(option -> {
                option.setQuestion(question);
            });
        }

        
        
        
        return questionRepo.save(question);
    }

    // ✅ Get Questions By Test
    public List<Question> getQuestionsByTest(Long testid) {
    	return questionRepo.findByTest_Testid(testid);
    }

    // ✅ Submit Test
    public Map<String, Object> submitTest(Map<String, Object> request) {

        Map<String, Integer> answers = (Map<String, Integer>) request.get("answers");

        int score = 0;

        for (String questionId : answers.keySet()) {

            Long optionId = Long.valueOf(answers.get(questionId));
            Options option = optionRepo.findById(optionId).orElse(null);

            if (option != null && option.getIsCorrect()) {
                score += option.getQuestion().getMarks();
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("score", score);
        result.put("status", score >= 20 ? "PASS" : "FAIL");

        return result;
    }
    
    public List<Question> addAll(List<Question> questions) {
        return questionRepo.saveAll(questions);
    }

}
