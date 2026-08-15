import { catalogMessage } from "@/lib/i18n";
import { Button, DateRangePicker, Dialog, FilterActions, FilterGroup } from "@/components/ui";

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
                        onStartDateChange={(val: string) => setFilters({ ...filters, date_from: val })}
                        onEndDateChange={(val: string) => setFilters({ ...filters, date_to: val })}
                    />
                </FilterGroup>
            </div>
        </Dialog>
    );
}
