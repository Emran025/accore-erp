import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { publishCodeError, publishOperationalNotification } from "./useNotificationStore";

export interface AppError {
    id: string;
    message: string;
    severity: "info" | "warning" | "error" | "critical";
    source?: string;
    timestamp: number;
    dismissed: boolean;
    details?: string;
}

interface ErrorState {
    errors: AppError[];
    lastError: AppError | null;
    addError: (error: Omit<AppError, "id" | "timestamp" | "dismissed">) => string;
    dismissError: (id: string) => void;
    clearDismissed: () => void;
    clearAll: () => void;
    activeErrors: () => AppError[];
}

let errorCounter = 0;

function generateErrorId(): string {
    errorCounter += 1;
    return `err_${Date.now()}_${errorCounter}`;
}

function mirrorErrorInNotificationCenter(error: AppError): void {
    const input = {
        message: error.message,
        source: error.source,
        details: error.details,
        dedupeKey: `legacy-error:${error.id}`,
    };

    if (error.severity === "error" || error.severity === "critical") {
        publishCodeError(input);
        return;
    }

    publishOperationalNotification({
        ...input,
        severity: error.severity,
    });
}

/**
 * Compatibility store for legacy error consumers.
 *
 * New code should publish through `useNotificationStore` so every category can
 * be browsed in the global status center. This store remains intentionally
 * stable while mirroring every entry into that center.
 */
export const useErrorStore = create<ErrorState>()(
    devtools(
        (set, get) => ({
            errors: [],
            lastError: null,

            addError: (partial) => {
                const newError: AppError = {
                    ...partial,
                    id: generateErrorId(),
                    timestamp: Date.now(),
                    dismissed: false,
                };

                set((state) => ({
                    errors: [newError, ...state.errors].slice(0, 50),
                    lastError: newError,
                }));
                mirrorErrorInNotificationCenter(newError);

                return newError.id;
            },

            dismissError: (id) => {
                set((state) => ({
                    errors: state.errors.map((error) => (
                        error.id === id ? { ...error, dismissed: true } : error
                    )),
                }));
            },

            clearDismissed: () => {
                set((state) => ({
                    errors: state.errors.filter((error) => !error.dismissed),
                }));
            },

            clearAll: () => set({ errors: [], lastError: null }),
            activeErrors: () => get().errors.filter((error) => !error.dismissed),
        }),
        { name: "error-store" }
    )
);
