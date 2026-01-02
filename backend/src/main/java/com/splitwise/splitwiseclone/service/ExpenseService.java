package com.splitwise.splitwiseclone.service;

import com.splitwise.splitwiseclone.dto.SplitParticipant;
import com.splitwise.splitwiseclone.entity.Expense;
import com.splitwise.splitwiseclone.entity.ExpenseSplit;
import com.splitwise.splitwiseclone.enums.CategoryType;
import com.splitwise.splitwiseclone.enums.SplitType;
import com.splitwise.splitwiseclone.repository.ExpenseRepository;
import com.splitwise.splitwiseclone.repository.ExpenseSplitRepository;
import com.splitwise.splitwiseclone.service.strategy.SplitStrategy;
import com.splitwise.splitwiseclone.service.strategy.SplitStrategyFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Service for expense management operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final ExpenseSplitRepository expenseSplitRepository;
    private final SplitStrategyFactory splitStrategyFactory;
    private final BalanceService balanceService;
    private final GroupService groupService;

    public Expense createExpense(
            BigDecimal amount,
            String description,
            CategoryType category,
            String currency,
            Long paidBy,
            Long groupId,
            SplitType splitType,
            List<SplitParticipant> participants,
            LocalDateTime expenseDate) {
        log.info("Creating expense: {} for amount: {} by user: {}", description, amount, paidBy);

        // Validate group membership if it's a group expense
        if (groupId != null && !groupService.isUserMemberOfGroup(paidBy, groupId)) {
            throw new IllegalArgumentException("User is not a member of the group");
        }

        // Create expense
        Expense expense = Expense.builder()
                .amount(amount)
                .description(description)
                .category(category)
                .currency(currency)
                .paidBy(paidBy)
                .groupId(groupId)
                .splitType(splitType)
                .expenseDate(expenseDate != null ? expenseDate : LocalDateTime.now())
                .build();

        expense = expenseRepository.save(expense);

        // Calculate splits using strategy pattern
        SplitStrategy strategy = splitStrategyFactory.getStrategy(splitType);
        Map<Long, BigDecimal> splits = strategy.calculateSplit(amount, participants);

        // Save expense splits
        for (Map.Entry<Long, BigDecimal> entry : splits.entrySet()) {
            SplitParticipant participant = participants.stream()
                    .filter(p -> p.getUserId().equals(entry.getKey()))
                    .findFirst()
                    .orElse(null);

            ExpenseSplit expenseSplit = ExpenseSplit.builder()
                    .expenseId(expense.getId())
                    .userId(entry.getKey())
                    .amount(entry.getValue())
                    .percentage(participant != null ? participant.getPercentage() : null)
                    .shares(participant != null ? participant.getShares() : null)
                    .build();

            expenseSplitRepository.save(expenseSplit);
        }

        // Update balances
        balanceService.updateBalancesForExpense(expense.getId(), paidBy, splits, currency, groupId);

        return expense;
    }

    public Expense updateExpense(
            Long expenseId,
            BigDecimal amount,
            String description,
            CategoryType category,
            List<SplitParticipant> participants) {
        log.info("Updating expense: {}", expenseId);

        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new IllegalArgumentException("Expense not found"));

        // Delete old splits
        expenseSplitRepository.deleteByExpenseId(expenseId);

        // Update expense
        if (amount != null) {
            expense.setAmount(amount);
        }
        if (description != null) {
            expense.setDescription(description);
        }
        if (category != null) {
            expense.setCategory(category);
        }

        expense = expenseRepository.save(expense);

        // Recalculate splits if participants provided
        if (participants != null && !participants.isEmpty()) {
            SplitStrategy strategy = splitStrategyFactory.getStrategy(expense.getSplitType());
            Map<Long, BigDecimal> splits = strategy.calculateSplit(expense.getAmount(), participants);

            for (Map.Entry<Long, BigDecimal> entry : splits.entrySet()) {
                SplitParticipant participant = participants.stream()
                        .filter(p -> p.getUserId().equals(entry.getKey()))
                        .findFirst()
                        .orElse(null);

                ExpenseSplit expenseSplit = ExpenseSplit.builder()
                        .expenseId(expense.getId())
                        .userId(entry.getKey())
                        .amount(entry.getValue())
                        .percentage(participant != null ? participant.getPercentage() : null)
                        .shares(participant != null ? participant.getShares() : null)
                        .build();

                expenseSplitRepository.save(expenseSplit);
            }

            // Recalculate balances
            balanceService.recalculateBalancesForGroup(expense.getGroupId());
        }

        return expense;
    }

    public void deleteExpense(Long expenseId) {
        log.info("Deleting expense: {}", expenseId);

        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new IllegalArgumentException("Expense not found"));

        Long groupId = expense.getGroupId();

        expenseSplitRepository.deleteByExpenseId(expenseId);
        expenseRepository.deleteById(expenseId);

        // Recalculate balances
        if (groupId != null) {
            balanceService.recalculateBalancesForGroup(groupId);
        }
    }

    @Transactional(readOnly = true)
    public Expense getExpenseById(Long expenseId) {
        return expenseRepository.findById(expenseId)
                .orElseThrow(() -> new IllegalArgumentException("Expense not found"));
    }

    @Transactional(readOnly = true)
    public List<Expense> getGroupExpenses(Long groupId) {
        return expenseRepository.findByGroupId(groupId);
    }

    @Transactional(readOnly = true)
    public List<Expense> getPersonalExpenses(Long userId) {
        return expenseRepository.findPersonalExpensesByUserId(userId);
    }

    @Transactional(readOnly = true)
    public List<ExpenseSplit> getExpenseSplits(Long expenseId) {
        return expenseSplitRepository.findByExpenseId(expenseId);
    }
}
