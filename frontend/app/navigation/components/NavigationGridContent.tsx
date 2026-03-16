"use client";

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
                <div className="empty-state-icon-wrapper" style={{
                    background: 'var(--surface-white)',
                    padding: '2rem',
                    borderRadius: '50%',
                    boxShadow: 'var(--shadow-md)',
                    marginBottom: '2rem',
                    border: '1px solid var(--border-color)'
                }}>
                    <Icon name="search" size={48} className="text-primary" />
                </div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>المجموعة غير موجودة</h3>
                <p style={{ fontSize: '1.1rem', marginBottom: '2rem', maxWidth: '450px' }}>
                    لم يتم العثور على مجموعة القوائم المسماة <code>{activeGroup}</code>. 
                    قد يكون الرابط خاطئاً أو تم نقل المحتوى.
                </p>
                <Button 
                    variant="primary" 
                    size="lg" 
                    icon="home" 
                    onClick={() => router.push('/navigation')}
                >
                    العودة للقائمة الرئيسية
                </Button>
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
