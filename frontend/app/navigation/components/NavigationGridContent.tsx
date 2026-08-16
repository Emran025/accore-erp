"use client";

import { useI18n } from "@/lib/i18n";
import { useSearchParams, useRouter } from "next/navigation";
import { NavigationCard, NavigationGrid } from "@/components/navigation";
import { getNavigationGroup, isNavigationGroup, isNavigationLink } from "@/lib/navigation";
import { canAccess } from "@/lib/auth";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSetupStateStore } from "@/stores/useSetupStateStore";
import { Icon } from "@/lib/icons";
import { Button } from "@/components/ui";

interface NavigationGridContentProps {
    /** Explicit group ID to display. If omitted, derived from 'group' query param or current URL path. */
    groupId?: string;
}

export function NavigationGridContent({ groupId }: NavigationGridContentProps) {
    const { t: i18n } = useI18n();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { permissions } = useAuthStore();
    const { state: setupState } = useSetupStateStore();

    // 1. Determine the active group key
    // Priority: Prop > Query Param > Default fallback
    const rawGroup = groupId || searchParams.get("group") || "dashboard";

    // Normalize: remove trailing slash
    const activeGroup = rawGroup.endsWith("/") ? rawGroup.slice(0, -1) : rawGroup;

    const currentGroup = getNavigationGroup(activeGroup);
    const isLinkOperational = (module: string) =>
        Boolean(setupState?.active_module_keys.includes(module));
    const isItemVisible = (item: typeof currentGroup extends infer T ? T extends { items: (infer I)[] } ? I : never : never): boolean => {
        if (isNavigationGroup(item)) return item.items.some(isItemVisible);
        return isNavigationLink(item) && canAccess(permissions, item.module, "view") && isLinkOperational(item.module);
    };

    if (!currentGroup) {
        return (
            <div className="empty-state animate-fade" style={{ minHeight: '60vh' }}>
                <i className="text-primary">
                    <Icon name="search" size={48} />
                </i>
                <h3>{i18n.catalog["shared.navigationgridcontent.groupNotFound"]}</h3>
                <p>
                    {i18n.catalog["shared.navigationgridcontent.namedListGroupNotFound"]}<code>{activeGroup}</code>.
                    قد يكون الرابط خاطئاً أو تم نقل المحتوى.
                </p>
                <Button
                    variant="primary"
                    size="lg"
                    icon="home"
                    onClick={() => router.push('/navigation')}
                >
                    {i18n.catalog["shared.navigationgridcontent.returnMainMenu"]}</Button>
            </div>
        );
    }

    return (
        <NavigationGrid>
            {currentGroup.items.filter(isItemVisible).map((item) => {
                if (isNavigationGroup(item)) {
                    // Render a folder card
                    return (
                        <NavigationCard
                            key={item.key}
                            href={`/navigation?group=${item.key}`}
                            icon={item.icon}
                            label={item.label}
                            description={item.description}
                        />
                    );
                } else if (isNavigationLink(item)) {
                    if (!canAccess(permissions, item.module, "view") || !isLinkOperational(item.module)) return null;
                    return (
                        <NavigationCard
                            key={item.href + item.label}
                            href={item.href}
                            icon={item.icon}
                            label={item.label}
                            description={item.description}
                        />
                    );
                }
                return null;
            })}
        </NavigationGrid>
    );
}
