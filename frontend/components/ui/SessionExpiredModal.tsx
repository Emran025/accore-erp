"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { LoginForm } from "@/app/auth/login/components/LoginForm";
import { getAllNavigationLinks } from "@/lib/navigation";
import { createPortal } from "react-dom";
import { Alert } from "@/components/ui/Alert";

export function SessionExpiredModal() {
    const { sessionExpired, login, canAccess, setSessionExpired } = useAuthStore();
    const [mounted, setMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!sessionExpired || !mounted || pathname === '/auth/login') return null;

    const handleLogin = async (username: string, password: string) => {
        setIsLoading(true);
        try {
            const result = await login(username, password);
            if (result.success) {
                // Verify if user still has permissions to be on the current page
                const links = getAllNavigationLinks();
                const currentLink = links.find(l => pathname === l.href || pathname.startsWith(l.href + '/'));

                if (currentLink && canAccess(currentLink.module, 'view')) {
                    // Valid, just close modal and stay here
                    setSessionExpired(false);
                } else if (canAccess('dashboard', 'view')) {
                    // Send to control panel
                    setSessionExpired(false);
                    router.push("/01-enterprise-core/system-overview/dashboard/global-dashboard");
                } else {
                    // Kick to login page completely
                    setSessionExpired(false);
                    router.push("/auth/login");
                }
            }
            return result;
        } catch {
            return { success: false, error: "حدث خطأ في الاتصال بالخادم" };
        } finally {
            setIsLoading(false);
        }
    };

    return createPortal(
        <div className="dialog-overlay active" style={{ zIndex: 99999 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', width: '100%', maxWidth: '420px' }}>
                <Alert type="warning" message="إنتهت الجلسة، يرجى تسجيل الدخول مرة أخرى" />
                <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
            </div>
        </div>,
        document.body
    );
}
