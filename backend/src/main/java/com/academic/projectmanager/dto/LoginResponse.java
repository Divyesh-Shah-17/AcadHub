package com.academic.projectmanager.dto;

public class LoginResponse {

    private String token;
    private String role;
    private String fullName;
    private String username;

    public LoginResponse(String token, String role, String fullName, String username) {
        this.token = token;
        this.role = role;
        this.fullName = fullName;
        this.username = username;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}
