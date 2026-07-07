"use client";

import { useState } from "react";

const REVIEWS = [
  {
    id: 1,
    name: "Ayesha R.",
    location: "Karachi, PK",
    avatar: "A",
    plant: "Monstera Deliciosa",
    rating: 5,
    review: "The packaging was incredible — each leaf individually wrapped with breathable paper. My monstera arrived in perfect condition and has already sprouted a new leaf! FloraFetch clearly cares deeply about plant health in transit.",
    date: "June 2024",
    helpful: 24,
    image: null,
  },
  {
    id: 2,
    name: "Priya M.",
    location: "Lahore, PK",
    avatar: "P",
    plant: "Peace Lily",
    rating: 5,
    review: "I was nervous ordering plants online but FloraFetch completely exceeded my expectations. The plant arrived healthy, the care guide was incredibly detailed, and customer service responded within hours when I had questions.",
    date: "May 2024",
    helpful: 18,
    image: null,
  },
  {
    id: 3,
    name: "Zara K.",
    location: "Islamabad, PK",
    avatar: "Z",
    plant: "Snake Plant",
    rating: 4,
    review: "Great quality snake plant, very sturdy and exactly as described. The soil was slightly dry on arrival but it bounced back after watering. Three months later it is thriving in my office — definitely ordering again.",
    date: "April 2024",
    helpful: 12,
    image: null,
  },
  {
    id: 4,
    name: "Omar F.",
    location: "Karachi, PK",
    avatar: "O",
    plant: "ZZ Plant",
    rating: 5,
    review: "Perfect for beginners! I've killed every plant I've ever owned but the ZZ plant from FloraFetch is impossible to kill. The AI Botanist chatbot helped me understand the right light and watering schedule.",
    date: "June 2024",
    helpful: 31,
    image: null,
  },
  {
    id: 5,
    name: "Sara T.",
    location: "Faisalabad, PK",
    avatar: "S",
    plant: "Pothos",
    rating: 5,
    review: "Ordered 3 pothos varieties and they all came in gorgeous condition. The roots were healthy and white. Love how FloraFetch includes the botanical name, care level, and light requirements on each plant tag.",
    date: "May 2024",
    helpful: 9,
    image: null,
  },
  {
    id: 6,
    name: "Ali H.",
    location: "Multan, PK",
    avatar: "A",
    plant: "Fiddle Leaf Fig",
    rating: 4,
    review: "The fiddle leaf fig arrived a bit stressed from transit but after a week of proper care (following the guide FloraFetch included) it is looking gorgeous. High maintenance plant but FloraFetch's support made it manageable.",
    date: "March 2024",
    helpful: 16,
    image: null,
  },
];

const TIPS = [
  {
    title: "The Bottom Watering Technique",
    author: "Expert Botanist · Dr. Nadia Shah",
    content: "For most tropical houseplants, bottom watering encourages deep root growth. Place your pot in a saucer of water for 20-30 minutes, allowing soil to absorb moisture from below. This prevents overwatering and promotes healthier roots.",
    category: "Watering",
    emoji: "💧",
  },
  {
    title: "Understanding Light Requirements",
    author: "Expert Botanist · Ibrahim K.",
    content: "Most 'low light' plants don't mean 'no light.' They need indirect bright light for at least 4-6 hours. North-facing windows are ideal for shade-lovers. Rotate your plants quarterly for even growth.",
    category: "Light",
    emoji: "☀️",
  },
  {
    title: "Signs of Root-Bound Plants",
    author: "Community Member · Fatima A.",
    content: "If roots are circling the bottom of the pot or emerging from drainage holes, it's time to repot! Spring is the best time. Choose a pot only 1-2 inches larger — too much space holds excess moisture.",
    category: "Repotting",
    emoji: "🪴",
  },
];

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<"reviews" | "tips">("reviews");
  const [filter, setFilter] = useState<number | null>(null);

  const filteredReviews = filter ? REVIEWS.filter((r) => r.rating === filter) : REVIEWS;
  const avgRating = REVIEWS.reduce((acc, r) => acc + r.rating, 0) / REVIEWS.length;

  return (
    <div style={{ background: "var(--color-cream)", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid var(--color-sand)", padding: "60px 40px 48px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <p style={{
            fontSize: "11px", fontWeight: "600", letterSpacing: "0.18em",
            textTransform: "uppercase", color: "var(--color-terracotta)", marginBottom: "12px",
          }}>Plant Lovers Community</p>
          <h1 style={{
            fontFamily: "var(--font-playfair, serif)",
            fontSize: "clamp(36px, 4vw, 60px)",
            fontWeight: "600",
            color: "var(--color-forest)",
            lineHeight: 1.1,
            marginBottom: "24px",
          }}>
            Stories, reviews &<br />
            <em style={{ color: "var(--color-forest-muted)" }}>expert plant wisdom</em>
          </h1>

          {/* Rating summary */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "32px",
            flexWrap: "wrap",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{
                fontFamily: "var(--font-playfair, serif)",
                fontSize: "48px", fontWeight: "600", color: "var(--color-forest)",
              }}>{avgRating.toFixed(1)}</span>
              <div>
                <div style={{ display: "flex", marginBottom: "4px" }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} style={{
                      fontSize: "18px",
                      color: i < Math.round(avgRating) ? "var(--color-terracotta)" : "var(--color-sand)",
                    }}>★</span>
                  ))}
                </div>
                <p style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>
                  {REVIEWS.length} verified reviews
                </p>
              </div>
            </div>
            {/* Rating breakdown */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = REVIEWS.filter((r) => r.rating === star).length;
                const pct = (count / REVIEWS.length) * 100;
                return (
                  <div key={star} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "11px", color: "var(--color-text-muted)", width: "16px" }}>{star}</span>
                    <div style={{
                      width: "120px", height: "6px",
                      background: "var(--color-sand)", borderRadius: "3px", overflow: "hidden",
                    }}>
                      <div style={{
                        width: `${pct}%`, height: "100%",
                        background: "var(--color-terracotta)", borderRadius: "3px",
                      }} />
                    </div>
                    <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: "1px solid var(--color-sand)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 40px", display: "flex", gap: "0" }}>
          {(["reviews", "tips"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{
                padding: "18px 28px",
                border: "none",
                background: "transparent",
                fontSize: "13px",
                fontWeight: "600",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                cursor: "pointer",
                color: activeTab === tab ? "var(--color-forest)" : "var(--color-text-muted)",
                borderBottom: `2px solid ${activeTab === tab ? "var(--color-forest)" : "transparent"}`,
                fontFamily: "inherit",
                transition: "color 0.2s",
              }}>
              {tab === "reviews" ? `Customer Reviews (${REVIEWS.length})` : "Expert Plant Tips"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "48px 40px" }}>
        {activeTab === "reviews" && (
          <>
            {/* Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "36px" }}>
              <span style={{ fontSize: "13px", color: "var(--color-text-muted)", fontWeight: "500" }}>Filter:</span>
              <button onClick={() => setFilter(null)}
                style={{
                  padding: "6px 14px", borderRadius: "100px",
                  border: !filter ? "none" : "1px solid var(--color-sand)",
                  background: !filter ? "var(--color-forest)" : "white",
                  color: !filter ? "white" : "var(--color-charcoal-light)",
                  fontSize: "12px", cursor: "pointer", fontFamily: "inherit",
                }}>All</button>
              {[5, 4, 3].map((star) => (
                <button key={star} onClick={() => setFilter(star)}
                  style={{
                    padding: "6px 14px", borderRadius: "100px",
                    border: filter === star ? "none" : "1px solid var(--color-sand)",
                    background: filter === star ? "var(--color-forest)" : "white",
                    color: filter === star ? "white" : "var(--color-charcoal-light)",
                    fontSize: "12px", cursor: "pointer", fontFamily: "inherit",
                  }}>
                  {"★".repeat(star)}
                </button>
              ))}
            </div>

            {/* Reviews Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: "24px",
            }}>
              {filteredReviews.map((review) => (
                <div key={review.id} style={{
                  background: "white",
                  border: "1px solid var(--color-sand)",
                  padding: "28px",
                  borderRadius: "6px",
                  display: "flex",
                  flexDirection: "column",
                }}>
                  {/* Reviewer */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                    <div style={{
                      width: "40px", height: "40px", borderRadius: "50%",
                      background: "var(--color-forest)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "16px", fontWeight: "700", color: "var(--color-cream)",
                    }}>{review.avatar}</div>
                    <div>
                      <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--color-forest)" }}>{review.name}</p>
                      <p style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>{review.location}</p>
                    </div>
                    <div style={{ marginLeft: "auto", display: "flex" }}>
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <span key={i} style={{ fontSize: "14px", color: "var(--color-terracotta)" }}>★</span>
                      ))}
                    </div>
                  </div>

                  {/* Plant */}
                  <span style={{
                    display: "inline-block",
                    background: "var(--color-sage-pale)",
                    color: "var(--color-forest)",
                    fontSize: "11px",
                    fontWeight: "600",
                    padding: "3px 10px",
                    borderRadius: "2px",
                    marginBottom: "12px",
                    letterSpacing: "0.05em",
                    width: "fit-content",
                  }}>
                    {review.plant}
                  </span>

                  {/* Text */}
                  <p style={{
                    fontSize: "14px",
                    color: "var(--color-charcoal-light)",
                    lineHeight: 1.65,
                    flex: 1,
                    fontStyle: "italic",
                  }}>
                    "{review.review}"
                  </p>

                  {/* Footer */}
                  <div style={{
                    borderTop: "1px solid var(--color-sand)",
                    paddingTop: "14px",
                    marginTop: "16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}>
                    <p style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>{review.date}</p>
                    <button style={{
                      background: "transparent", border: "none",
                      fontSize: "12px", color: "var(--color-text-muted)", cursor: "pointer",
                      fontFamily: "inherit",
                    }}>
                      👍 Helpful ({review.helpful})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === "tips" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {TIPS.map((tip, i) => (
              <div key={i} style={{
                background: "white",
                border: "1px solid var(--color-sand)",
                padding: "36px 40px",
                display: "grid",
                gridTemplateColumns: "60px 1fr",
                gap: "24px",
                alignItems: "start",
              }}>
                <div style={{
                  width: "60px", height: "60px",
                  background: "var(--color-sage-pale)",
                  borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "28px", flexShrink: 0,
                }}>{tip.emoji}</div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                    <h3 style={{
                      fontFamily: "var(--font-playfair, serif)",
                      fontSize: "20px", fontWeight: "600", color: "var(--color-forest)",
                    }}>{tip.title}</h3>
                    <span style={{
                      background: "var(--color-terracotta-pale)",
                      color: "var(--color-terracotta)",
                      fontSize: "10px", fontWeight: "600",
                      padding: "3px 10px", borderRadius: "2px",
                      letterSpacing: "0.05em",
                    }}>{tip.category}</span>
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--color-terracotta)", marginBottom: "12px", fontWeight: "500" }}>
                    {tip.author}
                  </p>
                  <p style={{ fontSize: "15px", color: "var(--color-charcoal-light)", lineHeight: 1.7 }}>
                    {tip.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
