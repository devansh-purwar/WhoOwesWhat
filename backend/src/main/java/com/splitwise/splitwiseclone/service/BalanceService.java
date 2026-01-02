package com.splitwise.splitwiseclone.service;

import com.splitwise.splitwiseclone.entity.Balance;
import com.splitwise.splitwiseclone.entity.Expense;
import com.splitwise.splitwiseclone.entity.ExpenseSplit;
import com.splitwise.splitwiseclone.entity.Settlement;
import com.splitwise.splitwiseclone.repository.BalanceRepository;
import com.splitwise.splitwiseclone.repository.ExpenseRepository;
import com.splitwise.splitwiseclone.repository.ExpenseSplitRepository;
import com.splitwise.splitwiseclone.repository.SettlementRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

/**
 * Service for balance calculation and settlement operations
 * Core algorithm: Event sourcing pattern - balances are recalculated from
 * expense logs
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BalanceService {

    private final BalanceRepository balanceRepository;
    private final ExpenseRepository expenseRepository;
    private final ExpenseSplitRepository expenseSplitRepository;
    private final SettlementRepository settlementRepository;

    /**
     * Update balances after a new expense is created
     * This method is called by ExpenseService
     */
    public void updateBalancesForExpense(
            Long expenseId,
            Long paidBy,
            Map<Long, BigDecimal> splits,
            String currency,
            Long groupId) {
        log.info("Updating balances for expense: {}", expenseId);

        for (Map.Entry<Long, BigDecimal> entry : splits.entrySet()) {
            Long userId = entry.getKey();
            BigDecimal owedAmount = entry.getValue();

            // Skip if user paid for themselves
            if (userId.equals(paidBy)) {
                continue;
            }

            // User owes paidBy this amount
            updateOrCreateBalance(userId, paidBy, owedAmount, currency, groupId);
        }
    }

    /**
     * Recalculate all balances for a group from scratch (idempotent operation)
     * This ensures consistency after expense updates/deletions
     */
    public void recalculateBalancesForGroup(Long groupId) {
        log.info("Recalculating balances for group: {}", groupId);

        // Clear existing balances for this group
        balanceRepository.deleteByGroupId(groupId);

        // Get all expenses for the group
        List<Expense> expenses = expenseRepository.findByGroupId(groupId);

        // Recalculate from scratch
        for (Expense expense : expenses) {
            List<ExpenseSplit> splits = expenseSplitRepository.findByExpenseId(expense.getId());

            for (ExpenseSplit split : splits) {
                if (!split.getUserId().equals(expense.getPaidBy())) {
                    updateOrCreateBalance(
                            split.getUserId(),
                            expense.getPaidBy(),
                            split.getAmount(),
                            expense.getCurrency(),
                            groupId);
                }
            }
        }
    }

    /**
     * Update or create a balance entry
     */
    private void updateOrCreateBalance(
            Long fromUserId,
            Long toUserId,
            BigDecimal amount,
            String currency,
            Long groupId) {
        Optional<Balance> existingBalance = balanceRepository
                .findByFromUserIdAndToUserIdAndGroupId(fromUserId, toUserId, groupId);

        if (existingBalance.isPresent()) {
            Balance balance = existingBalance.get();
            balance.setAmount(balance.getAmount().add(amount));
            balanceRepository.save(balance);
        } else {
            // Check if reverse balance exists (toUser owes fromUser)
            Optional<Balance> reverseBalance = balanceRepository
                    .findByFromUserIdAndToUserIdAndGroupId(toUserId, fromUserId, groupId);

            if (reverseBalance.isPresent()) {
                Balance balance = reverseBalance.get();
                BigDecimal newAmount = balance.getAmount().subtract(amount);

                if (newAmount.compareTo(BigDecimal.ZERO) < 0) {
                    // Flip the balance
                    balanceRepository.delete(balance);
                    Balance newBalance = Balance.builder()
                            .fromUserId(fromUserId)
                            .toUserId(toUserId)
                            .amount(newAmount.abs())
                            .currency(currency)
                            .groupId(groupId)
                            .build();
                    balanceRepository.save(newBalance);
                } else if (newAmount.compareTo(BigDecimal.ZERO) > 0) {
                    balance.setAmount(newAmount);
                    balanceRepository.save(balance);
                } else {
                    // Balance is zero, delete it
                    balanceRepository.delete(balance);
                }
            } else {
                // Create new balance
                Balance newBalance = Balance.builder()
                        .fromUserId(fromUserId)
                        .toUserId(toUserId)
                        .amount(amount)
                        .currency(currency)
                        .groupId(groupId)
                        .build();
                balanceRepository.save(newBalance);
            }
        }
    }

    /**
     * Get all balances for a user
     */
    @Transactional(readOnly = true)
    public List<Balance> getUserBalances(Long userId) {
        return balanceRepository.findByUserId(userId);
    }

    /**
     * Get all balances for a group
     */
    @Transactional(readOnly = true)
    public List<Balance> getGroupBalances(Long groupId) {
        return balanceRepository.findByGroupId(groupId);
    }

    /**
     * Calculate net balance for a user (how much they owe or are owed in total)
     */
    @Transactional(readOnly = true)
    public Map<String, BigDecimal> calculateNetBalance(Long userId) {
        List<Balance> balances = balanceRepository.findByUserId(userId);
        Map<String, BigDecimal> netBalances = new HashMap<>();

        for (Balance balance : balances) {
            String currency = balance.getCurrency();
            BigDecimal currentNet = netBalances.getOrDefault(currency, BigDecimal.ZERO);

            if (balance.getFromUserId().equals(userId)) {
                // User owes this amount (negative)
                netBalances.put(currency, currentNet.subtract(balance.getAmount()));
            } else {
                // User is owed this amount (positive)
                netBalances.put(currency, currentNet.add(balance.getAmount()));
            }
        }

        return netBalances;
    }

    /**
     * Record a settlement (payment)
     */
    public Settlement settleBalance(Long fromUserId, Long toUserId, BigDecimal amount, String currency, Long groupId) {
        log.info("Recording settlement: {} pays {} amount: {}", fromUserId, toUserId, amount);

        // Find and update the balance
        Optional<Balance> balanceOpt = balanceRepository
                .findByFromUserIdAndToUserIdAndGroupId(fromUserId, toUserId, groupId);

        if (balanceOpt.isEmpty()) {
            throw new IllegalArgumentException("No balance found between these users");
        }

        Balance balance = balanceOpt.get();

        if (amount.compareTo(balance.getAmount()) > 0) {
            throw new IllegalArgumentException("Settlement amount exceeds balance");
        }

        // Update balance
        BigDecimal newAmount = balance.getAmount().subtract(amount);
        if (newAmount.compareTo(BigDecimal.ZERO) == 0) {
            balanceRepository.delete(balance);
        } else {
            balance.setAmount(newAmount);
            balanceRepository.save(balance);
        }

        // Record settlement
        Settlement settlement = Settlement.builder()
                .fromUserId(fromUserId)
                .toUserId(toUserId)
                .amount(amount)
                .currency(currency)
                .groupId(groupId)
                .build();

        return settlementRepository.save(settlement);
    }

    /**
     * Get settlement history for a user
     */
    @Transactional(readOnly = true)
    public List<Settlement> getUserSettlements(Long userId) {
        return settlementRepository.findByUserId(userId);
    }
}
