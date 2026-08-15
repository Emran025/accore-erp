import { catalogMessage } from "@/lib/i18n";
import { FilterSection, FilterGroup } from "@/components/ui";
import { getIcon } from "@/lib/icons";
import { Customer } from "@/types";

interface CustomerInfoSectionProps {
    customer: Customer | null;
    showDeleted: boolean;
    onShowDeletedChange: (checked: boolean) => void;
}

export function CustomerInfoSection({ customer, showDeleted, onShowDeletedChange }: CustomerInfoSectionProps) {
    if (!customer) return null;

    return (
        <FilterSection className="animate-fade" style={{ marginBottom: "1.5rem" }}>
            <div className="title-with-icon">
                <div className="stat-icon products" style={{ width: "45px", height: "45px", fontSize: "1.2rem" }}>
                    {getIcon("user")}
                </div>
                <div>
                    <h3 style={{ margin: 0 }}>{customer.name}</h3>
                    <p className="text-muted" style={{ margin: 0, fontSize: "0.85rem" }}>
                        {customer.phone || catalogMessage("text_04cf43a4d120")} | {customer.tax_number || catalogMessage("text_6ae0f7c2b614")}
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
