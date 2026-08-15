"use client";

import { catalogMessage } from "@/lib/i18n";

interface EnvironmentIndicatorProps {
    env?: string;
}

export function EnvironmentIndicator({
    env = catalogMessage("components.environmentindicator.testEnvironment"),
}: EnvironmentIndicatorProps) {
    return (
        <div className="status-notification-right">
            <span className="status-notification-env">{env}</span>
        </div>
    );
}
