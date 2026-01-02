package com.splitwise.splitwiseclone.dto;

import com.splitwise.splitwiseclone.enums.CategoryType;
import com.splitwise.splitwiseclone.enums.SplitType;
import jakarta.validation.constraints.*;
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
public class CreateExpenseRequest {

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Category is required")
    private CategoryType category;

    @NotBlank(message = "Currency is required")
    @Size(min = 3, max = 3, message = "Currency must be 3-letter code")
    private String currency;

    @NotNull(message = "Paid by user ID is required")
    private Long paidBy;

    private Long groupId; // Nullable for personal expenses

    @NotNull(message = "Split type is required")
    private SplitType splitType;

    @NotEmpty(message = "At least one participant is required")
    private List<SplitParticipant> participants;

    private LocalDateTime expenseDate;
}
