package com.splitwise.splitwiseclone.service.strategy;

import com.splitwise.splitwiseclone.dto.SplitParticipant;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Strategy interface for different expense split calculations
 * Follows Strategy Pattern for Open/Closed Principle
 */
public interface SplitStrategy {

    /**
     * Calculate the split amounts for each participant
     * 
     * @param totalAmount  Total expense amount
     * @param participants List of participants with their split details
     * @return Map of userId to amount they owe
     */
    Map<Long, BigDecimal> calculateSplit(BigDecimal totalAmount, List<SplitParticipant> participants);

    /**
     * Validate that the split configuration is correct
     * 
     * @param totalAmount  Total expense amount
     * @param participants List of participants
     * @throws IllegalArgumentException if validation fails
     */
    void validate(BigDecimal totalAmount, List<SplitParticipant> participants);
}
