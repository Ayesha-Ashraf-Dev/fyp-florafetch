"use client";

import React from "react";
import { FormSelect } from "@/components/ui/FormSelect";

export interface SearchFilters {
  priceMin?: number;
  priceMax?: number;
  category?: string;
  wateringFrequency?: string;
  sunlight?: string;
  petFriendly?: boolean;
  lowMaintenance?: boolean;
}

interface AdvancedSearchFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function AdvancedSearchFilters({
  onFiltersChange,
  isOpen,
  onClose,
}: AdvancedSearchFiltersProps) {
  const [filters, setFilters] = React.useState<SearchFilters>({});

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value === "" ? undefined : value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    setFilters({});
    onFiltersChange({});
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "32px",
          maxWidth: "500px",
          width: "90%",
          maxHeight: "80vh",
          overflowY: "auto",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-playfair, serif)",
              fontSize: "22px",
              fontWeight: "600",
              color: "var(--color-forest)",
            }}
          >
            Advanced Filters
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "var(--color-text-muted)",
            }}
          >
            ✕
          </button>
        </div>

        {/* Price Range */}
        <div style={{ marginBottom: "24px" }}>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "600",
              color: "var(--color-forest)",
              marginBottom: "8px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Price Range
          </label>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <input
              type="number"
              placeholder="Min"
              value={filters.priceMin || ""}
              onChange={(e) =>
                handleFilterChange("priceMin", e.target.value ? parseFloat(e.target.value) : "")
              }
              style={{
                flex: 1,
                padding: "10px 12px",
                border: "1px solid var(--color-sand)",
                borderRadius: "4px",
                fontSize: "13px",
                fontFamily: "inherit",
                outline: "none",
              }}
            />
            <span style={{ color: "var(--color-text-muted)" }}>–</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.priceMax || ""}
              onChange={(e) =>
                handleFilterChange("priceMax", e.target.value ? parseFloat(e.target.value) : "")
              }
              style={{
                flex: 1,
                padding: "10px 12px",
                border: "1px solid var(--color-sand)",
                borderRadius: "4px",
                fontSize: "13px",
                fontFamily: "inherit",
                outline: "none",
              }}
            />
          </div>
        </div>

        {/* Watering Frequency */}
        <div style={{ marginBottom: "24px" }}>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "600",
              color: "var(--color-forest)",
              marginBottom: "8px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Watering Frequency
          </label>
          <FormSelect
            value={filters.wateringFrequency || "all"}
            onValueChange={(v) => handleFilterChange("wateringFrequency", v === "all" ? "" : v)}
            options={[
              { value: "all", label: "All Frequencies" },
              { value: "rare", label: "Rare (Once a month)" },
              { value: "moderate", label: "Moderate (Weekly)" },
              { value: "frequent", label: "Frequent (2-3 times a week)" },
            ]}
          />
        </div>

        {/* Sunlight Requirements */}
        <div style={{ marginBottom: "24px" }}>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "600",
              color: "var(--color-forest)",
              marginBottom: "8px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Sunlight Requirement
          </label>
          <FormSelect
            value={filters.sunlight || "all"}
            onValueChange={(v) => handleFilterChange("sunlight", v === "all" ? "" : v)}
            options={[
              { value: "all", label: "All Sunlight Levels" },
              { value: "low", label: "Low Light" },
              { value: "moderate", label: "Moderate Light" },
              { value: "high", label: "High Light" },
            ]}
          />
        </div>

        {/* Checkboxes */}
        <div style={{ marginBottom: "24px" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "13px",
              color: "var(--color-charcoal)",
              marginBottom: "12px",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={filters.petFriendly || false}
              onChange={(e) => handleFilterChange("petFriendly", e.target.checked || undefined)}
              style={{ cursor: "pointer" }}
            />
            Pet Friendly Only
          </label>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "13px",
              color: "var(--color-charcoal)",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={filters.lowMaintenance || false}
              onChange={(e) =>
                handleFilterChange("lowMaintenance", e.target.checked || undefined)
              }
              style={{ cursor: "pointer" }}
            />
            Low Maintenance Only
          </label>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={handleReset}
            style={{
              flex: 1,
              padding: "10px 16px",
              background: "var(--color-cream-dark)",
              border: "1px solid var(--color-sand)",
              borderRadius: "4px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              color: "var(--color-charcoal)",
              fontFamily: "inherit",
            }}
          >
            Reset
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "10px 16px",
              background: "var(--color-forest)",
              border: "none",
              borderRadius: "4px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              color: "white",
              fontFamily: "inherit",
            }}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
