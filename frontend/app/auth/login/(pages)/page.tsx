"use client";

import { useI18n } from "@/lib/i18n";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";
import { LoginForm } from "../components/LoginForm";
import { useOperatingContextStore } from "@/stores/useOperatingContextStore";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";

export default function LoginPage() {
    const { t: i18n } = useI18n();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (username: string, password: string) => {
        setIsLoading(true);
        try {
            const result = await login(username, password);
            if (result.success) {
                const [readiness, setupResponse] = await Promise.all([
                    useOperatingContextStore.getState().loadReadiness(),
                    fetchAPI<{ setup_required: boolean }>(API_ENDPOINTS.ENTERPRISE_CORE.SETUP.STATE),
                ]);
                const setupComplete = setupResponse.success && setupResponse.data?.setup_required === false;
                router.push(
                    readiness?.ready === true && setupComplete
                        ? "/01-enterprise-core/system-overview/dashboard/global-dashboard"
                        : "/setup"
                );
            }
            return result;
        } catch {
            return { success: false, error: i18n.catalog["common.general.serverConnectionError"] };
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
        </div>
    );
}
