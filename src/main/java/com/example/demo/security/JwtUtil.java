package com.example.demo.security;

import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Minimal HS256 JWT (header.payload.signature) built on the JDK only.
 *
 * Payload: {"sub":"<userId>","role":"<admin|student>","iat":..,"exp":..}
 * Only tokens with exactly our fixed header (HS256) are accepted, so the
 * "alg":"none" / algorithm-swap attacks are not possible.
 */
@Component
public class JwtUtil {

    /** The identity read from a valid token. */
    public record AuthUser(Long userId, String role) {}

    private static final Base64.Encoder B64 = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder B64D = Base64.getUrlDecoder();
    private static final String HEADER =
            B64.encodeToString("{\"alg\":\"HS256\",\"typ\":\"JWT\"}".getBytes(StandardCharsets.UTF_8));

    private static final Pattern SUB = Pattern.compile("\"sub\":\"(\\d{1,18})\"");
    private static final Pattern ROLE = Pattern.compile("\"role\":\"([a-z]{1,20})\"");
    private static final Pattern EXP = Pattern.compile("\"exp\":(\\d{1,15})");

    private final byte[] key;
    private final long expirySeconds;

    public JwtUtil(@Value("${app.jwt.secret}") String secret,
                   @Value("${app.jwt.expiry-hours:8}") long expiryHours) {
        byte[] k = secret == null ? new byte[0] : secret.getBytes(StandardCharsets.UTF_8);
        if (k.length < 32) {
            throw new IllegalStateException("app.jwt.secret must be at least 32 characters long");
        }
        this.key = k;
        this.expirySeconds = expiryHours * 3600;
    }

    public String generate(Long userId, String role) {
        if (role == null || !role.matches("[a-z]{1,20}")) {
            throw new IllegalArgumentException("Invalid role");
        }
        long now = Instant.now().getEpochSecond();
        String json = "{\"sub\":\"" + userId + "\",\"role\":\"" + role
                + "\",\"iat\":" + now + ",\"exp\":" + (now + expirySeconds) + "}";
        String body = HEADER + "." + B64.encodeToString(json.getBytes(StandardCharsets.UTF_8));
        return body + "." + B64.encodeToString(hmac(body));
    }

    /** @return the user inside a valid, unexpired token; null for anything else. */
    public AuthUser parse(String token) {
        try {
            if (token == null) return null;
            String[] p = token.split("\\.", -1);
            if (p.length != 3 || !HEADER.equals(p[0])) return null;

            byte[] expected = hmac(p[0] + "." + p[1]);
            byte[] given = B64D.decode(p[2]);
            if (!MessageDigest.isEqual(expected, given)) return null; // constant-time compare

            String json = new String(B64D.decode(p[1]), StandardCharsets.UTF_8);
            Matcher sub = SUB.matcher(json);
            Matcher role = ROLE.matcher(json);
            Matcher exp = EXP.matcher(json);
            if (!sub.find() || !role.find() || !exp.find()) return null;

            if (Long.parseLong(exp.group(1)) <= Instant.now().getEpochSecond()) return null; // expired
            return new AuthUser(Long.valueOf(sub.group(1)), role.group(1));
        } catch (RuntimeException e) {
            return null; // malformed token
        }
    }

    private byte[] hmac(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(key, "HmacSHA256"));
            return mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException(e);
        }
    }
}