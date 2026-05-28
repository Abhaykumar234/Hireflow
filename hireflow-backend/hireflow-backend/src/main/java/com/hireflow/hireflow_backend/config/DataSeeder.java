package com.hireflow.hireflow_backend.config;

import com.hireflow.hireflow_backend.entity.*;
import com.hireflow.hireflow_backend.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seed(UserRepository users, JobRepository jobs,
                           ApplicationRepository apps, NotificationRepository notifications, PasswordEncoder enc) {
        return args -> {
            if (users.count() > 0) return; // already seeded

            // Create demo users with proper validation-compliant passwords
            User recruiter = new User();
            recruiter.setFullName("Marcus Chen");
            recruiter.setEmail("marcus@hireflow.com");
            recruiter.setPassword(enc.encode("Demo123!"));
            recruiter.setRole(User.Role.RECRUITER);
            recruiter.setEmailNotificationsEnabled(true);
            recruiter.setApplicationAlertsEnabled(true);
            recruiter.setEmailVerified(true);
            recruiter.setAccountLocked(false);
            recruiter.setFailedLoginAttempts(0);
            users.save(recruiter);

            User admin = new User();
            admin.setFullName("Abhay Kumar");
            admin.setEmail("admin@hireflow.com");
            admin.setPassword(enc.encode("Admin123!"));
            admin.setRole(User.Role.ADMIN);
            admin.setEmailNotificationsEnabled(true);
            admin.setApplicationAlertsEnabled(true);
            admin.setEmailVerified(true);
            admin.setAccountLocked(false);
            admin.setFailedLoginAttempts(0);
            users.save(admin);

            User candidate = new User();
            candidate.setFullName("John Doe");
            candidate.setEmail("john@example.com");
            candidate.setPassword(enc.encode("Candidate123!"));
            candidate.setRole(User.Role.CANDIDATE);
            candidate.setEmailNotificationsEnabled(false);
            candidate.setApplicationAlertsEnabled(false);
            candidate.setEmailVerified(true);
            candidate.setAccountLocked(false);
            candidate.setFailedLoginAttempts(0);
            users.save(candidate);

            // Create jobs
            Job j1 = new Job(); 
            j1.setTitle("Senior Backend Engineer"); 
            j1.setCompany("HireFlow Corp"); 
            j1.setLocation("Remote • Full-time"); 
            j1.setStatus(Job.JobStatus.OPEN); 
            j1.setApplicants(0);
            jobs.save(j1);

            Job j2 = new Job(); 
            j2.setTitle("Product Designer"); 
            j2.setCompany("HireFlow Corp"); 
            j2.setLocation("Bangalore, India"); 
            j2.setStatus(Job.JobStatus.OPEN); 
            j2.setApplicants(0);
            jobs.save(j2);

            Job j3 = new Job(); 
            j3.setTitle("Frontend Developer"); 
            j3.setCompany("HireFlow Corp"); 
            j3.setLocation("Remote • Contract"); 
            j3.setStatus(Job.JobStatus.OPEN); 
            j3.setApplicants(0);
            jobs.save(j3);

            Job j4 = new Job(); 
            j4.setTitle("DevOps Engineer"); 
            j4.setCompany("HireFlow Corp"); 
            j4.setLocation("Pune, India"); 
            j4.setStatus(Job.JobStatus.CLOSED); 
            j4.setApplicants(0);
            jobs.save(j4);

            Job j5 = new Job(); 
            j5.setTitle("Data Scientist"); 
            j5.setCompany("HireFlow Corp"); 
            j5.setLocation("San Francisco, CA"); 
            j5.setStatus(Job.JobStatus.OPEN); 
            j5.setApplicants(0);
            jobs.save(j5);

            Job j6 = new Job(); 
            j6.setTitle("Mobile Developer"); 
            j6.setCompany("HireFlow Corp"); 
            j6.setLocation("Remote • Part-time"); 
            j6.setStatus(Job.JobStatus.DRAFT); 
            j6.setApplicants(0);
            jobs.save(j6);

            // Create applications
            String[][] candidates = {
                {"Liam Carter","liam@email.com","INTERVIEW"},
                {"Emma Thompson","emma.t@gmail.com","SCREENING"},
                {"Noah Garcia","noah.g@outlook.com","APPLIED"},
                {"Aria Patel","aria.p@company.io","OFFER"},
                {"James Wilson","jwilson@email.com","HIRED"},
                {"Sofia Rodriguez","sofia.r@dev.net","REJECTED"},
                {"Michael Brown","michael.b@tech.com","APPLIED"},
                {"Olivia Davis","olivia.d@mail.com","SCREENING"},
                {"Ethan Martinez","ethan.m@dev.io","INTERVIEW"},
                {"Isabella Lee","isabella.l@code.com","APPLIED"}
            };
            
            Job[] jobArr = {j1, j2, j3, j1, j3, j2, j5, j1, j2, j3};
            
            for (int i = 0; i < candidates.length; i++) {
                Application a = new Application();
                a.setCandidateName(candidates[i][0]);
                a.setEmail(candidates[i][1]);
                a.setStage(Application.ApplicationStage.valueOf(candidates[i][2]));
                a.setResumeLink("https://example.com/resume/" + (i+1) + ".pdf");
                a.setJob(jobArr[i]);
                apps.save(a);
                
                Job jb = jobArr[i];
                jb.setApplicants(jb.getApplicants() + 1);
                jobs.save(jb);
            }

            // Create sample notifications
            Notification n1 = new Notification(recruiter.getId(), "Welcome to HireFlow! Your recruitment dashboard is ready.");
            Notification n2 = new Notification(recruiter.getId(), "New application from Liam Carter for Senior Backend Engineer");
            Notification n3 = new Notification(recruiter.getId(), "Emma Thompson moved to SCREENING stage");
            Notification n4 = new Notification(admin.getId(), "System update: All services running smoothly");
            Notification n5 = new Notification(admin.getId(), "New job posted: Data Scientist");
            
            notifications.save(n1);
            notifications.save(n2);
            notifications.save(n3);
            notifications.save(n4);
            notifications.save(n5);
        };
    }
}
