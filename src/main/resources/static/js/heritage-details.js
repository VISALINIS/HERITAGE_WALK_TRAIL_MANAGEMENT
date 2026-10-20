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
            loadSiteWeather(site);


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

/**
 * Loads live weather for the selected heritage site
 * using its latitude and longitude.
 */
async function loadSiteWeather(site) {
    const loading = document.getElementById('weather-loading');
    const content = document.getElementById('weather-content');
    const error = document.getElementById('weather-error');
    const location = document.getElementById('weather-location');

    // Stop if the weather card isn't present on this page
    if (!loading || !content || !error || !location) return;

    loading.classList.remove('d-none');
    content.classList.add('d-none');
    error.classList.add('d-none');

    location.textContent = site.name || site.location || 'Heritage site';

    const latitude = Number(site.latitude);
    const longitude = Number(site.longitude);

    if (
        site.latitude == null ||
        site.longitude == null ||
        site.latitude === '' ||
        site.longitude === '' ||
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        Math.abs(latitude) > 90 ||
        Math.abs(longitude) > 180
    ) {
        loading.classList.add('d-none');
        error.textContent = 'Weather is unavailable because this site has no valid coordinates.';
        error.classList.remove('d-none');
        return;
    }

    try {
        const params = new URLSearchParams({
            latitude: latitude,
            longitude: longitude,
            current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m',
            daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max',
            timezone: 'auto',
            forecast_days: '7'
        });

        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?${params.toString()}`
        );

        if (!response.ok) {
            throw new Error(`Weather API returned ${response.status}`);
        }

        const data = await response.json();
        const weather = data.current;

        if (!weather) {
            throw new Error('Current weather data is unavailable');
        }

        const temperature = document.getElementById('weather-temperature');
        const condition = document.getElementById('weather-condition');
        const humidity = document.getElementById('weather-humidity');
        const wind = document.getElementById('weather-wind');
        const updated = document.getElementById('weather-updated');

        if (!temperature || !condition || !humidity || !wind) {
            throw new Error('Weather card elements are missing from the HTML');
        }

        temperature.textContent =
            `${Math.round(weather.temperature_2m)}°C`;

        condition.textContent =
            getWeatherDescription(weather.weather_code);

        humidity.textContent =
            `${weather.relative_humidity_2m}%`;

        wind.textContent =
            `${weather.wind_speed_10m} km/h`;

        // Render 7-day weather forecast
        const forecastContainer = document.getElementById('weather-forecast-container');
        if (forecastContainer && data.daily && Array.isArray(data.daily.time)) {
            render7DayForecast(forecastContainer, data.daily);
        }

        if (updated) {
            const time = weather.time
                ? new Date(weather.time).toLocaleString()
                : 'Unknown';

            updated.textContent =
                `Feels like ${Math.round(weather.apparent_temperature)}°C · ` +
                `Precipitation: ${weather.precipitation} mm · ` +
                `Local observation time: ${time} · Data: Open-Meteo`;
        }

        loading.classList.add('d-none');
        content.classList.remove('d-none');

    } catch (err) {
        console.error('Failed to load heritage site weather:', err);
        loading.classList.add('d-none');
        error.textContent =
            'Weather could not be loaded. Please check your internet connection and try again.';
        error.classList.remove('d-none');
    }
}

/**
 * Renders 7-day daily weather forecast cards
 */
function render7DayForecast(container, daily) {
    const daysCount = Math.min(daily.time.length, 7);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    let html = '';
    for (let i = 0; i < daysCount; i++) {
        const dateObj = new Date(daily.time[i] + 'T00:00:00');
        const isToday = i === 0;
        const dayLabel = isToday ? 'Today' : dayNames[dateObj.getDay()];
        const dateLabel = `${monthNames[dateObj.getMonth()]} ${dateObj.getDate()}`;
        const code = daily.weather_code[i];
        const iconInfo = getWeatherIconAndDesc(code);
        const maxTemp = Math.round(daily.temperature_2m_max[i]);
        const minTemp = Math.round(daily.temperature_2m_min[i]);
        const precipProb = daily.precipitation_probability_max ? daily.precipitation_probability_max[i] : null;
        const windSpeed = daily.wind_speed_10m_max ? Math.round(daily.wind_speed_10m_max[i]) : null;

        html += `
            <div class="col">
                <div class="forecast-card ${isToday ? 'today' : ''}">
                    <div class="forecast-day">${dayLabel}</div>
                    <div class="forecast-date">${dateLabel}</div>
                    <div class="forecast-icon ${iconInfo.colorClass}">
                        <i class="bi ${iconInfo.icon}"></i>
                    </div>
                    <div class="forecast-temp">
                        <span>${maxTemp}°</span>
                        <span class="forecast-temp-min ms-1">${minTemp}°</span>
                    </div>
                    <div class="small text-truncate text-muted mt-1" style="font-size: 0.7rem;" title="${escapeHtml(iconInfo.description)}">
                        ${escapeHtml(iconInfo.description)}
                    </div>
                    <div class="forecast-meta d-flex justify-content-center gap-2">
                        ${precipProb != null ? `<span title="Precipitation Chance"><i class="bi bi-droplet-fill text-primary"></i> ${precipProb}%</span>` : ''}
                        ${windSpeed != null ? `<span title="Max Wind Speed"><i class="bi bi-wind text-secondary"></i> ${windSpeed}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    container.innerHTML = html;
}

/**
 * Maps WMO weather code to Bootstrap icon, color, and description
 */
function getWeatherIconAndDesc(code) {
    const map = {
        0: { icon: 'bi-sun-fill', colorClass: 'text-warning', description: 'Clear sky' },
        1: { icon: 'bi-sun-fill', colorClass: 'text-warning', description: 'Mainly clear' },
        2: { icon: 'bi-cloud-sun-fill', colorClass: 'text-warning', description: 'Partly cloudy' },
        3: { icon: 'bi-clouds-fill', colorClass: 'text-secondary', description: 'Overcast' },
        45: { icon: 'bi-cloud-fog-fill', colorClass: 'text-secondary', description: 'Foggy' },
        48: { icon: 'bi-cloud-fog-fill', colorClass: 'text-secondary', description: 'Rime fog' },
        51: { icon: 'bi-cloud-drizzle-fill', colorClass: 'text-info', description: 'Light drizzle' },
        53: { icon: 'bi-cloud-drizzle-fill', colorClass: 'text-info', description: 'Drizzle' },
        55: { icon: 'bi-cloud-drizzle-fill', colorClass: 'text-info', description: 'Heavy drizzle' },
        56: { icon: 'bi-cloud-snow-fill', colorClass: 'text-info', description: 'Freezing drizzle' },
        57: { icon: 'bi-cloud-snow-fill', colorClass: 'text-info', description: 'Heavy freezing drizzle' },
        61: { icon: 'bi-cloud-rain-fill', colorClass: 'text-primary', description: 'Light rain' },
        63: { icon: 'bi-cloud-rain-fill', colorClass: 'text-primary', description: 'Rain' },
        65: { icon: 'bi-cloud-rain-heavy-fill', colorClass: 'text-primary', description: 'Heavy rain' },
        66: { icon: 'bi-cloud-sleet-fill', colorClass: 'text-primary', description: 'Freezing rain' },
        67: { icon: 'bi-cloud-sleet-fill', colorClass: 'text-primary', description: 'Heavy freezing rain' },
        71: { icon: 'bi-snow', colorClass: 'text-info', description: 'Light snow' },
        73: { icon: 'bi-snow', colorClass: 'text-info', description: 'Snow' },
        75: { icon: 'bi-snow2', colorClass: 'text-info', description: 'Heavy snow' },
        77: { icon: 'bi-snow', colorClass: 'text-info', description: 'Snow grains' },
        80: { icon: 'bi-cloud-rain-fill', colorClass: 'text-primary', description: 'Light rain showers' },
        81: { icon: 'bi-cloud-rain-fill', colorClass: 'text-primary', description: 'Rain showers' },
        82: { icon: 'bi-cloud-rain-heavy-fill', colorClass: 'text-primary', description: 'Violent showers' },
        85: { icon: 'bi-cloud-snow-fill', colorClass: 'text-info', description: 'Snow showers' },
        86: { icon: 'bi-cloud-snow-fill', colorClass: 'text-info', description: 'Heavy snow showers' },
        95: { icon: 'bi-cloud-lightning-rain-fill', colorClass: 'text-danger', description: 'Thunderstorm' },
        96: { icon: 'bi-cloud-lightning-rain-fill', colorClass: 'text-danger', description: 'Thunderstorm with hail' },
        99: { icon: 'bi-cloud-lightning-rain-fill', colorClass: 'text-danger', description: 'Heavy thunderstorm' }
    };

    return map[code] || { icon: 'bi-cloud-sun-fill', colorClass: 'text-warning', description: 'Moderate conditions' };
}

/**
 * Converts WMO weather codes into readable descriptions.
 */
function getWeatherDescription(code) {
    return getWeatherIconAndDesc(code).description;
}
