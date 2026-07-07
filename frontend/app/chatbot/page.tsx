"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  "Why are my plant leaves turning yellow?",
  "How often should I water a Monstera?",
  "What's the best soil for succulents?",
  "How do I propagate a Snake Plant?",
  "My peace lily has brown tips — help!",
  "Which plants are safe for cats?",
];

const SAMPLE_RESPONSES: Record<string, string> = {
  default: "That's a great plant care question! Based on botanical research, I recommend checking the soil moisture, light levels, and humidity around your plant. Most indoor plants prefer indirect bright light and well-draining soil. Feel free to share more details about your plant's condition for a more specific recommendation.",
  yellow: "Yellow leaves are one of the most common plant issues! The most likely causes are:\n\n1. **Overwatering** — check if soil is soggy or waterlogged\n2. **Underwatering** — if leaves are crispy and dry at edges\n3. **Nutrient deficiency** — especially nitrogen or iron\n4. **Too much direct sunlight** causing leaf burn\n\nCheck the soil moisture first — let it dry out between watering for most indoor plants.",
  water: "Watering frequency depends on the plant and season:\n\n• **Monstera**: Every 1-2 weeks. Check top 2 inches of soil — water when dry.\n• **Succulents**: Every 2-4 weeks, less in winter.\n• **Peace Lily**: When leaves slightly droop or soil is dry 1 inch deep.\n\nA good rule: it's better to underwater than overwater!",
  soil: "Succulent soil needs excellent drainage! Use:\n\n• **Cactus/succulent mix** (available at any nursery)\n• Or DIY: 50% regular potting soil + 50% perlite or coarse sand\n\nAvoid regular potting mix alone — it retains too much moisture and causes root rot.",
};

function getBotResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("yellow")) return SAMPLE_RESPONSES.yellow;
  if (lower.includes("water") || lower.includes("watering")) return SAMPLE_RESPONSES.water;
  if (lower.includes("soil") || lower.includes("succulent")) return SAMPLE_RESPONSES.soil;
  return SAMPLE_RESPONSES.default;
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AI Botanist 🌿 I'm here to help you with all things plant care — from diagnosing leaf problems to recommending the perfect growing conditions. What can I help you with today?",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    const userMessage: Message = {
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response delay
    await new Promise((r) => setTimeout(r, 1200));
    setIsTyping(false);

    const botMessage: Message = {
      role: "assistant",
      content: getBotResponse(messageText),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, botMessage]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{ background: "var(--color-cream)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid var(--color-sand)", padding: "32px 40px" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <p style={{
            fontSize: "11px", fontWeight: "600", letterSpacing: "0.18em",
            textTransform: "uppercase", color: "var(--color-terracotta)", marginBottom: "8px",
          }}>AI-Powered</p>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{
              width: "48px", height: "48px", borderRadius: "50%",
              background: "var(--color-forest)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "22px",
            }}>🌿</div>
            <div>
              <h1 style={{
                fontFamily: "var(--font-playfair, serif)",
                fontSize: "28px", fontWeight: "600",
                color: "var(--color-forest)", lineHeight: 1.1,
              }}>AI Botanist</h1>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                <span style={{
                  width: "8px", height: "8px", borderRadius: "50%",
                  background: "#22c55e", display: "inline-block",
                }} />
                <p style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Online · Expert plant care assistant</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Suggestions (only show initially) */}
      {messages.length === 1 && (
        <div style={{ padding: "24px 40px 0", maxWidth: "800px", margin: "0 auto", width: "100%" }}>
          <p style={{ fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "12px", fontWeight: "500" }}>
            Suggested questions:
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => sendMessage(s)}
                style={{
                  background: "white",
                  border: "1px solid var(--color-sand)",
                  borderRadius: "100px",
                  padding: "8px 16px",
                  fontSize: "12px",
                  color: "var(--color-charcoal-light)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "border-color 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-sage)"}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-sand)"}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div style={{
        flex: 1, overflowY: "auto",
        padding: "32px 40px",
        maxWidth: "800px", margin: "0 auto", width: "100%",
        display: "flex", flexDirection: "column", gap: "24px",
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: "flex",
            justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            gap: "12px",
          }}>
            {msg.role === "assistant" && (
              <div style={{
                width: "36px", height: "36px", borderRadius: "50%",
                background: "var(--color-forest)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "16px", flexShrink: 0, marginTop: "4px",
              }}>🌿</div>
            )}
            <div style={{
              maxWidth: "72%",
              background: msg.role === "user" ? "var(--color-forest)" : "white",
              color: msg.role === "user" ? "var(--color-cream)" : "var(--color-charcoal)",
              padding: "16px 20px",
              borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              border: msg.role === "assistant" ? "1px solid var(--color-sand)" : "none",
              fontSize: "14px",
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
            }}>
              {msg.content}
              <p style={{
                fontSize: "10px",
                color: msg.role === "user" ? "var(--color-sage-light)" : "var(--color-text-muted)",
                marginTop: "8px",
                opacity: 0.8,
              }}>
                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            {msg.role === "user" && (
              <div style={{
                width: "36px", height: "36px", borderRadius: "50%",
                background: "var(--color-sage-pale)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "16px", flexShrink: 0, marginTop: "4px",
              }}>👤</div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "50%",
              background: "var(--color-forest)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "16px",
            }}>🌿</div>
            <div style={{
              background: "white",
              border: "1px solid var(--color-sand)",
              padding: "16px 20px",
              borderRadius: "18px 18px 18px 4px",
            }}>
              <div style={{ display: "flex", gap: "4px" }}>
                {[0, 1, 2].map((i) => (
                  <span key={i} style={{
                    width: "8px", height: "8px", borderRadius: "50%",
                    background: "var(--color-sage)",
                    display: "inline-block",
                    animation: `bounce 1.2s ease infinite ${i * 0.2}s`,
                  }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div style={{
        borderTop: "1px solid var(--color-sand)",
        padding: "20px 40px",
        background: "white",
        position: "sticky",
        bottom: 0,
      }}>
        <div style={{
          maxWidth: "800px",
          margin: "0 auto",
          display: "flex",
          gap: "12px",
          alignItems: "flex-end",
        }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about plant care, diseases, watering schedules…"
            rows={1}
            style={{
              flex: 1,
              background: "var(--color-cream)",
              border: "1px solid var(--color-sand)",
              borderRadius: "8px",
              padding: "12px 16px",
              fontSize: "14px",
              color: "var(--color-charcoal)",
              outline: "none",
              fontFamily: "inherit",
              resize: "none",
              lineHeight: 1.5,
              transition: "border-color 0.2s",
            }}
            onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = "var(--color-sage)"}
            onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = "var(--color-sand)"}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isTyping}
            style={{
              background: input.trim() && !isTyping ? "var(--color-forest)" : "var(--color-sand)",
              color: input.trim() && !isTyping ? "var(--color-cream)" : "var(--color-text-muted)",
              border: "none",
              borderRadius: "8px",
              width: "44px",
              height: "44px",
              cursor: input.trim() && !isTyping ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              transition: "background 0.2s",
              flexShrink: 0,
            }}
          >
            ↑
          </button>
        </div>
        <p style={{ fontSize: "11px", color: "var(--color-text-muted)", textAlign: "center", marginTop: "8px" }}>
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
