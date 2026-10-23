package com.example.demo.service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Email OTP for "forgot password".
 *  - 6 digit OTP, stored only as a BCrypt hash (never plain text)
 *  - expires after app.otp.expiry-minutes (default 10)
 *  - max app.otp.max-attempts wrong tries (default 5), then the OTP is dead
 *  - a new OTP can be requested only every app.otp.resend-seconds (default 60)
 *  - OTPs live in memory: a server restart simply invalidates them (user requests a new one)
 */
@Service
public class OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpService.class);
    private static final SecureRandom RANDOM = new SecureRandom();

    private record Entry(String hash, Instant expires, Instant sentAt, int attempts) {}

    private final Map<String, Entry> store = new ConcurrentHashMap<>();

    @Value("${app.otp.expiry-minutes:10}")
    private long expiryMinutes;

    @Value("${app.otp.resend-seconds:60}")
    private long resendSeconds;

    @Value("${app.otp.max-attempts:5}")
    private int maxAttempts;

    // true = also print the OTP in the server console (ONLY for testing without a mail account)
    @Value("${app.otp.dev-log:false}")
    private boolean devLog;

    @Value("${spring.mail.username:}")
    private String from;

    @Autowired
    private ObjectProvider<JavaMailSender> mailProvider;

    @Autowired
    private PasswordEncoder encoder;

    private static String key(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    /** Creates an OTP for this email and mails it. Silently does nothing if one was sent very recently. */
    public synchronized void issue(String email) {
        String k = key(email);
        Instant now = Instant.now();

        store.values().removeIf(e -> e.expires().isBefore(now)); // cleanup

        Entry old = store.get(k);
        if (old != null && old.sentAt().plusSeconds(resendSeconds).isAfter(now)) {
            return; // resend cooldown
        }

        String otp = String.format("%06d", RANDOM.nextInt(1_000_000));
        store.put(k, new Entry(encoder.encode(otp), now.plusSeconds(expiryMinutes * 60), now, 0));
        send(email.trim(), otp);
    }

    /** Checks the OTP. Wrong tries are counted. A correct OTP is NOT consumed - call invalidate() after the reset. */
    public synchronized boolean verify(String email, String otp) {
        String k = key(email);
        Entry e = store.get(k);
        if (e == null || otp == null) return false;

        if (e.expires().isBefore(Instant.now()) || e.attempts() >= maxAttempts) {
            store.remove(k);
            return false;
        }

        if (encoder.matches(otp.trim(), e.hash())) return true;

        store.put(k, new Entry(e.hash(), e.expires(), e.sentAt(), e.attempts() + 1));
        return false;
    }

    public synchronized void invalidate(String email) {
        store.remove(key(email));
    }

    private void send(String to, String otp) {
        if (devLog) log.info("DEV OTP for {} = {}", to, otp);

        JavaMailSender sender = mailProvider.getIfAvailable();
        if (sender == null) {
            log.warn("No mail sender configured (spring.mail.*): OTP for {} was not emailed", to);
            return;
        }

        // async: the API answers at the same speed whether or not the email exists
        CompletableFuture.runAsync(() -> {
            try {
                SimpleMailMessage m = new SimpleMailMessage();
                if (from != null && !from.isBlank()) m.setFrom(from);
                m.setTo(to);
                m.setSubject("LearnIQ - Password reset OTP");
                m.setText("Your LearnIQ password reset OTP is: " + otp + "\n\n"
                        + "It is valid for " + expiryMinutes + " minutes.\n"
                        + "If you did not request this, ignore this email.");
                sender.send(m);
            } catch (Exception ex) {
                log.error("Could not send OTP mail to {}: {}", to, ex.getMessage());
            }
        });
    }
}