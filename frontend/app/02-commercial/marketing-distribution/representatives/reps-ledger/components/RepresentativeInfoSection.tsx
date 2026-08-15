import { catalogMessage } from "@/lib/i18n";
import { FilterSection, FilterGroup } from "@/components/ui";
import { getIcon } from "@/lib/icons";
import { Representative } from "@/types";

interface RepresentativeInfoSectionProps {
    representative: Representative | null;
    showDeleted: boolean;
    onShowDeletedChange: (checked: boolean) => void;
}

export function RepresentativeInfoSection({ representative, showDeleted, onShowDeletedChange }: RepresentativeInfoSectionProps) {
    if (!representative) return null;

    return (
        <FilterSection className="animate-fade" style={{ marginBottom: "1.5rem" }}>
            <div className="title-with-icon">
                <div className="stat-icon products" style={{ width: "45px", height: "45px", fontSize: "1.2rem" }}>
                    {getIcon("user")}
                </div>
                <div>
                    <h3 style={{ margin: 0 }}>{representative.name}</h3>
                    <p className="text-muted" style={{ margin: 0, fontSize: "0.85rem" }}>
                        {representative.phone || catalogMessage("text_04cf43a4d120")} | {representative.email || catalogMessage("text_9952acd0ca96")}
                    </p>
                </div>
            </div>

            <FilterGroup className="checkbox-group" style={{ marginLeft: "auto", flexDirection: "row", alignItems: "center", gap: "0.5rem" }}>
                <input
                    type="checkbox"
                    id="show-deleted-toggle"
                    checked={showDeleted}
                    onChange={(e) => onShowDeletedChange(e.target.checked)}
                />
                <label htmlFor="show-deleted-toggle" style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: 0, cursor: "pointer" }}>
                    {catalogMessage("text_8860744ad348")}</label>
            </FilterGroup>
        </FilterSection>
    );
}
