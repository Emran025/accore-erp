"use client";

import { useSearchParams } from "next/navigation";
import { NavigationCard, NavigationGrid } from "@/components/navigation";
import { getNavigationGroup, isNavigationGroup, isNavigationLink } from "@/lib/navigation";
import { canAccess } from "@/lib/auth";
import { useAuthStore } from "@/stores/useAuthStore";

export function NavigationGridContent() {
    const searchParams = useSearchParams();
    const { permissions } = useAuthStore();

    // Read the active group from the query string, defaulting to "dashboard"
    const activeGroup = searchParams.get("group") || "dashboard";

    const currentGroup = getNavigationGroup(activeGroup);

    return (
        <NavigationGrid>
            {currentGroup && currentGroup.items.map((item) => {
                if (isNavigationGroup(item)) {
                    // Render a folder card
                    return (
                        <NavigationCard
                            key={item.key}
                            href={`/navigation?group=${item.key}`}
                            icon={item.icon}
                            label={item.label}
                            description="مجلد قوائم"
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
