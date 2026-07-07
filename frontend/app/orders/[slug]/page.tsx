"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/api";
import { getStatusConfig, TIMELINE_STEPS, getTimelineIndex } from "@/lib/orderStatus";
import { formatPKR } from "@/lib/currency";
import {
  ChevronLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  CreditCard,
  Printer,
  HelpCircle,
  ShoppingBag
} from "lucide-react";

const TIMELINE_ICONS = [Clock, Package, Truck, CheckCircle];

export default function OrderDetailPage() {
  const params = useParams();
  const orderSlug = params.slug as string;
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOrder();
    const interval = setInterval(loadOrder, 15000);
    return () => clearInterval(interval);
  }, [orderSlug]);

  const loadOrder = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiClient.getOrder(orderSlug);
      const normalizedOrder = {
        ...data,
        items: data.order_items || data.items || [],
        total_amount: data.total_amount || data.total_price || 0,
      };
      setOrder(normalizedOrder);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        background: "var(--color-cream)", 
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "40px",
            height: "40px",
            border: "3px solid var(--color-sand)",
            borderTop: "3px solid var(--color-forest)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto"
          }} />
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
          <p style={{ 
            marginTop: "16px", 
            color: "var(--color-text-muted)", 
            fontSize: "14px",
            fontFamily: "var(--font-inter, sans-serif)"
          }}>
            Loading your order…
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ 
        background: "var(--color-cream)", 
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 24px"
      }}>
        <div style={{
          background: "white",
          border: "1px solid var(--color-sand)",
          borderRadius: "6px",
          padding: "48px 40px",
          maxWidth: "420px",
          width: "100%",
          textAlign: "center"
        }}>
          <div style={{
            width: "48px",
            height: "48px",
            background: "#fef2f2",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 12px"
          }}>
            <Package style={{ width: "24px", height: "24px", color: "#dc2626" }} />
          </div>
          <h3 style={{
            fontFamily: "var(--font-playfair, serif)",
            fontSize: "22px",
            color: "var(--color-forest)",
            marginBottom: "4px"
          }}>
            Order Not Found
          </h3>
          <p style={{
            color: "var(--color-text-muted)",
            fontSize: "14px",
            marginBottom: "24px"
          }}>
            {error || "This order doesn't exist."}
          </p>
          <Link
            href="/orders"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
              color: "var(--color-forest)",
              textDecoration: "none",
              borderBottom: "1px solid var(--color-forest)",
              paddingBottom: "2px",
              fontWeight: "500"
            }}
          >
            <ChevronLeft style={{ width: "16px", height: "16px" }} />
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.status);
  const totalAmount = order.total_amount || 0;
  const orderItems = order.items || [];
  const currentStepIndex = getTimelineIndex(order.status);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="order-receipt" style={{ background: "var(--color-cream)", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ 
        borderBottom: "1px solid var(--color-sand)", 
        padding: "48px 40px 36px" 
      }}>
        <div style={{ maxWidth: "1024px", margin: "0 auto" }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "16px"
          }}>
            <div>
              <Link
                href="/orders"
                className="no-print"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "13px",
                  color: "var(--color-text-muted)",
                  textDecoration: "none",
                  marginBottom: "12px",
                  transition: "color 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-forest)"}
                onMouseLeave={(e) => e.currentTarget.style.color = "var(--color-text-muted)"}
              >
                <ChevronLeft style={{ width: "16px", height: "16px" }} />
                Back to Orders
              </Link>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <h1 style={{
                  fontFamily: "var(--font-playfair, serif)",
                  fontSize: "clamp(24px, 2.5vw, 36px)",
                  fontWeight: "600",
                  color: "var(--color-forest)",
                }}>
                  Order #{order.order_number || order.id}
                </h1>
                <span style={{
                  background: statusConfig.bg,
                  color: statusConfig.color,
                  padding: "4px 14px",
                  borderRadius: "100px",
                  fontSize: "12px",
                  fontWeight: "600",
                  textTransform: "capitalize",
                }}>
                  {statusConfig.label}
                </span>
              </div>
              <p style={{
                fontSize: "13px",
                color: "var(--color-text-muted)",
                marginTop: "4px"
              }}>
                Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{
                fontSize: "11px",
                color: "var(--color-text-muted)",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.08em"
              }}>
                Total Amount
              </p>
              <p style={{
                fontFamily: "var(--font-playfair, serif)",
                fontSize: "clamp(28px, 2.5vw, 36px)",
                fontWeight: "700",
                color: "var(--color-forest)",
              }}>
                {formatPKR(totalAmount, 2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1024px", margin: "0 auto", padding: "40px" }}>
        {/* Timeline */}
        <div className="no-print" style={{
          background: "white",
          border: "1px solid var(--color-sand)",
          borderRadius: "6px",
          padding: "32px 40px",
          marginBottom: "24px"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
          }}>
            {TIMELINE_STEPS.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isActive = index === currentStepIndex;
              const Icon = TIMELINE_ICONS[index];

              return (
                <div key={step.key} style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  flex: 1,
                  position: "relative"
                }}>
                  {/* Connector line */}
                  {index < TIMELINE_STEPS.length - 1 && (
                    <div style={{
                      position: "absolute",
                      top: "20px",
                      left: "calc(50% + 20px)",
                      right: "calc(-50% + 20px)",
                      height: "2px",
                      background: index < currentStepIndex 
                        ? "var(--color-forest)" 
                        : "var(--color-sand)",
                      transition: "background 0.3s"
                    }} />
                  )}

                  {/* Circle */}
                  <div style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: isCompleted ? "var(--color-forest)" : "white",
                    border: isCompleted ? "2px solid var(--color-forest)" : "2px solid var(--color-sand)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    zIndex: 1,
                    transition: "all 0.3s"
                  }}>
                    {isCompleted ? (
                      <CheckCircle style={{ 
                        width: "18px", 
                        height: "18px", 
                        color: "white" 
                      }} />
                    ) : (
                      <Icon style={{ 
                        width: "16px", 
                        height: "16px", 
                        color: "var(--color-text-muted)" 
                      }} />
                    )}
                  </div>

                  {/* Label */}
                  <p style={{
                    fontSize: "11px",
                    fontWeight: isActive ? "600" : "400",
                    color: isCompleted ? "var(--color-forest)" : "var(--color-text-muted)",
                    marginTop: "8px",
                    textAlign: "center",
                    letterSpacing: "0.02em"
                  }}>
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "24px"
        }}>
          {/* Left Column - Items */}
          <div>
            <div style={{
              background: "white",
              border: "1px solid var(--color-sand)",
              borderRadius: "6px",
              padding: "28px"
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "20px"
              }}>
                <ShoppingBag style={{ 
                  width: "18px", 
                  height: "18px", 
                  color: "var(--color-forest)" 
                }} />
                <h3 style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "var(--color-forest)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em"
                }}>
                  Items ({orderItems.length})
                </h3>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {orderItems.map((item: any) => {
                  const unitPrice = item.unit_price || item.price || 0;
                  const quantity = item.quantity || 1;
                  const plantName = item.plant?.name || item.plant_name || "Unknown Plant";
                  const itemTotal = unitPrice * quantity;

                  return (
                    <div key={item.plant_id || item.id} style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingBottom: "16px",
                      borderBottom: "1px solid var(--color-sand)",
                      gap: "16px"
                    }}>
                      <div style={{ flex: 1 }}>
                        <p style={{
                          fontSize: "15px",
                          fontWeight: "500",
                          color: "var(--color-charcoal)"
                        }}>
                          {plantName}
                        </p>
                        <p style={{
                          fontSize: "13px",
                          color: "var(--color-text-muted)"
                        }}>
                          {formatPKR(unitPrice, 2)} × {quantity}
                        </p>
                      </div>
                      <p style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "var(--color-forest)"
                      }}>
                        {formatPKR(itemTotal, 2)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div>
            <div style={{
              background: "white",
              border: "1px solid var(--color-sand)",
              borderRadius: "6px",
              padding: "28px"
            }}>
              <h3 style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "var(--color-forest)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "20px"
              }}>
                Order Summary
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "14px",
                  color: "var(--color-charcoal-light)"
                }}>
                  <span>Subtotal</span>
                  <span>{formatPKR(totalAmount, 2)}</span>
                </div>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "14px",
                  color: "var(--color-charcoal-light)"
                }}>
                  <span>Shipping</span>
                  <span style={{ color: "var(--color-forest)" }}>Free</span>
                </div>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "14px",
                  color: "var(--color-charcoal-light)"
                }}>
                  <span>Payment</span>
                  <span>Cash on Delivery</span>
                </div>
                <div style={{
                  borderTop: "1px solid var(--color-sand)",
                  paddingTop: "12px",
                  marginTop: "4px",
                  display: "flex",
                  justifyContent: "space-between"
                }}>
                  <span style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "var(--color-charcoal)"
                  }}>
                    Total
                  </span>
                  <span style={{
                    fontFamily: "var(--font-playfair, serif)",
                    fontSize: "22px",
                    fontWeight: "700",
                    color: "var(--color-forest)"
                  }}>
                    {formatPKR(totalAmount, 2)}
                  </span>
                </div>
              </div>

              {/* Delivery Address */}
              {order.address && (
                <div style={{
                  marginTop: "20px",
                  paddingTop: "20px",
                  borderTop: "1px solid var(--color-sand)"
                }}>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <MapPin style={{ 
                      width: "18px", 
                      height: "18px", 
                      color: "var(--color-terracotta)",
                      flexShrink: 0,
                      marginTop: "1px"
                    }} />
                    <div>
                      <p style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "var(--color-charcoal)",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        marginBottom: "4px"
                      }}>
                        Delivery Address
                      </p>
                      <p style={{
                        fontSize: "14px",
                        color: "var(--color-charcoal-light)",
                        lineHeight: "1.5"
                      }}>
                        {order.address.street}<br />
                        {order.address.city}, {order.address.state} {order.address.zip_code}<br />
                        {order.address.country}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="no-print" style={{
                marginTop: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "10px"
              }}>
                <button style={{
                  width: "100%",
                  padding: "12px",
                  background: "var(--color-forest)",
                  color: "var(--color-cream)",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "13px",
                  fontWeight: "600",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "opacity 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
                onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}>
                  <HelpCircle style={{ width: "16px", height: "16px" }} />
                  Need Help?
                </button>
                <button style={{
                  width: "100%",
                  padding: "12px",
                  background: "transparent",
                  color: "var(--color-charcoal-light)",
                  border: "1px solid var(--color-sand)",
                  borderRadius: "4px",
                  fontSize: "13px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-forest)";
                  e.currentTarget.style.color = "var(--color-forest)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-sand)";
                  e.currentTarget.style.color = "var(--color-charcoal-light)";
                }}
                onClick={handlePrint}>
                  <Printer style={{ width: "16px", height: "16px" }} />
                  Print Order
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}