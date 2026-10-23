package com.example.demo.security;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import com.example.demo.security.JwtUtil.AuthUser;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Runs once per request, before Spring Security checks any rule.
 *
 * If the request has "Authorization: Bearer <token>" and the token is valid + not expired:
 *   - the user is put into Spring Security's SecurityContext (ROLE_ADMIN / ROLE_STUDENT)
 *   - userId and role are also set as request attributes, so controllers can read
 *     "who is logged in" from the token instead of trusting ids sent by the browser
 *
 * A missing or bad token simply means "not logged in"; the rules in SecurityConfig then
 * answer 401 for protected endpoints.
 *
 * NOTE: this class is deliberately NOT a @Component - it is created only inside
 * SecurityConfig, so Spring Boot does not register it a second time as a plain servlet filter.
 */
public class JwtAuthFilter extends OncePerRequestFilter {

    public static final String ATTR_USER_ID = "authUserId";
    public static final String ATTR_ROLE = "authRole";

    private final JwtUtil jwt;

    public JwtAuthFilter(JwtUtil jwt) {
        this.jwt = jwt;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {

        String header = req.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            AuthUser user = jwt.parse(header.substring(7).trim());
            if (user != null) {
                req.setAttribute(ATTR_USER_ID, user.userId());
                req.setAttribute(ATTR_ROLE, user.role());

                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        String.valueOf(user.userId()),            // principal / getName() = user id
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_" + user.role().toUpperCase())));
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }

        chain.doFilter(req, res);
    }
}