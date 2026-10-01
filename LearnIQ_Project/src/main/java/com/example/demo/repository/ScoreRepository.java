package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.Score;

public interface  ScoreRepository  extends JpaRepository<Score,Long>{

}
