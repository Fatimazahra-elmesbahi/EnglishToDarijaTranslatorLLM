package org.mql.spring.boot.translator.controller;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.mql.spring.boot.translator.model.AuthRequest;
import org.mql.spring.boot.translator.model.AuthResponse;
import org.mql.spring.boot.translator.model.User;
import org.mql.spring.boot.translator.service.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthResource {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthResource.class);
    
    @Autowired
    private AuthService authService;
    
    @POST
    @Path("/register")
    public Response register(AuthRequest request) {
        try {
            logger.info("Registration attempt: {}", request.getUsername());
            
            // Validation
            if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(new AuthResponse(false, "Username is required"))
                        .build();
            }
            
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(new AuthResponse(false, "Email is required"))
                        .build();
            }
            
            if (request.getPassword() == null || request.getPassword().length() < 4) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(new AuthResponse(false, "Password must be at least 4 characters"))
                        .build();
            }
            
            User user = authService.register(
                request.getUsername(),
                request.getEmail(),
                request.getPassword()
            );
            
            // pour token
            String token = authService.generateToken(user);
            
            user.setPassword(null);
            
            logger.info("Registration successful: {}", user.getUsername());
            
            return Response.ok(new AuthResponse(
                true,
                "Registration successful",
                token,
                user
            )).build();
            
        } catch (RuntimeException e) {
            logger.error("Registration failed", e);
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new AuthResponse(false, e.getMessage()))
                    .build();
        }
    }
    
    @POST
    @Path("/login")
    public Response login(AuthRequest request) {
        try {
            logger.info("Login attempt: {}", request.getUsername());
            
            // Validation
            if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(new AuthResponse(false, "Username is required"))
                        .build();
            }
            
            if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(new AuthResponse(false, "Password is required"))
                        .build();
            }
            
            User user = authService.login(request.getUsername(), request.getPassword());
            
            String token = authService.generateToken(user);
            
            user.setPassword(null);
            
            logger.info("Login successful: {}", user.getUsername());
            
            return Response.ok(new AuthResponse(
                true,
                "Login successful",
                token,
                user
            )).build();
            
        } catch (RuntimeException e) {
            logger.error("Login failed", e);
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(new AuthResponse(false, e.getMessage()))
                    .build();
        }
    }
    
    @GET
    @Path("/verify")
    public Response verifyToken(@QueryParam("token") String token) {
        try {
            if (token == null || token.trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(new AuthResponse(false, "Token is required"))
                        .build();
            }
            
            User user = authService.validateToken(token);
            user.setPassword(null);
            
            return Response.ok(new AuthResponse(
                true,
                "Token is valid",
                token,
                user
            )).build();
            
        } catch (RuntimeException e) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(new AuthResponse(false, "Invalid token"))
                    .build();
        }
    }
}