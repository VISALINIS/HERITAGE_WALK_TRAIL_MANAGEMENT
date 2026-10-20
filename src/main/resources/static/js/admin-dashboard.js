/**
 * Heritage Walk - Admin Dashboard Analytics
 */

document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth();
    loadDashboardStats();
    loadRatingDistribution();
    loadSiteRatingsSummary();
});

/**
 * Ensures user is authenticated as an Admin
 */
async function checkAdminAuth() {
    try {
        const response = await fetch('/api/auth/session');
        const result = await response.json();
        if (!result.success || !result.data || result.data.role !== 'ADMIN') {
            window.location.href = '/pages/login.html';
            return;
        }

        const adminNameEl = document.getElementById('admin-display-name');
        if (adminNameEl) {
            adminNameEl.textContent = result.data.name;
        }
    } catch (err) {
        window.location.href = '/pages/login.html';
    }
}

/**
 * Loads high-level dashboard metrics
 */
async function loadDashboardStats() {
    try {
        const response = await fetch('/api/admin/analytics/stats');
        const result = await response.json();

        if (response.ok && result.success) {
            const stats = result.data;
            document.getElementById('stat-total-sites').textContent = stats.totalHeritageSites;
            document.getElementById('stat-total-trails').textContent = stats.totalTrails;
            document.getElementById('stat-total-visitors').textContent = stats.totalVisitors;
            document.getElementById('stat-total-feedback').textContent = stats.totalFeedback;
            document.getElementById('stat-avg-rating').textContent = `${(stats.averageRating || 0).toFixed(1)} / 5.0`;
        }
    } catch (err) {
        console.error('Failed to load dashboard statistics:', err);
    }
}

/**
 * Loads star rating distribution and dynamically renders progress bars
 */
async function loadRatingDistribution() {
    const container = document.getElementById('rating-distribution-bars');
    const totalReviewsEl = document.getElementById('dist-total-reviews');
    const avgScoreEl = document.getElementById('dist-avg-score');
    if (!container) return;

    try {
        const response = await fetch('/api/admin/analytics/rating-distribution');
        const result = await response.json();

        if (response.ok && result.success) {
            const dist = result.data;
            const total = dist.total || 0;

            if (totalReviewsEl) totalReviewsEl.textContent = `${total} Total Ratings`;
            if (avgScoreEl) avgScoreEl.textContent = `${(dist.average || 0).toFixed(1)} / 5.0`;

            const calcPct = (cnt) => total > 0 ? Math.round((cnt / total) * 100) : 0;

            const stars = [
                { label: '5 ⭐', count: dist.star5, pct: calcPct(dist.star5) },
                { label: '4 ⭐', count: dist.star4, pct: calcPct(dist.star4) },
                { label: '3 ⭐', count: dist.star3, pct: calcPct(dist.star3) },
                { label: '2 ⭐', count: dist.star2, pct: calcPct(dist.star2) },
                { label: '1 ⭐', count: dist.star1, pct: calcPct(dist.star1) }
            ];

            container.innerHTML = stars.map(s => `
                <div class="rating-bar-row">
                    <div class="rating-bar-label">${s.label}</div>
                    <div class="rating-bar-track">
                        <div class="rating-bar-fill" style="width: ${s.pct}%"></div>
                    </div>
                    <div class="rating-bar-count">${s.count} <span class="text-muted small">(${s.pct}%)</span></div>
                </div>
            `).join('');
        }
    } catch (err) {
        console.error('Failed to load rating distribution:', err);
    }
}

/**
 * Loads heritage site performance table
 */
async function loadSiteRatingsSummary() {
    const tableBody = document.getElementById('site-ratings-table-body');
    if (!tableBody) return;

    try {
        const response = await fetch('/api/admin/analytics/site-ratings');
        const result = await response.json();

        if (response.ok && result.success) {
            const list = result.data;

            if (list.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="4" class="text-center py-3 text-muted">No heritage sites registered.</td>
                    </tr>
                `;
                return;
            }

            tableBody.innerHTML = list.map(item => `
                <tr>
                    <td class="fw-semibold">
                        <a href="/pages/heritage-details.html?id=${item.heritageSiteId}" target="_blank" class="text-dark text-decoration-none">
                            ${escapeHtml(item.heritageSiteName)}
                        </a>
                    </td>
                    <td>
                        <span class="badge bg-secondary bg-opacity-25 text-dark">
                            ${item.feedbackCount} reviews
                        </span>
                    </td>
                    <td>
                        <div class="d-flex align-items-center gap-2">
                            <span class="fw-bold">${(item.averageRating || 0).toFixed(1)}</span>
                            <div class="stars-display fs-6">${renderStars(item.averageRating || 0)}</div>
                        </div>
                    </td>
                    <td>
                        <a href="/admin/feedback.html?siteId=${item.heritageSiteId}" class="btn btn-outline-dark btn-sm">
                            <i class="bi bi-chat-quote me-1"></i>View Reviews
                        </a>
                    </td>
                </tr>
            `).join('');
        }
    } catch (err) {
        console.error('Failed to load site ratings summary:', err);
    }
}

function renderStars(rating) {
    const rounded = Math.round(rating);
    let html = '';
    for (let i = 1; i <= 5; i++) {
        html += i <= rounded ? '<i class="bi bi-star-fill text-warning"></i>' : '<i class="bi bi-star text-muted"></i>';
    }
    return html;
}

function escapeHtml(text) {
    if (!text) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.toString().replace(/[&<>"']/g, m => map[m]);
}
