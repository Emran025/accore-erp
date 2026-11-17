import { afterEach, describe, expect, it, vi } from "vitest";

vi.unmock("@/lib/api");

vi.mock("@/lib/i18n", () => ({
    catalogMessage: (key: string, values?: Record<string, unknown>) => values ? `${key}:${Object.values(values).join(":")}` : key,
    getActiveLocale: () => "en-US",
}));

import { createApiRequestHeaders, fetchAPI } from "@/lib/api";

describe("API locale propagation", () => {
    it("sends the selected application locale through standard and explicit request headers", () => {
        expect(createApiRequestHeaders()).toMatchObject({
            "Accept-Language": "en-US",
            "X-Accore-Locale": "en-US",
        });
    });

    it("lets the browser supply a multipart boundary for media uploads", () => {
        const headers = createApiRequestHeaders({ body: new FormData() });

        expect(headers).not.toHaveProperty("Content-Type");
        expect(headers).toMatchObject({
            "Accept-Language": "en-US",
            "X-Accore-Locale": "en-US",
        });
    });
});

describe("conditional-write conflict handling", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("preserves the HTTP status, stable conflict code, and current setup revision", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
            success: false,
            code: "setup_state_conflict",
            message: "Setup state changed.",
            current_revision: 4,
            reload_required: true,
        }), { status: 409, headers: { "Content-Type": "application/json" } })));

        const response = await fetchAPI("/v2/setup/modules", { method: "POST", body: "{}" });

        expect(response).toMatchObject({
            success: false,
            httpStatus: 409,
            code: "setup_state_conflict",
            current_revision: 4,
            message: "Setup state changed.",
        });
    });
});
