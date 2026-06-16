package com.academic.projectmanager.controller;

import com.academic.projectmanager.entity.*;
import com.academic.projectmanager.service.TeacherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/teacher")
public class TeacherController {

    @Autowired
    private TeacherService teacherService;

    @PostMapping("/groups/generate")
    public ResponseEntity<Map<String, String>> generateGroups(
            @RequestParam("academicYearId") Long academicYearId,
            @RequestParam("targetCapacity") int targetCapacity) {
        try {
            teacherService.generateRandomGroups(academicYearId, targetCapacity);
            return ResponseEntity.ok(Map.of("message", "Groups generated randomly"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/groups/import")
    public ResponseEntity<Map<String, String>> importGroups(
            @RequestParam("file") MultipartFile file,
            @RequestParam("academicYearId") Long academicYearId) {
        try {
            teacherService.importGroupsCsv(file.getInputStream(), academicYearId);
            return ResponseEntity.ok(Map.of("message", "Groups imported successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/groups")
    public ResponseEntity<List<Group>> getMyGroups(Principal principal) {
        return ResponseEntity.ok(teacherService.getTeacherGroups(principal.getName()));
    }

    @GetMapping("/ideas")
    public ResponseEntity<List<ProjectIdea>> getSubmissions(Principal principal) {
        return ResponseEntity.ok(teacherService.getSubmissionsForTeacher(principal.getName()));
    }

    @PostMapping("/ideas/{id}/status")
    public ResponseEntity<Map<String, String>> updateIdeaStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Principal principal) {
        try {
            IdeaStatus status = IdeaStatus.valueOf(body.get("status"));
            teacherService.updateIdeaStatus(id, status, principal.getName());
            return ResponseEntity.ok(Map.of("message", "Idea status updated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
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

    @GetMapping("/progress")
    public ResponseEntity<List<WeeklyProgress>> getWeeklyProgress(Principal principal) {
        return ResponseEntity.ok(teacherService.getWeeklyProgressForTeacherGroups(principal.getName()));
    }

    @PostMapping("/progress/{id}/score")
    public ResponseEntity<Map<String, String>> scoreProgress(
            @PathVariable Long id,
            @RequestBody Map<String, Double> body,
            Principal principal) {
        try {
            Double score = body.get("score");
            teacherService.scoreWeeklyProgress(id, score, principal.getName());
            return ResponseEntity.ok(Map.of("message", "Progress scored successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
