package com.hireflow.hireflow_backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "applications", indexes = {
    @Index(name = "idx_stage", columnList = "stage"),
    @Index(name = "idx_email", columnList = "email"),
    @Index(name = "idx_job_id", columnList = "job_id")
})
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Candidate name is required")
    @Size(min = 2, max = 100, message = "Candidate name must be between 2 and 100 characters")
    @Column(nullable = false, length = 100)
    private String candidateName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    @Column(nullable = false, length = 255)
    private String email;

    @NotNull(message = "Application stage is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ApplicationStage stage;

    @Size(max = 500, message = "Resume link must not exceed 500 characters")
    @Column(length = 500)
    private String resumeLink;

    // EAGER so serialization works without open session
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "job_id", nullable = false)
    @NotNull(message = "Job is required")
    private Job job;

    public enum ApplicationStage {
        APPLIED, SCREENING, INTERVIEW, OFFER, HIRED, REJECTED
    }

    public Application() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getCandidateName() { return candidateName; }
    public void setCandidateName(String candidateName) { this.candidateName = candidateName; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public ApplicationStage getStage() { return stage; }
    public void setStage(ApplicationStage stage) { this.stage = stage; }
    
    public String getResumeLink() { return resumeLink; }
    public void setResumeLink(String resumeLink) { this.resumeLink = resumeLink; }
    
    public Job getJob() { return job; }
    public void setJob(Job job) { this.job = job; }
}
