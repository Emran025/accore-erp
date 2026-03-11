"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";
import { LoginForm } from "../components/LoginForm";

export default function LoginPage() {
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
            return { success: false, error: "حدث خطأ في الاتصال بالخادم" };
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
