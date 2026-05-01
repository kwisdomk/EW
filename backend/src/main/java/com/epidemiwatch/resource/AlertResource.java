package com.epidemiwatch.resource;

import com.epidemiwatch.entity.OutbreakAlert;
import com.epidemiwatch.repository.OutbreakAlertRepository;
import com.epidemiwatch.sse.AlertBroadcaster;
import com.epidemiwatch.util.DataNormalizer;
import io.smallrye.mutiny.Multi;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;
import java.util.Map;

@Path("/api/alerts")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AlertResource {

    @Inject
    OutbreakAlertRepository alertRepository;

    @Inject
    AlertBroadcaster alertBroadcaster;

    // -----------------------------------------------------------------------
    // GET /api/alerts
    //   ?page=0&size=20               → all alerts (paginated)
    //   ?county=Nairobi               → filter by county
    //   ?severity=RED                 → filter by severity
    // -----------------------------------------------------------------------
    @GET
    public Response listAll(
            @QueryParam("page")     @DefaultValue("0")  int page,
            @QueryParam("size")     @DefaultValue("20") int size,
            @QueryParam("county")   String county,
            @QueryParam("severity") String severity) {

        // Validate page and size (Priority 6)
        if (page < 0 || size <= 0 || size > 100) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of(
                    "error",   "Validation failed",
                    "details", "Page must be >= 0 and size between 1 and 100"
                ))
                .build();
        }

        // Normalize filter params
        String normCounty = (county != null && !county.isBlank())
                            ? DataNormalizer.normalizeCounty(county) : null;
        
        String normSeverity = (severity != null && !severity.isBlank())
                              ? severity.trim().toUpperCase() : null;

        List<OutbreakAlert> results;

        if (normCounty != null && normSeverity != null) {
            results = alertRepository.findByCountyAndSeverity(normCounty, normSeverity, page, size);
        } else if (normCounty != null) {
            results = alertRepository.findByCounty(normCounty, page, size);
        } else if (normSeverity != null) {
            results = alertRepository.findBySeverity(normSeverity, page, size);
        } else {
            results = alertRepository.findAllPaged(page, size);
        }

        return Response.ok(results).build();
    }

    // -----------------------------------------------------------------------
    // GET /api/alerts/stream (SSE Live Feed)
    // -----------------------------------------------------------------------
    @GET
    @Path("/stream")
    @Produces(MediaType.SERVER_SENT_EVENTS)
    public Multi<OutbreakAlert> streamAlerts() {
        return alertBroadcaster.stream();
    }

    // -----------------------------------------------------------------------
    // GET /api/alerts/unacknowledged
    // -----------------------------------------------------------------------
    @GET
    @Path("/unacknowledged")
    public List<OutbreakAlert> listUnacknowledged() {
        return alertRepository.findUnacknowledged();
    }

    // -----------------------------------------------------------------------
    // PUT /api/alerts/{id}/acknowledge
    // -----------------------------------------------------------------------
    @PUT
    @Path("/{id}/acknowledge")
    @Transactional
    public Response acknowledge(@PathParam("id") Long id) {
        OutbreakAlert alert = alertRepository.findById(id);
        if (alert == null) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(Map.of("error", "Alert not found"))
                .build();
        }
        alert.acknowledged = true;
        alertRepository.persist(alert);
        return Response.ok(alert).build();
    }
}
