"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageCarouselProps {
  images: string[];
  alt: string;
}

export function ImageCarousel({ images, alt }: ImageCarouselProps) {
  const [index, setIndex] = useState(0);
  const slides = images.length > 0 ? images : [];

  if (slides.length === 0) {
    return (
      <div style={{
        aspectRatio: "1",
        background: "var(--color-sage-pale)",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "64px",
      }}>🌿</div>
    );
  }

  const prev = () => setIndex((i) => (i === 0 ? slides.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === slides.length - 1 ? 0 : i + 1));

  return (
    <div style={{ position: "relative" }}>
      <div style={{
        aspectRatio: "1",
        borderRadius: "12px",
        overflow: "hidden",
        background: "var(--color-sage-pale)",
        border: "1px solid var(--color-sand)",
      }}>
        <img
          src={slides[index]}
          alt={`${alt} ${index + 1}`}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      {slides.length > 1 && (
        <>
          <button type="button" onClick={prev} aria-label="Previous image" style={navBtn("left")}>
            <ChevronLeft size={20} />
          </button>
          <button type="button" onClick={next} aria-label="Next image" style={navBtn("right")}>
            <ChevronRight size={20} />
          </button>
          <div style={{
            display: "flex",
            gap: "8px",
            justifyContent: "center",
            marginTop: "12px",
            flexWrap: "wrap",
          }}>
            {slides.map((src, i) => (
              <button
                key={src + i}
                type="button"
                onClick={() => setIndex(i)}
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "6px",
                  overflow: "hidden",
                  border: i === index ? "2px solid var(--color-forest)" : "1px solid var(--color-sand)",
                  padding: 0,
                  cursor: "pointer",
                  opacity: i === index ? 1 : 0.7,
                }}
              >
                <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function navBtn(side: "left" | "right"): React.CSSProperties {
  return {
    position: "absolute",
    top: "50%",
    [side]: "12px",
    transform: "translateY(-50%)",
    background: "white",
    border: "1px solid var(--color-sand)",
    borderRadius: "50%",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "var(--color-forest)",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  } as React.CSSProperties;
}
