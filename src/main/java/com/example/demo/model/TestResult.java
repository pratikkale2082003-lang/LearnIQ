package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "test_results")
public class TestResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long studentId;
    private String studentEmail;
    private Long testId;
    private Integer score;
    private Integer totalMarks;
    private String status;
    private Integer totalQuestions;
    private Integer answered;
    private Integer unanswered;
    private LocalDateTime submittedAt;

    // Question-wise review (JSON string)
    @Column(columnDefinition = "TEXT")
    private String details;

    // Soft delete: true = hidden from the admin list only.
    // The student still sees the result in "My Results".
    // Boolean (wrapper) so that old rows with NULL do not break.
    private Boolean deletedByAdmin = false;

    @PrePersist
    public void onCreate() {
        this.submittedAt = LocalDateTime.now();
        if (this.deletedByAdmin == null) this.deletedByAdmin = false;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public String getStudentEmail() { return studentEmail; }
    public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }
    public Long getTestId() { return testId; }
    public void setTestId(Long testId) { this.testId = testId; }
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
    public Integer getTotalMarks() { return totalMarks; }
    public void setTotalMarks(Integer totalMarks) { this.totalMarks = totalMarks; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Integer getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(Integer totalQuestions) { this.totalQuestions = totalQuestions; }
    public Integer getAnswered() { return answered; }
    public void setAnswered(Integer answered) { this.answered = answered; }
    public Integer getUnanswered() { return unanswered; }
    public void setUnanswered(Integer unanswered) { this.unanswered = unanswered; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
    public Boolean getDeletedByAdmin() { return deletedByAdmin; }
    public void setDeletedByAdmin(Boolean deletedByAdmin) { this.deletedByAdmin = deletedByAdmin; }
}