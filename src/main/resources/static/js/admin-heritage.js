/**
 * Heritage Walk - Admin Heritage Sites Management
 */

let allSites = [];
let siteModal = null;
let deleteModal = null;
let siteToDeleteId = null;

document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth();
    initModals();
    loadSites();
    initFormListeners();

    const searchInput = document.getElementById('search-sites-table');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = allSites.filter(s =>
                s.name.toLowerCase().includes(query) ||
                s.location.toLowerCase().includes(query) ||
                (s.historicalPeriod && s.historicalPeriod.toLowerCase().includes(query))
            );
            renderSitesTable(filtered);
        });
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

function initModals() {
    const smEl = document.getElementById('heritageSiteModal');
    if (smEl) siteModal = new bootstrap.Modal(smEl);

    const dmEl = document.getElementById('deleteConfirmModal');
    if (dmEl) deleteModal = new bootstrap.Modal(dmEl);
}

async function loadSites() {
    const tbody = document.getElementById('heritage-table-body');
    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="7" class="text-center py-4 text-muted">
                <div class="spinner-border spinner-border-sm text-warning me-2"></div>Loading heritage sites...
            </td>
        </tr>
    `;

    try {
        const response = await fetch('/api/admin/heritage');
        const result = await response.json();

        if (response.ok && result.success) {
            allSites = result.data;
            renderSitesTable(allSites);
        } else {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger py-4">Failed to load sites.</td></tr>`;
        }
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger py-4">Network error loading sites.</td></tr>`;
    }
}

function renderSitesTable(sites) {
    const tbody = document.getElementById('heritage-table-body');
    const countEl = document.getElementById('total-sites-count');
    if (countEl) countEl.textContent = sites.length;
    if (!tbody) return;

    if (sites.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No heritage sites found.</td></tr>`;
        return;
    }

    const fallbackImg = 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=200&q=80';

    tbody.innerHTML = sites.map(site => `
        <tr>
            <td style="width: 70px;">
                <img src="${escapeHtml(site.imageUrl || fallbackImg)}" alt="${escapeHtml(site.name)}" class="rounded" style="width: 54px; height: 54px; object-fit: cover;" onerror="this.src='${fallbackImg}'">
            </td>
            <td>
                <div class="fw-bold">${escapeHtml(site.name)}</div>
                <small class="text-muted"><i class="bi bi-geo-alt me-1"></i>${escapeHtml(site.location)}</small>
            </td>
            <td><span class="badge bg-light text-dark border">${escapeHtml(site.historicalPeriod || 'N/A')}</span></td>
            <td><span class="small text-secondary">${escapeHtml(site.architecturalStyle || 'N/A')}</span></td>
            <td>
                <div class="d-flex align-items-center gap-1">
                    <span class="fw-bold">${(site.averageRating || 0).toFixed(1)}</span>
                    <i class="bi bi-star-fill text-warning small"></i>
                    <small class="text-muted">(${site.feedbackCount || 0})</small>
                </div>
            </td>
            <td>
                <small class="text-muted">
                    ${site.latitude && site.longitude ? `${site.latitude.toFixed(2)}, ${site.longitude.toFixed(2)}` : 'N/A'}
                </small>
            </td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-primary me-1" onclick="openEditSiteModal(${site.id})" title="Edit Site">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="confirmDeleteSite(${site.id}, '${escapeHtml(site.name)}')" title="Delete Site">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function initFormListeners() {
    const form = document.getElementById('heritage-site-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const siteId = document.getElementById('site-id').value;
        const name = document.getElementById('site-name-input').value.trim();
        const location = document.getElementById('site-location-input').value.trim();
        const description = document.getElementById('site-desc-input').value.trim();
        const period = document.getElementById('site-period-input').value.trim();
        const style = document.getElementById('site-style-input').value.trim();
        const significance = document.getElementById('site-significance-input').value.trim();
        const imageUrl = document.getElementById('site-image-input').value.trim();
        const latVal = document.getElementById('site-lat-input').value;
        const lngVal = document.getElementById('site-lng-input').value;

        const payload = {
            name,
            location,
            description,
            historicalPeriod: period || null,
            architecturalStyle: style || null,
            culturalSignificance: significance || null,
            imageUrl: imageUrl || null,
            latitude: latVal ? parseFloat(latVal) : null,
            longitude: lngVal ? parseFloat(lngVal) : null
        };

        const isEdit = !!siteId;
        const url = isEdit ? `/api/admin/heritage/${siteId}` : '/api/admin/heritage';
        const method = isEdit ? 'PUT' : 'POST';

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                siteModal.hide();
                showAdminToast(isEdit ? 'Heritage site updated successfully!' : 'Heritage site created successfully!', 'success');
                loadSites();
            } else {
                alert(result.message || 'Failed to save heritage site.');
            }
        } catch (err) {
            alert('Network error while saving heritage site.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="bi bi-check2 me-1"></i>Save Site';
        }
    });

    const confirmDelBtn = document.getElementById('btn-confirm-delete');
    if (confirmDelBtn) {
        confirmDelBtn.addEventListener('click', async () => {
            if (!siteToDeleteId) return;

            confirmDelBtn.disabled = true;
            try {
                const response = await fetch(`/api/admin/heritage/${siteToDeleteId}`, { method: 'DELETE' });
                const result = await response.json();

                if (response.ok && result.success) {
                    deleteModal.hide();
                    showAdminToast('Heritage site deleted successfully!', 'success');
                    loadSites();
                } else {
                    alert(result.message || 'Failed to delete heritage site.');
                }
            } catch {
                alert('Network error deleting heritage site.');
            } finally {
                confirmDelBtn.disabled = false;
                siteToDeleteId = null;
            }
        });
    }
}

function openAddSiteModal() {
    document.getElementById('heritage-site-form').reset();
    document.getElementById('site-id').value = '';
    document.getElementById('modal-title').textContent = 'Add New Heritage Site';
    siteModal.show();
}

function openEditSiteModal(id) {
    const site = allSites.find(s => s.id === id);
    if (!site) return;

    document.getElementById('site-id').value = site.id;
    document.getElementById('site-name-input').value = site.name || '';
    document.getElementById('site-location-input').value = site.location || '';
    document.getElementById('site-desc-input').value = site.description || '';
    document.getElementById('site-period-input').value = site.historicalPeriod || '';
    document.getElementById('site-style-input').value = site.architecturalStyle || '';
    document.getElementById('site-significance-input').value = site.culturalSignificance || '';
    document.getElementById('site-image-input').value = site.imageUrl || '';
    document.getElementById('site-lat-input').value = site.latitude != null ? site.latitude : '';
    document.getElementById('site-lng-input').value = site.longitude != null ? site.longitude : '';

    document.getElementById('modal-title').textContent = 'Edit Heritage Site';
    siteModal.show();
}

function confirmDeleteSite(id, name) {
    siteToDeleteId = id;
    document.getElementById('delete-site-name').textContent = name;
    deleteModal.show();
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

function escapeHtml(text) {
    if (!text) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.toString().replace(/[&<>"']/g, m => map[m]);
}
