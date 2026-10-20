/**
 * Heritage Walk - Curated Trails Listing & Filtering
 */

let allTrails = [];

document.addEventListener('DOMContentLoaded', () => {
    loadTrails();

    const difficultyFilter = document.getElementById('trail-difficulty-filter');
    if (difficultyFilter) {
        difficultyFilter.addEventListener('change', (e) => {
            const selected = e.target.value;
            filterTrails(selected);
        });
    }
});

/**
 * Fetches all curated trails from the backend
 */
async function loadTrails() {
    const grid = document.getElementById('trails-grid');
    if (!grid) return;

    grid.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-warning" role="status">
                <span class="visually-hidden">Loading trails...</span>
            </div>
            <p class="text-muted mt-2">Discovering heritage walking trails...</p>
        </div>
    `;

    try {
        const response = await fetch('/api/trails');
        const result = await response.json();

        if (response.ok && result.success) {
            allTrails = result.data;
            filterTrails('');
        } else {
            grid.innerHTML = `
                <div class="col-12 text-center py-5 text-danger">
                    <i class="bi bi-exclamation-triangle fs-2"></i>
                    <p class="mt-2">Failed to load trails. Please refresh.</p>
                </div>
            `;
        }
    } catch (err) {
        grid.innerHTML = `
            <div class="col-12 text-center py-5 text-danger">
                <i class="bi bi-wifi-off fs-2"></i>
                <p class="mt-2">Network error. Unable to load walking trails.</p>
            </div>
        `;
    }
}

/**
 * Filters cached trails by difficulty level
 */
function filterTrails(difficulty) {
    const grid = document.getElementById('trails-grid');
    const countBadge = document.getElementById('trails-count');
    if (!grid) return;

    let filtered = allTrails;
    if (difficulty) {
        filtered = allTrails.filter(t => t.difficulty === difficulty);
    }

    if (countBadge) countBadge.textContent = `${filtered.length} Trails Found`;

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-compass fs-1 text-muted"></i>
                <h4 class="mt-3 text-secondary">No trails found for this difficulty</h4>
                <p class="text-muted">Please choose a different difficulty level.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(trail => renderTrailCard(trail)).join('');
}

/**
 * Generates HTML markup for a single Trail card
 */
function renderTrailCard(trail) {
    const fallbackImg = 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80';
    const imgUrl = trail.imageUrl || fallbackImg;
    const stopsCount = trail.stops ? trail.stops.length : 0;

    return `
        <div class="col-md-6 col-lg-4">
            <div class="heritage-card">
                <div class="heritage-card-img-wrap">
                    <img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(trail.name)}" class="heritage-card-img" onerror="this.src='${fallbackImg}'">
                    <span class="position-absolute top-0 start-0 m-3 difficulty-${escapeHtml(trail.difficulty)} shadow-sm">
                        ${escapeHtml(trail.difficulty)}
                    </span>
                    <span class="position-absolute bottom-0 end-0 m-3 badge bg-dark bg-opacity-75 text-white">
                        <i class="bi bi-flag-fill text-warning me-1"></i>${stopsCount} Stops
                    </span>
                </div>
                <div class="heritage-card-body">
                    <h5 class="heritage-card-title mb-2">${escapeHtml(trail.name)}</h5>
                    <p class="text-muted small mb-3" style="min-height: 48px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                        ${escapeHtml(trail.description)}
                    </p>

                    <div class="bg-light p-2 rounded-3 small mb-3 border">
                        <div class="d-flex justify-content-between mb-1">
                            <span class="text-muted"><i class="bi bi-pin-map text-success me-1"></i>Start:</span>
                            <span class="fw-semibold text-truncate ms-2" style="max-width: 170px;">${escapeHtml(trail.startingPoint)}</span>
                        </div>
                        <div class="d-flex justify-content-between">
                            <span class="text-muted"><i class="bi bi-geo-alt text-danger me-1"></i>End:</span>
                            <span class="fw-semibold text-truncate ms-2" style="max-width: 170px;">${escapeHtml(trail.endingPoint)}</span>
                        </div>
                    </div>

                    <div class="mt-auto pt-2 border-top d-flex justify-content-between align-items-center">
                        <div class="small text-muted">
                            <span class="me-2"><i class="bi bi-signpost-2 text-primary me-1"></i>${trail.distance} km</span>
                            <span><i class="bi bi-clock text-warning me-1"></i>${trail.estimatedDuration} mins</span>
                        </div>
                        <a href="/pages/trail-details.html?id=${trail.id}" class="btn btn-heritage-primary btn-sm rounded-pill px-3">
                            Explore Trail <i class="bi bi-arrow-right ms-1"></i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function escapeHtml(text) {
    if (!text) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.toString().replace(/[&<>"']/g, m => map[m]);
}
