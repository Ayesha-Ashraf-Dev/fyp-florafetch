"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useCart } from "@/app/context/CartContext";
import { useAuth } from "@/app/context/AuthContext";
import { toast } from "sonner";
import { useEffect } from "react";
import { formatPKR } from "@/lib/currency";

export default function CartPage() {
  const { items, total, isLoading, updateQuantity, removeFromCart } = useCart();
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) router.push("/login");
  }, [isLoggedIn, router]);

  useEffect(() => {
    console.log("Cart items updated:", items);
    items.forEach((item, idx) => {
      console.log(`Item ${idx}:`, {
        id: item.id,
        plant_id: item.plant_id,
        quantity: item.quantity,
        price: item.price,
        hasPlant: !!item.plant,
        plant: item.plant,
      });
    });
  }, [items]);

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) { await handleRemoveItem(itemId); return; }
    try { await updateQuantity(itemId, newQuantity); } catch { toast.error("Failed to update quantity"); }
  };

  const handleRemoveItem = async (itemId: number) => {
    try { await removeFromCart(itemId); toast.success("Item removed"); } catch { toast.error("Failed to remove item"); }
  };

  if (isLoading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "50vh" }}>
      <LoadingSpinner />
    </div>
  );

  return (
    <div style={{ background: "var(--color-cream)", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid var(--color-sand)", padding: "40px 40px 32px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{
              fontSize: "11px", fontWeight: "600", letterSpacing: "0.18em",
              textTransform: "uppercase", color: "var(--color-terracotta)", marginBottom: "8px",
            }}>Your Selection</p>
            <h1 style={{
              fontFamily: "var(--font-playfair, serif)",
              fontSize: "clamp(28px, 3vw, 40px)",
              fontWeight: "600",
              color: "var(--color-forest)",
            }}>Shopping Cart</h1>
          </div>
          <Link href="/shop" style={{
            fontSize: "13px", color: "var(--color-forest)", textDecoration: "none",
            borderBottom: "1px solid var(--color-forest)", paddingBottom: "2px", fontWeight: "500",
          }}>
            ← Continue Shopping
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px" }}>
        {items.length === 0 ? (
          /* Empty state */
          <div style={{ textAlign: "center", padding: "100px 40px" }}>
            <p style={{ fontSize: "60px", marginBottom: "20px" }}>🌱</p>
            <h2 style={{
              fontFamily: "var(--font-playfair, serif)",
              fontSize: "32px", color: "var(--color-forest)", marginBottom: "12px",
            }}>Your cart is empty</h2>
            <p style={{ color: "var(--color-text-muted)", marginBottom: "36px" }}>
              Explore our curated collection and find the perfect plant for your space.
            </p>
            <Link href="/shop" style={{
              display: "inline-block",
              background: "var(--color-forest)",
              color: "var(--color-cream)",
              padding: "14px 36px",
              borderRadius: "4px",
              fontSize: "13px",
              fontWeight: "600",
              textDecoration: "none",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}>
              Shop the Collection
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "48px", alignItems: "start" }}
            className="grid-cart">
            {/* Items */}
            <div>
              <p style={{ fontSize: "13px", color: "var(--color-text-muted)", marginBottom: "24px" }}>
                {items.length} item{items.length !== 1 ? "s" : ""} in your cart
              </p>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {items.map((item, i) => (
                  <div key={item.id} style={{
                    display: "flex",
                    gap: "24px",
                    padding: "28px 0",
                    borderTop: i === 0 ? "1px solid var(--color-sand)" : "none",
                    borderBottom: "1px solid var(--color-sand)",
                  }}>
                    {/* Image */}
                    <div style={{
                      width: "100px",
                      height: "100px",
                      background: "var(--color-sage-pale)",
                      borderRadius: "4px",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}>
                      {item.plant?.image_url ? (
                        <img src={item.plant.image_url} alt={item.plant.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <span style={{ fontSize: "36px" }}>🌿</span>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontFamily: "var(--font-playfair, serif)",
                        fontSize: "18px",
                        fontWeight: "600",
                        color: "var(--color-forest)",
                        marginBottom: "4px",
                      }}>{item.plant?.name || `Plant #${item.plant_id}`}</h3>
                      <p style={{ fontSize: "12px", fontStyle: "italic", color: "var(--color-text-muted)", marginBottom: "12px" }}>
                        {item.plant?.botanical_name}
                      </p>
                      {/* Qty controls */}
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          border: "1px solid var(--color-sand)",
                          borderRadius: "4px",
                          overflow: "hidden",
                        }}>
                          <button onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            style={{
                              width: "32px", height: "34px",
                              background: "transparent", border: "none",
                              cursor: "pointer", fontSize: "16px",
                              color: "var(--color-charcoal-light)",
                            }}>−</button>
                          <span style={{
                            width: "32px", textAlign: "center",
                            fontSize: "14px", fontWeight: "600",
                            color: "var(--color-forest)",
                          }}>{item.quantity}</span>
                          <button onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            style={{
                              width: "32px", height: "34px",
                              background: "transparent", border: "none",
                              cursor: "pointer", fontSize: "16px",
                              color: "var(--color-charcoal-light)",
                            }}>+</button>
                        </div>
                        <button onClick={() => handleRemoveItem(item.id)}
                          style={{
                            background: "transparent", border: "none",
                            color: "var(--color-text-muted)",
                            fontSize: "12px", cursor: "pointer",
                            fontFamily: "inherit",
                            textDecoration: "underline",
                          }}>
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{
                        fontFamily: "var(--font-playfair, serif)",
                        fontSize: "20px",
                        fontWeight: "600",
                        color: "var(--color-terracotta)",
                      }}>{formatPKR(item.price * item.quantity, 2)}</p>
                      <p style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "4px" }}>
                        {formatPKR(item.price)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div style={{
              background: "var(--color-cream-dark)",
              border: "1px solid var(--color-sand)",
              padding: "32px",
              borderRadius: "6px",
              position: "sticky",
              top: "100px",
            }}>
              <h2 style={{
                fontFamily: "var(--font-playfair, serif)",
                fontSize: "22px", fontWeight: "600",
                color: "var(--color-forest)", marginBottom: "24px",
              }}>Order Summary</h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" }}>
                <Row label={`Subtotal (${items.length} items)`} value={formatPKR(total, 2)} />
                <Row label="Shipping" value="Free" valueColor="var(--color-forest-muted)" />
                <Row label="Tax (GST)" value="Calculated at checkout" />
              </div>

              <div style={{ borderTop: "1px solid var(--color-sand)", paddingTop: "20px", marginBottom: "28px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "16px", fontWeight: "600", color: "var(--color-charcoal)" }}>Total</span>
                  <span style={{
                    fontFamily: "var(--font-playfair, serif)",
                    fontSize: "26px", fontWeight: "600",
                    color: "var(--color-terracotta)",
                  }}>{formatPKR(total, 2)}</span>
                </div>
              </div>

              <Link href="/checkout" style={{
                display: "block",
                background: "var(--color-forest)",
                color: "var(--color-cream)",
                padding: "16px",
                borderRadius: "4px",
                fontSize: "13px",
                fontWeight: "600",
                textDecoration: "none",
                textAlign: "center",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                marginBottom: "12px",
              }}>
                Proceed to Checkout
              </Link>

              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                marginTop: "16px",
              }}>
                <span style={{ fontSize: "14px" }}>🔒</span>
                <p style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Secure & Encrypted Checkout</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>{label}</span>
      <span style={{ fontSize: "13px", fontWeight: "600", color: valueColor || "var(--color-charcoal)" }}>{value}</span>
    </div>
  );
}
