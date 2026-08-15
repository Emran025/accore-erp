"use client";

import { useI18n } from "@/lib/i18n";
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
    const { t: i18n } = useI18n();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!username.trim() || !password.trim()) {
            setError(i18n.catalog["auth.login.pleaseEnterUsernamePassword"]);
            return;
        }

        try {
            const result = await onSubmit(username, password);
            if (!result.success) {
                setError(result.error || i18n.catalog["common.general.loginFailed"]);
            }
        } catch {
            setError(i18n.catalog["common.general.serverConnectionError"]);
        }
    };

    return (
        <div className="login-card animate-slide-up">
            <Image
                src="/logo.svg"
                alt={i18n.catalog["common.general.logo"]}
                width={80}
                height={80}
                style={{ margin: "0 auto 1.5rem", display: "block" }}
                priority
            />

            <h1>{i18n.catalog["auth.login.signSystem"]}</h1>

            {error && <Alert type="error" message={error} />}

            <form onSubmit={handleSubmit} className="space-y-4">
                <TextInput
                    id="username"
                    label={i18n.catalog["auth.login.username"]}
                    value={username}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                    placeholder={i18n.catalog["auth.login.enterUsername"]}
                    autoComplete="username"
                    disabled={isLoading}
                    icon="user"
                />

                <PasswordInput
                    id="password"
                    label={i18n.catalog["common.general.password"]}
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    placeholder={i18n.catalog["auth.login.enterPassword"]}
                    autoComplete="current-password"
                    disabled={isLoading}
                />

                <Button
                    type="submit"
                    variant="primary"
                    style={{ width: "100%", marginTop: "1rem" }}
                    isLoading={isLoading}
                >
                    {i18n.catalog["auth.login.log"]}</Button>
            </form>
        </div>
    );
}
