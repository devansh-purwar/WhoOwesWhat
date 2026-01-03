package com.splitwise.splitwiseclone.controller;

import com.splitwise.splitwiseclone.entity.Settlement;
import com.splitwise.splitwiseclone.service.BalanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for balance and settlement operations
 */
@RestController
@RequestMapping("/api/balances")
@RequiredArgsConstructor
public class BalanceController {

    private final BalanceService balanceService;

    /**
     * Retrieves all balances involving a specific user across all groups.
     *
     * @param userId The ID of the user
     * @return A list of BalanceResponse DTOs
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<com.splitwise.splitwiseclone.dto.BalanceResponse>> getUserBalances(
            @PathVariable Long userId) {
        List<com.splitwise.splitwiseclone.dto.BalanceResponse> balances = balanceService.getUserBalances(userId);
        return ResponseEntity.ok(balances);
    }

    /**
     * Calculates the net balance for a user (total owed vs total debt).
     *
     * @param userId The ID of the user
     * @return A map of currency codes to net amounts
     */
    @GetMapping("/user/{userId}/net")
    public ResponseEntity<Map<String, BigDecimal>> getUserNetBalance(@PathVariable Long userId) {
        Map<String, BigDecimal> netBalance = balanceService.calculateNetBalance(userId);
        return ResponseEntity.ok(netBalance);
    }

    /**
     * Retrieves balances specific to a group.
     *
     * @param groupId The ID of the group
     * @return A list of BalanceResponse DTOs within the group
     */
    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<com.splitwise.splitwiseclone.dto.BalanceResponse>> getGroupBalances(
            @PathVariable Long groupId) {
        List<com.splitwise.splitwiseclone.dto.BalanceResponse> balances = balanceService.getGroupBalances(groupId);
        return ResponseEntity.ok(balances);
    }

    /**
     * Records a settlement payment between two users.
     *
     * @param fromUserId The user making the payment
     * @param toUserId   The user receiving the payment
     * @param amount     The amount settled
     * @param currency   The currency of the settlement
     * @param groupId    Optional group ID associated with the settlement
     * @return The created Settlement entity
     */
    @PostMapping("/settle")
    public ResponseEntity<Settlement> settleBalance(
            @RequestParam Long fromUserId,
            @RequestParam Long toUserId,
            @RequestParam BigDecimal amount,
            @RequestParam String currency,
            @RequestParam(required = false) Long groupId) {
        try {
            Settlement settlement = balanceService.settleBalance(fromUserId, toUserId, amount, currency, groupId);
            return ResponseEntity.status(HttpStatus.CREATED).body(settlement);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Retrieves the settlement history for a user.
     *
     * @param userId The ID of the user
     * @return A list of Settlement entities involving the user
     */
    @GetMapping("/settlements/user/{userId}")
    public ResponseEntity<List<Settlement>> getUserSettlements(@PathVariable Long userId) {
        List<Settlement> settlements = balanceService.getUserSettlements(userId);
        return ResponseEntity.ok(settlements);
    }
}
