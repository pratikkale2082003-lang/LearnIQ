package com.example.demo.security;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

/**
 * Used inside @PreAuthorize expressions:
 *   @PreAuthorize("hasRole('ADMIN') or @guard.isSelf(authentication, #studentId)")
 * true only when the logged-in user's id equals the id in the URL.
 */
@Component("guard")
public class AccessGuard {

    public boolean isSelf(Authentication auth, Long id) {
        if (auth == null || !auth.isAuthenticated() || id == null) return false;
        try {
            return Long.parseLong(auth.getName()) == id;
        } catch (NumberFormatException e) {
            return false;
        }
    }
}