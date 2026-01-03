package com.splitwise.splitwiseclone.dto;

import com.splitwise.splitwiseclone.enums.GroupRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupMemberDto {
    private Long id;
    private Long groupId;
    private Long userId;
    private String userName;
    private String userEmail;
    private GroupRole role;
    private LocalDateTime joinedAt;
}
