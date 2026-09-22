/**
 * Heritage Walk - Admin Visitor Feedback Management
 */

let allHeritageSites = [];

document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth();
    loadSitesDropdown();
    loadAdminFeedback();

    const siteFilter = document.getElementById('feedback-filter-site');
    const ratingFilter = document.getElementById('feedback-filter-rating');

    if (siteFilter) {
        siteFilter.addEventListener('change', () => loadAdminFeedback());
    }
    if (ratingFilter) {
        ratingFilter.addEventListener('change', () => loadAdminFeedback());
    }
});

async function checkAdminAuth() {
    try {
        const response = await fetch('/api/auth/session');
        const result = await response.json();
        if (!result.success || !result.data || result.data.role !== 'ADMIN') {
            window.location.href = '/pages/login.html';
            return;
        }
        const adminNameEl = document.getElementById('admin-display-name');
        if (adminNameEl) adminNameEl.textContent = result.data.name;
    } catch {
        window.location.href = '/pages/login.html';
    }
}

async function loadSitesDropdown() {
    const select = document.getElementById('feedback-filter-site');
    if (!select) return;

    try {
        const response = await fetch('/api/heritage');
        const result = await response.json();
        if (response.ok && result.success) {
            allHeritageSites = result.data;
            allHeritageSites.forEach(s => {
                const opt = document.createElement('option');
                opt.value = s.id;
                opt.textContent = s.name;
                select.appendChild(opt);
            });

            // Check if siteId is in URL
            const urlParams = new URLSearchParams(window.location.search);
            const initialSite = urlParams.get('siteId');
            if (initialSite) {
                select.value = initialSite;
                loadAdminFeedback();
            }
        }
    } catch (err) {
        console.error('Failed to load sites for feedback filter:', err);
    }
}

async function loadAdminFeedback() {
    const tbody = document.getElementById('feedback-table-body');
    const countEl = document.getElementById('feedback-count-badge');
    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="5" class="text-center py-4 text-muted">
                <div class="spinner-border spinner-border-sm text-warning me-2"></div>Loading feedback...
            </td>
        </tr>
    `;

    const siteId = document.getElementById('feedback-filter-site')?.value || '';
    const rating = document.getElementById('feedback-filter-rating')?.value || '';

    const params = new URLSearchParams();
    if (siteId) params.append('siteId', siteId);
    if (rating) params.append('rating', rating);

    try {
        const response = await fetch(`/api/admin/feedback?${params.toString()}`);
        const result = await response.json();

        if (response.ok && result.success) {
            const list = result.data;
            if (countEl) countEl.textContent = `${list.length} Feedback Records`;

            if (list.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center py-4 text-muted">No visitor reviews match the selected filter.</td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = list.map(f => `
                <tr>
                    <td class="fw-semibold">
                        <div class="d-flex align-items-center gap-2">
                            <i class="bi bi-person-circle fs-5 text-secondary"></i>
                            <span>${escapeHtml(f.userName || 'Anonymous')}</span>
                        </div>
                    </td>
                    <td>
                        <a href="/pages/heritage-details.html?id=${f.heritageSiteId}" target="_blank" class="text-dark fw-bold text-decoration-none">
                            ${escapeHtml(f.heritageSiteName)}
                        </a>
                    </td>
                    <td>${renderStars(f.rating)}</td>
                    <td class="text-secondary" style="max-width: 320px;">${escapeHtml(f.comment)}</td>
                    <td class="text-muted small">${formatDate(f.createdAt)}</td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger py-4">Failed to load feedback.</td></tr>`;
        }
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger py-4">Network error loading feedback.</td></tr>`;
    }
}

function renderStars(rating) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        html += i <= rating ? '<i class="bi bi-star-fill text-warning"></i>' : '<i class="bi bi-star text-muted"></i>';
    }
    return `<div class="stars-display fs-6">${html} <span class="ms-1 fw-bold text-dark">(${rating})</span></div>`;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
        return dateStr;
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.toString().replace(/[&<>"']/g, m => map[m]);
}
