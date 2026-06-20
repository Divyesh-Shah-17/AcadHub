package com.academic.projectmanager.service;

import com.academic.projectmanager.config.JwtTokenUtil;
import com.academic.projectmanager.dto.LoginRequest;
import com.academic.projectmanager.dto.LoginResponse;
import com.academic.projectmanager.entity.User;
import com.academic.projectmanager.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private UserRepository userRepository;

    public LoginResponse login(LoginRequest request) {
        String username = request.getUsername().toLowerCase();
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, request.getPassword())
        );

        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        String token = jwtTokenUtil.generateToken(userDetails);

        User user = userRepository.findByUsername(username).orElseThrow();

        return new LoginResponse(
                token,
                user.getRole().name(),
                user.getFullName(),
                user.getUsername()
        );
    }
}
