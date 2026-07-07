"use client";

import { useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { FormSelect } from "@/components/ui/FormSelect";
import { toast } from "sonner";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Sending message...");

    try {
      await apiClient.submitContactMessage(formData);

      toast.dismiss(toastId);
      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "var(--color-cream)", minHeight: "100vh" }}>
      {/* Header */}
      <div
        style={{
          borderBottom: "1px solid var(--color-sand)",
          padding: "48px 40px 36px",
          maxWidth: "1280px",
          margin: "0 auto",
        }}
      >
        <p
          style={{
            fontSize: "11px",
            fontWeight: "600",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--color-terracotta)",
            marginBottom: "12px",
          }}
        >
          Get in Touch
        </p>
        <h1
          style={{
            fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
            fontSize: "clamp(32px, 4vw, 52px)",
            fontWeight: "600",
            color: "var(--color-forest)",
            lineHeight: 1.1,
            marginBottom: "8px",
          }}
        >
          Contact Us
        </h1>
        <p
          style={{
            fontSize: "14px",
            color: "var(--color-text-muted)",
            maxWidth: "600px",
          }}
        >
          Have a question or feedback? We'd love to hear from you. Reach out and
          we'll respond as soon as possible.
        </p>
      </div>

      {/* Content */}
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "40px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "48px",
        }}
      >
        {/* Contact Information */}
        <div>
          <h2
            style={{
              fontFamily: "var(--font-playfair, serif)",
              fontSize: "24px",
              fontWeight: "600",
              color: "var(--color-forest)",
              marginBottom: "24px",
            }}
          >
            Contact Information
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            {/* Email */}
            <div
              style={{
                background: "white",
                border: "1px solid var(--color-sand)",
                borderRadius: "8px",
                padding: "24px",
              }}
            >
              <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "28px" }}>📧</span>
                <div>
                  <h3
                    style={{
                      fontSize: "15px",
                      fontWeight: "600",
                      color: "var(--color-forest)",
                      marginBottom: "4px",
                    }}
                  >
                    Email
                  </h3>
                  <p style={{ fontSize: "14px", color: "var(--color-charcoal)" }}>
                    support@florafetch.com
                  </p>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "var(--color-text-muted)",
                      marginTop: "4px",
                    }}
                  >
                    We'll respond within 24 hours
                  </p>
                </div>
              </div>
            </div>

            {/* WhatsApp */}
            <div
              style={{
                background: "white",
                border: "1px solid var(--color-sand)",
                borderRadius: "8px",
                padding: "24px",
              }}
            >
              <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "28px" }}>💬</span>
                <div>
                  <h3
                    style={{
                      fontSize: "15px",
                      fontWeight: "600",
                      color: "var(--color-forest)",
                      marginBottom: "4px",
                    }}
                  >
                    WhatsApp
                  </h3>
                  <p style={{ fontSize: "14px", color: "var(--color-charcoal)" }}>
                    +91 98765 43210
                  </p>
                  <a
                    href="https://wa.me/919876543210?text=Hi%20FloraFetch"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-block",
                      fontSize: "12px",
                      color: "var(--color-forest)",
                      textDecoration: "none",
                      marginTop: "8px",
                      fontWeight: "500",
                      borderRadius: "4px",
                      padding: "6px 12px",
                      background: "#e8f5e9",
                    }}
                  >
                    Start Chat →
                  </a>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div
              style={{
                background: "white",
                border: "1px solid var(--color-sand)",
                borderRadius: "8px",
                padding: "24px",
              }}
            >
              <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "28px" }}>☎️</span>
                <div>
                  <h3
                    style={{
                      fontSize: "15px",
                      fontWeight: "600",
                      color: "var(--color-forest)",
                      marginBottom: "4px",
                    }}
                  >
                    Phone
                  </h3>
                  <p style={{ fontSize: "14px", color: "var(--color-charcoal)" }}>
                    +91 98765 43210
                  </p>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "var(--color-text-muted)",
                      marginTop: "4px",
                    }}
                  >
                    Available Mon-Sat, 9 AM - 6 PM
                  </p>
                </div>
              </div>
            </div>

            {/* Address */}
            <div
              style={{
                background: "white",
                border: "1px solid var(--color-sand)",
                borderRadius: "8px",
                padding: "24px",
              }}
            >
              <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "28px" }}>📍</span>
                <div>
                  <h3
                    style={{
                      fontSize: "15px",
                      fontWeight: "600",
                      color: "var(--color-forest)",
                      marginBottom: "4px",
                    }}
                  >
                    Address
                  </h3>
                  <p style={{ fontSize: "14px", color: "var(--color-charcoal)" }}>
                    FloraFetch Nursery, Green Street
                    <br />
                    Botanical Garden, Pakistan
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div
          style={{
            background: "white",
            border: "1px solid var(--color-sand)",
            borderRadius: "8px",
            padding: "32px",
            height: "fit-content",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-playfair, serif)",
              fontSize: "20px",
              fontWeight: "600",
              color: "var(--color-forest)",
              marginBottom: "24px",
            }}
          >
            Send us a Message
          </h2>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Name */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "var(--color-forest)",
                  marginBottom: "6px",
                }}
              >
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid var(--color-sand)",
                  borderRadius: "4px",
                  fontSize: "13px",
                  fontFamily: "inherit",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "var(--color-sage)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "var(--color-sand)")
                }
              />
            </div>

            {/* Email */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "var(--color-forest)",
                  marginBottom: "6px",
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid var(--color-sand)",
                  borderRadius: "4px",
                  fontSize: "13px",
                  fontFamily: "inherit",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "var(--color-sage)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "var(--color-sand)")
                }
              />
            </div>

            {/* Subject */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "var(--color-forest)",
                  marginBottom: "6px",
                }}
              >
                Subject
              </label>
              <FormSelect
                value={formData.subject || "placeholder"}
                onValueChange={(v) => setFormData({ ...formData, subject: v === "placeholder" ? "" : v })}
                options={[
                  { value: "placeholder", label: "Select a subject" },
                  { value: "inquiry", label: "General Inquiry" },
                  { value: "support", label: "Customer Support" },
                  { value: "feedback", label: "Feedback" },
                  { value: "partnership", label: "Partnership" },
                  { value: "other", label: "Other" },
                ]}
              />
            </div>

            {/* Message */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "var(--color-forest)",
                  marginBottom: "6px",
                }}
              >
                Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us what you think..."
                rows={6}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid var(--color-sand)",
                  borderRadius: "4px",
                  fontSize: "13px",
                  fontFamily: "inherit",
                  outline: "none",
                  transition: "border-color 0.2s",
                  resize: "vertical",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "var(--color-sage)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "var(--color-sand)")
                }
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "12px 20px",
                background: "var(--color-forest)",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "13px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                opacity: loading ? 0.7 : 1,
                transition: "opacity 0.2s",
              }}
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>

      {/* Back to Home */}
      <div
        style={{
          borderTop: "1px solid var(--color-sand)",
          padding: "40px",
          textAlign: "center",
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: "13px",
            color: "var(--color-forest)",
            textDecoration: "none",
            fontWeight: "500",
          }}
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
