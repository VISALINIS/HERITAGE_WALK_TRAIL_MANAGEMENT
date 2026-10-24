package com.heritagewalk.controller;

import com.heritagewalk.dto.HeritageSiteDto;
import com.heritagewalk.dto.TrailDto;
import com.heritagewalk.service.HeritageSiteService;
import com.heritagewalk.service.TrailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * ChatbotController — Gemini AI-powered Heritage Walk Assistant
 * =============================================================
 * POST /api/chat
 *   Request:  { "message": "user's question" }
 *   Response: { "success": true, "reply": "AI answer..." }
 *
 * Builds a context-aware prompt using live DB data (sites + trails),
 * then calls the Google Gemini API. Falls back to a friendly error
 * message if the API call fails.
 *
 * Security: Publicly accessible (no auth required) — read-only chatbot.
 * API key stays server-side, never exposed to the browser.
 */
@RestController
@RequestMapping("/api/chat")
public class ChatbotController {

    @Autowired
    private HeritageSiteService heritageSiteService;

    @Autowired
    private TrailService trailService;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    // ── POST /api/chat ───────────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<Map<String, Object>> chat(@RequestBody Map<String, String> body) {
        String userMessage = body.getOrDefault("message", "").trim();
        Map<String, Object> response = new HashMap<>();

        if (userMessage.isEmpty()) {
            response.put("success", false);
            response.put("reply", "Please type a message.");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            // 1. Build knowledge base from live DB
            String knowledgeBase = buildKnowledgeBase();

            // 2. Build the full prompt for Gemini
            String prompt = buildPrompt(knowledgeBase, userMessage);

            // 3. Call Gemini API
            String aiReply = callGemini(prompt);

            response.put("success", true);
            response.put("reply", aiReply);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            // Graceful fallback — never crash the user experience
            response.put("success", false);
            response.put("reply", "I'm having trouble connecting to the AI right now. " +
                    "Please try again in a moment, or ask me something simpler like " +
                    "\"List all heritage sites\" or \"Show easy trails\".");
            return ResponseEntity.ok(response);
        }
    }

    // ── Build knowledge base string from DB ──────────────────────────────────
    private String buildKnowledgeBase() {
        List<HeritageSiteDto> sites = heritageSiteService.getAllSites(null, null, null);
        List<TrailDto> trails = trailService.getAllTrails();

        StringBuilder kb = new StringBuilder();

        kb.append("=== HERITAGE SITES ===\n");
        for (HeritageSiteDto site : sites) {
            kb.append("- Name: ").append(site.getName()).append("\n");
            kb.append("  Location: ").append(site.getLocation()).append("\n");
            if (site.getHistoricalPeriod() != null)
                kb.append("  Historical Period: ").append(site.getHistoricalPeriod()).append("\n");
            if (site.getArchitecturalStyle() != null)
                kb.append("  Architectural Style: ").append(site.getArchitecturalStyle()).append("\n");
            if (site.getCulturalSignificance() != null)
                kb.append("  Cultural Significance: ").append(site.getCulturalSignificance()).append("\n");
            kb.append("  Description: ").append(site.getDescription()).append("\n");
            kb.append("  Visitor Rating: ").append(
                    site.getAverageRating() != null ? String.format("%.1f/5", site.getAverageRating()) : "N/A"
            ).append(" (").append(site.getFeedbackCount()).append(" reviews)\n");
            kb.append("  Page URL: /pages/heritage-details.html?id=").append(site.getId()).append("\n\n");
        }

        kb.append("=== WALKING TRAILS ===\n");
        for (TrailDto trail : trails) {
            kb.append("- Name: ").append(trail.getName()).append("\n");
            kb.append("  Difficulty: ").append(trail.getDifficulty()).append("\n");
            kb.append("  Distance: ").append(trail.getDistance()).append(" km\n");
            int mins = trail.getEstimatedDuration() != null ? trail.getEstimatedDuration() : 0;
            int h = mins / 60, m = mins % 60;
            String dur = h > 0 ? (m > 0 ? h + "h " + m + "min" : h + "h") : m + "min";
            kb.append("  Duration: ").append(dur).append("\n");
            kb.append("  Starting Point: ").append(trail.getStartingPoint()).append("\n");
            kb.append("  Ending Point: ").append(trail.getEndingPoint()).append("\n");
            kb.append("  Description: ").append(trail.getDescription()).append("\n");
            if (trail.getStops() != null && !trail.getStops().isEmpty()) {
                kb.append("  Trail Stops: ");
                trail.getStops().forEach(s -> kb.append(s.getHeritageSiteName()).append(", "));
                kb.setLength(kb.length() - 2); // remove trailing comma
                kb.append("\n");
            }
            kb.append("  Page URL: /pages/trail-details.html?id=").append(trail.getId()).append("\n\n");
        }

        return kb.toString();
    }

    // ── Build Gemini prompt ───────────────────────────────────────────────────
    private String buildPrompt(String knowledgeBase, String userMessage) {
        return "You are the Heritage Walk Assistant — a friendly, knowledgeable guide for " +
                "the Heritage Walk Trail Management platform.\n\n" +
                "You ONLY answer questions about the heritage sites and walking trails listed below. " +
                "Do not make up information that is not in the data.\n" +
                "Keep answers concise, helpful, and enthusiastic about cultural heritage.\n" +
                "When mentioning a site or trail, include its page URL as a link suggestion.\n" +
                "If a question is completely unrelated to heritage sites or trails, politely " +
                "redirect the user to ask about the available sites and trails.\n\n" +
                "LIVE DATA FROM DATABASE:\n" +
                knowledgeBase +
                "\n---\nVISITOR'S QUESTION: " + userMessage + "\n\n" +
                "YOUR ANSWER (be concise, friendly, and use the data above):";
    }

    // ── Call Gemini REST API ──────────────────────────────────────────────────
    private String callGemini(String prompt) {
        String url = geminiApiUrl + "?key=" + geminiApiKey;

        // Build request body as JSON string (avoids needing Jackson configuration)
        String escapedPrompt = prompt
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");

        String requestBody = "{\n" +
                "  \"contents\": [{\n" +
                "    \"parts\": [{\n" +
                "      \"text\": \"" + escapedPrompt + "\"\n" +
                "    }]\n" +
                "  }],\n" +
                "  \"generationConfig\": {\n" +
                "    \"temperature\": 0.7,\n" +
                "    \"maxOutputTokens\": 512\n" +
                "  }\n" +
                "}";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<Map> geminiResponse = restTemplate.exchange(
                url, HttpMethod.POST, entity, Map.class
        );

        // Parse: response.candidates[0].content.parts[0].text
        Map body = geminiResponse.getBody();
        if (body == null) throw new RuntimeException("Empty response from Gemini");

        List candidates = (List) body.get("candidates");
        if (candidates == null || candidates.isEmpty()) throw new RuntimeException("No candidates in response");

        Map candidate = (Map) candidates.get(0);
        Map content = (Map) candidate.get("content");
        List parts = (List) content.get("parts");
        Map part = (Map) parts.get(0);

        return (String) part.get("text");
    }
}
