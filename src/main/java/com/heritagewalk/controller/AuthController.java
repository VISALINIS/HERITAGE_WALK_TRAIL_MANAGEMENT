package com.heritagewalk.controller;

import com.heritagewalk.dto.ApiResponse;
import com.heritagewalk.dto.LoginRequest;
import com.heritagewalk.dto.RegisterRequest;
import com.heritagewalk.dto.UserDto;
import com.heritagewalk.service.AuthService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserDto>> register(@Valid @RequestBody RegisterRequest request) {
        UserDto created = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Registration successful! You can now log in.", created));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<UserDto>> login(@Valid @RequestBody LoginRequest request, HttpSession session) {
        UserDto user = authService.login(request, session);
        return ResponseEntity.ok(ApiResponse.ok("Login successful!", user));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpSession session) {
        authService.logout(session);
        return ResponseEntity.ok(ApiResponse.ok("Logged out successfully."));
    }

    @GetMapping("/session")
    public ResponseEntity<ApiResponse<UserDto>> getSession(HttpSession session) {
        UserDto user = authService.getCurrentUser(session);
        if (user != null) {
            return ResponseEntity.ok(ApiResponse.ok("Active session found", user));
        } else {
            return ResponseEntity.ok(new ApiResponse<>(false, "No active session", null));
        }
    }
}

