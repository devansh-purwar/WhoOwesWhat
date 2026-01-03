package com.splitwise.splitwiseclone.controller;

import com.splitwise.splitwiseclone.dto.RegisterUserRequest;
import com.splitwise.splitwiseclone.entity.User;
import com.splitwise.splitwiseclone.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for user management
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * Registers a new user (alternative to AuthController).
     *
     * @param request The registration request
     * @return The created User entity
     */
    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@Valid @RequestBody RegisterUserRequest request) {
        User user = userService.registerUser(
                request.getEmail(),
                request.getPhone(),
                request.getPassword(),
                request.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    /**
     * Retrieves a user by their ID.
     *
     * @param id The ID of the user
     * @return The User entity
     */
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Retrieves a user by their email.
     *
     * @param email The email of the user
     * @return The User entity
     */
    @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        return userService.getUserByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Searches for users by name or email.
     *
     * @param query The search query string
     * @return A list of matching User entities
     */
    @GetMapping("/search")
    public ResponseEntity<java.util.List<User>> searchUsers(@RequestParam String query) {
        return ResponseEntity.ok(userService.searchUsers(query));
    }
}
