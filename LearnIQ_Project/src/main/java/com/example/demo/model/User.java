package com.example.demo.model;

import java.time.LocalDateTime;
import java.util.List;


import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "usermodel")
public class User {

	
	public enum Role {
	  admin,
	  student
	}
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
	 private Long userid;
	 
	  private String  firstname;
	  private String lastname;
	  
	  private String email;
	  private String password;
	  
	  private LocalDateTime createdAt;
	  
	  
	  @Enumerated(EnumType.STRING)
	    private Role role;
	
	    @OneToMany(mappedBy = "createdBy")
	    private List<Test> createdTests;

	    @OneToMany(mappedBy = "user")
	    private List<Test_Attempt> attempts;

		public Long getUserid() {
			return userid;
		}

		public void setUserid(Long userid) {
			this.userid = userid;
		}

		public String getFirstname() {
			return firstname;
		}

		public void setFirstname(String firstname) {
			this.firstname = firstname;
		}

		public String getLastname() {
			return lastname;
		}

		public void setLastname(String lastname) {
			this.lastname = lastname;
		}

		public String getEmail() {
			return email;
		}

		public void setEmail(String email) {
			this.email = email;
		}

		public String getPassword() {
			return password;
		}

		public void setPassword(String password) {
			this.password = password;
		}

		public LocalDateTime getCreatedAt() {
			return createdAt;
		}

		public void setCreatedAt(LocalDateTime createdAt) {
			this.createdAt = createdAt;
		}

		public Role getRole() {
			return role;
		}

		public void setRole(Role role) {
			this.role = role;
		}

		public List<Test> getCreatedTests() {
			return createdTests;
		}

		public void setCreatedTests(List<Test> createdTests) {
			this.createdTests = createdTests;
		}

		public List<Test_Attempt> getAttempts() {
			return attempts;
		}

		public void setAttempts(List<Test_Attempt> attempts) {
			this.attempts = attempts;
		}

	    
	    
}
