"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";
import { FormSelect } from "@/components/ui/FormSelect";
import {
  SIZE_OPTIONS, CATEGORY_OPTIONS, SUNLIGHT_OPTIONS, WATERING_OPTIONS,
  HUMIDITY_OPTIONS, GROWTH_OPTIONS, labelStyle,
} from "@/lib/plantFormOptions";

export default function AddPlantPage() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    botanical_name: "",
    description: "",
    price: "",
    stock: "",
    size: "medium",
    category: "indoor",
    sunlight_requirement: "moderate",
    watering_frequency: "moderate",
    soil_type: "potting soil",
    temperature_min: "",
    temperature_max: "",
    humidity_level: "moderate",
    is_pet_friendly: false,
    is_low_maintenance: false,
    growth_rate: "slow",
  });

  const setField = (name: string, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">Access Denied</p>
          <Link href="/admin">
            <Button>Back to Admin</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else if (type === "number") {
      setFormData({
        ...formData,
        [name]: value ? parseFloat(value) : "",
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (files.some((f) => f.size > 5 * 1024 * 1024)) {
      toast.error("Each image must be under 5MB");
      return;
    }
    setUploading(true);
    const toastId = toast.loading(`Uploading ${files.length} image(s)…`);
    try {
      const result = await apiClient.uploadImages(files);
      setImageUrls((prev) => [...prev, ...result.urls]);
      toast.dismiss(toastId);
      toast.success(`${result.urls.length} image(s) uploaded!`);
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err instanceof Error ? err.message : "Upload failed. Check Cloudinary configuration.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.stock || !formData.botanical_name || !formData.temperature_min || !formData.temperature_max) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    const loadingId = toast.loading("Creating plant...");

    try {
      const payload = {
        name: formData.name,
        botanical_name: formData.botanical_name,
        description: formData.description,
        price: parseFloat(formData.price as string),
        stock: parseInt(formData.stock as string),
        size: formData.size,
        category: formData.category,
        sunlight_requirement: formData.sunlight_requirement,
        watering_frequency: formData.watering_frequency,
        soil_type: formData.soil_type,
        temperature_min: parseFloat(formData.temperature_min as string),
        temperature_max: parseFloat(formData.temperature_max as string),
        humidity_level: formData.humidity_level,
        is_pet_friendly: formData.is_pet_friendly,
        is_low_maintenance: formData.is_low_maintenance,
        growth_rate: formData.growth_rate,
        image_url: imageUrls[0] || null,
        images: imageUrls.length > 0 ? JSON.stringify(imageUrls) : null,
      };

      await apiClient.createPlant(payload);

      toast.dismiss(loadingId);
      toast.success("Plant created successfully! 🌿");
      router.push("/admin");
    } catch (error) {
      toast.dismiss(loadingId);
      const errorMsg = error instanceof Error ? error.message : "Failed to create plant";
      console.error("Error:", errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "var(--color-cream)", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid var(--color-sand)", padding: "40px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <Link href="/admin" style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: "var(--color-forest)",
            textDecoration: "none",
            fontSize: "13px",
            fontWeight: "500",
            marginBottom: "20px",
            padding: "8px 0",
          }}>
            ← Back to Admin
          </Link>
          <h1 style={{
            fontFamily: "var(--font-playfair, serif)",
            fontSize: "clamp(28px, 3vw, 40px)",
            fontWeight: "600",
            color: "var(--color-forest)",
            marginBottom: "8px",
          }}>🌱 Add New Plant</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>
            Create a new product listing in your collection
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px" }}>
        <form onSubmit={handleSubmit}>
          {/* Image Upload Section */}
          <div style={{
            background: "white",
            border: "1px solid var(--color-sand)",
            borderRadius: "8px",
            padding: "32px",
            marginBottom: "24px",
          }}>
            <h2 style={{
              fontSize: "16px",
              fontWeight: "600",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "var(--color-terracotta)",
              marginBottom: "24px",
            }}>📸 Product Images</h2>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
              {imageUrls.map((url, i) => (
                <div key={url} style={{ position: "relative", width: "120px", height: "120px" }}>
                  <img src={url} alt={`Preview ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px", border: "1px solid var(--color-sand)" }} />
                  <button type="button" onClick={() => setImageUrls(imageUrls.filter((_, idx) => idx !== i))} style={{ position: "absolute", top: "4px", right: "4px", background: "#dc2626", color: "white", border: "none", borderRadius: "50%", width: "20px", height: "20px", fontSize: "12px", cursor: "pointer" }}>×</button>
                </div>
              ))}
              {imageUrls.length === 0 && (
                <div style={{ background: "var(--color-sage-pale)", border: "2px dashed var(--color-sand)", borderRadius: "8px", padding: "32px", textAlign: "center", minHeight: "120px", display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
                  <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>Upload one or more plant images</p>
                </div>
              )}
            </div>

            <label style={{ display: "block", cursor: uploading ? "not-allowed" : "pointer" }}>
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} disabled={uploading} style={{ display: "none" }} />
              <div style={{
                background: uploading ? "var(--color-forest-muted)" : "var(--color-forest)",
                color: "white", padding: "12px 24px", borderRadius: "4px", textAlign: "center",
                fontSize: "13px", fontWeight: "600", letterSpacing: "0.04em", textTransform: "uppercase",
              }}>
                {uploading ? "Uploading…" : "Choose Images (multiple allowed)"}
              </div>
            </label>
            <p style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "12px", textAlign: "center" }}>
              PNG, JPG, WebP up to 5MB each — stored on Cloudinary
            </p>
          </div>

          {/* Basic Information */}
          <div style={{
            background: "white",
            border: "1px solid var(--color-sand)",
            borderRadius: "8px",
            padding: "32px",
            marginBottom: "24px",
          }}>
            <h2 style={{
              fontSize: "16px",
              fontWeight: "600",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "var(--color-terracotta)",
              marginBottom: "24px",
            }}>📋 Basic Information</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              <div>
                <label style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "var(--color-forest)",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}>Plant Name *</label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Monstera Deliciosa"
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid var(--color-sand)",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "var(--color-forest)",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}>Botanical Name *</label>
                <Input
                  type="text"
                  name="botanical_name"
                  value={formData.botanical_name}
                  onChange={handleChange}
                  placeholder="Scientific name"
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid var(--color-sand)",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "600",
                color: "var(--color-forest)",
                marginBottom: "8px",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Detailed product description..."
                rows={4}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid var(--color-sand)",
                  borderRadius: "4px",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  resize: "vertical",
                }}
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "20px" }}>
              <div>
                <label style={labelStyle}>Size *</label>
                <FormSelect value={formData.size} onValueChange={(v) => setField("size", v)} options={SIZE_OPTIONS} />
              </div>

              <div>
                <label style={labelStyle}>Category *</label>
                <FormSelect value={formData.category} onValueChange={(v) => setField("category", v)} options={CATEGORY_OPTIONS} />
              </div>

              <div>
                <label style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "var(--color-forest)",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}>Price (PKR) *</label>
                <Input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="299"
                  step="0.01"
                  min="0"
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid var(--color-sand)",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "var(--color-forest)",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}>Stock Qty *</label>
                <Input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="50"
                  min="0"
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid var(--color-sand)",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Care Requirements */}
          <div style={{
            background: "white",
            border: "1px solid var(--color-sand)",
            borderRadius: "8px",
            padding: "32px",
            marginBottom: "24px",
          }}>
            <h2 style={{
              fontSize: "16px",
              fontWeight: "600",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "var(--color-terracotta)",
              marginBottom: "24px",
            }}>🌿 Care Requirements</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              <div>
                <label style={labelStyle}>Sunlight</label>
                <FormSelect value={formData.sunlight_requirement} onValueChange={(v) => setField("sunlight_requirement", v)} options={SUNLIGHT_OPTIONS} />
              </div>

              <div>
                <label style={labelStyle}>Watering Frequency</label>
                <FormSelect value={formData.watering_frequency} onValueChange={(v) => setField("watering_frequency", v)} options={WATERING_OPTIONS} />
              </div>

              <div>
                <label style={labelStyle}>Humidity Level</label>
                <FormSelect value={formData.humidity_level} onValueChange={(v) => setField("humidity_level", v)} options={HUMIDITY_OPTIONS} />
              </div>

              <div>
                <label style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "var(--color-forest)",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}>Soil Type</label>
                <Input
                  type="text"
                  name="soil_type"
                  value={formData.soil_type}
                  onChange={handleChange}
                  placeholder="e.g., potting soil"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid var(--color-sand)",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "var(--color-forest)",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}>Min Temp (°C) *</label>
                <Input
                  type="number"
                  name="temperature_min"
                  value={formData.temperature_min}
                  onChange={handleChange}
                  placeholder="15"
                  step="0.1"
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid var(--color-sand)",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "var(--color-forest)",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}>Max Temp (°C) *</label>
                <Input
                  type="number"
                  name="temperature_max"
                  value={formData.temperature_max}
                  onChange={handleChange}
                  placeholder="25"
                  step="0.1"
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid var(--color-sand)",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div>
                <label style={labelStyle}>Growth Rate</label>
                <FormSelect value={formData.growth_rate} onValueChange={(v) => setField("growth_rate", v)} options={GROWTH_OPTIONS} />
              </div>
            </div>
          </div>

          {/* Features */}
          <div style={{
            background: "white",
            border: "1px solid var(--color-sand)",
            borderRadius: "8px",
            padding: "32px",
            marginBottom: "24px",
          }}>
            <h2 style={{
              fontSize: "16px",
              fontWeight: "600",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "var(--color-terracotta)",
              marginBottom: "24px",
            }}>✨ Features</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
              }}>
                <input
                  type="checkbox"
                  name="is_pet_friendly"
                  checked={formData.is_pet_friendly}
                  onChange={handleChange}
                  style={{
                    width: "18px",
                    height: "18px",
                    cursor: "pointer",
                    accentColor: "var(--color-forest)",
                  }}
                />
                <span style={{ fontSize: "14px", color: "var(--color-forest)", fontWeight: "500" }}>
                  🐾 Pet Friendly
                </span>
              </label>

              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
              }}>
                <input
                  type="checkbox"
                  name="is_low_maintenance"
                  checked={formData.is_low_maintenance}
                  onChange={handleChange}
                  style={{
                    width: "18px",
                    height: "18px",
                    cursor: "pointer",
                    accentColor: "var(--color-forest)",
                  }}
                />
                <span style={{ fontSize: "14px", color: "var(--color-forest)", fontWeight: "500" }}>
                  ⚡ Low Maintenance
                </span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "16px" }}>
            <Link href="/admin" style={{ flex: 1 }}>
              <button style={{
                width: "100%",
                padding: "14px",
                border: "1px solid var(--color-sand)",
                background: "transparent",
                color: "var(--color-forest)",
                fontSize: "13px",
                fontWeight: "600",
                borderRadius: "4px",
                cursor: "pointer",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                transition: "all 0.2s",
              }} onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--color-sage-pale)";
              }} onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}>
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: "14px",
                background: loading ? "var(--color-forest-muted)" : "var(--color-forest)",
                color: "white",
                fontSize: "13px",
                fontWeight: "600",
                borderRadius: "4px",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                transition: "all 0.2s",
              }} onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.opacity = "0.9";
              }} onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
              }}>
              {loading ? "🔄 Creating..." : "✅ Create Plant"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
