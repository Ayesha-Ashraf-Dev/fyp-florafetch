"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { orderPath } from "@/lib/paths";
import { toast } from "sonner";

interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  is_default: boolean;
}

const STEPS = [
  { id: 1, label: "Delivery Address" },
  { id: 2, label: "Payment Method" },
  { id: 3, label: "Review & Place" },
];

export default function CheckoutPage() {
  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [newAddress, setNewAddress] = useState({ street: "", city: "", state: "", zip_code: "", country: "" });
  const router = useRouter();

  useEffect(() => {
    apiClient.getAddresses()
      .then((data) => {
        setAddresses(data);
        if (data.length > 0) setSelectedAddressId(data[0].id);
      })
      .catch(() => {});
  }, []);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const addr = await apiClient.createAddress({ ...newAddress, is_default: addresses.length === 0 });
      setAddresses([...addresses, addr]);
      setSelectedAddressId(addr.id);
      setNewAddress({ street: "", city: "", state: "", zip_code: "", country: "" });
      setShowAddForm(false);
      toast.success("Address saved");
    } catch {
      toast.error("Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) { toast.error("Please select a delivery address"); return; }
    setLoading(true);
    try {
      const order = await apiClient.createOrder(selectedAddressId, paymentMethod);
      toast.success("Order placed successfully! 🎉");
      setTimeout(() => router.push(orderPath(order)), 800);
    } catch (err) {
      toast.error("Failed to place order", { description: err instanceof Error ? err.message : undefined });
    } finally {
      setLoading(false);
    }
  };

  const selectedAddr = addresses.find((a) => a.id === selectedAddressId);

  return (
    <div style={{ background: "var(--color-cream)", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid var(--color-sand)", padding: "40px 40px 0" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <p style={{
            fontSize: "11px", fontWeight: "600", letterSpacing: "0.18em",
            textTransform: "uppercase", color: "var(--color-terracotta)", marginBottom: "8px",
          }}>Almost There</p>
          <h1 style={{
            fontFamily: "var(--font-playfair, serif)",
            fontSize: "36px", fontWeight: "600", color: "var(--color-forest)", marginBottom: "28px",
          }}>Checkout</h1>

          {/* Step indicators */}
          <div style={{ display: "flex", gap: "0" }}>
            {STEPS.map((s, i) => (
              <div key={s.id} style={{ display: "flex", alignItems: "center" }}>
                <button onClick={() => step > s.id && setStep(s.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    padding: "14px 0", border: "none",
                    background: "transparent", cursor: step > s.id ? "pointer" : "default",
                    fontFamily: "inherit",
                    borderBottom: `2px solid ${step === s.id ? "var(--color-forest)" : "transparent"}`,
                    paddingRight: i < STEPS.length - 1 ? "24px" : "0",
                  }}>
                  <span style={{
                    width: "24px", height: "24px", borderRadius: "50%",
                    background: step >= s.id ? "var(--color-forest)" : "var(--color-sand)",
                    color: step >= s.id ? "white" : "var(--color-text-muted)",
                    fontSize: "11px", fontWeight: "700",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {step > s.id ? "✓" : s.id}
                  </span>
                  <span style={{
                    fontSize: "12px", fontWeight: "600",
                    color: step === s.id ? "var(--color-forest)" : "var(--color-text-muted)",
                    letterSpacing: "0.03em",
                  }}>{s.label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div style={{ width: "32px", height: "1px", background: "var(--color-sand)", margin: "0 8px" }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px" }}>

        {/* Step 1: Address */}
        {step === 1 && (
          <div>
            <h2 style={{
              fontFamily: "var(--font-playfair, serif)",
              fontSize: "22px", fontWeight: "600", color: "var(--color-forest)", marginBottom: "24px",
            }}>Select Delivery Address</h2>

            {addresses.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
                {addresses.map((addr) => (
                  <label key={addr.id} style={{
                    display: "flex", alignItems: "flex-start", gap: "14px",
                    padding: "20px",
                    background: selectedAddressId === addr.id ? "var(--color-sage-pale)" : "white",
                    border: `1px solid ${selectedAddressId === addr.id ? "var(--color-sage)" : "var(--color-sand)"}`,
                    borderRadius: "6px", cursor: "pointer",
                    transition: "all 0.2s",
                  }}>
                    <input
                      type="radio" name="address" value={addr.id}
                      checked={selectedAddressId === addr.id}
                      onChange={(e) => setSelectedAddressId(e.target.value)}
                      style={{ marginTop: "2px", accentColor: "var(--color-forest)" }}
                    />
                    <div>
                      <p style={{ fontSize: "15px", fontWeight: "600", color: "var(--color-forest)", marginBottom: "4px" }}>
                        {addr.street}
                      </p>
                      <p style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>
                        {addr.city}, {addr.state} {addr.zip_code}
                      </p>
                      <p style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>{addr.country}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {showAddForm ? (
              <form onSubmit={handleAddAddress} style={{
                background: "white", border: "1px solid var(--color-sand)",
                borderRadius: "6px", padding: "24px",
                display: "flex", flexDirection: "column", gap: "14px",
              }}>
                <h3 style={{ fontSize: "15px", fontWeight: "600", color: "var(--color-forest)", marginBottom: "4px" }}>
                  New Address
                </h3>
                <AddressInput label="Street Address" value={newAddress.street}
                  onChange={(v) => setNewAddress({ ...newAddress, street: v })} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <AddressInput label="City" value={newAddress.city}
                    onChange={(v) => setNewAddress({ ...newAddress, city: v })} />
                  <AddressInput label="State" value={newAddress.state}
                    onChange={(v) => setNewAddress({ ...newAddress, state: v })} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <AddressInput label="ZIP Code" value={newAddress.zip_code}
                    onChange={(v) => setNewAddress({ ...newAddress, zip_code: v })} />
                  <AddressInput label="Country" value={newAddress.country}
                    onChange={(v) => setNewAddress({ ...newAddress, country: v })} />
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button type="submit" disabled={loading} style={{
                    flex: 1, background: "var(--color-forest)", color: "white",
                    border: "none", borderRadius: "4px", padding: "12px",
                    fontSize: "13px", fontWeight: "600", cursor: "pointer",
                    fontFamily: "inherit", opacity: loading ? 0.7 : 1,
                  }}>Save Address</button>
                  <button type="button" onClick={() => setShowAddForm(false)} style={{
                    flex: 1, background: "var(--color-cream-dark)", color: "var(--color-charcoal)",
                    border: "none", borderRadius: "4px", padding: "12px",
                    fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit",
                  }}>Cancel</button>
                </div>
              </form>
            ) : (
              <button onClick={() => setShowAddForm(true)} style={{
                width: "100%", background: "transparent",
                border: "1px dashed var(--color-sand)", borderRadius: "6px",
                padding: "16px", fontSize: "13px", fontWeight: "600",
                color: "var(--color-forest)", cursor: "pointer", fontFamily: "inherit",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-sage)"}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-sand)"}
              >
                + Add New Address
              </button>
            )}

            <button onClick={() => { if (!selectedAddressId && addresses.length) return; setStep(2); }}
              disabled={!selectedAddressId}
              style={{
                marginTop: "28px",
                width: "100%",
                background: selectedAddressId ? "var(--color-forest)" : "var(--color-sand)",
                color: selectedAddressId ? "var(--color-cream)" : "var(--color-text-muted)",
                border: "none", borderRadius: "4px", padding: "16px",
                fontSize: "13px", fontWeight: "600", cursor: selectedAddressId ? "pointer" : "not-allowed",
                fontFamily: "inherit", letterSpacing: "0.04em", textTransform: "uppercase",
              }}>
              Continue to Payment →
            </button>
          </div>
        )}

        {/* Step 2: Payment */}
        {step === 2 && (
          <div>
            <h2 style={{
              fontFamily: "var(--font-playfair, serif)",
              fontSize: "22px", fontWeight: "600", color: "var(--color-forest)", marginBottom: "24px",
            }}>Payment Method</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
              {[
                { value: "COD", label: "Cash on Delivery", desc: "Pay when your plants arrive at your door", icon: "💵", available: true },
                { value: "CARD", label: "Credit / Debit Card", desc: "Secure online payment (coming soon)", icon: "💳", available: false },
              ].map((opt) => (
                <label key={opt.value} style={{
                  display: "flex", alignItems: "center", gap: "16px",
                  padding: "20px",
                  background: paymentMethod === opt.value ? "var(--color-sage-pale)" : "white",
                  border: `1px solid ${paymentMethod === opt.value ? "var(--color-sage)" : "var(--color-sand)"}`,
                  borderRadius: "6px",
                  cursor: opt.available ? "pointer" : "not-allowed",
                  opacity: opt.available ? 1 : 0.5,
                  transition: "all 0.2s",
                }}>
                  <input type="radio" name="payment" value={opt.value}
                    checked={paymentMethod === opt.value} disabled={!opt.available}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{ accentColor: "var(--color-forest)" }}
                  />
                  <span style={{ fontSize: "24px" }}>{opt.icon}</span>
                  <div>
                    <p style={{ fontSize: "15px", fontWeight: "600", color: "var(--color-forest)" }}>{opt.label}</p>
                    <p style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => setStep(1)} style={{
                flex: 1, background: "var(--color-cream-dark)", color: "var(--color-charcoal)",
                border: "none", borderRadius: "4px", padding: "14px",
                fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit",
              }}>← Back</button>
              <button onClick={() => setStep(3)} style={{
                flex: 2, background: "var(--color-forest)", color: "var(--color-cream)",
                border: "none", borderRadius: "4px", padding: "14px",
                fontSize: "13px", fontWeight: "600", cursor: "pointer",
                fontFamily: "inherit", letterSpacing: "0.04em", textTransform: "uppercase",
              }}>Review Order →</button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div>
            <h2 style={{
              fontFamily: "var(--font-playfair, serif)",
              fontSize: "22px", fontWeight: "600", color: "var(--color-forest)", marginBottom: "24px",
            }}>Review Your Order</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "28px" }}>
              {/* Address summary */}
              <div style={{ background: "white", border: "1px solid var(--color-sand)", borderRadius: "6px", padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <p style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>Delivery To</p>
                  <button onClick={() => setStep(1)} style={{ background: "none", border: "none", fontSize: "12px", color: "var(--color-forest)", cursor: "pointer", fontFamily: "inherit", textDecoration: "underline" }}>Change</button>
                </div>
                {selectedAddr && (
                  <p style={{ fontSize: "14px", color: "var(--color-charcoal)" }}>
                    {selectedAddr.street}, {selectedAddr.city}, {selectedAddr.state} {selectedAddr.zip_code}, {selectedAddr.country}
                  </p>
                )}
              </div>

              {/* Payment summary */}
              <div style={{ background: "white", border: "1px solid var(--color-sand)", borderRadius: "6px", padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <p style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>Payment</p>
                  <button onClick={() => setStep(2)} style={{ background: "none", border: "none", fontSize: "12px", color: "var(--color-forest)", cursor: "pointer", fontFamily: "inherit", textDecoration: "underline" }}>Change</button>
                </div>
                <p style={{ fontSize: "14px", color: "var(--color-charcoal)" }}>
                  {paymentMethod === "COD" ? "Cash on Delivery" : "Credit / Debit Card"}
                </p>
              </div>
            </div>

            <div style={{
              background: "var(--color-forest)",
              borderRadius: "6px",
              padding: "20px 24px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}>
              <span style={{ fontSize: "16px" }}>🔒</span>
              <p style={{ fontSize: "13px", color: "var(--color-sage-light)" }}>
                Your order information is secure and encrypted
              </p>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => setStep(2)} style={{
                flex: 1, background: "var(--color-cream-dark)", color: "var(--color-charcoal)",
                border: "none", borderRadius: "4px", padding: "14px",
                fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit",
              }}>← Back</button>
              <button onClick={handlePlaceOrder} disabled={loading} style={{
                flex: 2, background: loading ? "var(--color-sage)" : "var(--color-terracotta)",
                color: "white", border: "none", borderRadius: "4px", padding: "16px",
                fontSize: "13px", fontWeight: "700",
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit", letterSpacing: "0.04em", textTransform: "uppercase",
                transition: "background 0.2s",
              }}>
                {loading ? "Placing Order…" : "Place Order"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AddressInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label style={{
        display: "block", fontSize: "11px", fontWeight: "600",
        letterSpacing: "0.08em", textTransform: "uppercase",
        color: "var(--color-text-muted)", marginBottom: "6px",
      }}>{label}</label>
      <input
        type="text" value={value} onChange={(e) => onChange(e.target.value)} required
        style={{
          width: "100%", background: "var(--color-cream)",
          border: "1px solid var(--color-sand)", borderRadius: "4px",
          padding: "10px 12px", fontSize: "14px",
          color: "var(--color-charcoal)", fontFamily: "inherit", outline: "none",
        }}
        onFocus={e => (e.target as HTMLInputElement).style.borderColor = "var(--color-forest)"}
        onBlur={e => (e.target as HTMLInputElement).style.borderColor = "var(--color-sand)"}
      />
    </div>
  );
}
