package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "score")
public class Score {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long scoreId;

    private Integer totalscore;
    private String result;

    @OneToOne
    @JoinColumn(name = "attempt_id")
    private Test_Attempt attempt;


	public Long getScoreId() {
		return scoreId;
	}

	public void setScoreId(Long scoreId) {
		this.scoreId = scoreId;
	}

	public Integer getTotalscore() {
		return totalscore;
	}

	public void setTotalscore(Integer totalscore) {
		this.totalscore = totalscore;
	}

	public String getResult() {
		return result;
	}

	public void setResult(String result) {
		this.result = result;
	}

	public Test_Attempt getAttempt() {
		return attempt;
	}

	public void setAttempt(Test_Attempt attempt) {
		this.attempt = attempt;
	}

	
    
    
}
