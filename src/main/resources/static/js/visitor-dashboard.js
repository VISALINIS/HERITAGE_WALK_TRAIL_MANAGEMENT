/**
 * Heritage Walk - Visitor Dashboard
 */

document.addEventListener('DOMContentLoaded', () => {
    initVisitorDashboard();
});

/**
 * Initializes dashboard data for logged-in visitor
 */
async function initVisitorDashboard() {
    try {
        const response = await fetch('/api/auth/session');
        const result = await response.json();

        if (!result.success || !result.data) {
            window.location.href = '/pages/login.html';
            return;
        }

        const user = result.data;
        document.getElementById('visitor-name-heading').textContent = `Welcome, ${user.name}!`;
        document.getElementById('profile-name').textContent = user.name;
        document.getElementById('profile-email').textContent = user.email;
        document.getElementById('profile-joined').textContent = formatDate(user.createdAt);

        // Load visitor statistics & recent reviews
        loadVisitorFeedbackHistory(user.id);
    } catch (err) {
        console.error('Visitor dashboard init error:', err);
    }
}

/**
 * Fetches user reviews and computes personal summary metrics
 */
async function loadVisitorFeedbackHistory(userId) {
    const tableBody = document.getElementById('my-feedback-table-body');
    const totalCountEl = document.getElementById('my-total-reviews');
    const avgRatingEl = document.getElementById('my-avg-rating');

    try {
        const response = await fetch('/api/feedback/my');
        const result = await response.json();

        if (response.ok && result.success) {
            const list = result.data;

            if (totalCountEl) totalCountEl.textContent = list.length;

            if (list.length > 0) {
                const totalStars = list.reduce((sum, item) => sum + item.rating, 0);
                const avg = (totalStars / list.length).toFixed(1);
                if (avgRatingEl) avgRatingEl.textContent = `${avg} / 5.0`;
            } else {
                if (avgRatingEl) avgRatingEl.textContent = '0.0';
            }

            if (!tableBody) return;

            if (list.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center py-4 text-muted">
                            <i class="bi bi-chat-left-dots fs-3 text-warning"></i>
                            <p class="mt-2 mb-0">You haven't submitted any reviews yet.</p>
                            <a href="/pages/heritage.html" class="btn btn-sm btn-heritage-primary mt-2">Explore Heritage Sites</a>
                        </td>
                    </tr>
                `;
                return;
            }

            tableBody.innerHTML = list.map(item => `
                <tr>
                    <td class="fw-bold">
                        <a href="/pages/heritage-details.html?id=${item.heritageSiteId}" class="text-decoration-none text-dark">
                            ${escapeHtml(item.heritageSiteName)}
                        </a>
                    </td>
                    <td>${renderStars(item.rating)}</td>
                    <td class="text-muted small">${escapeHtml(item.comment)}</td>
                    <td class="text-muted small">${formatDate(item.createdAt)}</td>
                    <td>
                        <a href="/pages/heritage-details.html?id=${item.heritageSiteId}" class="btn btn-outline-secondary btn-sm">
                            <i class="bi bi-arrow-up-right"></i>
                        </a>
                    </td>
                </tr>
            `).join('');
        }
    } catch (err) {
        console.error('Failed to load visitor feedback:', err);
    }
}

function renderStars(rating) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        html += i <= rating ? '<i class="bi bi-star-fill text-warning"></i>' : '<i class="bi bi-star text-muted"></i>';
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
