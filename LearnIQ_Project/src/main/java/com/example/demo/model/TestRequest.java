package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "test_requests")
public class TestRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "test_id")
    private Test test;

    private Long studentId;
    private boolean approved = false;

    // getters & setters
    public Long getId() { return id; }

    public Test getTest() { return test; }
    public void setTest(Test test) { this.test = test; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public boolean isApproved() { return approved; }
    public void setApproved(boolean approved) { this.approved = approved; }
}