import { getIcon } from "@/lib/icons";
import { showToast } from "./Toast";

export type AlertType = "success" | "error" | "warning" | "info";

interface AlertProps {
  type: AlertType;
  message: string;
  style?: React.CSSProperties;
  onClose?: () => void;
}

/**
 * Inline alert presentation retained only for explicit, local form composition.
 * Application-level operational feedback must use `showAlert` or `showToast` so
 * it is retained in the global status notification center.
 */
export function Alert({ type, message, style, onClose }: AlertProps) {
  const iconName = type === "success" ? "check" : type === "error" ? "x" : "alert";

  return (
    <div className={`alert alert-${type}`} style={style}>
      {getIcon(iconName)}
      <span>{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="close-btn"
          style={{ position: "relative", left: "auto", marginRight: "auto" }}
        >
          ×
        </button>
      )}
    </div>
  );
}

/**
 * Compatibility API for legacy pages. The container parameter remains accepted
 * so callers do not need to change, but all operational feedback now appears
 * exclusively in the permanent status notification center.
 */
export function showAlert(_containerId: string, message: string, type: AlertType = "success"): void {
  showToast(message, type, { source: "legacy-alert" });
}
