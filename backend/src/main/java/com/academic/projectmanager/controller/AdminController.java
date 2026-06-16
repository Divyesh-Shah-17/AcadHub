package com.academic.projectmanager.controller;

import com.academic.projectmanager.entity.AcademicYear;
import com.academic.projectmanager.entity.Group;
import com.academic.projectmanager.entity.TeacherReview;
import com.academic.projectmanager.repository.GroupRepository;
import com.academic.projectmanager.service.AdminService;
import com.academic.projectmanager.service.TeacherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private TeacherService teacherService;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private com.academic.projectmanager.repository.WeeklyProgressRepository weeklyProgressRepository;

    @PostMapping("/import/students")
    public ResponseEntity<Map<String, String>> importStudents(@RequestParam("file") MultipartFile file) {
        try {
            adminService.importStudentsCsv(file.getInputStream());
            return ResponseEntity.ok(Map.of("message", "Students imported successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/import/teachers")
    public ResponseEntity<Map<String, String>> importTeachers(@RequestParam("file") MultipartFile file) {
        try {
            adminService.importTeachersCsv(file.getInputStream());
            return ResponseEntity.ok(Map.of("message", "Teachers imported successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/years")
    public ResponseEntity<List<AcademicYear>> getAllYears() {
        return ResponseEntity.ok(adminService.getAllAcademicYears());
    }

    @PostMapping("/years")
    public ResponseEntity<AcademicYear> createYear(@RequestBody Map<String, String> body) {
        String yearVal = body.get("year");
        return ResponseEntity.ok(adminService.createAcademicYear(yearVal));
    }

    @PostMapping("/years/{id}/active")
    public ResponseEntity<Map<String, String>> setActiveYear(@PathVariable Long id) {
        adminService.setActiveAcademicYear(id);
        return ResponseEntity.ok(Map.of("message", "Active academic year updated"));
    }

    @GetMapping("/config/grades-published")
    public ResponseEntity<Map<String, Boolean>> getGradesPublished() {
        return ResponseEntity.ok(Map.of("isPublished", adminService.isGradesPublished()));
    }

    @PostMapping("/config/grades-published")
    public ResponseEntity<Map<String, Boolean>> setGradesPublished(@RequestBody Map<String, Boolean> body) {
        boolean val = body.get("isPublished");
        adminService.setGradesPublished(val);
        return ResponseEntity.ok(Map.of("isPublished", val));
    }

    @GetMapping("/teacher-reviews")
    public ResponseEntity<List<TeacherReview>> getTeacherReviews(@RequestParam("academicYearId") Long academicYearId) {
        return ResponseEntity.ok(adminService.getTeacherReviews(academicYearId));
    }

    @PostMapping("/assign-teachers")
    public ResponseEntity<Map<String, String>> assignTeachers(@RequestBody Map<String, Object> body) {
        Long groupId = Long.valueOf(body.get("groupId").toString());
        String primaryUsername = (String) body.get("primaryUsername");
        String secondaryUsername = (String) body.get("secondaryUsername");
        teacherService.assignTeachersToGroup(groupId, primaryUsername, secondaryUsername);
        return ResponseEntity.ok(Map.of("message", "Teachers assigned successfully"));
    }

    @PostMapping("/import/teacher-allocations")
    public ResponseEntity<Map<String, String>> importTeacherAllocations(
            @RequestParam("file") MultipartFile file,
            @RequestParam("academicYearId") Long academicYearId) {
        try {
            teacherService.importTeacherAllocationsCsv(file.getInputStream(), academicYearId);
            return ResponseEntity.ok(Map.of("message", "Teacher allocations imported successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/groups")
    public ResponseEntity<List<Group>> getGroups(@RequestParam("academicYearId") Long academicYearId) {
        return ResponseEntity.ok(groupRepository.findByAcademicYearId(academicYearId));
    }

    @PostMapping("/groups/auto-allocate-teachers")
    public ResponseEntity<Map<String, String>> autoAllocateTeachers(@RequestParam("academicYearId") Long academicYearId) {
        try {
            adminService.autoAllocateTeachersRandomly(academicYearId);
            return ResponseEntity.ok(Map.of("message", "Teachers auto-allocated randomly to all groups"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/students")
    public ResponseEntity<List<com.academic.projectmanager.entity.Student>> getStudents(@RequestParam("academicYearId") Long academicYearId) {
        return ResponseEntity.ok(adminService.getStudentsByYear(academicYearId));
    }

    @GetMapping("/teachers")
    public ResponseEntity<List<com.academic.projectmanager.entity.Teacher>> getTeachers(@RequestParam("academicYearId") Long academicYearId) {
        return ResponseEntity.ok(adminService.getTeachersByYear(academicYearId));
    }

    @PostMapping("/groups/allocate-students")
    public ResponseEntity<Map<String, String>> allocateStudents(
            @RequestParam("academicYearId") Long academicYearId,
            @RequestParam("capacity") int K) {
        try {
            adminService.allocateStudentsRandomly(academicYearId, K);
            return ResponseEntity.ok(Map.of("message", "Students randomly grouped successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/groups/balanced-teachers")
    public ResponseEntity<Map<String, String>> balancedTeachers(@RequestParam("academicYearId") Long academicYearId) {
        try {
            adminService.balancedTeacherAllocation(academicYearId);
            return ResponseEntity.ok(Map.of("message", "Teachers allocated in a balanced manner"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/students/{id}/group")
    public ResponseEntity<Map<String, String>> updateStudentGroup(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        try {
            Long groupId = body.get("groupId") != null ? Long.valueOf(body.get("groupId").toString()) : null;
            adminService.updateStudentGroup(id, groupId);
            return ResponseEntity.ok(Map.of("message", "Student group updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/groups/{id}/teachers")
    public ResponseEntity<Map<String, String>> updateGroupTeachers(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        try {
            String primaryUsername = body.get("primaryUsername");
            String secondaryUsername = body.get("secondaryUsername");
            adminService.updateGroupTeachers(id, primaryUsername, secondaryUsername);
            return ResponseEntity.ok(Map.of("message", "Group teachers updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/progress/{id}/override")
    public ResponseEntity<Map<String, String>> overrideProgress(
            @PathVariable Long id,
            @RequestBody Map<String, Double> body) {
        try {
            Double primaryScore = body.get("primaryScore");
            Double secondaryScore = body.get("secondaryScore");
            adminService.overrideWeeklyProgressScores(id, primaryScore, secondaryScore);
            return ResponseEntity.ok(Map.of("message", "Weekly grades overridden successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/export/students")
    public void exportStudents(@RequestParam("academicYearId") Long academicYearId, javax.servlet.http.HttpServletResponse response) throws Exception {
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"students.csv\"");
        adminService.writeStudentsCsv(response.getWriter(), academicYearId);
    }

    @GetMapping("/export/teachers")
    public void exportTeachers(@RequestParam("academicYearId") Long academicYearId, javax.servlet.http.HttpServletResponse response) throws Exception {
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"teachers.csv\"");
        adminService.writeTeachersCsv(response.getWriter(), academicYearId);
    }

    @GetMapping("/export/groups")
    public void exportGroups(@RequestParam("academicYearId") Long academicYearId, javax.servlet.http.HttpServletResponse response) throws Exception {
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"groups.csv\"");
        adminService.writeGroupsCsv(response.getWriter(), academicYearId);
    }

    @GetMapping("/export/grades")
    public void exportGrades(@RequestParam("academicYearId") Long academicYearId, javax.servlet.http.HttpServletResponse response) throws Exception {
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"grades.csv\"");
        adminService.writeGradingMatrixCsv(response.getWriter(), academicYearId);
    }

    @GetMapping("/analysis/ledger")
    public ResponseEntity<List<Map<String, Object>>> getLedger(@RequestParam("academicYearId") Long academicYearId) {
        List<com.academic.projectmanager.entity.Student> students = adminService.getStudentsByYear(academicYearId);
        List<Map<String, Object>> result = new java.util.ArrayList<>();
        for (com.academic.projectmanager.entity.Student s : students) {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("studentName", s.getUser().getFullName());
            map.put("studentId", s.getId());
            map.put("groupName", s.getGroup() != null ? s.getGroup().getName() : "Unassigned");
            map.put("groupId", s.getGroup() != null ? s.getGroup().getId() : null);
            
            List<com.academic.projectmanager.entity.WeeklyProgress> progressList = weeklyProgressRepository.findByStudentId(s.getId());
            List<String> scores = new java.util.ArrayList<>();
            for (com.academic.projectmanager.entity.WeeklyProgress wp : progressList) {
                double sum = 0.0;
                int count = 0;
                if (wp.getPrimaryTeacherScore() != null) {
                    sum += wp.getPrimaryTeacherScore();
                    count++;
                }
                if (wp.getSecondaryTeacherScore() != null) {
                    sum += wp.getSecondaryTeacherScore();
                    count++;
                }
                double avg = count > 0 ? sum / count : 0.0;
                scores.add("W" + wp.getWeekNumber() + ": " + String.format("%.1f", avg));
            }
            map.put("weeklyScores", String.join(", ", scores));
            map.put("consolidatedScore", adminService.calculateConsolidatedScore(s.getId()));
            result.add(map);
        }
        return ResponseEntity.ok(result);
    }
}
