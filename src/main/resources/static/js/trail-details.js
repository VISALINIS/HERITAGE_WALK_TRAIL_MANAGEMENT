/**
 * Heritage Walk - Curated Trail Details & Stop Timeline
 */

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const trailId = urlParams.get('id');

    if (!trailId) {
        window.location.href = '/pages/trails.html';
        return;
    }

    loadTrailDetails(trailId);
});

/**
 * Loads and displays trail metadata and ordered stops
 */
async function loadTrailDetails(trailId) {
    try {
        const response = await fetch(`/api/trails/${trailId}`);
        const result = await response.json();

        if (response.ok && result.success) {
            const trail = result.data;
            document.title = `${trail.name} | Heritage Walk Trail`;

            document.getElementById('trail-name').textContent = trail.name;
            document.getElementById('trail-description').textContent = trail.description;
            document.getElementById('trail-distance').textContent = `${trail.distance} km`;
            document.getElementById('trail-duration').textContent = `${trail.estimatedDuration} mins`;

            const diffEl = document.getElementById('trail-difficulty-badge');
            if (diffEl) {
                diffEl.className = `difficulty-${trail.difficulty}`;
                diffEl.textContent = trail.difficulty;
            }

            document.getElementById('trail-start').textContent = trail.startingPoint;
            document.getElementById('trail-end').textContent = trail.endingPoint;

            const heroImg = document.getElementById('trail-hero-img');
            if (heroImg) {
                heroImg.src = trail.imageUrl || 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80';
                heroImg.alt = trail.name;
            }

            // Render stops timeline
            renderTrailStops(trail.stops || []);
        } else {
            alert('Walking trail not found.');
            window.location.href = '/pages/trails.html';
        }
    } catch (err) {
        console.error('Error loading trail details:', err);
    }
}

/**
 * Renders ordered trail stops in a visual sequential timeline
 */
function renderTrailStops(stops) {
    const container = document.getElementById('trail-stops-container');
    if (!container) return;

    if (stops.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4 text-muted">
                <i class="bi bi-info-circle fs-3"></i>
                <p class="mt-2">No stops have been assigned to this trail yet.</p>
            </div>
        `;
        return;
    }

    // Sort by stopOrder
    stops.sort((a, b) => a.stopOrder - b.stopOrder);

    container.innerHTML = stops.map((stop, index) => {
        const isLast = index === stops.length - 1;
        const fallbackImg = 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=400&q=80';
        const imgUrl = stop.heritageSiteImageUrl || fallbackImg;

        return `
            <div class="timeline-stop">
                <div class="stop-marker">${stop.stopOrder}</div>
                <div class="card border-0 shadow-sm rounded-3 overflow-hidden">
                    <div class="row g-0 align-items-center">
                        <div class="col-md-3">
                            <img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(stop.heritageSiteName)}" class="img-fluid h-100 w-100" style="object-fit: cover; min-height: 140px;" onerror="this.src='${fallbackImg}'">
                        </div>
                        <div class="col-md-9">
                            <div class="card-body py-3">
                                <div class="d-flex justify-content-between align-items-center mb-1">
                                    <span class="badge bg-light text-dark border">
                                        <i class="bi bi-geo-alt-fill text-danger me-1"></i>${escapeHtml(stop.heritageSiteLocation || 'Site Location')}
                                    </span>
                                    <span class="badge bg-warning bg-opacity-25 text-dark">
                                        ${escapeHtml(stop.heritageSitePeriod || 'Historical Site')}
                                    </span>
                                </div>
                                <h5 class="card-title fw-bold mb-1">${escapeHtml(stop.heritageSiteName)}</h5>
                                <p class="card-text text-muted small mb-2">
                                    Architectural Style: <span class="fw-semibold text-secondary">${escapeHtml(stop.heritageSiteStyle || 'Heritage Architecture')}</span>
                                </p>
                                <a href="/pages/heritage-details.html?id=${stop.heritageSiteId}" class="btn btn-outline-dark btn-sm rounded-pill px-3">
                                    <i class="bi bi-eye me-1"></i>Explore Site Details
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function escapeHtml(text) {
    if (!text) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.toString().replace(/[&<>"']/g, m => map[m]);
}
