"use client";

import { useI18n } from "@/lib/i18n";
import * as React from "react";

interface ToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    pressed?: boolean;
    onPressedChange?: (pressed: boolean) => void;
    variant?: "default" | "outline";
    size?: "default" | "sm" | "lg";
}

export function Toggle({
    className = "",
    pressed,
    onPressedChange,
    variant = "default",
    size = "default",
    onClick,
    children,
    ...props
}: ToggleProps) {
    const { t: i18n } = useI18n();
    const [isPressed, setIsPressed] = React.useState(pressed || false);

    React.useEffect(() => {
        if (pressed !== undefined) {
            setIsPressed(pressed);
        }
    }, [pressed]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        const newState = !isPressed;
        if (pressed === undefined) {
            setIsPressed(newState);
        }
        if (onPressedChange) {
            onPressedChange(newState);
        }
        if (onClick) {
            onClick(e);
        }
    };

    const baseClass = i18n.catalog["text_360f485012bf"];

    // Using simple styles or CSS variables from globals.css
    const variantClass = variant === "outline"
        ? i18n.catalog["text_fcf4e2b5e926"]
        : i18n.catalog["text_07086c439fe7"];

    const activeClass = isPressed
        ? i18n.catalog["text_804b5103430a"]
        : i18n.catalog["text_103d1e085b1e"];

    const sizeClass = size === "sm" ? i18n.catalog["text_87c1f2732270"] : size === "lg" ? i18n.catalog["text_3e3a4d52171e"] : i18n.catalog["text_b665cc544c25"];

    return (
        <button
            type="button"
            aria-pressed={isPressed}
            onClick={handleClick}
            className={`${baseClass} ${variantClass} ${activeClass} ${sizeClass} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
