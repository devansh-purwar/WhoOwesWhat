package com.splitwise.splitwiseclone.repository;

import com.splitwise.splitwiseclone.entity.GroupMember;
import com.splitwise.splitwiseclone.enums.GroupRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {

    List<GroupMember> findByGroupId(Long groupId);

    List<GroupMember> findByUserId(Long userId);

    Optional<GroupMember> findByGroupIdAndUserId(Long groupId, Long userId);

    boolean existsByGroupIdAndUserId(Long groupId, Long userId);

    List<GroupMember> findByGroupIdAndRole(Long groupId, GroupRole role);

    void deleteByGroupIdAndUserId(Long groupId, Long userId);

    void deleteByGroupId(Long groupId);
}
