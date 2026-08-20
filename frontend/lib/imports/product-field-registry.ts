import { importClassAliases, importCopy } from "@/lib/i18n/import-copy";
import type { ImportApprovalRequirement, ImportField, ImportRow } from "./import-model";

export const PRODUCT_IMPORT_SCHEMA_VERSION = "product-import.v1";
export type ProductClass = "product" | "service" | "raw_material";

export interface ProductFieldLabels {
    name: string;
    barcode: string;
    itemType: string;
    category: string;
    purchasePrice: string;
    salePrice: string;
    profitMargin: string;
    unitName: string;
    unitsPerPackage: string;
    currentInventory: string;
    minimumStock: string;
    inventoryTracking: string;
    sellable: string;
    taxable: string;
    description: string;
}

export interface ProductClassPolicy {
    inventoryControlDefault: boolean;
    sellableDefault: boolean;
    stockAllowed: boolean;
    purchaseCostAllowed: boolean;
    approvalFields: readonly string[];
}

export const PRODUCT_CLASS_POLICIES: Record<ProductClass, ProductClassPolicy> = {
    product: {
        inventoryControlDefault: true,
        sellableDefault: true,
        stockAllowed: true,
        purchaseCostAllowed: true,
        approvalFields: ["catalog_code", "purchase_price", "stock_quantity"],
    },
    service: {
        inventoryControlDefault: false,
        sellableDefault: true,
        stockAllowed: false,
        purchaseCostAllowed: true,
        approvalFields: ["catalog_code", "purchase_price"],
    },
    raw_material: {
        inventoryControlDefault: true,
        sellableDefault: false,
        stockAllowed: true,
        purchaseCostAllowed: true,
        approvalFields: ["catalog_code", "purchase_price", "stock_quantity", "item_type"],
    },
};

export function normalizeProductClass(value: unknown): ProductClass {
    const normalized = String(value ?? "").trim().toLocaleLowerCase().replace(/[\s-]+/g, "_");
    if (importClassAliases.service.some((value) => value === normalized)) return "service";
    if (importClassAliases.rawMaterial.some((value) => value.replace(/\s+/g, "_") === normalized)) return "raw_material";
    return "product";
}

export function buildProductImportFields(labels: ProductFieldLabels, aliases: Record<string, readonly string[]>): ImportField[] {
    return [
        { id: "name", label: labels.name, aliases: aliases.name ?? [], type: "text", required: true, group: "identity", approval: "none" },
        { id: "barcode", label: labels.barcode, aliases: aliases.barcode ?? [], type: "text", group: "identity", approval: "required", sensitive: true },
        { id: "item_type", label: labels.itemType, aliases: aliases.itemType ?? [], type: "class", required: true, group: "classification", approval: "required", sensitive: true },
        { id: "category_id", label: labels.category, aliases: aliases.category ?? [], type: "text", group: "classification", approval: "review" },
        { id: "purchase_price", label: labels.purchasePrice, aliases: aliases.purchasePrice ?? [], type: "number", group: "commercial", approval: "required", sensitive: true },
        { id: "unit_price", label: labels.salePrice, aliases: aliases.unitPrice ?? [], type: "number", required: true, group: "commercial", approval: "review" },
        { id: "minimum_profit_margin", label: labels.profitMargin, aliases: aliases.profitMargin ?? [], type: "number", group: "commercial", approval: "review" },
        { id: "unit_name", label: labels.unitName, aliases: aliases.unitName ?? [], type: "text", group: "inventory", approval: "none" },
        { id: "items_per_unit", label: labels.unitsPerPackage, aliases: aliases.itemsPerUnit ?? [], type: "number", group: "inventory", approval: "review" },
        { id: "stock_quantity", label: labels.currentInventory, aliases: aliases.stock ?? [], type: "number", group: "inventory", dependsOn: "item_type", dependsOnValues: ["product", "raw_material"], approval: "required", sensitive: true },
        { id: "low_stock_threshold", label: labels.minimumStock, aliases: aliases.lowStock ?? [], type: "number", group: "inventory", dependsOn: "item_type", dependsOnValues: ["product", "raw_material"], approval: "review" },
        { id: "inventory_control", label: labels.inventoryTracking, aliases: aliases.inventoryControl ?? [], type: "boolean", group: "inventory", dependsOn: "item_type", dependsOnValues: ["product", "raw_material"], approval: "required", sensitive: true },
        { id: "sellable", label: labels.sellable, aliases: aliases.sellable ?? [], type: "boolean", group: "classification", dependsOn: "item_type", dependsOnValues: ["product", "service"], approval: "required", sensitive: true },
        { id: "taxable", label: labels.taxable, aliases: aliases.taxable ?? [], type: "boolean", group: "additional", approval: "required", sensitive: true },
        { id: "description", label: labels.description, aliases: aliases.description ?? [], type: "text", group: "additional", approval: "none" },
    ];
}

export function applyProductClassPolicy(row: ImportRow, mappedFields: ReadonlySet<string>): ImportRow {
    const itemType = normalizeProductClass(row.item_type);
    const policy = PRODUCT_CLASS_POLICIES[itemType];
    return {
        ...row,
        item_type: itemType,
        inventory_control: policy.stockAllowed ? (mappedFields.has("inventory_control") ? Boolean(row.inventory_control) : policy.inventoryControlDefault) : false,
        sellable: itemType === "raw_material" ? false : (mappedFields.has("sellable") ? Boolean(row.sellable) : policy.sellableDefault),
        stock_quantity: policy.stockAllowed ? Number(row.stock_quantity ?? 0) : 0,
        purchase_price: policy.purchaseCostAllowed ? Number(row.purchase_price ?? 0) : 0,
    };
}

export function getProductApprovalRequirements(rows: ImportRow[], fields: readonly ImportField[]): ImportApprovalRequirement[] {
    const sensitiveFields = fields.filter((field) => field.approval === "required" && field.sensitive && rows.some((row) => String(row[field.id] ?? "").trim() !== ""));
    if (!sensitiveFields.length) return [];
    return [{
        key: "sensitive-product-fields",
        level: "required",
        label: importCopy("approvalCheckpoint"),
        reason: importCopy("approvalDescription"),
        fieldIds: sensitiveFields.map((field) => field.id),
    }];
}

export function isProductFieldVisible(field: ImportField, rows: readonly ImportRow[]): boolean {
    if (!field.dependsOn || !field.dependsOnValues?.length || rows.length === 0) return true;
    return rows.some((row) => field.dependsOnValues?.includes(normalizeProductClass(row[field.dependsOn as string])));
}
