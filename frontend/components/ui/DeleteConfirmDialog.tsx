"use client";

import { useEffect, useRef } from "react";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  itemName?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({
  isOpen,
  title = "Delete Item",
  message,
  itemName,
  isLoading = false,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      onClick={(e) => {
        if (e.target === dialogRef.current) onCancel();
      }}
      style={{
        padding: 0,
        border: "none",
        borderRadius: "8px",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
        maxWidth: "420px",
      }}
    >
      <div style={{ padding: "28px" }}>
        <div style={{ marginBottom: "12px", fontSize: "24px" }}>⚠️</div>
        <h2
          style={{
            fontFamily: "var(--font-playfair, serif)",
            fontSize: "18px",
            fontWeight: "600",
            color: "var(--color-forest)",
            marginBottom: "8px",
          }}
        >
          {title}
        </h2>
        <p style={{ fontSize: "14px", color: "var(--color-charcoal)", marginBottom: "4px" }}>
          {message}
        </p>
        {itemName && (
          <p
            style={{
              fontSize: "13px",
              color: "var(--color-text-muted)",
              fontStyle: "italic",
              marginBottom: "20px",
            }}
          >
            {itemName}
          </p>
        )}

        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            disabled={isLoading}
            style={{
              padding: "10px 20px",
              border: "1px solid var(--color-sand)",
              background: "white",
              borderRadius: "4px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: isLoading ? "not-allowed" : "pointer",
              color: "var(--color-charcoal)",
              opacity: isLoading ? 0.6 : 1,
              fontFamily: "inherit",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              padding: "10px 20px",
              background: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.7 : 1,
              fontFamily: "inherit",
            }}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
