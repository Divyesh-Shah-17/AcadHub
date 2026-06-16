package com.academic.projectmanager.repository;

import com.academic.projectmanager.entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TeacherRepository extends JpaRepository<Teacher, Long> {
    Optional<Teacher> findByUserUsername(String username);
    List<Teacher> findByAcademicYearId(Long academicYearId);
}
