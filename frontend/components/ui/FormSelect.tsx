"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

export interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function FormSelect({
  value,
  onValueChange,
  options,
  placeholder = "Select…",
  disabled,
  className,
}: FormSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger 
        className={className}
        style={{
          width: "100%",
          height: "42px",
          padding: "8px 12px",
          fontSize: "13px",
          background: "white",
          border: "1px solid var(--color-sand)",
          borderRadius: "6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
        }}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        style={{
          background: "white",
          border: "1px solid var(--color-sand)",
          borderRadius: "6px",
          padding: "4px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          minWidth: "var(--radix-select-trigger-width)",
        }}
      >
        {options.map((opt) => (
          <SelectItem 
            key={opt.value} 
            value={opt.value}
            className="pl-8 pr-4" // This adds proper spacing for the check icon
            style={{
              padding: "8px 12px 8px 32px", // 32px left for check icon, 12px right
              margin: "2px 0",
              borderRadius: "4px",
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              width: "100%",
              background: "transparent",
              color: "var(--color-charcoal)",
              position: "relative",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--color-sage-pale)";
              e.currentTarget.style.color = "var(--color-forest)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--color-charcoal)";
            }}
          >
            <span className="flex-1">{opt.label}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}