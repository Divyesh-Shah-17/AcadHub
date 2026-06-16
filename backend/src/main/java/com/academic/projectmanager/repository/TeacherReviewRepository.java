package com.academic.projectmanager.repository;

import com.academic.projectmanager.entity.TeacherReview;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TeacherReviewRepository extends JpaRepository<TeacherReview, Long> {
    List<TeacherReview> findByAcademicYearId(Long academicYearId);
}
