package com.academic.projectmanager.service;

import com.academic.projectmanager.entity.*;
import com.academic.projectmanager.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class AdminService {

    @Autowired
    private CsvService csvService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private AcademicYearRepository academicYearRepository;

    @Autowired
    private SystemConfigRepository systemConfigRepository;

    @Autowired
    private TeacherReviewRepository teacherReviewRepository;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private WeeklyProgressRepository weeklyProgressRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public void importStudentsCsv(InputStream inputStream) throws Exception {
        List<String[]> lines = csvService.parseCsv(inputStream);
        for (int i = 0; i < lines.size(); i++) {
            String[] row = lines.get(i);
            if (row.length < 4) {
                continue;
            }
            if (i == 0 && row[0].equalsIgnoreCase("username")) {
                continue;
            }
            String username = row[0].trim();
            String fullName = row[1].trim();
            String email = row[2].trim();
            String yearVal = row[3].trim();

            AcademicYear academicYear = findOrCreateYear(yearVal);

            User user = userRepository.findByUsername(username).map(u -> {
                u.setFullName(fullName);
                u.setEmail(email);
                return userRepository.save(u);
            }).orElseGet(() -> {
                User u = new User();
                u.setUsername(username);
                u.setPassword(passwordEncoder.encode("password"));
                u.setRole(Role.ROLE_STUDENT);
                u.setFullName(fullName);
                u.setEmail(email);
                return userRepository.save(u);
            });

            Optional<Student> studentOpt = studentRepository.findByUserUsername(username);
            if (studentOpt.isPresent()) {
                Student s = studentOpt.get();
                s.setAcademicYear(academicYear);
                studentRepository.save(s);
            } else {
                Student s = new Student();
                s.setUser(user);
                s.setAcademicYear(academicYear);
                studentRepository.save(s);
            }
        }
    }

    public void importTeachersCsv(InputStream inputStream) throws Exception {
        List<String[]> lines = csvService.parseCsv(inputStream);
        for (int i = 0; i < lines.size(); i++) {
            String[] row = lines.get(i);
            if (row.length < 4) {
                continue;
            }
            if (i == 0 && row[0].equalsIgnoreCase("username")) {
                continue;
            }
            String username = row[0].trim();
            String fullName = row[1].trim();
            String email = row[2].trim();
            String yearVal = row[3].trim();

            AcademicYear academicYear = findOrCreateYear(yearVal);

            User user = userRepository.findByUsername(username).map(u -> {
                u.setFullName(fullName);
                u.setEmail(email);
                return userRepository.save(u);
            }).orElseGet(() -> {
                User u = new User();
                u.setUsername(username);
                u.setPassword(passwordEncoder.encode("password"));
                u.setRole(Role.ROLE_TEACHER);
                u.setFullName(fullName);
                u.setEmail(email);
                return userRepository.save(u);
            });

            Optional<Teacher> teacherOpt = teacherRepository.findByUserUsername(username);
            if (teacherOpt.isPresent()) {
                Teacher t = teacherOpt.get();
                t.setAcademicYear(academicYear);
                teacherRepository.save(t);
            } else {
                Teacher t = new Teacher();
                t.setUser(user);
                t.setAcademicYear(academicYear);
                teacherRepository.save(t);
            }
        }
    }

    private AcademicYear findOrCreateYear(String yearVal) {
        return academicYearRepository.findByYear(yearVal).orElseGet(() -> {
            AcademicYear ay = new AcademicYear();
            ay.setYear(yearVal);
            ay.setCurrent(false);
            return academicYearRepository.save(ay);
        });
    }

    public List<AcademicYear> getAllAcademicYears() {
        return academicYearRepository.findAll();
    }

    public AcademicYear createAcademicYear(String year) {
        AcademicYear ay = new AcademicYear();
        ay.setYear(year);
        ay.setCurrent(false);
        return academicYearRepository.save(ay);
    }

    public void setActiveAcademicYear(Long id) {
        List<AcademicYear> all = academicYearRepository.findAll();
        for (AcademicYear ay : all) {
            ay.setCurrent(ay.getId().equals(id));
            academicYearRepository.save(ay);
        }
    }

    public boolean isGradesPublished() {
        Optional<SystemConfig> config = systemConfigRepository.findById("is_published");
        return config.isPresent() && config.get().getConfigValue().equalsIgnoreCase("true");
    }

    public void setGradesPublished(boolean published) {
        SystemConfig config = systemConfigRepository.findById("is_published").orElseGet(() -> {
            SystemConfig c = new SystemConfig();
            c.setConfigKey("is_published");
            return c;
        });
        config.setConfigValue(String.valueOf(published));
        systemConfigRepository.save(config);
    }

    public List<TeacherReview> getTeacherReviews(Long academicYearId) {
        return teacherReviewRepository.findByAcademicYearId(academicYearId);
    }

    public void autoAllocateTeachersRandomly(Long academicYearId) {
        List<Group> groups = groupRepository.findByAcademicYearId(academicYearId);
        List<Teacher> teachers = teacherRepository.findByAcademicYearId(academicYearId);
        if (teachers.isEmpty() || groups.isEmpty()) {
            return;
        }
        java.util.Random random = new java.util.Random();
        for (Group group : groups) {
            Teacher primary = teachers.get(random.nextInt(teachers.size()));
            group.setPrimaryTeacher(primary);
            if (teachers.size() > 1) {
                Teacher secondary;
                do {
                    secondary = teachers.get(random.nextInt(teachers.size()));
                } while (secondary.getId().equals(primary.getId()));
                group.setSecondaryTeacher(secondary);
            } else {
                group.setSecondaryTeacher(null);
            }
            groupRepository.save(group);
        }
    }

    public List<Student> getStudentsByYear(Long yearId) {
        return studentRepository.findByAcademicYearId(yearId);
    }

    public List<Teacher> getTeachersByYear(Long yearId) {
        return teacherRepository.findByAcademicYearId(yearId);
    }

    public List<Group> getGroupsByYear(Long yearId) {
        return groupRepository.findByAcademicYearId(yearId);
    }

    public void allocateStudentsRandomly(Long academicYearId, int K) {
        AcademicYear year = academicYearRepository.findById(academicYearId).orElseThrow();
        List<Student> students = studentRepository.findByAcademicYearIdAndGroupIsNull(academicYearId);
        if (students.isEmpty()) {
            return;
        }
        java.util.Collections.shuffle(students);
        int N = students.size();
        int G = (N + K - 1) / K;
        if (G <= 0) {
            return;
        }
        int baseSize = N / G;
        int rem = N % G;
        int existingGroupCount = groupRepository.findByAcademicYearId(academicYearId).size();
        int index = 0;
        for (int i = 0; i < G; i++) {
            Group group = new Group();
            group.setName("Group " + (existingGroupCount + i + 1));
            group.setAcademicYear(year);
            group = groupRepository.save(group);
            int groupSize = baseSize + (i < rem ? 1 : 0);
            for (int c = 0; c < groupSize && index < N; c++) {
                Student student = students.get(index++);
                student.setGroup(group);
                studentRepository.save(student);
            }
        }
    }

    public void balancedTeacherAllocation(Long academicYearId) {
        List<Group> groups = groupRepository.findByAcademicYearId(academicYearId);
        List<Teacher> teachers = teacherRepository.findByAcademicYearId(academicYearId);
        if (teachers.isEmpty() || groups.isEmpty()) {
            return;
        }
        teachers.sort((t1, t2) -> t1.getUser().getFullName().compareToIgnoreCase(t2.getUser().getFullName()));
        int G = groups.size();
        int T = teachers.size();
        int S = 2 * G;
        int base = S / T;
        int extra = S % T;
        List<Teacher> slotPool = new java.util.ArrayList<>();
        for (int i = 0; i < T; i++) {
            int count = base + (i < extra ? 1 : 0);
            for (int c = 0; c < count; c++) {
                slotPool.add(teachers.get(i));
            }
        }
        java.util.Collections.shuffle(slotPool);
        if (T > 1) {
            for (int j = 0; j < G; j++) {
                if (slotPool.get(j).getId().equals(slotPool.get(j + G).getId())) {
                    for (int k = G; k < 2 * G; k++) {
                        if (!slotPool.get(k).getId().equals(slotPool.get(j).getId()) && k != j + G) {
                            Teacher temp = slotPool.get(j + G);
                            slotPool.set(j + G, slotPool.get(k));
                            slotPool.set(k, temp);
                            break;
                        }
                    }
                }
            }
        }
        for (int j = 0; j < G; j++) {
            Group group = groups.get(j);
            group.setPrimaryTeacher(slotPool.get(j));
            group.setSecondaryTeacher(slotPool.get(j + G));
            groupRepository.save(group);
        }
    }

    public double calculateConsolidatedScore(Long studentId) {
        List<WeeklyProgress> progress = weeklyProgressRepository.findByStudentId(studentId);
        if (progress.isEmpty()) {
            return 0.0;
        }
        double sum = 0.0;
        int count = 0;
        for (WeeklyProgress wp : progress) {
            double weekScore = 0.0;
            int scoresCount = 0;
            if (wp.getPrimaryTeacherScore() != null) {
                weekScore += wp.getPrimaryTeacherScore();
                scoresCount++;
            }
            if (wp.getSecondaryTeacherScore() != null) {
                weekScore += wp.getSecondaryTeacherScore();
                scoresCount++;
            }
            if (scoresCount > 0) {
                sum += (weekScore / scoresCount);
                count++;
            }
        }
        return count > 0 ? sum / count : 0.0;
    }

    public void updateStudentGroup(Long studentId, Long groupId) {
        Student student = studentRepository.findById(studentId).orElseThrow();
        if (groupId == null) {
            student.setGroup(null);
        } else {
            Group group = groupRepository.findById(groupId).orElseThrow();
            student.setGroup(group);
        }
        studentRepository.save(student);
    }

    public void updateGroupTeachers(Long groupId, String primaryUsername, String secondaryUsername) {
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

    public void overrideWeeklyProgressScores(Long progressId, Double primaryScore, Double secondaryScore) {
        WeeklyProgress progress = weeklyProgressRepository.findById(progressId).orElseThrow();
        if (primaryScore != null && (primaryScore < 0 || primaryScore > 10)) {
            throw new IllegalArgumentException("Score must be between 0 and 10");
        }
        if (secondaryScore != null && (secondaryScore < 0 || secondaryScore > 10)) {
            throw new IllegalArgumentException("Score must be between 0 and 10");
        }
        progress.setPrimaryTeacherScore(primaryScore);
        progress.setSecondaryTeacherScore(secondaryScore);
        weeklyProgressRepository.save(progress);
    }

    public void writeStudentsCsv(java.io.Writer writer, Long yearId) throws Exception {
        List<Student> students = studentRepository.findByAcademicYearId(yearId);
        try (com.opencsv.CSVWriter csvWriter = new com.opencsv.CSVWriter(writer)) {
            csvWriter.writeNext(new String[]{"studentId", "username", "fullName", "email", "groupName"});
            for (Student s : students) {
                csvWriter.writeNext(new String[]{
                        String.valueOf(s.getId()),
                        s.getUser().getUsername(),
                        s.getUser().getFullName(),
                        s.getUser().getEmail(),
                        s.getGroup() != null ? s.getGroup().getName() : "Unassigned"
                });
            }
        }
    }

    public void writeTeachersCsv(java.io.Writer writer, Long yearId) throws Exception {
        List<Teacher> teachers = teacherRepository.findByAcademicYearId(yearId);
        try (com.opencsv.CSVWriter csvWriter = new com.opencsv.CSVWriter(writer)) {
            csvWriter.writeNext(new String[]{"teacherId", "username", "fullName", "email"});
            for (Teacher t : teachers) {
                csvWriter.writeNext(new String[]{
                        String.valueOf(t.getId()),
                        t.getUser().getUsername(),
                        t.getUser().getFullName(),
                        t.getUser().getEmail()
                });
            }
        }
    }

    public void writeGroupsCsv(java.io.Writer writer, Long yearId) throws Exception {
        List<Group> groups = groupRepository.findByAcademicYearId(yearId);
        try (com.opencsv.CSVWriter csvWriter = new com.opencsv.CSVWriter(writer)) {
            csvWriter.writeNext(new String[]{"groupId", "groupName", "primaryTeacher", "secondaryTeacher", "studentUsernames"});
            for (Group g : groups) {
                java.util.List<String> studentNames = new java.util.ArrayList<>();
                if (g.getStudents() != null) {
                    for (Student s : g.getStudents()) {
                        studentNames.add(s.getUser().getUsername());
                    }
                }
                csvWriter.writeNext(new String[]{
                        String.valueOf(g.getId()),
                        g.getName(),
                        g.getPrimaryTeacher() != null ? g.getPrimaryTeacher().getUser().getFullName() : "None",
                        g.getSecondaryTeacher() != null ? g.getSecondaryTeacher().getUser().getFullName() : "None",
                        String.join(";", studentNames)
                });
            }
        }
    }

    public void writeGradingMatrixCsv(java.io.Writer writer, Long yearId) throws Exception {
        List<Group> groups = groupRepository.findByAcademicYearId(yearId);
        try (com.opencsv.CSVWriter csvWriter = new com.opencsv.CSVWriter(writer)) {
            csvWriter.writeNext(new String[]{"studentName", "groupName", "weekNumber", "summary", "primaryScore", "secondaryScore", "averageScore"});
            for (Group g : groups) {
                List<WeeklyProgress> progressList = weeklyProgressRepository.findByGroupId(g.getId());
                for (WeeklyProgress wp : progressList) {
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
                    csvWriter.writeNext(new String[]{
                            wp.getStudent().getUser().getFullName(),
                            g.getName(),
                            String.valueOf(wp.getWeekNumber()),
                            wp.getSummary(),
                            wp.getPrimaryTeacherScore() != null ? String.valueOf(wp.getPrimaryTeacherScore()) : "Unscored",
                            wp.getSecondaryTeacherScore() != null ? String.valueOf(wp.getSecondaryTeacherScore()) : "Unscored",
                            String.valueOf(avg)
                    });
                }
            }
        }
    }
}
