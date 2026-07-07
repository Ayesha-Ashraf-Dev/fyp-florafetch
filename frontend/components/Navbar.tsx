"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useCart } from "@/app/context/CartContext";
import { useState } from "react";
import Image from "next/image";

export default function Navbar() {
  const { isLoggedIn, user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    router.push("/");
  };

  return (
    <nav className="no-print" style={{
      background: "var(--color-forest)",
      borderBottom: "1px solid var(--color-forest-light)",
      position: "sticky",
      top: 0,
      zIndex: 50,
      boxShadow: "0 2px 20px rgba(0,0,0,0.3)",
    }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: "72px" }}>

          {/* Logo */}
          <Link href="/" style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            textDecoration: "none",
            transition: "transform 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = "scale(1.02)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = "scale(1)"}
          >
            <div style={{
              position: "relative",
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              overflow: "hidden",
              background: "var(--color-cream)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}>
              <Image
                src="/icon.png"
                alt="FloraFetch Logo"
                width={44}
                height={44}
                style={{
                  objectFit: "contain",
                }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
              <span style={{
                fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                fontSize: "24px",
                fontWeight: "700",
                color: "var(--color-cream)",
                letterSpacing: "-0.02em",
                background: "linear-gradient(135deg, var(--color-cream) 60%, var(--color-sage-light) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>FloraFetch</span>
              <span style={{
                fontSize: "9px",
                fontWeight: "400",
                color: "var(--color-sage-light)",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                WebkitTextFillColor: "var(--color-sage-light)",
              }}>Botanical Emporium</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "28px"
          }}
            className="desktop-nav">
            <NavLink href="/shop">Shop</NavLink>
            <NavLink href="/community">Community</NavLink>
            {/* <NavLink href="/chatbot">AI Botanist</NavLink> */}
            <NavLink href="/contact">Contact</NavLink>

            {isLoggedIn ? (
              <>
                <div style={{ position: "relative" }}>
                  <NavLink href="/cart">
                    Cart
                    {itemCount > 0 && (
                      <span style={{
                        position: "absolute",
                        top: "-8px",
                        right: "-14px",
                        background: "var(--color-terracotta)",
                        color: "white",
                        fontSize: "10px",
                        fontWeight: "700",
                        borderRadius: "50%",
                        width: "20px",
                        height: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 2px 8px rgba(200, 97, 66, 0.4)",
                      }}>
                        {itemCount}
                      </span>
                    )}
                  </NavLink>
                </div>
                <NavLink href="/orders">Orders</NavLink>
                <NavLink href="/profile">Profile</NavLink>
                {isAdmin && (
                  <Link href="/admin" style={{
                    background: "var(--color-terracotta)",
                    color: "white",
                    padding: "6px 16px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "600",
                    textDecoration: "none",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    transition: "all 0.2s",
                    boxShadow: "0 2px 10px rgba(200, 97, 66, 0.3)",
                  }}
                  onMouseEnter={e => {
                    (e.target as HTMLElement).style.transform = "translateY(-1px)";
                    (e.target as HTMLElement).style.boxShadow = "0 4px 15px rgba(200, 97, 66, 0.4)";
                  }}
                  onMouseLeave={e => {
                    (e.target as HTMLElement).style.transform = "translateY(0)";
                    (e.target as HTMLElement).style.boxShadow = "0 2px 10px rgba(200, 97, 66, 0.3)";
                  }}
                  >
                    Admin
                  </Link>
                )}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  paddingLeft: "24px",
                  borderLeft: "1px solid var(--color-forest-muted)",
                }}>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ 
                      fontSize: "13px", 
                      fontWeight: "600", 
                      color: "var(--color-cream)", 
                      lineHeight: 1.2,
                      margin: 0,
                    }}>
                      {user?.full_name || "User"}
                    </p>
                    <p style={{ 
                      fontSize: "11px", 
                      color: "var(--color-sage-light)",
                      margin: 0,
                      opacity: 0.8,
                    }}>{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    style={{
                      background: "transparent",
                      border: "1px solid var(--color-forest-muted)",
                      color: "var(--color-sage-light)",
                      padding: "6px 16px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "500",
                      cursor: "pointer",
                      transition: "all 0.3s",
                      fontFamily: "inherit",
                    }}
                    onMouseEnter={e => {
                      (e.target as HTMLButtonElement).style.borderColor = "var(--color-terracotta)";
                      (e.target as HTMLButtonElement).style.color = "var(--color-terracotta)";
                      (e.target as HTMLButtonElement).style.background = "rgba(200, 97, 66, 0.1)";
                    }}
                    onMouseLeave={e => {
                      (e.target as HTMLButtonElement).style.borderColor = "var(--color-forest-muted)";
                      (e.target as HTMLButtonElement).style.color = "var(--color-sage-light)";
                      (e.target as HTMLButtonElement).style.background = "transparent";
                    }}
                  >
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" style={{
                  color: "var(--color-sage-light)",
                  fontSize: "13px",
                  fontWeight: "500",
                  textDecoration: "none",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  transition: "all 0.3s",
                  padding: "6px 12px",
                  borderRadius: "20px",
                }}
                  onMouseEnter={e => {
                    (e.target as HTMLElement).style.color = "var(--color-cream)";
                    (e.target as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                  }}
                  onMouseLeave={e => {
                    (e.target as HTMLElement).style.color = "var(--color-sage-light)";
                    (e.target as HTMLElement).style.background = "transparent";
                  }}
                >
                  Sign In
                </Link>
                <Link href="/register" style={{
                  background: "linear-gradient(135deg, var(--color-sage-pale), var(--color-sage-light))",
                  color: "var(--color-forest)",
                  padding: "8px 24px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: "600",
                  textDecoration: "none",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  transition: "all 0.3s",
                  boxShadow: "0 2px 10px rgba(181, 196, 143, 0.3)",
                }}
                onMouseEnter={e => {
                  (e.target as HTMLElement).style.transform = "translateY(-2px)";
                  (e.target as HTMLElement).style.boxShadow = "0 4px 20px rgba(181, 196, 143, 0.4)";
                }}
                onMouseLeave={e => {
                  (e.target as HTMLElement).style.transform = "translateY(0)";
                  (e.target as HTMLElement).style.boxShadow = "0 2px 10px rgba(181, 196, 143, 0.3)";
                }}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle - Hidden on desktop */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}
            className="mobile-toggle">
            {isLoggedIn && itemCount > 0 && (
              <Link href="/cart" style={{ 
                position: "relative", 
                color: "var(--color-cream)", 
                fontSize: "22px", 
                textDecoration: "none",
                padding: "4px",
              }}>
                🛒
                <span style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  background: "var(--color-terracotta)",
                  color: "white",
                  fontSize: "10px",
                  fontWeight: "700",
                  borderRadius: "50%",
                  width: "18px",
                  height: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(200, 97, 66, 0.4)",
                }}>{itemCount}</span>
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: "transparent",
                border: "1px solid var(--color-forest-muted)",
                color: "var(--color-cream)",
                width: "40px",
                height: "40px",
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                padding: "0",
                transition: "all 0.3s",
              }}
              onMouseEnter={e => {
                (e.target as HTMLButtonElement).style.borderColor = "var(--color-sage-light)";
                (e.target as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)";
              }}
              onMouseLeave={e => {
                (e.target as HTMLButtonElement).style.borderColor = "var(--color-forest-muted)";
                (e.target as HTMLButtonElement).style.background = "transparent";
              }}
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div style={{
            paddingBottom: "20px",
            borderTop: "1px solid var(--color-forest-muted)",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            paddingTop: "16px",
          }}
            className="mobile-menu">
            <MobileNavLink href="/shop" onClick={() => setMobileMenuOpen(false)}>Shop</MobileNavLink>
            <MobileNavLink href="/community" onClick={() => setMobileMenuOpen(false)}>Community</MobileNavLink>
            {/* <MobileNavLink href="/chatbot" onClick={() => setMobileMenuOpen(false)}>AI Botanist</MobileNavLink> */}
            <MobileNavLink href="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</MobileNavLink>
            {isLoggedIn ? (
              <>
                <MobileNavLink href="/cart" onClick={() => setMobileMenuOpen(false)}>
                  Cart {itemCount > 0 && `(${itemCount})`}
                </MobileNavLink>
                <MobileNavLink href="/orders" onClick={() => setMobileMenuOpen(false)}>Orders</MobileNavLink>
                <MobileNavLink href="/profile" onClick={() => setMobileMenuOpen(false)}>Profile</MobileNavLink>
                {isAdmin && <MobileNavLink href="/admin" onClick={() => setMobileMenuOpen(false)}>Admin Panel</MobileNavLink>}
                <div style={{
                  padding: "12px 16px",
                  borderTop: "1px solid var(--color-forest-muted)",
                  marginTop: "4px",
                }}>
                  <p style={{ 
                    fontSize: "14px", 
                    fontWeight: "600", 
                    color: "var(--color-cream)", 
                    margin: "0 0 4px 0" 
                  }}>
                    {user?.full_name || "User"}
                  </p>
                  <p style={{ 
                    fontSize: "12px", 
                    color: "var(--color-sage-light)", 
                    margin: "0 0 12px 0",
                    opacity: 0.8,
                  }}>{user?.email}</p>
                  <button
                    onClick={handleLogout}
                    style={{
                      background: "transparent",
                      border: "1px solid var(--color-terracotta)",
                      color: "var(--color-terracotta)",
                      padding: "8px 20px",
                      borderRadius: "20px",
                      fontSize: "13px",
                      fontWeight: "500",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "all 0.3s",
                      width: "100%",
                    }}
                    onMouseEnter={e => {
                      (e.target as HTMLButtonElement).style.background = "var(--color-terracotta)";
                      (e.target as HTMLButtonElement).style.color = "white";
                    }}
                    onMouseLeave={e => {
                      (e.target as HTMLButtonElement).style.background = "transparent";
                      (e.target as HTMLButtonElement).style.color = "var(--color-terracotta)";
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <>
                <MobileNavLink href="/login" onClick={() => setMobileMenuOpen(false)}>Sign In</MobileNavLink>
                <div style={{ padding: "4px 16px 8px" }}>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)} style={{
                    background: "linear-gradient(135deg, var(--color-sage-pale), var(--color-sage-light))",
                    color: "var(--color-forest)",
                    padding: "10px 24px",
                    borderRadius: "20px",
                    fontSize: "14px",
                    fontWeight: "600",
                    textDecoration: "none",
                    display: "block",
                    textAlign: "center",
                    transition: "all 0.3s",
                  }}>
                    Get Started
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* CSS for responsive behavior */}
      <style jsx>{`
        @media (max-width: 767px) {
          .desktop-nav {
            display: none !important;
          }
        }
        @media (min-width: 768px) {
          .mobile-toggle {
            display: none !important;
          }
          .mobile-menu {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} style={{
      color: "var(--color-sage-light)",
      fontSize: "13px",
      fontWeight: "500",
      textDecoration: "none",
      letterSpacing: "0.05em",
      textTransform: "uppercase",
      transition: "all 0.3s",
      position: "relative",
      padding: "4px 0",
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.color = "var(--color-cream)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.color = "var(--color-sage-light)";
      }}
    >
      {children}
      <span style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        height: "2px",
        background: "var(--color-terracotta)",
        transform: "scaleX(0)",
        transition: "transform 0.3s",
        borderRadius: "2px",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = "scaleX(1)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = "scaleX(0)";
      }}
      />
    </Link>
  );
}

function MobileNavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} style={{
      color: "var(--color-cream)",
      fontSize: "15px",
      fontWeight: "500",
      textDecoration: "none",
      padding: "12px 16px",
      borderRadius: "8px",
      display: "block",
      transition: "all 0.2s",
    }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
    >
      {children}
    </Link>
  );
}