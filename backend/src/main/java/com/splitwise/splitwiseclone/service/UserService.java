package com.splitwise.splitwiseclone.service;

import com.splitwise.splitwiseclone.entity.PasswordResetToken;
import com.splitwise.splitwiseclone.entity.User;
import com.splitwise.splitwiseclone.repository.PasswordResetTokenRepository;
import com.splitwise.splitwiseclone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * Service for user management operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Registers a new user.
     *
     * @param email    Email address (must be unique)
     * @param phone    Phone number (optional, must be unique)
     * @param password Password (will be hashed)
     * @param name     Full name
     * @return The created User entity
     */
    public User registerUser(String email, String phone, String password, String name) {
        log.info("Registering new user with email: {}", email);

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already registered");
        }

        if (phone != null && userRepository.existsByPhone(phone)) {
            throw new IllegalArgumentException("Phone number already registered");
        }

        User user = User.builder()
                .email(email)
                .phone(phone)
                .passwordHash(passwordEncoder.encode(password))
                .name(name)
                .build();

        return userRepository.save(user);
    }

    /**
     * Finds a user by ID.
     *
     * @param userId User ID
     * @return Optional containing User if found
     */
    @Transactional(readOnly = true)
    public Optional<User> getUserById(Long userId) {
        return userRepository.findById(userId);
    }

    /**
     * Finds a user by Email.
     *
     * @param email User Email
     * @return Optional containing User if found
     */
    @Transactional(readOnly = true)
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * Updates user profile info.
     *
     * @param userId User ID
     * @param name   New name
     * @param phone  New phone number
     * @return Updated User entity
     */
    public User updateUserProfile(Long userId, String name, String phone) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (name != null) {
            user.setName(name);
        }
        if (phone != null) {
            if (userRepository.existsByPhone(phone) && !phone.equals(user.getPhone())) {
                throw new IllegalArgumentException("Phone number already in use");
            }
            user.setPhone(phone);
        }

        return userRepository.save(user);
    }

    /**
     * Validates user credentials.
     *
     * @param email    User email
     * @param password Plain text password
     * @return true if credentials match, false otherwise
     */
    public boolean validatePassword(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return false;
        }
        return passwordEncoder.matches(password, userOpt.get().getPasswordHash());
    }

    /**
     * Generates a password reset token.
     *
     * @param email User email
     * @return The generated token (string)
     */
    public String initiatePasswordReset(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

        // Delete any existing tokens for this user
        tokenRepository.deleteByUser(user);

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiryDate(LocalDateTime.now().plusHours(1))
                .used(false)
                .build();

        tokenRepository.save(resetToken);
        log.info("Created password reset token for user {}: {}", email, token);

        // In a real app, send an email here. For now, just return the token.
        return token;
    }

    /**
     * Resets the user's password using the token.
     *
     * @param token       Valid reset token
     * @param newPassword New password
     */
    public void resetPassword(String token, String newPassword) {
        log.info("Resetting password for token: {}", token);
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid token"));

        if (resetToken.isExpired() || resetToken.isUsed()) {
            throw new IllegalArgumentException("Token has expired or already been used");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword)); // Assuming passwordHash is the correct field
        userRepository.save(user);

        resetToken.setUsed(true);
        tokenRepository.save(resetToken);
    }

    /**
     * Search for users matching query.
     *
     * @param query Search string
     * @return List of matching users
     */
    public java.util.List<User> searchUsers(String query) {
        log.info("Searching for users with query: {}", query);
        return userRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query);
    }
}
