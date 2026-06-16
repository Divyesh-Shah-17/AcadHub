package com.academic.projectmanager.controller;

import com.academic.projectmanager.entity.*;
import com.academic.projectmanager.repository.TeacherRepository;
import com.academic.projectmanager.service.StudentService;
import com.academic.projectmanager.service.TeacherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/student")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @Autowired
    private TeacherService teacherService;

    @Autowired
    private TeacherRepository teacherRepository;

    @GetMapping("/profile")
    public ResponseEntity<Student> getProfile(Principal principal) {
        return ResponseEntity.ok(studentService.getStudentProfile(principal.getName()));
    }

    @PostMapping("/ideas")
    public ResponseEntity<ProjectIdea> submitIdea(@RequestBody Map<String, String> body, Principal principal) {
        String title = body.get("title");
        String description = body.get("description");
        ProjectIdea idea = studentService.submitProjectIdea(title, description, principal.getName());
        return ResponseEntity.ok(idea);
    }

    @GetMapping("/ideas")
    public ResponseEntity<List<ProjectIdea>> getIdeas(Principal principal) {
        return ResponseEntity.ok(studentService.getGroupProjectIdeas(principal.getName()));
    }

    @PostMapping("/ideas/{id}/comment")
    public ResponseEntity<ProjectComment> addComment(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Principal principal) {
        String commentText = body.get("commentText");
        ProjectComment comment = teacherService.addCommentToIdea(id, commentText, principal.getName());
        return ResponseEntity.ok(comment);
    }

    @PostMapping("/progress")
    public ResponseEntity<WeeklyProgress> submitProgress(@RequestBody Map<String, Object> body, Principal principal) {
        int weekNumber = Integer.parseInt(body.get("weekNumber").toString());
        String summary = (String) body.get("summary");
        String links = (String) body.get("links");
        WeeklyProgress wp = studentService.submitWeeklyProgress(weekNumber, summary, links, principal.getName());
        return ResponseEntity.ok(wp);
    }

    @GetMapping("/progress")
    public ResponseEntity<List<WeeklyProgress>> getProgress(Principal principal) {
        return ResponseEntity.ok(studentService.getWeeklyProgressForStudent(principal.getName()));
    }

    @PostMapping("/reviews")
    public ResponseEntity<Map<String, String>> submitReview(@RequestBody Map<String, Object> body, Principal principal) {
        try {
            Long teacherId = Long.valueOf(body.get("teacherId").toString());
            int rating = Integer.parseInt(body.get("rating").toString());
            String feedbackText = (String) body.get("feedbackText");
            studentService.submitTeacherReview(teacherId, rating, feedbackText, principal.getName());
            return ResponseEntity.ok(Map.of("message", "Review submitted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/teachers")
    public ResponseEntity<List<Teacher>> getTeachers(Principal principal) {
        Student s = studentService.getStudentProfile(principal.getName());
        return ResponseEntity.ok(teacherRepository.findByAcademicYearId(s.getAcademicYear().getId()));
    }
}
