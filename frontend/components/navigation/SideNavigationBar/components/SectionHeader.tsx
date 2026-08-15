import { catalogMessage } from "@/lib/i18n";
import { useRef, useCallback } from "react";
import { getIcon } from "@/lib/icons";

export interface SectionHeaderProps {
    title: string;
    icon: string;
    collapsed: boolean;
    onToggle: () => void;
    count?: number;
    actions?: React.ReactNode;
    /** Section content rendered below the header */
    children?: React.ReactNode;
    /** Height of the section when expanded (px). Enables the resizable wrapper. */
    sectionHeight?: number;
    /** Called when drag starts on the header for VS Code-style resize */
    onResizeStart?: (e: React.MouseEvent) => void;
    /** Whether the header is currently being dragged */
    isResizing?: boolean;
    /** Whether this is the last expanded section in the sidebar (gets flex: 1) */
    isLastExpanded?: boolean;
}

export function SectionHeader({
    title,
    icon,
    collapsed,
    onToggle,
    count,
    actions,
    children,
    sectionHeight,
    onResizeStart,
    isResizing,
    isLastExpanded,
}: SectionHeaderProps) {
    const dragRef = useRef<{ startY: number; moved: boolean } | null>(null);

    /**
     * Resize handle at the top edge of the header.
     * Only triggers on the thin 6px hit-zone rendered as ::before.
     */
    const handleResizeDown = useCallback((e: React.MouseEvent) => {
        if (e.button !== 0 || !onResizeStart) return;
        e.preventDefault();
        e.stopPropagation();

        dragRef.current = { startY: e.clientY, moved: false };

        const handleMouseMove = (ev: MouseEvent) => {
            if (!dragRef.current) return;
            const diff = Math.abs(ev.clientY - dragRef.current.startY);
            if (diff > 3 && !dragRef.current.moved) {
                dragRef.current.moved = true;
                onResizeStart(e);
            }
        };

        const handleMouseUp = () => {
            if (dragRef.current && !dragRef.current.moved) {
                onToggle();
            }
            dragRef.current = null;
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
    }, [onResizeStart, onToggle]);

    const headerContent = (
        <div
            className={`sidenav-section-header-wrapper ${isResizing ? "resizing" : ""}`}
        >
            {/* Thin resize handle at the top edge */}
            {onResizeStart && (
                <div
                    className="sidenav-resize-edge"
                    onMouseDown={handleResizeDown}
                />
            )}
            <button
                className="sidenav-section-header"
                onClick={onToggle}
            >
                <span className={`sidenav-section-chevron ${collapsed ? "" : "rotated"}`}>
                    {getIcon("chevronLeft")}
                </span>
                <span className="sidenav-section-header-icon">{getIcon(icon)}</span>
                <span className="sidenav-section-header-title">{title}</span>
                {count !== undefined && count > 0 && (
                    <span className="sidenav-section-count">{count}</span>
                )}
            </button>
            {actions && <div className="sidenav-section-actions">{actions}</div>}
        </div>
    );

    // If sectionHeight is provided, wrap in resizable container
    if (sectionHeight !== undefined) {
        let style: React.CSSProperties = { minHeight: '32px' };
        if (collapsed) {
            style.height = 'auto';
            style.flexShrink = 0;
        } else if (isLastExpanded) {
            style.flex = 1;
            style.height = 'auto';
        } else {
            style.height = catalogMessage("common.general.px", { value0: sectionHeight });
            style.flexShrink = 0;
        }

        return (
            <div className="sidenav-resizable-section" style={style}>
                {headerContent}
                {!collapsed && children}
            </div>
        );
    }

    // Fallback: no resizable wrapper
    return (
        <>
            {headerContent}
            {!collapsed && children}
        </>
    );
}
