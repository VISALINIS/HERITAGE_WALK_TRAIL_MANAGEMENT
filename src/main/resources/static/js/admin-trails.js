/**
 * Heritage Walk - Admin Trail & Trail Stops Management
 */

let allTrails = [];
let allHeritageSites = [];
let trailModal = null;
let stopsModal = null;
let deleteModal = null;
let currentEditingTrail = null;
let trailToDeleteId = null;

document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth();
    initModals();
    loadTrails();
    loadHeritageSitesList();
    initFormListeners();
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
    const tmEl = document.getElementById('trailModal');
    if (tmEl) trailModal = new bootstrap.Modal(tmEl);

    const smEl = document.getElementById('trailStopsModal');
    if (smEl) stopsModal = new bootstrap.Modal(smEl);

    const dmEl = document.getElementById('deleteTrailModal');
    if (dmEl) deleteModal = new bootstrap.Modal(dmEl);
}

async function loadHeritageSitesList() {
    try {
        const response = await fetch('/api/heritage');
        const result = await response.json();
        if (response.ok && result.success) {
            allHeritageSites = result.data;
            populateHeritageStopDropdown();
        }
    } catch (err) {
        console.error('Failed to fetch heritage sites for stops:', err);
    }
}

function populateHeritageStopDropdown() {
    const select = document.getElementById('new-stop-site-select');
    if (!select) return;

    select.innerHTML = '<option value="">-- Choose Heritage Site --</option>' +
        allHeritageSites.map(s => `<option value="${s.id}">${escapeHtml(s.name)} (${escapeHtml(s.location)})</option>`).join('');
}

async function loadTrails() {
    const tbody = document.getElementById('trails-table-body');
    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="7" class="text-center py-4 text-muted">
                <div class="spinner-border spinner-border-sm text-warning me-2"></div>Loading trails...
            </td>
        </tr>
    `;

    try {
        const response = await fetch('/api/admin/trails');
        const result = await response.json();

        if (response.ok && result.success) {
            allTrails = result.data;
            renderTrailsTable(allTrails);
        } else {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger py-4">Failed to load trails.</td></tr>`;
        }
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger py-4">Network error loading trails.</td></tr>`;
    }
}

function renderTrailsTable(trails) {
    const tbody = document.getElementById('trails-table-body');
    const countEl = document.getElementById('total-trails-count');
    if (countEl) countEl.textContent = trails.length;
    if (!tbody) return;

    if (trails.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No walking trails found.</td></tr>`;
        return;
    }

    const fallbackImg = 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=200&q=80';

    tbody.innerHTML = trails.map(t => {
        const stopsCount = t.stops ? t.stops.length : 0;
        return `
            <tr>
                <td style="width: 70px;">
                    <img src="${escapeHtml(t.imageUrl || fallbackImg)}" alt="${escapeHtml(t.name)}" class="rounded" style="width: 54px; height: 54px; object-fit: cover;" onerror="this.src='${fallbackImg}'">
                </td>
                <td>
                    <div class="fw-bold">${escapeHtml(t.name)}</div>
                    <small class="text-muted text-truncate d-inline-block" style="max-width: 250px;">${escapeHtml(t.description)}</small>
                </td>
                <td><span class="difficulty-${escapeHtml(t.difficulty)}">${escapeHtml(t.difficulty)}</span></td>
                <td>${t.distance} km</td>
                <td>${t.estimatedDuration} mins</td>
                <td>
                    <button class="btn btn-sm btn-outline-warning text-dark fw-semibold" onclick="openManageStopsModal(${t.id})">
                        <i class="bi bi-geo-alt me-1"></i>${stopsCount} Stops
                    </button>
                </td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="openEditTrailModal(${t.id})" title="Edit Trail">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="confirmDeleteTrail(${t.id}, '${escapeHtml(t.name)}')" title="Delete Trail">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function initFormListeners() {
    const form = document.getElementById('trail-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const trailId = document.getElementById('trail-id').value;
        const name = document.getElementById('trail-name-input').value.trim();
        const description = document.getElementById('trail-desc-input').value.trim();
        const startingPoint = document.getElementById('trail-start-input').value.trim();
        const endingPoint = document.getElementById('trail-end-input').value.trim();
        const distance = parseFloat(document.getElementById('trail-dist-input').value);
        const estimatedDuration = parseInt(document.getElementById('trail-dur-input').value, 10);
        const difficulty = document.getElementById('trail-diff-select').value;
        const imageUrl = document.getElementById('trail-image-input').value.trim();

        const payload = {
            name,
            description,
            startingPoint,
            endingPoint,
            distance,
            estimatedDuration,
            difficulty,
            imageUrl: imageUrl || null
        };

        const isEdit = !!trailId;
        const url = isEdit ? `/api/admin/trails/${trailId}` : '/api/admin/trails';
        const method = isEdit ? 'PUT' : 'POST';

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                trailModal.hide();
                showAdminToast(isEdit ? 'Trail updated successfully!' : 'Trail created successfully!', 'success');
                loadTrails();
            } else {
                alert(result.message || 'Failed to save trail.');
            }
        } catch (err) {
            alert('Network error while saving trail.');
        } finally {
            submitBtn.disabled = false;
        }
    });

    // Add Stop listener
    const addStopBtn = document.getElementById('btn-add-stop');
    if (addStopBtn) {
        addStopBtn.addEventListener('click', async () => {
            if (!currentEditingTrail) return;
            const siteSelect = document.getElementById('new-stop-site-select');
            const siteId = siteSelect.value;
            if (!siteId) {
                alert('Please select a heritage site to add as a stop.');
                return;
            }

            addStopBtn.disabled = true;
            try {
                const response = await fetch(`/api/admin/trails/${currentEditingTrail.id}/stops`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ heritageSiteId: parseInt(siteId, 10) })
                });

                const result = await response.json();
                if (response.ok && result.success) {
                    currentEditingTrail = result.data;
                    renderStopsListInModal(currentEditingTrail.stops || []);
                    loadTrails();
                    siteSelect.value = '';
                } else {
                    alert(result.message || 'Could not add stop.');
                }
            } catch {
                alert('Network error adding stop.');
            } finally {
                addStopBtn.disabled = false;
            }
        });
    }

    // Delete Trail confirmation listener
    const confirmDelBtn = document.getElementById('btn-confirm-delete-trail');
    if (confirmDelBtn) {
        confirmDelBtn.addEventListener('click', async () => {
            if (!trailToDeleteId) return;

            confirmDelBtn.disabled = true;
            try {
                const response = await fetch(`/api/admin/trails/${trailToDeleteId}`, { method: 'DELETE' });
                const result = await response.json();

                if (response.ok && result.success) {
                    deleteModal.hide();
                    showAdminToast('Trail deleted successfully!', 'success');
                    loadTrails();
                } else {
                    alert(result.message || 'Failed to delete trail.');
                }
            } catch {
                alert('Network error deleting trail.');
            } finally {
                confirmDelBtn.disabled = false;
                trailToDeleteId = null;
            }
        });
    }
}

function openAddTrailModal() {
    document.getElementById('trail-form').reset();
    document.getElementById('trail-id').value = '';
    document.getElementById('trail-modal-title').textContent = 'Add New Trail';
    trailModal.show();
}

function openEditTrailModal(id) {
    const trail = allTrails.find(t => t.id === id);
    if (!trail) return;

    document.getElementById('trail-id').value = trail.id;
    document.getElementById('trail-name-input').value = trail.name || '';
    document.getElementById('trail-desc-input').value = trail.description || '';
    document.getElementById('trail-start-input').value = trail.startingPoint || '';
    document.getElementById('trail-end-input').value = trail.endingPoint || '';
    document.getElementById('trail-dist-input').value = trail.distance || '';
    document.getElementById('trail-dur-input').value = trail.estimatedDuration || '';
    document.getElementById('trail-diff-select').value = trail.difficulty || 'EASY';
    document.getElementById('trail-image-input').value = trail.imageUrl || '';

    document.getElementById('trail-modal-title').textContent = 'Edit Trail';
    trailModal.show();
}

function confirmDeleteTrail(id, name) {
    trailToDeleteId = id;
    document.getElementById('delete-trail-name').textContent = name;
    deleteModal.show();
}

function openManageStopsModal(trailId) {
    const trail = allTrails.find(t => t.id === trailId);
    if (!trail) return;

    currentEditingTrail = trail;
    document.getElementById('stops-modal-trail-name').textContent = trail.name;
    renderStopsListInModal(trail.stops || []);
    stopsModal.show();
}

function renderStopsListInModal(stops) {
    const container = document.getElementById('current-stops-list');
    if (!container) return;

    if (!stops || stops.length === 0) {
        container.innerHTML = '<p class="text-muted text-center py-3">No stops added yet. Select a heritage site above.</p>';
        return;
    }

    stops.sort((a, b) => a.stopOrder - b.stopOrder);

    container.innerHTML = stops.map((s, idx) => `
        <div class="d-flex align-items-center justify-content-between p-2 mb-2 bg-light border rounded">
            <div class="d-flex align-items-center gap-2">
                <span class="badge bg-primary rounded-pill">${s.stopOrder}</span>
                <span class="fw-bold">${escapeHtml(s.heritageSiteName)}</span>
                <small class="text-muted">(${escapeHtml(s.heritageSiteLocation || '')})</small>
            </div>
            <div class="d-flex align-items-center gap-1">
                <button class="btn btn-sm btn-outline-secondary" onclick="moveStopOrder(${idx}, -1)" ${idx === 0 ? 'disabled' : ''} title="Move Up">
                    <i class="bi bi-arrow-up"></i>
                </button>
                <button class="btn btn-sm btn-outline-secondary" onclick="moveStopOrder(${idx}, 1)" ${idx === stops.length - 1 ? 'disabled' : ''} title="Move Down">
                    <i class="bi bi-arrow-down"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger ms-2" onclick="removeTrailStop(${s.id})" title="Remove Stop">
                    <i class="bi bi-x-lg"></i>
                </button>
            </div>
        </div>
    `).join('');
}

async function moveStopOrder(index, direction) {
    if (!currentEditingTrail || !currentEditingTrail.stops) return;
    const stops = [...currentEditingTrail.stops];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= stops.length) return;

    // Swap elements
    const temp = stops[index];
    stops[index] = stops[targetIdx];
    stops[targetIdx] = temp;

    const stopIds = stops.map(s => s.id);

    try {
        const response = await fetch(`/api/admin/trails/${currentEditingTrail.id}/stops/reorder`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stopIds })
        });

        const result = await response.json();
        if (response.ok && result.success) {
            currentEditingTrail = result.data;
            renderStopsListInModal(currentEditingTrail.stops);
            loadTrails();
        }
    } catch (err) {
        console.error('Error reordering stops:', err);
    }
}

async function removeTrailStop(stopId) {
    if (!currentEditingTrail) return;
    if (!confirm('Are you sure you want to remove this stop from the trail?')) return;

    try {
        const response = await fetch(`/api/admin/trails/${currentEditingTrail.id}/stops/${stopId}`, {
            method: 'DELETE'
        });
        const result = await response.json();
        if (response.ok && result.success) {
            currentEditingTrail = result.data;
            renderStopsListInModal(currentEditingTrail.stops);
            loadTrails();
        } else {
            alert(result.message || 'Could not remove stop.');
        }
    } catch {
        alert('Network error removing stop.');
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

function escapeHtml(text) {
    if (!text) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.toString().replace(/[&<>"']/g, m => map[m]);
}
