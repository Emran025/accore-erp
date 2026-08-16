import type { AppDictionary } from "@/lib/i18n";
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

export function getStatusNotificationCopy(dictionary: AppDictionary): StatusNotificationCopy {
    return {
        ready: dictionary.catalog["components.statusNotificationBar.ready"],
        centerTitle: dictionary.catalog["components.statusNotificationBar.centerTitle"],
        openCenter: dictionary.catalog["components.statusNotificationBar.openCenter"],
        closeCenter: dictionary.catalog["components.statusNotificationBar.closeCenter"],
        markAllRead: dictionary.catalog["components.statusNotificationBar.markAllRead"],
        clearDismissed: dictionary.catalog["components.statusNotificationBar.clearDismissed"],
        noNotifications: dictionary.catalog["components.statusNotificationBar.noNotifications"],
        previous: dictionary.catalog["common.general.previous"],
        next: dictionary.catalog["common.general.next"],
        dismiss: dictionary.catalog["components.statusNotificationBar.dismiss"],
        details: dictionary.catalog["common.general.details"],
        source: dictionary.catalog["common.general.source"],
        openRelatedScreen: dictionary.catalog["components.statusNotificationBar.openRelatedScreen"],
        unreadSuffix: dictionary.catalog["components.statusNotificationBar.unreadSuffix"],
        categories: {
            all: dictionary.catalog["common.general.all"],
            operational: dictionary.catalog["components.statusNotificationBar.categoryOperational"],
            code: dictionary.catalog["components.statusNotificationBar.categoryCode"],
            product: dictionary.catalog["components.statusNotificationBar.categoryProduct"],
        },
    };
}
