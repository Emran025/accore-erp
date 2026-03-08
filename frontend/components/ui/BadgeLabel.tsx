"use client";

import * as React from "react";

interface BadgeLabelProps extends React.InputHTMLAttributes<HTMLInputElement> {
    /** Bar label */
    label: string;
    /** Bar color */
    color?: string;
    /** Filter */
    isFilter?: boolean;
    /** font size */
    fontSize?: number;

    /** Set filter */
    setIsFilter?: React.Dispatch<React.SetStateAction<boolean>>;
    /** Bullet style */
    bulletStyle?: "circle" | "square" | "triangle" | "disc" | "none";
}

export function BadgeLabel({
    label,
    color,
    isFilter,
    setIsFilter,
    bulletStyle,
    fontSize,
    className = "",
    ...props
}: BadgeLabelProps) {
    return (
        <span className={`label-badge ${className}`} style={{ background: color ? (color + 18) : "#f59e0b26", fontSize: fontSize?.toString() + "rem" }}>
            <span
                key={label}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "0.7rem",
                    color: (color ? (color) : "#fbbf24"),
                    cursor: "pointer",
                    opacity: (isFilter === null || isFilter === true) ? 1 : 0.75,
                }}
                onClick={() => setIsFilter && setIsFilter(!isFilter)}
            >
                {bulletStyle && <span style={{ width: 8, height: 8, borderRadius: "50%", background: (color ? (color) : "#fbbf24") }} />}
                {label}
            </span>
        </span>
    );
}
