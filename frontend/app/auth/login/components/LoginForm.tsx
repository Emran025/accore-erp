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
            setError(i18n.catalog["text_37c5d56ab389"]);
            return;
        }

        try {
            const result = await onSubmit(username, password);
            if (!result.success) {
                setError(result.error || i18n.catalog["text_48aee85d50a3"]);
            }
        } catch {
            setError(i18n.catalog["text_5e224aae1f83"]);
        }
    };

    return (
        <div className="login-card animate-slide-up">
            <Image
                src="/logo.svg"
                alt={i18n.catalog["text_d707dc2f1936"]}
                width={80}
                height={80}
                style={{ margin: "0 auto 1.5rem", display: "block" }}
                priority
            />

            <h1>{i18n.catalog["text_015f1beb39b7"]}</h1>

            {error && <Alert type="error" message={error} />}

            <form onSubmit={handleSubmit} className="space-y-4">
                <TextInput
                    id="username"
                    label={i18n.catalog["text_06668ac85e3d"]}
                    value={username}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                    placeholder={i18n.catalog["text_f0d5db5ca340"]}
                    autoComplete="username"
                    disabled={isLoading}
                    icon="user"
                />

                <PasswordInput
                    id="password"
                    label={i18n.catalog["text_b05d306b5591"]}
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    placeholder={i18n.catalog["text_fcd318aaae5d"]}
                    autoComplete="current-password"
                    disabled={isLoading}
                />

                <Button
                    type="submit"
                    variant="primary"
                    style={{ width: "100%", marginTop: "1rem" }}
                    isLoading={isLoading}
                >
                    {i18n.catalog["text_beb869eecc12"]}</Button>
            </form>
        </div>
    );
}
