package org.mql.spring.boot.translator;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class TranslatorLlmBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(TranslatorLlmBackendApplication.class, args);
        System.out.println("Darija Translator Service is running on http://localhost:8000");
        System.out.println("API Documentation: http://localhost:8000/api/translator");
    }
}