"use client";

import { useI18n, catalogText } from "@/lib/i18n";
import React from "react";
import Link from "next/link";
import { Icon, IconName } from "@/lib/icons";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "purple" | "rose" | "outline";
    size?: "sm" | "md" | "lg";
    icon?: IconName | React.ReactNode;
    iconPosition?: "left" | "right";
    isLoading?: boolean;
    href?: string;
    className?: string;
    border_radius?: string;
}

export function Button({
    children,
    variant = "primary",
    size = "md",
    icon,
    iconPosition = "left",
    isLoading = false,
    href,
    className = "",
    disabled,
    border_radius,
    ...props
}: ButtonProps) {
    const { t: i18n } = useI18n();
    const baseClasses = i18n.catalog["text_ce502c0bc809"];
    const variantClasses = catalogText(i18n, "text_0ecc07d5b5c8", { value0: variant });
    const sizeClasses = size === "sm" ? "btn-sm" : size === "lg" ? "btn-lg" : "";
    const borderRadiusClass = border_radius ? catalogText(i18n, "text_544530a20001", { value0: border_radius }) : "";
    const combinedClasses = catalogText(i18n, "text_145848a06881", { value0: baseClasses, value1: variantClasses, value2: sizeClasses, value3: className, value4: borderRadiusClass }).trim();

    const iconElement = typeof icon === "string" ? <Icon name={icon as IconName} /> : icon;

    const content = (
        <>
            {isLoading && <span className="btn-spinner"></span>}
            {!isLoading && icon && iconPosition === "left" && iconElement}
            {children}
            {!isLoading && icon && iconPosition === "right" && iconElement}
        </>
    );

    if (href) {
        // If it's an external link or a specific case where we want <a>, 
        // but for app routing we use Link.
        const isExternal = href.startsWith("http") || href.startsWith(i18n.catalog["text_de1eaa596f93"]) || href.startsWith(i18n.catalog["text_2f9c7bb827d7"]);

        if (isExternal) {
            return (
                <a href={href} className={combinedClasses} target="_blank" rel={i18n.catalog["text_ec0f84cc9ffe"]}>
                    {content}
                </a>
            );
        }

        return (
            <Link href={href} className={combinedClasses}>
                {content}
            </Link>
        );
    }

    return (
        <button
            className={combinedClasses}
            disabled={disabled || isLoading}
            {...props}
        >
            {content}
        </button>
    );
}
