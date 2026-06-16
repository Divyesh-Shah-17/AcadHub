package com.academic.projectmanager.entity;

import javax.persistence.*;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "project_group")
public class Group {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne
    @JoinColumn(name = "academic_year_id", nullable = false)
    private AcademicYear academicYear;

    @ManyToOne
    @JoinColumn(name = "primary_teacher_id")
    private Teacher primaryTeacher;

    @ManyToOne
    @JoinColumn(name = "secondary_teacher_id")
    private Teacher secondaryTeacher;

    @OneToMany(mappedBy = "group")
    @JsonIgnoreProperties("group")
    private List<Student> students;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public AcademicYear getAcademicYear() {
        return academicYear;
    }

    public void setAcademicYear(AcademicYear academicYear) {
        this.academicYear = academicYear;
    }

    public Teacher getPrimaryTeacher() {
        return primaryTeacher;
    }

    public void setPrimaryTeacher(Teacher primaryTeacher) {
        this.primaryTeacher = primaryTeacher;
    }

    public Teacher getSecondaryTeacher() {
        return secondaryTeacher;
    }

    public void setSecondaryTeacher(Teacher secondaryTeacher) {
        this.secondaryTeacher = secondaryTeacher;
    }

    public List<Student> getStudents() {
        return students;
    }

    public void setStudents(List<Student> students) {
        this.students = students;
    }
}
