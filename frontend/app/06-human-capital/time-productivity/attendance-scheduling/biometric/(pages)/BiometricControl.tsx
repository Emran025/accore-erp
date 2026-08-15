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
    online: catalogMessage("common.general.connected"),
    offline: catalogMessage("common.general.offline"),
    maintenance: catalogMessage("common.general.maintenance"),
    error: catalogMessage("common.general.error.alternative2"),
};

const statusColors: Record<string, string> = {
    online: "success",
    offline: "secondary",
    maintenance: "warning",
    error: "danger",
};

const syncStatusLabels: Record<string, string> = {
    pending: catalogMessage("common.general.pending.alternative2"),
    in_progress: catalogMessage("humanCapital.biometriccontrol.progress"),
    completed: catalogMessage("common.general.completed"),
    failed: catalogMessage("common.general.failed.alternative2"),
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
        } catch { console.error(i18n.catalog["humanCapital.biometriccontrol.failedLoadDevices"]); }
        finally { setIsLoading(false); }
    };

    const loadSyncLogs = async () => {
        setIsLoading(true);
        try {
            const res = await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.BIOMETRIC.SYNC_LOGS);
            const data = (res as any).data;
            setSyncLogs(data?.data || data || []);
        } catch { console.error(i18n.catalog["humanCapital.biometriccontrol.failedLoadSyncLogs"]); }
        finally { setIsLoading(false); }
    };

    const handleAddDevice = async () => {
        if (!newDevice.device_name) {
            showToast(i18n.catalog["humanCapital.biometriccontrol.pleaseEnterDeviceName"], "error");
            return;
        }
        try {
            await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.BIOMETRIC.DEVICES, {
                method: "POST",
                body: JSON.stringify({ ...newDevice, device_port: Number(newDevice.device_port) }),
            });
            showToast(i18n.catalog["humanCapital.biometriccontrol.deviceRegisteredSuccessfully"], "success");
            setShowAddDevice(false);
            setNewDevice({ device_name: "", device_ip: "", device_port: "4370", serial_number: "", location: "" });
            loadDevices();
        } catch { showToast(i18n.catalog["humanCapital.biometriccontrol.deviceRegistrationFailed"], "error"); }
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
            showToast(res.message || i18n.catalog["humanCapital.biometriccontrol.synchronizedSuccessfully"], "success");
            setShowSyncDialog(false);
            setManualRecords("");
            loadDevices();
        } catch { showToast(i18n.catalog["humanCapital.biometriccontrol.synchronizationFailed"], "error"); }
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
            showToast(res.message || i18n.catalog["humanCapital.biometriccontrol.fileImportedSuccessfully"], "success");
            setShowImportDialog(false);
            loadDevices();
        } catch { showToast(i18n.catalog["humanCapital.biometriccontrol.fileImportFailed"], "error"); }
    };

    const handleDeleteDevice = async (id: number) => {
        if (!confirm(i18n.catalog["humanCapital.biometriccontrol.areYouSureYouWantDeleteThisDevice"])) return;
        try {
            await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.BIOMETRIC.DEVICE_WITH_ID(id), { method: "DELETE" });
            showToast(i18n.catalog["humanCapital.biometriccontrol.deviceDeleted"], "success");
            loadDevices();
        } catch { showToast(i18n.catalog["humanCapital.biometriccontrol.failedDeleteDevice"], "error"); }
    };

    const deviceColumns: Column<BiometricDevice>[] = [
        { key: "device_name", header: i18n.catalog["humanCapital.biometriccontrol.deviceName.alternative2"], dataLabel: i18n.catalog["common.general.device"] },
        { key: "device_ip", header: i18n.catalog["common.general.ipAddress"], dataLabel: "IP", render: (item) => <span className="text-mono">{item.device_ip || "—"}</span> },
        { key: "location", header: i18n.catalog["common.general.location"], dataLabel: i18n.catalog["common.general.location"], render: (item) => <span>{item.location || "—"}</span> },
        {
            key: "status", header: i18n.catalog["common.general.status.alternative2"], dataLabel: i18n.catalog["common.general.status.alternative2"],
            render: (item) => <span className={`badge badge-${statusColors[item.status]}`}>{statusLabels[item.status]}</span>,
        },
        { key: "total_records_synced", header: i18n.catalog["common.general.records"], dataLabel: i18n.catalog["common.general.records"] },
        {
            key: "last_sync_at", header: i18n.catalog["common.general.lastSync"], dataLabel: i18n.catalog["common.general.lastSync"],
            render: (item) => <span>{item.last_sync_at ? new Date(item.last_sync_at).toLocaleString("ar-SA") : "—"}</span>,
        },
        {
            key: "id", header: i18n.catalog["common.general.actions"], dataLabel: i18n.catalog["common.general.actions.alternative2"],
            render: (item) => (
                <div className="flex gap-1 flex-wrap">
                    <Button variant="primary" icon="refresh-cw" onClick={() => { setSelectedDevice(item); setShowSyncDialog(true); }}
                        disabled={syncingDeviceId === item.id}>
                        {syncingDeviceId === item.id ? i18n.catalog["humanCapital.biometriccontrol.loading"] : i18n.catalog["humanCapital.biometriccontrol.sync"]}
                    </Button>
                    <Button variant="secondary" icon="upload" onClick={() => { setSelectedDevice(item); setShowImportDialog(true); }}>{i18n.catalog["humanCapital.biometriccontrol.import"]}</Button>
                    {canAccess("attendance", "delete") && (
                        <Button variant="danger" icon="trash" onClick={() => handleDeleteDevice(item.id)}>{i18n.catalog["common.general.delete"]}</Button>
                    )}
                </div>
            ),
        },
    ];

    const logColumns: Column<BiometricSyncLog>[] = [
        { key: "id", header: "#", dataLabel: "#" },
        { key: "device", header: i18n.catalog["common.general.device"], dataLabel: i18n.catalog["common.general.device"], render: (item) => <span>{item.device?.device_name || "—"}</span> },
        { key: "sync_type", header: i18n.catalog["common.general.type.alternative3"], dataLabel: i18n.catalog["common.general.type.alternative3"], render: (item) => <span>{item.sync_type === "manual" ? i18n.catalog["common.general.manual"] : item.sync_type === "import" ? i18n.catalog["humanCapital.biometriccontrol.file"] : i18n.catalog["humanCapital.biometriccontrol.automatic"]}</span> },
        { key: "records_imported", header: i18n.catalog["common.general.importer"], dataLabel: i18n.catalog["common.general.importer"] },
        { key: "records_failed", header: i18n.catalog["common.general.failed"], dataLabel: i18n.catalog["common.general.failed"] },
        { key: "status", header: i18n.catalog["common.general.status.alternative2"], dataLabel: i18n.catalog["common.general.status.alternative2"], render: (item) => <span className={`badge ${item.status === "completed" ? "badge-success" : item.status === "failed" ? "badge-danger" : "badge-warning"}`}>{syncStatusLabels[item.status]}</span> },
        { key: "created_at", header: i18n.catalog["common.general.date.alternative7"], dataLabel: i18n.catalog["common.general.date.alternative7"], render: (item) => <span>{item.created_at ? new Date(item.created_at).toLocaleString("ar-SA") : "—"}</span> },
    ];

    return (
        <div className="sales-card animate-fade">
            <PageSubHeader
                title={i18n.catalog["humanCapital.biometriccontrol.biometricAttendanceDevices"]}
                titleIcon="clock"
                actions={
                    <div className="flex gap-2">
                        <Button variant={activeTab === "devices" ? "primary" : "secondary"} onClick={() => setActiveTab("devices")}>{i18n.catalog["humanCapital.biometriccontrol.devices"]}</Button>
                        <Button variant={activeTab === "logs" ? "primary" : "secondary"} onClick={() => setActiveTab("logs")}>{i18n.catalog["humanCapital.biometriccontrol.syncLog"]}</Button>
                        {canAccess("attendance", "create") && activeTab === "devices" && (
                            <Button variant="primary" icon="plus" onClick={() => setShowAddDevice(true)}>{i18n.catalog["humanCapital.biometriccontrol.newDevice"]}</Button>
                        )}
                    </div>
                }
            />

            {/* Summary Stats */}
            {activeTab === "devices" && (
                <div className="grid grid-cols-4 gap-4 mb-4">
                    {[
                        { label: i18n.catalog["humanCapital.biometriccontrol.totalDevices"], value: devices.length, color: "#3b82f6" },
                        { label: i18n.catalog["common.general.connected"], value: devices.filter((d) => d.status === "online").length, color: "#10b981" },
                        { label: i18n.catalog["common.general.offline"], value: devices.filter((d) => d.status === "offline").length, color: "#6b7280" },
                        { label: i18n.catalog["humanCapital.biometriccontrol.totalRecords"], value: devices.reduce((s, d) => s + d.total_records_synced, 0), color: "#8b5cf6" },
                    ].map((stat, i) => (
                        <div key={i} className="stat-card" style={{ borderRight: `4px solid ${stat.color}`, padding: "16px", borderRadius: "8px" }}>
                            <div className="stat-label">{stat.label}</div>
                            <div className="stat-value" style={{ color: stat.color, fontSize: "24px", fontWeight: 700 }}>{stat.value}</div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === "devices" ? (
                <Table columns={deviceColumns} data={devices} keyExtractor={(i) => i.id.toString()} emptyMessage={i18n.catalog["humanCapital.biometriccontrol.noRegisteredDevices"]} isLoading={isLoading} />
            ) : (
                <Table columns={logColumns} data={syncLogs} keyExtractor={(i) => i.id.toString()} emptyMessage={i18n.catalog["humanCapital.biometriccontrol.noSyncRecords"]} isLoading={isLoading} />
            )}

            {/* Add Device Dialog */}
            <Dialog isOpen={showAddDevice} onClose={() => setShowAddDevice(false)} title={i18n.catalog["humanCapital.biometriccontrol.registerNewFingerprintDevice"]} footer={
                <>
                    <Button variant="secondary" onClick={() => setShowAddDevice(false)}>{i18n.catalog["common.general.cancel"]}</Button>
                    <Button variant="primary" onClick={handleAddDevice}>{i18n.catalog["common.general.register"]}</Button>
                </>
            }>
                <div className="space-y-4">
                    <TextInput label={i18n.catalog["humanCapital.biometriccontrol.deviceName"]} value={newDevice.device_name} onChange={(e) => setNewDevice({ ...newDevice, device_name: e.target.value })} />
                    <TextInput label={i18n.catalog["common.general.ipAddress"]} value={newDevice.device_ip} onChange={(e) => setNewDevice({ ...newDevice, device_ip: e.target.value })} placeholder={i18n.catalog["humanCapital.biometriccontrol.message1921681100"]} />
                    <TextInput label={i18n.catalog["humanCapital.biometriccontrol.portPort"]} value={newDevice.device_port} onChange={(e) => setNewDevice({ ...newDevice, device_port: e.target.value })} />
                    <TextInput label={i18n.catalog["common.general.serialNumber"]} value={newDevice.serial_number} onChange={(e) => setNewDevice({ ...newDevice, serial_number: e.target.value })} />
                    <TextInput label={i18n.catalog["common.general.location"]} value={newDevice.location} onChange={(e) => setNewDevice({ ...newDevice, location: e.target.value })} />
                </div>
            </Dialog>

            {/* Sync Dialog */}
            <Dialog isOpen={showSyncDialog} onClose={() => setShowSyncDialog(false)} title={catalogText(i18n, "humanCapital.biometriccontrol.sync.alternative2", { value0: selectedDevice?.device_name || '' })} footer={
                <>
                    <Button variant="secondary" onClick={() => setShowSyncDialog(false)}>{i18n.catalog["common.general.cancel"]}</Button>
                    <Button variant="primary" icon="refresh-cw" onClick={handleSync} disabled={syncingDeviceId !== null}>
                        {syncingDeviceId !== null ? i18n.catalog["humanCapital.biometriccontrol.synchronizing"] : i18n.catalog["humanCapital.biometriccontrol.startSynchronization"]}
                    </Button>
                </>
            }>
                <div className="space-y-4">
                    <div className="alert alert-info" style={{ borderRadius: "8px", padding: "12px" }}>
                        <p>{i18n.catalog["humanCapital.biometriccontrol.enterRecordsCsvFormatOptional"]}</p>
                        <code style={{ fontSize: "12px" }}>{i18n.catalog["humanCapital.biometriccontrol.employeeNumberAttendanceDateCheckInTimeCheckOutTime"]}</code>
                    </div>
                    <Textarea
                        label={i18n.catalog["humanCapital.biometriccontrol.recordsCsv"]}
                        value={manualRecords}
                        onChange={(e) => setManualRecords(e.target.value)}
                        rows={6}
                        placeholder={i18n.catalog["humanCapital.biometriccontrol.emp00120260214080000170000Emp00220260214090000180000"]}
                    />
                </div>
            </Dialog>

            {/* File Import Dialog */}
            <Dialog isOpen={showImportDialog} onClose={() => setShowImportDialog(false)} title={catalogText(i18n, "humanCapital.biometriccontrol.importFile", { value0: selectedDevice?.device_name || '' })} footer={
                <Button variant="secondary" onClick={() => setShowImportDialog(false)}>{i18n.catalog["common.general.close"]}</Button>
            }>
                <div className="space-y-4">
                    <div className="alert alert-info" style={{ borderRadius: "8px", padding: "12px" }}>
                        <p>{i18n.catalog["humanCapital.biometriccontrol.fileMustBeCsvFormatContainFollowingColumns"]}</p>
                        <code style={{ fontSize: "12px" }}>{i18n.catalog["humanCapital.biometriccontrol.employeeCodeAttendanceDateCheckInCheckOut"]}</code>
                    </div>
                    <input ref={importFileRef} type="file" accept=".csv,.txt,.xlsx" onChange={handleFileImport}
                        style={{ padding: "12px", border: "2px dashed var(--border-color)", borderRadius: "8px", width: "100%", cursor: "pointer" }}
                    />
                </div>
            </Dialog>
        </div>
    );
}
