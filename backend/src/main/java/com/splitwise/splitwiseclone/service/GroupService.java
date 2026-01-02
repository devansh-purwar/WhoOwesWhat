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

    @Transactional(readOnly = true)
    public Group getGroupById(Long groupId) {
        return groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));
    }

    @Transactional(readOnly = true)
    public List<Group> getUserGroups(Long userId) {
        return groupRepository.findGroupsByUserId(userId);
    }

    @Transactional(readOnly = true)
    public List<GroupMember> getGroupMembers(Long groupId) {
        return groupMemberRepository.findByGroupId(groupId);
    }

    @Transactional(readOnly = true)
    public boolean isUserMemberOfGroup(Long userId, Long groupId) {
        return groupMemberRepository.existsByGroupIdAndUserId(groupId, userId);
    }

    public Group updateGroup(Long groupId, String name, String description) {
        log.info("Updating group {}: name={}, description={}", groupId, name, description);
        Group group = getGroupById(groupId);
        group.setName(name);
        group.setDescription(description);
        return groupRepository.save(group);
    }

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
