import { catalogMessage } from "@/lib/i18n";
import { Dialog, Button, NumberInput } from "@/components/ui";
import { Select } from "@/components/ui/select";
import { TextInput } from "@/components/ui/TextInput";
import { Textarea } from "@/components/ui/Textarea";

interface TransactionFormDialogProps {
    isOpen: boolean;
    onClose: () => void;
    isCustomId: boolean;
    transactionType: "receipt" | "invoice";
    transactionAmount: string;
    transactionDate: string;
    transactionDescription: string;
    setTransactionType: (val: "receipt" | "invoice") => void;
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
            title={isCustomId ? catalogMessage("text_3c2a40dbd0cf") : catalogMessage("text_993b4ae77923")}
            footer={
                <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={onClose}>
                        {catalogMessage("text_9a30dc2a96b8")}</Button>
                    <Button variant="primary" onClick={onSave}>
                        {catalogMessage("text_ddfcaf9d0144")}</Button>
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
                    label={catalogMessage("text_5df11e896245")}
                    id="trans-type"
                    value={transactionType}
                    onChange={(e) => setTransactionType(e.target.value as typeof transactionType)}
                    required
                    disabled={isCustomId}
                    options={[
                        { value: "receipt", label: catalogMessage("text_79cec3ad767e") },
                        { value: "invoice", label: catalogMessage("text_a54ed19d05ca") },
                    ]}
                />
                <div className="form-row">
                    <NumberInput
                        label={catalogMessage("text_3cfbd3350215")}
                        id="trans-amount"
                        value={transactionAmount}
                        onChange={(val) => setTransactionAmount(val)}
                        step={0.01}
                        required
                        className="flex-1"
                    />
                    <TextInput
                        type="date"
                        label={catalogMessage("text_24ab9ad4f30d")}
                        id="trans-date"
                        value={transactionDate}
                        onChange={(e) => setTransactionDate(e.target.value)}
                        required
                        disabled={isCustomId}
                        className="flex-1"
                    />
                </div>
                <Textarea
                    label={catalogMessage("text_7727f8e68bc9")}
                    id="trans-desc"
                    rows={3}
                    value={transactionDescription}
                    onChange={(e) => setTransactionDescription(e.target.value)}
                />
            </form>
        </Dialog>
    );
}
