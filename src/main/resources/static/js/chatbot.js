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
        { re: /\b(one|1)\s*(hour|hr)s?\b/,         maxMins: 60  },
        { re: /\b(two|2)\s*(hour|hr)s?\b/,          maxMins: 120 },
        { re: /\b(three|3)\s*(hour|hr)s?\b/,        maxMins: 180 },
        { re: /\b(four|4)\s*(hour|hr)s?\b/,         maxMins: 240 },
        { re: /\b(five|5)\s*(hour|hr)s?\b/,         maxMins: 300 },
        { re: /\bhalf[\s-]?day\b/,                  maxMins: 240 },
        { re: /\bshort\b/,                          maxMins: 120 },
        { re: /\bquick\b/,                          maxMins: 90  },
        { re: /\blong\b/,                           maxMins: 999 },
        { re: /\bfull[\s-]?day\b/,                  maxMins: 999 },
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
        if (/\b(all|list|show|available|every|which|what)\b.*\b(trail|walk|route|path)\b/.test(n) ||
            /\b(trail|walk|route|path)\b.*\b(list|all|show|which|can|suggest|recommend)\b/.test(n) ||
            /\bwalking trail\b/.test(n)) {
            // But only if it's asking to LIST — not duration/difficulty filtered
            // (duration/difficulty checks happen next, so this handles pure listing)
            const hasDuration = DURATION_PATTERNS.some(p => p.re.test(n));
            const hasDifficulty = Object.keys(DIFFICULTY_MAP).some(k => n.includes(k));
            if (!hasDuration && !hasDifficulty) {
                return { type: 'LIST_TRAILS' };
            }
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

        // Recommendations / suggestions (elderly, family, kids, first time, beginner)
        if (/\b(suggest|recommend|recommendation|suggestion|advice|advise)\b/.test(n) ||
            /\b(elderly|senior|old age|grandparent|grandfather|grandmother|aged)\b/.test(n) ||
            /\b(family|kids|children|child|toddler|baby|infant)\b/.test(n) ||
            /\b(first time|beginner|first visit|newbie|never been)\b/.test(n) ||
            /\b(what should i|where should i|what can i|where can i)\b.*\b(see|visit|go|explore)\b/.test(n) ||
            /\b(visiting with|coming with|travelling with|traveling with)\b/.test(n)) {
            // Detect visitor type from query
            const isElderly = /\b(elderly|senior|old age|grandparent|grandfather|grandmother|aged)\b/.test(n);
            const isKids    = /\b(kids|children|child|toddler|baby|infant|family)\b/.test(n);
            return { type: 'RECOMMEND', forElderly: isElderly, forKids: isKids };
        }

        // Sites by location / city
        const locMatch = n.match(/\b(?:sites?|monument|place|heritage)\s+in\s+([a-z ]+)/);
        if (locMatch) return { type: 'BY_LOCATION', city: locMatch[1].trim() };

        // "in [city]" general
        const cityMatch = n.match(/\bin\s+([a-z]+(?:\s+[a-z]+)?)\b/);
        if (cityMatch && !/\b(one|two|three|four|five|half|full|trail|walk|hr|hrs|hour|hours|min|mins|minutes)\b/.test(cityMatch[1])) {
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
• <em>"Which trail can I explore in 3 hours?"</em><br>
• <em>"Show me easy trails"</em><br>
• <em>"I'm visiting with elderly parents, suggest places"</em><br>
• <em>"Recommend something for kids"</em><br>
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
                    // No exact match — find the shortest trail as a closest suggestion
                    const sorted = [...kbTrails].sort((a, b) => a.estimatedDuration - b.estimatedDuration);
                    const closest = sorted[0];
                    const requested = intent.maxMins === 999 ? 'a full day' : `<strong>${fmtDuration(intent.maxMins)}</strong>`;
                    return `😕 No trail fits within ${requested}.<br><br>
Our shortest trail takes <strong>${fmtDuration(closest.estimatedDuration)}</strong>. Here's your closest option:<br><br>` +
                        buildTrailCard(closest) +
                        `<br><span class="cb-meta">💡 Tip: Try <em>"show all trails"</em> to compare all options.</span>`;
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

            case 'RECOMMEND': {
                // Pick the EASY trail as best for elderly/kids/beginners
                const easyTrails = kbTrails.filter(t => t.difficulty === 'EASY');
                const bestTrail  = easyTrails.length > 0 ? easyTrails[0] : (kbTrails.length > 0 ? kbTrails[0] : null);

                // Pick highest-rated sites (or first 3 if no ratings)
                const ratedSites = [...kbSites]
                    .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
                    .slice(0, 3);

                let heading, tips;
                if (intent.forElderly) {
                    heading = '👴👵 Recommendations for Elderly Visitors';
                    tips = `<br><span class="cb-meta">💡 <strong>Tips:</strong> Choose the EASY trail for less walking, visit temples during cooler mornings, and carry water.</span>`;
                } else if (intent.forKids) {
                    heading = '👨‍👩‍👧 Recommendations for Families with Kids';
                    tips = `<br><span class="cb-meta">💡 <strong>Tips:</strong> The EASY trail is child-friendly. Caves and palaces are especially exciting for children!</span>`;
                } else {
                    heading = '🗺️ Recommended Heritage Experiences';
                    tips = `<br><span class="cb-meta">💡 Start with the EASY trail if it's your first visit.</span>`;
                }

                let result = `${heading}<br><br>`;
                result += `<strong>🥾 Best Trail for You:</strong><br>`;
                result += bestTrail ? buildTrailCard(bestTrail) : 'No trails available.';
                result += `<br><strong>⭐ Top Recommended Sites:</strong><br>`;
                result += ratedSites.map(buildSiteCard).join('');
                result += tips;
                return result;
            }

            case 'SITE_INFO': {
                const site = findSite(intent.query);
                if (site) return buildSiteCard(site);
                // Smart fallback — never a dead end
                const topSites = [...kbSites]
                    .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
                    .slice(0, 3);
                return `🤔 I'm not sure what you're looking for. Here are our most popular sites:<br><br>` +
                    topSites.map(s =>
                        `• <a href="/pages/heritage-details.html?id=${s.id}" class="cb-link" target="_blank">${escHtml(s.name)}</a> — ${escHtml(s.location)}`
                    ).join('<br>') +
                    `<br><br><span class="cb-meta">Try: <em>"Tell me about Taj Mahal"</em> | <em>"Show easy trails"</em> | <em>"Help"</em></span>`;
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
        // Call Gemini AI via backend — with rule-based fallback
        callAI(text);
    }

    // ── AI call: POST /api/chat → Gemini via Spring Boot backend ─────────────
    async function callAI(userText) {
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userText })
            });
            const data = await res.json();
            removeTyping();
            if (data.success && data.reply) {
                // Gemini returns plain text — render as formatted text
                appendBotMessage(formatAIReply(data.reply));
            } else {
                // API returned an error — use local rule-based fallback
                appendBotMessage(processMessage(userText));
            }
        } catch (err) {
            // Network error — use local rule-based fallback
            removeTyping();
            appendBotMessage(processMessage(userText));
        }
    }

    // ── Format Gemini plain-text reply into readable HTML ─────────────────────
    function formatAIReply(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            // Bold: **text**
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Italic: *text*
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Bullet points: lines starting with - or *
            .replace(/^[-•]\s+(.+)$/gm, '• $1')
            // URLs → clickable links
            .replace(/(\/pages\/[^\s"]+)/g, '<a href="$1" class="cb-link" target="_blank">$1</a>')
            // Line breaks
            .replace(/\n\n/g, '<br><br>')
            .replace(/\n/g, '<br>');
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

