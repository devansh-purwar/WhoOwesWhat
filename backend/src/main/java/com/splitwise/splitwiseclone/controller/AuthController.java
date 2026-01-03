package com.splitwise.splitwiseclone.controller;

import com.splitwise.splitwiseclone.dto.ForgotPasswordRequest;
import com.splitwise.splitwiseclone.dto.LoginRequest;
import com.splitwise.splitwiseclone.dto.LoginResponse;
import com.splitwise.splitwiseclone.dto.ResetPasswordRequest;
import com.splitwise.splitwiseclone.dto.RegisterUserRequest;
import com.splitwise.splitwiseclone.entity.User;
import com.splitwise.splitwiseclone.security.JwtUtils;
import com.splitwise.splitwiseclone.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final JwtUtils jwtUtils;

    /**
     * Authenticates a user and returns a JWT token.
     *
     * @param request The login request containing email and password
     * @return A ResponseEntity containing the login response with the JWT token
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        if (userService.validatePassword(request.getEmail(), request.getPassword())) {
            User user = userService.getUserByEmail(request.getEmail()).get();
            String token = jwtUtils.generateToken(user.getEmail(), user.getId());

            return ResponseEntity.ok(LoginResponse.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .name(user.getName())
                    .message("Login successful")
                    .token(token)
                    .build());
        } else {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
        }
    }

    /**
     * Registers a new user.
     *
     * @param request The registration request containing user details
     * @return A ResponseEntity containing the login response with the JWT token for
     *         the new user
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterUserRequest request) {
        try {
            User user = userService.registerUser(
                    request.getEmail(),
                    request.getPhone(),
                    request.getPassword(),
                    request.getName());

            String token = jwtUtils.generateToken(user.getEmail(), user.getId());

            return ResponseEntity.status(HttpStatus.CREATED).body(LoginResponse.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .name(user.getName())
                    .message("Registration successful")
                    .token(token)
                    .build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Initiates the password reset process by generating a token.
     *
     * @param request The forgot password request containing the email
     * @return A ResponseEntity with a success message and the reset token (for
     *         development)
     */
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

    /**
     * Resets the user's password using a valid token.
     *
     * @param request The reset password request containing the token and new
     *                password
     * @return A ResponseEntity with a success message
     */
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
