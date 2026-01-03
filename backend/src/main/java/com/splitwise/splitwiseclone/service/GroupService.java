package com.splitwise.splitwiseclone.service;

import com.splitwise.splitwiseclone.entity.Group;
import com.splitwise.splitwiseclone.entity.GroupMember;
import com.splitwise.splitwiseclone.enums.GroupRole;
import com.splitwise.splitwiseclone.repository.GroupMemberRepository;
import com.splitwise.splitwiseclone.repository.GroupRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service for group management operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;

    private final com.splitwise.splitwiseclone.repository.UserRepository userRepository;

    /**
     * Creates a new group and adds the creator as an admin.
     *
     * @param name        Group name
     * @param description Group description
     * @param createdBy   ID of the user creating the group
     * @return The created Group entity
     */
    public Group createGroup(String name, String description, Long createdBy) {
        log.info("Creating new group: {} by user: {}", name, createdBy);

        Group group = Group.builder()
                .name(name)
                .description(description)
                .createdBy(createdBy)
                .build();

        group = groupRepository.save(group);

        // Add creator as admin
        GroupMember adminMember = GroupMember.builder()
                .groupId(group.getId())
                .userId(createdBy)
                .role(GroupRole.ADMIN)
                .build();

        groupMemberRepository.save(adminMember);

        return group;
    }

    /**
     * Adds a user to a group. Only admins can add members.
     *
     * @param groupId          Group ID
     * @param userId           User ID to add
     * @param requestingUserId ID of the admin performing the action
     */
    public void addMember(Long groupId, Long userId, Long requestingUserId) {
        log.info("Adding user {} to group {} by user {}", userId, groupId, requestingUserId);

        // Verify requesting user is admin
        GroupMember requestingMember = groupMemberRepository
                .findByGroupIdAndUserId(groupId, requestingUserId)
                .orElseThrow(() -> new IllegalArgumentException("You are not a member of this group"));

        if (requestingMember.getRole() != GroupRole.ADMIN) {
            throw new IllegalArgumentException("Only admins can add members");
        }

        // Check if user is already a member
        if (groupMemberRepository.existsByGroupIdAndUserId(groupId, userId)) {
            throw new IllegalArgumentException("User is already a member");
        }

        GroupMember newMember = GroupMember.builder()
                .groupId(groupId)
                .userId(userId)
                .role(GroupRole.MEMBER)
                .build();

        groupMemberRepository.save(newMember);
    }

    /**
     * Removes a user from a group.
     *
     * @param groupId          Group ID
     * @param userId           User ID to remove
     * @param requestingUserId ID of the admin (or self) performing the action
     */
    public void removeMember(Long groupId, Long userId, Long requestingUserId) {
        log.info("Removing user {} from group {} by user {}", userId, groupId, requestingUserId);

        // Verify requesting user is admin or removing themselves
        if (!requestingUserId.equals(userId)) {
            GroupMember requestingMember = groupMemberRepository
                    .findByGroupIdAndUserId(groupId, requestingUserId)
                    .orElseThrow(() -> new IllegalArgumentException("You are not a member of this group"));

            if (requestingMember.getRole() != GroupRole.ADMIN) {
                throw new IllegalArgumentException("Only admins can remove other members");
            }
        }

        groupMemberRepository.deleteByGroupIdAndUserId(groupId, userId);
    }

    /**
     * Gets a group by ID.
     *
     * @param groupId Group ID
     * @return Group entity
     */
    @Transactional(readOnly = true)
    public Group getGroupById(Long groupId) {
        return groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));
    }

    /**
     * Gets all groups for a user.
     *
     * @param userId User ID
     * @return List of groups
     */
    @Transactional(readOnly = true)
    public List<Group> getUserGroups(Long userId) {
        return groupRepository.findGroupsByUserId(userId);
    }

    /**
     * Gets all members of a group with user details.
     *
     * @param groupId Group ID
     * @return List of GroupMemberDto
     */
    @Transactional(readOnly = true)
    public List<com.splitwise.splitwiseclone.dto.GroupMemberDto> getGroupMembers(Long groupId) {
        List<GroupMember> members = groupMemberRepository.findByGroupId(groupId);

        return members.stream().map(member -> {
            com.splitwise.splitwiseclone.entity.User user = userRepository.findById(member.getUserId()).orElse(null);
            log.info("Fetching details for member userId: {}, found: {}, name: {}", member.getUserId(), user != null,
                    user != null ? user.getName() : "null");
            return com.splitwise.splitwiseclone.dto.GroupMemberDto.builder()
                    .id(member.getId())
                    .groupId(member.getGroupId())
                    .userId(member.getUserId())
                    .userName(user != null ? user.getName() : "Unknown")
                    .userEmail(user != null ? user.getEmail() : "")
                    .role(member.getRole())
                    .joinedAt(member.getJoinedAt())
                    .build();
        }).collect(java.util.stream.Collectors.toList());
    }

    /**
     * Checks if a user is a member of the group.
     *
     * @param userId  User ID
     * @param groupId Group ID
     * @return true if member, false otherwise
     */
    @Transactional(readOnly = true)
    public boolean isUserMemberOfGroup(Long userId, Long groupId) {
        return groupMemberRepository.existsByGroupIdAndUserId(groupId, userId);
    }

    /**
     * Checks if a user is an admin of the group.
     *
     * @param groupId Group ID
     * @param userId  User ID
     * @return true if admin, false otherwise
     */
    @Transactional(readOnly = true)
    public boolean isGroupAdmin(Long groupId, Long userId) {
        return groupMemberRepository.findByGroupIdAndUserId(groupId, userId)
                .map(member -> member.getRole() == GroupRole.ADMIN)
                .orElse(false);
    }

    /**
     * Updates group details.
     *
     * @param groupId     Group ID
     * @param name        New name
     * @param description New description
     * @return Updated Group entity
     */
    public Group updateGroup(Long groupId, String name, String description) {
        log.info("Updating group {}: name={}, description={}", groupId, name, description);
        Group group = getGroupById(groupId);
        group.setName(name);
        group.setDescription(description);
        return groupRepository.save(group);
    }

    /**
     * Deletes a group and its members.
     *
     * @param groupId Group ID to delete
     */
    public void deleteGroup(Long groupId) {
        log.info("Deleting group {}", groupId);
        // Members and expenses should be deleted by cascade or manually
        // For simplicity, let's just delete the group.
        // In a real app, we might want to prevent deletion if there are unsettled
        // balances.
        groupMemberRepository.deleteByGroupId(groupId);
        groupRepository.deleteById(groupId);
    }
}
