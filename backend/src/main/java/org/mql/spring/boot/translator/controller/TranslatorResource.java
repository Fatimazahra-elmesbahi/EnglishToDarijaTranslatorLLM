package org.mql.spring.boot.translator.controller;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.mql.spring.boot.translator.model.TranslationRequest;
import org.mql.spring.boot.translator.model.TranslationResponse;
import org.mql.spring.boot.translator.service.TranslationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
@Path("/translator")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TranslatorResource {
    
    private static final Logger logger = LoggerFactory.getLogger(TranslatorResource.class);
    
    @Autowired
    private TranslationService translationService;
    
    @POST
    @Path("/translate")
    public Response translate(TranslationRequest request) {
        try {
            logger.info("Translation request: {}", request.getText());
            
            // Validation
            if (request.getText() == null || request.getText().trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(Map.of("error", "Text is required"))
                        .build();
            }
            
            // Translate
            TranslationResponse response = translationService.translate(request);
            
            return Response.ok(response).build();
            
        } catch (Exception e) {
            logger.error("Translation error", e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }
    
    @GET
    @Path("/health")
    public Response health() {
        return Response.ok(Map.of(
                "status", "UP",
                "service", "Darija Translator",
                "timestamp", System.currentTimeMillis()
        )).build();
    }
    
    @GET
    @Path("/languages")
    public Response getLanguages() {
        return Response.ok(Map.of(
                "source", List.of("en"),
                "target", List.of("darija"),
                "description", "English to Moroccan Darija"
        )).build();
    }
}