package com.splitwise.splitwiseclone.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO representing a participant in an expense split
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SplitParticipant {
    private Long userId;
    private BigDecimal amount; // For EXACT split
    private BigDecimal percentage; // For PERCENTAGE split
    private Integer shares; // For SHARES split
}
