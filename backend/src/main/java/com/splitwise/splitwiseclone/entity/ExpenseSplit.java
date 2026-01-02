package com.splitwise.splitwiseclone.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "expense_splits")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseSplit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long expenseId;

    @Column(nullable = false)
    private Long userId;

    @Column(precision = 19, scale = 2)
    private BigDecimal amount; // Used for EXACT split type

    @Column(precision = 5, scale = 2)
    private BigDecimal percentage; // Used for PERCENTAGE split type

    @Column
    private Integer shares; // Used for SHARES split type

    // For EQUAL split, amount is calculated and stored
}
