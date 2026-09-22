/**
 * Heritage Walk - Heritage Site Details & Review Management
 */

let currentSiteId = null;

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    currentSiteId = urlParams.get('id');

    if (!currentSiteId) {
        window.location.href = '/pages/heritage.html';
        return;
    }

    loadSiteDetails(currentSiteId);
    loadSiteReviews(currentSiteId);
    initFeedbackForm(currentSiteId);
});

/**
 * Loads and renders full site information
 */
async function loadSiteDetails(id) {
    try {
        const response = await fetch(`/api/heritage/${id}`);
        const result = await response.json();

        if (response.ok && result.success) {
            const site = result.data;
            document.title = `${site.name} | Heritage Walk`;

            document.getElementById('site-name').textContent = site.name;
            document.getElementById('site-location-text').textContent = site.location;
            document.getElementById('site-period-badge').textContent = site.historicalPeriod || 'Historic Period';
            document.getElementById('site-style-badge').textContent = site.architecturalStyle || 'Architectural Heritage';
            document.getElementById('site-description').textContent = site.description;

            const significanceEl = document.getElementById('site-significance');
            if (significanceEl) {
                significanceEl.textContent = site.culturalSignificance || 'Protected cultural monument of immense historical importance.';
            }

            const imgEl = document.getElementById('site-hero-img');
            if (imgEl) {
                imgEl.src = site.imageUrl || 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80';
                imgEl.alt = site.name;
            }

            // Coordinates
            const coordEl = document.getElementById('site-coordinates');
            if (coordEl && site.latitude && site.longitude) {
                coordEl.innerHTML = `
                    <span class="badge bg-light text-dark border p-2">
                        <i class="bi bi-geo text-danger me-1"></i>Lat: ${site.latitude.toFixed(4)}, Long: ${site.longitude.toFixed(4)}
                    </span>
                    <a href="https://www.google.com/maps?q=${site.latitude},${site.longitude}" target="_blank" class="btn btn-sm btn-outline-primary ms-2">
                        <i class="bi bi-box-arrow-up-right me-1"></i>View in Maps
                    </a>
                `;
            }

            // Overall rating badge
            const ratingScoreEl = document.getElementById('site-avg-score');
            if (ratingScoreEl) {
                ratingScoreEl.textContent = (site.averageRating || 0.0).toFixed(1);
            }
            const ratingStarsEl = document.getElementById('site-avg-stars');
            if (ratingStarsEl) {
                ratingStarsEl.innerHTML = renderStars(site.averageRating || 0);
            }
            const ratingCountEl = document.getElementById('site-review-count');
            if (ratingCountEl) {
                ratingCountEl.textContent = `Based on ${site.feedbackCount || 0} reviews`;
            }
        } else {
            alert('Heritage site not found.');
            window.location.href = '/pages/heritage.html';
        }
    } catch (err) {
        console.error('Failed to load site details:', err);
    }
}

/**
 * Loads visitor reviews for this heritage site
 */
async function loadSiteReviews(siteId) {
    const listContainer = document.getElementById('reviews-list');
    if (!listContainer) return;

    try {
        const response = await fetch(`/api/feedback/site/${siteId}`);
        const result = await response.json();

        if (response.ok && result.success) {
            const reviews = result.data;
            if (reviews.length === 0) {
                listContainer.innerHTML = `
                    <div class="text-center py-4 text-muted">
                        <i class="bi bi-chat-heart fs-1 text-warning"></i>
                        <p class="mt-2">No reviews yet. Be the first visitor to share your experience!</p>
                    </div>
                `;
                return;
            }

            listContainer.innerHTML = reviews.map(r => `
                <div class="p-3 mb-3 border rounded-3 bg-white shadow-sm">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <div class="d-flex align-items-center gap-2">
                            <i class="bi bi-person-circle fs-4 text-secondary"></i>
                            <div>
                                <h6 class="mb-0 fw-bold">${escapeHtml(r.userName || 'Anonymous Visitor')}</h6>
                                <small class="text-muted">${formatDate(r.createdAt)}</small>
                            </div>
                        </div>
                        <div class="stars-display">
                            ${renderStars(r.rating)}
                        </div>
                    </div>
                    <p class="mb-0 text-secondary" style="font-size: 0.95rem;">${escapeHtml(r.comment)}</p>
                </div>
            `).join('');
        }
    } catch (err) {
        console.error('Failed to load reviews:', err);
    }
}

/**
 * Attaches submit listener to the feedback modal form
 */
function initFeedbackForm(siteId) {
    const form = document.getElementById('feedback-modal-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Check selected star rating
        const ratingInput = form.querySelector('input[name="rating"]:checked');
        const comment = document.getElementById('feedback-comment').value.trim();
        const alertBox = document.getElementById('modal-feedback-alert');
        const submitBtn = form.querySelector('button[type="submit"]');

        if (!ratingInput) {
            showModalAlert(alertBox, 'Please select a star rating between 1 and 5.', 'warning');
            return;
        }

        if (!comment) {
            showModalAlert(alertBox, 'Please write your feedback comments.', 'warning');
            return;
        }

        const rating = parseInt(ratingInput.value, 10);

        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Submitting...';

            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    heritageSiteId: parseInt(siteId, 10),
                    rating: rating,
                    comment: comment
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                showModalAlert(alertBox, 'Thank you! Your feedback has been recorded.', 'success');
                setTimeout(() => {
                    const modalEl = document.getElementById('feedbackModal');
                    const modalInstance = bootstrap.Modal.getInstance(modalEl);
                    if (modalInstance) modalInstance.hide();

                    form.reset();
                    loadSiteDetails(siteId);
                    loadSiteReviews(siteId);
                }, 1000);
            } else {
                if (response.status === 401) {
                    showModalAlert(alertBox, 'You must be logged in as a visitor to submit feedback. <a href="/pages/login.html" class="alert-link">Click here to Login</a>', 'danger');
                } else {
                    showModalAlert(alertBox, result.message || 'Could not submit feedback.', 'danger');
                }
            }
        } catch (err) {
            showModalAlert(alertBox, 'Network error. Please try again.', 'danger');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="bi bi-send me-1"></i>Submit Feedback';
        }
    });
}

function showModalAlert(box, msg, type) {
    if (!box) return;
    box.className = `alert alert-${type} alert-dismissible fade show`;
    box.innerHTML = msg;
    box.classList.remove('d-none');
}

function renderStars(rating) {
    const rounded = Math.round(rating);
    let html = '';
    for (let i = 1; i <= 5; i++) {
        html += i <= rounded ? '<i class="bi bi-star-fill text-warning"></i>' : '<i class="bi bi-star text-muted"></i>';
    }
    return html;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
        return dateStr;
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.toString().replace(/[&<>"']/g, m => map[m]);
}
