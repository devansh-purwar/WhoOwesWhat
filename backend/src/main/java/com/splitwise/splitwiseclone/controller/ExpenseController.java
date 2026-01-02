package com.splitwise.splitwiseclone.controller;

import com.splitwise.splitwiseclone.dto.CreateExpenseRequest;
import com.splitwise.splitwiseclone.entity.Expense;
import com.splitwise.splitwiseclone.entity.ExpenseSplit;
import com.splitwise.splitwiseclone.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for expense management
 */
@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

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

    @GetMapping("/{id}")
    public ResponseEntity<Expense> getExpenseById(@PathVariable Long id) {
        try {
            Expense expense = expenseService.getExpenseById(id);
            return ResponseEntity.ok(expense);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<Expense>> getGroupExpenses(@PathVariable Long groupId) {
        List<Expense> expenses = expenseService.getGroupExpenses(groupId);
        return ResponseEntity.ok(expenses);
    }

    @GetMapping("/personal/{userId}")
    public ResponseEntity<List<Expense>> getPersonalExpenses(@PathVariable Long userId) {
        List<Expense> expenses = expenseService.getPersonalExpenses(userId);
        return ResponseEntity.ok(expenses);
    }

    @GetMapping("/{id}/splits")
    public ResponseEntity<List<ExpenseSplit>> getExpenseSplits(@PathVariable Long id) {
        List<ExpenseSplit> splits = expenseService.getExpenseSplits(id);
        return ResponseEntity.ok(splits);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        try {
            expenseService.deleteExpense(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
