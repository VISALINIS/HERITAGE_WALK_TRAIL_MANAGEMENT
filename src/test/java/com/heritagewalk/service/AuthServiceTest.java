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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private HttpSession session;

    @InjectMocks
    private AuthService authService;

    @Test
    void testRegister_Success() {
        RegisterRequest req = new RegisterRequest();
        req.setName("Test User");
        req.setEmail("test@example.com");
        req.setPassword("Password@123");
        req.setConfirmPassword("Password@123");

        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Password@123")).thenReturn("hashedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(10L);
            return u;
        });

        UserDto dto = authService.register(req);

        assertNotNull(dto);
        assertEquals("Test User", dto.getName());
        assertEquals("test@example.com", dto.getEmail());
        assertEquals(Role.VISITOR, dto.getRole());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void testRegister_PasswordMismatch() {
        RegisterRequest req = new RegisterRequest();
        req.setName("Test User");
        req.setEmail("test@example.com");
        req.setPassword("Password@123");
        req.setConfirmPassword("DifferentPassword");

        assertThrows(BadRequestException.class, () -> authService.register(req));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testRegister_DuplicateEmail() {
        RegisterRequest req = new RegisterRequest();
        req.setName("Test User");
        req.setEmail("existing@example.com");
        req.setPassword("Password@123");
        req.setConfirmPassword("Password@123");

        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.register(req));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testLogin_Success() {
        LoginRequest req = new LoginRequest();
        req.setEmail("visitor@heritagewalk.com");
        req.setPassword("Visitor@123");

        User user = new User("Priya Sharma", "visitor@heritagewalk.com", "hashedPwd", Role.VISITOR);
        user.setId(2L);
        user.setActive(true);

        when(userRepository.findByEmail("visitor@heritagewalk.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Visitor@123", "hashedPwd")).thenReturn(true);

        UserDto dto = authService.login(req, session);

        assertNotNull(dto);
        assertEquals("Priya Sharma", dto.getName());
        verify(session).setAttribute(AuthInterceptor.SESSION_USER_KEY, user);
    }

    @Test
    void testLogin_InvalidPassword() {
        LoginRequest req = new LoginRequest();
        req.setEmail("visitor@heritagewalk.com");
        req.setPassword("WrongPassword");

        User user = new User("Priya Sharma", "visitor@heritagewalk.com", "hashedPwd", Role.VISITOR);

        when(userRepository.findByEmail("visitor@heritagewalk.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("WrongPassword", "hashedPwd")).thenReturn(false);

        assertThrows(UnauthorizedException.class, () -> authService.login(req, session));
        verify(session, never()).setAttribute(any(), any());
    }

    @Test
    void testLogin_DeactivatedAccount() {
        LoginRequest req = new LoginRequest();
        req.setEmail("visitor@heritagewalk.com");
        req.setPassword("Visitor@123");

        User user = new User("Deactivated Visitor", "visitor@heritagewalk.com", "hashedPwd", Role.VISITOR);
        user.setActive(false);

        when(userRepository.findByEmail("visitor@heritagewalk.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Visitor@123", "hashedPwd")).thenReturn(true);

        assertThrows(ForbiddenException.class, () -> authService.login(req, session));
        verify(session, never()).setAttribute(any(), any());
    }

    @Test
    void testLogout_InvalidatesSession() {
        authService.logout(session);
        verify(session).removeAttribute(AuthInterceptor.SESSION_USER_KEY);
        verify(session).invalidate();
    }
}

