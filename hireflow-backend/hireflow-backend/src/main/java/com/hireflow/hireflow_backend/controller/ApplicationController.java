package com.hireflow.hireflow_backend.controller;

import com.hireflow.hireflow_backend.entity.Application;
import com.hireflow.hireflow_backend.service.ApplicationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/applications")
@CrossOrigin(origins = "*")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    // GET /applications — list all applications
    @GetMapping
    public ResponseEntity<List<Application>> getAllApplications() {
        return ResponseEntity.ok(applicationService.getAllApplications());
    }

    // GET /applications/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Application> getApplicationById(@PathVariable Long id) {
        return ResponseEntity.ok(applicationService.getApplicationById(id));
    }

    // GET /applications/job/{jobId} — applications for a specific job
    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<Application>> getApplicationsByJob(@PathVariable Long jobId) {
        return ResponseEntity.ok(applicationService.getApplicationsByJob(jobId));
    }

    // POST /applications?jobId={jobId} — create an application linked to a job
    @PostMapping
    public ResponseEntity<Application> createApplication(
            @RequestBody Application application,
            @RequestParam Long jobId) {
        Application created = applicationService.createApplication(application, jobId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // PATCH /applications/{id}/stage — update application stage
    @PatchMapping("/{id}/stage")
    public ResponseEntity<Application> updateStage(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        Application.ApplicationStage stage =
                Application.ApplicationStage.valueOf(body.get("stage").toUpperCase());
        return ResponseEntity.ok(applicationService.updateStage(id, stage));
    }

    // DELETE /applications/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplication(@PathVariable Long id) {
        applicationService.deleteApplication(id);
        return ResponseEntity.noContent().build();
    }
}
