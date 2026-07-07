// app/orders/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiClient, Order } from "@/lib/api";
import { getStatusConfig } from "@/lib/orderStatus";
import { formatPKR } from "@/lib/currency";
import { orderPath } from "@/lib/paths";

const getStatus = (s: string) => getStatusConfig(s);

// Helper to safely get items array
const getOrderItems = (order: any) => {
  return order.order_items || order.items || [];
};

// Helper to safely get total amount
const getTotalAmount = (order: any) => {
  return order.total_amount || order.total_price || 0;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = () => {
      apiClient.getOrders()
        .then((data) => {
          const processedOrders = data.map((order: any) => ({
            ...order,
            items: order.order_items || order.items || [],
            total_amount: order.total_amount || order.total_price || 0,
          }));
          setOrders(processedOrders);
        })
        .catch((err) => setError(err.message || "Failed to load orders"))
        .finally(() => setLoading(false));
    };
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>Loading your orders…</p>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--color-cream)", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid var(--color-sand)", padding: "48px 40px 36px" }}>
        <div style={{ maxWidth: "1024px", margin: "0 auto" }}>
          <p style={{
            fontSize: "11px", fontWeight: "600", letterSpacing: "0.18em",
            textTransform: "uppercase", color: "var(--color-terracotta)", marginBottom: "8px",
          }}>Order History</p>
          <h1 style={{
            fontFamily: "var(--font-playfair, serif)",
            fontSize: "clamp(28px, 3vw, 44px)",
            fontWeight: "600",
            color: "var(--color-forest)",
          }}>Your Orders</h1>
        </div>
      </div>

      <div style={{ maxWidth: "1024px", margin: "0 auto", padding: "40px" }}>
        {error && (
          <div style={{
            background: "#fef2f2", border: "1px solid #fecaca",
            borderRadius: "6px", padding: "14px 16px",
            fontSize: "14px", color: "#dc2626", marginBottom: "24px",
          }}>{error}</div>
        )}

        {orders.length === 0 && !error ? (
          <div style={{ textAlign: "center", padding: "100px 40px" }}>
            <p style={{ fontSize: "48px", marginBottom: "16px" }}>📦</p>
            <h2 style={{
              fontFamily: "var(--font-playfair, serif)",
              fontSize: "28px", color: "var(--color-forest)", marginBottom: "8px",
            }}>No orders yet</h2>
            <p style={{ color: "var(--color-text-muted)", marginBottom: "32px" }}>
              When you place an order, it will appear here
            </p>
            <Link href="/shop" style={{
              display: "inline-block",
              background: "var(--color-forest)", color: "var(--color-cream)",
              padding: "14px 36px", borderRadius: "4px",
              fontSize: "13px", fontWeight: "600", textDecoration: "none",
              letterSpacing: "0.04em", textTransform: "uppercase",
            }}>
              Start Shopping
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {orders.map((order) => {
              const statusCfg = getStatus(order.status);
              const items = order.items || [];
              const totalAmount = order.total_amount || order.total_price || 0;
              
              return (
                <div key={order.id} style={{
                  background: "white",
                  border: "1px solid var(--color-sand)",
                  borderRadius: "6px",
                  padding: "28px",
                }}>
                  {/* Top row */}
                  <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                    marginBottom: "20px", flexWrap: "wrap", gap: "12px",
                  }}>
                    <div>
                      <p style={{ fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "4px" }}>Order ID</p>
                      <p style={{
                        fontFamily: "var(--font-playfair, serif)",
                        fontSize: "18px", fontWeight: "600", color: "var(--color-forest)",
                      }}>#{order.id}</p>
                    </div>
                    <span style={{
                      background: statusCfg.bg,
                      color: statusCfg.color,
                      padding: "6px 14px",
                      borderRadius: "100px",
                      fontSize: "12px",
                      fontWeight: "600",
                      textTransform: "capitalize",
                    }}>
                      {statusCfg.label}
                    </span>
                  </div>

                  {/* Metadata */}
                  <div style={{
                    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                    gap: "16px", marginBottom: "20px",
                    padding: "16px 0",
                    borderTop: "1px solid var(--color-sand)",
                    borderBottom: "1px solid var(--color-sand)",
                  }}>
                    {[
                      { label: "Date", value: new Date(order.created_at).toLocaleDateString() },
                      { label: "Items", value: `${items.length} item${items.length !== 1 ? "s" : ""}` },
                      { label: "Total", value: formatPKR(totalAmount, 2) },
                      { label: "Payment", value: "Cash on Delivery" },
                    ].map((m) => (
                      <div key={m.label}>
                        <p style={{ fontSize: "11px", color: "var(--color-text-muted)", marginBottom: "4px" }}>{m.label}</p>
                        <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--color-charcoal)" }}>{m.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Items */}
                  {items.length > 0 && (
                    <div style={{ marginBottom: "16px" }}>
                      <p style={{ fontSize: "12px", color: "var(--color-text-muted)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Items</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {items.map((item: any) => (
                          <div key={item.plant_id || item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                            <span style={{ color: "var(--color-charcoal-light)" }}>
                              {item.plant?.name || item.plant_name || "Unknown Plant"} × {item.quantity}
                            </span>
                            <span style={{ fontWeight: "600", color: "var(--color-forest)" }}>
                              {formatPKR((item.unit_price || item.price || 0) * (item.quantity || 1), 2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CTA */}
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <Link href={orderPath(order)} style={{
                      fontSize: "13px", color: "var(--color-forest)", textDecoration: "none",
                      borderBottom: "1px solid var(--color-forest)", paddingBottom: "2px", fontWeight: "500",
                    }}>
                      Track Order →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}