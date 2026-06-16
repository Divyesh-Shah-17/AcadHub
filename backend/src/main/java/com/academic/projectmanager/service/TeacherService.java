package com.academic.projectmanager.service;

import com.academic.projectmanager.entity.*;
import com.academic.projectmanager.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional
public class TeacherService {

    @Autowired
    private CsvService csvService;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private AcademicYearRepository academicYearRepository;

    @Autowired
    private ProjectIdeaRepository projectIdeaRepository;

    @Autowired
    private ProjectCommentRepository projectCommentRepository;

    @Autowired
    private WeeklyProgressRepository weeklyProgressRepository;

    @Autowired
    private UserRepository userRepository;

    public void generateRandomGroups(Long academicYearId, int targetCapacity) {
        AcademicYear year = academicYearRepository.findById(academicYearId).orElseThrow();
        List<Student> students = studentRepository.findByAcademicYearIdAndGroupIsNull(academicYearId);
        Collections.shuffle(students);

        int groupCount = groupRepository.findByAcademicYearId(academicYearId).size();
        int index = 0;
        while (index < students.size()) {
            groupCount++;
            Group group = new Group();
            group.setName("Group " + groupCount);
            group.setAcademicYear(year);
            group = groupRepository.save(group);

            int currentGroupSize = 0;
            while (index < students.size() && currentGroupSize < targetCapacity) {
                Student student = students.get(index);
                student.setGroup(group);
                studentRepository.save(student);
                index++;
                currentGroupSize++;
            }
        }
    }

    public void importGroupsCsv(InputStream inputStream, Long academicYearId) throws Exception {
        AcademicYear year = academicYearRepository.findById(academicYearId).orElseThrow();
        List<String[]> lines = csvService.parseCsv(inputStream);
        for (int i = 0; i < lines.size(); i++) {
            String[] row = lines.get(i);
            if (row.length < 2) {
                continue;
            }
            if (i == 0 && row[0].equalsIgnoreCase("groupName")) {
                continue;
            }
            String groupName = row[0].trim();
            String studentUsernamesStr = row[1].trim();

            Group group = groupRepository.findByNameAndAcademicYearId(groupName, academicYearId)
                    .orElseGet(() -> {
                        Group g = new Group();
                        g.setName(groupName);
                        g.setAcademicYear(year);
                        return groupRepository.save(g);
                    });

            String[] usernames = studentUsernamesStr.split("[;,]");
            for (String username : usernames) {
                String u = username.trim();
                Optional<Student> studentOpt = studentRepository.findByUserUsername(u);
                if (studentOpt.isPresent()) {
                    Student s = studentOpt.get();
                    s.setGroup(group);
                    studentRepository.save(s);
                }
            }
        }
    }

    public void assignTeachersToGroup(Long groupId, String primaryUsername, String secondaryUsername) {
        Group group = groupRepository.findById(groupId).orElseThrow();
        if (primaryUsername != null && !primaryUsername.isBlank()) {
            Teacher pt = teacherRepository.findByUserUsername(primaryUsername.trim()).orElseThrow();
            group.setPrimaryTeacher(pt);
        } else {
            group.setPrimaryTeacher(null);
        }
        if (secondaryUsername != null && !secondaryUsername.isBlank()) {
            Teacher st = teacherRepository.findByUserUsername(secondaryUsername.trim()).orElseThrow();
            group.setSecondaryTeacher(st);
        } else {
            group.setSecondaryTeacher(null);
        }
        groupRepository.save(group);
    }

    public void importTeacherAllocationsCsv(InputStream inputStream, Long academicYearId) throws Exception {
        List<String[]> lines = csvService.parseCsv(inputStream);
        for (int i = 0; i < lines.size(); i++) {
            String[] row = lines.get(i);
            if (row.length < 3) {
                continue;
            }
            if (i == 0 && row[0].equalsIgnoreCase("groupName")) {
                continue;
            }
            String groupName = row[0].trim();
            String primaryUsername = row[1].trim();
            String secondaryUsername = row[2].trim();

            Optional<Group> groupOpt = groupRepository.findByNameAndAcademicYearId(groupName, academicYearId);
            if (groupOpt.isPresent()) {
                Group group = groupOpt.get();
                if (!primaryUsername.isEmpty()) {
                    Teacher pt = teacherRepository.findByUserUsername(primaryUsername).orElseThrow();
                    group.setPrimaryTeacher(pt);
                }
                if (!secondaryUsername.isEmpty()) {
                    Teacher st = teacherRepository.findByUserUsername(secondaryUsername).orElseThrow();
                    group.setSecondaryTeacher(st);
                }
                groupRepository.save(group);
            }
        }
    }

    public List<Group> getTeacherGroups(String username) {
        Teacher teacher = teacherRepository.findByUserUsername(username).orElseThrow();
        List<Group> allGroups = groupRepository.findByAcademicYearId(teacher.getAcademicYear().getId());
        List<Group> teacherGroups = new ArrayList<>();
        for (Group g : allGroups) {
            boolean isPrimary = g.getPrimaryTeacher() != null && g.getPrimaryTeacher().getId().equals(teacher.getId());
            boolean isSecondary = g.getSecondaryTeacher() != null && g.getSecondaryTeacher().getId().equals(teacher.getId());
            if (isPrimary || isSecondary) {
                teacherGroups.add(g);
            }
        }
        return teacherGroups;
    }

    public List<ProjectIdea> getSubmissionsForTeacher(String username) {
        List<Group> groups = getTeacherGroups(username);
        List<ProjectIdea> ideas = new ArrayList<>();
        for (Group g : groups) {
            ideas.addAll(projectIdeaRepository.findByGroupId(g.getId()));
        }
        return ideas;
    }

    public void updateIdeaStatus(Long ideaId, IdeaStatus status, String teacherUsername) {
        ProjectIdea idea = projectIdeaRepository.findById(ideaId).orElseThrow();
        validateTeacherAssignedToGroup(teacherUsername, idea.getGroup());
        idea.setStatus(status);
        projectIdeaRepository.save(idea);
    }

    public ProjectComment addCommentToIdea(Long ideaId, String commentText, String username) {
        ProjectIdea idea = projectIdeaRepository.findById(ideaId).orElseThrow();
        User author = userRepository.findByUsername(username).orElseThrow();

        if (author.getRole() == Role.ROLE_TEACHER) {
            validateTeacherAssignedToGroup(username, idea.getGroup());
        } else if (author.getRole() == Role.ROLE_STUDENT) {
            Student student = studentRepository.findByUserUsername(username).orElseThrow();
            if (student.getGroup() == null || !student.getGroup().getId().equals(idea.getGroup().getId())) {
                throw new SecurityException("Student not in group");
            }
        }

        ProjectComment comment = new ProjectComment();
        comment.setProjectIdea(idea);
        comment.setAuthor(author);
        comment.setCommentText(commentText);
        comment.setCreatedAt(LocalDateTime.now());
        return projectCommentRepository.save(comment);
    }

    public void scoreWeeklyProgress(Long progressId, Double score, String teacherUsername) {
        WeeklyProgress progress = weeklyProgressRepository.findById(progressId).orElseThrow();
        Group group = progress.getGroup();
        Teacher teacher = teacherRepository.findByUserUsername(teacherUsername).orElseThrow();

        boolean isPrimary = group.getPrimaryTeacher() != null && group.getPrimaryTeacher().getId().equals(teacher.getId());
        boolean isSecondary = group.getSecondaryTeacher() != null && group.getSecondaryTeacher().getId().equals(teacher.getId());

        if (!isPrimary && !isSecondary) {
            throw new SecurityException("Teacher not assigned to group");
        }

        if (score != null && (score < 0 || score > 10)) {
            throw new IllegalArgumentException("Score must be between 0 and 10");
        }

        if (isPrimary) {
            progress.setPrimaryTeacherScore(score);
        }
        if (isSecondary) {
            progress.setSecondaryTeacherScore(score);
        }

        weeklyProgressRepository.save(progress);
    }

    public List<WeeklyProgress> getWeeklyProgressForTeacherGroups(String username) {
        List<Group> groups = getTeacherGroups(username);
        List<WeeklyProgress> progressList = new ArrayList<>();
        for (Group g : groups) {
            progressList.addAll(weeklyProgressRepository.findByGroupId(g.getId()));
        }
        return progressList;
    }

    private void validateTeacherAssignedToGroup(String username, Group group) {
        Teacher teacher = teacherRepository.findByUserUsername(username).orElseThrow();
        boolean isPrimary = group.getPrimaryTeacher() != null && group.getPrimaryTeacher().getId().equals(teacher.getId());
        boolean isSecondary = group.getSecondaryTeacher() != null && group.getSecondaryTeacher().getId().equals(teacher.getId());
        if (!isPrimary && !isSecondary) {
            throw new SecurityException("Teacher not assigned to this group");
        }
    }
}
