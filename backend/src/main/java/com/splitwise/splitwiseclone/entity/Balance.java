package com.splitwise.splitwiseclone.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "balances", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "from_user_id", "to_user_id", "group_id" })
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Balance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "from_user_id", nullable = false)
    private Long fromUserId; // User who owes

    @Column(name = "to_user_id", nullable = false)
    private Long toUserId; // User who is owed

    @Column(name = "group_id")
    private Long groupId; // Nullable for personal balances

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    private String currency;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
