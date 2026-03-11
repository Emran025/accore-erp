"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import { Button, Alert } from "@/components/ui";
import { TextInput } from "@/components/ui/TextInput";
import { PasswordInput } from "@/components/ui/PasswordInput";

interface LoginFormProps {
    onSubmit: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
    isLoading: boolean;
}

export function LoginForm({ onSubmit, isLoading }: LoginFormProps) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!username.trim() || !password.trim()) {
            setError("يرجى إدخال اسم المستخدم وكلمة المرور");
            return;
        }

        try {
            const result = await onSubmit(username, password);
            if (!result.success) {
                setError(result.error || "فشل تسجيل الدخول");
            }
        } catch {
            setError("حدث خطأ في الاتصال بالخادم");
        }
    };

    return (
        <div className="login-card animate-slide-up">
            <Image
                src="/logo.svg"
                alt="Logo"
                width={80}
                height={80}
                style={{ margin: "0 auto 1.5rem", display: "block" }}
                priority
            />

            <h1>تسجيل الدخول إلى النظام</h1>

            {error && <Alert type="error" message={error} />}

            <form onSubmit={handleSubmit} className="space-y-4">
                <TextInput
                    id="username"
                    label="اسم المستخدم"
                    value={username}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                    placeholder="أدخل اسم المستخدم"
                    autoComplete="username"
                    disabled={isLoading}
                    icon="user"
                />

                <PasswordInput
                    id="password"
                    label="كلمة المرور"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور"
                    autoComplete="current-password"
                    disabled={isLoading}
                />

                <Button
                    type="submit"
                    variant="primary"
                    style={{ width: "100%", marginTop: "1rem" }}
                    isLoading={isLoading}
                >
                    تسجيل الدخول
                </Button>
            </form>
        </div>
    );
}
