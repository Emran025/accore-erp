import { catalogMessage } from "@/lib/i18n";
import { getIcon } from "@/lib/icons";

export interface ContextMenuPortalProps {
    x: number;
    y: number;
    type: "screen" | "folder";
    path: string;
    isFavorite: boolean;
    isRecent?: boolean;
    onAddFavorite: () => void;
    onRemoveFavorite: () => void;
    onRemoveRecent?: () => void;
    onOpen: () => void;
    onClose: () => void;
}

export function ContextMenuPortal({
    x,
    y,
    type,
    path,
    isFavorite,
    isRecent,
    onAddFavorite,
    onRemoveFavorite,
    onRemoveRecent,
    onOpen,
    onClose,
}: ContextMenuPortalProps) {
    return (
        <div
            className="sidenav-context-menu"
            style={{ top: y, left: x }}
            onClick={(e) => e.stopPropagation()}
        >
            {type === "screen" && (
                <button
                    className="sidenav-context-item"
                    onClick={() => { onOpen(); onClose(); }}
                >
                    {getIcon("chevron-right")}
                    <span>Open</span>
                </button>
            )}
            {type === "screen" && (
                !isFavorite ? (
                    <button
                        className="sidenav-context-item"
                        onClick={() => { onAddFavorite(); onClose(); }}
                    >
                        {getIcon("star")}
                        <span>{catalogMessage("components.contextmenuportal.addFavorites")}</span>
                    </button>
                ) : (
                    <button
                        className="sidenav-context-item danger"
                        onClick={() => { onRemoveFavorite(); onClose(); }}
                    >
                        {getIcon("x")}
                        <span>{catalogMessage("components.contextmenuportal.removeFavorites")}</span>
                    </button>
                )
            )}
            {type === "screen" && isRecent && onRemoveRecent && (
                <button
                    className="sidenav-context-item danger"
                    onClick={() => { onRemoveRecent(); onClose(); }}
                >
                    {getIcon("x")}
                    <span>{catalogMessage("components.contextmenuportal.removeRecent")}</span>
                </button>
            )}
        </div>
    );
}
