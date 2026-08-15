"use client";

import { useEffect } from "react";
import {
    type NotificationAction,
    type NotificationSeverity,
    publishOperationalNotification,
} from "@/stores/useNotificationStore";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastOptions {
    source?: string;
    details?: string;
    action?: NotificationAction;
    dedupeKey?: string;
}

interface ToastProps {
    message: string;
    type?: ToastType;
    options?: ToastOptions;
    onClose?: () => void;
}

function toOperationalSeverity(type: ToastType): NotificationSeverity {
    if (type === "error") return "warning";
    return type;
}

/**
 * Backward-compatible global feedback API.
 *
 * Existing feature pages continue to call `showToast`, while the message is
 * retained in the permanent status center instead of disappearing in a
 * floating overlay. Error toasts represent a failed business operation and
 * therefore use the operational (amber) channel; unexpected runtime failures
 * are reported through `publishCodeError` and use the red channel.
 */
export function showToast(message: string, type: ToastType = "info", options: ToastOptions = {}): string {
    return publishOperationalNotification({
        message,
        severity: toOperationalSeverity(type),
        source: options.source ?? "legacy-feedback",
        details: options.details,
        action: options.action,
        dedupeKey: options.dedupeKey,
    });
}

/**
 * Legacy component kept for external consumers that rendered a Toast directly.
 * It publishes to the central, browsable status history and renders no floating
 * layer.
 */
export function Toast({ message, type = "info", options, onClose }: ToastProps) {
    useEffect(() => {
        showToast(message, type, options);
        onClose?.();
    }, [message, onClose, options, type]);

    return null;
}

/**
 * Kept as a no-op mount point so existing shell integrations remain valid.
 */
export function ToastContainer() {
    return null;
}
