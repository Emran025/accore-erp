import React from "react";
import { getIcon } from "@/lib/icons";

export interface SidebarFolderProps {
    folderKey: string;
    label: string;
    icon: string;
    color: string;
    layerColor?: string;
    depth?: number;
    isExpanded: boolean;
    isActiveGroup: boolean;
    sideNavCollapsed: boolean;
    onToggle: (key: string) => void;
    onFolderClick?: (key: string) => void;
    onContextMenu: (e: React.MouseEvent, path: string, type: "screen" | "folder") => void;
    title?: string;
    children?: React.ReactNode;
}

export function SidebarFolder({
    folderKey,
    label,
    icon,
    color,
    layerColor,
    depth = 0,
    isExpanded,
    isActiveGroup,
    sideNavCollapsed,
    onToggle,
    onFolderClick,
    onContextMenu,
    title,
    children,
}: SidebarFolderProps) {
    /**
     * Clicking the folder row navigates to the card view.
     * The chevron toggle is a separate button for expand/collapse.
     */
    const handleFolderRowClick = () => {
        if (onFolderClick) {
            onFolderClick(folderKey);
        }
    };

    const handleToggleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggle(folderKey);
    };

    return (
        <div className="sidenav-folder-group">
            <div
                className={`sidenav-folder ${isExpanded ? "expanded" : ""} ${isActiveGroup ? "active-group" : ""}`}
                onClick={handleFolderRowClick}
                onContextMenu={(e) => onContextMenu(e, folderKey, "folder")}
                title={title || label}
            >
                {!sideNavCollapsed && (
                    <div
                        className={`sidenav-folder-toggle-btn ${isExpanded ? "rotated" : ""}`}
                        style={{
                            backgroundColor: isExpanded ? (layerColor + "4e") : "transparent",
                            color: isExpanded ? "#1e293b" : layerColor,
                            borderColor: isExpanded ? (layerColor + "4e") : "#fff",
                            borderWidth: "1.5px",
                            borderStyle: "solid",
                            // boxShadow: isExpanded ? `0 0 10px ${layerColor}60` : "none"
                        }}
                        onClick={handleToggleClick}
                    >
                        {getIcon("chevronLeft")}
                    </div>
                )}
                <span className="sidenav-folder-icon" style={{ color }}>
                    {getIcon(icon)}
                </span>
                {!sideNavCollapsed && (
                    <span className="sidenav-folder-label">{label}</span>
                )}
            </div>

            {isExpanded && !sideNavCollapsed && children && (
                <div
                    className="sidenav-folder-children"
                    style={{ borderRight: `2px solid ${layerColor}40` }}
                >
                    {children}
                </div>
            )}
        </div>
    );
}
