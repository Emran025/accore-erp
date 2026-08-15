import type { SupportedLocale } from "@/lib/i18n";
import type { NotificationCategory } from "@/stores/useNotificationStore";

export interface StatusNotificationCopy {
    ready: string;
    centerTitle: string;
    openCenter: string;
    closeCenter: string;
    markAllRead: string;
    clearDismissed: string;
    noNotifications: string;
    previous: string;
    next: string;
    dismiss: string;
    details: string;
    source: string;
    openRelatedScreen: string;
    unreadSuffix: string;
    categories: Record<NotificationCategory | "all", string>;
}

const copy: Record<SupportedLocale, StatusNotificationCopy> = {
    "ar-SA": {
        ready: "النظام جاهز",
        centerTitle: "مركز الإشعارات",
        openCenter: "فتح مركز الإشعارات",
        closeCenter: "إغلاق مركز الإشعارات",
        markAllRead: "تعليم الكل كمقروء",
        clearDismissed: "تنظيف المخفي",
        noNotifications: "لا توجد إشعارات ضمن هذا التصنيف.",
        previous: "السابق",
        next: "التالي",
        dismiss: "إخفاء الإشعار",
        details: "التفاصيل",
        source: "المصدر",
        openRelatedScreen: "فتح الشاشة ذات الصلة",
        unreadSuffix: "غير مقروءة",
        categories: {
            all: "الكل",
            operational: "تشغيلي ومحاسبي",
            code: "أخطاء برمجية",
            product: "المنتج والإعداد",
        },
    },
    "en-US": {
        ready: "System ready",
        centerTitle: "Notification center",
        openCenter: "Open notification center",
        closeCenter: "Close notification center",
        markAllRead: "Mark all as read",
        clearDismissed: "Clear dismissed",
        noNotifications: "There are no notifications in this category.",
        previous: "Previous",
        next: "Next",
        dismiss: "Dismiss notification",
        details: "Details",
        source: "Source",
        openRelatedScreen: "Open related screen",
        unreadSuffix: "unread",
        categories: {
            all: "All",
            operational: "Operations & accounting",
            code: "Code errors",
            product: "Product & setup",
        },
    },
};

export function getStatusNotificationCopy(locale: SupportedLocale): StatusNotificationCopy {
    return copy[locale];
}
