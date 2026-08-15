"use client";

import { useI18n } from "@/lib/i18n";
import { Suspense } from "react";
import { MainLayout } from "@/components/layout";
import { NavigationGridContent } from "../navigation/components/NavigationGridContent";
import { getNavigationGroupFromPath } from "@/lib/navigation";
import { useParams, useRouter } from "next/navigation";
import { Icon } from "@/lib/icons";
import { Button } from "@/components/ui";

/**
 * Virtual Navigation Catch-all Page
 * ════════════════════════════════════
 * 
 * This page handles paths that do not have a dedicated screen (e.g. intermediate
 * directory folders like /02-commercial/sales-lifecycle). It automatically
 * resolves the path to a navigation group and displays it as a grid of cards,
 * providing the "virtual navigation" experience requested.
 */
export default function VirtualNavigationPage() {
    const { t: i18n } = useI18n();
    const params = useParams();
    const router = useRouter();
    const virtual = params?.virtual as string[] | undefined;
    // Attempt to resolve the path segments to a known navigation group
    const group = getNavigationGroupFromPath(virtual || []);

    return (
        <MainLayout>
            <Suspense fallback={
                <div style={{ textAlign: "center", padding: "5rem", color: "var(--text-secondary)" }} className="animate-fade">
                    <div className="btn-spinner" style={{ width: '40px', height: '40px', borderTopColor: 'var(--primary-color)' }}></div>
                    <div style={{ marginTop: '1rem', fontWeight: 600 }}>{i18n.catalog["common.general.loading"]}</div>
                </div>
            }>
                {group ? (
                    <NavigationGridContent groupId={group.key} />
                ) : (
                    <div className="empty-state animate-fade" style={{ minHeight: '70vh' }}>
                        <i className="text-danger">
                            <Icon name="x-octagon" size={64} />
                        </i>
                        <h3 className="text-danger">{i18n.catalog["shared.virtualnavigationclient.pageUnavailable"]}</h3>
                        <p>
                            {i18n.catalog["shared.virtualnavigationclient.path"]}<code>/{virtual?.join('/')}</code> {i18n.catalog["shared.virtualnavigationclient.currentlyNotLinkedAnyScreenMenuGroupPlease"]}</p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Button 
                                variant="outline" 
                                size="lg" 
                                icon="arrow-right" 
                                onClick={() => window.history.back()}
                            >
                                {i18n.catalog["shared.virtualnavigationclient.goBack"]}</Button>
                            <Button 
                                variant="primary" 
                                size="lg" 
                                icon="home" 
                                onClick={() => router.push('/navigation')}
                            >
                                {i18n.catalog["shared.virtualnavigationclient.mainMenu"]}</Button>
                        </div>
                    </div>
                )}
            </Suspense>
        </MainLayout>
    );
}
