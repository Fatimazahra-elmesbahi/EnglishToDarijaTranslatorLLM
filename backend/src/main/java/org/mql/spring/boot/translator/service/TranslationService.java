package org.mql.spring.boot.translator.service;

import org.mql.spring.boot.translator.model.TranslationRequest;
import org.mql.spring.boot.translator.model.TranslationResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TranslationService {

    private static final Logger logger = LoggerFactory.getLogger(TranslationService.class);

    private final WebClient webClient;
    private static final String SYSTEM_PROMPT = """
            You are a Moroccan Darija translator.
            Write ONLY in Arabic script.
            Use Moroccan Darija, NOT Modern Standard Arabic or Classical Arabic.
            Always use colloquial Moroccan words and phrases.
            Output only the translation, nothing else.
            Do not include any English, French, or other languages.
            Respond only with the Darija translation.
            Examples of Darija:
            - Hello: السلام عليكم
            - How are you: كيفاش داير؟
            - Thank you: شكرا بزاف
            - My name is: سميتي
            - I want: بغيت
            - Very: بزاف
            - Now: دابا
            - What: شنو
            - How: كيفاش
            - Artificial Intelligence: الذكاء الاصطناعي
            - Machines: الآلات
            - Computer systems: الأنظمة الحاسوبية
            - Perform tasks: يعملو المهام
            - Human intelligence: الذكاء البشري
            """;

    @Value("${lm.studio.model:llama-3.2-3b-instruct}")
    private String modelName;

    public TranslationService(@Value("${lm.studio.url}") String lmStudioUrl) {
        this.webClient = WebClient.builder()
                .baseUrl(lmStudioUrl)
                .build();
    }

    public TranslationResponse translate(TranslationRequest request) {
        try {
            logger.info("Translating text: {}", request.getText());

            String prompt = buildTranslationPrompt(request.getText());

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", modelName);
            requestBody.put("messages", List.of(
                    Map.of("role", "system", "content", SYSTEM_PROMPT),
                    Map.of("role", "user", "content", prompt)));

            requestBody.put("temperature", 0.1);
            requestBody.put("max_tokens", 150);
            requestBody.put("top_p", 0.85);
            requestBody.put("repeat_penalty", 1.15);

            logger.debug("Sending request to LM Studio: {}", requestBody);

            Map<String, Object> response = webClient.post()
                    .uri("/v1/chat/completions")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            String translatedText = extractTranslation(response);
            translatedText = convertToAuthenticDarija(translatedText);
            translatedText = finalFilter(translatedText);

            translatedText = validateAndRetry(translatedText, request.getText(), 0);

            logger.info("Translation completed: {}", translatedText);

            TranslationResponse translationResponse = new TranslationResponse(
                    request.getText(),
                    translatedText);
            translationResponse.setSourceLang(request.getSourceLang());
            translationResponse.setTargetLang(request.getTargetLang());

            return translationResponse;

        } catch (WebClientResponseException e) {
            logger.error("LM Studio API error: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            if (e.getStatusCode().value() == 400 || e.getStatusCode().value() == 404) {
                logger.warn("LM Studio model '{}' not available. Using fallback translation.", modelName);
                return createFallbackTranslation(request.getText());
            }
            throw new RuntimeException("LM Studio error: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Translation failed", e);
            logger.warn("Using fallback translation due to error");
            return createFallbackTranslation(request.getText());
        }
    }

    private String buildTranslationPrompt(String text) {
        return """
                Translate to Moroccan Darija (Arabic script only).
                Important: Use Moroccan colloquial words, not Standard or Classical Arabic.
                Translate the meaning, not word by word.

                Examples:
                English: my name is Sara
                Darija: سميتي سارة
                English: I want to eat pizza
                Darija: بغيت ناكل البيتزا
                English: This is very good
                Darija: هادشي مزيان بزاف
                English: What is your name
                Darija: شنو سميتك
                English: How are you
                Darija: كيفاش داير
                English: Artificial Intelligence (AI) refers to the ability of machines and computer systems to perform tasks that normally require human intelligence.
                Darija: الذكاء الاصطناعي (AI) كايقصد بيه القدرة ديال الآلات والأنظمة الحاسوبية باش يعملو المهام اللي عادة كاتطلب ذكاء بشري.

                Translate:
                English: %s
                Darija:""".formatted(text);
    }

    private String extractTranslation(Map<String, Object> response) {
        try {
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            if (choices == null || choices.isEmpty()) {
                throw new RuntimeException("No translation choices in response");
            }

            Map<String, Object> firstChoice = choices.get(0);
            Map<String, Object> message = (Map<String, Object>) firstChoice.get("message");
            String content = (String) message.get("content");

            if (content == null || content.trim().isEmpty()) {
                throw new RuntimeException("Empty translation content");
            }

            return content.trim();

        } catch (Exception e) {
            logger.error("Failed to extract translation from response", e);
            throw new RuntimeException("Failed to parse LM Studio response");
        }
    }

    private String convertToAuthenticDarija(String text) {
        return text
                .replace("اسمي", "سميتي")
                .replace("كثير", "بزاف")
                .replace("كثيرة", "بزاف")
                .replace("جداً", "بزاف")
                .replace("أحب", "كنبغي")
                .replace("أريد", "بغيت")
                .replace("ماذا", "شنو")
                .replace("كيف", "كيفاش")
                .replace("ليس", "ماشي")
                .replace("الآن", "دابا")
                .replace("أستطيع", "نقدر")
                .replace("أقدر", "نقدر")
                .replace("التي", "اللي")
                .replace("يسمح", "يخلي")
                .replace("بالتحسين", "تتحسن");
    }

    private String finalFilter(String text) {
        return text.replaceAll("^(Darija:|Translation:|ترجمة:)\\s*", "")
                   .replaceAll("\\b[A-Za-z]+\\b", "")
                   .replaceAll("\\s+", " ")
                   .trim();
    }

    private String validateAndRetry(String translatedText, String originalText, int retryCount) {
        if (translatedText.matches(".*[A-Za-z]{3,}.*") && retryCount < 2) {
            logger.warn("Translation contains English words, retrying... (attempt {})", retryCount + 1);
            return retryTranslation(originalText, retryCount + 1);
        }

        if (translatedText.length() < 5 && originalText.split("\\s+").length > 2) {
            logger.warn("Translation too short, using fallback");
            return generateBasicTranslation(originalText);
        }

        return translatedText;
    }

    private String retryTranslation(String text, int retryCount) {
        try {
            String prompt = "Translate to Moroccan Darija (Arabic script only): " + text;

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", modelName);
            requestBody.put("messages", List.of(
                    Map.of("role", "system", "content", "You only speak Moroccan Darija in Arabic script."),
                    Map.of("role", "user", "content", prompt)));
            requestBody.put("temperature", 0.1);
            requestBody.put("max_tokens", 150);

            Map<String, Object> response = webClient.post()
                    .uri("/v1/chat/completions")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            String result = extractTranslation(response);
            result = convertToAuthenticDarija(result);
            return finalFilter(result);

        } catch (Exception e) {
            logger.error("Retry failed", e);
            return generateBasicTranslation(text);
        }
    }

    private String generateBasicTranslation(String text) {
        String lower = text.toLowerCase();
        
        if (lower.contains("hello")) return "السلام";
        if (lower.contains("how are you")) return "كيفاش داير؟";
        if (lower.contains("thank")) return "شكرا";
        if (lower.contains("goodbye")) return "بسلامة";
        if (lower.contains("name")) return "شنو سميتك؟";
        
        return "معنديش ترجمة";
    }

    private TranslationResponse createFallbackTranslation(String text) {
        String lower = text.toLowerCase().trim();
        String translation;

        if (lower.equals("hello") || lower.equals("hi")) {
            translation = "السلام";
        } else if (lower.contains("how are you")) {
            translation = "كيفاش داير؟";
        } else if (lower.contains("thank")) {
            translation = "شكرا";
        } else if (lower.contains("goodbye")) {
            translation = "بسلامة";
        } else {
            translation = "معنديش ترجمة - LM Studio ماشي متاح";
        }

        TranslationResponse response = new TranslationResponse(text, translation);
        response.setSourceLang("en");
        response.setTargetLang("darija");
        return response;
    }
}