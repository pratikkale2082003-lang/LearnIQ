package com.example.demo.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "test_attempt")
public class Test_Attempt {
	
	    @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    private Long attemptId;

	    private String status;
	    
	    private LocalDateTime attemptdate;

	    @ManyToOne
	    @JoinColumn(name = "user_id")
	    private User user;

	    @ManyToOne
	    @JoinColumn(name = "test?_id")
	    private Test test;

	    @OneToOne(mappedBy = "attempt", cascade = CascadeType.ALL)
	    private Score score;

		public Long getAttemptId() {
			return attemptId;
		}

		public void setAttemptId(Long attemptId) {
			this.attemptId = attemptId;
		}

		public String getStatus() {
			return status;
		}

		public void setStatus(String status) {
			this.status = status;
		}

		public LocalDateTime getAttemptdate() {
			return attemptdate;
		}

		public void setAttemptdate(LocalDateTime attemptdate) {
			this.attemptdate = attemptdate;
		}

		public User getUser() {
			return user;
		}

		public void setUser(User user) {
			this.user = user;
		}

		public Test getTest() {
			return test;
		}

		public void setTest(Test test) {
			this.test = test;
		}

		public Score getScore() {
			return score;
		}

		public void setScore(Score score) {
			this.score = score;
		}
	    
	    
}
