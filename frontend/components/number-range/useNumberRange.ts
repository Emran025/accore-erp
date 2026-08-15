"use client";

import { catalogMessage } from "@/lib/i18n";
import { useState, useEffect, useCallback } from "react";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { showAlert } from "@/components/ui";
import type { NrObjectFull, NrGroup, NrInterval } from "./types";

// ══════════════════════════════════════════════════════════════
//  Shared hook for Number Range data loading & CRUD operations
//  Used by all 5 NR pages to share state and logic.
// ══════════════════════════════════════════════════════════════

interface UseNumberRangeOptions {
    objectType: string;
    alertContainerId?: string;
}

export function useNumberRange({ objectType, alertContainerId = "nr-alert" }: UseNumberRangeOptions) {
    const [objectData, setObjectData] = useState<NrObjectFull | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const alert = (msg: string, type: "success" | "error" | "info" = "info") => {
        showAlert(alertContainerId, msg, type);
    };

    // ── Load Full Object Data ─────────────────────────────────
    const loadData = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await fetchAPI(API_ENDPOINTS.PLATFORM.NUMBER_RANGES.OBJECTS.byType(objectType));
            if (res.success && res.id) {
                setObjectData(res as unknown as NrObjectFull);
            } else {
                setObjectData(null);
            }
        } catch {
            setObjectData(null);
        } finally {
            setIsLoading(false);
        }
    }, [objectType]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // ── Object Setup ──────────────────────────────────────────
    const createObject = async (data: {
        name: string;
        name_en?: string;
        number_length: number;
        prefix?: string;
    }): Promise<boolean> => {
        try {
            const res = await fetchAPI(API_ENDPOINTS.PLATFORM.NUMBER_RANGES.OBJECTS.BASE, {
                method: "POST",
                body: JSON.stringify({
                    object_type: objectType,
                    ...data,
                }),
            });
            if (res.success) {
                alert(catalogMessage("text_85eabbc05825"), "success");
                await loadData();
                return true;
            }
            alert(res.message || catalogMessage("text_33807b6d3510"), "error");
            return false;
        } catch {
            alert(catalogMessage("text_1ac65f6d78f4"), "error");
            return false;
        }
    };

    // ── Group CRUD ─────────────────────────────────────────────
    const saveGroup = async (data: {
        code: string;
        name: string;
        name_en?: string;
        description?: string;
    }, editId?: number | null): Promise<boolean> => {
        if (!objectData) return false;
        try {
            const isEdit = editId != null;
            const url = isEdit
                ? API_ENDPOINTS.PLATFORM.NUMBER_RANGES.GROUPS.update(editId!)
                : API_ENDPOINTS.PLATFORM.NUMBER_RANGES.GROUPS.create(objectData.id);
            const method = isEdit ? "PUT" : "POST";

            const res = await fetchAPI(url, {
                method,
                body: JSON.stringify(data),
            });
            if (res.success) {
                alert(isEdit ? catalogMessage("text_9b163de55441") : catalogMessage("text_882db2502743"), "success");
                await loadData();
                return true;
            }
            alert(res.message || catalogMessage("text_b0dbba00004b"), "error");
            return false;
        } catch {
            alert(catalogMessage("text_1ac65f6d78f4"), "error");
            return false;
        }
    };

    const deleteGroup = async (id: number): Promise<boolean> => {
        try {
            const res = await fetchAPI(API_ENDPOINTS.PLATFORM.NUMBER_RANGES.GROUPS.delete(id), { method: "DELETE" });
            if (res.success) {
                alert(catalogMessage("text_5b9541617085"), "success");
                await loadData();
                return true;
            }
            alert(res.message || catalogMessage("text_f46bfc521612"), "error");
            return false;
        } catch {
            alert(catalogMessage("text_1ac65f6d78f4"), "error");
            return false;
        }
    };

    // ── Interval CRUD ─────────────────────────────────────────
    const saveInterval = async (data: {
        code: string;
        description?: string;
        from_number?: number;
        to_number?: number;
        is_external?: boolean;
    }, editId?: number | null): Promise<boolean> => {
        if (!objectData) return false;
        try {
            const isEdit = editId != null;
            const url = isEdit
                ? API_ENDPOINTS.PLATFORM.NUMBER_RANGES.INTERVALS.update(editId!)
                : API_ENDPOINTS.PLATFORM.NUMBER_RANGES.INTERVALS.create(objectData.id);
            const method = isEdit ? "PUT" : "POST";

            const res = await fetchAPI(url, {
                method,
                body: JSON.stringify(data),
            });
            if (res.success) {
                alert(isEdit ? catalogMessage("text_753fa01bea3d") : catalogMessage("text_87d7138539e4"), "success");
                await loadData();
                return true;
            }
            alert(res.message || catalogMessage("text_b0dbba00004b"), "error");
            return false;
        } catch {
            alert(catalogMessage("text_1ac65f6d78f4"), "error");
            return false;
        }
    };

    const deleteInterval = async (id: number): Promise<boolean> => {
        try {
            const res = await fetchAPI(API_ENDPOINTS.PLATFORM.NUMBER_RANGES.INTERVALS.delete(id), { method: "DELETE" });
            if (res.success) {
                alert(catalogMessage("text_c10ce32a7208"), "success");
                await loadData();
                return true;
            }
            alert(res.message || catalogMessage("text_f46bfc521612"), "error");
            return false;
        } catch {
            alert(catalogMessage("text_1ac65f6d78f4"), "error");
            return false;
        }
    };

    const expandInterval = async (intervalId: number, newTo: number, reason?: string): Promise<boolean> => {
        try {
            const res = await fetchAPI(API_ENDPOINTS.PLATFORM.NUMBER_RANGES.INTERVALS.expand(intervalId), {
                method: "POST",
                body: JSON.stringify({ new_to: newTo, reason: reason || null }),
            });
            if (res.success) {
                alert(catalogMessage("text_107f5ee706f8"), "success");
                await loadData();
                return true;
            }
            alert(res.message || catalogMessage("text_7875cc0d732c"), "error");
            return false;
        } catch {
            alert(catalogMessage("text_1ac65f6d78f4"), "error");
            return false;
        }
    };

    // ── Assignment CRUD ───────────────────────────────────────
    const saveAssignment = async (groupId: number, intervalId: number): Promise<boolean> => {
        if (!objectData) return false;
        try {
            const res = await fetchAPI(API_ENDPOINTS.PLATFORM.NUMBER_RANGES.ASSIGNMENTS.create(objectData.id), {
                method: "POST",
                body: JSON.stringify({
                    nr_group_id: groupId,
                    nr_interval_id: intervalId,
                }),
            });
            if (res.success) {
                alert(catalogMessage("text_7abf4fcd9dd0"), "success");
                await loadData();
                return true;
            }
            alert(res.message || catalogMessage("text_71819ae001d1"), "error");
            return false;
        } catch {
            alert(catalogMessage("text_1ac65f6d78f4"), "error");
            return false;
        }
    };

    const deleteAssignment = async (id: number): Promise<boolean> => {
        try {
            const res = await fetchAPI(API_ENDPOINTS.PLATFORM.NUMBER_RANGES.ASSIGNMENTS.delete(id), { method: "DELETE" });
            if (res.success) {
                alert(catalogMessage("text_9a5c62f88123"), "success");
                await loadData();
                return true;
            }
            alert(res.message || catalogMessage("text_f46bfc521612"), "error");
            return false;
        } catch {
            alert(catalogMessage("text_1ac65f6d78f4"), "error");
            return false;
        }
    };

    return {
        objectData,
        isLoading,
        loadData,
        createObject,
        saveGroup,
        deleteGroup,
        saveInterval,
        deleteInterval,
        expandInterval,
        saveAssignment,
        deleteAssignment,
    };
}
