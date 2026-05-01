package com.epidemiwatch.util;

/**
 * Stateless utility for normalizing incoming epidemiological data.
 * Ensures consistent casing/formatting across the ingestion and detection pipeline.
 */
public class DataNormalizer {

    private DataNormalizer() {}

    /**
     * Normalizes a county name: trim whitespace, capitalize first letter, lowercase rest.
     * e.g. "  nairobi " → "Nairobi"
     */
    public static String normalizeCounty(String county) {
        if (county == null || county.isBlank()) return county;
        String t = county.trim();
        return Character.toUpperCase(t.charAt(0)) + t.substring(1).toLowerCase();
    }

    /**
     * Normalizes a disease name: trim whitespace + lowercase.
     * e.g. "  Cholera " → "cholera"
     */
    public static String normalizeDisease(String disease) {
        if (disease == null || disease.isBlank()) return disease;
        return disease.trim().toLowerCase();
    }

    /**
     * Normalizes a sub-county name: trim whitespace, capitalize first letter, lowercase rest.
     * e.g. "westlands" → "Westlands", "  NORTH  " → "North"
     */
    public static String normalizeSubCounty(String input) {
        if (input == null || input.isBlank()) return input;
        String cleaned = input.trim().toLowerCase();
        return Character.toUpperCase(cleaned.charAt(0)) + cleaned.substring(1);
    }
}
