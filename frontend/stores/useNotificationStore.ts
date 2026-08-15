import { create } from "zustand";
import { devtools } from "zustand/middleware";

export const NOTIFICATION_CATEGORIES = ["operational", "code", "product"] as const;
export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

export type NotificationSeverity = "info" | "success" | "warning" | "error" | "critical";

export interface NotificationAction {
    href: string;
    label: string;
}

export interface AppNotification {
    id: string;
    category: NotificationCategory;
    severity: NotificationSeverity;
    message: string;
    source?: string;
    details?: string;
    action?: NotificationAction;
    dedupeKey?: string;
    timestamp: number;
    read: boolean;
    dismissed: boolean;
}

export interface NotificationInput {
    category: NotificationCategory;
    severity?: NotificationSeverity;
    message: string;
    source?: string;
    details?: string;
    action?: NotificationAction;
    dedupeKey?: string;
}

export interface NotificationState {
    notifications: AppNotification[];
    selectedNotificationId: string | null;
    selectedCategory: NotificationCategory | "all";
    isCenterOpen: boolean;
    addNotification: (notification: NotificationInput) => string;
    dismissNotification: (id: string) => void;
    markNotificationRead: (id: string) => void;
    markAllRead: () => void;
    clearDismissed: () => void;
    clearAll: () => void;
    selectNotification: (id: string | null) => void;
    selectCategory: (category: NotificationCategory | "all") => void;
    setCenterOpen: (isOpen: boolean) => void;
    toggleCenter: () => void;
    activeNotifications: () => AppNotification[];
    unreadCount: (category?: NotificationCategory | "all") => number;
}

const MAX_NOTIFICATIONS = 100;
let notificationCounter = 0;

function createNotificationId(): string {
    notificationCounter += 1;
    return `notification_${Date.now()}_${notificationCounter}`;
}

function toNotification(input: NotificationInput): AppNotification {
    return {
        id: createNotificationId(),
        category: input.category,
        severity: input.severity ?? "info",
        message: input.message,
        source: input.source,
        details: input.details,
        action: input.action,
        dedupeKey: input.dedupeKey,
        timestamp: Date.now(),
        read: false,
        dismissed: false,
    };
}

function matchesDedupeKey(notification: AppNotification, input: NotificationInput): boolean {
    return Boolean(input.dedupeKey && notification.dedupeKey === input.dedupeKey && !notification.dismissed);
}

export const useNotificationStore = create<NotificationState>()(
    devtools(
        (set, get) => ({
            notifications: [],
            selectedNotificationId: null,
            selectedCategory: "all",
            isCenterOpen: false,

            addNotification: (input) => {
                const existing = get().notifications.find((notification) => matchesDedupeKey(notification, input));

                if (existing) {
                    const timestamp = Date.now();
                    set((state) => ({
                        notifications: state.notifications.map((notification) =>
                            notification.id === existing.id
                                ? {
                                    ...notification,
                                    message: input.message,
                                    severity: input.severity ?? notification.severity,
                                    source: input.source ?? notification.source,
                                    details: input.details ?? notification.details,
                                    action: input.action ?? notification.action,
                                    timestamp,
                                    read: false,
                                    dismissed: false,
                                }
                                : notification
                        ),
                        selectedNotificationId: existing.id,
                    }));
                    return existing.id;
                }

                const notification = toNotification(input);
                set((state) => ({
                    notifications: [notification, ...state.notifications].slice(0, MAX_NOTIFICATIONS),
                    selectedNotificationId: notification.id,
                }));
                return notification.id;
            },

            dismissNotification: (id) => {
                set((state) => ({
                    notifications: state.notifications.map((notification) =>
                        notification.id === id ? { ...notification, dismissed: true, read: true } : notification
                    ),
                    selectedNotificationId: state.selectedNotificationId === id ? null : state.selectedNotificationId,
                }));
            },

            markNotificationRead: (id) => {
                set((state) => ({
                    notifications: state.notifications.map((notification) =>
                        notification.id === id ? { ...notification, read: true } : notification
                    ),
                }));
            },

            markAllRead: () => {
                set((state) => ({
                    notifications: state.notifications.map((notification) => ({ ...notification, read: true })),
                }));
            },

            clearDismissed: () => {
                set((state) => ({
                    notifications: state.notifications.filter((notification) => !notification.dismissed),
                }));
            },

            clearAll: () => set({ notifications: [], selectedNotificationId: null }),

            selectNotification: (id) => set({ selectedNotificationId: id }),
            selectCategory: (category) => set({ selectedCategory: category }),
            setCenterOpen: (isOpen) => set({ isCenterOpen: isOpen }),
            toggleCenter: () => set((state) => ({ isCenterOpen: !state.isCenterOpen })),

            activeNotifications: () => get().notifications.filter((notification) => !notification.dismissed),
            unreadCount: (category = "all") => get().notifications.filter((notification) => (
                !notification.dismissed
                && !notification.read
                && (category === "all" || notification.category === category)
            )).length,
        }),
        { name: "notification-store" }
    )
);

export function publishNotification(input: NotificationInput): string {
    return useNotificationStore.getState().addNotification(input);
}

export function publishOperationalNotification(input: Omit<NotificationInput, "category">): string {
    return publishNotification({ ...input, category: "operational" });
}

export function publishCodeError(input: Omit<NotificationInput, "category" | "severity">): string {
    return publishNotification({ ...input, category: "code", severity: "error" });
}

export function publishProductNotification(input: Omit<NotificationInput, "category">): string {
    return publishNotification({ ...input, category: "product" });
}
