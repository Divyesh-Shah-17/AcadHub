package com.academic.projectmanager.repository;

import com.academic.projectmanager.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUserUsername(String username);
    List<Student> findByAcademicYearId(Long academicYearId);
    List<Student> findByGroupId(Long groupId);
    List<Student> findByAcademicYearIdAndGroupIsNull(Long academicYearId);
}
