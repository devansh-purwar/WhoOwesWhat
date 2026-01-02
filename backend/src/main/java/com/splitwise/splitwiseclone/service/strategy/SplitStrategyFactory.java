package com.splitwise.splitwiseclone.service.strategy;

import com.splitwise.splitwiseclone.enums.SplitType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Factory to get the appropriate split strategy based on split type
 * Follows Factory Pattern
 */
@Component
@RequiredArgsConstructor
public class SplitStrategyFactory {

    private final EqualSplitStrategy equalSplitStrategy;
    private final ExactSplitStrategy exactSplitStrategy;
    private final PercentageSplitStrategy percentageSplitStrategy;
    private final SharesSplitStrategy sharesSplitStrategy;

    public SplitStrategy getStrategy(SplitType splitType) {
        return switch (splitType) {
            case EQUAL -> equalSplitStrategy;
            case EXACT -> exactSplitStrategy;
            case PERCENTAGE -> percentageSplitStrategy;
            case SHARES -> sharesSplitStrategy;
        };
    }
}
