package com.zosh.repository;

import com.zosh.modal.ReconciliationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReconciliationLogRepository extends JpaRepository<ReconciliationLog, Long> {
    List<ReconciliationLog> findByEntityTypeAndEntityId(String entityType, Long entityId);
    List<ReconciliationLog> findByIsMatchFalse(); // Find discrepancies
}
