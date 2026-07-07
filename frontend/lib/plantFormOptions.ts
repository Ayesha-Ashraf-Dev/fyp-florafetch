export const PLANT_CATEGORIES = ["indoor", "outdoor", "succulents", "flowering", "medicinal"];

export const SIZE_OPTIONS = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

export const CATEGORY_OPTIONS = PLANT_CATEGORIES.map((cat) => ({
  value: cat,
  label: cat.charAt(0).toUpperCase() + cat.slice(1),
}));

export const SUNLIGHT_OPTIONS = [
  { value: "low", label: "🌑 Low" },
  { value: "moderate", label: "⚪ Moderate" },
  { value: "high", label: "☀️ High" },
  { value: "direct", label: "☀️☀️ Direct Sunlight" },
];

export const WATERING_OPTIONS = [
  { value: "rarely", label: "💧 Rarely (1x/month)" },
  { value: "moderate", label: "💧💧 Moderate (2x/week)" },
  { value: "frequently", label: "💧💧💧 Frequently (daily)" },
];

export const HUMIDITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "moderate", label: "Moderate" },
  { value: "high", label: "High" },
];

export const GROWTH_OPTIONS = [
  { value: "slow", label: "🐌 Slow" },
  { value: "moderate", label: "⏱️ Moderate" },
  { value: "fast", label: "🚀 Fast" },
];

export const labelStyle = {
  display: "block",
  fontSize: "13px",
  fontWeight: "600",
  color: "var(--color-forest)",
  marginBottom: "8px",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

export const sectionStyle = {
  background: "white",
  border: "1px solid var(--color-sand)",
  borderRadius: "8px",
  padding: "32px",
  marginBottom: "24px",
};

export const sectionTitleStyle = {
  fontSize: "16px",
  fontWeight: "600",
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: "var(--color-terracotta)",
  marginBottom: "24px",
};
