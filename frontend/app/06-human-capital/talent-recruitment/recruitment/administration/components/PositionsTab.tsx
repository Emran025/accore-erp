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
            console.error(i18n.catalog["text_bed7414d913a"]);
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
            console.error(i18n.catalog["text_f438dcadfdd1"]);
        }
    };

    const handleSave = async () => {
        if (!form.position_name_ar) {
            showToast(i18n.catalog["text_10b98e6b1e29"], "error");
            return;
        }
        if (!form.job_title_id) {
            showToast(i18n.catalog["text_5635ef747ec4"], "error");
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
                showToast(i18n.catalog["text_726461d25019"], "success");
            } else {
                await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.ADMINISTRATION.POSITIONS.BASE, {
                    method: "POST",
                    body: JSON.stringify(payload),
                });
                showToast(i18n.catalog["text_6dea4e54b332"], "success");
            }

            setShowDialog(false);
            setEditItem(null);
            setForm(emptyForm);
            loadPositions();
        } catch {
            showToast(i18n.catalog["text_4b65d1185936"], "error");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm(i18n.catalog["text_f6783e89e976"])) return;
        try {
            await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.ADMINISTRATION.POSITIONS.withId(id), { method: "DELETE" });
            showToast(i18n.catalog["text_855e15e771ca"], "success");
            loadPositions();
        } catch (e: any) {
            showToast(e?.message || i18n.catalog["text_7dfd518045e8"], "error");
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
            showToast(i18n.catalog["text_48d857dbfb83"], "error");
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
            header: i18n.catalog["text_86ce8c5f7a51"],
            dataLabel: i18n.catalog["text_e28ef005ab68"],
            render: (item) => (
                <span style={{ fontFamily: "monospace", fontWeight: 600, color: "var(--primary)" }}>
                    {item.position_code}
                </span>
            ),
        },
        { key: "position_name_ar", header: i18n.catalog["text_eadea2fc873d"], dataLabel: i18n.catalog["text_66e3bc906d4b"] },
        {
            key: "job_title",
            header: i18n.catalog["text_de98bd734462"],
            dataLabel: i18n.catalog["text_39adfb54212e"],
            render: (item) => <span>{item.job_title?.title_ar || "—"}</span>,
        },
        {
            key: "role",
            header: i18n.catalog["text_5e7dccdb4d93"],
            dataLabel: i18n.catalog["text_de69d94fee12"],
            render: (item) =>
                item.role ? (
                    <span className="badge badge-info">{item.role.role_name_ar || item.role.role_key}</span>
                ) : (
                    <span className="text-muted">{i18n.catalog["text_5a0374f3ff5a"]}</span>
                ),
        },
        {
            key: "department",
            header: i18n.catalog["text_0771c3ff9336"],
            dataLabel: i18n.catalog["text_0771c3ff9336"],
            render: (item) => <span>{item.department?.name_ar || i18n.catalog["text_5a0374f3ff5a"]}</span>,
        },
        {
            key: "active_employee_count",
            header: i18n.catalog["text_cb0edb38f685"],
            dataLabel: i18n.catalog["text_cb0edb38f685"],
            render: (item) => (
                <span className={`badge ${(item.active_employee_count || 0) > 0 ? "badge-success" : "badge-warning"}`}>
                    {item.active_employee_count || 0} {i18n.catalog["text_45372718dd18"]}</span>
            ),
        },
        {
            key: "is_active",
            header: i18n.catalog["text_c3a4749caed4"],
            dataLabel: i18n.catalog["text_c3a4749caed4"],
            render: (item) => (
                <span className={`badge ${item.is_active ? "badge-success" : "badge-danger"}`}>
                    {item.is_active ? i18n.catalog["text_629e90b3af3d"] : i18n.catalog["text_21dc96b9f9f8"]}
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
                        {
                            icon: "eye",
                            title: i18n.catalog["text_4b615d0e6dd2"],
                            variant: "view",
                            onClick: () => openDetail(item.id),
                        },
                        {
                            icon: "edit" as const,
                            title: i18n.catalog["text_113d570d6555"],
                            variant: "edit" as const,
                            onClick: () => openEdit(item),
                        },
                        ...(canAccess("employees", "delete")
                            ? [
                                {
                                    icon: "trash" as const,
                                    title: i18n.catalog["text_59ca629220a6"],
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
                    title={i18n.catalog["text_58cfbe835554"]}
                    value={totalPositions}
                    icon={getIcon("briefcase")}
                    colorClass="default"
                />
                <StatsCard
                    title={i18n.catalog["text_a80ed2d568f1"]}
                    value={activePositions}
                    icon={getIcon("check-circle")}
                    colorClass="products"
                />
                <StatsCard
                    title={i18n.catalog["text_05affae5e8c8"]}
                    value={assignedCount}
                    icon={getIcon("users")}
                    colorClass="total"
                />
                <StatsCard
                    title={i18n.catalog["text_273c26b69352"]}
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
                    <strong>{i18n.catalog["text_464429ca5deb"]}</strong>
                    <p style={{ margin: "0.25rem 0 0" }}>
                        {i18n.catalog["text_e70c5d73b9c2"]}</p>
                </div>
            </div>

            <PageSubHeader
                title={i18n.catalog["text_ef04a5b86137"]}
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
                                {i18n.catalog["text_9aacd801cbfe"]}</Button>
                        )}
                    </>
                }
            />

            <Table
                columns={columns}
                data={positions}
                keyExtractor={(i) => i.id.toString()}
                emptyMessage={i18n.catalog["text_0a37ac8bc8de"]}
                isLoading={isLoading}
            />

            {/* Create / Edit Dialog */}
            <Dialog
                isOpen={showDialog}
                onClose={() => setShowDialog(false)}
                title={editItem ? i18n.catalog["text_03eaaa7aa693"] : i18n.catalog["text_434063c59e19"]}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setShowDialog(false)}>
                            {i18n.catalog["text_9a30dc2a96b8"]}</Button>
                        <Button variant="primary" onClick={handleSave}>
                            {editItem ? i18n.catalog["text_00eab31f95b7"] : i18n.catalog["text_a820f3590d36"]}
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <TextInput
                        label={i18n.catalog["text_203a6947df2d"]}
                        value={form.position_name_ar}
                        onChange={(e) => setForm({ ...form, position_name_ar: e.target.value })}
                    />
                    <TextInput
                        label={i18n.catalog["text_79a5d119e23f"]}
                        value={form.position_name_en}
                        onChange={(e) => setForm({ ...form, position_name_en: e.target.value })}
                    />

                    <div className="form-row">
                        <div className="form-group">
                            <Label>{i18n.catalog["text_a360f80290e8"]}</Label>
                            <SearchableSelect
                                options={jobTitles.map((jt) => ({
                                    value: jt.id.toString(),
                                    label: jt.title_ar + (jt.title_en ? catalogText(i18n, "text_239f04bc2797", { value0: jt.title_en }) : ""),
                                }))}
                                value={form.job_title_id}
                                onChange={(val) => setForm({ ...form, job_title_id: val?.toString() || "" })}
                                placeholder={i18n.catalog["text_27378b0ed402"]}
                            />
                        </div>
                        <div className="form-group">
                            <Label>{i18n.catalog["text_6a138ba052a5"]}</Label>
                            <SearchableSelect
                                options={roles.map((r) => ({
                                    value: r.id.toString(),
                                    label: r.role_name_ar || r.role_key,
                                }))}
                                value={form.role_id}
                                onChange={(val) => setForm({ ...form, role_id: val?.toString() || "" })}
                                placeholder={i18n.catalog["text_d8de6dfdc65d"]}
                            />
                        </div>
                    </div>

                    <Select
                        label={i18n.catalog["text_0771c3ff9336"]}
                        value={form.department_id}
                        onChange={(e) => setForm({ ...form, department_id: e.target.value })}
                        options={[
                            { value: "", label: i18n.catalog["text_883061768176"] },
                            ...departments.map((d) => ({ value: d.id.toString(), label: d.name_ar })),
                        ]}
                    />

                    <div className="form-row">
                        <TextInput
                            label={i18n.catalog["text_eb77ed4b84c9"]}
                            value={form.grade_level}
                            onChange={(e) => setForm({ ...form, grade_level: e.target.value })}
                            placeholder={i18n.catalog["text_bdc026bd3d27"]}
                        />
                    </div>

                    <div className="form-row">
                        <TextInput
                            label={i18n.catalog["text_bf32b2e6c77c"]}
                            type="number"
                            value={form.min_salary}
                            onChange={(e) => setForm({ ...form, min_salary: e.target.value })}
                        />
                        <TextInput
                            label={i18n.catalog["text_1dd7e6760687"]}
                            type="number"
                            value={form.max_salary}
                            onChange={(e) => setForm({ ...form, max_salary: e.target.value })}
                        />
                    </div>

                    <Textarea
                        label={i18n.catalog["text_95023fc76e1b"]}
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
                title={catalogText(i18n, "text_60fa161a4422", { value0: detailItem?.position_name_ar || "" })}
                footer={
                    <Button variant="secondary" onClick={() => setShowDetail(false)}>
                        {i18n.catalog["text_ca90c297b099"]}</Button>
                }
            >
                {detailItem && (
                    <div className="space-y-4">
                        {/* Position Info */}
                        <div className="sales-card" style={{ padding: "1rem" }}>
                            <h4 style={{ marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                {getIcon("layers")} {i18n.catalog["text_d8ccadc9bb1e"]}</h4>
                            <div className="form-row">
                                <div>
                                    <span className="stat-label">{i18n.catalog["text_e28ef005ab68"]}</span>
                                    <p style={{ fontFamily: "monospace", fontWeight: 600 }}>{detailItem.position_code}</p>
                                </div>
                                <div>
                                    <span className="stat-label">{i18n.catalog["text_c3a4749caed4"]}</span>
                                    <p>
                                        <span className={`badge ${detailItem.is_active ? "badge-success" : "badge-danger"}`}>
                                            {detailItem.is_active ? i18n.catalog["text_629e90b3af3d"] : i18n.catalog["text_21dc96b9f9f8"]}
                                        </span>
                                    </p>
                                </div>
                            </div>
                            {detailItem.grade_level && (
                                <div>
                                    <span className="stat-label">{i18n.catalog["text_961a0a03b98b"]}</span>
                                    <p>{detailItem.grade_level}</p>
                                </div>
                            )}
                            {(detailItem.min_salary || detailItem.max_salary) && (
                                <div>
                                    <span className="stat-label">{i18n.catalog["text_cfaf6832db52"]}</span>
                                    <p>
                                        {detailItem.min_salary?.toLocaleString() || "—"} — {detailItem.max_salary?.toLocaleString() || "—"} {i18n.catalog["text_feafe34f5add"]}</p>
                                </div>
                            )}
                        </div>

                        {/* Hierarchy Chain */}
                        <div className="sales-card" style={{ padding: "1rem" }}>
                            <h4 style={{ marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                {getIcon("git-branch")} {i18n.catalog["text_d4e72c996e43"]}</h4>
                            <div className="form-row">
                                <div>
                                    <span className="stat-label">{i18n.catalog["text_de98bd734462"]}</span>
                                    <p className="badge badge-info">{detailItem.job_title?.title_ar || "—"}</p>
                                </div>
                                <div>
                                    <span className="stat-label">{i18n.catalog["text_5e7dccdb4d93"]}</span>
                                    <p className="badge badge-warning">
                                        {detailItem.role?.role_name_ar || detailItem.role?.role_key || i18n.catalog["text_5a0374f3ff5a"]}
                                    </p>
                                </div>
                                <div>
                                    <span className="stat-label">{i18n.catalog["text_0771c3ff9336"]}</span>
                                    <p>{detailItem.department?.name_ar || i18n.catalog["text_5a0374f3ff5a"]}</p>
                                </div>
                            </div>
                        </div>

                        {/* Permissions from Role */}
                        {detailItem.role?.permissions && detailItem.role.permissions.length > 0 && (
                            <div className="sales-card" style={{ padding: "1rem" }}>
                                <h4 style={{ marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    {getIcon("shield")} {i18n.catalog["text_4a8b38446ea7"]}</h4>
                                <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                                    <table className="mini-table" style={{ width: "100%", fontSize: "0.85rem" }}>
                                        <thead>
                                            <tr>
                                                <th>{i18n.catalog["text_9a08d7d4bf73"]}</th>
                                                <th>{i18n.catalog["text_3824e18ca83b"]}</th>
                                                <th>{i18n.catalog["text_d52453ac627d"]}</th>
                                                <th>{i18n.catalog["text_113d570d6555"]}</th>
                                                <th>{i18n.catalog["text_59ca629220a6"]}</th>
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
                                {getIcon("users")} {i18n.catalog["text_950497632bde"]}{detailItem.employees?.length || 0})
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
                                <p className="text-muted">{i18n.catalog["text_aca5bba4993e"]}</p>
                            )}
                        </div>
                    </div>
                )}
            </Dialog>
        </>
    );
}
