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
            header: catalogMessage("common.general.orderNumber"),
            dataLabel: catalogMessage("common.general.orderNumber"),
            render: (item) => `#REQ-${item.id}`,
        },
        {
            key: "product_name",
            header: catalogMessage("common.general.product"),
            dataLabel: catalogMessage("common.general.product"),
            render: (item) => item.product?.name || item.product_name || "-",
        },
        {
            key: "quantity",
            header: catalogMessage("common.general.requiredQuantity"),
            dataLabel: catalogMessage("common.general.requiredQuantity"),
        },
        {
            key: "notes",
            header: catalogMessage("common.general.notes.alternative2"),
            dataLabel: catalogMessage("common.general.notes.alternative2"),
            render: (item) => item.notes || "-",
        },
        {
            key: "user",
            header: catalogMessage("common.general.notAvailable.alternative7"),
            dataLabel: catalogMessage("common.general.notAvailable.alternative7"),
            render: (item) => item.user?.name || "-",
        },
        {
            key: "created_at",
            header: catalogMessage("common.general.date.alternative7"),
            dataLabel: catalogMessage("common.general.date.alternative7"),
            render: (item) => formatDate(item.created_at),
        },
        {
            key: "status",
            header: catalogMessage("common.general.status.alternative2"),
            dataLabel: catalogMessage("common.general.status.alternative2"),
            render: (item) => {
                const statusMap: Record<string, { label: string; class: string }> = {
                    pending: { label: catalogMessage("common.general.pending.alternative2"), class: "warning" },
                    approved: { label: catalogMessage("common.general.accepted"), class: "success" },
                    done: { label: catalogMessage("common.general.completed"), class: "info" },
                    rejected: { label: catalogMessage("common.general.rejected"), class: "danger" },
                };
                const s = statusMap[item.status] || { label: item.status, class: "secondary" };
                return <span className={`status-badge ${s.class}`}>{s.label}</span>;
            },
        },
        {
            key: "actions",
            header: catalogMessage("common.general.actions"),
            dataLabel: catalogMessage("common.general.actions"),
            render: (item) => (
                <div className="action-buttons">
                    {canAccess(permissions, "purchases", "edit") && item.status === "pending" && (
                        <>
                            <button
                                className="icon-btn success"
                                onClick={() => onEditStatus(item, "approved")}
                                title={catalogMessage("commercial.requeststable.approveRequest")}
                            >
                                <Icon name="check" />
                            </button>
                            <button
                                className="icon-btn danger"
                                onClick={() => onEditStatus(item, "rejected")}
                                title={catalogMessage("commercial.requeststable.orderRejected")}
                            >
                                <Icon name="x" />
                            </button>
                        </>
                    )}
                    {canAccess(permissions, "purchases", "edit") && item.status === "approved" && (
                        <button
                            className="btn btn-sm btn-primary"
                            onClick={() => onEditStatus(item, "done")}
                            title={catalogMessage("commercial.requeststable.educationCompleted")}
                        >
                            {catalogMessage("commercial.requeststable.confirmExecution")}</button>
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
            emptyMessage={catalogMessage("commercial.requeststable.noMatchingPurchaseOrders")}
        />
    );
};
