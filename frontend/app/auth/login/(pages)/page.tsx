"use client";

import { useI18n } from "@/lib/i18n";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";
import { LoginForm } from "../components/LoginForm";

export default function LoginPage() {
    const { t: i18n } = useI18n();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (username: string, password: string) => {
        setIsLoading(true);
        try {
            const result = await login(username, password);
            if (result.success) {
                router.push("/01-enterprise-core/system-overview/dashboard/global-dashboard");
            }
            return result;
        } catch {
            return { success: false, error: i18n.catalog["text_5e224aae1f83"] };
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
