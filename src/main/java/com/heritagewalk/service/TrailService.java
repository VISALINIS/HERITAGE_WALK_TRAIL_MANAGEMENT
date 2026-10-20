package com.heritagewalk.service;

import com.heritagewalk.dto.TrailDto;
import com.heritagewalk.dto.TrailStopDto;
import com.heritagewalk.exception.BadRequestException;
import com.heritagewalk.exception.ResourceNotFoundException;
import com.heritagewalk.model.HeritageSite;
import com.heritagewalk.model.Trail;
import com.heritagewalk.model.TrailStop;
import com.heritagewalk.repository.HeritageSiteRepository;
import com.heritagewalk.repository.TrailRepository;
import com.heritagewalk.repository.TrailStopRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TrailService {

    @Autowired
    private TrailRepository trailRepository;

    @Autowired
    private TrailStopRepository trailStopRepository;

    @Autowired
    private HeritageSiteRepository heritageSiteRepository;

    public List<TrailDto> getAllTrails() {
        List<Trail> trails = trailRepository.findAll();
        return trails.stream().map(t -> {
            List<TrailStop> stops = trailStopRepository.findByTrailIdOrderByStopOrderAsc(t.getId());
            return new TrailDto(t, stops);
        }).collect(Collectors.toList());
    }

    public TrailDto getTrailById(Long id) {
        Trail trail = trailRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trail not found with ID: " + id));
        List<TrailStop> stops = trailStopRepository.findByTrailIdOrderByStopOrderAsc(id);
        return new TrailDto(trail, stops);
    }

    @Transactional
    public TrailDto createTrail(TrailDto dto) {
        Trail trail = new Trail();
        copyDtoToEntity(dto, trail);
        Trail saved = trailRepository.save(trail);
        return new TrailDto(saved);
    }

    @Transactional
    public TrailDto updateTrail(Long id, TrailDto dto) {
        Trail trail = trailRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trail not found with ID: " + id));

        copyDtoToEntity(dto, trail);
        Trail updated = trailRepository.save(trail);
        return getTrailById(updated.getId());
    }

    @Transactional
    public void deleteTrail(Long id) {
        if (!trailRepository.existsById(id)) {
            throw new ResourceNotFoundException("Trail not found with ID: " + id);
        }
        trailRepository.deleteById(id);
    }

    @Transactional
    public TrailDto addStop(Long trailId, Long heritageSiteId, Integer stopOrder) {
        Trail trail = trailRepository.findById(trailId)
                .orElseThrow(() -> new ResourceNotFoundException("Trail not found with ID: " + trailId));

        HeritageSite site = heritageSiteRepository.findById(heritageSiteId)
                .orElseThrow(() -> new ResourceNotFoundException("Heritage site not found with ID: " + heritageSiteId));

        if (trailStopRepository.existsByTrailIdAndHeritageSiteId(trailId, heritageSiteId)) {
            throw new BadRequestException("This heritage site is already a stop on this trail");
        }

        List<TrailStop> existing = trailStopRepository.findByTrailIdOrderByStopOrderAsc(trailId);
        int order = (stopOrder != null && stopOrder > 0) ? stopOrder : (existing.size() + 1);

        TrailStop stop = new TrailStop(trail, site, order);
        trailStopRepository.save(stop);
        trailStopRepository.flush();

        return getTrailById(trailId);
    }

    @Transactional
    public TrailDto removeStop(Long trailId, Long stopId) {
        if (!trailRepository.existsById(trailId)) {
            throw new ResourceNotFoundException("Trail not found with ID: " + trailId);
        }

        TrailStop stop = trailStopRepository.findByTrailIdAndId(trailId, stopId)
                .orElseThrow(() -> new ResourceNotFoundException("Trail stop not found with ID: " + stopId));

        trailStopRepository.delete(stop);
        trailStopRepository.flush();

        // Normalize remaining stop orders
        List<TrailStop> remaining = trailStopRepository.findByTrailIdOrderByStopOrderAsc(trailId);
        for (int i = 0; i < remaining.size(); i++) {
            remaining.get(i).setStopOrder(i + 1);
            trailStopRepository.save(remaining.get(i));
        }
        trailStopRepository.flush();

        return getTrailById(trailId);
    }

    @Transactional
    public TrailDto reorderStops(Long trailId, List<Long> stopIds) {
        if (!trailRepository.existsById(trailId)) {
            throw new ResourceNotFoundException("Trail not found with ID: " + trailId);
        }

        for (int i = 0; i < stopIds.size(); i++) {
            Long stopId = stopIds.get(i);
            TrailStop stop = trailStopRepository.findByTrailIdAndId(trailId, stopId)
                    .orElseThrow(() -> new ResourceNotFoundException("Trail stop not found with ID: " + stopId));
            stop.setStopOrder(i + 1);
            trailStopRepository.save(stop);
        }
        trailStopRepository.flush();

        return getTrailById(trailId);
    }

    private void copyDtoToEntity(TrailDto dto, Trail trail) {
        trail.setName(dto.getName().trim());
        trail.setDescription(dto.getDescription().trim());
        trail.setStartingPoint(dto.getStartingPoint().trim());
        trail.setEndingPoint(dto.getEndingPoint().trim());
        trail.setDistance(dto.getDistance());
        trail.setEstimatedDuration(dto.getEstimatedDuration());
        trail.setDifficulty(dto.getDifficulty());
        trail.setImageUrl(dto.getImageUrl() != null ? dto.getImageUrl().trim() : null);
    }
}

