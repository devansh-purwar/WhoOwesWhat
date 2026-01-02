package com.splitwise.splitwiseclone.controller;

import com.splitwise.splitwiseclone.entity.Balance;
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

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Balance>> getUserBalances(@PathVariable Long userId) {
        List<Balance> balances = balanceService.getUserBalances(userId);
        return ResponseEntity.ok(balances);
    }

    @GetMapping("/user/{userId}/net")
    public ResponseEntity<Map<String, BigDecimal>> getUserNetBalance(@PathVariable Long userId) {
        Map<String, BigDecimal> netBalance = balanceService.calculateNetBalance(userId);
        return ResponseEntity.ok(netBalance);
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<Balance>> getGroupBalances(@PathVariable Long groupId) {
        List<Balance> balances = balanceService.getGroupBalances(groupId);
        return ResponseEntity.ok(balances);
    }

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

    @GetMapping("/settlements/user/{userId}")
    public ResponseEntity<List<Settlement>> getUserSettlements(@PathVariable Long userId) {
        List<Settlement> settlements = balanceService.getUserSettlements(userId);
        return ResponseEntity.ok(settlements);
    }
}
