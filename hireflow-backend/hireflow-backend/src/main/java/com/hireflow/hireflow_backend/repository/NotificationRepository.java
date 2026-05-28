package com.hireflow.hireflow_backend.repository;

import com.hireflow.hireflow_backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByTimestampDesc(Long userId);
    List<Notification> findByUserIdAndReadOrderByTimestampDesc(Long userId, boolean read);
}
