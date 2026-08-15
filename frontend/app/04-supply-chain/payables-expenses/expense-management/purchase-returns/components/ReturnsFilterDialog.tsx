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
            title={catalogMessage("common.general.filterReturns")}
            footer={
                <FilterActions>
                    <Button variant="secondary" onClick={onClose}>
                        {catalogMessage("common.general.cancel")}</Button>
                    <Button variant="primary" onClick={onApply}>
                        {catalogMessage("common.general.apply")}</Button>
                </FilterActions>
            }
        >
            <div className="space-y-4">
                <FilterGroup label={catalogMessage("common.general.period")}>
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
