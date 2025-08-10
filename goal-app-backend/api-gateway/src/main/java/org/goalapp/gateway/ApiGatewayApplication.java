package org.goalapp.gateway;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

@SpringBootApplication
public class ApiGatewayApplication {

    @Value("${USER_SERVICE_URL:http://localhost:8081}")
    private String userServiceUrl;

    @Value("${GOAL_SERVICE_URL:http://localhost:8082}")
    private String goalServiceUrl;

    @Value("${POINTS_SERVICE_URL:http://localhost:8083}")
    private String pointsServiceUrl;

    @Value("${NOTIFICATION_SERVICE_URL:http://localhost:8084}")
    private String notificationServiceUrl;

    @Value("${CHALLENGE_SERVICE_URL:http://localhost:8085}")
    private String challengeServiceUrl;

    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("user-service", r -> r.path("/api/users/**", "/api/friend-requests/**")
                        .uri(userServiceUrl))
                .route("goal-service", r -> r.path("/api/goals/**")
                        .uri(goalServiceUrl))
                .route("points-service", r -> r.path("/api/points/**")
                        .uri(pointsServiceUrl))
                .route("notification-service", r -> r.path("/api/notifications/**")
                        .uri(notificationServiceUrl))
                .route("challenge-service", r -> r.path("/api/challenges/**")
                        .uri(challengeServiceUrl))
                .build();
    }

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration corsConfig = new CorsConfiguration();
        corsConfig.setAllowCredentials(true);
        corsConfig.addAllowedOriginPattern("*");
        corsConfig.addAllowedMethod("*");
        corsConfig.addAllowedHeader("*");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);

        return new CorsWebFilter(source);
    }
}
