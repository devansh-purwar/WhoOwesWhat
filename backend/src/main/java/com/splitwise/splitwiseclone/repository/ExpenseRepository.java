package com.splitwise.splitwiseclone.repository;

import com.splitwise.splitwiseclone.entity.Expense;
import com.splitwise.splitwiseclone.enums.CategoryType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByGroupId(Long groupId);

    List<Expense> findByPaidBy(Long userId);

    @Query("SELECT e FROM Expense e WHERE e.paidBy = :userId AND e.groupId IS NULL")
    List<Expense> findPersonalExpensesByUserId(@Param("userId") Long userId);

    @Query("SELECT e FROM Expense e WHERE e.groupId = :groupId AND e.expenseDate BETWEEN :startDate AND :endDate")
    List<Expense> findByGroupIdAndDateRange(
            @Param("groupId") Long groupId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT e FROM Expense e WHERE e.paidBy = :userId AND e.expenseDate BETWEEN :startDate AND :endDate")
    List<Expense> findByUserIdAndDateRange(
            @Param("userId") Long userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    List<Expense> findByCategory(CategoryType category);
}
