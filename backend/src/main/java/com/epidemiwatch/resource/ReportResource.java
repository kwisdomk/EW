package com.epidemiwatch.resource;

import com.epidemiwatch.entity.DiseaseReport;
import com.epidemiwatch.repository.DiseaseReportRepository;
import com.epidemiwatch.util.DataNormalizer;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;
import java.util.Map;

@Path("/api/reports")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ReportResource {

    @Inject
    DiseaseReportRepository reportRepository;

    // -----------------------------------------------------------------------
    // GET /api/reports
    //   ?page=0&size=20               → all reports (paginated)
    //   ?county=Nairobi               → filter by county
    //   ?disease=cholera              → filter by disease
    //   ?county=Nairobi&disease=cholera → filter by both
    // -----------------------------------------------------------------------
    @GET
    public List<DiseaseReport> listAll(
            @QueryParam("page")    @DefaultValue("0")  int page,
            @QueryParam("size")    @DefaultValue("20") int size,
            @QueryParam("county")  String county,
            @QueryParam("disease") String disease) {

        // Normalize filter params before hitting the DB
        String normCounty  = (county  != null && !county.isBlank())
                             ? DataNormalizer.normalizeCounty(county)  : null;
        String normDisease = (disease != null && !disease.isBlank())
                             ? DataNormalizer.normalizeDisease(disease) : null;

        if (normCounty != null && normDisease != null) {
            return reportRepository.findByCountyAndDisease(normCounty, normDisease, page, size);
        } else if (normCounty != null) {
            return reportRepository.findByCounty(normCounty, page, size);
        } else if (normDisease != null) {
            return reportRepository.findByDisease(normDisease, page, size);
        } else {
            return reportRepository.findAllOrderedByDate(page, size);
        }
    }

    // -----------------------------------------------------------------------
    // GET /api/reports/{id}
    // -----------------------------------------------------------------------
    @GET
    @Path("/{id}")
    public Response getById(@PathParam("id") Long id) {
        DiseaseReport report = reportRepository.findById(id);
        if (report == null) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(Map.of(
                    "error",   "Report not found",
                    "details", "No report exists with id " + id
                ))
                .build();
        }
        return Response.ok(report).build();
    }

    // -----------------------------------------------------------------------
    // POST /api/reports
    // -----------------------------------------------------------------------
    @POST
    @Transactional
    public Response create(DiseaseReport report) {
        if (report == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of(
                    "error",   "Validation failed",
                    "details", "Request body is required"
                ))
                .build();
        }
        if (report.county == null || report.disease == null || report.cases == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of(
                    "error",   "Validation failed",
                    "details", "county, disease, and cases are required"
                ))
                .build();
        }
        if (report.cases <= 0) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of(
                    "error",   "Validation failed",
                    "details", "Cases must be greater than zero"
                ))
                .build();
        }

        // Normalize all string fields before persisting
        report.county    = DataNormalizer.normalizeCounty(report.county);
        report.disease   = DataNormalizer.normalizeDisease(report.disease);
        report.subCounty = DataNormalizer.normalizeSubCounty(report.subCounty);

        reportRepository.persist(report);
        return Response.status(Response.Status.CREATED).entity(report).build();
    }

    // -----------------------------------------------------------------------
    // DELETE /api/reports/{id}
    // -----------------------------------------------------------------------
    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") Long id) {
        DiseaseReport report = reportRepository.findById(id);
        if (report == null) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(Map.of(
                    "error",   "Report not found",
                    "details", "No report exists with id " + id
                ))
                .build();
        }
        reportRepository.delete(report);
        return Response.noContent().build();
    }
}
