package org.mql.spring.boot.translator.service;

import org.mql.spring.boot.translator.model.User;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AuthService {
    
    private final Map<String, User> users = new HashMap<>();
    private final Map<String, String> tokens = new HashMap<>();
    
    public AuthService() {
        User defaultUser = new User(
            UUID.randomUUID().toString(),
            "admin",
            "admin@darija.com",
            "admin123"
        );
        users.put(defaultUser.getUsername(), defaultUser);
    }
    
    public User register(String username, String email, String password) {
        if (users.containsKey(username)) {
            throw new RuntimeException("Username already exists");
        }
        
        for (User user : users.values()) {
            if (user.getEmail().equals(email)) {
                throw new RuntimeException("Email already exists");
            }
        }
        
        User newUser = new User(
            UUID.randomUUID().toString(),
            username,
            email,
            password
        );
        
        users.put(username, newUser);
        return newUser;
    }
    
    public User login(String username, String password) {
        User user = users.get(username);
        
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        
        if (!user.getPassword().equals(password)) {
            throw new RuntimeException("Invalid password");
        }
        
        return user;
    }
    
    public String generateToken(User user) {
        String token = "TOKEN_" + UUID.randomUUID().toString();
        tokens.put(token, user.getUsername());
        return token;
    }
    
    public User validateToken(String token) {
        String username = tokens.get(token);
        if (username == null) {
            throw new RuntimeException("Invalid token");
        }
        return users.get(username);
    }
    

    public Collection<User> getAllUsers() {
        return users.values();
    }
}