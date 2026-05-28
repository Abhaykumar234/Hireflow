package com.hireflow.hireflow_backend.service;

import com.hireflow.hireflow_backend.entity.Job;
import com.hireflow.hireflow_backend.repository.JobRepository;
import com.hireflow.hireflow_backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JobService {

    private final JobRepository jobRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public JobService(JobRepository jobRepository, NotificationService notificationService, UserRepository userRepository) {
        this.jobRepository = jobRepository;
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    public Job getJobById(Long id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + id));
    }

    public Job createJob(Job job) {
        if (job.getApplicants() == null) {
            job.setApplicants(0);
        }
        if (job.getStatus() == null) {
            job.setStatus(Job.JobStatus.OPEN);
        }
        Job saved = jobRepository.save(job);

        // Notify recruiters and admins with application alerts enabled
        try {
            userRepository.findAll().forEach(u -> {
                if (u.isApplicationAlertsEnabled()) {
                    notificationService.createNotification(u.getId(), 
                        "New job posted: " + saved.getTitle() + " at " + saved.getCompany());
                }
            });
        } catch (Exception e) {
            // Ignore notification failure to prevent failing job creation
        }

        return saved;
    }

    public Job updateJob(Long id, Job updatedJob) {
        Job existing = getJobById(id);
        existing.setTitle(updatedJob.getTitle());
        existing.setCompany(updatedJob.getCompany());
        existing.setLocation(updatedJob.getLocation());
        existing.setStatus(updatedJob.getStatus());
        existing.setApplicants(updatedJob.getApplicants());
        return jobRepository.save(existing);
    }

    public void deleteJob(Long id) {
        jobRepository.deleteById(id);
    }
}
