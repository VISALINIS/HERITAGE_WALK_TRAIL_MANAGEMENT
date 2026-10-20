package com.heritagewalk.service;

import com.heritagewalk.config.AuthInterceptor;
import com.heritagewalk.dto.LoginRequest;
import com.heritagewalk.dto.RegisterRequest;
import com.heritagewalk.dto.UserDto;
import com.heritagewalk.exception.BadRequestException;
import com.heritagewalk.exception.ForbiddenException;
import com.heritagewalk.exception.UnauthorizedException;
import com.heritagewalk.model.Role;
import com.heritagewalk.model.User;
import com.heritagewalk.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public UserDto register(RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Password and confirm password do not match");
        }

        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new BadRequestException("An account with this email already exists");
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.VISITOR);
        user.setActive(true);

        User saved = userRepository.save(user);
        return new UserDto(saved);
    }

    public UserDto login(LoginRequest request, HttpSession session) {
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        if (!user.isActive()) {
            throw new ForbiddenException("This account has been deactivated. Please contact administrator.");
        }

        // Store user in session
        session.setAttribute(AuthInterceptor.SESSION_USER_KEY, user);

        return new UserDto(user);
    }

    public void logout(HttpSession session) {
        if (session != null) {
            session.removeAttribute(AuthInterceptor.SESSION_USER_KEY);
            session.invalidate();
        }
    }

    public UserDto getCurrentUser(HttpSession session) {
        if (session == null) {
            return null;
        }
        User user = (User) session.getAttribute(AuthInterceptor.SESSION_USER_KEY);
        if (user == null) {
            return null;
        }
        // Fetch fresh status from database
        return userRepository.findById(user.getId())
                .map(UserDto::new)
                .orElse(null);
    }

    public User getCurrentUserEntity(HttpSession session) {
        if (session == null) {
            throw new UnauthorizedException("No active session found. Please log in.");
        }
        User user = (User) session.getAttribute(AuthInterceptor.SESSION_USER_KEY);
        if (user == null) {
            throw new UnauthorizedException("No active session found. Please log in.");
        }
        return userRepository.findById(user.getId())
                .orElseThrow(() -> new UnauthorizedException("User session is no longer valid."));
    }
}

