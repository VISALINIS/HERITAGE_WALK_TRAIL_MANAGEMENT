package com.heritagewalk.service;

import com.heritagewalk.dto.FeedbackDto;
import com.heritagewalk.dto.FeedbackRequest;
import com.heritagewalk.exception.BadRequestException;
import com.heritagewalk.exception.ResourceNotFoundException;
import com.heritagewalk.model.Feedback;
import com.heritagewalk.model.HeritageSite;
import com.heritagewalk.model.User;
import com.heritagewalk.repository.FeedbackRepository;
import com.heritagewalk.repository.HeritageSiteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FeedbackService {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private HeritageSiteRepository heritageSiteRepository;

    @Transactional
    public FeedbackDto submitFeedback(FeedbackRequest request, User user) {
        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new BadRequestException("Rating must be between 1 and 5");
        }

        if (request.getComment() == null || request.getComment().trim().isEmpty()) {
            throw new BadRequestException("Feedback comment cannot be empty");
        }

        HeritageSite site = heritageSiteRepository.findById(request.getHeritageSiteId())
                .orElseThrow(() -> new ResourceNotFoundException("Heritage site not found with ID: " + request.getHeritageSiteId()));

        Feedback feedback = new Feedback(user, site, request.getRating(), request.getComment().trim());
        Feedback saved = feedbackRepository.save(feedback);

        return new FeedbackDto(saved);
    }

    public List<FeedbackDto> getMyFeedback(Long userId) {
        return feedbackRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(FeedbackDto::new)
                .collect(Collectors.toList());
    }

    public List<FeedbackDto> getSiteFeedback(Long siteId) {
        return feedbackRepository.findByHeritageSiteIdOrderByCreatedAtDesc(siteId).stream()
                .map(FeedbackDto::new)
                .collect(Collectors.toList());
    }

    public List<FeedbackDto> getAllFeedbackForAdmin(Long siteId, Integer rating) {
        if (siteId == null && rating == null) {
            return feedbackRepository.findAllByOrderByCreatedAtDesc().stream()
                    .map(FeedbackDto::new)
                    .collect(Collectors.toList());
        }

        return feedbackRepository.findWithFilters(siteId, rating).stream()
                .map(FeedbackDto::new)
                .collect(Collectors.toList());
    }
}

