/**
 * Heritage Walk - Heritage Sites Listing & Filtering
 */

document.addEventListener('DOMContentLoaded', () => {
    loadFilterMetadata();
    loadHeritageSites();

    const searchForm = document.getElementById('heritage-filter-form');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            loadHeritageSites();
        });
    }

    const resetBtn = document.getElementById('btn-reset-filters');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            document.getElementById('search-input').value = '';
            document.getElementById('location-filter').value = '';
            document.getElementById('period-filter').value = '';
            loadHeritageSites();
        });
    }
});

/**
 * Loads distinct locations and historical periods to populate filter dropdowns
 */
async function loadFilterMetadata() {
    try {
        const [locRes, perRes] = await Promise.all([
            fetch('/api/heritage/meta/locations'),
            fetch('/api/heritage/meta/periods')
        ]);
        const locData = await locRes.json();
        const perData = await perRes.json();

        const locSelect = document.getElementById('location-filter');
        if (locSelect && locData.success) {
            locData.data.forEach(loc => {
                const opt = document.createElement('option');
                opt.value = loc;
                opt.textContent = loc;
                locSelect.appendChild(opt);
            });
        }

        const perSelect = document.getElementById('period-filter');
        if (perSelect && perData.success) {
            perData.data.forEach(per => {
                const opt = document.createElement('option');
                opt.value = per;
                opt.textContent = per;
                perSelect.appendChild(opt);
            });
        }
    } catch (err) {
        console.warn('Could not load filter metadata:', err);
    }
}

/**
 * Fetches and renders heritage sites based on current search & filter parameters
 */
async function loadHeritageSites() {
    const grid = document.getElementById('heritage-grid');
    const countBadge = document.getElementById('results-count');
    if (!grid) return;

    grid.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-warning" role="status">
                <span class="visually-hidden">Loading sites...</span>
            </div>
            <p class="text-muted mt-2">Discovering heritage sites...</p>
        </div>
    `;

    const search = document.getElementById('search-input')?.value || '';
    const location = document.getElementById('location-filter')?.value || '';
    const period = document.getElementById('period-filter')?.value || '';

    const params = new URLSearchParams();
    if (search.trim()) params.append('search', search.trim());
    if (location.trim()) params.append('location', location.trim());
    if (period.trim()) params.append('period', period.trim());

    try {
        const response = await fetch(`/api/heritage?${params.toString()}`);
        const result = await response.json();

        if (response.ok && result.success) {
            const sites = result.data;
            if (countBadge) countBadge.textContent = `${sites.length} Sites Found`;

            if (sites.length === 0) {
                grid.innerHTML = `
                    <div class="col-12 text-center py-5">
                        <i class="bi bi-search fs-1 text-muted"></i>
                        <h4 class="mt-3 text-secondary">No heritage sites found</h4>
                        <p class="text-muted">Try adjusting your keywords or clearing the selected filters.</p>
                    </div>
                `;
                return;
            }

            grid.innerHTML = sites.map(site => renderSiteCard(site)).join('');
        } else {
            grid.innerHTML = `
                <div class="col-12 text-center py-5 text-danger">
                    <i class="bi bi-exclamation-triangle fs-2"></i>
                    <p class="mt-2">Failed to load heritage sites. Please refresh the page.</p>
                </div>
            `;
        }
    } catch (err) {
        grid.innerHTML = `
            <div class="col-12 text-center py-5 text-danger">
                <i class="bi bi-wifi-off fs-2"></i>
                <p class="mt-2">Network error. Please ensure the server is running.</p>
            </div>
        `;
    }
}

/**
 * Generates HTML markup for a single Heritage Site card
 */
function renderSiteCard(site) {
    const stars = renderStarRating(site.averageRating || 0);
    const fallbackImg = 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80';
    const imgUrl = site.imageUrl || fallbackImg;

    return `
        <div class="col-md-6 col-lg-4">
            <div class="heritage-card">
                <div class="heritage-card-img-wrap">
                    <img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(site.name)}" class="heritage-card-img" onerror="this.src='${fallbackImg}'">
                    <span class="position-absolute top-0 end-0 m-3 badge bg-dark bg-opacity-75 text-white">
                        <i class="bi bi-geo-alt-fill text-warning me-1"></i>${escapeHtml(site.location)}
                    </span>
                </div>
                <div class="heritage-card-body">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="period-badge">${escapeHtml(site.historicalPeriod || 'Historic Period')}</span>
                        <div class="stars-display fs-6">
                            ${stars}
                            <small class="text-muted ms-1">(${site.feedbackCount || 0})</small>
                        </div>
                    </div>
                    <h5 class="heritage-card-title">${escapeHtml(site.name)}</h5>
                    <p class="text-muted small mb-3 text-truncate-3" style="min-height: 48px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                        ${escapeHtml(site.description)}
                    </p>
                    <div class="mt-auto pt-2 border-top d-flex justify-content-between align-items-center">
                        <span class="small text-muted"><i class="bi bi-bank me-1"></i>${escapeHtml(site.architecturalStyle || 'Classical')}</span>
                        <a href="/pages/heritage-details.html?id=${site.id}" class="btn btn-outline-dark btn-sm rounded-pill px-3">
                            View Details <i class="bi bi-arrow-right ms-1"></i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderStarRating(rating) {
    const rounded = Math.round(rating);
    let html = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rounded) {
            html += '<i class="bi bi-star-fill text-warning"></i>';
        } else {
            html += '<i class="bi bi-star text-muted"></i>';
        }
    }
    return html;
}

function escapeHtml(text) {
    if (!text) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.toString().replace(/[&<>"']/g, m => map[m]);
}
