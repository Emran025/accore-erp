"use client";

import React from "react";

export interface ToggleOption {
  value: string;
  label: string;
}

interface SegmentedToggleProps {
  id?: string;
  label?: string;
  options: ToggleOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

/**
 * A reusable segmented control component for switching between different types or modes.
 */
export function SegmentedToggle({
  id,
  label,
  options,
  value,
  onChange,
  className = "",
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: SegmentedToggleProps) {
  return (
    <div
      id={id}
      className={`segmented-toggle-container ${className}`}
      role="group"
      aria-invalid={ariaInvalid}
      aria-describedby={ariaDescribedBy}
      style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
    >
      {label && <span className="stat-label">{label}</span>}
      <div className="discount-type-toggle">
        {options.map((option) => (
          <button
            key={option.value}
            className={value === option.value ? "active" : ""}
            onClick={() => onChange(option.value)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
