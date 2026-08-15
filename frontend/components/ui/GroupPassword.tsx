"use client";

import { useI18n } from "@/lib/i18n";
import { PasswordInput } from "./PasswordInput";

interface PasswordGroupProps {
    passwordValue: string;
    onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    confirmValue: string;
    onConfirmChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    passwordError?: string;
    confirmError?: string;
}

export function GroupPassword({
    passwordValue,
    onPasswordChange,
    confirmValue,
    onConfirmChange,
    passwordError,
    confirmError
}: PasswordGroupProps) {
    const { t: i18n } = useI18n();
    
    // Auto-detect mismatch if confirm has value
    const mismatch = confirmValue && passwordValue !== confirmValue ? i18n.catalog["ui.grouppassword.passwordsDoNotMatch"] : null;
    const finalConfirmError = confirmError || mismatch;

    return (
        <div className="space-y-4">
            <PasswordInput
                id="password"
                label={i18n.catalog["common.general.password"]}
                value={passwordValue}
                onChange={onPasswordChange}
                error={passwordError}
                autoComplete="new-password"
            />
            <PasswordInput
                id="confirm_password"
                label={i18n.catalog["common.general.confirmPassword"]}
                value={confirmValue}
                onChange={onConfirmChange}
                error={finalConfirmError || undefined}
                autoComplete="new-password"
            />
        </div>
    );
}
