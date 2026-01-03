package com.splitwise.splitwiseclone.controller;

import com.splitwise.splitwiseclone.dto.CreateExpenseRequest;
import com.splitwise.splitwiseclone.dto.UpdateExpenseRequest;
import com.splitwise.splitwiseclone.entity.Expense;
import com.splitwise.splitwiseclone.entity.ExpenseSplit;
import com.splitwise.splitwiseclone.service.ExpenseService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for expense management
 */
@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    /**
     * Creates a new expense.
     *
     * @param request The request DTO containing expense details
     * @return The created Expense entity
     */
    @PostMapping
    public ResponseEntity<Expense> createExpense(@Valid @RequestBody CreateExpenseRequest request) {
        try {
            Expense expense = expenseService.createExpense(
                    request.getAmount(),
                    request.getDescription(),
                    request.getCategory(),
                    request.getCurrency(),
                    request.getPaidBy(),
                    request.getGroupId(),
                    request.getSplitType(),
                    request.getParticipants(),
                    request.getExpenseDate());
            return ResponseEntity.status(HttpStatus.CREATED).body(expense);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Updates an existing expense.
     *
     * @param id          The ID of the expense to update
     * @param request     The request DTO containing updated fields
     * @param httpRequest The HTTP request (used to retrieve authenticated user ID)
     * @return The updated Expense entity
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateExpense(
            @PathVariable Long id,
            @Valid @RequestBody UpdateExpenseRequest request,
            HttpServletRequest httpRequest) {
        try {
            Long userId = (Long) httpRequest.getAttribute("userId");
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "User not authenticated"));
            }

            Expense expense = expenseService.updateExpense(
                    id,
                    userId,
                    request.getAmount(),
                    request.getDescription(),
                    request.getCategory(),
                    request.getSplitType(),
                    request.getParticipants(),
                    request.getExpenseDate());
            return ResponseEntity.ok(expense);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Retrieves an expense by its ID.
     *
     * @param id The ID of the expense
     * @return The Expense entity
     */
    @GetMapping("/{id}")
    public ResponseEntity<Expense> getExpenseById(@PathVariable Long id) {
        try {
            Expense expense = expenseService.getExpenseById(id);
            return ResponseEntity.ok(expense);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Retrieves all expenses associated with a group.
     *
     * @param groupId The ID of the group
     * @return A list of Expense entities
     */
    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<Expense>> getGroupExpenses(@PathVariable Long groupId) {
        List<Expense> expenses = expenseService.getGroupExpenses(groupId);
        return ResponseEntity.ok(expenses);
    }

    /**
     * Retrieves all personal (non-group) expenses for a user.
     *
     * @param userId The ID of the user
     * @return A list of Expense entities
     */
    @GetMapping("/personal/{userId}")
    public ResponseEntity<List<Expense>> getPersonalExpenses(@PathVariable Long userId) {
        List<Expense> expenses = expenseService.getPersonalExpenses(userId);
        return ResponseEntity.ok(expenses);
    }

    /**
     * Retrieves the splits for a specific expense.
     *
     * @param id The ID of the expense
     * @return A list of ExpenseSplit entities
     */
    @GetMapping("/{id}/splits")
    public ResponseEntity<List<ExpenseSplit>> getExpenseSplits(@PathVariable Long id) {
        List<ExpenseSplit> splits = expenseService.getExpenseSplits(id);
        return ResponseEntity.ok(splits);
    }

    /**
     * Deletes an expense.
     *
     * @param id          The ID of the expense to delete
     * @param httpRequest The HTTP request (used to retrieve authenticated user ID)
     * @return A 204 No Content response if successful
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteExpense(@PathVariable Long id, HttpServletRequest httpRequest) {
        try {
            Long userId = (Long) httpRequest.getAttribute("userId");
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "User not authenticated"));
            }

            expenseService.deleteExpense(id, userId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", e.getMessage()));
        }
    }
}
