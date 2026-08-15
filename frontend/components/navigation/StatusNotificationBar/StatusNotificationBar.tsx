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
import styles from "./StatusNotificationBar.module.css";

interface StatusNotificationBarProps {
    text?: string;
}

const categoryIcons: Record<NotificationCategory, "landmark" | "cpu" | "box"> = {
    operational: "landmark",
    code: "cpu",
    product: "box",
};

const categoryTone: Record<NotificationCategory, string> = {
    operational: styles.toneOperational,
    code: styles.toneCode,
    product: styles.toneProduct,
};

const categoryBorder: Record<NotificationCategory, string> = {
    operational: styles.categoryOperational,
    code: styles.categoryCode,
    product: styles.categoryProduct,
};

const categoryPill: Record<NotificationCategory, string> = {
    operational: styles.pillOperational,
    code: styles.pillCode,
    product: styles.pillProduct,
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
    const { locale } = useI18n();
    const copy = getStatusNotificationCopy(locale);
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
    const summaryTone = latestNotification ? categoryTone[latestNotification.category] : styles.toneReady;
    const summaryIcon = latestNotification ? categoryIcons[latestNotification.category] : "check-circle";

    return (
        <div className={styles.root} ref={rootRef}>
            {isCenterOpen && (
                <section className={styles.center} role="dialog" aria-label={copy.centerTitle}>
                    <header className={styles.centerHeader}>
                        <h2 className={styles.centerTitle}>{copy.centerTitle}</h2>
                        <div className={styles.centerControls}>
                            <button
                                type="button"
                                className={styles.iconButton}
                                onClick={markAllRead}
                                title={copy.markAllRead}
                                aria-label={copy.markAllRead}
                                disabled={unreadTotal === 0}
                            >
                                {getIcon("check-check")}
                            </button>
                            <button
                                type="button"
                                className={styles.iconButton}
                                onClick={clearDismissed}
                                title={copy.clearDismissed}
                                aria-label={copy.clearDismissed}
                            >
                                {getIcon("refresh")}
                            </button>
                            <button
                                type="button"
                                className={styles.iconButton}
                                onClick={() => setCenterOpen(false)}
                                title={copy.closeCenter}
                                aria-label={copy.closeCenter}
                            >
                                {getIcon("x")}
                            </button>
                        </div>
                    </header>

                    <nav className={styles.categoryTabs} aria-label={copy.centerTitle}>
                        {(["all", ...NOTIFICATION_CATEGORIES] as const).map((category) => {
                            const unreadCount = countUnread(activeNotifications, category);
                            return (
                                <button
                                    type="button"
                                    key={category}
                                    className={`${styles.categoryButton} ${selectedCategory === category ? styles.categoryButtonActive : ""}`}
                                    onClick={() => selectFilter(category)}
                                    aria-pressed={selectedCategory === category}
                                >
                                    <span>{copy.categories[category]}</span>
                                    {unreadCount > 0 && <span className={styles.categoryCount}>{unreadCount}</span>}
                                </button>
                            );
                        })}
                    </nav>

                    <div className={styles.centerBody}>
                        <div className={styles.notificationList} role="list" aria-label={copy.centerTitle}>
                            {visibleNotifications.length === 0 ? (
                                <div className={styles.emptyState}>{copy.noNotifications}</div>
                            ) : (
                                visibleNotifications.map((notification) => (
                                    <button
                                        type="button"
                                        role="listitem"
                                        key={notification.id}
                                        className={`${styles.listItem} ${categoryBorder[notification.category]} ${selectedNotification?.id === notification.id ? styles.listItemSelected : ""} ${!notification.read ? styles.listItemUnread : ""}`}
                                        onClick={() => openNotification(notification)}
                                    >
                                        <span className={styles.listMessage}>{notification.message}</span>
                                        <span className={styles.listMeta}>{formatTime(notification.timestamp, locale)}</span>
                                        {!notification.read && <span className={styles.unreadDot} aria-label={copy.unreadSuffix} />}
                                    </button>
                                ))
                            )}
                        </div>

                        <article className={styles.detail} aria-live="polite">
                            {!selectedNotification ? (
                                <div className={styles.detailEmpty}>{copy.noNotifications}</div>
                            ) : (
                                <>
                                    <div className={styles.detailHeader}>
                                        <span className={`${styles.categoryPill} ${categoryPill[selectedNotification.category]}`}>
                                            {copy.categories[selectedNotification.category]}
                                        </span>
                                        <time className={styles.detailTime} dateTime={new Date(selectedNotification.timestamp).toISOString()}>
                                            {formatTime(selectedNotification.timestamp, locale)}
                                        </time>
                                    </div>
                                    <p className={styles.detailMessage}>{selectedNotification.message}</p>
                                    {selectedNotification.source && (
                                        <div className={styles.detailMeta}>
                                            <span className={styles.detailMetaLabel}>{copy.source}</span>
                                            <span>{selectedNotification.source}</span>
                                        </div>
                                    )}
                                    {selectedNotification.details && (
                                        <>
                                            <div className={styles.detailMetaLabel}>{copy.details}</div>
                                            <code className={styles.detailCode}>{selectedNotification.details}</code>
                                        </>
                                    )}
                                    <footer className={styles.detailFooter}>
                                        {selectedNotification.action && (
                                            <a className={styles.actionLink} href={selectedNotification.action.href}>
                                                {selectedNotification.action.label || copy.openRelatedScreen}
                                            </a>
                                        )}
                                        <div className={styles.manualNavigation}>
                                            <button
                                                type="button"
                                                className={styles.iconButton}
                                                onClick={() => moveSelection(-1)}
                                                title={copy.previous}
                                                aria-label={copy.previous}
                                                disabled={visibleNotifications.length < 2}
                                            >
                                                {getIcon("chevronLeft")}
                                            </button>
                                            <button
                                                type="button"
                                                className={styles.iconButton}
                                                onClick={() => moveSelection(1)}
                                                title={copy.next}
                                                aria-label={copy.next}
                                                disabled={visibleNotifications.length < 2}
                                            >
                                                {getIcon("chevron-right")}
                                            </button>
                                            <button
                                                type="button"
                                                className={styles.iconButton}
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

            <footer className={styles.bar} role="status">
                <button
                    type="button"
                    className={styles.summaryButton}
                    onClick={toggleCenter}
                    title={isCenterOpen ? copy.closeCenter : copy.openCenter}
                    aria-expanded={isCenterOpen}
                    aria-haspopup="dialog"
                >
                    <span className={`${styles.summaryIcon} ${summaryTone}`}>{getIcon(summaryIcon)}</span>
                    <span className={styles.summaryText}>{summaryText}</span>
                    {unreadTotal > 0 && <span className={styles.unreadBadge}>{unreadTotal}</span>}
                </button>
                <span className={styles.environment}>{locale === "ar-SA" ? "بيئة الاختبار" : "Test environment"}</span>
            </footer>
        </div>
    );
}
