"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient, Plant, Review } from "@/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import { useCart } from "@/app/context/CartContext";
import { toast } from "sonner";
import { formatPKR } from "@/lib/currency";
import { ImageCarousel } from "@/components/ImageCarousel";
import { parsePlantImages } from "@/lib/paths";
import { FormSelect } from "@/components/ui/FormSelect";

export default function PlantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { addToCart } = useCart();
  
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ title: "", comment: "", rating: 5, plant_health_rating: 5, order_id: 0 });
  const [userOrders, setUserOrders] = useState<{ id: number; order_number?: string; status: string }[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && params?.slug) {
      const plantSlug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
      if (plantSlug) {
        loadPlant(plantSlug);
      }
    }
  }, [mounted, params?.slug]);

  const loadPlant = async (plantSlug: string) => {
    try {
      setLoading(true);
      const data = await apiClient.getPlant(plantSlug);
      setPlant(data);
      setError("");
      const plantReviews = await apiClient.getPlantReviews(data.id).catch(() => []);
      setReviews(plantReviews);
    } catch (err) {
      console.error("Error loading plant:", err);
      setError(err instanceof Error ? err.message : "Failed to load plant");
      setPlant(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      apiClient.getOrders().then((orders) => {
        setUserOrders(orders.filter((o) => o.status === "delivered").map((o) => ({ id: o.id, order_number: o.order_number, status: o.status })));
      }).catch(() => {});
    }
  }, [isLoggedIn]);

  const handleAddToCart = async () => {
    if (!plant || !isLoggedIn) {
      toast.error("Please sign in first");
      router.push("/login");
      return;
    }
    
    setIsAdding(true);
    const loadingToast = toast.loading("Adding to cart…");
    
    try {
      await addToCart(plant.id, quantity);
      toast.dismiss(loadingToast);
      toast.success("Added to cart!");
      setQuantity(1);
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err instanceof Error ? err.message : "Failed to add to cart");
    } finally {
      setIsAdding(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plant || !reviewForm.order_id) {
      toast.error("Please select a delivered order");
      return;
    }
    try {
      await apiClient.createReview({
        plant_id: plant.id,
        order_id: reviewForm.order_id,
        rating: reviewForm.rating,
        title: reviewForm.title,
        comment: reviewForm.comment,
        plant_health_rating: reviewForm.plant_health_rating,
      });
      toast.success("Review submitted! It will appear after admin approval.");
      setShowReviewForm(false);
      setReviewForm({ title: "", comment: "", rating: 5, plant_health_rating: 5, order_id: 0 });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit review");
    }
  };

  if (!mounted) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-cream)",
      }}>
        <p style={{ fontSize: "18px", color: "var(--color-text-muted)" }}>Initializing…</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-cream)",
      }}>
        <p style={{ fontSize: "18px", color: "var(--color-text-muted)" }}>Loading plant details…</p>
      </div>
    );
  }

  if (error || !plant) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-cream)",
      }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "18px", color: "var(--color-forest)", marginBottom: "24px" }}>
            {error || "Plant not found"}
          </p>
          <button
            onClick={() => router.push("/shop")}
            style={{
              background: "var(--color-forest)",
              color: "white",
              border: "none",
              padding: "12px 32px",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.background = "var(--color-forest-light)"}
            onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.background = "var(--color-forest)"}
          >
            ← Back to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--color-cream)", minHeight: "100vh", paddingBottom: "80px" }}>
      {/* Back Button */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 40px 0" }}>
        <button
          onClick={() => router.push("/shop")}
          style={{
            background: "none",
            border: "none",
            color: "var(--color-forest)",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            marginBottom: "32px",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.color = "var(--color-forest-muted)"}
          onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.color = "var(--color-forest)"}
        >
          ← Back to Collection
        </button>
      </div>

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "start" }}>
          {/* ── Image Section ── */}
          <div style={{ position: "relative" }}>
            <ImageCarousel images={parsePlantImages(plant)} alt={plant.name} />
            {plant.stock === 0 && (
              <div style={{
                position: "absolute",
                inset: 0,
                background: "rgba(255, 255, 255, 0.85)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(4px)",
                borderRadius: "12px",
              }}>
                <p style={{ fontSize: "24px", fontWeight: "700", color: "var(--color-terracotta)" }}>Out of Stock</p>
              </div>
            )}
          </div>

          {/* ── Info Section ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Header */}
            <div>
              <span style={{
                fontSize: "11px",
                fontWeight: "600",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--color-terracotta)",
                display: "inline-block",
                marginBottom: "8px",
              }}>
                {plant.category}
              </span>
              <h1 style={{
                fontFamily: "var(--font-serif)",
                fontSize: "44px",
                fontWeight: "700",
                color: "var(--color-forest)",
                marginBottom: "4px",
                lineHeight: 1.1,
              }}>
                {plant.name}
              </h1>
              <p style={{
                fontSize: "16px",
                fontStyle: "italic",
                color: "var(--color-sage)",
                marginBottom: "16px",
              }}>
                {plant.botanical_name}
              </p>
              <p style={{
                fontSize: "14px",
                lineHeight: 1.6,
                color: "var(--color-charcoal-light)",
              }}>
                {plant.description}
              </p>
            </div>

            {/* Quick Stats */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}>
              <div style={{
                background: "var(--color-sage-pale)",
                padding: "16px",
                borderRadius: "8px",
                borderLeft: "4px solid var(--color-sage)",
              }}>
                <p style={{ fontSize: "11px", fontWeight: "600", color: "var(--color-text-muted)", marginBottom: "4px", textTransform: "uppercase" }}>Size</p>
                <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--color-forest)" }}>{plant.size || "Medium"}</p>
              </div>
              <div style={{
                background: "var(--color-terracotta-pale)",
                padding: "16px",
                borderRadius: "8px",
                borderLeft: "4px solid var(--color-terracotta)",
              }}>
                <p style={{ fontSize: "11px", fontWeight: "600", color: "var(--color-text-muted)", marginBottom: "4px", textTransform: "uppercase" }}>Growth</p>
                <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--color-forest)" }}>{plant.growth_rate || "Moderate"}</p>
              </div>
            </div>

            {/* Care Requirements */}
            <div style={{
              background: "white",
              border: "1px solid var(--color-sand)",
              borderRadius: "12px",
              padding: "24px",
            }}>
              <h2 style={{
                fontSize: "14px",
                fontWeight: "700",
                color: "var(--color-forest)",
                marginBottom: "16px",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}>
                🌱 Care Requirements
              </h2>
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}>
                <div>
                  <p style={{ fontSize: "11px", color: "var(--color-text-muted)", marginBottom: "4px", fontWeight: "600" }}>☀️ SUNLIGHT</p>
                  <p style={{ fontSize: "13px", color: "var(--color-charcoal)", textTransform: "capitalize" }}>{plant.sunlight_requirement}</p>
                </div>
                <div>
                  <p style={{ fontSize: "11px", color: "var(--color-text-muted)", marginBottom: "4px", fontWeight: "600" }}>💧 WATER</p>
                  <p style={{ fontSize: "13px", color: "var(--color-charcoal)", textTransform: "capitalize" }}>{plant.watering_frequency}</p>
                </div>
                <div>
                  <p style={{ fontSize: "11px", color: "var(--color-text-muted)", marginBottom: "4px", fontWeight: "600" }}>🌱 SOIL</p>
                  <p style={{ fontSize: "13px", color: "var(--color-charcoal)" }}>{plant.soil_type}</p>
                </div>
                <div>
                  <p style={{ fontSize: "11px", color: "var(--color-text-muted)", marginBottom: "4px", fontWeight: "600" }}>💨 HUMIDITY</p>
                  <p style={{ fontSize: "13px", color: "var(--color-charcoal)", textTransform: "capitalize" }}>{plant.humidity_level}</p>
                </div>
              </div>
            </div>

            {/* Attributes */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "12px",
            }}>
              <div style={{
                background: plant.is_pet_friendly ? "var(--color-sage-pale)" : "var(--color-cream-dark)",
                border: plant.is_pet_friendly ? "1px solid var(--color-sage-light)" : "1px solid var(--color-sand)",
                borderRadius: "8px",
                padding: "12px",
                textAlign: "center",
              }}>
                <p style={{ fontSize: "20px", marginBottom: "4px" }}>🐾</p>
                <p style={{ fontSize: "11px", fontWeight: "600", color: "var(--color-text-muted)" }}>PET SAFE</p>
                <p style={{ fontSize: "13px", fontWeight: "600", color: plant.is_pet_friendly ? "var(--color-forest)" : "var(--color-text-muted)" }}>
                  {plant.is_pet_friendly ? "Yes" : "No"}
                </p>
              </div>
              <div style={{
                background: plant.is_low_maintenance ? "var(--color-sage-pale)" : "var(--color-cream-dark)",
                border: plant.is_low_maintenance ? "1px solid var(--color-sage-light)" : "1px solid var(--color-sand)",
                borderRadius: "8px",
                padding: "12px",
                textAlign: "center",
              }}>
                <p style={{ fontSize: "20px", marginBottom: "4px" }}>⚡</p>
                <p style={{ fontSize: "11px", fontWeight: "600", color: "var(--color-text-muted)" }}>LOW MAINT.</p>
                <p style={{ fontSize: "13px", fontWeight: "600", color: plant.is_low_maintenance ? "var(--color-forest)" : "var(--color-text-muted)" }}>
                  {plant.is_low_maintenance ? "Yes" : "No"}
                </p>
              </div>
              <div style={{
                background: "var(--color-terracotta-pale)",
                border: "1px solid var(--color-terracotta-light)",
                borderRadius: "8px",
                padding: "12px",
                textAlign: "center",
              }}>
                <p style={{ fontSize: "20px", marginBottom: "4px" }}>🌡️</p>
                <p style={{ fontSize: "11px", fontWeight: "600", color: "var(--color-text-muted)" }}>TEMP</p>
                <p style={{ fontSize: "13px", fontWeight: "600", color: "var(--color-forest)" }}>
                  {plant.temperature_min}°–{plant.temperature_max}°C
                </p>
              </div>
            </div>

            {/* Stock & Price */}
            <div style={{
              background: "white",
              border: "2px solid var(--color-forest)",
              borderRadius: "12px",
              padding: "24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <div>
                <p style={{ fontSize: "12px", fontWeight: "600", color: "var(--color-text-muted)", marginBottom: "4px", textTransform: "uppercase" }}>Price</p>
                <p style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "32px",
                  fontWeight: "700",
                  color: "var(--color-terracotta)",
                }}>
                  {formatPKR(plant.price)}
                </p>
              </div>
              <div style={{
                textAlign: "right",
              }}>
                <p style={{ fontSize: "12px", fontWeight: "600", color: "var(--color-text-muted)", marginBottom: "4px", textTransform: "uppercase" }}>Available</p>
                <p style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  color: plant.stock > 0 ? "var(--color-forest)" : "var(--color-terracotta)",
                }}>
                  {plant.stock > 0 ? `${plant.stock} in stock` : "Sold Out"}
                </p>
              </div>
            </div>

            {/* Add to Cart Section */}
            {plant.stock > 0 && (
              <div style={{
                display: "flex",
                gap: "12px",
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid var(--color-sand)",
                  borderRadius: "8px",
                  overflow: "hidden",
                  background: "white",
                }}>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{
                      width: "44px",
                      height: "44px",
                      background: "transparent",
                      border: "none",
                      color: "var(--color-text-muted)",
                      fontSize: "18px",
                      cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.background = "var(--color-cream-dark)"}
                    onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.background = "transparent"}
                  >
                    −
                  </button>
                  <div style={{
                    width: "44px",
                    textAlign: "center",
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "var(--color-forest)",
                    borderLeft: "1px solid var(--color-sand)",
                    borderRight: "1px solid var(--color-sand)",
                  }}>
                    {quantity}
                  </div>
                  <button
                    onClick={() => setQuantity(Math.min(plant.stock, quantity + 1))}
                    style={{
                      width: "44px",
                      height: "44px",
                      background: "transparent",
                      border: "none",
                      color: "var(--color-text-muted)",
                      fontSize: "18px",
                      cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.background = "var(--color-cream-dark)"}
                    onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.background = "transparent"}
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  style={{
                    flex: 1,
                    background: isAdding ? "var(--color-sage)" : "var(--color-forest)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "700",
                    padding: "12px 24px",
                    cursor: isAdding ? "not-allowed" : "pointer",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => !isAdding && ((e.currentTarget as HTMLButtonElement).style.background = "var(--color-forest-light)")}
                  onMouseLeave={(e) => !isAdding && ((e.currentTarget as HTMLButtonElement).style.background = "var(--color-forest)")}
                >
                  {isAdding ? "Adding…" : "🛒 Add to Cart"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div style={{ marginTop: "48px", paddingTop: "40px", borderTop: "1px solid var(--color-sand)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <h2 style={{ fontFamily: "var(--font-playfair, serif)", fontSize: "24px", fontWeight: "600", color: "var(--color-forest)" }}>
              Customer Reviews ({reviews.length})
            </h2>
            {isLoggedIn && userOrders.length > 0 && (
              <button onClick={() => setShowReviewForm(!showReviewForm)} style={{ background: "var(--color-forest)", color: "white", border: "none", borderRadius: "4px", padding: "10px 16px", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" }}>
                {showReviewForm ? "Cancel" : "Write a Review"}
              </button>
            )}
          </div>

          {showReviewForm && (
            <form onSubmit={handleSubmitReview} style={{ background: "white", border: "1px solid var(--color-sand)", borderRadius: "8px", padding: "24px", marginBottom: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <FormSelect
                value={reviewForm.order_id ? String(reviewForm.order_id) : ""}
                onValueChange={(v) => setReviewForm({ ...reviewForm, order_id: Number(v) })}
                placeholder="Select delivered order"
                options={userOrders.map((o) => ({
                  value: String(o.id),
                  label: o.order_number ? `Order ${o.order_number}` : `Order #${o.id}`,
                }))}
              />
              <input placeholder="Review title" value={reviewForm.title} onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })} required style={{ padding: "10px", border: "1px solid var(--color-sand)", borderRadius: "4px", fontFamily: "inherit" }} />
              <textarea placeholder="Your review" value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} required rows={3} style={{ padding: "10px", border: "1px solid var(--color-sand)", borderRadius: "4px", fontFamily: "inherit" }} />
              <div style={{ display: "flex", gap: "16px" }}>
                <label style={{ fontSize: "13px" }}>Rating: <input type="number" min={1} max={5} value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })} style={{ width: "50px", marginLeft: "8px" }} /></label>
                <label style={{ fontSize: "13px" }}>Plant Health: <input type="number" min={1} max={5} value={reviewForm.plant_health_rating} onChange={(e) => setReviewForm({ ...reviewForm, plant_health_rating: Number(e.target.value) })} style={{ width: "50px", marginLeft: "8px" }} /></label>
              </div>
              <button type="submit" style={{ background: "var(--color-forest)", color: "white", border: "none", borderRadius: "4px", padding: "12px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" }}>Submit Review</button>
            </form>
          )}

          {reviews.length === 0 ? (
            <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>No reviews yet. Be the first to review this plant!</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {reviews.map((review) => (
                <div key={review.id} style={{ background: "white", border: "1px solid var(--color-sand)", borderRadius: "8px", padding: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <p style={{ fontWeight: "600", color: "var(--color-forest)" }}>{review.title}</p>
                    <span style={{ fontSize: "13px" }}>{"⭐".repeat(Math.round(review.rating))}</span>
                  </div>
                  <p style={{ fontSize: "14px", color: "var(--color-charcoal)", lineHeight: 1.6 }}>{review.comment}</p>
                  <p style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "8px" }}>{new Date(review.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
