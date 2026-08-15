import { catalogMessage } from "@/lib/i18n";
import { Dialog, SearchableSelect, SelectOption, showToast } from "@/components/ui";
import { Product } from "@/types";
import React, { useState } from "react";

interface AddRequestDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { product_id: string; product_name: string; quantity: number; notes: string }) => Promise<void>;
    products: Product[];
}

export const AddRequestDialog: React.FC<AddRequestDialogProps> = ({
    isOpen,
    onClose,
    onSave,
    products,
}) => {
    const [formData, setFormData] = useState({
        product_id: "",
        product_name: "",
        quantity: "",
        notes: "",
    });

    const [isSaving, setIsSaving] = useState(false);

    const productOptions: SelectOption[] = products.map((p) => ({
        value: p.id,
        label: p.name,
        subtitle: catalogMessage("text_12227f24f5ed", { value0: p.stock_quantity }),
    }));

    const handleSubmit = async () => {
        if (!formData.quantity) {
            showToast(catalogMessage("text_b0bce0a98e4a"), "error");
            return;
        }

        if (!formData.product_id && !formData.product_name) {
            showToast(catalogMessage("text_a5045cefb9c9"), "error");
            return;
        }

        try {
            setIsSaving(true);
            await onSave({
                ...formData,
                quantity: parseFloat(formData.quantity) || 1,
            });
            setFormData({ product_id: "", product_name: "", quantity: "", notes: "" });
            onClose();
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title={catalogMessage("text_e68546925c8f")}
            maxWidth="600px"
            footer={
                <>
                    <button className="btn btn-secondary" onClick={onClose} disabled={isSaving}>{catalogMessage("text_9a30dc2a96b8")}</button>
                    <button className="btn btn-primary" onClick={handleSubmit} disabled={isSaving}>
                        {isSaving ? catalogMessage("text_8688b0ff5f34") : catalogMessage("text_fb4a312e86ac")}
                    </button>
                </>
            }
        >
            <div className="form-group">
                <label>{catalogMessage("text_9c4eaf1f344a")}</label>
                <SearchableSelect
                    options={productOptions}
                    value={formData.product_id ? parseInt(formData.product_id) : null}
                    onChange={(val) => {
                        const prod = products.find(p => p.id === val);
                        setFormData({
                            ...formData,
                            product_id: val ? String(val) : "",
                            product_name: prod ? prod.name : "",
                        });
                    }}
                    placeholder={catalogMessage("text_157755d2bc65")}
                />
            </div>
            {!formData.product_id && (
                <div className="form-group">
                    <label>{catalogMessage("text_bf0829be70fc")}</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder={catalogMessage("text_baa2ca8d4fd4")}
                        value={formData.product_name}
                        onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                    />
                </div>
            )}
            <div className="form-group">
                <label>{catalogMessage("text_13ab4244836f")}</label>
                <input
                    type="number"
                    className="form-control"
                    placeholder={catalogMessage("text_935e21853946")}
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    min="1"
                />
            </div>
            <div className="form-group">
                <label>{catalogMessage("text_d90508176b1a")}</label>
                <textarea
                    className="form-control"
                    placeholder={catalogMessage("text_a7b0a7a6505b")}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                />
            </div>
        </Dialog>
    );
};
