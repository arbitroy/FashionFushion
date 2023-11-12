package com.arbitroy.fashionFushion.Domains;

public enum UserType {
    DESIGNER("Designer"),
    TAILOR("Tailor");

    private final String displayName;

    UserType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
