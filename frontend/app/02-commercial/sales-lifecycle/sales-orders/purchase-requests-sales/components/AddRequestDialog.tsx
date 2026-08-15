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
        subtitle: catalogMessage("commercial.addrequestdialog.inventory", { value0: p.stock_quantity }),
    }));

    const handleSubmit = async () => {
        if (!formData.quantity) {
            showToast(catalogMessage("commercial.addrequestdialog.pleaseEnterQuantity"), "error");
            return;
        }

        if (!formData.product_id && !formData.product_name) {
            showToast(catalogMessage("commercial.addrequestdialog.pleaseSelectProductEnterItsName"), "error");
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
            title={catalogMessage("commercial.addrequestdialog.newPurchaseRequest")}
            maxWidth="600px"
            footer={
                <>
                    <button className="btn btn-secondary" onClick={onClose} disabled={isSaving}>{catalogMessage("common.general.cancel")}</button>
                    <button className="btn btn-primary" onClick={handleSubmit} disabled={isSaving}>
                        {isSaving ? catalogMessage("common.general.saving") : catalogMessage("commercial.addrequestdialog.confirmOrder")}
                    </button>
                </>
            }
        >
            <div className="form-group">
                <label>{catalogMessage("commercial.addrequestdialog.productIfAny")}</label>
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
                    placeholder={catalogMessage("commercial.addrequestdialog.searchProduct")}
                />
            </div>
            {!formData.product_id && (
                <div className="form-group">
                    <label>{catalogMessage("commercial.addrequestdialog.enterProductNameManually")}</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder={catalogMessage("commercial.addrequestdialog.itemProductName")}
                        value={formData.product_name}
                        onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                    />
                </div>
            )}
            <div className="form-group">
                <label>{catalogMessage("common.general.quantityRequired")}</label>
                <input
                    type="number"
                    className="form-control"
                    placeholder={catalogMessage("common.general.quantity.alternative3")}
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    min="1"
                />
            </div>
            <div className="form-group">
                <label>{catalogMessage("commercial.addrequestdialog.additionalNotes")}</label>
                <textarea
                    className="form-control"
                    placeholder={catalogMessage("commercial.addrequestdialog.reasonRequestSpecificSpecificationsEtc")}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                />
            </div>
        </Dialog>
    );
};
