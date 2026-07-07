"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient, User } from "@/lib/api";
import { toast } from "sonner";

const BOTANICAL_HISTORY = [
  { date: "June 2024", plant: "Monstera Deliciosa", event: "Added to collection", emoji: "🌿", status: "thriving" },
  { date: "May 2024", plant: "Peace Lily", event: "New growth milestone — 3 new leaves", emoji: "🌸", status: "flowering" },
  { date: "April 2024", plant: "Snake Plant", event: "Repotted to larger pot", emoji: "🪴", status: "growing" },
  { date: "March 2024", plant: "ZZ Plant", event: "First purchase", emoji: "🌱", status: "settled" },
];

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ full_name: "", phone: "", bio: "" });
  const [activeTab, setActiveTab] = useState<"profile" | "history" | "settings">("profile");

  const [saving, setSaving] = useState(false);
  const [orderCount, setOrderCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    apiClient.getProfile()
      .then((data) => {
        setProfile(data);
        setFormData({ full_name: data.full_name || "", phone: data.phone || "", bio: data.bio || "" });
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));

    apiClient.getOrders().then((o) => setOrderCount(o.length)).catch(() => {});
    apiClient.getUserReviews().then((r) => setReviewCount(r.length)).catch(() => {});
  }, [router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await apiClient.updateProfile({
        full_name: formData.full_name,
        phone: formData.phone,
        bio: formData.bio,
      });
      setProfile(updated);
      setEditMode(false);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>Loading your profile…</p>
      </div>
    );
  }

  if (!profile) return null;

  const initials = profile.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  return (
    <div style={{ background: "var(--color-cream)", minHeight: "100vh" }}>
      {/* Profile Hero */}
      <div style={{
        background: "var(--color-forest)",
        padding: "60px 40px 0",
      }}>
        <div style={{ maxWidth: "1024px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "24px", paddingBottom: "32px" }}>
            {/* Avatar */}
            <div style={{
              width: "80px", height: "80px", borderRadius: "50%",
              background: "var(--color-sage-pale)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "28px", fontWeight: "700", color: "var(--color-forest)",
              flexShrink: 0,
              border: "3px solid rgba(255,255,255,0.2)",
            }}>
              {initials}
            </div>
            <div style={{ flex: 1, paddingBottom: "4px" }}>
              <p style={{
                fontFamily: "var(--font-playfair, serif)",
                fontSize: "26px", fontWeight: "600",
                color: "var(--color-cream)", lineHeight: 1.1,
              }}>{profile.full_name}</p>
              <p style={{ fontSize: "13px", color: "var(--color-sage-light)", marginTop: "4px" }}>{profile.email}</p>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                <span style={{
                  background: profile.role === "admin" ? "var(--color-terracotta)" : "var(--color-forest-muted)",
                  color: "white",
                  fontSize: "10px", fontWeight: "700",
                  padding: "3px 10px", borderRadius: "2px",
                  textTransform: "uppercase", letterSpacing: "0.08em",
                }}>{profile.role}</span>
                <span style={{
                  background: "rgba(255,255,255,0.1)",
                  color: "var(--color-sage-light)",
                  fontSize: "10px", fontWeight: "600",
                  padding: "3px 10px", borderRadius: "2px",
                  textTransform: "uppercase",
                }}>
                  {profile.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
            <button
              onClick={() => setEditMode(!editMode)}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.3)",
                color: "var(--color-cream)",
                padding: "10px 20px",
                borderRadius: "4px",
                fontSize: "12px", fontWeight: "600",
                cursor: "pointer", fontFamily: "inherit",
                letterSpacing: "0.04em", textTransform: "uppercase",
                transition: "border-color 0.2s",
                flexShrink: 0,
              }}>
              {editMode ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "0" }}>
            {(["profile", "history", "settings"] as const).map((t) => (
              <button key={t} onClick={() => setActiveTab(t)}
                style={{
                  padding: "14px 24px",
                  border: "none", background: "transparent",
                  fontSize: "12px", fontWeight: "600",
                  letterSpacing: "0.06em", textTransform: "uppercase",
                  cursor: "pointer",
                  color: activeTab === t ? "var(--color-cream)" : "var(--color-sage-light)",
                  borderBottom: `2px solid ${activeTab === t ? "var(--color-cream)" : "transparent"}`,
                  fontFamily: "inherit",
                  transition: "color 0.2s",
                }}>
                {t === "profile" ? "Account" : t === "history" ? "Botanical History" : "Settings"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1024px", margin: "0 auto", padding: "40px" }}>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }} className="profile-grid">
            {/* Details */}
            <div style={{ background: "white", border: "1px solid var(--color-sand)", borderRadius: "6px", padding: "32px" }}>
              <h2 style={{
                fontFamily: "var(--font-playfair, serif)",
                fontSize: "20px", fontWeight: "600",
                color: "var(--color-forest)", marginBottom: "24px",
              }}>Account Details</h2>

              {!editMode ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {[
                    { label: "Full Name", value: profile.full_name || "—" },
                    { label: "Email", value: profile.email },
                    { label: "Phone", value: profile.phone || "—" },
                    { label: "Bio", value: profile.bio || "No bio added" },
                    { label: "Member Since", value: profile.created_at ? new Date(profile.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long" }) : "—" },
                  ].map((field) => (
                    <div key={field.label} style={{ borderBottom: "1px solid var(--color-sand)", paddingBottom: "16px" }}>
                      <p style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: "4px" }}>
                        {field.label}
                      </p>
                      <p style={{ fontSize: "15px", color: "var(--color-charcoal)", fontWeight: "500" }}>
                        {field.value}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <form onSubmit={handleSaveProfile}
                  style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  {[
                    { field: "full_name", label: "Full Name", type: "text" },
                    { field: "phone", label: "Phone", type: "tel" },
                    { field: "bio", label: "Bio", type: "textarea" },
                  ].map((f) => (
                    <div key={f.field}>
                      <label style={{
                        display: "block", fontSize: "11px", fontWeight: "600",
                        letterSpacing: "0.08em", textTransform: "uppercase",
                        color: "var(--color-text-muted)", marginBottom: "6px",
                      }}>{f.label}</label>
                      {f.type === "textarea" ? (
                        <textarea
                          value={formData[f.field as keyof typeof formData]}
                          onChange={(e) => setFormData({ ...formData, [f.field]: e.target.value })}
                          rows={3}
                          style={{
                            width: "100%", background: "var(--color-cream)",
                            border: "1px solid var(--color-sand)", borderRadius: "4px",
                            padding: "10px 12px", fontSize: "14px",
                            color: "var(--color-charcoal)", fontFamily: "inherit",
                            outline: "none", resize: "vertical",
                          }}
                        />
                      ) : (
                        <input
                          type={f.type}
                          value={formData[f.field as keyof typeof formData]}
                          onChange={(e) => setFormData({ ...formData, [f.field]: e.target.value })}
                          style={{
                            width: "100%", background: "var(--color-cream)",
                            border: "1px solid var(--color-sand)", borderRadius: "4px",
                            padding: "10px 12px", fontSize: "14px",
                            color: "var(--color-charcoal)", fontFamily: "inherit", outline: "none",
                          }}
                        />
                      )}
                    </div>
                  ))}
                  <button type="submit" disabled={saving} style={{
                    background: saving ? "var(--color-forest-muted)" : "var(--color-forest)", color: "var(--color-cream)",
                    border: "none", borderRadius: "4px", padding: "12px",
                    fontSize: "13px", fontWeight: "600", cursor: saving ? "not-allowed" : "pointer",
                    fontFamily: "inherit", letterSpacing: "0.04em",
                  }}>{saving ? "Saving…" : "Save Changes"}</button>
                </form>
              )}
            </div>

            {/* Stats */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                { icon: "📦", label: "Total Orders", value: orderCount.toString(), link: "/orders" },
                { icon: "🌿", label: "Plants Owned", value: BOTANICAL_HISTORY.length.toString(), link: "/shop" },
                { icon: "⭐", label: "Reviews Given", value: reviewCount.toString(), link: "/community" },
              ].map((stat) => (
                <Link key={stat.label} href={stat.link} style={{
                  display: "flex", alignItems: "center", gap: "20px",
                  background: "white", border: "1px solid var(--color-sand)",
                  borderRadius: "6px", padding: "24px", textDecoration: "none",
                  transition: "border-color 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--color-sage-light)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--color-sand)"}
                >
                  <span style={{
                    fontSize: "24px", width: "52px", height: "52px",
                    background: "var(--color-sage-pale)", borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>{stat.icon}</span>
                  <div>
                    <p style={{
                      fontFamily: "var(--font-playfair, serif)",
                      fontSize: "26px", fontWeight: "600", color: "var(--color-forest)", lineHeight: 1,
                    }}>{stat.value}</p>
                    <p style={{ fontSize: "13px", color: "var(--color-text-muted)", marginTop: "4px" }}>{stat.label}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Botanical History Tab */}
        {activeTab === "history" && (
          <div>
            <div style={{ marginBottom: "32px" }}>
              <p style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-terracotta)", marginBottom: "8px" }}>
                Your Green Journey
              </p>
              <h2 style={{
                fontFamily: "var(--font-playfair, serif)",
                fontSize: "28px", fontWeight: "600", color: "var(--color-forest)",
              }}>Botanical Care Timeline</h2>
              <p style={{ fontSize: "14px", color: "var(--color-text-muted)", marginTop: "8px" }}>
                A living record of your plant collection and care milestones
              </p>
            </div>

            {/* Timeline */}
            <div style={{ position: "relative" }}>
              {/* Vertical line */}
              <div style={{
                position: "absolute",
                left: "24px",
                top: "0", bottom: "0",
                width: "1px",
                background: "var(--color-sand)",
              }} />

              <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                {BOTANICAL_HISTORY.map((item, i) => (
                  <div key={i} style={{
                    display: "flex", gap: "24px",
                    paddingBottom: "32px",
                    position: "relative",
                  }}>
                    {/* Timeline dot */}
                    <div style={{
                      width: "48px", height: "48px", borderRadius: "50%",
                      background: "white",
                      border: "2px solid var(--color-sage-pale)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "20px", flexShrink: 0,
                      position: "relative", zIndex: 1,
                    }}>
                      {item.emoji}
                    </div>

                    {/* Content */}
                    <div style={{
                      background: "white",
                      border: "1px solid var(--color-sand)",
                      borderRadius: "6px",
                      padding: "20px 24px",
                      flex: 1,
                      marginTop: "4px",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                        <h3 style={{
                          fontFamily: "var(--font-playfair, serif)",
                          fontSize: "17px", fontWeight: "600", color: "var(--color-forest)",
                        }}>{item.plant}</h3>
                        <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>{item.date}</span>
                      </div>
                      <p style={{ fontSize: "14px", color: "var(--color-charcoal-light)" }}>{item.event}</p>
                      <span style={{
                        display: "inline-block",
                        marginTop: "10px",
                        background: "var(--color-sage-pale)",
                        color: "var(--color-forest-muted)",
                        fontSize: "11px", fontWeight: "600",
                        padding: "3px 10px", borderRadius: "2px",
                        textTransform: "capitalize",
                      }}>{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add care note */}
              <div style={{
                display: "flex", gap: "24px",
                paddingTop: "8px",
                position: "relative",
              }}>
                <div style={{
                  width: "48px", height: "48px", borderRadius: "50%",
                  background: "var(--color-cream-dark)",
                  border: "2px dashed var(--color-sand)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "20px", flexShrink: 0,
                  position: "relative", zIndex: 1,
                  color: "var(--color-text-muted)",
                }}>+</div>
                <div style={{
                  background: "var(--color-cream-dark)",
                  border: "1px dashed var(--color-sand)",
                  borderRadius: "6px",
                  padding: "20px 24px",
                  flex: 1,
                  marginTop: "4px",
                  display: "flex",
                  alignItems: "center",
                }}>
                  <p style={{ fontSize: "14px", color: "var(--color-text-muted)", fontStyle: "italic" }}>
                    New care milestones will appear here as you grow your collection
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "500px" }}>
            <h2 style={{
              fontFamily: "var(--font-playfair, serif)",
              fontSize: "22px", fontWeight: "600", color: "var(--color-forest)", marginBottom: "12px",
            }}>Account Settings</h2>
            {[
              { icon: "🔑", label: "Change Password", desc: "Update your security credentials", href: "/profile/settings/password" },
              { icon: "🔔", label: "Notification Preferences", desc: "Manage delivery and care reminders", href: "/profile/settings/notifications" },
              { icon: "📍", label: "Delivery Addresses", desc: "Manage your shipping locations", href: "/profile/settings/addresses" },
              { icon: "❌", label: "Delete Account", desc: "Permanently remove your account and data", href: "/profile/settings/delete-account", danger: true },
            ].map((item) => (
              <Link key={item.label} href={item.href}
                style={{
                  display: "flex", alignItems: "center", gap: "16px",
                  padding: "18px 20px",
                  background: "white",
                  border: `1px solid ${item.danger ? "#fecaca" : "var(--color-sand)"}`,
                  borderRadius: "6px",
                  cursor: "pointer", fontFamily: "inherit",
                  textAlign: "left",
                  transition: "border-color 0.2s",
                  width: "100%",
                  textDecoration: "none",
                }}>
                <span style={{ fontSize: "20px" }}>{item.icon}</span>
                <div>
                  <p style={{ fontSize: "14px", fontWeight: "600", color: item.danger ? "#dc2626" : "var(--color-charcoal)" }}>{item.label}</p>
                  <p style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "2px" }}>{item.desc}</p>
                </div>
                <span style={{ marginLeft: "auto", color: "var(--color-text-muted)", fontSize: "16px" }}>›</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
