package com.splitwise.splitwiseclone.service.strategy;

import com.splitwise.splitwiseclone.dto.SplitParticipant;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Equal split strategy - divides expense equally among all participants
 */
@Component
public class EqualSplitStrategy implements SplitStrategy {

    @Override
    public Map<Long, BigDecimal> calculateSplit(BigDecimal totalAmount, List<SplitParticipant> participants) {
        validate(totalAmount, participants);

        Map<Long, BigDecimal> splits = new HashMap<>();
        int participantCount = participants.size();
        BigDecimal equalShare = totalAmount.divide(
                BigDecimal.valueOf(participantCount),
                2,
                RoundingMode.HALF_UP);

        // Handle rounding difference
        BigDecimal totalAssigned = BigDecimal.ZERO;
        for (int i = 0; i < participantCount - 1; i++) {
            splits.put(participants.get(i).getUserId(), equalShare);
            totalAssigned = totalAssigned.add(equalShare);
        }

        // Last participant gets the remainder to ensure total matches
        BigDecimal lastShare = totalAmount.subtract(totalAssigned);
        splits.put(participants.get(participantCount - 1).getUserId(), lastShare);

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
    }
}
