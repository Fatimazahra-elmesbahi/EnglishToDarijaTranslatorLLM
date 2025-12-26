package org.mql.spring.boot.translator.controller;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.mql.spring.boot.translator.service.AudioService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Base64;
import java.util.Map;

@Component
@Path("/audio")
@Produces(MediaType.APPLICATION_JSON)
public class AudioResource {
    
    private static final Logger logger = LoggerFactory.getLogger(AudioResource.class);
    
    @Autowired
    private AudioService audioService;
    
    @POST
    @Path("/speech-to-text")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response speechToText(Map<String, String> request) {
        try {
            String audioBase64 = request.get("audio");
            
            if (audioBase64 == null || audioBase64.isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(Map.of("error", "Audio data is required"))
                        .build();
            }
            
            byte[] audioData = Base64.getDecoder().decode(audioBase64.split(",")[1]);
            
            //  vers le texte
            String text = audioService.speechToText(audioData);
            
            return Response.ok(Map.of(
                    "success", true,
                    "text", text
            )).build();
            
        } catch (Exception e) {
            logger.error("Speech-to-text error", e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }
    
    @POST
    @Path("/text-to-speech")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response textToSpeech(Map<String, String> request) {
        try {
            String text = request.get("text");
            String language = request.getOrDefault("language", "en");
            
            if (text == null || text.trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(Map.of("error", "Text is required"))
                        .build();
            }
            
            // vers audio
            String audioBase64 = audioService.textToSpeech(text, language);
            
            return Response.ok(Map.of(
                    "success", true,
                    "audio", audioBase64
            )).build();
            
        } catch (Exception e) {
            logger.error("Text-to-speech error", e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }
}