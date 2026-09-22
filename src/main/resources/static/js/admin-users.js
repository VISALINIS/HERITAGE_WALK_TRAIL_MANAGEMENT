/**
 * Heritage Walk - Admin Visitor Accounts Management
 */

document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth();
    loadVisitors();
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

async function loadVisitors() {
    const tbody = document.getElementById('users-table-body');
    const countBadge = document.getElementById('visitors-count-badge');
    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center py-4 text-muted">
                <div class="spinner-border spinner-border-sm text-warning me-2"></div>Loading registered visitors...
            </td>
        </tr>
    `;

    try {
        const response = await fetch('/api/admin/users');
        const result = await response.json();

        if (response.ok && result.success) {
            const users = result.data;
            if (countBadge) countBadge.textContent = `${users.length} Visitors Registered`;

            if (users.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No visitors registered yet.</td></tr>`;
                return;
            }

            tbody.innerHTML = users.map(u => {
                const statusBadge = u.active
                    ? '<span class="badge bg-success-subtle text-success border border-success"><i class="bi bi-check-circle me-1"></i>Active</span>'
                    : '<span class="badge bg-danger-subtle text-danger border border-danger"><i class="bi bi-dash-circle me-1"></i>Deactivated</span>';

                const toggleBtn = u.active
                    ? `<button class="btn btn-sm btn-outline-danger" onclick="toggleUserActive(${u.id}, false)">
                         <i class="bi bi-person-x me-1"></i>Deactivate
                       </button>`
                    : `<button class="btn btn-sm btn-outline-success" onclick="toggleUserActive(${u.id}, true)">
                         <i class="bi bi-person-check me-1"></i>Activate
                       </button>`;

                return `
                    <tr>
                        <td class="fw-bold">
                            <div class="d-flex align-items-center gap-2">
                                <i class="bi bi-person-circle fs-5 text-secondary"></i>
                                <span>${escapeHtml(u.name)}</span>
                            </div>
                        </td>
                        <td>${escapeHtml(u.email)}</td>
                        <td><span class="badge bg-light text-dark border">VISITOR</span></td>
                        <td>${formatDate(u.createdAt)}</td>
                        <td>${statusBadge}</td>
                        <td class="text-end">${toggleBtn}</td>
                    </tr>
                `;
            }).join('');
        } else {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">Failed to load visitors.</td></tr>`;
        }
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">Network error loading visitors.</td></tr>`;
    }
}

async function toggleUserActive(userId, newStatus) {
    const actionText = newStatus ? 'activate' : 'deactivate';
    if (!confirm(`Are you sure you want to ${actionText} this visitor account?`)) return;

    try {
        const response = await fetch(`/api/admin/users/${userId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ active: newStatus })
        });

        const result = await response.json();
        if (response.ok && result.success) {
            showAdminToast(result.message || 'User status updated successfully.', 'success');
            loadVisitors();
        } else {
            alert(result.message || 'Failed to update user status.');
        }
    } catch {
        alert('Network error updating user status.');
    }
}

function showAdminToast(msg, type = 'success') {
    const toastEl = document.getElementById('adminToast');
    if (!toastEl) {
        alert(msg);
        return;
    }
    document.getElementById('toast-message').textContent = msg;
    toastEl.className = `toast align-items-center text-bg-${type} border-0`;
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
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
