"use client";

import { useI18n, catalogText } from "@/lib/i18n";
import { Position } from "@/types";
import { PageSubHeader } from "@/components/layout";
import { ActionButtons, Button, Column, Dialog, SearchableSelect, showToast, Table } from "@/components/ui";
import { Label } from "@/components/ui/Label";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { getIcon } from "@/lib/icons";
import { useAuthStore } from "@/stores/useAuthStore";
import { useEmployeeStore } from "@/stores/useEmployeeStore";
import { useEffect, useState } from "react";

interface EmployeeWithPosition {
    id: number;
    employee_code: string;
    full_name: string;
    department?: { name_ar: string };
    position_id?: number;
    position?: Position;
    role?: { role_name_ar: string; role_key: string };
    job_title?: { title_ar: string };
}

export function EmployeePositionTab() {
    const { t: i18n } = useI18n();
    const { canAccess } = useAuthStore();
    const { allEmployees, loadAllEmployees } = useEmployeeStore();
    const [positions, setPositions] = useState<Position[]>([]);
    const [showAssign, setShowAssign] = useState(false);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
    const [selectedPositionId, setSelectedPositionId] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [employeesWithPositions, setEmployeesWithPositions] = useState<EmployeeWithPosition[]>([]);
    const [filter, setFilter] = useState<"all" | "assigned" | "unassigned">("all");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            await loadAllEmployees();
            const posRes = await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.ADMINISTRATION.POSITIONS.BASE);
            setPositions((posRes as any).data || []);

            // Load employees with position details
            const empRes = await fetchAPI(
                `${API_ENDPOINTS.HUMAN_CAPITAL.EMPLOYEES.BASE}?per_page=999&with_position=1`
            );
            const empData = (empRes as any).data || (empRes as any).employees || [];
            setEmployeesWithPositions(empData);
        } catch {
            console.error(i18n.catalog["text_afa69443bb93"]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedEmployeeId || !selectedPositionId) {
            showToast(i18n.catalog["text_bd9102761c00"], "error");
            return;
        }
        try {
            await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.ADMINISTRATION.POSITIONS.ASSIGN, {
                method: "POST",
                body: JSON.stringify({
                    employee_id: Number(selectedEmployeeId),
                    position_id: Number(selectedPositionId),
                }),
            });
            showToast(i18n.catalog["text_379dde10a8f5"], "success");
            setShowAssign(false);
            setSelectedEmployeeId("");
            setSelectedPositionId("");
            loadData();
        } catch (e: any) {
            showToast(e?.message || i18n.catalog["text_cb7fc15b04df"], "error");
        }
    };

    const handleUnassign = async (employeeId: number) => {
        if (!confirm(i18n.catalog["text_b4acff89b80f"])) return;
        try {
            await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.ADMINISTRATION.POSITIONS.UNASSIGN(employeeId), {
                method: "DELETE",
            });
            showToast(i18n.catalog["text_98c956850b7a"], "success");
            loadData();
        } catch {
            showToast(i18n.catalog["text_b9c13cce8559"], "error");
        }
    };

    // Filter employees
    const filteredEmployees = employeesWithPositions.filter((emp) => {
        if (filter === "assigned") return !!emp.position_id;
        if (filter === "unassigned") return !emp.position_id;
        return true;
    });

    const assignedCount = employeesWithPositions.filter((e) => e.position_id).length;
    const unassignedCount = employeesWithPositions.filter((e) => !e.position_id).length;

    // Get selected position details for the preview
    const selectedPosition = positions.find((p) => p.id.toString() === selectedPositionId);

    const columns: Column<EmployeeWithPosition>[] = [
        {
            key: "employee_code",
            header: i18n.catalog["text_5a5681b59ed0"],
            dataLabel: i18n.catalog["text_e28ef005ab68"],
            render: (item) => (
                <span style={{ fontFamily: "monospace", fontWeight: 600 }}>{item.employee_code}</span>
            ),
        },
        { key: "full_name", header: i18n.catalog["text_394f067f92ff"], dataLabel: i18n.catalog["text_52ab09847cf8"] },
        {
            key: "department",
            header: i18n.catalog["text_0771c3ff9336"],
            dataLabel: i18n.catalog["text_0771c3ff9336"],
            render: (item) => <span>{item.department?.name_ar || i18n.catalog["text_5a0374f3ff5a"]}</span>,
        },
        {
            key: "position",
            header: i18n.catalog["text_66e3bc906d4b"],
            dataLabel: i18n.catalog["text_66e3bc906d4b"],
            render: (item) =>
                item.position ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                        <span className="badge badge-info" style={{ fontSize: "0.8rem" }}>
                            {item.position.position_name_ar}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            {item.position.position_code}
                        </span>
                    </div>
                ) : (
                    <span className="badge badge-warning">{i18n.catalog["text_3eed0035cf5d"]}</span>
                ),
        },
        {
            key: "role",
            header: i18n.catalog["text_9897db2426d7"],
            dataLabel: i18n.catalog["text_de69d94fee12"],
            render: (item) =>
                item.position?.role ? (
                    <span className="badge badge-success" style={{ fontSize: "0.8rem" }}>
                        {item.position.role.role_name_ar || item.position.role.role_key}
                    </span>
                ) : item.role ? (
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        {item.role.role_name_ar || item.role.role_key}
                    </span>
                ) : (
                    <span className="text-muted">—</span>
                ),
        },
        {
            key: "job_title",
            header: i18n.catalog["text_de98bd734462"],
            dataLabel: i18n.catalog["text_39adfb54212e"],
            render: (item) => (
                <span>
                    {item.position?.job_title?.title_ar || item.job_title?.title_ar || "—"}
                </span>
            ),
        },
        {
            key: "id",
            header: i18n.catalog["text_7797240d6caf"],
            dataLabel: i18n.catalog["text_7797240d6caf"],
            render: (item) => (
                <ActionButtons
                    actions={[
                        ...(canAccess("employees", "edit") && !item.position_id
                            ? [
                                {
                                    icon: "link" as const,
                                    title: i18n.catalog["text_63ede7f49d05"],
                                    variant: "view" as const,
                                    onClick: () => {
                                        setSelectedEmployeeId(item.id.toString());
                                        setSelectedPositionId("");
                                        setShowAssign(true);
                                    },
                                },
                            ]
                            : []),
                        ...(canAccess("employees", "edit") && item.position_id
                            ? [
                                {
                                    icon: "unlink" as const,
                                    title: i18n.catalog["text_422b5ac73e82"],
                                    variant: "delete" as const,
                                    onClick: () => handleUnassign(item.id),
                                },
                            ]
                            : []),
                    ]}
                />
            ),
        },
    ];

    return (
        <>
            {/* Filter Tabs */}
            <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                <button
                    className={`btn btn-sm ${filter === "all" ? "btn-primary" : "btn-ghost"}`}
                    onClick={() => setFilter("all")}
                >
                    {i18n.catalog["text_62ea41744d9a"]}{employeesWithPositions.length})
                </button>
                <button
                    className={`btn btn-sm ${filter === "assigned" ? "btn-primary" : "btn-ghost"}`}
                    onClick={() => setFilter("assigned")}
                >
                    {getIcon("check-circle")} {i18n.catalog["text_90ece19ba0f2"]}{assignedCount})
                </button>
                <button
                    className={`btn btn-sm ${filter === "unassigned" ? "btn-primary" : "btn-ghost"}`}
                    onClick={() => setFilter("unassigned")}
                >
                    {getIcon("alert-circle")} {i18n.catalog["text_093e986c5c2f"]}{unassignedCount})
                </button>
            </div>

            <PageSubHeader
                title={i18n.catalog["text_d0663c8fd54e"]}
                titleIcon="users"
                actions={
                    <>
                        {canAccess("employees", "edit") && (
                            <Button
                                variant="primary"
                                icon="link"
                                onClick={() => {
                                    setSelectedEmployeeId("");
                                    setSelectedPositionId("");
                                    setShowAssign(true);
                                }}
                            >
                                {i18n.catalog["text_e102619f95e1"]}</Button>
                        )}
                    </>
                }
            />

            <Table
                columns={columns}
                data={filteredEmployees}
                keyExtractor={(i) => i.id.toString()}
                emptyMessage={i18n.catalog["text_d812e8bbc06f"]}
                isLoading={isLoading}
            />

            {/* Assign Dialog */}
            <Dialog
                isOpen={showAssign}
                onClose={() => setShowAssign(false)}
                title={i18n.catalog["text_2deab183607f"]}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setShowAssign(false)}>
                            {i18n.catalog["text_9a30dc2a96b8"]}</Button>
                        <Button
                            variant="primary"
                            icon="link"
                            onClick={handleAssign}
                            disabled={!selectedEmployeeId || !selectedPositionId}
                        >
                            {i18n.catalog["text_961e2be91215"]}</Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div
                        className="alert alert-info"
                        style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}
                    >
                        {getIcon("info")}
                        <div>
                            <strong>{i18n.catalog["text_d1a63c173a87"]}</strong>
                            <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem" }}>
                                {i18n.catalog["text_0867526593b4"]}<br />{i18n.catalog["text_9ec4bbc51c0e"]}<strong>{i18n.catalog["text_5e7dccdb4d93"]}</strong> {i18n.catalog["text_fdf3a627b72b"]}<br />{i18n.catalog["text_037be498aa84"]}<strong>{i18n.catalog["text_de98bd734462"]}</strong>
                                <br />{i18n.catalog["text_b25d21702c28"]}<strong>{i18n.catalog["text_0771c3ff9336"]}</strong> {i18n.catalog["text_7899041f6538"]}</p>
                        </div>
                    </div>

                    <div className="form-group">
                        <Label>{i18n.catalog["text_3d8e9985377a"]}</Label>
                        <SearchableSelect
                            options={allEmployees
                                .filter((e: any) => !e.position_id)
                                .map((e: any) => ({
                                    value: e.id.toString(),
                                    label: catalogText(i18n, "text_e11f55b693d8", { value0: e.full_name, value1: e.employee_code }),
                                }))}
                            value={selectedEmployeeId}
                            onChange={(val) => setSelectedEmployeeId(val?.toString() || "")}
                            placeholder={i18n.catalog["text_73eecad18c9a"]}
                        />
                    </div>

                    <div className="form-group">
                        <Label>{i18n.catalog["text_070481f5ecc8"]}</Label>
                        <SearchableSelect
                            options={positions
                                .filter((p) => p.is_active)
                                .map((p) => ({
                                    value: p.id.toString(),
                                    label: catalogText(i18n, "text_e11f55b693d8", { value0: p.position_name_ar, value1: p.position_code }),
                                }))}
                            value={selectedPositionId}
                            onChange={(val) => setSelectedPositionId(val?.toString() || "")}
                            placeholder={i18n.catalog["text_fe9d5c934e37"]}
                        />
                    </div>

                    {/* Position Preview */}
                    {selectedPosition && (
                        <div
                            className="sales-card"
                            style={{
                                padding: "1rem",
                                border: "1px solid var(--primary-light)",
                                borderRadius: "var(--border-radius)",
                            }}
                        >
                            <h4
                                style={{
                                    fontSize: "0.9rem",
                                    marginBottom: "0.75rem",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    color: "var(--primary)",
                                }}
                            >
                                {getIcon("eye")} {i18n.catalog["text_52c9ede74573"]}</h4>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: "0.5rem",
                                    fontSize: "0.85rem",
                                }}
                            >
                                <div>
                                    <span className="stat-label">{i18n.catalog["text_de98bd734462"]}</span>
                                    <p>{selectedPosition.job_title?.title_ar || "—"}</p>
                                </div>
                                <div>
                                    <span className="stat-label">{i18n.catalog["text_5e7dccdb4d93"]}</span>
                                    <p>
                                        {selectedPosition.role ? (
                                            <span className="badge badge-info">
                                                {selectedPosition.role.role_name_ar || selectedPosition.role.role_key}
                                            </span>
                                        ) : (
                                            i18n.catalog["text_5a0374f3ff5a"]
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <span className="stat-label">{i18n.catalog["text_0771c3ff9336"]}</span>
                                    <p>{selectedPosition.department?.name_ar || i18n.catalog["text_5a0374f3ff5a"]}</p>
                                </div>
                                <div>
                                    <span className="stat-label">{i18n.catalog["text_961a0a03b98b"]}</span>
                                    <p>{selectedPosition.grade_level || "—"}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Dialog>
        </>
    );
}
