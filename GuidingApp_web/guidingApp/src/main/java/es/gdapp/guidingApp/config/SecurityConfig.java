package es.gdapp.guidingApp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1) Force HTTPS for all incoming requests
                .requiresChannel(channel -> channel
                        .anyRequest().requiresSecure()
                )
                // 2) Disable CSRF since we're only exposing a stateless REST API
                .csrf(csrf -> csrf.disable())
                // 3) Allow every request through (no authentication)
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll()
                );
        return http.build();
    }
}
