/**
 * Heritage Walk - Standalone Feedback Submission
 */

document.addEventListener('DOMContentLoaded', () => {
    checkUserAuth();
    populateHeritageDropdown();
    initFeedbackForm();
});

/**
 * Ensures user is authenticated before allowing feedback
 */
async function checkUserAuth() {
    try {
        const response = await fetch('/api/auth/session');
        const result = await response.json();
        if (!result.success || !result.data) {
            const container = document.getElementById('feedback-form-container');
            if (container) {
                container.innerHTML = `
                    <div class="card shadow-sm border-0 p-5 text-center">
                        <i class="bi bi-shield-lock fs-1 text-warning mb-3"></i>
                        <h3>Authentication Required</h3>
                        <p class="text-muted">You must be logged in as a registered visitor to submit ratings and feedback.</p>
                        <div class="mt-3">
                            <a href="/pages/login.html" class="btn btn-heritage-primary px-4 me-2">Sign In</a>
                            <a href="/pages/register.html" class="btn btn-outline-secondary px-4">Register</a>
                        </div>
                    </div>
                `;
            }
        }
    } catch (err) {
        console.error('Session check failed:', err);
    }
}

/**
 * Loads all heritage sites to populate the site selection dropdown
 */
async function populateHeritageDropdown() {
    const select = document.getElementById('feedback-site-select');
    if (!select) return;

    try {
        const response = await fetch('/api/heritage');
        const result = await response.json();

        if (response.ok && result.success) {
            result.data.forEach(site => {
                const opt = document.createElement('option');
                opt.value = site.id;
                opt.textContent = `${site.name} (${site.location})`;
                select.appendChild(opt);
            });

            // If query param 'siteId' is present, pre-select it
            const urlParams = new URLSearchParams(window.location.search);
            const preselected = urlParams.get('siteId');
            if (preselected) {
                select.value = preselected;
            }
        }
    } catch (err) {
        console.error('Failed to load heritage sites for dropdown:', err);
    }
}

/**
 * Handles feedback form submission
 */
function initFeedbackForm() {
    const form = document.getElementById('standalone-feedback-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const siteId = document.getElementById('feedback-site-select').value;
        const ratingInput = form.querySelector('input[name="rating"]:checked');
        const comment = document.getElementById('feedback-comment').value.trim();
        const alertBox = document.getElementById('feedback-alert');
        const submitBtn = form.querySelector('button[type="submit"]');

        if (!siteId) {
            showAlert(alertBox, 'Please select a heritage site to review.', 'warning');
            return;
        }

        if (!ratingInput) {
            showAlert(alertBox, 'Please select your rating (1 to 5 stars).', 'warning');
            return;
        }

        if (!comment) {
            showAlert(alertBox, 'Please write your feedback comment.', 'warning');
            return;
        }

        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Submitting Feedback...';

            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    heritageSiteId: parseInt(siteId, 10),
                    rating: parseInt(ratingInput.value, 10),
                    comment: comment
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                showAlert(alertBox, 'Thank you! Your feedback has been submitted successfully. Redirecting to your reviews...', 'success');
                setTimeout(() => {
                    window.location.href = '/pages/my-feedback.html';
                }, 1200);
            } else {
                showAlert(alertBox, result.message || 'Could not submit feedback.', 'danger');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="bi bi-send me-2"></i>Submit Feedback';
            }
        } catch (err) {
            showAlert(alertBox, 'Network error. Please try again.', 'danger');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="bi bi-send me-2"></i>Submit Feedback';
        }
    });
}

function showAlert(box, msg, type) {
    if (!box) return;
    box.className = `alert alert-${type} alert-dismissible fade show`;
    box.innerHTML = msg;
    box.classList.remove('d-none');
}
