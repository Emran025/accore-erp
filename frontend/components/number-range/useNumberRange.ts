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
                alert(catalogMessage("common.general.numberingSettingsCreatedSuccessfully"), "success");
                await loadData();
                return true;
            }
            alert(res.message || catalogMessage("common.general.creationFailed"), "error");
            return false;
        } catch {
            alert(catalogMessage("common.general.connectionError"), "error");
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
                alert(isEdit ? catalogMessage("common.general.groupUpdated") : catalogMessage("common.general.groupCreated"), "success");
                await loadData();
                return true;
            }
            alert(res.message || catalogMessage("common.general.failedSave"), "error");
            return false;
        } catch {
            alert(catalogMessage("common.general.connectionError"), "error");
            return false;
        }
    };

    const deleteGroup = async (id: number): Promise<boolean> => {
        try {
            const res = await fetchAPI(API_ENDPOINTS.PLATFORM.NUMBER_RANGES.GROUPS.delete(id), { method: "DELETE" });
            if (res.success) {
                alert(catalogMessage("numberRange.usenumberrange.groupDeleted"), "success");
                await loadData();
                return true;
            }
            alert(res.message || catalogMessage("common.general.deletionFailed"), "error");
            return false;
        } catch {
            alert(catalogMessage("common.general.connectionError"), "error");
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
                alert(isEdit ? catalogMessage("common.general.rangeUpdated") : catalogMessage("common.general.rangeCreated"), "success");
                await loadData();
                return true;
            }
            alert(res.message || catalogMessage("common.general.failedSave"), "error");
            return false;
        } catch {
            alert(catalogMessage("common.general.connectionError"), "error");
            return false;
        }
    };

    const deleteInterval = async (id: number): Promise<boolean> => {
        try {
            const res = await fetchAPI(API_ENDPOINTS.PLATFORM.NUMBER_RANGES.INTERVALS.delete(id), { method: "DELETE" });
            if (res.success) {
                alert(catalogMessage("numberRange.usenumberrange.scopeDeleted"), "success");
                await loadData();
                return true;
            }
            alert(res.message || catalogMessage("common.general.deletionFailed"), "error");
            return false;
        } catch {
            alert(catalogMessage("common.general.connectionError"), "error");
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
                alert(catalogMessage("common.general.scopeExpandedSuccessfully"), "success");
                await loadData();
                return true;
            }
            alert(res.message || catalogMessage("common.general.failedExpand"), "error");
            return false;
        } catch {
            alert(catalogMessage("common.general.connectionError"), "error");
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
                alert(catalogMessage("common.general.linkedSuccessfully"), "success");
                await loadData();
                return true;
            }
            alert(res.message || catalogMessage("common.general.linkFailed"), "error");
            return false;
        } catch {
            alert(catalogMessage("common.general.connectionError"), "error");
            return false;
        }
    };

    const deleteAssignment = async (id: number): Promise<boolean> => {
        try {
            const res = await fetchAPI(API_ENDPOINTS.PLATFORM.NUMBER_RANGES.ASSIGNMENTS.delete(id), { method: "DELETE" });
            if (res.success) {
                alert(catalogMessage("numberRange.usenumberrange.linkDeleted"), "success");
                await loadData();
                return true;
            }
            alert(res.message || catalogMessage("common.general.deletionFailed"), "error");
            return false;
        } catch {
            alert(catalogMessage("common.general.connectionError"), "error");
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
