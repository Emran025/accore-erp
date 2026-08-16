"use client";

import { useEffect, useMemo, useRef } from "react";
import { useI18n } from "@/lib/i18n";
import { getIcon } from "@/lib/icons";
import {
    NOTIFICATION_CATEGORIES,
    type AppNotification,
    type NotificationCategory,
    useNotificationStore,
} from "@/stores/useNotificationStore";
import { getStatusNotificationCopy } from "./content";

interface StatusNotificationBarProps {
    text?: string;
}

const categoryIcons: Record<NotificationCategory, "landmark" | "cpu" | "box"> = {
    operational: "landmark",
    code: "cpu",
    product: "box",
};

const categoryTone: Record<NotificationCategory, string> = {
    operational: "status-notification-tone-operational",
    code: "status-notification-tone-code",
    product: "status-notification-tone-product",
};

const categoryBorder: Record<NotificationCategory, string> = {
    operational: "status-notification-category-operational",
    code: "status-notification-category-code",
    product: "status-notification-category-product",
};

const categoryPill: Record<NotificationCategory, string> = {
    operational: "status-notification-pill-operational",
    code: "status-notification-pill-code",
    product: "status-notification-pill-product",
};

function formatTime(timestamp: number, locale: string): string {
    return new Intl.DateTimeFormat(locale, {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "short",
    }).format(new Date(timestamp));
}

function countUnread(notifications: AppNotification[], category: NotificationCategory | "all"): number {
    return notifications.filter((notification) => (
        !notification.read && (category === "all" || notification.category === category)
    )).length;
}

export function StatusNotificationBar({ text }: StatusNotificationBarProps) {
    const { locale, t: i18n } = useI18n();
    const copy = getStatusNotificationCopy(i18n);
    const rootRef = useRef<HTMLDivElement>(null);

    const notifications = useNotificationStore((state) => state.notifications);
    const selectedNotificationId = useNotificationStore((state) => state.selectedNotificationId);
    const selectedCategory = useNotificationStore((state) => state.selectedCategory);
    const isCenterOpen = useNotificationStore((state) => state.isCenterOpen);
    const toggleCenter = useNotificationStore((state) => state.toggleCenter);
    const setCenterOpen = useNotificationStore((state) => state.setCenterOpen);
    const selectCategory = useNotificationStore((state) => state.selectCategory);
    const selectNotification = useNotificationStore((state) => state.selectNotification);
    const markNotificationRead = useNotificationStore((state) => state.markNotificationRead);
    const markAllRead = useNotificationStore((state) => state.markAllRead);
    const dismissNotification = useNotificationStore((state) => state.dismissNotification);
    const clearDismissed = useNotificationStore((state) => state.clearDismissed);

    const activeNotifications = useMemo(
        () => notifications.filter((notification) => !notification.dismissed),
        [notifications]
    );
    const visibleNotifications = useMemo(
        () => activeNotifications.filter((notification) => (
            selectedCategory === "all" || notification.category === selectedCategory
        )),
        [activeNotifications, selectedCategory]
    );
    const selectedNotification = visibleNotifications.find((notification) => notification.id === selectedNotificationId) ?? null;
    const selectedIndex = selectedNotification
        ? visibleNotifications.findIndex((notification) => notification.id === selectedNotification.id)
        : -1;
    const latestNotification = activeNotifications[0] ?? null;
    const unreadTotal = countUnread(activeNotifications, "all");

    useEffect(() => {
        if (!isCenterOpen || selectedNotification || visibleNotifications.length === 0) return;
        const firstNotification = visibleNotifications[0];
        selectNotification(firstNotification.id);
        markNotificationRead(firstNotification.id);
    }, [isCenterOpen, markNotificationRead, selectNotification, selectedNotification, visibleNotifications]);

    useEffect(() => {
        const closeOnOutsidePointer = (event: MouseEvent) => {
            if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
                setCenterOpen(false);
            }
        };

        if (isCenterOpen) document.addEventListener("mousedown", closeOnOutsidePointer);
        return () => document.removeEventListener("mousedown", closeOnOutsidePointer);
    }, [isCenterOpen, setCenterOpen]);

    const openNotification = (notification: AppNotification) => {
        selectNotification(notification.id);
        markNotificationRead(notification.id);
    };

    const moveSelection = (offset: -1 | 1) => {
        if (visibleNotifications.length === 0) return;
        const nextIndex = selectedIndex < 0
            ? 0
            : (selectedIndex + offset + visibleNotifications.length) % visibleNotifications.length;
        openNotification(visibleNotifications[nextIndex]);
    };

    const selectFilter = (category: NotificationCategory | "all") => {
        selectCategory(category);
        selectNotification(null);
    };

    const summaryText = latestNotification?.message ?? text ?? copy.ready;
    const summaryTone = latestNotification ? categoryTone[latestNotification.category] : "status-notification-tone-ready";
    const summaryIcon = latestNotification ? categoryIcons[latestNotification.category] : "check-circle";

    return (
        <div className="status-notification-root" ref={rootRef}>
            {isCenterOpen && (
                <section className="status-notification-center" role="dialog" aria-label={copy.centerTitle}>
                    <header className="status-notification-center-header">
                        <h2 className="status-notification-center-title">{copy.centerTitle}</h2>
                        <div className="status-notification-center-controls">
                            <button
                                type="button"
                                className="status-notification-icon-button"
                                onClick={markAllRead}
                                title={copy.markAllRead}
                                aria-label={copy.markAllRead}
                                disabled={unreadTotal === 0}
                            >
                                {getIcon("check-check")}
                            </button>
                            <button
                                type="button"
                                className="status-notification-icon-button"
                                onClick={clearDismissed}
                                title={copy.clearDismissed}
                                aria-label={copy.clearDismissed}
                            >
                                {getIcon("refresh")}
                            </button>
                            <button
                                type="button"
                                className="status-notification-icon-button"
                                onClick={() => setCenterOpen(false)}
                                title={copy.closeCenter}
                                aria-label={copy.closeCenter}
                            >
                                {getIcon("x")}
                            </button>
                        </div>
                    </header>

                    <nav className="status-notification-category-tabs" aria-label={copy.centerTitle}>
                        {(["all", ...NOTIFICATION_CATEGORIES] as const).map((category) => {
                            const unreadCount = countUnread(activeNotifications, category);
                            return (
                                <button
                                    type="button"
                                    key={category}
                                    className={`status-notification-category-button ${selectedCategory === category ? "status-notification-category-button-active" : ""}`}
                                    onClick={() => selectFilter(category)}
                                    aria-pressed={selectedCategory === category}
                                >
                                    <span>{copy.categories[category]}</span>
                                    {unreadCount > 0 && <span className="status-notification-category-count">{unreadCount}</span>}
                                </button>
                            );
                        })}
                    </nav>

                    <div className="status-notification-center-body">
                        <div className="status-notification-list" role="list" aria-label={copy.centerTitle}>
                            {visibleNotifications.length === 0 ? (
                                <div className="status-notification-empty-state">{copy.noNotifications}</div>
                            ) : (
                                visibleNotifications.map((notification) => (
                                    <button
                                        type="button"
                                        role="listitem"
                                        key={notification.id}
                                        className={`status-notification-list-item ${categoryBorder[notification.category]} ${selectedNotification?.id === notification.id ? "status-notification-list-item-selected" : ""} ${!notification.read ? "status-notification-list-item-unread" : ""}`}
                                        onClick={() => openNotification(notification)}
                                    >
                                        <span className="status-notification-list-message">{notification.message}</span>
                                        <span className="status-notification-list-meta">{formatTime(notification.timestamp, locale)}</span>
                                        {!notification.read && <span className="status-notification-unread-dot" aria-label={copy.unreadSuffix} />}
                                    </button>
                                ))
                            )}
                        </div>

                        <article className="status-notification-detail" aria-live="polite">
                            {!selectedNotification ? (
                                <div className="status-notification-detail-empty">{copy.noNotifications}</div>
                            ) : (
                                <>
                                    <div className="status-notification-detail-header">
                                        <span className={`status-notification-category-pill ${categoryPill[selectedNotification.category]}`}>
                                            {copy.categories[selectedNotification.category]}
                                        </span>
                                        <time className="status-notification-detail-time" dateTime={new Date(selectedNotification.timestamp).toISOString()}>
                                            {formatTime(selectedNotification.timestamp, locale)}
                                        </time>
                                    </div>
                                    <p className="status-notification-detail-message">{selectedNotification.message}</p>
                                    {selectedNotification.source && (
                                        <div className="status-notification-detail-meta">
                                            <span className="status-notification-detail-meta-label">{copy.source}</span>
                                            <span>{selectedNotification.source}</span>
                                        </div>
                                    )}
                                    {selectedNotification.details && (
                                        <>
                                            <div className="status-notification-detail-meta-label">{copy.details}</div>
                                            <code className="status-notification-detail-code">{selectedNotification.details}</code>
                                        </>
                                    )}
                                    <footer className="status-notification-detail-footer">
                                        {selectedNotification.action && (
                                            <a className="status-notification-action-link" href={selectedNotification.action.href}>
                                                {selectedNotification.action.label || copy.openRelatedScreen}
                                            </a>
                                        )}
                                        <div className="status-notification-manual-navigation">
                                            <button
                                                type="button"
                                                className="status-notification-icon-button"
                                                onClick={() => moveSelection(-1)}
                                                title={copy.previous}
                                                aria-label={copy.previous}
                                                disabled={visibleNotifications.length < 2}
                                            >
                                                {getIcon("chevronLeft")}
                                            </button>
                                            <button
                                                type="button"
                                                className="status-notification-icon-button"
                                                onClick={() => moveSelection(1)}
                                                title={copy.next}
                                                aria-label={copy.next}
                                                disabled={visibleNotifications.length < 2}
                                            >
                                                {getIcon("chevron-right")}
                                            </button>
                                            <button
                                                type="button"
                                                className="status-notification-icon-button"
                                                onClick={() => dismissNotification(selectedNotification.id)}
                                                title={copy.dismiss}
                                                aria-label={copy.dismiss}
                                            >
                                                {getIcon("x")}
                                            </button>
                                        </div>
                                    </footer>
                                </>
                            )}
                        </article>
                    </div>
                </section>
            )}

            <footer className="status-notification-bar" role="status">
                <button
                    type="button"
                    className="status-notification-summary-button"
                    onClick={toggleCenter}
                    title={isCenterOpen ? copy.closeCenter : copy.openCenter}
                    aria-expanded={isCenterOpen}
                    aria-haspopup="dialog"
                >
                    <span className={`status-notification-summary-icon ${summaryTone}`}>{getIcon(summaryIcon)}</span>
                    <span className="status-notification-summary-text">{summaryText}</span>
                    {unreadTotal > 0 && <span className="status-notification-unread-badge">{unreadTotal}</span>}
                </button>
                <span className="status-notification-environment">{i18n.catalog["components.environmentindicator.testEnvironment"]}</span>
            </footer>
        </div>
    );
}
