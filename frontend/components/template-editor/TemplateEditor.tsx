"use client";

import { useI18n, catalogText, catalogMessage } from "@/lib/i18n";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Button, showToast } from "@/components/ui";
import { TemplateEditorProps, TemplateData } from "./types";
import { highlightHTML, validateTemplateKeys, detectForbiddenElements, generatePreviewHtml, prettifyHTML } from "./utils";
import "./styles.css";

// ── Language options ──
const languageOptions = [
    { value: "ar", label: catalogMessage("text_82abd0b8a67c") },
    { value: "en", label: catalogMessage("text_ea7ca460c428") },
];

export function TemplateEditor({
    template,
    moduleName,
    templateTypeLabels = {},
    approvedKeys,
    mockContext,
    onSave,
    onCancel,
    className = ""
}: TemplateEditorProps) {
    const { t: i18n } = useI18n();
    const isNew = !template;

    // ── Form State ──
    const [templateKey, setTemplateKey] = useState(template?.template_key || "");
    const [nameAr, setNameAr] = useState(template?.template_name_ar || "");
    const [nameEn, setNameEn] = useState(template?.template_name_en || "");
    const [templateType, setTemplateType] = useState(template?.template_type || "");
    const [description, setDescription] = useState(template?.description || "");
    const [language, setLanguage] = useState(template?.language || "ar");
    const [bodyHtml, setBodyHtml] = useState(template?.body_html || "");

    // ── Editor State ──
    const [isSaving, setIsSaving] = useState(false);
    const [showKeysPanel, setShowKeysPanel] = useState(true);
    const [keysSearchQuery, setKeysSearchQuery] = useState("");
    const [previewHtml, setPreviewHtml] = useState("");
    const [showFindReplace, setShowFindReplace] = useState(false);
    const [findQuery, setFindQuery] = useState("");
    const [replaceQuery, setReplaceQuery] = useState("");
    const [findMatchCase, setFindMatchCase] = useState(false);

    // ── Undo / Redo State ──
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // Refs
    const editorRef = useRef<HTMLTextAreaElement>(null);
    const highlightRef = useRef<HTMLPreElement>(null);
    const lineNumberRef = useRef<HTMLDivElement>(null);
    const previewIframeRef = useRef<HTMLIFrameElement>(null);
    const findInputRef = useRef<HTMLInputElement>(null);

    // ── Determine Applicable Keys ──
    const applicableKeys = useMemo(() => {
        if (!templateType) return approvedKeys;
        return approvedKeys.filter(k =>
            !k.templateTypes || k.templateTypes.length === 0 || k.templateTypes.includes(templateType)
        );
    }, [approvedKeys, templateType]);

    const approvedKeyNames = useMemo(() => applicableKeys.map(k => k.key), [applicableKeys]);

    // ── Undo / Redo Handlers ──
    const handleUndo = useCallback(() => {
        if (historyIndex > 0) {
            const prev = history[historyIndex - 1];
            setHistoryIndex(historyIndex - 1);
            setBodyHtml(prev);
        }
    }, [history, historyIndex]);

    const handleRedo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            const next = history[historyIndex + 1];
            setHistoryIndex(historyIndex + 1);
            setBodyHtml(next);
        }
    }, [history, historyIndex]);

    const updateBodyHtml = useCallback((newHtml: string, isFromHistory = false) => {
        setBodyHtml(newHtml);
        if (!isFromHistory) {
            const newHistory = history.slice(0, historyIndex + 1);
            newHistory.push(newHtml);
            setHistory(newHistory);
            setHistoryIndex(newHistory.length - 1);
        }
    }, [history, historyIndex]);

    // ── Sync with Props ──
    useEffect(() => {
        if (template) {
            setTemplateKey(template.template_key || "");
            setNameAr(template.template_name_ar || "");
            setNameEn(template.template_name_en || "");
            setTemplateType(template.template_type || "");
            setDescription(template.description || "");
            setLanguage(template.language || "ar");

            const initialHtml = template.body_html || "";
            setBodyHtml(initialHtml);
            setHistory([initialHtml]);
            setHistoryIndex(0);
        } else {
            setHistory([""]);
            setHistoryIndex(0);
        }
    }, [template]);

    // Set a default type if one isn't provided/selected
    useEffect(() => {
        if (!templateType && Object.keys(templateTypeLabels).length > 0) {
            setTemplateType(Object.keys(templateTypeLabels)[0]);
        }
    }, [templateType, templateTypeLabels]);

    // ── Validation ──
    // Using utils
    const keyValidations = useMemo(() => validateTemplateKeys(bodyHtml, approvedKeyNames), [bodyHtml, approvedKeyNames]);
    const forbiddenIssues = useMemo(() => detectForbiddenElements(bodyHtml), [bodyHtml]);

    const invalidKeys = useMemo(() => keyValidations.filter(k => !k.valid), [keyValidations]);
    const validKeys = useMemo(() => keyValidations.filter(k => k.valid), [keyValidations]);
    const usedKeyNames = useMemo(() => [...new Set(keyValidations.map(k => k.key))], [keyValidations]);

    // ── Generate & Sync Preview HTML ──
    useEffect(() => {
        const dir = language === "ar" ? "rtl" : "ltr";
        const processed = generatePreviewHtml(bodyHtml, mockContext);
        const fullHtml = `<!DOCTYPE html><html dir="${dir}" lang="${language}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>body{margin:0;padding:20px;font-family:'Tajawal','Segoe UI',sans-serif;background:#ffffff;} ::-webkit-scrollbar { width: 8px; height: 8px; } ::-webkit-scrollbar-track { background: #f1f1f1; } ::-webkit-scrollbar-thumb { background: #888; border-radius: 4px; } ::-webkit-scrollbar-thumb:hover { background: #555; }</style></head><body>${processed}</body></html>`;

        setPreviewHtml(fullHtml);
    }, [bodyHtml, language, mockContext]);

    // ── Write to iframe ──
    useEffect(() => {
        if (previewIframeRef.current && previewHtml) {
            const doc = previewIframeRef.current.contentDocument;
            if (doc) {
                setTimeout(() => {
                    const latestDoc = previewIframeRef.current?.contentDocument;
                    if (latestDoc) {
                        latestDoc.open();
                        latestDoc.write(previewHtml);
                        latestDoc.close();
                    }
                }, 0);
            }
        }
    }, [previewHtml]);

    // ── Sync scroll between editor and line numbers ──
    const handleEditorScroll = useCallback(() => {
        if (editorRef.current && lineNumberRef.current && highlightRef.current) {
            lineNumberRef.current.scrollTop = editorRef.current.scrollTop;
            highlightRef.current.scrollTop = editorRef.current.scrollTop;
            highlightRef.current.scrollLeft = editorRef.current.scrollLeft;
        }
    }, []);

    // ── Insert key at cursor position ──
    const insertKey = useCallback((key: string) => {
        const editor = editorRef.current;
        if (!editor) return;
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const placeholder = catalogText(i18n, "text_ee3104aa901f", { value0: key });
        const newValue = bodyHtml.substring(0, start) + placeholder + bodyHtml.substring(end);
        updateBodyHtml(newValue);
        setTimeout(() => {
            editor.focus();
            editor.selectionStart = editor.selectionEnd = start + placeholder.length;
        }, 0);
    }, [bodyHtml, updateBodyHtml]);

    // ── Handle keyboard shortcuts ──
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Undo
        if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
            e.preventDefault();
            handleUndo();
            return;
        }

        // Redo
        if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
            e.preventDefault();
            handleRedo();
            return;
        }

        // Tab key - insert 4 spaces
        if (e.key === "Tab") {
            e.preventDefault();
            const editor = e.currentTarget;
            const start = editor.selectionStart;
            const end = editor.selectionEnd;
            const newValue = bodyHtml.substring(0, start) + "    " + bodyHtml.substring(end);
            updateBodyHtml(newValue);
            setTimeout(() => {
                editor.selectionStart = editor.selectionEnd = start + 4;
            }, 0);
            return;
        }

        // Ctrl/Cmd + S - Save
        if ((e.ctrlKey || e.metaKey) && e.key === "s") {
            e.preventDefault();
            if (!isSaving && forbiddenIssues.length === 0 && invalidKeys.length === 0) {
                handleSave();
            }
            return;
        }

        // Ctrl/Cmd + F - Find
        if ((e.ctrlKey || e.metaKey) && e.key === "f") {
            e.preventDefault();
            setShowFindReplace(true);
            setTimeout(() => findInputRef.current?.focus(), 0);
            return;
        }

        // Ctrl/Cmd + K - Format code
        if ((e.ctrlKey || e.metaKey) && e.key === "k") {
            e.preventDefault();
            const formatted = prettifyHTML(bodyHtml);
            updateBodyHtml(formatted);
            showToast(i18n.catalog["text_8eeb7a1279fd"], "success");
            return;
        }

        // Escape - Close find/replace
        if (e.key === "Escape" && showFindReplace) {
            setShowFindReplace(false);
            editorRef.current?.focus();
            return;
        }
    }, [bodyHtml, isSaving, forbiddenIssues.length, invalidKeys.length, showFindReplace, handleUndo, handleRedo, updateBodyHtml]);

    // ── Find and Replace functionality ──
    const handleFind = useCallback(() => {
        if (!findQuery || !editorRef.current) return;
        const editor = editorRef.current;
        const text = editor.value;
        const searchText = findMatchCase ? findQuery : findQuery.toLowerCase();
        const startPos = editor.selectionStart;
        const searchFrom = text.substring(startPos);
        const searchTextLower = findMatchCase ? searchText : searchText.toLowerCase();
        const index = searchFrom.toLowerCase().indexOf(searchTextLower);

        if (index !== -1) {
            const absoluteIndex = startPos + index;
            editor.selectionStart = absoluteIndex;
            editor.selectionEnd = absoluteIndex + findQuery.length;
            editor.focus();
            editor.scrollIntoView({ block: "center", behavior: "smooth" });
        } else {
            showToast(i18n.catalog["text_ecf19c161732"], "warning");
        }
    }, [findQuery, findMatchCase]);

    const handleReplace = useCallback(() => {
        if (!findQuery || !editorRef.current) return;
        const editor = editorRef.current;
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const selectedText = editor.value.substring(start, end);

        if (findMatchCase ? selectedText === findQuery : selectedText.toLowerCase() === findQuery.toLowerCase()) {
            const newValue = bodyHtml.substring(0, start) + replaceQuery + bodyHtml.substring(end);
            updateBodyHtml(newValue);
            setTimeout(() => {
                editor.selectionStart = editor.selectionEnd = start + replaceQuery.length;
                editor.focus();
            }, 0);
        } else {
            handleFind();
        }
    }, [findQuery, replaceQuery, findMatchCase, bodyHtml, handleFind, updateBodyHtml]);

    const handleReplaceAll = useCallback(() => {
        if (!findQuery) return;
        const regex = new RegExp(findQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), findMatchCase ? "g" : "gi");
        const newValue = bodyHtml.replace(regex, replaceQuery);
        updateBodyHtml(newValue);
        showToast(i18n.catalog["text_1f382297ad53"], "success");
    }, [findQuery, replaceQuery, findMatchCase, bodyHtml, updateBodyHtml]);

    // ── Line numbers ──
    const lineCount = useMemo(() => bodyHtml.split("\n").length, [bodyHtml]);

    // ── Save handler ──
    const handleSave = async () => {
        if (!templateKey.trim()) {
            showToast(i18n.catalog["text_52c53a8c0d76"], "error");
            return;
        }
        if (!nameAr.trim()) {
            showToast(i18n.catalog["text_a693a6c20227"], "error");
            return;
        }
        if (forbiddenIssues.length > 0) {
            showToast(i18n.catalog["text_c0a07a5b3a40"], "error");
            return;
        }
        if (invalidKeys.length > 0) {
            showToast(catalogText(i18n, "text_0fd934be8ab2", { value0: invalidKeys.length }), "error");
            return;
        }

        setIsSaving(true);
        try {
            // "Format on Save" behavior
            const formattedBody = prettifyHTML(bodyHtml);
            updateBodyHtml(formattedBody);

            await onSave({
                template_key: templateKey,
                template_name_ar: nameAr,
                template_name_en: nameEn,
                template_type: templateType,
                body_html: formattedBody,
                description,
                language,
                editable_fields: Array.isArray(template?.editable_fields) ? template.editable_fields : [], // preserve existing fields or default to empty array
            });
        } finally {
            setIsSaving(false);
        }
    };

    // ── Filtered keys ──
    const sortedApprovedKeys = useMemo(() => {
        return [...applicableKeys].sort((a, b) => a.key.localeCompare(b.key));
    }, [applicableKeys]);

    const filteredKeys = useMemo(() => {
        if (!keysSearchQuery) return sortedApprovedKeys;
        const q = keysSearchQuery.toLowerCase();
        return sortedApprovedKeys.filter(k =>
            k.key.toLowerCase().includes(q) || k.description.includes(keysSearchQuery)
        );
    }, [keysSearchQuery, sortedApprovedKeys]);

    // ── Jump to line functionality ──
    const jumpToLine = useCallback((lineNumber: number) => {
        if (!editorRef.current) return;
        const editor = editorRef.current;
        const lines = bodyHtml.split("\n");
        if (lineNumber < 1 || lineNumber > lines.length) return;

        let position = 0;
        for (let i = 0; i < lineNumber - 1; i++) {
            position += lines[i].length + 1; // +1 for newline
        }

        editor.selectionStart = editor.selectionEnd = position;
        editor.focus();
        editor.scrollIntoView({ block: "center", behavior: "smooth" });
    }, [bodyHtml]);

    // ═══════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════
    return (
        <div className={`template-editor ${className}`}>
            {/* ── Top Bar ── */}
            <div className="te-topbar">
                <div className="te-topbar-right">
                    <div className="te-topbar-title">
                        <i className="fas fa-file-code" />
                        <span>{isNew ? catalogText(i18n, "text_4f9aa1cc9b17", { value0: moduleName }) : catalogText(i18n, "text_e5beff21dfec", { value0: template?.template_name_ar || "", value1: moduleName })}</span>
                    </div>
                    <div className="te-status-badges">
                        {forbiddenIssues.length > 0 && (
                            <span className="te-badge te-badge-danger">
                                <i className="fas fa-exclamation-triangle" /> {forbiddenIssues.length} {i18n.catalog["text_d3b5b7ac8894"]}</span>
                        )}
                        {invalidKeys.length > 0 && (
                            <span className="te-badge te-badge-warning">
                                <i className="fas fa-key" /> {invalidKeys.length} {i18n.catalog["text_f614324704b6"]}</span>
                        )}
                        {forbiddenIssues.length === 0 && invalidKeys.length === 0 && bodyHtml.trim() && (
                            <span className="te-badge te-badge-success">
                                <i className="fas fa-check-circle" /> {i18n.catalog["text_905435284fad"]}</span>
                        )}
                        <span className="te-badge te-badge-info">
                            <i className="fas fa-hashtag" /> {lineCount} {i18n.catalog["text_297814b61dd2"]}</span>
                        <span className="te-badge te-badge-info">
                            <i className="fas fa-key" /> {usedKeyNames.length} {i18n.catalog["text_167922020988"]}</span>
                    </div>
                </div>
                <div className="te-topbar-actions">
                    <Button size="sm" variant="secondary" icon="times" onClick={onCancel}>{i18n.catalog["text_9a30dc2a96b8"]}</Button>
                    <Button
                        size="sm"
                        variant="primary"
                        icon="save"
                        onClick={handleSave}
                        disabled={isSaving || forbiddenIssues.length > 0 || invalidKeys.length > 0}
                    >
                        {isSaving ? i18n.catalog["text_8688b0ff5f34"] : isNew ? i18n.catalog["text_2c3b0daf2dfd"] : i18n.catalog["text_6c03d6737c2f"]}
                    </Button>
                </div>
            </div>

            {/* ── Definition Bar ── */}
            <div className="te-definition-bar">
                <div className="te-def-field">
                    <label>{i18n.catalog["text_98389123b2e7"]}</label>
                    <input
                        type="text"
                        value={templateKey}
                        onChange={(e) => setTemplateKey(e.target.value)}
                        placeholder={i18n.catalog["text_c8a9c5b73080"]}
                        disabled={!isNew}
                        className="te-input"
                    />
                </div>
                <div className="te-def-field">
                    <label>{i18n.catalog["text_9545ff35e736"]}</label>
                    <input
                        type="text"
                        value={nameAr}
                        onChange={(e) => setNameAr(e.target.value)}
                        placeholder={i18n.catalog["text_fc37790aa634"]}
                        className="te-input"
                    />
                </div>
                <div className="te-def-field">
                    <label>{i18n.catalog["text_88e20529da90"]}</label>
                    <input
                        type="text"
                        value={nameEn}
                        onChange={(e) => setNameEn(e.target.value)}
                        placeholder={i18n.catalog["text_da5311c7bf18"]}
                        className="te-input"
                    />
                </div>
                {Object.keys(templateTypeLabels).length > 0 && (
                    <div className="te-def-field">
                        <label>{i18n.catalog["text_1aeafc6bad8d"]}</label>
                        <select
                            value={templateType}
                            onChange={(e) => setTemplateType(e.target.value)}
                            className="te-select"
                        >
                            {Object.entries(templateTypeLabels).map(([v, l]) => (
                                <option key={v} value={v}>{l}</option>
                            ))}
                        </select>
                    </div>
                )}
                <div className="te-def-field">
                    <label>{i18n.catalog["text_3bab9c2b0200"]}</label>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="te-select"
                        disabled={!isNew}
                    >
                        {languageOptions.map(l => (
                            <option key={l.value} value={l.value}>{l.label}</option>
                        ))}
                    </select>
                </div>
                <div className="te-def-field te-def-field-wide">
                    <label>{i18n.catalog["text_95023fc76e1b"]}</label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={i18n.catalog["text_bbe8f04c659f"]}
                        className="te-input"
                    />
                </div>
            </div>

            {/* ── Main Editor Area ── */}
            <div className="te-main">
                {/* ── Keys Panel ── */}
                {showKeysPanel && (
                    <div className="te-keys-panel">
                        <div className="te-keys-header">
                            <h3><i className="fas fa-key" /> {i18n.catalog["text_8a10377ca2d6"]}</h3>
                            <button
                                className="te-keys-close"
                                onClick={() => setShowKeysPanel(false)}
                                title={i18n.catalog["text_80b44ac83814"]}
                            >
                                <i className="fas fa-chevron-left" />
                            </button>
                        </div>
                        <div className="te-keys-search">
                            <i className="fas fa-search" />
                            <input
                                type="text"
                                value={keysSearchQuery}
                                onChange={(e) => setKeysSearchQuery(e.target.value)}
                                placeholder={i18n.catalog["text_76b858f96489"]}
                            />
                        </div>
                        <div className="te-keys-list">
                            {filteredKeys.length === 0 ? (
                                <div className="te-keys-empty">
                                    <i className="fas fa-search" />
                                    <span>{i18n.catalog["text_2d8a461130e0"]}</span>
                                </div>
                            ) : (
                                filteredKeys.map((k) => {
                                    const isUsed = usedKeyNames.includes(k.key);
                                    return (
                                        <button
                                            key={k.key}
                                            className={`te-key-item ${isUsed ? "used" : ""}`}
                                            onClick={() => insertKey(k.key)}
                                            title={catalogText(i18n, "text_a6972c4ff140", { value0: k.key })}
                                        >
                                            <div className="te-key-item-top">
                                                <code>{catalogText(i18n, "text_ee3104aa901f", { value0: k.key })}</code>
                                                {isUsed && <i className="fas fa-check-circle te-key-used-icon" />}
                                            </div>
                                            <span className="te-key-desc">{k.description}</span>
                                            <span className={`te-key-type te-key-type-${k.type}`}>{k.type}</span>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}

                {/* ── Editor / Preview Area ── */}
                <div className="te-editor-area">
                    {/* Tab bar header */}
                    <div className="te-editor-tabs">
                        <div className="te-editor-tabs-left">
                            <div className="te-tab active" style={{ cursor: 'default', borderBottom: 'none' }}>
                                <i className="fas fa-code" /> {i18n.catalog["text_9f236402d688"]}</div>
                            <div className="te-tab active" style={{ cursor: 'default', borderBottom: 'none' }}>
                                <i className="fas fa-eye" /> {i18n.catalog["text_7f69dce61661"]}</div>
                        </div>
                        <div className="te-editor-tabs-right">
                            <div className="te-preview-controls">
                                <span className="te-preview-label">
                                    <i className="fas fa-flask" /> {i18n.catalog["text_ecb51d883709"]}</span>
                            </div>
                            <button
                                className="te-toolbar-btn"
                                onClick={handleUndo}
                                disabled={historyIndex <= 0}
                                title={i18n.catalog["text_9d52aaa0a25c"]}
                            >
                                <i className="fas fa-undo" />
                            </button>
                            <button
                                className="te-toolbar-btn"
                                onClick={handleRedo}
                                disabled={historyIndex >= history.length - 1}
                                title={i18n.catalog["text_07174c2bde18"]}
                            >
                                <i className="fas fa-redo" />
                            </button>
                            <button
                                className="te-toolbar-btn"
                                onClick={() => {
                                    setShowFindReplace(!showFindReplace);
                                    if (!showFindReplace) {
                                        setTimeout(() => findInputRef.current?.focus(), 0);
                                    }
                                }}
                                title={i18n.catalog["text_b3788c8a260b"]}
                            >
                                <i className="fas fa-search" />
                            </button>
                            <button
                                className="te-toolbar-btn"
                                onClick={() => {
                                    const formatted = prettifyHTML(bodyHtml);
                                    updateBodyHtml(formatted);
                                    showToast(i18n.catalog["text_8eeb7a1279fd"], "success");
                                }}
                                title={i18n.catalog["text_7ffe5c5c09fd"]}
                            >
                                <i className="fas fa-indent" />
                            </button>
                            {!showKeysPanel && (
                                <button
                                    className="te-keys-toggle"
                                    onClick={() => setShowKeysPanel(true)}
                                    title={i18n.catalog["text_0d602c58c5f8"]}
                                >
                                    <i className="fas fa-key" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Find/Replace Bar */}
                    {showFindReplace && (
                        <div className="te-find-replace-bar">
                            <div className="te-find-replace-group">
                                <input
                                    ref={findInputRef}
                                    type="text"
                                    value={findQuery}
                                    onChange={(e) => setFindQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleFind();
                                        }
                                    }}
                                    placeholder={i18n.catalog["text_76b858f96489"]}
                                    className="te-find-input"
                                />
                                <button
                                    className="te-find-btn"
                                    onClick={handleFind}
                                    title={i18n.catalog["text_8d046db49c54"]}
                                >
                                    <i className="fas fa-arrow-down" />
                                </button>
                            </div>
                            <div className="te-find-replace-group">
                                <input
                                    type="text"
                                    value={replaceQuery}
                                    onChange={(e) => setReplaceQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleReplace();
                                        }
                                    }}
                                    placeholder={i18n.catalog["text_3af30a72d766"]}
                                    className="te-replace-input"
                                />
                                <button
                                    className="te-replace-btn"
                                    onClick={handleReplace}
                                    title={i18n.catalog["text_374cdcc38839"]}
                                >
                                    <i className="fas fa-exchange-alt" />
                                </button>
                                <button
                                    className="te-replace-all-btn"
                                    onClick={handleReplaceAll}
                                    title={i18n.catalog["text_2c7e3eed9b26"]}
                                >
                                    <i className="fas fa-sync" />
                                </button>
                            </div>
                            <div className="te-find-options">
                                <label className="te-find-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={findMatchCase}
                                        onChange={(e) => setFindMatchCase(e.target.checked)}
                                    />
                                    <span>{i18n.catalog["text_656c8ee73bf1"]}</span>
                                </label>
                            </div>
                            <button
                                className="te-find-close"
                                onClick={() => {
                                    setShowFindReplace(false);
                                    editorRef.current?.focus();
                                }}
                                title={i18n.catalog["text_0f790c6cece8"]}
                            >
                                <i className="fas fa-times" />
                            </button>
                        </div>
                    )}

                    <div className="te-split-container">
                        {/* LEFT: Code Editor */}
                        <div className="te-code-container">
                            <div className="te-line-numbers" ref={lineNumberRef}>
                                {Array.from({ length: lineCount }, (_, i) => (
                                    <div
                                        key={i + 1}
                                        className="te-line-num"
                                        onClick={() => jumpToLine(i + 1)}
                                        title={catalogText(i18n, "text_9abe1989eabc", { value0: i + 1 })}
                                    >
                                        {i + 1}
                                    </div>
                                ))}
                            </div>
                            <div className="te-code-wrapper">
                                <pre
                                    className="te-highlight-layer"
                                    ref={highlightRef}
                                    aria-hidden="true"
                                    dangerouslySetInnerHTML={{
                                        __html: highlightHTML(bodyHtml, approvedKeyNames) + "\n"
                                    }}
                                />
                                <textarea
                                    ref={editorRef}
                                    className="te-textarea"
                                    value={bodyHtml}
                                    onChange={(e) => updateBodyHtml(e.target.value)}
                                    onScroll={handleEditorScroll}
                                    onKeyDown={handleKeyDown}
                                    spellCheck={false}
                                    autoComplete="off"
                                    autoCorrect="off"
                                    autoCapitalize="off"
                                    wrap="off"
                                    placeholder={i18n.catalog["text_2cfc9bf5ae1a"]}
                                    style={{ direction: 'ltr', textAlign: 'left' }}
                                />
                            </div>
                        </div>

                        {/* RIGHT: Live Preview */}
                        <div className="te-preview-container">
                            <div className="te-preview-toolbar">
                                <span className="te-preview-dir-badge">
                                    <i className={`fas fa-${language === "ar" ? "align-right" : "align-left"}`} />
                                    {language === "ar" ? "RTL" : "LTR"}
                                </span>
                                <span className="te-preview-lang-badge">
                                    {languageOptions.find(l => l.value === language)?.label}
                                </span>
                                <button
                                    className="te-preview-refresh"
                                    onClick={() => {
                                        const dir = language === "ar" ? "rtl" : "ltr";
                                        const processed = generatePreviewHtml(bodyHtml, mockContext);
                                        const fullHtml = `<!DOCTYPE html><html dir="${dir}" lang="${language}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>body{margin:0;padding:20px;font-family:'Tajawal','Segoe UI',sans-serif;background:#ffffff;} ::-webkit-scrollbar { width: 8px; height: 8px; } ::-webkit-scrollbar-track { background: #f1f1f1; } ::-webkit-scrollbar-thumb { background: #888; border-radius: 4px; } ::-webkit-scrollbar-thumb:hover { background: #555; }</style></head><body>${processed}</body></html>`;
                                        setPreviewHtml(fullHtml);
                                    }}
                                    title={i18n.catalog["text_735266537e58"]}
                                >
                                    <i className="fas fa-sync-alt" />
                                </button>
                            </div>
                            <iframe
                                ref={previewIframeRef}
                                className="te-preview-iframe"
                                sandbox="allow-same-origin"
                                title={i18n.catalog["text_71ac9117bba2"]}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Bottom Validation Panel ── */}
            {(forbiddenIssues.length > 0 || invalidKeys.length > 0) && (
                <div className="te-validation-panel">
                    <div className="te-validation-header">
                        <i className="fas fa-exclamation-circle" />
                        <span>{i18n.catalog["text_bcaa8e6ec329"]}</span>
                    </div>
                    <div className="te-validation-items">
                        {forbiddenIssues.map((issue, i) => (
                            <div key={`f-${i}`} className="te-validation-item te-validation-error">
                                <i className="fas fa-ban" />
                                <span>{issue}</span>
                            </div>
                        ))}
                        {invalidKeys.map((k, i) => (
                            <div
                                key={`k-${i}`}
                                className="te-validation-item te-validation-warning"
                                onClick={() => jumpToLine(k.line)}
                                style={{ cursor: "pointer" }}
                                title={catalogText(i18n, "text_9abe1989eabc", { value0: k.line })}
                            >
                                <i className="fas fa-key" />
                                <span>
                                    {i18n.catalog["text_65afc73dd210"]}<code>{catalogText(i18n, "text_ee3104aa901f", { value0: k.key })}</code> {i18n.catalog["text_66a28928dd8b"]}{k.line}{i18n.catalog["text_7bba3e20a415"]}{k.column}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

