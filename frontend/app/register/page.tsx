"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { toast } from "sonner";
import { PASSWORD_REQUIREMENTS, validatePassword, getPasswordStrength } from "@/lib/password";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "", phone: "", email: "", password: "", confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { register, isLoggedIn } = useAuth();

  useEffect(() => {
    if (isLoggedIn) router.push("/shop");
  }, [isLoggedIn, router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Enter a valid email";
    if (!formData.password) newErrors.password = "Password is required";
    else {
      const passwordError = validatePassword(formData.password);
      if (passwordError) newErrors.password = passwordError;
    }
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    const loadingToast = toast.loading("Creating your account…");
    try {
      await register(formData.email, formData.password, formData.fullName, formData.phone);
      toast.dismiss(loadingToast);
      toast.success("Account created! Welcome to FloraFetch.");
      setTimeout(() => router.push("/shop"), 800);
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("Registration failed", { description: err instanceof Error ? err.message : "Please try again" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      minHeight: "100vh",
    }} className="login-grid">

      {/* Left panel */}
      <div style={{
        background: "var(--color-forest)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "60px",
        position: "relative",
        overflow: "hidden",
      }} className="hidden md:flex">
        <div style={{
          position: "absolute",
          top: "-60px",
          right: "-60px",
          width: "260px",
          height: "260px",
          borderRadius: "50%",
          background: "var(--color-forest-muted)",
          opacity: 0.5,
        }} />
        <Link href="/" style={{ textDecoration: "none" }}>
          <p style={{
            fontFamily: "var(--font-playfair, serif)",
            fontSize: "24px", fontWeight: "600",
            color: "var(--color-cream)",
          }}>FloraFetch</p>
        </Link>
        <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: "80px", marginBottom: "24px" }}>🌱</p>
          <h2 style={{
            fontFamily: "var(--font-playfair, serif)",
            fontSize: "32px", fontWeight: "600",
            color: "var(--color-cream)", lineHeight: 1.2, marginBottom: "16px",
          }}>
            Start your botanical<br />
            <em style={{ color: "var(--color-sage-light)" }}>journey today</em>
          </h2>
          <p style={{ fontSize: "14px", color: "var(--color-sage-light)" }}>
            Join 2,400+ plant lovers nationwide
          </p>
        </div>
        <p style={{ fontSize: "13px", color: "var(--color-sage)" }}>
          Rare species · Expert care guides · Fast delivery
        </p>
      </div>

      {/* Right — Form */}
      <div style={{
        background: "var(--color-cream)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 40px",
        overflowY: "auto",
      }}>
        <div style={{ width: "100%", maxWidth: "400px" }}>
          <p style={{
            fontSize: "11px", fontWeight: "600", letterSpacing: "0.18em",
            textTransform: "uppercase", color: "var(--color-terracotta)", marginBottom: "12px",
          }}>New Member</p>
          <h1 style={{
            fontFamily: "var(--font-playfair, serif)",
            fontSize: "32px", fontWeight: "600",
            color: "var(--color-forest)", marginBottom: "8px",
          }}>Create your account</h1>
          <p style={{ fontSize: "14px", color: "var(--color-text-muted)", marginBottom: "36px" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "var(--color-forest)", fontWeight: "600", textDecoration: "none", borderBottom: "1px solid var(--color-forest)" }}>
              Sign in
            </Link>
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {[
              { field: "fullName", label: "Full Name", type: "text", placeholder: "Jane Doe" },
              { field: "phone", label: "Phone Number", type: "tel", placeholder: "+92 300 0000000" },
              { field: "email", label: "Email Address", type: "email", placeholder: "you@example.com" },
              { field: "password", label: "Password", type: "password", placeholder: "••••••••" },
              { field: "confirmPassword", label: "Confirm Password", type: "password", placeholder: "••••••••" },
            ].map((f) => (
              <div key={f.field}>
                <label style={{
                  display: "block", fontSize: "12px", fontWeight: "600",
                  color: "var(--color-charcoal)", letterSpacing: "0.05em",
                  textTransform: "uppercase", marginBottom: "8px",
                }}>{f.label}</label>
                <input
                  type={f.type}
                  value={formData[f.field as keyof typeof formData]}
                  onChange={(e) => handleChange(f.field, e.target.value)}
                  placeholder={f.placeholder}
                  style={{
                    width: "100%",
                    background: "white",
                    border: `1px solid ${errors[f.field] ? "var(--color-terracotta)" : "var(--color-sand)"}`,
                    borderRadius: "4px",
                    padding: "12px 14px",
                    fontSize: "14px",
                    color: "var(--color-charcoal)",
                    outline: "none",
                    fontFamily: "inherit",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = "var(--color-forest)"}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = errors[f.field] ? "var(--color-terracotta)" : "var(--color-sand)"}
                />
                {errors[f.field] && (
                  <p style={{ fontSize: "12px", color: "var(--color-terracotta)", marginTop: "5px" }}>{errors[f.field]}</p>
                )}
                {f.field === "password" && formData.password && (
                  <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    {PASSWORD_REQUIREMENTS.map((req) => {
                      const met = req.test(formData.password);
                      return (
                        <p key={req.key} style={{ fontSize: "11px", color: met ? "var(--color-forest-muted)" : "var(--color-text-muted)", margin: 0 }}>
                          {met ? "✓" : "○"} {req.label}
                        </p>
                      );
                    })}
                    <div style={{ height: "4px", background: "var(--color-sand)", borderRadius: "2px", marginTop: "4px" }}>
                      <div style={{
                        height: "100%",
                        width: `${(passwordStrength / PASSWORD_REQUIREMENTS.length) * 100}%`,
                        background: passwordStrength >= 4 ? "var(--color-forest)" : "var(--color-terracotta)",
                        borderRadius: "2px",
                        transition: "width 0.2s",
                      }} />
                    </div>
                  </div>
                )}
              </div>
            ))}

            <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
              <input type="checkbox" required style={{ marginTop: "3px", accentColor: "var(--color-forest)" }} />
              <span style={{ fontSize: "13px", color: "var(--color-text-muted)", lineHeight: 1.5 }}>
                I agree to the{" "}
                <Link href="#" style={{ color: "var(--color-forest)", fontWeight: "600", textDecoration: "none" }}>Terms</Link>
                {" "}and{" "}
                <Link href="#" style={{ color: "var(--color-forest)", fontWeight: "600", textDecoration: "none" }}>Privacy Policy</Link>
              </span>
            </label>

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
              }}
            >
              {loading ? "Creating Account…" : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
