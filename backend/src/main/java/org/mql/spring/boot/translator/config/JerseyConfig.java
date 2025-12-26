package org.mql.spring.boot.translator.config;

import org.glassfish.jersey.server.ResourceConfig;
import org.mql.spring.boot.translator.controller.AudioResource;
import org.mql.spring.boot.translator.controller.AuthResource;
import org.mql.spring.boot.translator.controller.TranslatorResource;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JerseyConfig extends ResourceConfig {
    
    public JerseyConfig() {
        register(AuthResource.class);
        register(TranslatorResource.class);
        register(AudioResource.class);
    }
}