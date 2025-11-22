package soundhub.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${storage.base-dir}")
    private String baseDir;

    @Override
    public void addResourceHandlers(@org.springframework.lang.NonNull ResourceHandlerRegistry registry) {
        // Serve files from storage directory at /content/**
        // file: prefix is important for file system paths
        String storagePath = "file:" + baseDir + "/";

        registry.addResourceHandler("/content/**")
                .addResourceLocations(storagePath);
    }
}
