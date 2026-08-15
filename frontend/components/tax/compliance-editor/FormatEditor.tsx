"use client";

import { useI18n, catalogText } from "@/lib/i18n";
import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { showToast } from "@/components/ui";
import type { FormatEditorProps, SystemKey } from "./types";
import { highlightCode, validateFormat, prettifyCode, generateDefaultTemplate } from "./utils";

/**
 * FormatEditor – A dedicated JSON / YML / XML code editor
 * for mapping system keys → entity keys.
 *
 * Left panel: System keys (our keys) with entity-key input fields
 * Right panel: Editable output structure with syntax highlighting
 *
 * Styled to match the template-editor design language.
 */
export function FormatEditor({
    format,
    systemKeys,
    keyMapping,
    structureTemplate,
    onKeyMappingChange,
    onStructureChange,
    className = "",
}: FormatEditorProps) {
    const { t: i18n } = useI18n();
    // ── State ──
    const [keysSearchQuery, setKeysSearchQuery] = useState("");
    const [showKeysPanel, setShowKeysPanel] = useState(true);

    // ── Undo / Redo ──
    const [history, setHistory] = useState<string[]>([structureTemplate || ""]);
    const [historyIndex, setHistoryIndex] = useState(0);

    // ── Refs ──
    const editorRef = useRef<HTMLTextAreaElement>(null);
    const highlightRef = useRef<HTMLPreElement>(null);
    const lineNumberRef = useRef<HTMLDivElement>(null);

    // ── Derived ──
    const systemKeyNames = useMemo(() => systemKeys.map(k => k.key), [systemKeys]);
    const mappedKeys = useMemo(() => Object.keys(keyMapping), [keyMapping]);

    // ── Validation ──
    const validationResult = useMemo(
        () => validateFormat(structureTemplate, format),
        [structureTemplate, format]
    );

    const lineCount = useMemo(
        () => (structureTemplate || "").split("\n").length,
        [structureTemplate]
    );

    // ── Update structure with history tracking ──
    const updateStructure = useCallback((newCode: string, fromHistory = false) => {
        onStructureChange(newCode);
        if (!fromHistory) {
            const newHistory = history.slice(0, historyIndex + 1);
            newHistory.push(newCode);
            setHistory(newHistory);
            setHistoryIndex(newHistory.length - 1);
        }
    }, [history, historyIndex, onStructureChange]);

    // Sync history when structureTemplate changes externally (e.g. format switch)
    useEffect(() => {
        setHistory([structureTemplate || ""]);
        setHistoryIndex(0);
    }, [format]);

    // ── Undo / Redo ──
    const handleUndo = useCallback(() => {
        if (historyIndex > 0) {
            const prev = history[historyIndex - 1];
            setHistoryIndex(historyIndex - 1);
            onStructureChange(prev);
        }
    }, [history, historyIndex, onStructureChange]);

    const handleRedo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            const next = history[historyIndex + 1];
            setHistoryIndex(historyIndex + 1);
            onStructureChange(next);
        }
    }, [history, historyIndex, onStructureChange]);

    // ── Sync scroll ──
    const handleEditorScroll = useCallback(() => {
        if (editorRef.current && lineNumberRef.current && highlightRef.current) {
            lineNumberRef.current.scrollTop = editorRef.current.scrollTop;
            highlightRef.current.scrollTop = editorRef.current.scrollTop;
            highlightRef.current.scrollLeft = editorRef.current.scrollLeft;
        }
    }, []);

    // ── Insert key at cursor ──
    const insertSystemKey = useCallback((key: string) => {
        const editor = editorRef.current;
        if (!editor) return;
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const entityKey = keyMapping[key] || key;

        let insertText = "";
        switch (format) {
            case "json":
                insertText = catalogText(i18n, "text_d52b614d9797", { value0: entityKey, value1: key });
                break;
            case "xml":
                insertText = catalogText(i18n, "text_da3c16e9b14c", { value0: entityKey, value1: key, value2: entityKey });
                break;
            case "yml":
                insertText = catalogText(i18n, "text_e6f80a7fa9db", { value0: entityKey, value1: key });
                break;
        }

        const newValue =
            structureTemplate.substring(0, start) +
            insertText +
            structureTemplate.substring(end);
        updateStructure(newValue);

        setTimeout(() => {
            editor.focus();
            editor.selectionStart = editor.selectionEnd = start + insertText.length;
        }, 0);
    }, [structureTemplate, keyMapping, format, updateStructure]);

    // ── Handle mapping change for a key ──
    const handleMappingChange = useCallback((systemKey: string, entityKey: string) => {
        const newMapping = { ...keyMapping };
        if (entityKey.trim()) {
            newMapping[systemKey] = entityKey.trim();
        } else {
            delete newMapping[systemKey];
        }
        onKeyMappingChange(newMapping);
    }, [keyMapping, onKeyMappingChange]);

    // ── Keyboard shortcuts ──
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
            e.preventDefault();
            handleUndo();
            return;
        }
        if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
            e.preventDefault();
            handleRedo();
            return;
        }
        if (e.key === "Tab") {
            e.preventDefault();
            const editor = e.currentTarget;
            const start = editor.selectionStart;
            const end = editor.selectionEnd;
            const newValue = structureTemplate.substring(0, start) + "    " + structureTemplate.substring(end);
            updateStructure(newValue);
            setTimeout(() => {
                editor.selectionStart = editor.selectionEnd = start + 4;
            }, 0);
            return;
        }
        if ((e.ctrlKey || e.metaKey) && e.key === "k") {
            e.preventDefault();
            const formatted = prettifyCode(structureTemplate, format);
            updateStructure(formatted);
            showToast(i18n.catalog["text_8eeb7a1279fd"], "success");
            return;
        }
    }, [structureTemplate, format, handleUndo, handleRedo, updateStructure]);

    // ── Generate default template from current mappings ──
    const handleGenerateTemplate = useCallback(() => {
        if (Object.keys(keyMapping).length === 0) {
            showToast(i18n.catalog["text_2e31d6f5bad7"], "warning");
            return;
        }
        const template = generateDefaultTemplate(keyMapping, format);
        updateStructure(template);
        showToast(i18n.catalog["text_d222977d9fc5"], "success");
    }, [keyMapping, format, updateStructure]);

    // ── Filtered keys ──
    const filteredKeys = useMemo(() => {
        if (!keysSearchQuery) return systemKeys;
        const q = keysSearchQuery.toLowerCase();
        return systemKeys.filter(k =>
            k.key.toLowerCase().includes(q) || k.label.includes(keysSearchQuery)
        );
    }, [keysSearchQuery, systemKeys]);

    // ── Format placeholders ──
    const getPlaceholder = (): string => {
        switch (format) {
            case "json": return i18n.catalog["text_c901933a3b27"];
            case "xml": return '<?xml version="1.0" encoding="UTF-8"?>\n<report>\n    <entity_key>{{system_key}}</entity_key>\n</report>';
            case "yml": return '# Report Structure\nreport:\n  entity_key: "{{system_key}}"';
            default: return "";
        }
    };

    // ── RENDER ──
    return (
        <div className={`ce-main ${className}`}>
            {/* ── System Keys Panel ── */}
            {showKeysPanel && (
                <div className="ce-keys-panel">
                    <div className="ce-keys-header">
                        <h3><i className="fas fa-database" /> {i18n.catalog["text_a9f5b50a0a0f"]}</h3>
                        <button
                            className="ce-keys-close"
                            onClick={() => setShowKeysPanel(false)}
                            title={i18n.catalog["text_80b44ac83814"]}
                        >
                            <i className="fas fa-chevron-left" />
                        </button>
                    </div>
                    <div className="ce-keys-search">
                        <i className="fas fa-search" />
                        <input
                            type="text"
                            value={keysSearchQuery}
                            onChange={(e) => setKeysSearchQuery(e.target.value)}
                            placeholder={i18n.catalog["text_c5a78186337b"]}
                        />
                    </div>
                    <div className="ce-keys-list">
                        {filteredKeys.length === 0 ? (
                            <div style={{ padding: "40px 20px", textAlign: "center", color: "#8890a4" }}>
                                <i className="fas fa-search" style={{ fontSize: 32, opacity: 0.5, display: "block", marginBottom: 12 }} />
                                <span style={{ fontSize: 12 }}>{i18n.catalog["text_2d8a461130e0"]}</span>
                            </div>
                        ) : (
                            filteredKeys.map((k) => {
                                const isMapped = mappedKeys.includes(k.key);
                                return (
                                    <div
                                        key={k.key}
                                        className={`ce-key-item ${isMapped ? "mapped" : ""}`}
                                    >
                                        <div className="ce-key-item-top">
                                            <code>{k.key}</code>
                                            {isMapped && <i className="fas fa-check-circle ce-key-mapped-icon" />}
                                        </div>
                                        <span className="ce-key-desc">{k.label}</span>
                                        <span className={`ce-key-type ce-key-type-${k.type}`}>{k.type}</span>

                                        {/* ── Mapping Input ── */}
                                        <div className="ce-key-mapping">
                                            <i className="fas fa-arrow-left" />
                                            <input
                                                type="text"
                                                value={keyMapping[k.key] || ""}
                                                onChange={(e) => handleMappingChange(k.key, e.target.value)}
                                                placeholder={k.key}
                                                title={catalogText(i18n, "text_4af8c292969e", { value0: k.key })}
                                            />
                                            <button
                                                onClick={() => insertSystemKey(k.key)}
                                                style={{
                                                    border: "none",
                                                    background: "rgba(16, 185, 129, 0.1)",
                                                    color: "#10b981",
                                                    cursor: "pointer",
                                                    padding: "3px 6px",
                                                    borderRadius: 4,
                                                    fontSize: 10,
                                                    transition: "all 0.2s",
                                                }}
                                                title={i18n.catalog["text_f446827b0662"]}
                                            >
                                                <i className="fas fa-plus" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {/* ── Editor ── */}
            <div className="ce-editor-area">
                {/* Tab Bar */}
                <div className="ce-editor-tabs">
                    <div className="ce-editor-tabs-left">
                        <div className="ce-tab active" style={{ cursor: "default", borderBottom: "none" }}>
                            <i className="fas fa-code" /> {i18n.catalog["text_0c5036a42e40"]}{format.toUpperCase()})
                        </div>
                    </div>
                    <div className="ce-editor-tabs-right">
                        <button
                            className="ce-toolbar-btn"
                            onClick={handleGenerateTemplate}
                            title={i18n.catalog["text_952c3682e282"]}
                        >
                            <i className="fas fa-magic" />
                        </button>
                        <button
                            className="ce-toolbar-btn"
                            onClick={handleUndo}
                            disabled={historyIndex <= 0}
                            title={i18n.catalog["text_c621088f0b70"]}
                        >
                            <i className="fas fa-undo" />
                        </button>
                        <button
                            className="ce-toolbar-btn"
                            onClick={handleRedo}
                            disabled={historyIndex >= history.length - 1}
                            title={i18n.catalog["text_324a96d6f14d"]}
                        >
                            <i className="fas fa-redo" />
                        </button>
                        <button
                            className="ce-toolbar-btn"
                            onClick={() => {
                                const formatted = prettifyCode(structureTemplate, format);
                                updateStructure(formatted);
                                showToast(i18n.catalog["text_8eeb7a1279fd"], "success");
                            }}
                            title={i18n.catalog["text_7ffe5c5c09fd"]}
                        >
                            <i className="fas fa-indent" />
                        </button>
                        {!showKeysPanel && (
                            <button
                                className="ce-keys-toggle"
                                onClick={() => setShowKeysPanel(true)}
                                title={i18n.catalog["text_0d602c58c5f8"]}
                            >
                                <i className="fas fa-database" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Code Editor */}
                <div className="ce-code-container">
                    <div className="ce-line-numbers" ref={lineNumberRef}>
                        {Array.from({ length: lineCount }, (_, i) => (
                            <div key={i + 1} className="ce-line-num">{i + 1}</div>
                        ))}
                    </div>
                    <div className="ce-code-wrapper">
                        <pre
                            className="ce-highlight-layer"
                            ref={highlightRef}
                            aria-hidden="true"
                            dangerouslySetInnerHTML={{
                                __html: highlightCode(structureTemplate || "", format, systemKeyNames) + "\n"
                            }}
                        />
                        <textarea
                            ref={editorRef}
                            className="ce-code-textarea"
                            value={structureTemplate || ""}
                            onChange={(e) => updateStructure(e.target.value)}
                            onScroll={handleEditorScroll}
                            onKeyDown={handleKeyDown}
                            spellCheck={false}
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            wrap="off"
                            placeholder={getPlaceholder()}
                            style={{ direction: "ltr", textAlign: "left" }}
                        />
                    </div>
                </div>

                {/* Validation Panel */}
                {!validationResult.valid && validationResult.errors.length > 0 && (
                    <div className="ce-validation-panel">
                        <div className="ce-validation-header">
                            <i className="fas fa-exclamation-circle" />
                            <span>{i18n.catalog["text_d9dd306377ce"]}</span>
                        </div>
                        <div className="ce-validation-items">
                            {validationResult.errors.map((err, i) => (
                                <div key={i} className="ce-validation-item">
                                    <i className="fas fa-ban" />
                                    <span style={{ direction: "ltr", textAlign: "left" }}>{err}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
