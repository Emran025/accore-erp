import { catalogMessage } from "@/lib/i18n";
import { Button, DateRangePicker, Dialog, FilterActions, FilterGroup } from "@/components/ui";
import { Select } from "@/components/ui/select";

interface Filters {
    search: string;
    type: string;
    date_from: string;
    date_to: string;
}

interface ServiceReturnsFilterDialogProps {
    isOpen: boolean;
    onClose: () => void;
    filters: Filters;
    setFilters: (filters: Filters) => void;
    onApply: () => void;
}

export function ServiceReturnsFilterDialog({
    isOpen,
    onClose,
    filters,
    setFilters,
    onApply,
}: ServiceReturnsFilterDialogProps) {
    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title={catalogMessage("commercial.servicereturnsfilterdialog.filterServiceReturns")}
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
                        onStartDateChange={(val) => setFilters({ ...filters, date_from: val })}
                        onEndDateChange={(val) => setFilters({ ...filters, date_to: val })}
                    />
                </FilterGroup>
                <Select
                    label={catalogMessage("common.general.originalInvoiceType")}
                    id="filter-type"
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    options={[
                        { value: "", label: catalogMessage("common.general.all") },
                        { value: "cash", label: catalogMessage("commercial.servicereturnsfilterdialog.cashCashServices") },
                        { value: "credit", label: catalogMessage("commercial.servicereturnsfilterdialog.creditAccountsReceivable") },
                    ]}
                />
            </div>
        </Dialog>
    );
}
