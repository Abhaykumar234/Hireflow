package com.hireflow.hireflow_backend.service;

import com.hireflow.hireflow_backend.entity.Application;
import com.hireflow.hireflow_backend.entity.Job;
import com.hireflow.hireflow_backend.repository.ApplicationRepository;
import com.hireflow.hireflow_backend.repository.JobRepository;
import com.hireflow.hireflow_backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public ApplicationService(ApplicationRepository applicationRepository, JobRepository jobRepository,
                              NotificationService notificationService, UserRepository userRepository) {
        this.applicationRepository = applicationRepository;
        this.jobRepository = jobRepository;
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    public List<Application> getAllApplications() {
        return applicationRepository.findAll();
    }

    public Application getApplicationById(Long id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found with id: " + id));
    }

    public Application createApplication(Application application, Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + jobId));
        application.setJob(job);
        if (application.getStage() == null) {
            application.setStage(Application.ApplicationStage.APPLIED);
        }
        // Increment applicant count on the job
        job.setApplicants(job.getApplicants() + 1);
        jobRepository.save(job);
        Application saved = applicationRepository.save(application);

        // Notify recruiters and admins
        try {
            userRepository.findAll().forEach(u -> {
                if (u.isApplicationAlertsEnabled()) {
                    notificationService.createNotification(u.getId(), 
                        "New application from " + saved.getCandidateName() + " for " + job.getTitle());
                }
            });
        } catch (Exception e) {
            // Ignore notification failure
        }

        return saved;
    }

    public List<Application> getApplicationsByJob(Long jobId) {
        return applicationRepository.findByJobId(jobId);
    }

    public Application updateStage(Long id, Application.ApplicationStage stage) {
        Application app = getApplicationById(id);
        Application.ApplicationStage oldStage = app.getStage();
        app.setStage(stage);
        Application saved = applicationRepository.save(app);

        // Notify recruiters and admins of stage change
        try {
            userRepository.findAll().forEach(u -> {
                if (u.isApplicationAlertsEnabled()) {
                    notificationService.createNotification(u.getId(), 
                        saved.getCandidateName() + " was moved from " + oldStage + " to " + stage + " for " + saved.getJob().getTitle());
                }
            });
        } catch (Exception e) {
            // Ignore notification failure
        }

        return saved;
    }

    public void deleteApplication(Long id) {
        applicationRepository.deleteById(id);
    }
}
