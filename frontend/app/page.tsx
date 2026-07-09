"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FiShoppingBag, FiTrendingUp, FiUsers, FiCheck, FiTruck, FiHeart, FiStar, FiArrowRight } from "react-icons/fi";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div style={{ background: "var(--color-cream)", minHeight: "100vh" }}>

  {/* ── Hero Section ── */}
<section style={{
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  minHeight: "92vh",
  overflow: "hidden",
}}>
  {/* Left: copy */}
  <div style={{
    padding: "clamp(40px, 8vw, 100px) clamp(20px, 5vw, 64px)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    background: "var(--color-cream)",
  }}>
    <p style={{
      fontFamily: "var(--font-plus-jakarta, sans-serif)",
      fontSize: "11px",
      fontWeight: "600",
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      color: "var(--color-terracotta)",
      marginBottom: "24px",
    }}>
      Botanical Marketplace · Est. 2024
    </p>
    <h1 style={{
      fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
      fontSize: "clamp(32px, 6vw, 72px)",
      fontWeight: "600",
      lineHeight: 1.1,
      color: "var(--color-forest)",
      marginBottom: "28px",
      letterSpacing: "-0.02em",
    }}>
      Bring the<br />
      <em style={{ fontStyle: "italic", color: "var(--color-forest-muted)" }}>living</em><br />
      world inside
    </h1>
    <p style={{
      fontSize: "clamp(14px, 2vw, 17px)",
      color: "var(--color-text-muted)",
      maxWidth: "420px",
      lineHeight: 1.7,
      marginBottom: "40px",
    }}>
      A curated collection of rare indoor plants, succulents, and florals — each one thoughtfully sourced and ready to transform your space.
    </p>
    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
      <Link href={isLoggedIn ? "/shop" : "/login"} style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        background: "var(--color-forest)",
        color: "var(--color-cream)",
        padding: "14px 32px",
        borderRadius: "4px",
        fontSize: "13px",
        fontWeight: "600",
        textDecoration: "none",
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        transition: "background 0.25s",
      }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--color-forest-muted)"}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "var(--color-forest)"}
      >
        <FiShoppingBag />
        Shop the Collection
      </Link>
      <Link href="/community" style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        background: "transparent",
        color: "var(--color-forest)",
        padding: "14px 32px",
        borderRadius: "4px",
        fontSize: "13px",
        fontWeight: "600",
        textDecoration: "none",
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        border: "1px solid var(--color-sand-dark)",
        transition: "all 0.2s",
      }}>
        <FiUsers />
        Community
      </Link>
    </div>
    {/* Stats row */}
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "32px",
      marginTop: "64px",
      paddingTop: "40px",
      borderTop: "1px solid var(--color-sand)",
    }}>
      {[
        { num: "2,400+", label: "Plants Delivered" },
        { num: "140+", label: "Species Available" },
        { num: "4.9★", label: "Customer Rating" },
      ].map((s) => (
        <div key={s.label}>
          <p style={{
            fontFamily: "var(--font-playfair, serif)",
            fontSize: "clamp(20px, 3vw, 28px)",
            fontWeight: "600",
            color: "var(--color-forest)",
            lineHeight: 1,
          }}>{s.num}</p>
          <p style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "4px" }}>{s.label}</p>
        </div>
      ))}
    </div>
  </div>

  {/* Right: botanical art */}
  <div style={{
    background: "var(--color-sage-pale)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    minHeight: "400px",
    padding: "40px",
  }}>
    {/* Decorative circles */}
    <div style={{
      position: "absolute",
      top: "-60px",
      right: "-60px",
      width: "280px",
      height: "280px",
      borderRadius: "50%",
      background: "var(--color-sand)",
      opacity: 0.5,
    }} />
    <div style={{
      position: "absolute",
      bottom: "-80px",
      left: "-80px",
      width: "320px",
      height: "320px",
      borderRadius: "50%",
      background: "var(--color-terracotta-pale)",
      opacity: 0.4,
    }} />
    
    <Image
      src="/icon.png"
      alt="FloraFetch Logo"
      width={460}
      height={160}
      style={{
        objectFit: "contain",
        position: "relative",
        zIndex: 1,
      }}
    />
   
    <p style={{
      fontSize: "16px",
      textAlign: "center",
      color: "var(--color-forest)",
      marginTop: "32px",
      fontWeight: "500",
      maxWidth: "280px",
      position: "relative",
      zIndex: 1,
    }}>
      Premium plants delivered to your doorstep
    </p>
  </div>
</section>
      {/* ── Features Section ── */}
      <section style={{ padding: "clamp(40px, 8vw, 80px) 20px", background: "white", borderBottom: "1px solid var(--color-sand)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <h2 style={{
            fontFamily: "var(--font-playfair, serif)",
            fontSize: "clamp(28px, 5vw, 42px)",
            fontWeight: "600",
            color: "var(--color-forest)",
            textAlign: "center",
            marginBottom: "12px",
          }}>Why Choose FloraFetch?</h2>
          <p style={{
            textAlign: "center",
            color: "var(--color-text-muted)",
            marginBottom: "40px",
            maxWidth: "600px",
            margin: "0 auto 40px",
          }}>We make it easy to find and care for the perfect plants for your home</p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))",
            gap: "24px",
          }}>
            {[
              { icon: FiCheck, title: "Carefully Curated", desc: "Each plant is hand-selected by experts" },
              { icon: FiTruck, title: "Fast Delivery", desc: "Your plants arrive healthy and fresh" },
              { icon: FiHeart, title: "Lifetime Support", desc: "Expert care tips and customer support" },
              { icon: FiTrendingUp, title: "Rare Species", desc: "Exclusive plants you won't find elsewhere" },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} style={{
                  background: "var(--color-cream)",
                  border: "1px solid var(--color-sand)",
                  borderRadius: "8px",
                  padding: "24px",
                  textAlign: "center",
                }}>
                  <div style={{
                    fontSize: "36px",
                    marginBottom: "16px",
                    color: "var(--color-forest)",
                  }}>
                    <Icon size={36} style={{ margin: "0 auto" }} />
                  </div>
                  <h3 style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "var(--color-forest)",
                    marginBottom: "8px",
                  }}>{f.title}</h3>
                  <p style={{
                    fontSize: "14px",
                    color: "var(--color-text-muted)",
                    margin: 0,
                  }}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA Section 1 ── */}
      <section style={{ padding: "clamp(40px, 8vw, 80px) 20px", background: "var(--color-sage-pale)" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{
            fontFamily: "var(--font-playfair, serif)",
            fontSize: "clamp(28px, 5vw, 42px)",
            fontWeight: "600",
            color: "var(--color-forest)",
            marginBottom: "16px",
          }}>Discover Our Collection</h2>
          <p style={{
            fontSize: "16px",
            color: "var(--color-text-muted)",
            marginBottom: "32px",
            maxWidth: "600px",
            margin: "0 auto 32px",
          }}>Browse through 140+ species of plants, from rare jungle specimens to easy-care succulents. Find your perfect green companion today.</p>
          <Link href="/shop" style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "var(--color-forest)",
            color: "white",
            padding: "14px 32px",
            borderRadius: "4px",
            fontSize: "14px",
            fontWeight: "600",
            textDecoration: "none",
            transition: "all 0.2s",
          }}>
            Explore Plants <FiArrowRight />
          </Link>
        </div>
      </section>

      {/* ── Testimonials Section ── */}
      <section style={{ padding: "clamp(40px, 8vw, 80px) 20px", background: "white", borderBottom: "1px solid var(--color-sand)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <h2 style={{
            fontFamily: "var(--font-playfair, serif)",
            fontSize: "clamp(28px, 5vw, 42px)",
            fontWeight: "600",
            color: "var(--color-forest)",
            textAlign: "center",
            marginBottom: "40px",
          }}>What Our Customers Love</h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))",
            gap: "24px",
          }}>
            {[
              { name: "Sarah M.", role: "Plant Enthusiast", text: "Amazing quality plants and delivery was incredibly fast. My monstera arrived in perfect condition!" },
              { name: "Rajesh K.", role: "Office Manager", text: "Transformed our office space. The plants are healthy and the care guide was super helpful." },
              { name: "Priya D.", role: "Interior Designer", text: "I recommend FloraFetch to all my clients. The selection and service are unmatched." },
            ].map((t, i) => (
              <div key={i} style={{
                background: "var(--color-cream)",
                border: "1px solid var(--color-sand)",
                borderRadius: "8px",
                padding: "24px",
              }}>
                <div style={{ display: "flex", gap: "4px", marginBottom: "12px" }}>
                  {[...Array(5)].map((_, j) => (
                    <FiStar key={j} size={16} style={{ fill: "var(--color-terracotta)", color: "var(--color-terracotta)" }} />
                  ))}
                </div>
                <p style={{
                  fontSize: "14px",
                  color: "var(--color-charcoal)",
                  marginBottom: "16px",
                  fontStyle: "italic",
                  lineHeight: 1.6,
                }}>"{t.text}"</p>
                <p style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "var(--color-forest)",
                  margin: "0 0 2px 0",
                }}>{t.name}</p>
                <p style={{
                  fontSize: "12px",
                  color: "var(--color-text-muted)",
                  margin: 0,
                }}>{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section 2 ── */}
      <section style={{ padding: "clamp(40px, 8vw, 80px) 20px", background: "var(--color-forest)", color: "white" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{
            fontFamily: "var(--font-playfair, serif)",
            fontSize: "clamp(28px, 5vw, 42px)",
            fontWeight: "600",
            marginBottom: "16px",
          }}>Ready to Go Green?</h2>
          <p style={{
            fontSize: "16px",
            color: "rgba(255,255,255,0.9)",
            marginBottom: "32px",
            maxWidth: "600px",
            margin: "0 auto 32px",
          }}>Join thousands of happy plant parents. Start your botanical journey with FloraFetch today.</p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href={isLoggedIn ? "/shop" : "/register"} style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "white",
              color: "var(--color-forest)",
              padding: "14px 32px",
              borderRadius: "4px",
              fontSize: "14px",
              fontWeight: "600",
              textDecoration: "none",
              transition: "opacity 0.2s",
            }}>
              Get Started <FiArrowRight />
            </Link>
            <Link href="/contact" style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "transparent",
              color: "white",
              padding: "14px 32px",
              borderRadius: "4px",
              fontSize: "14px",
              fontWeight: "600",
              textDecoration: "none",
              border: "1px solid white",
              transition: "all 0.2s",
            }}>
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
