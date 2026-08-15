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
            console.error(i18n.catalog["common.general.failedLoadData"]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedEmployeeId || !selectedPositionId) {
            showToast(i18n.catalog["humanCapital.employeeposition.pleaseSelectBothEmployeePosition"], "error");
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
            showToast(i18n.catalog["humanCapital.employeeposition.employeeAssignedPositionSuccessfullyRolePermissionsInherited"], "success");
            setShowAssign(false);
            setSelectedEmployeeId("");
            setSelectedPositionId("");
            loadData();
        } catch (e: any) {
            showToast(e?.message || i18n.catalog["humanCapital.employeeposition.failedAssignEmployee"], "error");
        }
    };

    const handleUnassign = async (employeeId: number) => {
        if (!confirm(i18n.catalog["humanCapital.employeeposition.areYouSureYouWantUnassignThisEmployee"])) return;
        try {
            await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.ADMINISTRATION.POSITIONS.UNASSIGN(employeeId), {
                method: "DELETE",
            });
            showToast(i18n.catalog["humanCapital.employeeposition.employeeUnassigned"], "success");
            loadData();
        } catch {
            showToast(i18n.catalog["humanCapital.employeeposition.failedUnassign"], "error");
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
            header: i18n.catalog["humanCapital.employeeposition.employeeCode"],
            dataLabel: i18n.catalog["common.general.code.alternative4"],
            render: (item) => (
                <span style={{ fontFamily: "monospace", fontWeight: 600 }}>{item.employee_code}</span>
            ),
        },
        { key: "full_name", header: i18n.catalog["common.general.employeeName"], dataLabel: i18n.catalog["common.general.name"] },
        {
            key: "department",
            header: i18n.catalog["common.general.section"],
            dataLabel: i18n.catalog["common.general.section"],
            render: (item) => <span>{item.department?.name_ar || i18n.catalog["common.general.unspecified"]}</span>,
        },
        {
            key: "position",
            header: i18n.catalog["common.general.position.alternative2"],
            dataLabel: i18n.catalog["common.general.position.alternative2"],
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
                    <span className="badge badge-warning">{i18n.catalog["humanCapital.employeeposition.unspecified"]}</span>
                ),
        },
        {
            key: "role",
            header: i18n.catalog["humanCapital.employeeposition.inheritedRole"],
            dataLabel: i18n.catalog["common.general.role.alternative2"],
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
            header: i18n.catalog["common.general.jobTitle.alternative3"],
            dataLabel: i18n.catalog["common.general.title.alternative2"],
            render: (item) => (
                <span>
                    {item.position?.job_title?.title_ar || item.job_title?.title_ar || "—"}
                </span>
            ),
        },
        {
            key: "id",
            header: i18n.catalog["common.general.actions"],
            dataLabel: i18n.catalog["common.general.actions"],
            render: (item) => (
                <ActionButtons
                    actions={[
                        ...(canAccess("employees", "edit") && !item.position_id
                            ? [
                                {
                                    icon: "link" as const,
                                    title: i18n.catalog["humanCapital.employeeposition.assignPosition"],
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
                                    title: i18n.catalog["humanCapital.employeeposition.unassign"],
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
                    {i18n.catalog["humanCapital.employeeposition.all"]}{employeesWithPositions.length})
                </button>
                <button
                    className={`btn btn-sm ${filter === "assigned" ? "btn-primary" : "btn-ghost"}`}
                    onClick={() => setFilter("assigned")}
                >
                    {getIcon("check-circle")} {i18n.catalog["humanCapital.employeeposition.assigned"]}{assignedCount})
                </button>
                <button
                    className={`btn btn-sm ${filter === "unassigned" ? "btn-primary" : "btn-ghost"}`}
                    onClick={() => setFilter("unassigned")}
                >
                    {getIcon("alert-circle")} {i18n.catalog["humanCapital.employeeposition.unassigned"]}{unassignedCount})
                </button>
            </div>

            <PageSubHeader
                title={i18n.catalog["humanCapital.employeeposition.assignEmployeesPositions"]}
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
                                {i18n.catalog["humanCapital.employeeposition.assignEmployeePosition"]}</Button>
                        )}
                    </>
                }
            />

            <Table
                columns={columns}
                data={filteredEmployees}
                keyExtractor={(i) => i.id.toString()}
                emptyMessage={i18n.catalog["common.general.noData"]}
                isLoading={isLoading}
            />

            {/* Assign Dialog */}
            <Dialog
                isOpen={showAssign}
                onClose={() => setShowAssign(false)}
                title={i18n.catalog["humanCapital.employeeposition.assignEmployeeJobPosition"]}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setShowAssign(false)}>
                            {i18n.catalog["common.general.cancel"]}</Button>
                        <Button
                            variant="primary"
                            icon="link"
                            onClick={handleAssign}
                            disabled={!selectedEmployeeId || !selectedPositionId}
                        >
                            {i18n.catalog["common.general.assign"]}</Button>
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
                            <strong>{i18n.catalog["humanCapital.employeeposition.automaticInheritance"]}</strong>
                            <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem" }}>
                                {i18n.catalog["humanCapital.employeeposition.whenEmployeeIsAssignedPositionSystemAutomatically"]}<br />{i18n.catalog["humanCapital.employeeposition.inheritance"]}<strong>{i18n.catalog["common.general.jobRole"]}</strong> {i18n.catalog["humanCapital.employeeposition.permissions"]}<br />{i18n.catalog["humanCapital.employeeposition.assign"]}<strong>{i18n.catalog["common.general.jobTitle.alternative3"]}</strong>
                                <br />{i18n.catalog["humanCapital.employeeposition.select"]}<strong>{i18n.catalog["common.general.section"]}</strong> {i18n.catalog["humanCapital.employeeposition.linkedPosition"]}</p>
                        </div>
                    </div>

                    <div className="form-group">
                        <Label>{i18n.catalog["humanCapital.employeeposition.selectEmployee"]}</Label>
                        <SearchableSelect
                            options={allEmployees
                                .filter((e: any) => !e.position_id)
                                .map((e: any) => ({
                                    value: e.id.toString(),
                                    label: catalogText(i18n, "common.general.message.alternative7", { value0: e.full_name, value1: e.employee_code }),
                                }))}
                            value={selectedEmployeeId}
                            onChange={(val) => setSelectedEmployeeId(val?.toString() || "")}
                            placeholder={i18n.catalog["humanCapital.employeeposition.searchUnassignedEmployee"]}
                        />
                    </div>

                    <div className="form-group">
                        <Label>{i18n.catalog["humanCapital.employeeposition.selectPosition"]}</Label>
                        <SearchableSelect
                            options={positions
                                .filter((p) => p.is_active)
                                .map((p) => ({
                                    value: p.id.toString(),
                                    label: catalogText(i18n, "common.general.message.alternative7", { value0: p.position_name_ar, value1: p.position_code }),
                                }))}
                            value={selectedPositionId}
                            onChange={(val) => setSelectedPositionId(val?.toString() || "")}
                            placeholder={i18n.catalog["humanCapital.employeeposition.searchPosition"]}
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
                                {getIcon("eye")} {i18n.catalog["humanCapital.employeeposition.previewSelectedPosition"]}</h4>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: "0.5rem",
                                    fontSize: "0.85rem",
                                }}
                            >
                                <div>
                                    <span className="stat-label">{i18n.catalog["common.general.jobTitle.alternative3"]}</span>
                                    <p>{selectedPosition.job_title?.title_ar || "—"}</p>
                                </div>
                                <div>
                                    <span className="stat-label">{i18n.catalog["common.general.jobRole"]}</span>
                                    <p>
                                        {selectedPosition.role ? (
                                            <span className="badge badge-info">
                                                {selectedPosition.role.role_name_ar || selectedPosition.role.role_key}
                                            </span>
                                        ) : (
                                            i18n.catalog["common.general.unspecified"]
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <span className="stat-label">{i18n.catalog["common.general.section"]}</span>
                                    <p>{selectedPosition.department?.name_ar || i18n.catalog["common.general.unspecified"]}</p>
                                </div>
                                <div>
                                    <span className="stat-label">{i18n.catalog["common.general.level"]}</span>
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
