"use client";

import { ReactNode } from "react";

interface AlertProps {
  variant: "success" | "error" | "warning" | "info";
  title?: string;
  children: ReactNode;
  onClose?: () => void;
}

export function Alert({ variant, title, children, onClose }: AlertProps) {
  const variants = {
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      icon: "🎉",
      textColor: "text-green-800",
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      icon: "❌",
      textColor: "text-red-800",
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      icon: "⚠️",
      textColor: "text-yellow-800",
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: "ℹ️",
      textColor: "text-blue-800",
    },
  };

  const style = variants[variant];

  return (
    <div className={`${style.bg} border-l-4 ${style.border} ${style.textColor} p-4 rounded-lg mb-4`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3 items-start flex-1">
          <span className="text-xl mt-0.5">{style.icon}</span>
          <div className="flex-1">
            {title && <h3 className="font-semibold mb-1">{title}</h3>}
            <p className="text-sm">{children}</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-lg leading-none hover:opacity-70 transition"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
