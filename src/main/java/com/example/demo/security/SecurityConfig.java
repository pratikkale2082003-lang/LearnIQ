package com.example.demo.security;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity            // turns on @PreAuthorize used in the controllers
public class SecurityConfig {

    // BCrypt hashing for all passwords
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Login is done by /api/auth/login, so Spring's default in-memory user
    // (and its "generated security password" log line) is not needed.
    @Bean
    public UserDetailsService userDetailsService() {
        return username -> {
            throw new UsernameNotFoundException("Use /api/auth/login");
        };
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtUtil jwtUtil) throws Exception {
        http
            .cors(Customizer.withDefaults())                       // uses the CORS bean below
            .csrf(csrf -> csrf.disable())                          // stateless API: token in header, no cookies
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .httpBasic(b -> b.disable())
            .formLogin(f -> f.disable())
            .logout(l -> l.disable())
            .addFilterBefore(new JwtAuthFilter(jwtUtil), UsernamePasswordAuthenticationFilter.class)
            .exceptionHandling(e -> e
                .authenticationEntryPoint((req, res, ex) -> json(res, HttpServletResponse.SC_UNAUTHORIZED, "Please login again"))
                .accessDeniedHandler((req, res, ex) -> json(res, HttpServletResponse.SC_FORBIDDEN, "You are not allowed to do this")))
            .authorizeHttpRequests(a -> a
                // CORS preflight + Spring's internal error page (keeps 401/409 etc. from controllers intact)
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/error").permitAll()

                // public
                .requestMatchers(HttpMethod.POST,
                        "/api/auth/login", "/api/auth/register",
                        "/api/auth/forgot-password/request", "/api/auth/forgot-password/reset").permitAll()

                // admin only
                .requestMatchers("/api/admin/**", "/api/tests/admin/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST,
                        "/api/tests", "/api/tests/schedule", "/api/questions", "/api/questions/bulk").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/results").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/results/*/admin").hasRole("ADMIN")

                // everything else: any logged-in user
                // ("my own data only" rules are the @PreAuthorize checks in the controllers)
                .anyRequest().authenticated());

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource(
            @Value("${app.cors.origins:http://localhost:5000}") String origins) {

        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(Arrays.stream(origins.split(",")).map(String::trim).filter(o -> !o.isEmpty()).toList());
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        cfg.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
        cfg.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }

    private static void json(HttpServletResponse res, int status, String message) throws java.io.IOException {
        res.setStatus(status);
        res.setContentType("application/json");
        res.setCharacterEncoding("UTF-8");
        res.getWriter().write("{\"message\":\"" + message + "\"}");
    }
}