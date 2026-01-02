package com.splitwise.splitwiseclone.service.strategy;

import com.splitwise.splitwiseclone.dto.SplitParticipant;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Percentage split strategy - splits based on percentage for each participant
 */
@Component
public class PercentageSplitStrategy implements SplitStrategy {

    @Override
    public Map<Long, BigDecimal> calculateSplit(BigDecimal totalAmount, List<SplitParticipant> participants) {
        validate(totalAmount, participants);

        Map<Long, BigDecimal> splits = new HashMap<>();
        BigDecimal totalAssigned = BigDecimal.ZERO;

        // Calculate for all but last participant
        for (int i = 0; i < participants.size() - 1; i++) {
            SplitParticipant participant = participants.get(i);
            BigDecimal amount = totalAmount
                    .multiply(participant.getPercentage())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
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

        BigDecimal totalPercentage = BigDecimal.ZERO;
        for (SplitParticipant participant : participants) {
            if (participant.getPercentage() == null ||
                    participant.getPercentage().compareTo(BigDecimal.ZERO) <= 0 ||
                    participant.getPercentage().compareTo(BigDecimal.valueOf(100)) > 0) {
                throw new IllegalArgumentException("Each participant must have a percentage between 0 and 100");
            }
            totalPercentage = totalPercentage.add(participant.getPercentage());
        }

        if (totalPercentage.compareTo(BigDecimal.valueOf(100)) != 0) {
            throw new IllegalArgumentException(
                    String.format("Sum of percentages (%.2f) must equal 100", totalPercentage));
        }
    }
}
