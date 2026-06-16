package com.academic.projectmanager.repository;

import com.academic.projectmanager.entity.ProjectComment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectCommentRepository extends JpaRepository<ProjectComment, Long> {
}
