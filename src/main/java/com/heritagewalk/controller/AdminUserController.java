package com.heritagewalk.controller;

import com.heritagewalk.dto.ApiResponse;
import com.heritagewalk.dto.UserDto;
import com.heritagewalk.exception.BadRequestException;
import com.heritagewalk.exception.ResourceNotFoundException;
import com.heritagewalk.model.Role;
import com.heritagewalk.model.User;
import com.heritagewalk.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllVisitors() {
        List<UserDto> visitors = userRepository.findByRoleOrderByCreatedAtDesc(Role.VISITOR).stream()
                .map(UserDto::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(visitors));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<UserDto>> toggleUserStatus(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Boolean> body) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

        if (user.getRole() == Role.ADMIN) {
            throw new BadRequestException("Cannot modify status of an administrator account");
        }

        if (body != null && body.containsKey("active")) {
            user.setActive(body.get("active"));
        } else {
            user.setActive(!user.isActive());
        }

        User updated = userRepository.save(user);
        String msg = updated.isActive() ? "User account activated successfully" : "User account deactivated successfully";
        return ResponseEntity.ok(ApiResponse.ok(msg, new UserDto(updated)));
    }
}

