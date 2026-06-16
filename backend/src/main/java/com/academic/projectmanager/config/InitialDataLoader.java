package com.academic.projectmanager.config;

import com.academic.projectmanager.entity.AcademicYear;
import com.academic.projectmanager.entity.Role;
import com.academic.projectmanager.entity.User;
import com.academic.projectmanager.repository.AcademicYearRepository;
import com.academic.projectmanager.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class InitialDataLoader implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AcademicYearRepository academicYearRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (academicYearRepository.findByIsCurrentTrue().isEmpty()) {
            AcademicYear ay = new AcademicYear();
            ay.setYear("2025-2026");
            ay.setCurrent(true);
            academicYearRepository.save(ay);
        }

        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ROLE_ADMIN);
            admin.setFullName("System Administrator");
            admin.setEmail("admin@academic.com");
            userRepository.save(admin);
        }
    }
}
