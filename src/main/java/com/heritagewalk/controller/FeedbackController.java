package com.heritagewalk.controller;

import com.heritagewalk.dto.ApiResponse;
import com.heritagewalk.dto.FeedbackDto;
import com.heritagewalk.dto.FeedbackRequest;
import com.heritagewalk.model.User;
import com.heritagewalk.service.AuthService;
import com.heritagewalk.service.FeedbackService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    @Autowired
    private FeedbackService feedbackService;

    @Autowired
    private AuthService authService;

    @PostMapping
    public ResponseEntity<ApiResponse<FeedbackDto>> submitFeedback(
            @Valid @RequestBody FeedbackRequest request,
            HttpSession session) {
        User currentUser = authService.getCurrentUserEntity(session);
        FeedbackDto saved = feedbackService.submitFeedback(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Thank you! Your feedback has been submitted successfully.", saved));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<FeedbackDto>>> getMyFeedback(HttpSession session) {
        User currentUser = authService.getCurrentUserEntity(session);
        List<FeedbackDto> list = feedbackService.getMyFeedback(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/site/{siteId}")
    public ResponseEntity<ApiResponse<List<FeedbackDto>>> getSiteFeedback(@PathVariable Long siteId) {
        List<FeedbackDto> list = feedbackService.getSiteFeedback(siteId);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }
}

