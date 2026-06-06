export const colors = {
  primary: "#4E7D5A",
  primaryDark: "#355E3B",
  primaryLight: "#6B9A76",
  secondary: "#EFE9DF",
  sidebar: "#F3F0E9",
  background: "#F7F4EE",
  card: "#FFFFFF",
  text: "#2F2F2F",
  textLight: "#6B6B6B",
  muted: "#8B8B8B",
  border: "#E8E2D8",
  success: "#4CAF50",
  warning: "#C5A36E",
  danger: "#C45C4A",
  tan: "#8B7355",
  peach: "#D4A574",
  sage: "#A8C5A0",
};

export const categoryStyles = {
  Infrastructure: { bg: "#E8F0E4", text: "#355E3B" },
  "Cloud Infrastructure": { bg: "#E8F0E4", text: "#355E3B" },
  SaaS: { bg: "#E8F0E4", text: "#355E3B" },
  "SaaS Tools": { bg: "#E8F0E4", text: "#355E3B" },
  Entertainment: { bg: "#F5E6D8", text: "#8B5A3C" },
  Dining: { bg: "#F5E6D8", text: "#8B5A3C" },
  Travel: { bg: "#EDE4D4", text: "#6B5344" },
  Food: { bg: "#F5E6D8", text: "#8B5A3C" },
  Transport: { bg: "#EDE4D4", text: "#6B5344" },
  Other: { bg: "#F0EEEA", text: "#6B6B6B" },
};

export const chartColors = ["#4E7D5A", "#8B7355", "#C5A36E", "#D4D0C8"];

export function getCategoryStyle(category) {
  return categoryStyles[category] || categoryStyles.Other;
}
