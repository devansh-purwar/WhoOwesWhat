package com.splitwise.splitwiseclone.enums;

public enum CategoryType {
    FOOD("Food", "🍔"),
    TRAVEL("Travel", "✈️"),
    RENT("Rent", "🏠"),
    UTILITIES("Utilities", "💡"),
    ENTERTAINMENT("Entertainment", "🎬"),
    SHOPPING("Shopping", "🛍️"),
    HEALTHCARE("Healthcare", "🏥"),
    EDUCATION("Education", "📚"),
    OTHER("Other", "📌");

    private final String displayName;
    private final String icon;

    CategoryType(String displayName, String icon) {
        this.displayName = displayName;
        this.icon = icon;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getIcon() {
        return icon;
    }
}
