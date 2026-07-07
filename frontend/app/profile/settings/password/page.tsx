"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";
import { validatePassword } from "@/lib/password";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [form, setForm] = useState({ current: "", newPass: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPass !== form.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    const passwordError = validatePassword(form.newPass);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }
    setLoading(true);
    try {
      await apiClient.changePassword(form.current, form.newPass);
      toast.success("Password changed successfully");
      router.push("/profile");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "var(--color-cream)", minHeight: "100vh", padding: "40px" }}>
      <div style={{ maxWidth: "480px", margin: "0 auto" }}>
        <Link href="/profile" style={{ fontSize: "13px", color: "var(--color-forest)", textDecoration: "none" }}>← Back to Profile</Link>
        <h1 style={{ fontFamily: "var(--font-playfair, serif)", fontSize: "28px", color: "var(--color-forest)", margin: "20px 0 8px" }}>Change Password</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "14px", marginBottom: "32px" }}>Update your security credentials</p>

        <form onSubmit={handleSubmit} style={{ background: "white", border: "1px solid var(--color-sand)", borderRadius: "6px", padding: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {[
            { key: "current", label: "Current Password", type: "password" },
            { key: "newPass", label: "New Password", type: "password" },
            { key: "confirm", label: "Confirm New Password", type: "password" },
          ].map((f) => (
            <div key={f.key}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: "6px" }}>{f.label}</label>
              <input
                type={f.type}
                value={form[f.key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                required
                style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--color-sand)", borderRadius: "4px", fontSize: "14px", fontFamily: "inherit" }}
              />
            </div>
          ))}
          <button type="submit" disabled={loading} style={{ background: "var(--color-forest)", color: "white", border: "none", borderRadius: "4px", padding: "12px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
            {loading ? "Updating…" : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
