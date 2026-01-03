package com.splitwise.splitwiseclone.controller;

import com.splitwise.splitwiseclone.dto.CreateGroupRequest;
import com.splitwise.splitwiseclone.dto.GroupMemberDto;
import com.splitwise.splitwiseclone.entity.Group;

import com.splitwise.splitwiseclone.service.GroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for group management
 */
@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    /**
     * Creates a new group.
     *
     * @param request The request DTO containing group name and description
     * @return The created Group entity
     */
    @PostMapping
    public ResponseEntity<Group> createGroup(@Valid @RequestBody CreateGroupRequest request) {
        Group group = groupService.createGroup(
                request.getName(),
                request.getDescription(),
                request.getCreatedBy());
        return ResponseEntity.status(HttpStatus.CREATED).body(group);
    }

    /**
     * Retrieves a group by its ID.
     *
     * @param id The ID of the group
     * @return The Group entity
     */
    @GetMapping("/{id}")
    public ResponseEntity<Group> getGroupById(@PathVariable Long id) {
        try {
            Group group = groupService.getGroupById(id);
            return ResponseEntity.ok(group);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Retrieves all groups that a user belongs to.
     *
     * @param userId The ID of the user
     * @return A list of Group entities
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Group>> getUserGroups(@PathVariable Long userId) {
        List<Group> groups = groupService.getUserGroups(userId);
        return ResponseEntity.ok(groups);
    }

    /**
     * Retrieves all members of a specific group.
     *
     * @param id The ID of the group
     * @return A list of GroupMemberDto with user details
     */
    @GetMapping("/{id}/members")
    public ResponseEntity<List<GroupMemberDto>> getGroupMembers(@PathVariable Long id) {
        List<GroupMemberDto> members = groupService.getGroupMembers(id);
        return ResponseEntity.ok(members);
    }

    /**
     * Adds a user to a group.
     *
     * @param groupId          The ID of the group
     * @param userId           The ID of the user to add
     * @param requestingUserId The ID of the admin performing the action
     * @return A 201 Created response if successful
     */
    @PostMapping("/{groupId}/members/{userId}")
    public ResponseEntity<Void> addMember(
            @PathVariable Long groupId,
            @PathVariable Long userId,
            @RequestParam Long requestingUserId) {
        try {
            groupService.addMember(groupId, userId, requestingUserId);
            return ResponseEntity.status(HttpStatus.CREATED).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Removes a user from a group.
     *
     * @param groupId          The ID of the group
     * @param userId           The ID of the user to remove
     * @param requestingUserId The ID of the admin performing the action
     * @return A 204 No Content response if successful
     */
    @DeleteMapping("/{groupId}/members/{userId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable Long groupId,
            @PathVariable Long userId,
            @RequestParam Long requestingUserId) {
        try {
            groupService.removeMember(groupId, userId, requestingUserId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Updates an existing group's details.
     *
     * @param id      The ID of the group
     * @param request The request DTO containing updated name and description
     * @return The updated Group entity
     */
    @PutMapping("/{id}")
    public ResponseEntity<Group> updateGroup(
            @PathVariable Long id,
            @Valid @RequestBody CreateGroupRequest request) {
        try {
            Group group = groupService.updateGroup(id, request.getName(), request.getDescription());
            return ResponseEntity.ok(group);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Deletes a group.
     *
     * @param id The ID of the group to delete
     * @return A 204 No Content response if successful
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGroup(@PathVariable Long id) {
        try {
            groupService.deleteGroup(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
