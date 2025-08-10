package org.goalapp.challenge.config;

import feign.Logger;
import feign.Request;
import feign.Retryer;
import feign.codec.ErrorDecoder;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.retry.annotation.EnableRetry;

import java.util.concurrent.TimeUnit;

@Configuration
@EnableRetry
public class FeignConfig {

    private static final org.slf4j.Logger log = LoggerFactory.getLogger(FeignConfig.class);

    @Bean
    public Logger.Level feignLoggerLevel() {
        return Logger.Level.FULL; // Enable full logging for debugging
    }

    @Bean
    public Request.Options requestOptions() {
        // Increase timeouts for Docker environment
        return new Request.Options(
                10, TimeUnit.SECONDS, // Connect timeout
                30, TimeUnit.SECONDS, // Read timeout
                true // Follow redirects
        );
    }

    @Bean
    public Retryer feignRetryer() {
        // Configure retry policy
        return new Retryer.Default(
                1000, // Initial interval
                3000, // Max interval
                3     // Max attempts
        );
    }

    @Bean
    public ErrorDecoder errorDecoder() {
        return new CustomErrorDecoder();
    }

    public static class CustomErrorDecoder implements ErrorDecoder {
        private final ErrorDecoder defaultErrorDecoder = new Default();

        @Override
        public Exception decode(String methodKey, feign.Response response) {
            log.error("🚨 Feign client error - Method: {}, Status: {}, Reason: {}", 
                     methodKey, response.status(), response.reason());
            
            if (response.status() >= 400 && response.status() <= 499) {
                log.error("❌ Client error (4xx) - Check service URL and request format");
            } else if (response.status() >= 500) {
                log.error("❌ Server error (5xx) - Target service may be down or unreachable");
            }
            
            return defaultErrorDecoder.decode(methodKey, response);
        }
    }
}