package com.splitwise.splitwiseclone.service.strategy;

import com.splitwise.splitwiseclone.dto.SplitParticipant;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Exact split strategy - uses exact amounts specified for each participant
 */
@Component
public class ExactSplitStrategy implements SplitStrategy {

    @Override
    public Map<Long, BigDecimal> calculateSplit(BigDecimal totalAmount, List<SplitParticipant> participants) {
        validate(totalAmount, participants);

        Map<Long, BigDecimal> splits = new HashMap<>();
        for (SplitParticipant participant : participants) {
            splits.put(participant.getUserId(), participant.getAmount());
        }

        return splits;
    }

    @Override
    public void validate(BigDecimal totalAmount, List<SplitParticipant> participants) {
        if (totalAmount == null || totalAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Total amount must be positive");
        }
        if (participants == null || participants.isEmpty()) {
            throw new IllegalArgumentException("At least one participant is required");
        }

        BigDecimal sum = BigDecimal.ZERO;
        for (SplitParticipant participant : participants) {
            if (participant.getAmount() == null || participant.getAmount().compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalArgumentException("Each participant must have a valid amount");
            }
            sum = sum.add(participant.getAmount());
        }

        if (sum.compareTo(totalAmount) != 0) {
            throw new IllegalArgumentException(
                    String.format("Sum of split amounts (%.2f) must equal total amount (%.2f)",
                            sum, totalAmount));
        }
    }
}
