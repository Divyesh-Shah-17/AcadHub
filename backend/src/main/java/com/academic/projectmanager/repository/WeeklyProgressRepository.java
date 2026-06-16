package com.academic.projectmanager.repository;

import com.academic.projectmanager.entity.WeeklyProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WeeklyProgressRepository extends JpaRepository<WeeklyProgress, Long> {
    List<WeeklyProgress> findByGroupId(Long groupId);
    List<WeeklyProgress> findByStudentId(Long studentId);
}
