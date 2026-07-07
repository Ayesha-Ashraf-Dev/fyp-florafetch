export const ORDER_STATUSES = [
  { value: "order_confirmed", label: "Order Confirmed" },
  { value: "plant_selection", label: "Plant Selection" },
  { value: "in_transit", label: "In Transit" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  order_confirmed: { label: "Order Confirmed", color: "#3b82f6", bg: "#eff6ff" },
  plant_selection: { label: "Plant Selection", color: "#7c3aed", bg: "#f5f3ff" },
  in_transit: { label: "In Transit", color: "var(--color-terracotta)", bg: "var(--color-terracotta-pale)" },
  delivered: { label: "Delivered", color: "var(--color-forest-muted)", bg: "var(--color-sage-pale)" },
  cancelled: { label: "Cancelled", color: "#dc2626", bg: "#fef2f2" },
};

export const TIMELINE_STEPS = [
  { key: "order_confirmed", label: "Order Placed" },
  { key: "plant_selection", label: "Plant Selection" },
  { key: "in_transit", label: "In Transit" },
  { key: "delivered", label: "Delivered" },
];

export function getStatusConfig(status: string) {
  return STATUS_CONFIG[status?.toLowerCase()] || STATUS_CONFIG.order_confirmed;
}

export function getTimelineIndex(status: string): number {
  if (status === "cancelled") return -1;
  const idx = TIMELINE_STEPS.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
}
