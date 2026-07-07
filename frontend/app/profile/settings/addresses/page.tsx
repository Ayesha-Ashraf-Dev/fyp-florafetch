"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

interface Address {
  id: number;
  street_address?: string;
  street?: string;
  city: string;
  state: string;
  postal_code?: string;
  zip_code?: string;
  country: string;
  is_default: boolean;
}

export default function AddressesPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ street: "", city: "", state: "", zip_code: "", country: "Pakistan", is_default: false });

  const loadAddresses = () => {
    apiClient.getAddresses()
      .then(setAddresses)
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadAddresses(); }, [router]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.createAddress(form);
      toast.success("Address added");
      setShowForm(false);
      setForm({ street: "", city: "", state: "", zip_code: "", country: "Pakistan", is_default: false });
      loadAddresses();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add address");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this address?")) return;
    try {
      await apiClient.deleteAddress(id);
      toast.success("Address deleted");
      loadAddresses();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>Loading…</div>;

  return (
    <div style={{ background: "var(--color-cream)", minHeight: "100vh", padding: "40px" }}>
      <div style={{ maxWidth: "640px", margin: "0 auto" }}>
        <Link href="/profile" style={{ fontSize: "13px", color: "var(--color-forest)", textDecoration: "none" }}>← Back to Profile</Link>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "20px 0 32px" }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-playfair, serif)", fontSize: "28px", color: "var(--color-forest)" }}>Delivery Addresses</h1>
            <p style={{ color: "var(--color-text-muted)", fontSize: "14px", marginTop: "4px" }}>Manage your shipping locations</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} style={{ background: "var(--color-forest)", color: "white", border: "none", borderRadius: "4px", padding: "10px 16px", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" }}>
            {showForm ? "Cancel" : "+ Add Address"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} style={{ background: "white", border: "1px solid var(--color-sand)", borderRadius: "6px", padding: "24px", marginBottom: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
            {[
              { key: "street", label: "Street Address", required: true },
              { key: "city", label: "City", required: true },
              { key: "state", label: "State", required: true },
              { key: "zip_code", label: "ZIP Code", required: true },
              { key: "country", label: "Country", required: true },
            ].map((f) => (
              <div key={f.key}>
                <label style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", color: "var(--color-text-muted)" }}>{f.label}</label>
                <input value={form[f.key as keyof typeof form] as string} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} required style={{ width: "100%", padding: "10px", border: "1px solid var(--color-sand)", borderRadius: "4px", marginTop: "4px", fontFamily: "inherit" }} />
              </div>
            ))}
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px" }}>
              <input type="checkbox" checked={form.is_default} onChange={(e) => setForm({ ...form, is_default: e.target.checked })} />
              Set as default address
            </label>
            <button type="submit" style={{ background: "var(--color-forest)", color: "white", border: "none", borderRadius: "4px", padding: "12px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" }}>Save Address</button>
          </form>
        )}

        {addresses.length === 0 ? (
          <p style={{ color: "var(--color-text-muted)", textAlign: "center", padding: "40px" }}>No addresses yet. Add one to get started.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {addresses.map((addr) => (
              <div key={addr.id} style={{ background: "white", border: "1px solid var(--color-sand)", borderRadius: "6px", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  {addr.is_default && <span style={{ fontSize: "10px", fontWeight: "700", background: "var(--color-sage-pale)", color: "var(--color-forest)", padding: "2px 8px", borderRadius: "2px", marginBottom: "8px", display: "inline-block" }}>DEFAULT</span>}
                  <p style={{ fontSize: "14px", color: "var(--color-charcoal)", lineHeight: 1.6 }}>
                    {addr.street_address || addr.street}<br />
                    {addr.city}, {addr.state} {addr.postal_code || addr.zip_code}<br />
                    {addr.country}
                  </p>
                </div>
                <button onClick={() => handleDelete(addr.id)} style={{ background: "#fef2f2", color: "#dc2626", border: "none", borderRadius: "4px", padding: "6px 12px", fontSize: "12px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" }}>Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
