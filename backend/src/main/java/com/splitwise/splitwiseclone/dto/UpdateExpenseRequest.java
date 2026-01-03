package com.splitwise.splitwiseclone.dto;

import com.splitwise.splitwiseclone.enums.CategoryType;
import com.splitwise.splitwiseclone.enums.SplitType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateExpenseRequest {

    private BigDecimal amount;
    private String description;
    private CategoryType category;
    private SplitType splitType;
    private List<SplitParticipant> participants;
    private LocalDateTime expenseDate;
}
