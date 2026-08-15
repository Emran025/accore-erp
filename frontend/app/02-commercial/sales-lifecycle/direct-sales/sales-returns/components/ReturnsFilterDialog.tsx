import { catalogMessage } from "@/lib/i18n";
import { Button, DateRangePicker, Dialog, FilterActions, FilterGroup } from "@/components/ui";
import { Select } from "@/components/ui/select";

interface Filters {
    search: string;
    type: string;
    date_from: string;
    date_to: string;
}

interface ReturnsFilterDialogProps {
    isOpen: boolean;
    onClose: () => void;
    filters: Filters;
    setFilters: (filters: Filters) => void;
    onApply: () => void;
}

export function ReturnsFilterDialog({
    isOpen,
    onClose,
    filters,
    setFilters,
    onApply,
}: ReturnsFilterDialogProps) {
    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title={catalogMessage("text_05f2597cfac8")}
            footer={
                <FilterActions>
                    <Button variant="secondary" onClick={onClose}>
                        {catalogMessage("text_9a30dc2a96b8")}</Button>
                    <Button variant="primary" onClick={onApply}>
                        {catalogMessage("text_268974da5082")}</Button>
                </FilterActions>
            }
        >
            <div className="space-y-4">
                <FilterGroup label={catalogMessage("text_0335edfeb5f3")}>
                    <DateRangePicker
                        startDate={filters.date_from}
                        endDate={filters.date_to}
                        onStartDateChange={(val) => setFilters({ ...filters, date_from: val })}
                        onEndDateChange={(val) => setFilters({ ...filters, date_to: val })}
                    />
                </FilterGroup>
                <Select
                    label={catalogMessage("text_1c1c3361a6b2")}
                    id="filter-type"
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    options={[
                        { value: "", label: catalogMessage("text_65f276da33cf") },
                        { value: "cash", label: catalogMessage("text_4d165f667236") },
                        { value: "credit", label: catalogMessage("text_19897d1c8912") },
                    ]}
                />
            </div>
        </Dialog>
    );
}
