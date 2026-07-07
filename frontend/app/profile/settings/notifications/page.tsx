"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

const PREFS_KEY = "florafetch_notification_prefs";

const DEFAULT_PREFS = {
  orderUpdates: true,
  deliveryReminders: true,
  careReminders: true,
  promotions: false,
};

export default function NotificationPreferencesPage() {
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(PREFS_KEY);
    if (stored) {
      try { setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(stored) }); } catch { /* ignore */ }
    }
  }, []);

  const handleToggle = (key: keyof typeof prefs) => {
    setPrefs({ ...prefs, [key]: !prefs[key] });
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    setSaved(true);
    toast.success("Notification preferences saved");
  };

  return (
    <div style={{ background: "var(--color-cream)", minHeight: "100vh", padding: "40px" }}>
      <div style={{ maxWidth: "480px", margin: "0 auto" }}>
        <Link href="/profile" style={{ fontSize: "13px", color: "var(--color-forest)", textDecoration: "none" }}>← Back to Profile</Link>
        <h1 style={{ fontFamily: "var(--font-playfair, serif)", fontSize: "28px", color: "var(--color-forest)", margin: "20px 0 8px" }}>Notification Preferences</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "14px", marginBottom: "32px" }}>Manage delivery and care reminders</p>

        <div style={{ background: "white", border: "1px solid var(--color-sand)", borderRadius: "6px", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {[
            { key: "orderUpdates" as const, label: "Order Updates", desc: "Get notified when your order status changes" },
            { key: "deliveryReminders" as const, label: "Delivery Reminders", desc: "Reminders before your plant delivery" },
            { key: "careReminders" as const, label: "Plant Care Reminders", desc: "Watering and care schedule alerts" },
            { key: "promotions" as const, label: "Promotions & Offers", desc: "New arrivals and special deals" },
          ].map((item) => (
            <label key={item.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--color-sand)", cursor: "pointer" }}>
              <div>
                <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--color-charcoal)" }}>{item.label}</p>
                <p style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "2px" }}>{item.desc}</p>
              </div>
              <input type="checkbox" checked={prefs[item.key]} onChange={() => handleToggle(item.key)} style={{ width: "18px", height: "18px", accentColor: "var(--color-forest)" }} />
            </label>
          ))}
          <button onClick={handleSave} style={{ background: "var(--color-forest)", color: "white", border: "none", borderRadius: "4px", padding: "12px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", marginTop: "8px" }}>
            {saved ? "Saved ✓" : "Save Preferences"}
          </button>
        </div>
      </div>
    </div>
  );
}
