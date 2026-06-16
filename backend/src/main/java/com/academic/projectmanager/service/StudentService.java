package com.academic.projectmanager.service;

import com.academic.projectmanager.entity.*;
import com.academic.projectmanager.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ProjectIdeaRepository projectIdeaRepository;

    @Autowired
    private WeeklyProgressRepository weeklyProgressRepository;

    @Autowired
    private TeacherReviewRepository teacherReviewRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private SystemConfigRepository systemConfigRepository;

    public Student getStudentProfile(String username) {
        return studentRepository.findByUserUsername(username).orElseThrow();
    }

    public ProjectIdea submitProjectIdea(String title, String description, String studentUsername) {
        Student student = studentRepository.findByUserUsername(studentUsername).orElseThrow();
        if (student.getGroup() == null) {
            throw new IllegalStateException("Student is not assigned to any group");
        }

        ProjectIdea idea = new ProjectIdea();
        idea.setTitle(title);
        idea.setDescription(description);
        idea.setGroup(student.getGroup());
        idea.setSubmittedBy(student);
        idea.setStatus(IdeaStatus.PENDING);
        return projectIdeaRepository.save(idea);
    }

    public List<ProjectIdea> getGroupProjectIdeas(String studentUsername) {
        Student student = studentRepository.findByUserUsername(studentUsername).orElseThrow();
        if (student.getGroup() == null) {
            return List.of();
        }
        return projectIdeaRepository.findByGroupId(student.getGroup().getId());
    }

    public WeeklyProgress submitWeeklyProgress(int weekNumber, String summary, String links, String studentUsername) {
        Student student = studentRepository.findByUserUsername(studentUsername).orElseThrow();
        if (student.getGroup() == null) {
            throw new IllegalStateException("Student is not assigned to any group");
        }

        WeeklyProgress progress = new WeeklyProgress();
        progress.setGroup(student.getGroup());
        progress.setStudent(student);
        progress.setWeekNumber(weekNumber);
        progress.setSummary(summary);
        progress.setLinks(links);
        progress.setSubmittedAt(LocalDateTime.now());
        return weeklyProgressRepository.save(progress);
    }

    public List<WeeklyProgress> getWeeklyProgressForStudent(String studentUsername) {
        Student student = studentRepository.findByUserUsername(studentUsername).orElseThrow();
        if (student.getGroup() == null) {
            return List.of();
        }

        List<WeeklyProgress> progressList = weeklyProgressRepository.findByGroupId(student.getGroup().getId());
        Optional<SystemConfig> config = systemConfigRepository.findById("is_published");
        boolean isPublished = config.isPresent() && config.get().getConfigValue().equalsIgnoreCase("true");

        if (!isPublished) {
            for (WeeklyProgress wp : progressList) {
                wp.setPrimaryTeacherScore(null);
                wp.setSecondaryTeacherScore(null);
            }
        }

        return progressList;
    }

    public void submitTeacherReview(Long teacherId, int rating, String feedbackText, String studentUsername) {
        Student student = studentRepository.findByUserUsername(studentUsername).orElseThrow();
        Teacher teacher = teacherRepository.findById(teacherId).orElseThrow();

        TeacherReview review = new TeacherReview();
        review.setTeacher(teacher);
        review.setAcademicYear(student.getAcademicYear());
        review.setRating(rating);
        review.setFeedbackText(feedbackText);
        teacherReviewRepository.save(review);
    }
}
