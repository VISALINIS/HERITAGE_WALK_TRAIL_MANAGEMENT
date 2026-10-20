package com.heritagewalk.service;

import com.heritagewalk.dto.HeritageSiteDto;
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

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class HeritageSiteServiceTest {

    @Mock
    private HeritageSiteRepository heritageSiteRepository;

    @Mock
    private FeedbackRepository feedbackRepository;

    @InjectMocks
    private HeritageSiteService heritageSiteService;

    @Test
    void testGetAllSites_EnrichesWithRatings() {
        HeritageSite site = new HeritageSite("Taj Mahal", "Agra", "Mausoleum", "Mughal", "Mughal", "Sig", "img", 27.1, 78.0);
        site.setId(1L);

        User user = new User("Priya", "priya@example.com", "pwd", Role.VISITOR);
        Feedback f1 = new Feedback(user, site, 5, "Amazing");
        Feedback f2 = new Feedback(user, site, 4, "Good");

        when(heritageSiteRepository.searchSites(null, null, null)).thenReturn(List.of(site));
        when(feedbackRepository.findByHeritageSiteIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(f1, f2));

        List<HeritageSiteDto> results = heritageSiteService.getAllSites(null, null, null);

        assertNotNull(results);
        assertEquals(1, results.size());
        HeritageSiteDto dto = results.get(0);
        assertEquals("Taj Mahal", dto.getName());
        assertEquals(2L, dto.getFeedbackCount());
        assertEquals(4.5, dto.getAverageRating());
    }

    @Test
    void testGetSiteById_NotFound() {
        when(heritageSiteRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> heritageSiteService.getSiteById(999L));
    }

    @Test
    void testCreateSite_Success() {
        HeritageSiteDto req = new HeritageSiteDto();
        req.setName("Qutub Minar");
        req.setLocation("Delhi");
        req.setDescription("Tall minaret");
        req.setLatitude(28.5);
        req.setLongitude(77.2);

        when(heritageSiteRepository.save(any(HeritageSite.class))).thenAnswer(inv -> {
            HeritageSite s = inv.getArgument(0);
            s.setId(2L);
            return s;
        });

        HeritageSiteDto saved = heritageSiteService.createSite(req);

        assertNotNull(saved);
        assertEquals("Qutub Minar", saved.getName());
        assertEquals(28.5, saved.getLatitude());
        verify(heritageSiteRepository).save(any(HeritageSite.class));
    }

    @Test
    void testDeleteSite_NotFound() {
        when(heritageSiteRepository.existsById(500L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> heritageSiteService.deleteSite(500L));
        verify(heritageSiteRepository, never()).deleteById(any());
    }
}

