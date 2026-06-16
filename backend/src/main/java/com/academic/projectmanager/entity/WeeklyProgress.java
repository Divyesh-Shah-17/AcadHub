package com.academic.projectmanager.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "weekly_progress")
public class WeeklyProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "week_number", nullable = false)
    private int weekNumber;

    @Lob
    private String summary;

    @Lob
    private String links;

    @Column(name = "submitted_at", nullable = false)
    private LocalDateTime submittedAt;

    @Column(name = "primary_teacher_score")
    private Double primaryTeacherScore;

    @Column(name = "secondary_teacher_score")
    private Double secondaryTeacherScore;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Group getGroup() {
        return group;
    }

    public void setGroup(Group group) {
        this.group = group;
    }

    public Student getStudent() {
        return student;
    }

    public void setStudent(Student student) {
        this.student = student;
    }

    public int getWeekNumber() {
        return weekNumber;
    }

    public void setWeekNumber(int weekNumber) {
        this.weekNumber = weekNumber;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getLinks() {
        return links;
    }

    public void setLinks(String links) {
        this.links = links;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public Double getPrimaryTeacherScore() {
        return primaryTeacherScore;
    }

    public void setPrimaryTeacherScore(Double primaryTeacherScore) {
        this.primaryTeacherScore = primaryTeacherScore;
    }

    public Double getSecondaryTeacherScore() {
        return secondaryTeacherScore;
    }

    public void setSecondaryTeacherScore(Double secondaryTeacherScore) {
        this.secondaryTeacherScore = secondaryTeacherScore;
    }
}
