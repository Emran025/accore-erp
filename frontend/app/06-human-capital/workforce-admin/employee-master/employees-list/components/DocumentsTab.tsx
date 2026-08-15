"use client";

import { useI18n, catalogText, catalogMessage } from "@/lib/i18n";
import { PageSubHeader } from "@/components/layout";
import { Button, Dialog, Label } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { getIcon } from "@/lib/icons";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCallback, useEffect, useRef, useState } from "react";
import { Employee, EmployeeDocument } from "@/types";

interface DocumentsTabProps {
    id?: string;
    employee?: Employee;
    mode?: "profile" | "wizard";
    pendingFiles?: any[];
    onPendingFilesChange?: (files: any[]) => void;
}

export const DOC_TYPE_MAP: Record<string, { label: string; icon: string; color: string }> = {
    cv: { label: catalogMessage("humanCapital.documents.cv"), icon: "fa-file-alt", color: "#6366f1" },
    contract: { label: catalogMessage("common.general.employmentContract"), icon: "fa-file-contract", color: "#0ea5e9" },
    certificate: { label: catalogMessage("common.general.certificate"), icon: "fa-certificate", color: "#f59e0b" },
    guarantee: { label: catalogMessage("humanCapital.documents.warrantyGuarantee"), icon: "fa-handshake", color: "#10b981" },
    id_copy: { label: catalogMessage("humanCapital.documents.idPhoto"), icon: "fa-id-card", color: "#8b5cf6" },
    passport: { label: catalogMessage("humanCapital.documents.passport"), icon: "fa-passport", color: "#ec4899" },
    medical: { label: catalogMessage("humanCapital.documents.medicalReport"), icon: "fa-notes-medical", color: "#ef4444" },
    other: { label: catalogMessage("common.general.other"), icon: "fa-paperclip", color: "#64748b" },
};

function getApiBase(): string {
    const envBase = process.env.NEXT_PUBLIC_API_BASE;
    if (!envBase || envBase === "undefined" || envBase === "null") {
        return "http://127.0.0.1:8000/api";
    }
    return envBase;
}

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return catalogMessage("humanCapital.documents.message0B");
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export default function DocumentsTab({
    id,
    employee,
    mode = "profile",
    pendingFiles = [],
    onPendingFilesChange
}: DocumentsTabProps) {
    const { t: i18n } = useI18n();
    const { canAccess } = useAuthStore();
    const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
    const [docsLoading, setDocsLoading] = useState(false);
    const [showUploadDialog, setShowUploadDialog] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const [uploadForm, setUploadForm] = useState({
        document_name: "",
        document_type: "other",
        document_number: "",
        issue_date: "",
        expiration_date: ""
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadDocuments = useCallback(async () => {
        if (!id || mode === "wizard") return;
        setDocsLoading(true);
        try {
            const res = await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.EMPLOYEE_FILES.LIST(id));
            const data = Array.isArray(res) ? res : (res.data as EmployeeDocument[]) || [];
            setDocuments(data as EmployeeDocument[]);
        } catch (e) {
            console.error(i18n.catalog["humanCapital.documents.failedLoadDocuments"], e);
        } finally {
            setDocsLoading(false);
        }
    }, [id, mode]);

    useEffect(() => {
        loadDocuments();
    }, [loadDocuments]);

    const openUploadDialog = (index: number | null = null) => {
        if (index !== null) {
            setEditingIndex(index);
            if (mode === "wizard") {
                const pf = pendingFiles[index];
                setUploadForm({
                    document_name: pf.name,
                    document_type: pf.type,
                    document_number: pf.document_number || "",
                    issue_date: pf.issue_date || "",
                    expiration_date: pf.expiration_date || ""
                });
                setSelectedFile(pf.file);
            } else {
                const doc = documents[index];
                setUploadForm({
                    document_name: doc.document_name,
                    document_type: doc.document_type,
                    document_number: doc.document_number || "",
                    issue_date: doc.issue_date || "",
                    expiration_date: doc.expiration_date || ""
                });
                setSelectedFile(null); // File update not supported in simple edit
            }
        } else {
            setEditingIndex(null);
            setUploadForm({
                document_name: "",
                document_type: "other",
                document_number: "",
                issue_date: "",
                expiration_date: ""
            });
            setSelectedFile(null);
        }
        setShowUploadDialog(true);
    };

    const handleSave = async () => {
        if (editingIndex === null && !selectedFile) return;
        if (!uploadForm.document_name.trim()) return;

        if (mode === "wizard") {
            const newFile = {
                file: selectedFile,
                name: uploadForm.document_name,
                type: uploadForm.document_type,
                document_number: uploadForm.document_number,
                issue_date: uploadForm.issue_date,
                expiration_date: uploadForm.expiration_date
            };

            if (editingIndex !== null) {
                const updated = [...pendingFiles];
                updated[editingIndex] = newFile;
                onPendingFilesChange?.(updated);
            } else {
                onPendingFilesChange?.([...pendingFiles, newFile]);
            }

            setShowUploadDialog(false);
            return;
        }

        // Profile mode (API)
        if (!id) return;
        setUploading(true);

        try {
            if (editingIndex !== null) {
                // UPDATE (Metadata only)
                const doc = documents[editingIndex];
                const res = await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.EMPLOYEE_FILES.UPDATE(id, doc.id), {
                    method: 'PUT',
                    body: JSON.stringify(uploadForm)
                });

                if (res.success !== false) {
                    setShowUploadDialog(false);
                    loadDocuments();
                } else {
                    alert(res.message || i18n.catalog["humanCapital.documents.failedUpdateData"]);
                }
            } else {
                // UPLOAD (New file)
                const fd = new FormData();
                if (selectedFile) fd.append("document", selectedFile);
                fd.append("document_name", uploadForm.document_name);
                fd.append("document_type", uploadForm.document_type);
                if (uploadForm.document_number) fd.append("document_number", uploadForm.document_number);
                if (uploadForm.issue_date) fd.append("issue_date", uploadForm.issue_date);
                if (uploadForm.expiration_date) fd.append("expiration_date", uploadForm.expiration_date);

                const token = typeof window !== "undefined" ? localStorage.getItem("sessionToken") : null;
                const headers: Record<string, string> = { Accept: "application/json" };
                if (token) headers["X-Session-Token"] = token;

                const response = await fetch(catalogText(i18n, "common.general.message", { value0: getApiBase(), value1: API_ENDPOINTS.HUMAN_CAPITAL.EMPLOYEE_FILES.UPLOAD(id).replace(/^\//, "") }), {
                    method: "POST",
                    headers,
                    credentials: "include",
                    body: fd,
                });

                if (response.ok) {
                    setShowUploadDialog(false);
                    setSelectedFile(null);
                    loadDocuments();
                } else {
                    const err = await response.json().catch(() => ({}));
                    alert(err.message || i18n.catalog["humanCapital.documents.fileUploadFailed"]);
                }
            }
        } catch (e) {
            console.error(e);
            alert(i18n.catalog["humanCapital.documents.processingErrorOccurred"]);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (docId: number) => {
        if (!id || !confirm(i18n.catalog["humanCapital.documents.areYouSureYouWantDeleteThisDocument"])) return;

        try {
            const res = await fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.EMPLOYEE_FILES.DELETE(id, docId), {
                method: 'DELETE'
            });

            if (res.success !== false) {
                loadDocuments();
            } else {
                alert(res.message || i18n.catalog["humanCapital.documents.failedDeleteDocument"]);
            }
        } catch (e) {
            console.error(e);
            alert(i18n.catalog["common.general.errorOccurredDuringDeletion"]);
        }
    };

    const handleDownload = async (doc: EmployeeDocument) => {
        if (!id) return;
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("sessionToken") : null;
            const headers: Record<string, string> = {};
            if (token) headers["X-Session-Token"] = token;

            const response = await fetch(
                catalogText(i18n, "common.general.message", { value0: getApiBase(), value1: API_ENDPOINTS.HUMAN_CAPITAL.EMPLOYEE_FILES.DOWNLOAD(id, doc.id).replace(/^\//, "") }),
                { headers, credentials: "include" }
            );

            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = doc.document_name;
                a.click();
                URL.revokeObjectURL(url);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleRemoveFile = (index: number) => {
        if (mode === "wizard") {
            const updated = [...pendingFiles];
            updated.splice(index, 1);
            onPendingFilesChange?.(updated);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files?.[0]) {
            const file = e.dataTransfer.files[0];
            setSelectedFile(file);
            if (!uploadForm.document_name) {
                setUploadForm(prev => ({ ...prev, document_name: file.name.split('.')[0] }));
            }
        }
    };

    const displayDocs = mode === "wizard" ? pendingFiles : documents;

    return (
        <div className={mode === "profile" ? "sales-card animate-fade" : ""}>
            {mode === "profile" && (
                <PageSubHeader
                    title={i18n.catalog["humanCapital.documents.employeeDocumentsFiles"] + (documents?.length || 0)}
                    titleIcon="user-circle"
                    actions={
                        <div className="flex gap-2">
                            {canAccess("employees", "create") && (
                                <Button onClick={() => openUploadDialog()} icon="plus">
                                    {i18n.catalog["common.general.uploadNewDocument"]}</Button>)}
                        </div>
                    }
                />
            )}

            <div className={mode === "profile" ? "settings-wrapper animate-fade" : ""}>
                {mode === "wizard" && (
                    <div className="section-card sales-card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)' }}>
                                <i className="fas fa-file-upload fa-lg"></i>
                                <h4 style={{ margin: 0 }}>{i18n.catalog["humanCapital.documents.employeeAttachmentsDocuments"]}{pendingFiles.length > 0 && catalogText(i18n, "common.general.message.alternative2", { value0: pendingFiles.length })}</h4>
                            </div>
                            <Button onClick={() => openUploadDialog()} icon="plus" size="sm">
                                {i18n.catalog["humanCapital.documents.addDocument"]}</Button>
                        </div>

                        {pendingFiles.length === 0 ? (
                            <div className="section-card sales-card" style={{ padding: '3rem', textAlign: 'center' }}>
                                <i className="fas fa-file-upload fa-3x" style={{ color: 'var(--text-muted)', opacity: 0.4, marginBottom: '1rem' }}></i>
                                <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{i18n.catalog["humanCapital.documents.noDocumentsYet"]}</h4>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                    {i18n.catalog["humanCapital.documents.youCanUploadCvCertificatesContractsMoreThis"]}</p>
                                <Button onClick={() => openUploadDialog()} icon="plus">
                                    {i18n.catalog["common.general.uploadFirstDocument"]}</Button>
                            </div>
                        ) : (
                            <div className="documents-grid">
                                {pendingFiles.map((pf, idx) => {
                                    const typeInfo = DOC_TYPE_MAP[pf.type] || DOC_TYPE_MAP.other;
                                    return (
                                        <div key={idx} className="document-card section-card sales-card" style={{ background: '#fff' }}>
                                            <div key={idx} className="document-sub-card">
                                                <div className="document-card-actions">
                                                    <div className="document-card-icon" style={{ background: `${typeInfo.color}15`, color: typeInfo.color }}>
                                                        <i className={`fas ${typeInfo.icon}`}></i>
                                                    </div>
                                                    <div className="document-card-content">
                                                        <h5 className="document-card-title">{pf.name}</h5>
                                                        <div className="document-card-meta">
                                                            <span className="document-type-badge" style={{ background: `${typeInfo.color}15`, color: typeInfo.color }}>
                                                                {typeInfo.label}
                                                            </span>
                                                            <span className="document-date">
                                                                <i className="fas fa-file"></i>
                                                                {formatFileSize(pf.file.size)}
                                                            </span>
                                                        </div>
                                                        {pf.document_number && (
                                                            <p className="document-notes" style={{ fontSize: '0.75rem' }}># {pf.document_number}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="document-card-actions">
                                                    <button className="doc-action-btn edit" onClick={() => openUploadDialog(idx)} title={i18n.catalog["common.general.edit"]}>
                                                        <i className="fas fa-pencil-alt"></i>
                                                    </button>
                                                    <button className="doc-action-btn delete" onClick={() => handleRemoveFile(idx)} title={i18n.catalog["common.general.delete"]} style={{ color: 'var(--danger-color)' }}>
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {mode === "profile" && (
                    <>
                        {docsLoading ? (
                            <div className="p-5 text-center" style={{ color: 'var(--text-muted)' }}>
                                <i className="fas fa-spinner fa-spin fa-2x"></i>
                                <p style={{ marginTop: '0.5rem' }}>{i18n.catalog["common.general.loadingDocuments"]}</p>
                            </div>
                        ) : documents.length === 0 ? (
                            <div className="section-card sales-card" style={{ padding: '3rem', textAlign: 'center' }}>
                                <i className="fas fa-file-upload fa-3x" style={{ color: 'var(--text-muted)', opacity: 0.4, marginBottom: '1rem' }}></i>
                                <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{i18n.catalog["humanCapital.documents.noDocuments"]}</h4>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                    {i18n.catalog["humanCapital.documents.noDocumentsHaveBeenUploadedThisEmployeeYet"]}</p>
                                <Button onClick={() => openUploadDialog()} icon="plus">
                                    {i18n.catalog["common.general.uploadFirstDocument"]}</Button>
                            </div>
                        ) : (
                            <div className="documents-grid">
                                {documents.map((doc) => {
                                    const typeInfo = DOC_TYPE_MAP[doc.document_type] || DOC_TYPE_MAP.other;
                                    return (
                                        <div key={doc.id} className="document-card section-card sales-card">
                                            <div key={doc.id} className="document-sub-card">
                                                <div className="document-card-actions">
                                                    <div className="document-card-icon" style={{ background: `${typeInfo.color}15`, color: typeInfo.color }}>
                                                        {getIcon(typeInfo.icon)}
                                                    </div>
                                                    <div className="document-card-content">
                                                        <h5 className="document-card-title">{doc.document_name}</h5>
                                                        <div className="document-card-meta">
                                                            <span className="document-type-badge" style={{ background: `${typeInfo.color}15`, color: typeInfo.color }}>
                                                                {typeInfo.label}
                                                            </span>
                                                            <span className="document-date">
                                                                {getIcon("clock")}

                                                                {new Date(doc.created_at).toLocaleDateString('ar-SA')}
                                                            </span>
                                                        </div>
                                                        {doc.notes && (
                                                            <p className="document-notes">{doc.notes}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="document-card-actions">
                                                    <button
                                                        className="doc-action-btn download"
                                                        onClick={() => handleDownload(doc)}
                                                        title={i18n.catalog["humanCapital.documents.loading"]}
                                                    >
                                                        {getIcon("download")}
                                                    </button>
                                                    {canAccess("employees", "edit") && (
                                                        <button
                                                            className="doc-action-btn edit"
                                                            onClick={() => openUploadDialog(documents.indexOf(doc))}
                                                            title={i18n.catalog["common.general.editData"]}
                                                        >
                                                            {getIcon("pencil")}
                                                        </button>
                                                    )}
                                                    {canAccess("employees", "edit") && (
                                                        <button
                                                            className="doc-action-btn edit"
                                                            onClick={() => openUploadDialog(documents.indexOf(doc))}
                                                            title={i18n.catalog["common.general.preview"]}
                                                        >
                                                            {getIcon("edit")}
                                                        </button>
                                                    )}
                                                    {canAccess("employees", "delete") && (
                                                        <button
                                                            className="doc-action-btn delete"
                                                            onClick={() => handleDelete(doc.id)}
                                                            title={i18n.catalog["common.general.delete"]}
                                                            style={{ color: 'var(--danger-color)' }}
                                                        >
                                                            {getIcon("trash")}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}

                {/* Shared Upload Dialog */}
                <Dialog
                    isOpen={showUploadDialog}
                    onClose={() => {
                        setShowUploadDialog(false);
                        setSelectedFile(null);
                        setEditingIndex(null);
                        setUploadForm({
                            document_name: "",
                            document_type: "other",
                            document_number: "",
                            issue_date: "",
                            expiration_date: ""
                        });
                    }}
                    title={editingIndex !== null ? i18n.catalog["humanCapital.documents.editDocument"] : i18n.catalog["common.general.uploadNewDocument"]}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Drag & Drop Zone */}
                        <div
                            className={`upload-dropzone ${dragActive ? 'active' : ''} ${selectedFile ? 'has-file' : ''}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                        const file = e.target.files[0];
                                        setSelectedFile(file);
                                        if (!uploadForm.document_name) {
                                            setUploadForm(prev => ({ ...prev, document_name: file.name.split('.')[0] }));
                                        }
                                    }
                                }}
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
                            />
                            {selectedFile ? (
                                <div className="selected-file-info">
                                    <i className="fas fa-file-check" style={{ fontSize: '2rem', color: '#10b981' }}></i>
                                    <div>
                                        <p style={{ fontWeight: 600, margin: '0 0 0.1rem 0' }}>{selectedFile.name}</p>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatFileSize(selectedFile.size)}</span>
                                    </div>
                                    <button
                                        type="button"
                                        className="remove-file-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedFile(null);
                                        }}
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <i className="fas fa-cloud-upload-alt" style={{ fontSize: '2.5rem', color: 'var(--primary-color)', opacity: 0.7 }}></i>
                                    <p style={{ margin: '0.5rem 0 0', fontWeight: 500 }}>{i18n.catalog["humanCapital.documents.dragFileHereClickSelect"]}</p>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        {i18n.catalog["humanCapital.documents.pdfDocDocxJpgPngXlsXlsx"]}</span>
                                </>
                            )}
                        </div>

                        {/* Document Name */}
                        <div className="form-group">
                            <Label>{i18n.catalog["humanCapital.documents.documentName"]}</Label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder={i18n.catalog["humanCapital.documents.exampleBachelorSDegree"]}
                                value={uploadForm.document_name}
                                onChange={(e) => setUploadForm(prev => ({ ...prev, document_name: e.target.value }))}
                            />
                        </div>

                        {/* Document Type */}
                        <div className="form-group">
                            <Label>{i18n.catalog["humanCapital.documents.documentType"]}</Label>
                            <select
                                className="form-control"
                                value={uploadForm.document_type}
                                onChange={(e) => setUploadForm(prev => ({ ...prev, document_type: e.target.value }))}
                            >
                                {Object.entries(DOC_TYPE_MAP).map(([key, val]) => (
                                    <option key={key} value={key}>{val.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <Label>{i18n.catalog["humanCapital.documents.documentNumberOptional"]}</Label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={uploadForm.document_number}
                                    onChange={(e) => setUploadForm(prev => ({ ...prev, document_number: e.target.value }))}
                                />
                            </div>
                            <div className="form-group">
                                <Label>{i18n.catalog["common.general.issueDate"]}</Label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={uploadForm.issue_date}
                                    onChange={(e) => setUploadForm(prev => ({ ...prev, issue_date: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <Label>{i18n.catalog["common.general.endDate.alternative2"]}</Label>
                            <input
                                type="date"
                                className="form-control"
                                value={uploadForm.expiration_date}
                                onChange={(e) => setUploadForm(prev => ({ ...prev, expiration_date: e.target.value }))}
                            />
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                            <Button variant="secondary" onClick={() => setShowUploadDialog(false)}>{i18n.catalog["common.general.cancel"]}</Button>
                            <Button onClick={handleSave} disabled={uploading || (editingIndex === null && !selectedFile) || !uploadForm.document_name.trim()}>
                                {uploading ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin" style={{ marginLeft: '0.4rem' }}></i>
                                        {editingIndex !== null ? i18n.catalog["humanCapital.documents.updating"] : i18n.catalog["humanCapital.documents.uploading"]}
                                    </>
                                ) : (
                                    editingIndex !== null ? i18n.catalog["common.general.saveChanges"] : (mode === "wizard" ? i18n.catalog["humanCapital.documents.addList"] : i18n.catalog["humanCapital.documents.uploadDocument"])
                                )}
                            </Button>
                        </div>
                    </div>
                </Dialog>
            </div>
        </div>
    );
}
