"use client";

import { useI18n, catalogText } from "@/lib/i18n";
import { JobTitle, Position } from "@/types";
import { PageSubHeader } from "@/components/layout";
import { ActionButtons, Button, Column, Dialog, Label, SearchableSelect, Select, showToast, Table } from "@/components/ui";
import { StatsCard } from "@/components/ui/StatsCard";
import { TextInput } from "@/components/ui/TextInput";
import { Textarea } from "@/components/ui/Textarea";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { getIcon } from "@/lib/icons";
import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect, useState } from "react";

interface PositionForm {
    position_name_ar: string;
    position_name_en: string;
    job_title_id: string;
    role_id: string;
    department_id: string;
    grade_level: string;
    min_salary: string;
    max_salary: string;
    description: string;
}

const emptyForm: PositionForm = {
    position_name_ar: "",
    position_name_en: "",
    job_title_id: "",
    role_id: "",
    department_id: "",
    grade_level: "",
    min_salary: "",
    max_salary: "",
    description: "",
};

export function PositionsTab() {
    const { t: i18n } = useI18n();
    const { canAccess } = useAuthStore();
    const [positions, setPositions] = useState<Position[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showDialog, setShowDialog] = useState(false);
    const [editItem, setEditItem] = useState<Position | null>(null);
    const [detailItem, setDetailItem] = useState<Position | null>(null);
    const [showDetail, setShowDetail] = useState(false);
    const [form, setForm] = useState<PositionForm>(emptyForm);

    // Lookups
    const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
    const [roles, setRoles] = useState<Array<{ id: number; role_name_ar: string; role_key: string }>>([]);
    const [departments, setDepartments] = useState<Array<{ id: number; name_ar: string }>>([]);

    useEffect(() => {
        loadPositions();
        loadLookups();
    }, []);

    const loadPositions = async () => {
        setIsLoading(true);
        try {
            const res = await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.ADMINISTRATION.POSITIONS.BASE);
            setPositions((res as any).data || []);
        } catch {
            console.error(i18n.catalog["humanCapital.positions.failedLoadPositions"]);
        } finally {
            setIsLoading(false);
        }
    };

    const loadLookups = async () => {
        try {
            const [jtRes, roleRes, deptRes] = await Promise.all([
                fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.ADMINISTRATION.JOB_TITLES.BASE),
                fetchAPI(`${API_ENDPOINTS.ENTERPRISE_CORE.IAM.USERS.ROLES}?action=roles`),
                fetchAPI("/departments"),
            ]);
            setJobTitles((jtRes as any).data || []);
            setRoles((roleRes as any).data || []);
            setDepartments((deptRes as any).data || (deptRes as any) || []);
        } catch {
            console.error(i18n.catalog["humanCapital.positions.failedLoadLookups"]);
        }
    };

    const handleSave = async () => {
        if (!form.position_name_ar) {
            showToast(i18n.catalog["humanCapital.positions.pleaseEnterPositionName"], "error");
            return;
        }
        if (!form.job_title_id) {
            showToast(i18n.catalog["humanCapital.positions.pleaseSelectJobTitle"], "error");
            return;
        }

        try {
            const payload = {
                position_name_ar: form.position_name_ar,
                position_name_en: form.position_name_en || null,
                job_title_id: Number(form.job_title_id),
                role_id: form.role_id ? Number(form.role_id) : null,
                department_id: form.department_id ? Number(form.department_id) : null,
                grade_level: form.grade_level || null,
                min_salary: form.min_salary ? Number(form.min_salary) : null,
                max_salary: form.max_salary ? Number(form.max_salary) : null,
                description: form.description || null,
            };

            if (editItem) {
                await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.ADMINISTRATION.POSITIONS.withId(editItem.id), {
                    method: "PUT",
                    body: JSON.stringify(payload),
                });
                showToast(i18n.catalog["humanCapital.positions.positionUpdatedSuccessfully"], "success");
            } else {
                await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.ADMINISTRATION.POSITIONS.BASE, {
                    method: "POST",
                    body: JSON.stringify(payload),
                });
                showToast(i18n.catalog["humanCapital.positions.positionCreatedSuccessfully"], "success");
            }

            setShowDialog(false);
            setEditItem(null);
            setForm(emptyForm);
            loadPositions();
        } catch {
            showToast(i18n.catalog["humanCapital.positions.failedSavePosition"], "error");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm(i18n.catalog["humanCapital.positions.areYouSureYouWantDeleteThisPosition"])) return;
        try {
            await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.ADMINISTRATION.POSITIONS.withId(id), { method: "DELETE" });
            showToast(i18n.catalog["humanCapital.positions.positionDeletedSuccessfully"], "success");
            loadPositions();
        } catch (e: any) {
            showToast(e?.message || i18n.catalog["humanCapital.positions.failedDeletePosition"], "error");
        }
    };

    const openEdit = (item: Position) => {
        setForm({
            position_name_ar: item.position_name_ar,
            position_name_en: item.position_name_en || "",
            job_title_id: item.job_title_id?.toString() || "",
            role_id: item.role_id?.toString() || "",
            department_id: item.department_id?.toString() || "",
            grade_level: item.grade_level || "",
            min_salary: item.min_salary?.toString() || "",
            max_salary: item.max_salary?.toString() || "",
            description: item.description || "",
        });
        setEditItem(item);
        setShowDialog(true);
    };

    const openDetail = async (id: number) => {
        try {
            const res = await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.ADMINISTRATION.POSITIONS.withId(id));
            setDetailItem((res as any).data || null);
            setShowDetail(true);
        } catch {
            showToast(i18n.catalog["humanCapital.positions.failedLoadPositionDetails"], "error");
        }
    };

    // Stats
    const totalPositions = positions.length;
    const activePositions = positions.filter((p) => p.is_active).length;
    const assignedCount = positions.reduce((sum, p) => sum + (p.active_employee_count || 0), 0);
    const withRole = positions.filter((p) => p.role_id).length;

    const columns: Column<Position>[] = [
        {
            key: "position_code",
            header: i18n.catalog["humanCapital.positions.positionCode"],
            dataLabel: i18n.catalog["common.general.code.alternative4"],
            render: (item) => (
                <span style={{ fontFamily: "monospace", fontWeight: 600, color: "var(--primary)" }}>
                    {item.position_code}
                </span>
            ),
        },
        { key: "position_name_ar", header: i18n.catalog["humanCapital.positions.positionName"], dataLabel: i18n.catalog["common.general.position.alternative2"] },
        {
            key: "job_title",
            header: i18n.catalog["common.general.jobTitle.alternative3"],
            dataLabel: i18n.catalog["common.general.title.alternative2"],
            render: (item) => <span>{item.job_title?.title_ar || "—"}</span>,
        },
        {
            key: "role",
            header: i18n.catalog["common.general.jobRole"],
            dataLabel: i18n.catalog["common.general.role.alternative2"],
            render: (item) =>
                item.role ? (
                    <span className="badge badge-info">{item.role.role_name_ar || item.role.role_key}</span>
                ) : (
                    <span className="text-muted">{i18n.catalog["common.general.unspecified"]}</span>
                ),
        },
        {
            key: "department",
            header: i18n.catalog["common.general.section"],
            dataLabel: i18n.catalog["common.general.section"],
            render: (item) => <span>{item.department?.name_ar || i18n.catalog["common.general.unspecified"]}</span>,
        },
        {
            key: "active_employee_count",
            header: i18n.catalog["common.general.employees.alternative2"],
            dataLabel: i18n.catalog["common.general.employees.alternative2"],
            render: (item) => (
                <span className={`badge ${(item.active_employee_count || 0) > 0 ? "badge-success" : "badge-warning"}`}>
                    {item.active_employee_count || 0} {i18n.catalog["humanCapital.positions.employee"]}</span>
            ),
        },
        {
            key: "is_active",
            header: i18n.catalog["common.general.status.alternative2"],
            dataLabel: i18n.catalog["common.general.status.alternative2"],
            render: (item) => (
                <span className={`badge ${item.is_active ? "badge-success" : "badge-danger"}`}>
                    {item.is_active ? i18n.catalog["common.general.active"] : i18n.catalog["common.general.disabled"]}
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
                        {
                            icon: "eye",
                            title: i18n.catalog["common.general.viewDetails"],
                            variant: "view",
                            onClick: () => openDetail(item.id),
                        },
                        {
                            icon: "edit" as const,
                            title: i18n.catalog["common.general.edit"],
                            variant: "edit" as const,
                            onClick: () => openEdit(item),
                        },
                        ...(canAccess("employees", "delete")
                            ? [
                                {
                                    icon: "trash" as const,
                                    title: i18n.catalog["common.general.delete"],
                                    variant: "delete" as const,
                                    onClick: () => handleDelete(item.id),
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
            {/* Stats Cards */}
            <div className="dashboard-stats" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
                <StatsCard
                    title={i18n.catalog["humanCapital.positions.totalPositions"]}
                    value={totalPositions}
                    icon={getIcon("briefcase")}
                    colorClass="default"
                />
                <StatsCard
                    title={i18n.catalog["humanCapital.positions.activePositions"]}
                    value={activePositions}
                    icon={getIcon("check-circle")}
                    colorClass="products"
                />
                <StatsCard
                    title={i18n.catalog["humanCapital.positions.assignedEmployees"]}
                    value={assignedCount}
                    icon={getIcon("users")}
                    colorClass="total"
                />
                <StatsCard
                    title={i18n.catalog["humanCapital.positions.positionsJobRole"]}
                    value={withRole}
                    icon={getIcon("shield")}
                    colorClass="sales"
                />
            </div>

            {/* Hierarchy Info */}
            <div
                className="alert alert-info"
                style={{ margin: "1rem 0", display: "flex", alignItems: "flex-start", gap: "0.75rem" }}
            >
                {getIcon("info")}
                <div>
                    <strong>{i18n.catalog["humanCapital.positions.jobRelationshipChain"]}</strong>
                    <p style={{ margin: "0.25rem 0 0" }}>
                        {i18n.catalog["humanCapital.positions.employeePositionJobRolePermissions"]}</p>
                </div>
            </div>

            <PageSubHeader
                title={i18n.catalog["common.general.jobPositions"]}
                titleIcon="layers"
                actions={
                    <>
                        {canAccess("employees", "create") && (
                            <Button
                                variant="primary"
                                icon="plus"
                                onClick={() => {
                                    setEditItem(null);
                                    setForm(emptyForm);
                                    setShowDialog(true);
                                }}
                            >
                                {i18n.catalog["humanCapital.positions.newPosition"]}</Button>
                        )}
                    </>
                }
            />

            <Table
                columns={columns}
                data={positions}
                keyExtractor={(i) => i.id.toString()}
                emptyMessage={i18n.catalog["humanCapital.positions.noJobPositionsCreateNewPositionLink"]}
                isLoading={isLoading}
            />

            {/* Create / Edit Dialog */}
            <Dialog
                isOpen={showDialog}
                onClose={() => setShowDialog(false)}
                title={editItem ? i18n.catalog["humanCapital.positions.editPosition"] : i18n.catalog["humanCapital.positions.createNewPosition"]}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setShowDialog(false)}>
                            {i18n.catalog["common.general.cancel"]}</Button>
                        <Button variant="primary" onClick={handleSave}>
                            {editItem ? i18n.catalog["common.general.update"] : i18n.catalog["common.general.create"]}
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <TextInput
                        label={i18n.catalog["humanCapital.positions.positionNameArabic"]}
                        value={form.position_name_ar}
                        onChange={(e) => setForm({ ...form, position_name_ar: e.target.value })}
                    />
                    <TextInput
                        label={i18n.catalog["humanCapital.positions.positionNameEnglish"]}
                        value={form.position_name_en}
                        onChange={(e) => setForm({ ...form, position_name_en: e.target.value })}
                    />

                    <div className="form-row">
                        <div className="form-group">
                            <Label>{i18n.catalog["common.general.jobTitle"]}</Label>
                            <SearchableSelect
                                options={jobTitles.map((jt) => ({
                                    value: jt.id.toString(),
                                    label: jt.title_ar + (jt.title_en ? catalogText(i18n, "common.general.message.alternative2", { value0: jt.title_en }) : ""),
                                }))}
                                value={form.job_title_id}
                                onChange={(val) => setForm({ ...form, job_title_id: val?.toString() || "" })}
                                placeholder={i18n.catalog["humanCapital.positions.searchJobTitle"]}
                            />
                        </div>
                        <div className="form-group">
                            <Label>{i18n.catalog["humanCapital.positions.jobRolePermissions"]}</Label>
                            <SearchableSelect
                                options={roles.map((r) => ({
                                    value: r.id.toString(),
                                    label: r.role_name_ar || r.role_key,
                                }))}
                                value={form.role_id}
                                onChange={(val) => setForm({ ...form, role_id: val?.toString() || "" })}
                                placeholder={i18n.catalog["humanCapital.positions.searchJobRole"]}
                            />
                        </div>
                    </div>

                    <Select
                        label={i18n.catalog["common.general.section"]}
                        value={form.department_id}
                        onChange={(e) => setForm({ ...form, department_id: e.target.value })}
                        options={[
                            { value: "", label: i18n.catalog["common.general.selectDepartment"] },
                            ...departments.map((d) => ({ value: d.id.toString(), label: d.name_ar })),
                        ]}
                    />

                    <div className="form-row">
                        <TextInput
                            label={i18n.catalog["humanCapital.positions.jobLevel"]}
                            value={form.grade_level}
                            onChange={(e) => setForm({ ...form, grade_level: e.target.value })}
                            placeholder={i18n.catalog["humanCapital.positions.exampleG5SeniorJunior"]}
                        />
                    </div>

                    <div className="form-row">
                        <TextInput
                            label={i18n.catalog["common.general.minimumSalary"]}
                            type="number"
                            value={form.min_salary}
                            onChange={(e) => setForm({ ...form, min_salary: e.target.value })}
                        />
                        <TextInput
                            label={i18n.catalog["common.general.maximumSalary"]}
                            type="number"
                            value={form.max_salary}
                            onChange={(e) => setForm({ ...form, max_salary: e.target.value })}
                        />
                    </div>

                    <Textarea
                        label={i18n.catalog["common.general.description.alternative2"]}
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        rows={3}
                    />
                </div>
            </Dialog>

            {/* Detail View Dialog */}
            <Dialog
                isOpen={showDetail}
                onClose={() => setShowDetail(false)}
                title={catalogText(i18n, "humanCapital.positions.positionDetails", { value0: detailItem?.position_name_ar || "" })}
                footer={
                    <Button variant="secondary" onClick={() => setShowDetail(false)}>
                        {i18n.catalog["common.general.close"]}</Button>
                }
            >
                {detailItem && (
                    <div className="space-y-4">
                        {/* Position Info */}
                        <div className="sales-card" style={{ padding: "1rem" }}>
                            <h4 style={{ marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                {getIcon("layers")} {i18n.catalog["humanCapital.positions.positionInformation"]}</h4>
                            <div className="form-row">
                                <div>
                                    <span className="stat-label">{i18n.catalog["common.general.code.alternative4"]}</span>
                                    <p style={{ fontFamily: "monospace", fontWeight: 600 }}>{detailItem.position_code}</p>
                                </div>
                                <div>
                                    <span className="stat-label">{i18n.catalog["common.general.status.alternative2"]}</span>
                                    <p>
                                        <span className={`badge ${detailItem.is_active ? "badge-success" : "badge-danger"}`}>
                                            {detailItem.is_active ? i18n.catalog["common.general.active"] : i18n.catalog["common.general.disabled"]}
                                        </span>
                                    </p>
                                </div>
                            </div>
                            {detailItem.grade_level && (
                                <div>
                                    <span className="stat-label">{i18n.catalog["common.general.level"]}</span>
                                    <p>{detailItem.grade_level}</p>
                                </div>
                            )}
                            {(detailItem.min_salary || detailItem.max_salary) && (
                                <div>
                                    <span className="stat-label">{i18n.catalog["humanCapital.positions.salaryRange"]}</span>
                                    <p>
                                        {detailItem.min_salary?.toLocaleString() || "—"} — {detailItem.max_salary?.toLocaleString() || "—"} {i18n.catalog["common.general.sar"]}</p>
                                </div>
                            )}
                        </div>

                        {/* Hierarchy Chain */}
                        <div className="sales-card" style={{ padding: "1rem" }}>
                            <h4 style={{ marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                {getIcon("git-branch")} {i18n.catalog["humanCapital.positions.relationshipChain"]}</h4>
                            <div className="form-row">
                                <div>
                                    <span className="stat-label">{i18n.catalog["common.general.jobTitle.alternative3"]}</span>
                                    <p className="badge badge-info">{detailItem.job_title?.title_ar || "—"}</p>
                                </div>
                                <div>
                                    <span className="stat-label">{i18n.catalog["common.general.jobRole"]}</span>
                                    <p className="badge badge-warning">
                                        {detailItem.role?.role_name_ar || detailItem.role?.role_key || i18n.catalog["common.general.unspecified"]}
                                    </p>
                                </div>
                                <div>
                                    <span className="stat-label">{i18n.catalog["common.general.section"]}</span>
                                    <p>{detailItem.department?.name_ar || i18n.catalog["common.general.unspecified"]}</p>
                                </div>
                            </div>
                        </div>

                        {/* Permissions from Role */}
                        {detailItem.role?.permissions && detailItem.role.permissions.length > 0 && (
                            <div className="sales-card" style={{ padding: "1rem" }}>
                                <h4 style={{ marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    {getIcon("shield")} {i18n.catalog["humanCapital.positions.permissionsInheritedRole"]}</h4>
                                <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                                    <table className="mini-table" style={{ width: "100%", fontSize: "0.85rem" }}>
                                        <thead>
                                            <tr>
                                                <th>{i18n.catalog["common.general.unit.alternative2"]}</th>
                                                <th>{i18n.catalog["common.general.view"]}</th>
                                                <th>{i18n.catalog["common.general.add"]}</th>
                                                <th>{i18n.catalog["common.general.edit"]}</th>
                                                <th>{i18n.catalog["common.general.delete"]}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {detailItem.role.permissions.map((p, idx) => (
                                                <tr key={idx}>
                                                    <td>{p.module || "—"}</td>
                                                    <td>{p.can_view ? "✓" : "—"}</td>
                                                    <td>{p.can_create ? "✓" : "—"}</td>
                                                    <td>{p.can_edit ? "✓" : "—"}</td>
                                                    <td>{p.can_delete ? "✓" : "—"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Assigned Employees */}
                        <div className="sales-card" style={{ padding: "1rem" }}>
                            <h4 style={{ marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                {getIcon("users")} {i18n.catalog["humanCapital.positions.assignedEmployees.alternative2"]}{detailItem.employees?.length || 0})
                            </h4>
                            {detailItem.employees && detailItem.employees.length > 0 ? (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                                    {detailItem.employees.map((emp) => (
                                        <div
                                            key={emp.id}
                                            className="badge badge-info"
                                            style={{ padding: "0.4rem 0.75rem", fontSize: "0.85rem" }}
                                        >
                                            {emp.full_name} ({emp.employee_code})
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted">{i18n.catalog["humanCapital.positions.noEmployeesAssignedThisPosition"]}</p>
                            )}
                        </div>
                    </div>
                )}
            </Dialog>
        </>
    );
}
