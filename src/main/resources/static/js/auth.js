/**
 * Heritage Walk - Authentication & Session Helper
 * Handles session state, login, registration, logout, and dynamic navbar updates.
 */

// Global user state
let currentUser = null;

// Initialize session on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    checkSession();
    initLoginForm();
    initRegisterForm();
    initLogoutButtons();
});

/**
 * Checks current session with the backend
 */
async function checkSession() {
    try {
        const response = await fetch('/api/auth/session');
        const result = await response.json();
        if (result.success && result.data) {
            currentUser = result.data;
            updateNavbarForUser(currentUser);
        } else {
            currentUser = null;
            updateNavbarForGuest();
        }
    } catch (err) {
        console.warn('Session check failed or network offline:', err);
        updateNavbarForGuest();
    }
}

/**
 * Updates navbar elements when user is logged in
 */
function updateNavbarForUser(user) {
    const authContainer = document.getElementById('navbar-auth-links');
    if (!authContainer) return;

    const isAdmin = user.role === 'ADMIN';
    const dashboardLink = isAdmin ? '/admin/dashboard.html' : '/pages/visitor-dashboard.html';
    const roleBadge = isAdmin ? '<span class="badge bg-danger ms-1">Admin</span>' : '<span class="badge bg-primary ms-1">Visitor</span>';

    authContainer.innerHTML = `
        <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle d-flex align-items-center gap-1" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="bi bi-person-circle fs-5 text-warning"></i>
                <span class="fw-semibold">${escapeHtml(user.name)}</span>
                ${roleBadge}
            </a>
            <ul class="dropdown-menu dropdown-menu-end shadow-sm" aria-labelledby="userDropdown">
                <li><a class="dropdown-item" href="${dashboardLink}"><i class="bi bi-speedometer2 me-2"></i>Dashboard</a></li>
                ${!isAdmin ? '<li><a class="dropdown-item" href="/pages/my-feedback.html"><i class="bi bi-star me-2"></i>My Feedback</a></li>' : ''}
                ${isAdmin ? '<li><a class="dropdown-item" href="/admin/heritage-management.html"><i class="bi bi-building me-2"></i>Manage Sites</a></li>' : ''}
                <li><hr class="dropdown-divider"></li>
                <li><button class="dropdown-item text-danger btn-logout" type="button"><i class="bi bi-box-arrow-right me-2"></i>Logout</button></li>
            </ul>
        </li>
    `;

    // Re-bind logout listeners
    initLogoutButtons();
}

/**
 * Updates navbar elements when no user is logged in
 */
function updateNavbarForGuest() {
    const authContainer = document.getElementById('navbar-auth-links');
    if (!authContainer) return;

    authContainer.innerHTML = `
        <li class="nav-item">
            <a class="nav-link" href="/pages/login.html"><i class="bi bi-box-arrow-in-right me-1"></i>Login</a>
        </li>
        <li class="nav-item">
            <a class="btn btn-heritage-primary btn-sm ms-lg-2" href="/pages/register.html"><i class="bi bi-person-plus me-1"></i>Register</a>
        </li>
    `;
}

/**
 * Attaches submit listener to Login Form
 */
function initLoginForm() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const alertBox = document.getElementById('login-alert');
        const submitBtn = loginForm.querySelector('button[type="submit"]');

        if (!email || !password) {
            showAlert(alertBox, 'Please fill in both email and password.', 'danger');
            return;
        }

        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Logging in...';

            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                showAlert(alertBox, 'Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    if (result.data.role === 'ADMIN') {
                        window.location.href = '/admin/dashboard.html';
                    } else {
                        window.location.href = '/pages/visitor-dashboard.html';
                    }
                }, 800);
            } else {
                showAlert(alertBox, result.message || 'Login failed. Please verify credentials.', 'danger');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="bi bi-box-arrow-in-right me-2"></i>Sign In';
            }
        } catch (err) {
            showAlert(alertBox, 'Network error. Please try again later.', 'danger');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="bi bi-box-arrow-in-right me-2"></i>Sign In';
        }
    });
}

/**
 * Attaches submit listener to Register Form
 */
function initRegisterForm() {
    const regForm = document.getElementById('register-form');
    if (!regForm) return;

    regForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const alertBox = document.getElementById('register-alert');
        const submitBtn = regForm.querySelector('button[type="submit"]');

        if (!name || !email || !password || !confirmPassword) {
            showAlert(alertBox, 'Please complete all required fields.', 'danger');
            return;
        }

        if (password.length < 6) {
            showAlert(alertBox, 'Password must be at least 6 characters.', 'danger');
            return;
        }

        if (password !== confirmPassword) {
            showAlert(alertBox, 'Password and confirmation password do not match.', 'danger');
            return;
        }

        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Creating Account...';

            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, confirmPassword })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                showAlert(alertBox, 'Registration successful! Redirecting to login...', 'success');
                setTimeout(() => {
                    window.location.href = '/pages/login.html';
                }, 1200);
            } else {
                showAlert(alertBox, result.message || 'Registration failed.', 'danger');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="bi bi-person-check me-2"></i>Create Account';
            }
        } catch (err) {
            showAlert(alertBox, 'Network error. Please try again later.', 'danger');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="bi bi-person-check me-2"></i>Create Account';
        }
    });
}

/**
 * Attaches click listener to all logout buttons
 */
function initLogoutButtons() {
    document.querySelectorAll('.btn-logout').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await fetch('/api/auth/logout', { method: 'POST' });
            } catch (err) {
                console.error('Logout error:', err);
            } finally {
                currentUser = null;
                window.location.href = '/index.html';
            }
        });
    });
}

/**
 * Utility helper to display alert messages
 */
function showAlert(container, message, type = 'info') {
    if (!container) return;
    container.className = `alert alert-${type} alert-dismissible fade show`;
    container.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    container.classList.remove('d-none');
}

/**
 * Escapes HTML string to prevent XSS
 */
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, m => map[m]);
}
