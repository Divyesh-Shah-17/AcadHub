package com.academic.projectmanager.repository;

import com.academic.projectmanager.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface GroupRepository extends JpaRepository<Group, Long> {
    List<Group> findByAcademicYearId(Long academicYearId);
    Optional<Group> findByNameAndAcademicYearId(String name, Long academicYearId);
}
