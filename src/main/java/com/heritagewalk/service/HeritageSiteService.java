package com.heritagewalk.service;

import com.heritagewalk.dto.HeritageSiteDto;
import com.heritagewalk.exception.ResourceNotFoundException;
import com.heritagewalk.model.HeritageSite;
import com.heritagewalk.repository.FeedbackRepository;
import com.heritagewalk.repository.HeritageSiteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class HeritageSiteService {

    @Autowired
    private HeritageSiteRepository heritageSiteRepository;

    @Autowired
    private FeedbackRepository feedbackRepository;

    public List<HeritageSiteDto> getAllSites(String search, String location, String period) {
        String s = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        String l = (location != null && !location.trim().isEmpty()) ? location.trim() : null;
        String p = (period != null && !period.trim().isEmpty()) ? period.trim() : null;

        return heritageSiteRepository.searchSites(s, l, p).stream()
                .map(this::enrichWithFeedbackSummary)
                .collect(Collectors.toList());
    }

    public List<HeritageSiteDto> getFeaturedSites() {
        return heritageSiteRepository.findTop6ByOrderByCreatedAtDesc().stream()
                .map(this::enrichWithFeedbackSummary)
                .collect(Collectors.toList());
    }

    public HeritageSiteDto getSiteById(Long id) {
        HeritageSite site = heritageSiteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Heritage site not found with ID: " + id));
        return enrichWithFeedbackSummary(site);
    }

    public List<String> getDistinctLocations() {
        return heritageSiteRepository.findDistinctLocations();
    }

    public List<String> getDistinctPeriods() {
        return heritageSiteRepository.findDistinctPeriods();
    }

    @Transactional
    public HeritageSiteDto createSite(HeritageSiteDto dto) {
        HeritageSite site = new HeritageSite();
        copyDtoToEntity(dto, site);
        HeritageSite saved = heritageSiteRepository.save(site);
        return new HeritageSiteDto(saved);
    }

    @Transactional
    public HeritageSiteDto updateSite(Long id, HeritageSiteDto dto) {
        HeritageSite site = heritageSiteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Heritage site not found with ID: " + id));

        copyDtoToEntity(dto, site);
        HeritageSite updated = heritageSiteRepository.save(site);
        return enrichWithFeedbackSummary(updated);
    }

    @Transactional
    public void deleteSite(Long id) {
        if (!heritageSiteRepository.existsById(id)) {
            throw new ResourceNotFoundException("Heritage site not found with ID: " + id);
        }
        heritageSiteRepository.deleteById(id);
    }

    private HeritageSiteDto enrichWithFeedbackSummary(HeritageSite site) {
        HeritageSiteDto dto = new HeritageSiteDto(site);
        var feedbackList = feedbackRepository.findByHeritageSiteIdOrderByCreatedAtDesc(site.getId());
        dto.setFeedbackCount((long) feedbackList.size());
        if (!feedbackList.isEmpty()) {
            double avg = feedbackList.stream()
                    .mapToInt(f -> f.getRating())
                    .average()
                    .orElse(0.0);
            dto.setAverageRating(Math.round(avg * 10.0) / 10.0);
        } else {
            dto.setAverageRating(0.0);
        }
        return dto;
    }

    private void copyDtoToEntity(HeritageSiteDto dto, HeritageSite site) {
        site.setName(dto.getName().trim());
        site.setLocation(dto.getLocation().trim());
        site.setDescription(dto.getDescription().trim());
        site.setHistoricalPeriod(dto.getHistoricalPeriod() != null ? dto.getHistoricalPeriod().trim() : null);
        site.setArchitecturalStyle(dto.getArchitecturalStyle() != null ? dto.getArchitecturalStyle().trim() : null);
        site.setCulturalSignificance(dto.getCulturalSignificance() != null ? dto.getCulturalSignificance().trim() : null);
        site.setImageUrl(dto.getImageUrl() != null ? dto.getImageUrl().trim() : null);
        site.setLatitude(dto.getLatitude());
        site.setLongitude(dto.getLongitude());
    }
}

