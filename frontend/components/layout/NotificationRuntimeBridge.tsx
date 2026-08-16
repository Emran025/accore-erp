"use client";

import { useEffect } from "react";
import { catalogMessage } from "@/lib/i18n";
import { publishCodeError } from "@/stores/useNotificationStore";

function getErrorDetails(reason: unknown): string | undefined {
    if (reason instanceof Error) return reason.stack ?? reason.message;
    if (typeof reason === "string") return reason;

    try {
        return JSON.stringify(reason);
    } catch {
        return undefined;
    }
}

function getErrorMessage(reason: unknown, fallback: string): string {
    if (reason instanceof Error && reason.message) return reason.message;
    if (typeof reason === "string" && reason) return reason;
    return fallback;
}

/**
 * Captures runtime failures that bypass feature-level error handling.
 * Business-operation feedback remains in the operational channel; this bridge
 * is reserved for genuine client code and promise failures.
 */
export function NotificationRuntimeBridge() {
    useEffect(() => {
        const onError = (event: ErrorEvent) => {
            const source = [event.filename, event.lineno && `line ${event.lineno}`, event.colno && `column ${event.colno}`]
                .filter(Boolean)
                .join(" · ");

            publishCodeError({
                message: getErrorMessage(
                    event.error ?? event.message,
                    catalogMessage("components.notificationRuntimeBridge.unexpectedClientRuntimeError")
                ),
                source: source || "client-runtime",
                details: getErrorDetails(event.error ?? event.message),
                dedupeKey: `runtime-error:${event.filename}:${event.lineno}:${event.colno}:${event.message}`,
            });
        };

        const onUnhandledRejection = (event: PromiseRejectionEvent) => {
            const message = getErrorMessage(
                event.reason,
                catalogMessage("components.notificationRuntimeBridge.unhandledClientPromiseRejection")
            );
            publishCodeError({
                message,
                source: "client-promise",
                details: getErrorDetails(event.reason),
                dedupeKey: `runtime-rejection:${message}`,
            });
        };

        window.addEventListener("error", onError);
        window.addEventListener("unhandledrejection", onUnhandledRejection);

        return () => {
            window.removeEventListener("error", onError);
            window.removeEventListener("unhandledrejection", onUnhandledRejection);
        };
    }, []);

    return null;
}
