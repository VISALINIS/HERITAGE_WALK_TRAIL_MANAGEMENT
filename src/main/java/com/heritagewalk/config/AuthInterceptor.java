package com.heritagewalk.config;

import com.heritagewalk.exception.ForbiddenException;
import com.heritagewalk.exception.UnauthorizedException;
import com.heritagewalk.model.Role;
import com.heritagewalk.model.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    public static final String SESSION_USER_KEY = "LOGGED_IN_USER";

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String path = request.getRequestURI();
        HttpSession session = request.getSession(false);

        User currentUser = null;
        if (session != null) {
            currentUser = (User) session.getAttribute(SESSION_USER_KEY);
        }

        // Admin endpoints protection
        if (path.startsWith("/api/admin")) {
            if (currentUser == null) {
                throw new UnauthorizedException("Authentication required. Please log in as an administrator.");
            }
            if (currentUser.getRole() != Role.ADMIN) {
                throw new ForbiddenException("Access denied. Administrator privileges are required for this action.");
            }
            if (!currentUser.isActive()) {
                throw new ForbiddenException("Your account has been deactivated. Please contact support.");
            }
            return true;
        }

        // Visitor feedback protection (excluding public site feedback: /api/feedback/site/**)
        if (path.startsWith("/api/feedback/my") || ((path.equals("/api/feedback") || path.equals("/api/feedback/")) && "POST".equalsIgnoreCase(request.getMethod()))) {
            if (currentUser == null) {
                throw new UnauthorizedException("Authentication required. Please log in to access this feature.");
            }
            if (!currentUser.isActive()) {
                throw new ForbiddenException("Your account has been deactivated.");
            }
            return true;
        }

        return true;
    }
}

