package com.heritagewalk.service;

import com.heritagewalk.dto.FeedbackDto;
import com.heritagewalk.dto.FeedbackRequest;
import com.heritagewalk.exception.BadRequestException;
import com.heritagewalk.exception.ResourceNotFoundException;
import com.heritagewalk.model.Feedback;
import com.heritagewalk.model.HeritageSite;
import com.heritagewalk.model.Role;
import com.heritagewalk.model.User;
import com.heritagewalk.repository.FeedbackRepository;
import com.heritagewalk.repository.HeritageSiteRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class FeedbackServiceTest {

    @Mock
    private FeedbackRepository feedbackRepository;

    @Mock
    private HeritageSiteRepository heritageSiteRepository;

    @InjectMocks
    private FeedbackService feedbackService;

    @Test
    void testSubmitFeedback_Success() {
        User user = new User("Priya", "priya@example.com", "pwd", Role.VISITOR);
        user.setId(2L);

        HeritageSite site = new HeritageSite("Taj Mahal", "Agra", "Mausoleum", "Mughal", "Mughal", "Significance", "img", 27.1, 78.0);
        site.setId(1L);

        FeedbackRequest request = new FeedbackRequest();
        request.setHeritageSiteId(1L);
        request.setRating(5);
        request.setComment("Stunning architecture!");

        when(heritageSiteRepository.findById(1L)).thenReturn(Optional.of(site));
        when(feedbackRepository.save(any(Feedback.class))).thenAnswer(invocation -> {
            Feedback f = invocation.getArgument(0);
            f.setId(100L);
            return f;
        });

        FeedbackDto result = feedbackService.submitFeedback(request, user);

        assertNotNull(result);
        assertEquals(5, result.getRating());
        assertEquals("Stunning architecture!", result.getComment());
        assertEquals("Taj Mahal", result.getHeritageSiteName());
        verify(feedbackRepository).save(any(Feedback.class));
    }

    @Test
    void testSubmitFeedback_InvalidRatingTooLow() {
        User user = new User("Priya", "priya@example.com", "pwd", Role.VISITOR);
        FeedbackRequest request = new FeedbackRequest();
        request.setHeritageSiteId(1L);
        request.setRating(0); // Invalid: min is 1
        request.setComment("Nice");

        assertThrows(BadRequestException.class, () -> feedbackService.submitFeedback(request, user));
        verify(feedbackRepository, never()).save(any());
    }

    @Test
    void testSubmitFeedback_InvalidRatingTooHigh() {
        User user = new User("Priya", "priya@example.com", "pwd", Role.VISITOR);
        FeedbackRequest request = new FeedbackRequest();
        request.setHeritageSiteId(1L);
        request.setRating(6); // Invalid: max is 5
        request.setComment("Great");

        assertThrows(BadRequestException.class, () -> feedbackService.submitFeedback(request, user));
        verify(feedbackRepository, never()).save(any());
    }

    @Test
    void testSubmitFeedback_EmptyComment() {
        User user = new User("Priya", "priya@example.com", "pwd", Role.VISITOR);
        FeedbackRequest request = new FeedbackRequest();
        request.setHeritageSiteId(1L);
        request.setRating(4);
        request.setComment("   "); // Blank

        assertThrows(BadRequestException.class, () -> feedbackService.submitFeedback(request, user));
        verify(feedbackRepository, never()).save(any());
    }

    @Test
    void testSubmitFeedback_SiteNotFound() {
        User user = new User("Priya", "priya@example.com", "pwd", Role.VISITOR);
        FeedbackRequest request = new FeedbackRequest();
        request.setHeritageSiteId(999L);
        request.setRating(5);
        request.setComment("Awesome");

        when(heritageSiteRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> feedbackService.submitFeedback(request, user));
        verify(feedbackRepository, never()).save(any());
    }

    @Test
    void testGetMyFeedback() {
        User user = new User("Priya", "priya@example.com", "pwd", Role.VISITOR);
        user.setId(2L);
        HeritageSite site = new HeritageSite("Taj Mahal", "Agra", "Desc", "Period", "Style", "Sig", "img", 27.1, 78.0);
        site.setId(1L);

        Feedback f = new Feedback(user, site, 5, "Loved it!");
        f.setId(10L);

        when(feedbackRepository.findByUserIdOrderByCreatedAtDesc(2L)).thenReturn(List.of(f));

        List<FeedbackDto> list = feedbackService.getMyFeedback(2L);

        assertEquals(1, list.size());
        assertEquals("Loved it!", list.get(0).getComment());
    }
}

