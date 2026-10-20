package com.heritagewalk.service;

import com.heritagewalk.dto.TrailDto;
import com.heritagewalk.exception.BadRequestException;
import com.heritagewalk.exception.ResourceNotFoundException;
import com.heritagewalk.model.Difficulty;
import com.heritagewalk.model.HeritageSite;
import com.heritagewalk.model.Trail;
import com.heritagewalk.model.TrailStop;
import com.heritagewalk.repository.HeritageSiteRepository;
import com.heritagewalk.repository.TrailRepository;
import com.heritagewalk.repository.TrailStopRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TrailServiceTest {

    @Mock
    private TrailRepository trailRepository;

    @Mock
    private TrailStopRepository trailStopRepository;

    @Mock
    private HeritageSiteRepository heritageSiteRepository;

    @InjectMocks
    private TrailService trailService;

    @Test
    void testCreateTrail_Success() {
        TrailDto req = new TrailDto();
        req.setName("Delhi Mughal Trail");
        req.setDescription("Walk through Old Delhi");
        req.setStartingPoint("Red Fort");
        req.setEndingPoint("Jama Masjid");
        req.setDistance(5.2);
        req.setEstimatedDuration(90);
        req.setDifficulty(Difficulty.EASY);

        when(trailRepository.save(any(Trail.class))).thenAnswer(inv -> {
            Trail t = inv.getArgument(0);
            t.setId(1L);
            return t;
        });

        TrailDto saved = trailService.createTrail(req);

        assertNotNull(saved);
        assertEquals("Delhi Mughal Trail", saved.getName());
        assertEquals(5.2, saved.getDistance());
        assertEquals(Difficulty.EASY, saved.getDifficulty());
        verify(trailRepository).save(any(Trail.class));
    }

    @Test
    void testAddStop_DuplicateSiteRejection() {
        Trail trail = new Trail("Trail", "Desc", "Start", "End", 4.0, 60, Difficulty.EASY, null);
        trail.setId(1L);

        HeritageSite site = new HeritageSite("Site", "Loc", "Desc", "Period", "Style", "Sig", null, 10.0, 20.0);
        site.setId(2L);

        when(trailRepository.findById(1L)).thenReturn(Optional.of(trail));
        when(heritageSiteRepository.findById(2L)).thenReturn(Optional.of(site));
        when(trailStopRepository.existsByTrailIdAndHeritageSiteId(1L, 2L)).thenReturn(true);

        assertThrows(BadRequestException.class, () -> trailService.addStop(1L, 2L, 1));
        verify(trailStopRepository, never()).save(any());
    }

    @Test
    void testGetTrailById_NotFound() {
        when(trailRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> trailService.getTrailById(999L));
    }
}

