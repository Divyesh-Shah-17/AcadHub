package com.academic.projectmanager.entity;

import javax.persistence.*;
import java.util.List;

@Entity
@Table(name = "project_idea")
public class ProjectIdea {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Lob
    private String description;

    @ManyToOne
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;

    @ManyToOne
    @JoinColumn(name = "submitted_by_id", nullable = false)
    private Student submittedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IdeaStatus status;

    @OneToMany(mappedBy = "projectIdea", cascade = CascadeType.ALL)
    private List<ProjectComment> comments;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Group getGroup() {
        return group;
    }

    public void setGroup(Group group) {
        this.group = group;
    }

    public Student getSubmittedBy() {
        return submittedBy;
    }

    public void setSubmittedBy(Student submittedBy) {
        this.submittedBy = submittedBy;
    }

    public IdeaStatus getStatus() {
        return status;
    }

    public void setStatus(IdeaStatus status) {
        this.status = status;
    }

    public List<ProjectComment> getComments() {
        return comments;
    }

    public void setComments(List<ProjectComment> comments) {
        this.comments = comments;
    }
}
