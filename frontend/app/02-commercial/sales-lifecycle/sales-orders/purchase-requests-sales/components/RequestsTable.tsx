import { catalogMessage } from "@/lib/i18n";
import { Column, Table } from "@/components/ui";
import { canAccess, Permission } from "@/lib/auth";
import { Icon } from "@/lib/icons";
import { formatDate } from "@/lib/utils";
import { PurchaseRequest } from "@/types";
import React from "react";

interface RequestsTableProps {
    requests: PurchaseRequest[];
    isLoading: boolean;
    permissions: Permission[];
    onEditStatus: (req: PurchaseRequest, status: "approved" | "rejected" | "done") => void;
}

export const RequestsTable: React.FC<RequestsTableProps> = ({
    requests,
    isLoading,
    permissions,
    onEditStatus,
}) => {
    const columns: Column<PurchaseRequest>[] = [
        {
            key: "id",
            header: catalogMessage("text_9916d665a946"),
            dataLabel: catalogMessage("text_9916d665a946"),
            render: (item) => `#REQ-${item.id}`,
        },
        {
            key: "product_name",
            header: catalogMessage("text_a79e304d96a1"),
            dataLabel: catalogMessage("text_a79e304d96a1"),
            render: (item) => item.product?.name || item.product_name || "-",
        },
        {
            key: "quantity",
            header: catalogMessage("text_dad20b6f6d38"),
            dataLabel: catalogMessage("text_dad20b6f6d38"),
        },
        {
            key: "notes",
            header: catalogMessage("text_d446d2dc6b81"),
            dataLabel: catalogMessage("text_d446d2dc6b81"),
            render: (item) => item.notes || "-",
        },
        {
            key: "user",
            header: catalogMessage("text_a98b66bae2c9"),
            dataLabel: catalogMessage("text_a98b66bae2c9"),
            render: (item) => item.user?.name || "-",
        },
        {
            key: "created_at",
            header: catalogMessage("text_d90c384199ac"),
            dataLabel: catalogMessage("text_d90c384199ac"),
            render: (item) => formatDate(item.created_at),
        },
        {
            key: "status",
            header: catalogMessage("text_c3a4749caed4"),
            dataLabel: catalogMessage("text_c3a4749caed4"),
            render: (item) => {
                const statusMap: Record<string, { label: string; class: string }> = {
                    pending: { label: catalogMessage("text_7d7913fdef74"), class: "warning" },
                    approved: { label: catalogMessage("text_f5fde9cba1be"), class: "success" },
                    done: { label: catalogMessage("text_c2da5684d63b"), class: "info" },
                    rejected: { label: catalogMessage("text_5d969a71dad3"), class: "danger" },
                };
                const s = statusMap[item.status] || { label: item.status, class: "secondary" };
                return <span className={`status-badge ${s.class}`}>{s.label}</span>;
            },
        },
        {
            key: "actions",
            header: catalogMessage("text_7797240d6caf"),
            dataLabel: catalogMessage("text_7797240d6caf"),
            render: (item) => (
                <div className="action-buttons">
                    {canAccess(permissions, "purchases", "edit") && item.status === "pending" && (
                        <>
                            <button
                                className="icon-btn success"
                                onClick={() => onEditStatus(item, "approved")}
                                title={catalogMessage("text_a10ffa7be279")}
                            >
                                <Icon name="check" />
                            </button>
                            <button
                                className="icon-btn danger"
                                onClick={() => onEditStatus(item, "rejected")}
                                title={catalogMessage("text_2d6857dad9ed")}
                            >
                                <Icon name="x" />
                            </button>
                        </>
                    )}
                    {canAccess(permissions, "purchases", "edit") && item.status === "approved" && (
                        <button
                            className="btn btn-sm btn-primary"
                            onClick={() => onEditStatus(item, "done")}
                            title={catalogMessage("text_73fc3d97d72a")}
                        >
                            {catalogMessage("text_84fce1c770e4")}</button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <Table
            columns={columns}
            data={requests}
            keyExtractor={(it) => it.id}
            isLoading={isLoading}
            emptyMessage={catalogMessage("text_4cc4508a6b18")}
        />
    );
};
