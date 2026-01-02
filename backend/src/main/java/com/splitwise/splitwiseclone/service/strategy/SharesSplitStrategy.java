package com.splitwise.splitwiseclone.service.strategy;

import com.splitwise.splitwiseclone.dto.SplitParticipant;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Shares split strategy - splits based on ratio/shares for each participant
 * Example: If A has 2 shares and B has 3 shares, A gets 2/5 and B gets 3/5
 */
@Component
public class SharesSplitStrategy implements SplitStrategy {

    @Override
    public Map<Long, BigDecimal> calculateSplit(BigDecimal totalAmount, List<SplitParticipant> participants) {
        validate(totalAmount, participants);

        Map<Long, BigDecimal> splits = new HashMap<>();

        // Calculate total shares
        int totalShares = participants.stream()
                .mapToInt(SplitParticipant::getShares)
                .sum();

        BigDecimal totalAssigned = BigDecimal.ZERO;

        // Calculate for all but last participant
        for (int i = 0; i < participants.size() - 1; i++) {
            SplitParticipant participant = participants.get(i);
            BigDecimal amount = totalAmount
                    .multiply(BigDecimal.valueOf(participant.getShares()))
                    .divide(BigDecimal.valueOf(totalShares), 2, RoundingMode.HALF_UP);
            splits.put(participant.getUserId(), amount);
            totalAssigned = totalAssigned.add(amount);
        }

        // Last participant gets remainder to handle rounding
        SplitParticipant lastParticipant = participants.get(participants.size() - 1);
        BigDecimal lastAmount = totalAmount.subtract(totalAssigned);
        splits.put(lastParticipant.getUserId(), lastAmount);

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

        for (SplitParticipant participant : participants) {
            if (participant.getShares() == null || participant.getShares() <= 0) {
                throw new IllegalArgumentException("Each participant must have at least 1 share");
            }
        }
    }
}
