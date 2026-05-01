package com.epidemiwatch.resource;

import com.epidemiwatch.service.OutbreakDetectorService;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.jboss.logging.Logger;

import java.util.Map;

@Path("/api/detect")
@Produces(MediaType.APPLICATION_JSON)
public class DetectionResource {

    private static final Logger LOG = Logger.getLogger(DetectionResource.class);

    @Inject
    OutbreakDetectorService detectorService;

    /**
     * Triggers outbreak detection across all active county+disease pairs.
     *
     * <p>This endpoint is IDEMPOTENT: calling it multiple times in the same
     * ISO week will not create duplicate alerts. Existing alerts are only
     * updated when severity escalates.
     *
     * @return JSON summary of the run: alertsCreated, alertsUpdated, alertsSkipped
     */
    @POST
    @Transactional
    public Response runDetection() {
        LOG.info("Outbreak detection triggered via POST /api/detect");

        OutbreakDetectorService.DetectionResult result = detectorService.detectOutbreaks();

        return Response.ok(Map.of(
            "alertsCreated", result.alertsCreated(),
            "alertsUpdated", result.alertsUpdated(),
            "alertsSkipped", result.alertsSkipped()
        )).build();
    }
}

