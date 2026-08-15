import { catalogMessage } from "@/lib/i18n";
import { Button, Dialog, NumberInput } from "@/components/ui";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/Textarea";
import { TextInput } from "@/components/ui/TextInput";

interface TransactionFormDialogProps {
    isOpen: boolean;
    onClose: () => void;
    isCustomId: boolean;
    transactionType: "payment" | "invoice";
    transactionAmount: string;
    transactionDate: string;
    transactionDescription: string;
    setTransactionType: (val: "payment" | "invoice") => void;
    setTransactionAmount: (val: string) => void;
    setTransactionDate: (val: string) => void;
    setTransactionDescription: (val: string) => void;
    onSave: () => void;
}

export function TransactionFormDialog({
    isOpen,
    onClose,
    isCustomId,
    transactionType,
    transactionAmount,
    transactionDate,
    transactionDescription,
    setTransactionType,
    setTransactionAmount,
    setTransactionDate,
    setTransactionDescription,
    onSave
}: TransactionFormDialogProps) {
    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title={isCustomId ? catalogMessage("common.general.editOperation") : catalogMessage("common.general.recordNewTransaction")}
            footer={
                <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={onClose}>
                        {catalogMessage("common.general.cancel")}</Button>
                    <Button variant="primary" onClick={onSave}>
                        {catalogMessage("common.general.save")}</Button>
                </div>
            }
        >
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    onSave();
                }}
                className="space-y-4"
            >
                <Select
                    label={catalogMessage("common.general.operationType")}
                    id="trans-type"
                    value={transactionType}
                    onChange={(e) => setTransactionType(e.target.value as typeof transactionType)}
                    required
                    disabled={isCustomId}
                    options={[
                        { value: "payment", label: catalogMessage("supplyChain.transactionformdialog.disbursementVoucherCashPayment") },
                        { value: "invoice", label: catalogMessage("common.general.invoiceCreditManual") },
                    ]}
                />
                <div className="form-row">
                    <NumberInput
                        label={catalogMessage("common.general.amount.alternative3")}
                        id="trans-amount"
                        value={transactionAmount}
                        onChange={(val) => setTransactionAmount(val)}
                        step={0.01}
                        required
                        className="flex-1"
                    />
                    <TextInput
                        type="date"
                        label={catalogMessage("common.general.date.alternative3")}
                        id="trans-date"
                        value={transactionDate}
                        onChange={(e) => setTransactionDate(e.target.value)}
                        required
                        disabled={isCustomId}
                        className="flex-1"
                    />
                </div>
                <Textarea
                    label={catalogMessage("common.general.descriptionStatement")}
                    id="trans-desc"
                    rows={3}
                    value={transactionDescription}
                    onChange={(e) => setTransactionDescription(e.target.value)}
                />
            </form>
        </Dialog>
    );
}
