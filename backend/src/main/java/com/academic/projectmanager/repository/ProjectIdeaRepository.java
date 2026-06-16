package com.academic.projectmanager.repository;

import com.academic.projectmanager.entity.ProjectIdea;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProjectIdeaRepository extends JpaRepository<ProjectIdea, Long> {
    List<ProjectIdea> findByGroupId(Long groupId);
}
