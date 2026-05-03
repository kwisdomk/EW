package com.epidemiwatch.security;

import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.Provider;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.io.IOException;
import java.util.Map;
import java.util.Set;

/**
 * Hackathon-grade API key security filter for EpidermiWatch.
 *
 * <p>Protected methods/paths require the header {@code X-API-KEY: epidemiwatch-dev}.
 * All GET endpoints are intentionally left open to allow dashboard and health-check
 * access without credentials.
 *
 * <p>Protected:
 * <ul>
 *   <li>POST /api/reports</li>
 *   <li>DELETE /api/reports/*</li>
 *   <li>POST /api/detect</li>
 * </ul>
 *
 * <p>Always allowed (no key required):
 * <ul>
 *   <li>GET /health</li>
 *   <li>GET /api/reports</li>
 *   <li>GET /api/alerts</li>
 *   <li>GET /api/alerts/stream</li>
 *   <li>PUT /api/alerts/{id}/acknowledge</li>
 *   <li>OPTIONS (CORS preflight)</li>
 * </ul>
 */
@Provider
public class ApiKeyFilter implements ContainerRequestFilter {

    private static final Logger LOG = Logger.getLogger(ApiKeyFilter.class);

    /** The valid API key injected from configuration. */
    @ConfigProperty(name = "epidemiwatch.api.key")
    String validApiKey;

    private static final String API_KEY_HEADER = "X-API-KEY";

    /**
     * HTTP methods that are always allowed without an API key.
     * GET is public; OPTIONS is required for CORS preflight.
     */
    private static final Set<String> OPEN_METHODS = Set.of("GET", "OPTIONS");

    /**
     * Explicit path+method combinations that require the API key.
     * Evaluated after the open-method check.
     */
    private static final Set<String> PROTECTED_PREFIXES = Set.of(
        "POST:/api/reports",
        "DELETE:/api/reports",
        "POST:/api/detect"
    );

    @Override
    public void filter(ContainerRequestContext ctx) throws IOException {
        String method = ctx.getMethod();
        String path   = ctx.getUriInfo().getPath(); // e.g. "/api/detect"

        // ── Allow all GET / OPTIONS without a key ─────────────────────────────
        if (OPEN_METHODS.contains(method)) {
            return;
        }

        // ── PUT /api/alerts/{id}/acknowledge is also open ─────────────────────
        if ("PUT".equals(method) && path.startsWith("/api/alerts/")) {
            return;
        }

        // ── Check if this method+path combo is protected ──────────────────────
        String key = method + ":" + basePath(path);
        boolean isProtected = PROTECTED_PREFIXES.stream()
            .anyMatch(key::startsWith);

        if (!isProtected) {
            return; // not a protected route — pass through
        }

        // ── Validate the API key ───────────────────────────────────────────────
        String providedKey = ctx.getHeaderString(API_KEY_HEADER);

        if (providedKey == null || !validApiKey.equals(providedKey.trim())) {
            LOG.warnf("[Security] Unauthorized request: %s %s", method, path);
            ctx.abortWith(
                Response.status(Response.Status.UNAUTHORIZED)
                    .type(MediaType.APPLICATION_JSON)
                    .entity(Map.of(
                        "error",   "Unauthorized",
                        "details", "Missing or invalid API key. Include a valid 'X-API-KEY' header."
                    ))
                    .build()
            );
        }
    }

    /**
     * Strips any trailing path segments for prefix-matching.
     * e.g. "/api/reports/42" → "/api/reports"
     */
    private String basePath(String path) {
        // Normalize to at most 2 segments for prefix match
        String[] parts = path.replaceAll("^/", "").split("/");
        if (parts.length >= 2) {
            return "/" + parts[0] + "/" + parts[1];
        }
        return path;
    }
}
