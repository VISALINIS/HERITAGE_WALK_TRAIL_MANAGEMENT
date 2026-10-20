/**
 * Heritage Walk AI Chatbot
 * ========================
 * Self-contained, zero-dependency chatbot that uses the live site's
 * /api/heritage and /api/trails endpoints as its knowledge base.
 * No external API key required.
 */

(function () {
    'use strict';

    // ── Knowledge base (loaded once on page load) ────────────────────────────
    let kbSites  = [];   // array of heritage site objects from /api/heritage
    let kbTrails = [];   // array of trail objects from /api/trails
    let kbReady  = false;

    // ── Conversational state ─────────────────────────────────────────────────
    let chatOpen = false;

    // ── Utility helpers ───────────────────────────────────────────────────────
    function escHtml(text) {
        if (!text) return '';
        return text.toString()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function normalise(text) {
        return text.toLowerCase().trim();
    }

    function fmtDuration(mins) {
        if (!mins) return 'N/A';
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return h > 0 ? (m > 0 ? `${h}h ${m}min` : `${h}h`) : `${m}min`;
    }

    function fmtRating(val) {
        return val ? `⭐ ${parseFloat(val).toFixed(1)}` : 'No ratings yet';
    }

    // ── Knowledge-base loader ─────────────────────────────────────────────────
    async function loadKnowledgeBase() {
        try {
            const [sRes, tRes] = await Promise.all([
                fetch('/api/heritage'),
                fetch('/api/trails')
            ]);
            const sData = await sRes.json();
            const tData = await tRes.json();
            if (sData.success) kbSites  = sData.data || [];
            if (tData.success) kbTrails = tData.data || [];
            kbReady = true;
        } catch (e) {
            console.warn('[Chatbot] Knowledge base load failed:', e);
        }
    }

    // ── Intent detection ──────────────────────────────────────────────────────
    const DURATION_PATTERNS = [
        { re: /\b(one|1)\s*hour\b/,         maxMins: 60  },
        { re: /\b(two|2)\s*hours?\b/,        maxMins: 120 },
        { re: /\b(three|3)\s*hours?\b/,      maxMins: 180 },
        { re: /\bhalf[\s-]?day\b/,           maxMins: 240 },
        { re: /\bshort\b/,                   maxMins: 120 },
        { re: /\bquick\b/,                   maxMins: 90  },
        { re: /\blong\b/,                    maxMins: 999 },
        { re: /\bfull[\s-]?day\b/,           maxMins: 999 },
    ];

    const DIFFICULTY_MAP = {
        easy:     'EASY',
        moderate: 'MODERATE',
        medium:   'MODERATE',
        hard:     'HARD',
        difficult:'HARD',
        tough:    'HARD',
        challenging: 'HARD',
    };

    function detectIntent(q) {
        const n = normalise(q);

        // Help / greeting
        if (/^(hi|hello|hey|namaste|greetings|help|what can you do)\b/.test(n)) return { type: 'HELP' };

        // All sites
        if (/\b(all|list|show|tell|every|browse)\b.*\b(site|monument|heritage|place|location)\b/.test(n) ||
            /\b(heritage|monument|site|place)\b.*\b(list|all|show|available)\b/.test(n)) {
            return { type: 'LIST_SITES' };
        }

        // All trails
        if (/\b(all|list|show|available|every)\b.*\b(trail|walk|route|path)\b/.test(n) ||
            /\b(trail|walk|route|path)\b.*\b(list|all|show)\b/.test(n) ||
            /\bwalking trail\b/.test(n)) {
            return { type: 'LIST_TRAILS' };
        }

        // Trail by difficulty
        for (const [keyword, level] of Object.entries(DIFFICULTY_MAP)) {
            if (n.includes(keyword)) {
                // Only treat as difficulty if trail context present OR no other specific site name
                if (/trail|walk|route|path/.test(n) || !n.includes(' about ')) {
                    return { type: 'TRAIL_BY_DIFFICULTY', difficulty: level };
                }
            }
        }

        // Trail by duration
        for (const pat of DURATION_PATTERNS) {
            if (pat.re.test(n)) {
                return { type: 'TRAIL_BY_DURATION', maxMins: pat.maxMins };
            }
        }

        // Best / top rated sites
        if (/\b(best|top|highest|most popular|popular)\b.*\b(site|monument|heritage|place|rated)\b/.test(n) ||
            /\b(best|top|highest)\s*(rated|rating)\b/.test(n)) {
            return { type: 'TOP_RATED' };
        }

        // Sites by location / city
        const locMatch = n.match(/\b(?:sites?|monument|place|heritage)\s+in\s+([a-z ]+)/);
        if (locMatch) return { type: 'BY_LOCATION', city: locMatch[1].trim() };

        // "in [city]" general
        const cityMatch = n.match(/\bin\s+([a-z]+(?:\s+[a-z]+)?)\b/);
        if (cityMatch && !/\b(one|two|three|half|full|trail|walk)\b/.test(cityMatch[1])) {
            return { type: 'BY_LOCATION', city: cityMatch[1].trim() };
        }

        // Site info ("about", "tell", "what is", "describe", "show me")
        if (/\b(about|tell me|describe|what is|who built|history of|info|information)\b/.test(n)) {
            return { type: 'SITE_INFO', query: q };
        }

        // Feedback / rating general question
        if (/\b(rating|review|feedback|comment|visitor)\b/.test(n)) {
            return { type: 'FEEDBACK_HELP' };
        }

        // Default: try site name lookup
        return { type: 'SITE_INFO', query: q };
    }

    // ── Site name matcher (fuzzy keyword) ─────────────────────────────────────
    function findSite(query) {
        const n = normalise(query);
        // Remove filler words
        const cleaned = n.replace(/\b(tell me|about|what is|describe|history of|info|information|show|site|monument|heritage|place)\b/g, ' ').trim();

        let best = null;
        let bestScore = 0;

        for (const site of kbSites) {
            const nameWords = normalise(site.name).split(/\s+/);
            const locationWords = normalise(site.location || '').split(/\s+/);
            const allWords = [...nameWords, ...locationWords];

            let score = 0;
            for (const word of allWords) {
                if (word.length > 2 && cleaned.includes(word)) score += word.length; // longer match → higher score
            }
            if (score > bestScore) {
                bestScore = score;
                best = site;
            }
        }
        return bestScore >= 3 ? best : null; // threshold: at least 3 chars matched
    }

    // ── Response builders ──────────────────────────────────────────────────────
    function buildSiteCard(site) {
        const rating = fmtRating(site.averageRating);
        const link = `/pages/heritage-details.html?id=${site.id}`;
        return `<div class="cb-site-card">
  <strong>🏛 ${escHtml(site.name)}</strong><br>
  <span class="cb-meta">📍 ${escHtml(site.location)}</span><br>
  ${site.historicalPeriod ? `<span class="cb-meta">🕰 ${escHtml(site.historicalPeriod)}</span><br>` : ''}
  ${site.architecturalStyle ? `<span class="cb-meta">🏗 ${escHtml(site.architecturalStyle)}</span><br>` : ''}
  <span class="cb-meta">${rating} &nbsp;|&nbsp; ${site.feedbackCount || 0} reviews</span><br>
  ${site.description ? `<p class="cb-desc">${escHtml(site.description.slice(0, 120))}${site.description.length > 120 ? '…' : ''}</p>` : ''}
  <a href="${link}" class="cb-link" target="_blank">View full details →</a>
</div>`;
    }

    function buildTrailCard(trail) {
        const diff = trail.difficulty || 'N/A';
        const diffClass = `cb-diff-${diff.toLowerCase()}`;
        const link = `/pages/trail-details.html?id=${trail.id}`;
        return `<div class="cb-trail-card">
  <strong>🥾 ${escHtml(trail.name)}</strong><br>
  <span class="cb-badge ${diffClass}">${escHtml(diff)}</span><br>
  <span class="cb-meta">📏 ${trail.distance || 'N/A'} km &nbsp;|&nbsp; ⏱ ${fmtDuration(trail.estimatedDuration)}</span><br>
  ${trail.description ? `<p class="cb-desc">${escHtml(trail.description.slice(0, 100))}${trail.description.length > 100 ? '…' : ''}</p>` : ''}
  <a href="${link}" class="cb-link" target="_blank">View trail →</a>
</div>`;
    }

    // ── Main NLP processor ────────────────────────────────────────────────────
    function processMessage(userText) {
        if (!kbReady) {
            return '⏳ I\'m still loading the knowledge base. Please try again in a moment!';
        }

        const intent = detectIntent(userText);

        switch (intent.type) {

            case 'HELP':
                return `👋 Hi! I'm the <strong>Heritage Walk Assistant</strong>.<br><br>
You can ask me things like:<br>
• <em>"Tell me about Taj Mahal"</em><br>
• <em>"Which trail can I explore in one hour?"</em><br>
• <em>"Show me easy trails"</em><br>
• <em>"List all heritage sites"</em><br>
• <em>"Best rated sites"</em><br>
• <em>"Sites in Agra"</em><br><br>
How can I help you today? 😊`;

            case 'LIST_SITES': {
                if (kbSites.length === 0) return '🔍 No heritage sites found in the database.';
                const list = kbSites.map(s =>
                    `• <a href="/pages/heritage-details.html?id=${s.id}" class="cb-link" target="_blank">${escHtml(s.name)}</a> — ${escHtml(s.location)}`
                ).join('<br>');
                return `🏛 <strong>All Heritage Sites (${kbSites.length})</strong><br><br>${list}`;
            }

            case 'LIST_TRAILS': {
                if (kbTrails.length === 0) return '🔍 No walking trails found in the database.';
                return `🥾 <strong>Available Walking Trails (${kbTrails.length})</strong><br><br>` +
                    kbTrails.map(buildTrailCard).join('');
            }

            case 'TRAIL_BY_DIFFICULTY': {
                const matched = kbTrails.filter(t => t.difficulty === intent.difficulty);
                if (matched.length === 0) {
                    return `😕 No <strong>${intent.difficulty}</strong> trails found. Try "easy", "moderate", or "hard".`;
                }
                return `🥾 <strong>${intent.difficulty} Trails (${matched.length})</strong><br><br>` +
                    matched.map(buildTrailCard).join('');
            }

            case 'TRAIL_BY_DURATION': {
                const matched = intent.maxMins === 999
                    ? kbTrails.filter(t => t.estimatedDuration >= 240)
                    : kbTrails.filter(t => t.estimatedDuration <= intent.maxMins);
                if (matched.length === 0) {
                    return `😕 No trails match that duration. Available durations: ${kbTrails.map(t => fmtDuration(t.estimatedDuration)).join(', ')}.`;
                }
                const label = intent.maxMins === 999 ? 'Full-day' : `≤ ${fmtDuration(intent.maxMins)}`;
                return `⏱ <strong>Trails (${label})</strong><br><br>` +
                    matched.map(buildTrailCard).join('');
            }

            case 'TOP_RATED': {
                const sorted = [...kbSites]
                    .filter(s => s.averageRating)
                    .sort((a, b) => b.averageRating - a.averageRating)
                    .slice(0, 5);
                if (sorted.length === 0) return '🔍 No rated sites yet. Be the first to leave a review!';
                return `⭐ <strong>Top Rated Heritage Sites</strong><br><br>` +
                    sorted.map((s, i) =>
                        `${i + 1}. <a href="/pages/heritage-details.html?id=${s.id}" class="cb-link" target="_blank">${escHtml(s.name)}</a> — ⭐ ${parseFloat(s.averageRating).toFixed(1)} (${s.feedbackCount || 0} reviews)`
                    ).join('<br>');
            }

            case 'BY_LOCATION': {
                const city = intent.city;
                const matched = kbSites.filter(s =>
                    normalise(s.location || '').includes(city)
                );
                if (matched.length === 0) {
                    return `🔍 No sites found in <strong>${escHtml(city)}</strong>. Try searching for cities like Agra, Delhi, Mumbai, or Chennai.`;
                }
                return `📍 <strong>Heritage Sites in ${escHtml(city)} (${matched.length})</strong><br><br>` +
                    matched.map(buildSiteCard).join('');
            }

            case 'FEEDBACK_HELP':
                return `💬 <strong>Visitor Feedback</strong><br><br>
You can leave reviews for heritage sites after visiting them.<br>
• <a href="/pages/feedback.html" class="cb-link">Submit Feedback</a><br>
• <a href="/pages/visitor-dashboard.html" class="cb-link">Your Dashboard</a><br>
• <a href="/pages/my-feedback.html" class="cb-link">My Reviews</a>`;

            case 'SITE_INFO': {
                const site = findSite(intent.query);
                if (site) return buildSiteCard(site);
                return `🤔 I couldn't find a specific site for "<em>${escHtml(userText)}</em>".<br><br>
Try asking:<br>
• <em>"Tell me about Taj Mahal"</em><br>
• <em>"List all heritage sites"</em><br>
• <em>"Sites in Agra"</em>`;
            }

            default:
                return `🤔 I'm not sure I understood that. Type <em>"help"</em> to see what I can do!`;
        }
    }

    // ── DOM: inject chatbot widget ────────────────────────────────────────────
    function injectWidget() {
        const html = `
<div id="cb-wrapper">
  <!-- Toggle button -->
  <button id="cb-toggle" aria-label="Open Heritage Assistant chat" title="Chat with Heritage Assistant">
    <i class="bi bi-chat-dots-fill" id="cb-icon-open"></i>
    <i class="bi bi-x-lg d-none" id="cb-icon-close"></i>
    <span class="cb-pulse" id="cb-pulse"></span>
  </button>

  <!-- Chat panel -->
  <div id="cb-panel" class="d-none" role="dialog" aria-label="Heritage Walk Chat Assistant">
    <div id="cb-header">
      <div class="d-flex align-items-center gap-2">
        <i class="bi bi-bank2"></i>
        <div>
          <div class="fw-bold" style="line-height:1.2">Heritage Assistant</div>
          <div style="font-size:0.7rem;opacity:0.85">AI-powered trail &amp; site guide</div>
        </div>
      </div>
      <button id="cb-close-btn" class="btn btn-sm text-white p-0" aria-label="Close chat">
        <i class="bi bi-x-lg fs-5"></i>
      </button>
    </div>

    <div id="cb-messages" aria-live="polite" aria-label="Chat messages"></div>

    <div id="cb-input-row">
      <input id="cb-input" type="text" placeholder="Ask about sites, trails…" autocomplete="off" maxlength="200">
      <button id="cb-send" aria-label="Send message">
        <i class="bi bi-send-fill"></i>
      </button>
    </div>
  </div>
</div>`;

        const container = document.createElement('div');
        container.innerHTML = html.trim();
        document.body.appendChild(container.firstChild);

        // Wire events
        document.getElementById('cb-toggle').addEventListener('click', toggleChat);
        document.getElementById('cb-close-btn').addEventListener('click', toggleChat);
        document.getElementById('cb-send').addEventListener('click', handleSend);
        document.getElementById('cb-input').addEventListener('keydown', e => {
            if (e.key === 'Enter') handleSend();
        });

        // Show welcome message after a short delay
        setTimeout(() => appendBotMessage(
            `👋 Welcome! I'm your <strong>Heritage Walk Assistant</strong>.<br>Ask me about sites, trails, or type <em>"help"</em> for examples!`
        ), 400);
    }

    function toggleChat() {
        chatOpen = !chatOpen;
        const panel   = document.getElementById('cb-panel');
        const iconO   = document.getElementById('cb-icon-open');
        const iconC   = document.getElementById('cb-icon-close');
        const pulse   = document.getElementById('cb-pulse');

        if (chatOpen) {
            panel.classList.remove('d-none');
            panel.classList.add('cb-slide-in');
            iconO.classList.add('d-none');
            iconC.classList.remove('d-none');
            if (pulse) pulse.style.display = 'none';
            document.getElementById('cb-input').focus();
        } else {
            panel.classList.add('d-none');
            panel.classList.remove('cb-slide-in');
            iconO.classList.remove('d-none');
            iconC.classList.add('d-none');
        }
    }

    function handleSend() {
        const input = document.getElementById('cb-input');
        const text  = input.value.trim();
        if (!text) return;
        input.value = '';
        appendUserMessage(text);
        showTyping();
        setTimeout(() => {
            removeTyping();
            const reply = processMessage(text);
            appendBotMessage(reply);
        }, 600);
    }

    function appendUserMessage(text) {
        const msgs = document.getElementById('cb-messages');
        const div  = document.createElement('div');
        div.className = 'cb-msg cb-user';
        div.textContent = text;
        msgs.appendChild(div);
        msgs.scrollTop = msgs.scrollHeight;
    }

    function appendBotMessage(html) {
        const msgs = document.getElementById('cb-messages');
        const div  = document.createElement('div');
        div.className = 'cb-msg cb-bot';
        div.innerHTML  = html;
        msgs.appendChild(div);
        msgs.scrollTop = msgs.scrollHeight;
    }

    function showTyping() {
        const msgs = document.getElementById('cb-messages');
        const div  = document.createElement('div');
        div.className = 'cb-msg cb-bot cb-typing';
        div.id = 'cb-typing-indicator';
        div.innerHTML = '<span></span><span></span><span></span>';
        msgs.appendChild(div);
        msgs.scrollTop = msgs.scrollHeight;
    }

    function removeTyping() {
        const el = document.getElementById('cb-typing-indicator');
        if (el) el.remove();
    }

    // ── Bootstrap ─────────────────────────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', () => {
        injectWidget();
        loadKnowledgeBase();
    });

})();

