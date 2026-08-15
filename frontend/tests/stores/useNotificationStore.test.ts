const getStore = async () => {
    vi.resetModules();
    const mod = await import("@/stores/useNotificationStore");
    return mod.useNotificationStore;
};

describe("useNotificationStore", () => {
    let useNotificationStore: Awaited<ReturnType<typeof getStore>>;

    beforeEach(async () => {
        useNotificationStore = await getStore();
        useNotificationStore.getState().clearAll();
    });

    it("stores the three supported notification categories", () => {
        const store = useNotificationStore.getState();
        store.addNotification({ category: "operational", message: "Posting requires review" });
        store.addNotification({ category: "code", severity: "error", message: "Cannot read property" });
        store.addNotification({ category: "product", message: "Low stock detected" });

        expect(useNotificationStore.getState().notifications.map((notification) => notification.category))
            .toEqual(["product", "code", "operational"]);
    });

    it("updates a matching active dedupe key instead of adding another row", () => {
        const store = useNotificationStore.getState();
        const firstId = store.addNotification({
            category: "product",
            message: "Two items are below minimum stock",
            dedupeKey: "low-stock",
        });
        const secondId = store.addNotification({
            category: "product",
            message: "Three items are below minimum stock",
            dedupeKey: "low-stock",
        });

        const notifications = useNotificationStore.getState().notifications;
        expect(secondId).toBe(firstId);
        expect(notifications).toHaveLength(1);
        expect(notifications[0].message).toBe("Three items are below minimum stock");
        expect(notifications[0].read).toBe(false);
    });

    it("supports manual selection, reading, dismissal, and category filtering state", () => {
        const store = useNotificationStore.getState();
        const firstId = store.addNotification({ category: "operational", message: "Period is approaching closure" });
        const secondId = store.addNotification({ category: "code", severity: "error", message: "Unhandled failure" });

        store.selectNotification(firstId);
        store.markNotificationRead(firstId);
        store.selectCategory("code");
        store.dismissNotification(secondId);

        const state = useNotificationStore.getState();
        expect(state.selectedNotificationId).toBe(firstId);
        expect(state.selectedCategory).toBe("code");
        expect(state.notifications.find((notification) => notification.id === firstId)?.read).toBe(true);
        expect(state.activeNotifications()).toHaveLength(1);
        expect(state.unreadCount()).toBe(0);
    });

    it("caps the retained history at one hundred notifications", () => {
        const store = useNotificationStore.getState();
        for (let index = 0; index < 110; index += 1) {
            store.addNotification({ category: "operational", message: `Operation ${index}` });
        }

        const notifications = useNotificationStore.getState().notifications;
        expect(notifications).toHaveLength(100);
        expect(notifications[0].message).toBe("Operation 109");
        expect(notifications[99].message).toBe("Operation 10");
    });
});
