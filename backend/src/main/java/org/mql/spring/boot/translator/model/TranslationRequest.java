package org.mql.spring.boot.translator.model;

public class TranslationRequest {
    private String text;
    private String sourceLang;
    private String targetLang;

    public TranslationRequest() {
        this.sourceLang = "en";
        this.targetLang = "darija";
    }

    public TranslationRequest(String text) {
        this();
        this.text = text;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
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
}