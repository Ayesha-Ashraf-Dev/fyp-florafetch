"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login, isLoggedIn } = useAuth();

  useEffect(() => {
    if (isLoggedIn) router.push("/shop");
  }, [isLoggedIn, router]);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Enter a valid email";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    const loadingToast = toast.loading("Signing you in…");
    try {
      await login(email, password);
      toast.dismiss(loadingToast);
      toast.success("Welcome back!");
      setTimeout(() => router.push("/shop"), 800);
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("Sign in failed", { description: err instanceof Error ? err.message : "Please try again" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx>{`
        @media (max-width: 767px) {
          .hide-on-mobile {
            display: none !important;
          }
          .show-on-mobile {
            display: block !important;
          }
          .full-width-on-mobile {
            grid-column: 1 / -1 !important;
          }
        }
        @media (min-width: 768px) {
          .show-on-mobile {
            display: none !important;
          }
        }
      `}</style>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        minHeight: "100vh",
      }} className="login-grid">

        {/* Left — Botanical Art Panel - Hidden on mobile */}
        <div className="hide-on-mobile" style={{
          background: "var(--color-forest)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute",
            bottom: "-80px",
            right: "-80px",
            width: "340px",
            height: "340px",
            borderRadius: "50%",
            background: "var(--color-forest-muted)",
            opacity: 0.5,
          }} />
          <div style={{
            position: "absolute",
            top: "30%",
            left: "-40px",
            width: "160px",
            height: "160px",
            borderRadius: "50%",
            border: "1px solid var(--color-forest-muted)",
          }} />

          <div>
            <Link href="/" style={{ textDecoration: "none" }}>
              <p style={{
                fontFamily: "var(--font-playfair, serif)",
                fontSize: "24px",
                fontWeight: "600",
                color: "var(--color-cream)",
              }}>FloraFetch</p>
            </Link>
          </div>

          <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
            <p style={{ fontSize: "100px", marginBottom: "24px" }}>🌿</p>
            <h2 style={{
              fontFamily: "var(--font-playfair, serif)",
              fontSize: "36px",
              fontWeight: "600",
              color: "var(--color-cream)",
              lineHeight: 1.2,
              marginBottom: "16px",
            }}>
              "Every plant is a<br />
              <em style={{ color: "var(--color-sage-light)" }}>story untold."</em>
            </h2>
            <p style={{ fontSize: "14px", color: "var(--color-sage-light)" }}>— FloraFetch Collective</p>
          </div>

          <div>
            <p style={{ fontSize: "13px", color: "var(--color-sage)" }}>
              2,400+ plants delivered to happy homes
            </p>
          </div>
        </div>

        {/* Right — Form - Full width on mobile */}
        <div className="full-width-on-mobile" style={{
          background: "var(--color-cream)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
          minHeight: "100vh",
          width: "100%",
        }}>
          <div style={{
            width: "100%",
            maxWidth: "400px",
            margin: "0 auto",
          }}>
            {/* Mobile Header - Only visible on small screens */}
            <div className="show-on-mobile" style={{
              textAlign: "center",
              marginBottom: "40px",
            }}>
              <Link href="/" style={{ textDecoration: "none" }}>
                <p style={{
                  fontFamily: "var(--font-playfair, serif)",
                  fontSize: "32px",
                  fontWeight: "600",
                  color: "var(--color-forest)",
                  marginBottom: "8px",
                }}>🌿 FloraFetch</p>
              </Link>
              <p style={{
                fontSize: "14px",
                color: "var(--color-text-muted)",
              }}>
                Sign in to continue
              </p>
            </div>

            <p style={{
              fontSize: "11px",
              fontWeight: "600",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--color-terracotta)",
              marginBottom: "12px",
            }}>Welcome Back</p>
            
            <h1 style={{
              fontFamily: "var(--font-playfair, serif)",
              fontSize: "clamp(28px, 5vw, 36px)",
              fontWeight: "600",
              color: "var(--color-forest)",
              marginBottom: "8px",
            }}>Sign in to your account</h1>
            
            <p style={{
              fontSize: "14px",
              color: "var(--color-text-muted)",
              marginBottom: "28px",
            }}>
              Don't have an account?{" "}
              <Link href="/register" style={{
                color: "var(--color-forest)",
                fontWeight: "600",
                textDecoration: "none",
                borderBottom: "1px solid var(--color-forest)",
              }}>
                Create one
              </Link>
            </p>

            {/* Demo credentials hint */}
            <div style={{
              background: "var(--color-sage-pale)",
              border: "1px solid var(--color-sage-light)",
              borderRadius: "6px",
              padding: "12px 14px",
              marginBottom: "24px",
            }}>
              <p style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "var(--color-forest)",
                marginBottom: "4px",
              }}>
                Demo Credentials
              </p>
              <p style={{
                fontSize: "12px",
                color: "var(--color-charcoal-light)",
                display: "flex",
                flexWrap: "wrap",
                gap: "4px",
              }}>
                <span>Email:</span>
                <code style={{
                  background: "white",
                  padding: "2px 6px",
                  borderRadius: "3px",
                  fontSize: "11px",
                  wordBreak: "break-all"
                }}>user@example.com</code>
              </p>
              <p style={{
                fontSize: "12px",
                color: "var(--color-charcoal-light)",
                marginTop: "4px",
                display: "flex",
                flexWrap: "wrap",
                gap: "4px",
              }}>
                <span>Password:</span>
                <code style={{
                  background: "white",
                  padding: "2px 6px",
                  borderRadius: "3px",
                  fontSize: "11px"
                }}>password123</code>
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <FormField
                label="Email Address"
                type="email"
                value={email}
                onChange={(v) => { setEmail(v); if (errors.email) setErrors({ ...errors, email: "" }); }}
                placeholder="you@example.com"
                error={errors.email}
              />
              <FormField
                label="Password"
                type="password"
                value={password}
                onChange={(v) => { setPassword(v); if (errors.password) setErrors({ ...errors, password: "" }); }}
                placeholder="••••••••"
                error={errors.password}
              />

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Link href="#" style={{
                  fontSize: "13px",
                  color: "var(--color-forest)",
                  textDecoration: "none",
                  borderBottom: "1px solid var(--color-sand)",
                }}>
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  background: "var(--color-forest)",
                  color: "var(--color-cream)",
                  border: "none",
                  borderRadius: "4px",
                  padding: "16px",
                  fontSize: "13px",
                  fontWeight: "600",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                  fontFamily: "inherit",
                  transition: "opacity 0.2s",
                  marginTop: "4px",
                }}
              >
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

function FormField({
  label, type, value, onChange, placeholder, error
}: {
  label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder: string; error?: string;
}) {
  return (
    <div>
      <label style={{
        display: "block",
        fontSize: "12px",
        fontWeight: "600",
        color: "var(--color-charcoal)",
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        marginBottom: "6px",
      }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          background: "white",
          border: `1px solid ${error ? "var(--color-terracotta)" : "var(--color-sand)"}`,
          borderRadius: "4px",
          padding: "12px 14px",
          fontSize: "16px",
          color: "var(--color-charcoal)",
          outline: "none",
          fontFamily: "inherit",
          transition: "border-color 0.2s",
          WebkitAppearance: "none",
        }}
        onFocus={e => (e.target as HTMLInputElement).style.borderColor = "var(--color-forest)"}
        onBlur={e => (e.target as HTMLInputElement).style.borderColor = error ? "var(--color-terracotta)" : "var(--color-sand)"}
      />
      {error && <p style={{ fontSize: "12px", color: "var(--color-terracotta)", marginTop: "4px" }}>{error}</p>}
    </div>
  );
}