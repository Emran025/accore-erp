"use client";

import { useI18n } from "@/lib/i18n";
import { useSearchParams, useRouter } from "next/navigation";
import { NavigationCard, NavigationGrid } from "@/components/navigation";
import { getNavigationGroup, isNavigationGroup, isNavigationLink } from "@/lib/navigation";
import { canAccess } from "@/lib/auth";
import { useAuthStore } from "@/stores/useAuthStore";
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

    // 1. Determine the active group key
    // Priority: Prop > Query Param > Default fallback
    const rawGroup = groupId || searchParams.get("group") || "dashboard";

    // Normalize: remove trailing slash
    const activeGroup = rawGroup.endsWith("/") ? rawGroup.slice(0, -1) : rawGroup;

    const currentGroup = getNavigationGroup(activeGroup);

    if (!currentGroup) {
        return (
            <div className="empty-state animate-fade" style={{ minHeight: '60vh' }}>
                <i className="text-primary">
                    <Icon name="search" size={48} />
                </i>
                <h3>{i18n.catalog["text_68c6a5645a71"]}</h3>
                <p>
                    {i18n.catalog["text_3cc6d1b3a312"]}<code>{activeGroup}</code>.
                    قد يكون الرابط خاطئاً أو تم نقل المحتوى.
                </p>
                <Button
                    variant="primary"
                    size="lg"
                    icon="home"
                    onClick={() => router.push('/navigation')}
                >
                    {i18n.catalog["text_0c2449c125b0"]}</Button>
            </div>
        );
    }

    return (
        <NavigationGrid>
            {currentGroup.items.map((item) => {
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
                    if (!canAccess(permissions, item.module, "view")) return null;
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
