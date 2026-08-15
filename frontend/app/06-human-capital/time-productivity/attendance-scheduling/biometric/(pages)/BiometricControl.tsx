"use client";

import { useI18n, catalogText, catalogMessage } from "@/lib/i18n";
import { BiometricDevice, BiometricSyncLog } from "@/types";
import { PageSubHeader } from "@/components/layout";
import { Button, Column, Dialog, showToast, Table } from "@/components/ui";
import { TextInput } from "@/components/ui/TextInput";
import { Textarea } from "@/components/ui/Textarea";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect, useRef, useState } from "react";

const statusLabels: Record<string, string> = {
    online: catalogMessage("text_490a4c57bf7a"),
    offline: catalogMessage("text_cbc96ded4978"),
    maintenance: catalogMessage("text_9c499d210797"),
    error: catalogMessage("text_acc74dcf4c2f"),
};

const statusColors: Record<string, string> = {
    online: "success",
    offline: "secondary",
    maintenance: "warning",
    error: "danger",
};

const syncStatusLabels: Record<string, string> = {
    pending: catalogMessage("text_7d7913fdef74"),
    in_progress: catalogMessage("text_2813b1ec6664"),
    completed: catalogMessage("text_c2da5684d63b"),
    failed: catalogMessage("text_2519fef457aa"),
};

export function BiometricControl() {
    const { t: i18n } = useI18n();
    const { canAccess } = useAuthStore();
    const [activeTab, setActiveTab] = useState<"devices" | "logs">("devices");
    const [devices, setDevices] = useState<BiometricDevice[]>([]);
    const [syncLogs, setSyncLogs] = useState<BiometricSyncLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddDevice, setShowAddDevice] = useState(false);
    const [showSyncDialog, setShowSyncDialog] = useState(false);
    const [showImportDialog, setShowImportDialog] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState<BiometricDevice | null>(null);
    const [syncingDeviceId, setSyncingDeviceId] = useState<number | null>(null);
    const importFileRef = useRef<HTMLInputElement>(null);

    const [newDevice, setNewDevice] = useState({
        device_name: "",
        device_ip: "",
        device_port: "4370",
        serial_number: "",
        location: "",
    });

    const [manualRecords, setManualRecords] = useState("");

    useEffect(() => {
        if (activeTab === "devices") loadDevices();
        else loadSyncLogs();
    }, [activeTab]);

    const loadDevices = async () => {
        setIsLoading(true);
        try {
            const res = await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.BIOMETRIC.DEVICES);
            setDevices((res as any).data || []);
        } catch { console.error(i18n.catalog["text_15cdbbab8638"]); }
        finally { setIsLoading(false); }
    };

    const loadSyncLogs = async () => {
        setIsLoading(true);
        try {
            const res = await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.BIOMETRIC.SYNC_LOGS);
            const data = (res as any).data;
            setSyncLogs(data?.data || data || []);
        } catch { console.error(i18n.catalog["text_2df1a5a09858"]); }
        finally { setIsLoading(false); }
    };

    const handleAddDevice = async () => {
        if (!newDevice.device_name) {
            showToast(i18n.catalog["text_822cf36deb86"], "error");
            return;
        }
        try {
            await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.BIOMETRIC.DEVICES, {
                method: "POST",
                body: JSON.stringify({ ...newDevice, device_port: Number(newDevice.device_port) }),
            });
            showToast(i18n.catalog["text_c5139ddfea7d"], "success");
            setShowAddDevice(false);
            setNewDevice({ device_name: "", device_ip: "", device_port: "4370", serial_number: "", location: "" });
            loadDevices();
        } catch { showToast(i18n.catalog["text_fc08d5908a7f"], "error"); }
    };

    const handleSync = async () => {
        if (!selectedDevice) return;
        setSyncingDeviceId(selectedDevice.id);

        try {
            // Parse manual records if provided
            let records: Array<{ employee_code: string; check_in: string; check_out?: string; attendance_date: string }> = [];
            if (manualRecords.trim()) {
                const lines = manualRecords.trim().split("\n");
                records = lines.map((line) => {
                    const parts = line.split(",").map((p) => p.trim());
                    return {
                        employee_code: parts[0] || "",
                        attendance_date: parts[1] || "",
                        check_in: parts[2] || "",
                        check_out: parts[3] || undefined,
                    };
                });
            }

            const res = await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.BIOMETRIC.SYNC(selectedDevice.id), {
                method: "POST",
                body: JSON.stringify({ records }),
            });
            showToast(res.message || i18n.catalog["text_d81476062425"], "success");
            setShowSyncDialog(false);
            setManualRecords("");
            loadDevices();
        } catch { showToast(i18n.catalog["text_1eae017d6d59"], "error"); }
        finally { setSyncingDeviceId(null); }
    };

    const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedDevice) return;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("device_id", selectedDevice.id.toString());

        try {
            const res = await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.BIOMETRIC.IMPORT, {
                method: "POST",
                body: formData as any,
                headers: {}, // Remove JSON content-type for FormData
            });
            showToast(res.message || i18n.catalog["text_7b81b1376967"], "success");
            setShowImportDialog(false);
            loadDevices();
        } catch { showToast(i18n.catalog["text_184d9eba664a"], "error"); }
    };

    const handleDeleteDevice = async (id: number) => {
        if (!confirm(i18n.catalog["text_a9ee2f89d529"])) return;
        try {
            await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.BIOMETRIC.DEVICE_WITH_ID(id), { method: "DELETE" });
            showToast(i18n.catalog["text_26ff5ac2afd3"], "success");
            loadDevices();
        } catch { showToast(i18n.catalog["text_b04b43b75b15"], "error"); }
    };

    const deviceColumns: Column<BiometricDevice>[] = [
        { key: "device_name", header: i18n.catalog["text_acc67f72a008"], dataLabel: i18n.catalog["text_bd3ee8aa6cb7"] },
        { key: "device_ip", header: i18n.catalog["text_662315283697"], dataLabel: "IP", render: (item) => <span className="text-mono">{item.device_ip || "—"}</span> },
        { key: "location", header: i18n.catalog["text_8937faa1e41f"], dataLabel: i18n.catalog["text_8937faa1e41f"], render: (item) => <span>{item.location || "—"}</span> },
        {
            key: "status", header: i18n.catalog["text_c3a4749caed4"], dataLabel: i18n.catalog["text_c3a4749caed4"],
            render: (item) => <span className={`badge badge-${statusColors[item.status]}`}>{statusLabels[item.status]}</span>,
        },
        { key: "total_records_synced", header: i18n.catalog["text_1c6d3f465ce5"], dataLabel: i18n.catalog["text_1c6d3f465ce5"] },
        {
            key: "last_sync_at", header: i18n.catalog["text_bc308d4276aa"], dataLabel: i18n.catalog["text_bc308d4276aa"],
            render: (item) => <span>{item.last_sync_at ? new Date(item.last_sync_at).toLocaleString("ar-SA") : "—"}</span>,
        },
        {
            key: "id", header: i18n.catalog["text_7797240d6caf"], dataLabel: i18n.catalog["text_9f0a0f722601"],
            render: (item) => (
                <div className="flex gap-1 flex-wrap">
                    <Button variant="primary" icon="refresh-cw" onClick={() => { setSelectedDevice(item); setShowSyncDialog(true); }}
                        disabled={syncingDeviceId === item.id}>
                        {syncingDeviceId === item.id ? i18n.catalog["text_a957a8b77a40"] : i18n.catalog["text_57b21c4d9fe4"]}
                    </Button>
                    <Button variant="secondary" icon="upload" onClick={() => { setSelectedDevice(item); setShowImportDialog(true); }}>{i18n.catalog["text_e8c12678c3b4"]}</Button>
                    {canAccess("attendance", "delete") && (
                        <Button variant="danger" icon="trash" onClick={() => handleDeleteDevice(item.id)}>{i18n.catalog["text_59ca629220a6"]}</Button>
                    )}
                </div>
            ),
        },
    ];

    const logColumns: Column<BiometricSyncLog>[] = [
        { key: "id", header: "#", dataLabel: "#" },
        { key: "device", header: i18n.catalog["text_bd3ee8aa6cb7"], dataLabel: i18n.catalog["text_bd3ee8aa6cb7"], render: (item) => <span>{item.device?.device_name || "—"}</span> },
        { key: "sync_type", header: i18n.catalog["text_caa3f2bb4a36"], dataLabel: i18n.catalog["text_caa3f2bb4a36"], render: (item) => <span>{item.sync_type === "manual" ? i18n.catalog["text_a62cb7790ba3"] : item.sync_type === "import" ? i18n.catalog["text_b0984be77b5f"] : i18n.catalog["text_c190381bd30c"]}</span> },
        { key: "records_imported", header: i18n.catalog["text_c9c319ccc986"], dataLabel: i18n.catalog["text_c9c319ccc986"] },
        { key: "records_failed", header: i18n.catalog["text_16cd96513d7d"], dataLabel: i18n.catalog["text_16cd96513d7d"] },
        { key: "status", header: i18n.catalog["text_c3a4749caed4"], dataLabel: i18n.catalog["text_c3a4749caed4"], render: (item) => <span className={`badge ${item.status === "completed" ? "badge-success" : item.status === "failed" ? "badge-danger" : "badge-warning"}`}>{syncStatusLabels[item.status]}</span> },
        { key: "created_at", header: i18n.catalog["text_d90c384199ac"], dataLabel: i18n.catalog["text_d90c384199ac"], render: (item) => <span>{item.created_at ? new Date(item.created_at).toLocaleString("ar-SA") : "—"}</span> },
    ];

    return (
        <div className="sales-card animate-fade">
            <PageSubHeader
                title={i18n.catalog["text_a567da576e2d"]}
                titleIcon="clock"
                actions={
                    <div className="flex gap-2">
                        <Button variant={activeTab === "devices" ? "primary" : "secondary"} onClick={() => setActiveTab("devices")}>{i18n.catalog["text_851d1cf428e0"]}</Button>
                        <Button variant={activeTab === "logs" ? "primary" : "secondary"} onClick={() => setActiveTab("logs")}>{i18n.catalog["text_d7f994821372"]}</Button>
                        {canAccess("attendance", "create") && activeTab === "devices" && (
                            <Button variant="primary" icon="plus" onClick={() => setShowAddDevice(true)}>{i18n.catalog["text_eef0eecc0632"]}</Button>
                        )}
                    </div>
                }
            />

            {/* Summary Stats */}
            {activeTab === "devices" && (
                <div className="grid grid-cols-4 gap-4 mb-4">
                    {[
                        { label: i18n.catalog["text_19cabc46dd6d"], value: devices.length, color: "#3b82f6" },
                        { label: i18n.catalog["text_490a4c57bf7a"], value: devices.filter((d) => d.status === "online").length, color: "#10b981" },
                        { label: i18n.catalog["text_cbc96ded4978"], value: devices.filter((d) => d.status === "offline").length, color: "#6b7280" },
                        { label: i18n.catalog["text_d006fe854f51"], value: devices.reduce((s, d) => s + d.total_records_synced, 0), color: "#8b5cf6" },
                    ].map((stat, i) => (
                        <div key={i} className="stat-card" style={{ borderRight: `4px solid ${stat.color}`, padding: "16px", borderRadius: "8px" }}>
                            <div className="stat-label">{stat.label}</div>
                            <div className="stat-value" style={{ color: stat.color, fontSize: "24px", fontWeight: 700 }}>{stat.value}</div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === "devices" ? (
                <Table columns={deviceColumns} data={devices} keyExtractor={(i) => i.id.toString()} emptyMessage={i18n.catalog["text_2d844933d22b"]} isLoading={isLoading} />
            ) : (
                <Table columns={logColumns} data={syncLogs} keyExtractor={(i) => i.id.toString()} emptyMessage={i18n.catalog["text_6ecb4c357c11"]} isLoading={isLoading} />
            )}

            {/* Add Device Dialog */}
            <Dialog isOpen={showAddDevice} onClose={() => setShowAddDevice(false)} title={i18n.catalog["text_075f7984b240"]} footer={
                <>
                    <Button variant="secondary" onClick={() => setShowAddDevice(false)}>{i18n.catalog["text_9a30dc2a96b8"]}</Button>
                    <Button variant="primary" onClick={handleAddDevice}>{i18n.catalog["text_dcf52d4105c1"]}</Button>
                </>
            }>
                <div className="space-y-4">
                    <TextInput label={i18n.catalog["text_66566b28a7da"]} value={newDevice.device_name} onChange={(e) => setNewDevice({ ...newDevice, device_name: e.target.value })} />
                    <TextInput label={i18n.catalog["text_662315283697"]} value={newDevice.device_ip} onChange={(e) => setNewDevice({ ...newDevice, device_ip: e.target.value })} placeholder={i18n.catalog["text_2a39f1eedcd9"]} />
                    <TextInput label={i18n.catalog["text_35b88c079f47"]} value={newDevice.device_port} onChange={(e) => setNewDevice({ ...newDevice, device_port: e.target.value })} />
                    <TextInput label={i18n.catalog["text_5789f0fed61c"]} value={newDevice.serial_number} onChange={(e) => setNewDevice({ ...newDevice, serial_number: e.target.value })} />
                    <TextInput label={i18n.catalog["text_8937faa1e41f"]} value={newDevice.location} onChange={(e) => setNewDevice({ ...newDevice, location: e.target.value })} />
                </div>
            </Dialog>

            {/* Sync Dialog */}
            <Dialog isOpen={showSyncDialog} onClose={() => setShowSyncDialog(false)} title={catalogText(i18n, "text_e77857538fbe", { value0: selectedDevice?.device_name || '' })} footer={
                <>
                    <Button variant="secondary" onClick={() => setShowSyncDialog(false)}>{i18n.catalog["text_9a30dc2a96b8"]}</Button>
                    <Button variant="primary" icon="refresh-cw" onClick={handleSync} disabled={syncingDeviceId !== null}>
                        {syncingDeviceId !== null ? i18n.catalog["text_fc561e704419"] : i18n.catalog["text_995b2f3c19a7"]}
                    </Button>
                </>
            }>
                <div className="space-y-4">
                    <div className="alert alert-info" style={{ borderRadius: "8px", padding: "12px" }}>
                        <p>{i18n.catalog["text_659028180c6b"]}</p>
                        <code style={{ fontSize: "12px" }}>{i18n.catalog["text_7969ff6ca496"]}</code>
                    </div>
                    <Textarea
                        label={i18n.catalog["text_aa42ab16250d"]}
                        value={manualRecords}
                        onChange={(e) => setManualRecords(e.target.value)}
                        rows={6}
                        placeholder={i18n.catalog["text_5336ea53685d"]}
                    />
                </div>
            </Dialog>

            {/* File Import Dialog */}
            <Dialog isOpen={showImportDialog} onClose={() => setShowImportDialog(false)} title={catalogText(i18n, "text_b8b0ab27cd55", { value0: selectedDevice?.device_name || '' })} footer={
                <Button variant="secondary" onClick={() => setShowImportDialog(false)}>{i18n.catalog["text_ca90c297b099"]}</Button>
            }>
                <div className="space-y-4">
                    <div className="alert alert-info" style={{ borderRadius: "8px", padding: "12px" }}>
                        <p>{i18n.catalog["text_4bf02a5baa1c"]}</p>
                        <code style={{ fontSize: "12px" }}>{i18n.catalog["text_0240b242060c"]}</code>
                    </div>
                    <input ref={importFileRef} type="file" accept=".csv,.txt,.xlsx" onChange={handleFileImport}
                        style={{ padding: "12px", border: "2px dashed var(--border-color)", borderRadius: "8px", width: "100%", cursor: "pointer" }}
                    />
                </div>
            </Dialog>
        </div>
    );
}
