package com.hireflow.hireflow_backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "jobs", indexes = {
    @Index(name = "idx_status", columnList = "status"),
    @Index(name = "idx_company", columnList = "company")
})
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Job title is required")
    @Size(min = 3, max = 200, message = "Job title must be between 3 and 200 characters")
    @Column(nullable = false, length = 200)
    private String title;

    @NotBlank(message = "Company name is required")
    @Size(min = 2, max = 200, message = "Company name must be between 2 and 200 characters")
    @Column(nullable = false, length = 200)
    private String company;

    @Size(max = 200, message = "Location must not exceed 200 characters")
    @Column(length = 200)
    private String location;

    @NotNull(message = "Job status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private JobStatus status;

    @Min(value = 0, message = "Applicants count cannot be negative")
    @Column(nullable = false)
    private Integer applicants = 0;

    public enum JobStatus {
        OPEN,
        CLOSED,
        DRAFT,
        PAUSED
    }

    public Job() {}

    public Job(Long id, String title, String company, String location, JobStatus status, Integer applicants) {
        this.id = id;
        this.title = title;
        this.company = company;
        this.location = location;
        this.status = status;
        this.applicants = applicants;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public JobStatus getStatus() { return status; }
    public void setStatus(JobStatus status) { this.status = status; }

    public Integer getApplicants() { return applicants; }
    public void setApplicants(Integer applicants) { this.applicants = applicants; }
}
