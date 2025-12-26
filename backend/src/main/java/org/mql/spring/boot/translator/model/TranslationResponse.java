package org.mql.spring.boot.translator.model;

public class TranslationResponse {
    private String originalText;
    private String translatedText;
    private String sourceLang;
    private String targetLang;
    private long timestamp;

    public TranslationResponse() {
        this.timestamp = System.currentTimeMillis();
    }

    public TranslationResponse(String originalText, String translatedText) {
        this();
        this.originalText = originalText;
        this.translatedText = translatedText;
        this.sourceLang = "en";
        this.targetLang = "darija";
    }

    public String getOriginalText() {
        return originalText;
    }

    public void setOriginalText(String originalText) {
        this.originalText = originalText;
    }

    public String getTranslatedText() {
        return translatedText;
    }

    public void setTranslatedText(String translatedText) {
        this.translatedText = translatedText;
    }

    public String getSourceLang() {
        return sourceLang;
    }

    public void setSourceLang(String sourceLang) {
        this.sourceLang = sourceLang;
    }

    public String getTargetLang() {
        return targetLang;
    }

    public void setTargetLang(String targetLang) {
        this.targetLang = targetLang;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }
}