package org.goalapp.challenge.client;

import org.goalapp.challenge.dto.UserDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(
    name = "user-service",
    url = "${user-service.url:http://user-service:8081}", // Default Docker service URL
    configuration = org.goalapp.challenge.config.FeignConfig.class
)
public interface UserClient {
    
    @GetMapping("/api/users/{id}")
    UserDto getUserById(@PathVariable("id") Long id);
}