"use client";

import { useI18n } from "@/lib/i18n";
import { useState, useEffect } from "react";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { Dialog, Table, Column } from "@/components/ui";
import { getIcon } from "@/lib/icons";
import type { NrExpansionLog } from "../types";

interface ExpansionLogsPanelProps {
    intervalId: number;
    isOpen: boolean;
    onClose: () => void;
}

export function ExpansionLogsPanel({ intervalId, isOpen, onClose }: ExpansionLogsPanelProps) {
    const { t: i18n } = useI18n();
    const [logs, setLogs] = useState<NrExpansionLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isOpen) return;
        const load = async () => {
            setLoading(true);
            try {
                const res = await fetchAPI(API_ENDPOINTS.PLATFORM.NUMBER_RANGES.INTERVALS.expansionLogs(intervalId));
                if (res.success && res.data) {
                    setLogs(res.data as NrExpansionLog[]);
                }
            } catch {
                // silent
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [intervalId, isOpen]);

    const columns: Column<NrExpansionLog>[] = [
        {
            key: "date",
            header: i18n.catalog["text_d90c384199ac"],
            dataLabel: i18n.catalog["text_d90c384199ac"],
            render: (item) => (
                <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                    {new Date(item.created_at).toLocaleString("ar-SA")}
                </span>
            ),
        },
        {
            key: "old_range",
            header: i18n.catalog["text_e4b02636ba59"],
            dataLabel: i18n.catalog["text_bd3bfd287e07"],
            render: (item) => (
                <span style={{ fontFamily: "monospace", color: "var(--text-muted)" }}>
                    {item.old_from.toLocaleString()} → {item.old_to.toLocaleString()}
                </span>
            ),
        },
        {
            key: "new_range",
            header: i18n.catalog["text_e9666da3ca24"],
            dataLabel: i18n.catalog["text_0074bb8697b4"],
            render: (item) => (
                <span style={{ fontFamily: "monospace" }}>
                    {item.new_from.toLocaleString()} → <strong style={{ color: "#10b981" }}>{item.new_to.toLocaleString()}</strong>
                </span>
            ),
        },
        {
            key: "change",
            header: i18n.catalog["text_7d0abd7d46f9"],
            dataLabel: i18n.catalog["text_d54210fa2fd2"],
            render: (item) => (
                <span className="badge badge-success" style={{ fontFamily: "monospace" }}>
                    +{(item.new_to - item.old_to).toLocaleString()}
                </span>
            ),
        },
        {
            key: "reason",
            header: i18n.catalog["text_c3b023d78238"],
            dataLabel: i18n.catalog["text_c3b023d78238"],
            render: (item) => item.reason || <span style={{ color: "var(--text-muted)" }}>—</span>,
        },
        {
            key: "expanded_by",
            header: i18n.catalog["text_a98b66bae2c9"],
            dataLabel: i18n.catalog["text_a98b66bae2c9"],
            render: (item) => (
                <span style={{ fontSize: "0.82rem" }}>
                    {(item.expanded_by && typeof item.expanded_by === "object") ? item.expanded_by.name : "—"}
                </span>
            ),
        },
    ];

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title={i18n.catalog["text_dce729302741"]}
            maxWidth="900px"
        >
            <div className="nr-expansion-logs">
                <div className="nr-info-banner" style={{ marginBottom: "1rem" }}>
                    <span className="nr-info-icon">{getIcon("info")}</span>
                    <span>{i18n.catalog["text_a06512c16621"]}</span>
                </div>

                {loading ? (
                    <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                        {i18n.catalog["text_57a7598634ef"]}</div>
                ) : (
                    <Table
                        columns={columns}
                        data={logs}
                        keyExtractor={(item) => item.id}
                        emptyMessage={i18n.catalog["text_08c643ddae86"]}
                    />
                )}
            </div>
        </Dialog>
    );
}
