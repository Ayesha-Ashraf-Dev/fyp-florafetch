"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import { toast } from "sonner";

export default function DeleteAccountPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (confirmText !== "DELETE") {
      toast.error('Please type "DELETE" to confirm');
      return;
    }
    setLoading(true);
    try {
      await apiClient.deleteAccount();
      logout();
      toast.success("Account deleted");
      router.push("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "var(--color-cream)", minHeight: "100vh", padding: "40px" }}>
      <div style={{ maxWidth: "480px", margin: "0 auto" }}>
        <Link href="/profile" style={{ fontSize: "13px", color: "var(--color-forest)", textDecoration: "none" }}>← Back to Profile</Link>
        <h1 style={{ fontFamily: "var(--font-playfair, serif)", fontSize: "28px", color: "#dc2626", margin: "20px 0 8px" }}>Delete Account</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "14px", marginBottom: "32px" }}>
          This will permanently deactivate your account. Your order history and data will no longer be accessible.
        </p>

        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "6px", padding: "32px" }}>
          <p style={{ fontSize: "14px", color: "var(--color-charcoal)", marginBottom: "20px" }}>
            Type <strong>DELETE</strong> below to confirm:
          </p>
          <input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            style={{ width: "100%", padding: "10px 12px", border: "1px solid #fecaca", borderRadius: "4px", fontSize: "14px", fontFamily: "inherit", marginBottom: "16px" }}
          />
          <button
            onClick={handleDelete}
            disabled={loading || confirmText !== "DELETE"}
            style={{ width: "100%", background: confirmText === "DELETE" ? "#dc2626" : "#fca5a5", color: "white", border: "none", borderRadius: "4px", padding: "12px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit" }}
          >
            {loading ? "Deleting…" : "Permanently Delete Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
