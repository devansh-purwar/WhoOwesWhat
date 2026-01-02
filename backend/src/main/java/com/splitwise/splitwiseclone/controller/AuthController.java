package com.splitwise.splitwiseclone.controller;

import com.splitwise.splitwiseclone.dto.ForgotPasswordRequest;
import com.splitwise.splitwiseclone.dto.ResetPasswordRequest;
import com.splitwise.splitwiseclone.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            String token = userService.initiatePasswordReset(request.getEmail());
            // In dev mode, we return the token so it's easy to test without email setup
            return ResponseEntity.ok(Map.of(
                    "message", "Password reset link sent to your email",
                    "token", token));
        } catch (IllegalArgumentException e) {
            // Even if user not found, we might want to return 200 for security (prevent
            // email enumeration)
            // But for this clone, we'll return the error for easier debugging
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            userService.resetPassword(request.getToken(), request.getNewPassword());
            return ResponseEntity.ok(Map.of("message", "Password has been successfully reset"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
