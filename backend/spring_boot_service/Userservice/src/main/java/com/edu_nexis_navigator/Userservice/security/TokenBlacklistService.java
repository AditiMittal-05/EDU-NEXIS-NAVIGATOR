package com.edu_nexis_navigator.Userservice.security;

import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TokenBlacklistService {

    private final Map<String, Date> blacklist = new ConcurrentHashMap<>();

    public void blacklistToken(String token, Date expirationDate) {
        if (token != null && expirationDate != null) {
            cleanupExpiredTokens();
            blacklist.put(token, expirationDate);
        }
    }

    public boolean isBlacklisted(String token) {
        if (token == null) {
            return false;
        }
        Date expirationDate = blacklist.get(token);
        if (expirationDate == null) {
            return false;
        }
        if (expirationDate.before(new Date())) {
            blacklist.remove(token);
            return false;
        }
        return true;
    }

    public void cleanupExpiredTokens() {
        Date now = new Date();
        blacklist.entrySet().removeIf(entry -> entry.getValue().before(now));
    }
}

