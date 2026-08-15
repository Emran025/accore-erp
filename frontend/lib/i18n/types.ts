import type { CatalogDictionary } from "./catalog";

export const supportedLocales = ["ar-SA", "en-US"] as const;

export type SupportedLocale = (typeof supportedLocales)[number];
export type TextDirection = "rtl" | "ltr";

export interface LocaleMetadata {
    code: SupportedLocale;
    languageTag: string;
    direction: TextDirection;
    formattingLocale: string;
    fontFamily: string;
    displayName: string;
    nativeName: string;
    fallback: SupportedLocale | null;
}

export interface AppDictionary {
    /** Generated, exhaustive interface-text catalog keyed by stable source IDs. */
    catalog: CatalogDictionary;
    common: {
        loading: string;
        save: string;
        cancel: string;
        delete: string;
        edit: string;
        add: string;
        search: string;
        actions: string;
        yes: string;
        no: string;
        confirm: string;
        close: string;
        view: string;
        print: string;
        back: string;
        retry: string;
    };
    auth: {
        login: string;
        logout: string;
        username: string;
        password: string;
        loginTitle: string;
        loginError: string;
        sessionExpired: string;
    };
    dashboard: {
        title: string;
        dailySales: string;
        totalProducts: string;
        lowStock: string;
        expiringSoon: string;
        recentSales: string;
        quickActions: string;
        newSale: string;
        addProduct: string;
        viewReports: string;
    };
    sales: {
        title: string;
        invoices: string;
        invoiceNumber: string;
        invoiceDate: string;
        totalAmount: string;
        paymentType: string;
        cash: string;
        credit: string;
        customer: string;
        addToInvoice: string;
        finishInvoice: string;
        currentInvoice: string;
        invoiceHistory: string;
        noItems: string;
        selectProduct: string;
        quantity: string;
        price: string;
        subtotal: string;
        total: string;
        discount: string;
        tax: string;
        grandTotal: string;
    };
    inventory: {
        products: string;
        productName: string;
        category: string;
        purchasePrice: string;
        sellingPrice: string;
        stock: string;
        unit: string;
        barcode: string;
        description: string;
        addNewProduct: string;
        editProduct: string;
        productDetails: string;
        lowStockAlert: string;
        expiryDate: string;
    };
    procurement: {
        purchases: string;
        supplier: string;
        purchaseDate: string;
        addNewPurchase: string;
        editPurchase: string;
        purchaseDetails: string;
    };
    expenses: {
        title: string;
        category: string;
        amount: string;
        date: string;
        description: string;
        addNew: string;
        edit: string;
        rent: string;
        utilities: string;
        salaries: string;
        maintenance: string;
        other: string;
    };
    users: {
        title: string;
        fullName: string;
        role: string;
        admin: string;
        cashier: string;
        manager: string;
        active: string;
        inactive: string;
        addNew: string;
        edit: string;
    };
    settings: {
        title: string;
        storeInfo: string;
        storeName: string;
        storeAddress: string;
        storePhone: string;
        storeEmail: string;
        taxNumber: string;
        invoiceSettings: string;
        accountSettings: string;
        changePassword: string;
        currentPassword: string;
        newPassword: string;
        confirmPassword: string;
    };
    feedback: {
        saved: string;
        deleted: string;
        added: string;
        updated: string;
        errorOccurred: string;
        confirmDelete: string;
        noData: string;
        requiredField: string;
        invalidInput: string;
        unavailable: string;
        missingTranslation: string;
    };
    pagination: {
        previous: string;
        next: string;
        page: string;
        of: string;
        showing: string;
        entries: string;
    };
    finance: {
        revenues: string;
        generalLedger: string;
        journalEntries: string;
        trialBalance: string;
        accountHistory: string;
        chartOfAccounts: string;
        journalVouchers: string;
        debit: string;
        credit: string;
        balance: string;
        account: string;
        reference: string;
        notes: string;
    };
    permissions: {
        rolesPermissions: string;
        createRole: string;
        roleName: string;
        permissions: string;
        module: string;
        canView: string;
        canCreate: string;
        canEdit: string;
        canDelete: string;
    };
    sessions: {
        activeSessions: string;
        device: string;
        ipAddress: string;
        lastActivity: string;
        terminateSession: string;
    };
    reports: {
        title: string;
        sales: string;
        purchases: string;
        inventory: string;
        profit: string;
        exportPdf: string;
        exportExcel: string;
        exportCsv: string;
        printSavePdf: string;
    };
    dates: {
        today: string;
        yesterday: string;
        thisWeek: string;
        thisMonth: string;
        thisYear: string;
        from: string;
        to: string;
        range: string;
    };
    units: {
        piece: string;
        box: string;
        kilogram: string;
        gram: string;
        liter: string;
        meter: string;
    };
    analytics: {
        totalSales: string;
        totalExpenses: string;
        totalRevenues: string;
        totalAssets: string;
        todayExpenses: string;
        todayRevenues: string;
        lowStockAlerts: string;
        expiringSoonAlerts: string;
    };
    operations: {
        newRequest: string;
        purchaseRequests: string;
        deferredSales: string;
        creditCustomers: string;
        auditTrail: string;
        batchProcessing: string;
    };
    messages: {
        itemsSelected: (params: { count: number }) => string;
        recordsShown: (params: { count: number; total: number }) => string;
        reportReady: (params: { title: string }) => string;
    };
    accessibility: {
        openMenu: string;
        closeDialog: string;
        loadingContent: string;
        languageSelector: string;
        currentLanguage: (params: { language: string }) => string;
    };
}

export type DictionaryPath = keyof AppDictionary;

export interface I18nFormatters {
    number: (value: number, options?: Intl.NumberFormatOptions) => string;
    currency: (value: number, currency?: string) => string;
    date: (value: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
}

export interface I18nContextValue {
    locale: SupportedLocale;
    metadata: LocaleMetadata;
    t: Readonly<AppDictionary>;
    format: I18nFormatters;
    setLocale: (locale: SupportedLocale) => void;
}
