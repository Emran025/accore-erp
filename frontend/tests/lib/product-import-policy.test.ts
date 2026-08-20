import { describe, expect, it } from "vitest";
import { applyProductClassPolicy, buildProductImportFields, getProductApprovalRequirements, isProductFieldVisible, normalizeProductClass } from "@/lib/imports/product-field-registry";

const aliases = {
    name: ["name"], barcode: ["barcode"], itemType: ["item type"], category: ["category"], purchasePrice: ["purchase price"], unitPrice: ["unit price"], profitMargin: ["margin"], unitName: ["unit"], itemsPerUnit: ["items per unit"], stock: ["stock"], lowStock: ["reorder level"], inventoryControl: ["inventory control"], sellable: ["sellable"], taxable: ["taxable"], description: ["description"],
};

const labels = {
    name: "Name", barcode: "Barcode", itemType: "Item type", category: "Category", purchasePrice: "Purchase price", salePrice: "Sale price", profitMargin: "Profit margin", unitName: "Unit", unitsPerPackage: "Units per package", currentInventory: "Inventory", minimumStock: "Minimum stock", inventoryTracking: "Inventory tracking", sellable: "Sellable", taxable: "Taxable", description: "Description",
};

describe("product import policy", () => {
    it("normalizes external class labels to canonical item types", () => {
        expect(normalizeProductClass("raw material")).toBe("raw_material");
        expect(normalizeProductClass("خدمة")).toBe("service");
        expect(normalizeProductClass("unknown value")).toBe("product");
    });

    it("enforces service and raw-material class defaults", () => {
        expect(applyProductClassPolicy({ item_type: "service", inventory_control: true, stock_quantity: 12, sellable: true }, new Set())).toMatchObject({ item_type: "service", inventory_control: false, stock_quantity: 0 });
        expect(applyProductClassPolicy({ item_type: "raw_material", sellable: true }, new Set(["sellable"]))).toMatchObject({ item_type: "raw_material", sellable: false, inventory_control: true });
    });

    it("reveals dependent inventory fields only for stock-bearing classes", () => {
        const fields = buildProductImportFields(labels, aliases);
        const stockField = fields.find((field) => field.id === "stock_quantity");
        expect(stockField).toBeDefined();
        expect(isProductFieldVisible(stockField!, [{ item_type: "service" }])).toBe(false);
        expect(isProductFieldVisible(stockField!, [{ item_type: "product" }])).toBe(true);
    });

    it("derives required approval fields from sensitive imported values", () => {
        const fields = buildProductImportFields(labels, aliases);
        const requirements = getProductApprovalRequirements([{ item_type: "product", barcode: "SKU-1", purchase_price: 10, stock_quantity: 5 }], fields);
        expect(requirements).toHaveLength(1);
        expect(requirements[0]?.level).toBe("required");
        expect(requirements[0]?.fieldIds).toEqual(expect.arrayContaining(["item_type", "barcode", "purchase_price", "stock_quantity"]));
    });
});
