package com.example.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.Score;
import com.example.demo.repository.ScoreRepository;

@Service
public class ScoreService {

    @Autowired
    private ScoreRepository scoreRepo;

    // ✅ SAVE SCORE
    public Score saveScore(Score score) {
        return scoreRepo.save(score);
    }

    // ✅ GET ALL SCORES
    public List<Score> getAllScores() {
        return scoreRepo.findAll();
    }

    // ✅ GET SCORE BY ID
    public Score getScoreById(Long id) {
        return scoreRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Score not found"));
    }
}
