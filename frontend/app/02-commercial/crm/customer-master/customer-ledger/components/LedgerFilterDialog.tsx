import { catalogMessage } from "@/lib/i18n";
import { Dialog, FilterActions, Button, FilterGroup, DateRangePicker } from "@/components/ui";
import { Select } from "@/components/ui/select";

interface Filters {
    search: string;
    type: string;
    date_from: string;
    date_to: string;
}

interface LedgerFilterDialogProps {
    isOpen: boolean;
    onClose: () => void;
    filters: Filters;
    setFilters: (filters: Filters) => void;
    onApply: () => void;
}

export function LedgerFilterDialog({
    isOpen,
    onClose,
    filters,
    setFilters,
    onApply
}: LedgerFilterDialogProps) {
    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title={catalogMessage("common.general.filterOperations")}
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
                    label={catalogMessage("common.general.transactionType")}
                    id="filter-type"
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    options={[
                        { value: "", label: catalogMessage("common.general.all") },
                        { value: "invoice", label: catalogMessage("common.general.salesInvoice") },
                        { value: "receipt", label: catalogMessage("commercial.ledgerfilterdialog.receiptVoucherPayment") },
                        { value: "return", label: catalogMessage("common.general.return") },
                    ]}
                />
            </div>
        </Dialog>
    );
}
