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

    /**
     * Creates a new expense, calculates splits, and updates balances.
     *
     * @param amount       The total amount of the expense
     * @param description  Brief description
     * @param category     Expense category
     * @param currency     Currency code
     * @param paidBy       ID of the user who paid
     * @param groupId      Optional group ID
     * @param splitType    Type of split (EQUAL, EXACT, etc.)
     * @param participants List of participants and their split details
     * @param expenseDate  Date of the expense
     * @return The created Expense entity
     */
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

    /**
     * Updates an existing expense and recalculates splits and balances.
     * Including permission checks.
     *
     * @param expenseId    ID of the expense to update
     * @param userId       ID of the user requesting the update
     * @param amount       New amount
     * @param description  New description
     * @param category     New category
     * @param splitType    New split type
     * @param participants Updated participants list
     * @param expenseDate  Updated date
     * @return The updated Expense entity
     */
    public Expense updateExpense(
            Long expenseId,
            Long userId,
            BigDecimal amount,
            String description,
            CategoryType category,
            SplitType splitType,
            List<SplitParticipant> participants,
            LocalDateTime expenseDate) {
        log.info("Updating expense: {} by user: {}", expenseId, userId);

        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new IllegalArgumentException("Expense not found"));

        // Validate permission: user must be the one who paid for the expense
        if (!expense.getPaidBy().equals(userId)) {
            throw new SecurityException("You do not have permission to edit this expense");
        }

        // Reverse old balances before updating
        if (expense.getGroupId() != null) {
            balanceService.recalculateBalancesForGroup(expense.getGroupId());
        }

        // Delete old splits
        expenseSplitRepository.deleteByExpenseId(expenseId);

        // Update expense fields
        if (amount != null) {
            expense.setAmount(amount);
        }
        if (description != null) {
            expense.setDescription(description);
        }
        if (category != null) {
            expense.setCategory(category);
        }
        if (splitType != null) {
            expense.setSplitType(splitType);
        }
        if (expenseDate != null) {
            expense.setExpenseDate(expenseDate);
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

            // Recalculate balances with new splits
            balanceService.updateBalancesForExpense(
                    expense.getId(),
                    expense.getPaidBy(),
                    splits,
                    expense.getCurrency(),
                    expense.getGroupId());
        }

        return expense;
    }

    /**
     * Deletes an expense and reverses its effect on balances.
     * Check permissions (Creator or Admin).
     *
     * @param expenseId        ID of the expense
     * @param requestingUserId ID of the user requesting deletion
     */
    public void deleteExpense(Long expenseId, Long requestingUserId) {
        log.info("Deleting expense: {} by user: {}", expenseId, requestingUserId);

        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new IllegalArgumentException("Expense not found"));

        Long groupId = expense.getGroupId();

        // Permission check: Creator or Group Admin
        boolean isCreator = expense.getPaidBy().equals(requestingUserId);
        boolean isAdmin = false;

        log.info("Checking delete permission for expenseId: {}, requestingUserId: {}, paidBy: {}, groupId: {}",
                expenseId, requestingUserId, expense.getPaidBy(), groupId);

        if (!isCreator) {
            if (groupId != null) {
                try {
                    isAdmin = groupService.isGroupAdmin(groupId, requestingUserId);
                    log.info("User {} is admin of group {}: {}", requestingUserId, groupId, isAdmin);
                } catch (Exception e) {
                    log.error("Error checks group admin: {}", e.getMessage());
                }
            }

            if (!isAdmin) {
                log.warn("Permission denied: User {} is neither creator ({}) nor admin", requestingUserId,
                        expense.getPaidBy());
                throw new SecurityException("You do not have permission to delete this expense");
            }
        } else {
            log.info("User {} is the creator/payer, allowing delete", requestingUserId);
        }

        expenseSplitRepository.deleteByExpenseId(expenseId);
        expenseRepository.deleteById(expenseId);

        // Recalculate balances
        if (groupId != null) {
            balanceService.recalculateBalancesForGroup(groupId);
        }
    }

    /**
     * Gets an expense by ID.
     *
     * @param expenseId Expnese ID
     * @return Expense entity
     */
    @Transactional(readOnly = true)
    public Expense getExpenseById(Long expenseId) {
        return expenseRepository.findById(expenseId)
                .orElseThrow(() -> new IllegalArgumentException("Expense not found"));
    }

    /**
     * Gets expenses for a group.
     *
     * @param groupId Group ID
     * @return List of expenses
     */
    @Transactional(readOnly = true)
    public List<Expense> getGroupExpenses(Long groupId) {
        return expenseRepository.findByGroupId(groupId);
    }

    /**
     * Gets personal expenses for a user.
     *
     * @param userId User ID
     * @return List of expenses
     */
    @Transactional(readOnly = true)
    public List<Expense> getPersonalExpenses(Long userId) {
        return expenseRepository.findPersonalExpensesByUserId(userId);
    }

    /**
     * Gets split details for an expense.
     *
     * @param expenseId Expense ID
     * @return List of splits
     */
    @Transactional(readOnly = true)
    public List<ExpenseSplit> getExpenseSplits(Long expenseId) {
        return expenseSplitRepository.findByExpenseId(expenseId);
    }
}
