import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = path.resolve(__dirname, "..");
const sourcePath = path.join(root, "i18n", "catalog", "source.json");
const englishPath = path.join(root, "i18n", "catalog", "en-US.json");

const orgStudioTranslations: Record<string, { ar: string; en: string }> = {
  "orgStudio.setup.title": {
    ar: "الإعداد الذكي للمؤسسة",
    en: "Intelligent Organization Setup",
  },
  "orgStudio.setup.subtitle": {
    ar: "صف طبيعة عملك باللغة الطبيعية وسيقوم النظام باستنتاج الهيكل التنظيمي الأمثل",
    en: "Describe your business in natural language and ACCORE will infer the optimal organizational structure",
  },
  "orgStudio.setup.naturalInputPlaceholder": {
    ar: "مثال: نحن شركة تجزئة نملك 4 فروع ومستودعين في الرياض وجدة مع 35 موظفاً ونظام نقاط بيع ومحاسبة مركزية...",
    en: "E.g. We are a retail business with 4 branches and 2 warehouses across Riyadh and Jeddah, with 35 employees, POS, and centralized accounting...",
  },
  "orgStudio.setup.analyzeButton": {
    ar: "تحليل واستنتاج الهيكل",
    en: "Analyze & Infer Structure",
  },
  "orgStudio.setup.analyzing": {
    ar: "جارٍ تحليل الإشارات واستنتاج النمط التنظيمي...",
    en: "Analyzing signals & inferring organizational archetype...",
  },
  "orgStudio.setup.archetypeRecommendation": {
    ar: "النمط التنظيمي الموصى به",
    en: "Recommended Organizational Archetype",
  },
  "orgStudio.setup.confidence": {
    ar: "نسبة التطابق والثقة",
    en: "Recommendation Confidence",
  },
  "orgStudio.setup.complexityGrade": {
    ar: "مستوى تعقيد الهيكل",
    en: "Structural Complexity Grade",
  },
  "orgStudio.setup.whyThisArchetype": {
    ar: "لماذا هذا النمط؟ (تفسير النظام)",
    en: "Why this archetype? (System Rationale)",
  },
  "orgStudio.setup.adaptiveQuestionsTitle": {
    ar: "أسئلة توضيحية لتخصيص الهيكل",
    en: "Clarification Questions for Structure Tailoring",
  },
  "orgStudio.setup.stageBlueprint": {
    ar: "حفظ مسودة المخطط",
    en: "Stage Blueprint Draft",
  },
  "orgStudio.setup.publishBlueprint": {
    ar: "اعتماد وبناء المؤسسة",
    en: "Publish & Compile Organization",
  },
  "orgStudio.setup.publishing": {
    ar: "جارٍ بناء الوحدات ومراكز التكلفة وخطوط التقارير...",
    en: "Compiling units, cost centers, and reporting lines...",
  },
  "orgStudio.setup.publishedSuccess": {
    ar: "تم اعتماد وبناء الهيكل التنظيمي بنجاح!",
    en: "Organizational structure compiled and published successfully!",
  },
  "orgStudio.setup.blueprintPreview": {
    ar: "معاينة مخطط المؤسسة",
    en: "Organization Blueprint Preview",
  },
  "orgStudio.setup.unitsCount": {
    ar: "عدد الوحدات الإدارية",
    en: "Organizational Units",
  },
  "orgStudio.setup.relationshipsCount": {
    ar: "خطوط التقارير والربط",
    en: "Reporting Relationships",
  },
  "orgStudio.setup.positionsCount": {
    ar: "الوظائف الهيكلية",
    en: "Structural Positions",
  },
  "orgStudio.perspectives.title": {
    ar: "استوديو المؤسسة متعدد الأبعاد",
    en: "Multi-Plane Organization Studio",
  },
  "orgStudio.perspectives.legal": {
    ar: "المنظور القانوني والشركات",
    en: "Legal & Corporate Perspective",
  },
  "orgStudio.perspectives.legalDesc": {
    ar: "الكيانات القانونية والشركات التابعة والحصص الملكية",
    en: "Legal entities, operating subsidiaries, and ownership equity",
  },
  "orgStudio.perspectives.facilities": {
    ar: "منظور المرافق واللوجستيات",
    en: "Facilities & Logistics Perspective",
  },
  "orgStudio.perspectives.facilitiesDesc": {
    ar: "الفروع والمستودعات ومراكز التوزيع والمواقع الجغرافية",
    en: "Branches, warehouses, distribution centers, and geographic sites",
  },
  "orgStudio.perspectives.workforce": {
    ar: "منظور القوى العاملة والإدارة",
    en: "Workforce & Line Management Perspective",
  },
  "orgStudio.perspectives.workforceDesc": {
    ar: "الإدارات والأقسام والوظائف وشبكة الإشراف الإداري",
    en: "Departments, teams, positions, and supervisory lines",
  },
  "orgStudio.perspectives.financial": {
    ar: "منظور الرقابة المالية ومراكز التكلفة",
    en: "Financial & Management Accounting Perspective",
  },
  "orgStudio.perspectives.financialDesc": {
    ar: "مراكز التكلفة ومراكز الربحية ونقاط تجميع القوائم المالية",
    en: "Cost centers, profit centers, and general ledger consolidation rollups",
  },
  "orgStudio.perspectives.matrix": {
    ar: "منظور المصفوفة والمشاريع",
    en: "Matrix & Project Assignment Perspective",
  },
  "orgStudio.perspectives.matrixDesc": {
    ar: "خطوط الإشراف المزدوجة وإدارة المشاريع العابرة للإدارات",
    en: "Dual-reporting lines and cross-functional project matrix",
  },
  "orgStudio.perspectives.all": {
    ar: "جميع الأبعاد الموحدة",
    en: "Unified Multi-Plane Perspective",
  },
  "orgStudio.inspector.title": {
    ar: "مفتش خصائص الوحدة",
    en: "Unit Property Inspector",
  },
  "orgStudio.inspector.selectUnit": {
    ar: "اختر وحدة من المخطط لعرض خصائصها وتعديل أبعادها",
    en: "Select a unit from the canvas to inspect and configure its facets",
  },
  "orgStudio.inspector.facetsTitle": {
    ar: "الأبعاد التشغيلية النشطة (Facets)",
    en: "Active Operational Facets",
  },
  "orgStudio.inspector.facetLegalEntity": {
    ar: "كيان قانوني (Legal Entity)",
    en: "Legal Entity",
  },
  "orgStudio.inspector.facetCostCenter": {
    ar: "مركز تكلفة (Cost Center)",
    en: "Cost Center",
  },
  "orgStudio.inspector.facetProfitCenter": {
    ar: "مركز ربحية (Profit Center)",
    en: "Profit Center",
  },
  "orgStudio.inspector.facetWarehouse": {
    ar: "مستودع (Warehouse)",
    en: "Warehouse",
  },
  "orgStudio.inspector.facetDepartment": {
    ar: "إدارة / قسم (Department)",
    en: "Department",
  },
  "orgStudio.inspector.facetFacility": {
    ar: "مرفق / فرع (Facility / Branch)",
    en: "Facility / Branch",
  },
  "orgStudio.inspector.facetSalesChannel": {
    ar: "قناة مبيعات (Sales Channel)",
    en: "Sales Channel",
  },
  "orgStudio.inspector.facetProject": {
    ar: "مشروع (Project Unit)",
    en: "Project Unit",
  },
  "orgStudio.inspector.saveFacets": {
    ar: "حفظ وتزامن الأبعاد",
    en: "Save & Synchronize Facets",
  },
  "orgStudio.inspector.syncNotice": {
    ar: "يتم تزامن هذه الأبعاد فورياً مع القيود المحاسبية وسلاسل الإمداد ومراكز التكلفة.",
    en: "Facets are immediately synchronized with the General Ledger, Supply Chain, and Cost Centers.",
  },
  "orgStudio.inspector.unitCode": {
    ar: "رمز الوحدة",
    en: "Unit Code",
  },
  "orgStudio.inspector.unitNameEn": {
    ar: "الاسم بالإنجليزية",
    en: "English Name",
  },
  "orgStudio.inspector.unitNameAr": {
    ar: "الاسم بالعربية",
    en: "Arabic Name",
  },
  "orgStudio.inspector.unitType": {
    ar: "نوع الوحدة القياسي",
    en: "Base Meta Type",
  },
  "orgStudio.restructure.title": {
    ar: "إعادة هيكلة خط التقارير مع التأريخ الفعال",
    en: "Temporal Restructuring & Effective Dating",
  },
  "orgStudio.restructure.sourceUnit": {
    ar: "الوحدة التابعة",
    en: "Reporting Unit",
  },
  "orgStudio.restructure.newParent": {
    ar: "الوحدة الرئيسية الجديدة",
    en: "New Reporting Parent",
  },
  "orgStudio.restructure.effectiveDate": {
    ar: "تاريخ السريان الفعال",
    en: "Effective Date",
  },
  "orgStudio.restructure.reason": {
    ar: "سبب التعديل أو القرار الإداري",
    en: "Administrative Reason / Decision Reference",
  },
  "orgStudio.restructure.confirm": {
    ar: "تنفيذ إعادة الهيكلة",
    en: "Execute Restructuring",
  },
  "orgStudio.restructure.success": {
    ar: "تمت إعادة الهيكلة بنجاح مع الحفاظ الكامل على السجلات التاريخية.",
    en: "Restructuring completed successfully with complete historical audit integrity.",
  },
  "orgStudio.canvas.zoomIn": {
    ar: "تكبير",
    en: "Zoom In",
  },
  "orgStudio.canvas.zoomOut": {
    ar: "تصغير",
    en: "Zoom Out",
  },
  "orgStudio.canvas.resetZoom": {
    ar: "إعادة ضبط العرض",
    en: "Reset Canvas View",
  },
  "orgStudio.canvas.emptyPerspective": {
    ar: "لا توجد وحدات مطابقة لهذا المنظور حالياً.",
    en: "No units match this perspective view currently.",
  },
  "platform.product.serverRuntimeUnavailableDescription": {
    ar: "خدمة بيئة تشغيل الخادم غير متوفرة حالياً",
    en: "Server runtime service is currently unavailable",
  },
  "platform.product.serverRuntimeServiceContinuity": {
    ar: "استمرارية الخدمة",
    en: "Service continuity",
  },
  "platform.product.serverRuntimeUnavailableNextStep": {
    ar: "يرجى التحقق من حالة الخادم أو إعادة تشغيله",
    en: "Please check the server status or restart it",
  },
  "platform.product.serverRuntimeApiAction": {
    ar: "إجراء الواجهة البرمجية",
    en: "API action",
  },
  "platform.product.serverRuntimeTechnicalDetail": {
    ar: "التفاصيل التقنية",
    en: "Technical details",
  },
  "platform.product.serverRuntimeRefreshStatus": {
    ar: "تحديث الحالة",
    en: "Refresh status",
  },
  "platform.product.serverRuntimeChecking": {
    ar: "جارٍ التحقق...",
    en: "Checking...",
  },
  "platform.product.serverRuntimeStartService": {
    ar: "بدء الخدمة",
    en: "Start service",
  },
  "platform.product.serverProfileRequiredApiMessage": {
    ar: "ملف تعريف الخادم مطلوب لهذا الإجراء",
    en: "Server profile is required for this action",
  },
  "navigation.commercialConfig.marketplace": {
    ar: "السوق الإلكتروني",
    en: "Marketplace",
  },
  "navigation.commercialConfig.marketplaceDescription": {
    ar: "إدارة العروض وحملات السوق الإلكتروني",
    en: "Manage marketplace offers and campaigns",
  },
  "navigation.commercialConfig.marketplaceOperations": {
    ar: "عمليات السوق",
    en: "Marketplace operations",
  },
  "platform.product.serverUpdateServerOnly": {
    ar: "تحديث الخادم فقط",
    en: "Server update only",
  },
  "platform.product.serverUpdateShutdown": {
    ar: "إيقاف تشغيل الخادم",
    en: "Server shutdown",
  },
  "platform.product.serverUpdateDownloadingProgress": {
    ar: "جارٍ تنزيل التحديث: {value0}%",
    en: "Downloading update: {value0}%",
  },
  "platform.product.client": {
    ar: "تطبيق العميل",
    en: "Client App",
  },
  "platform.product.server": {
    ar: "خادم النظام",
    en: "System Server",
  },
  "platform.product.serverProfileRequiredTitle": {
    ar: "ملف تعريف الخادم مطلوب",
    en: "Server Profile Required",
  },
  "platform.product.serverProfileRequiredDescription": {
    ar: "يتطلب هذا الإجراء تكوين ملف تعريف الخادم بشكل صحيح",
    en: "This action requires a properly configured server profile",
  },
  "platform.product.serverProfileRequiredNextStep": {
    ar: "انتقل إلى إعدادات الخادم للتكوين",
    en: "Go to server settings to configure",
  },
  "platform.product.serverRuntimeApiComponent": {
    ar: "مكون الواجهة البرمجية (API)",
    en: "API Component",
  },
  "platform.product.serverRuntimeDatabaseComponent": {
    ar: "مكون قاعدة البيانات",
    en: "Database Component",
  },
  "platform.product.serverRuntimeQueueComponent": {
    ar: "مكون طابور المهام",
    en: "Queue Component",
  },
  "platform.product.serverRuntimeUnavailableTitle": {
    ar: "خدمة الخادم غير متوفرة",
    en: "Server Service Unavailable",
  },
  "platform.product.serverUpdateChecking": {
    ar: "جارٍ التحقق من التحديثات...",
    en: "Checking for updates...",
  },
  "platform.product.serverUpdateAvailableVersion": {
    ar: "يتوفر إصدار جديد: {version}",
    en: "New version available: {version}",
  },
  "platform.product.serverUpdateDownloading": {
    ar: "جارٍ تنزيل التحديث...",
    en: "Downloading update...",
  },
  "platform.product.serverUpdatePreparing": {
    ar: "جارٍ تجهيز التحديث...",
    en: "Preparing update...",
  },
  "platform.product.serverUpdateInstalling": {
    ar: "جارٍ تثبيت التحديث...",
    en: "Installing update...",
  },
  "platform.product.serverUpdateRecovering": {
    ar: "جارٍ استعادة الحالة السابقة...",
    en: "Recovering prior state...",
  },
  "platform.product.serverUpdateNone": {
    ar: "النظام محدث بالكامل",
    en: "System is fully up to date",
  },
  "platform.product.serverOperationsTitle": {
    ar: "عمليات الخادم",
    en: "Server Operations",
  },
  "platform.product.serverOperationRetry": {
    ar: "إعادة المحاولة",
    en: "Retry Operation",
  },
  "platform.product.serverUpdateTitle": {
    ar: "تحديث النظام",
    en: "System Update",
  },
  "platform.product.serverBackupRequested": {
    ar: "تم طلب نسخة احتياطية",
    en: "Backup requested",
  },
  "platform.product.serverBackupTitle": {
    ar: "النسخ الاحتياطي",
    en: "Server Backup",
  },
  "platform.product.serverBackupUnavailable": {
    ar: "النسخ الاحتياطي غير متوفر حالياً",
    en: "Backup currently unavailable",
  },
  "platform.product.serverBackupCreate": {
    ar: "إنشاء نسخة احتياطية",
    en: "Create Backup",
  },
  "platform.product.serverUpdateCheck": {
    ar: "فحص التحديثات",
    en: "Check for Updates",
  },
  "platform.connection.title": {
    ar: "اتصال العميل بالخادم",
    en: "Client Server Connection",
  },
  "platform.connection.description": {
    ar: "قم بربط التطبيق بالخادم المركزي للوصول إلى البيانات المحدثة",
    en: "Connect your client app to the central server to access synchronized data",
  },
  "platform.connection.setupEyebrow": {
    ar: "إعداد الاتصال",
    en: "Connection Setup",
  },
  "platform.connection.setupTitle": {
    ar: "إقران العميل بالخادم",
    en: "Pair Client with Server",
  },
  "platform.connection.setupDescription": {
    ar: "اختر طريقة الإقران المناسبة لربط هذا الجهاز",
    en: "Select the pairing method to connect this device",
  },
  "platform.connection.methodLabel": {
    ar: "طريقة الإقران",
    en: "Pairing Method",
  },
  "platform.connection.method.file": {
    ar: "ملف الإقران",
    en: "Pairing File",
  },
  "platform.connection.method.manual": {
    ar: "إدخال يدوي",
    en: "Manual Entry",
  },
  "platform.connection.method.qr": {
    ar: "رمز QR",
    en: "QR Code",
  },
  "platform.connection.apiBase": {
    ar: "عنوان الواجهة البرمجية (API)",
    en: "API Base URL",
  },
  "platform.connection.serverIdentity": {
    ar: "هوية الخادم",
    en: "Server Identity",
  },
  "platform.connection.certificateFingerprint": {
    ar: "بصمة الشهادة الرقمية",
    en: "Certificate Fingerprint",
  },
  "platform.connection.enrollmentEvidence": {
    ar: "رمز التسجيل / الإثبات",
    en: "Enrollment Evidence",
  },
  "platform.connection.enrollmentEvidencePlaceholder": {
    ar: "أدخل رمز التسجيل المعطى من المسؤول",
    en: "Enter enrollment evidence provided by admin",
  },
  "platform.connection.qrPayload": {
    ar: "بيانات رمز QR",
    en: "QR Code Payload",
  },
  "platform.connection.pairingFile": {
    ar: "اختر ملف الإقران (.accore)",
    en: "Select Pairing File (.accore)",
  },
  "platform.connection.fileHint": {
    ar: "الملف الذي تم تصديره من إعدادات الخادم",
    en: "File exported from server settings",
  },
  "platform.connection.pairingFailedTitle": {
    ar: "فشل الإقران",
    en: "Pairing Failed",
  },
  "platform.connection.retry": {
    ar: "إعادة محاولة الإقران",
    en: "Retry Pairing",
  },
  "platform.connection.pairing": {
    ar: "جارٍ الإقران...",
    en: "Pairing...",
  },
  "platform.connection.verifyAndPair": {
    ar: "التحقق والإقران",
    en: "Verify & Pair",
  },
  "platform.connection.checking": {
    ar: "جارٍ فحص الاتصال...",
    en: "Checking Connection...",
  },
  "platform.connection.checkingDescription": {
    ar: "جارٍ الاتصال بالخادم والتحقق من الشهادات والبيانات",
    en: "Connecting to server and validating certificates and telemetry",
  },
  "platform.connection.trust.encryptedIdentity": {
    ar: "هوية مشفرة وآمنة تماماً",
    en: "Fully encrypted identity",
  },
  "platform.connection.trust.protectedCredential": {
    ar: "بيانات اعتماد محمية بتشفير عالي",
    en: "Credentials protected with high-grade cryptography",
  },
  "platform.connection.trust.compatibilityGuard": {
    ar: "حماية التوافق بين الإصدارات",
    en: "Cross-version compatibility guard",
  },
  "platform.connection.error.invalidPairingPayload": {
    ar: "ملف الإقران غير صالح أو تالف",
    en: "Invalid or corrupted pairing payload file",
  },
  "platform.connection.error.certificateMismatch": {
    ar: "عدم تطابق الشهادة الرقمية",
    en: "Certificate fingerprint mismatch",
  },
  "platform.connection.error.credentialStorageFailed": {
    ar: "فشل حفظ بيانات الاعتماد الآمنة",
    en: "Secure credential storage failed",
  },
  "platform.connection.error.deviceRevoked": {
    ar: "تم إبطال تسجيل هذا الجهاز",
    en: "Device enrollment has been revoked",
  },
  "platform.connection.error.enrollmentRejected": {
    ar: "تم رفض طلب التسجيل من قبل الخادم",
    en: "Enrollment request rejected by server",
  },
  "platform.connection.error.incompatibleServer": {
    ar: "إصدار الخادم غير متوافق مع العميل",
    en: "Server version is incompatible",
  },
  "platform.connection.error.insecureEndpoint": {
    ar: "نقطة الاتصال غير آمنة",
    en: "Insecure connection endpoint",
  },
  "platform.connection.error.invalidEndpoint": {
    ar: "عنوان الخادم غير صالح",
    en: "Invalid server endpoint URL",
  },
  "platform.connection.error.serverIdentityMismatch": {
    ar: "عدم تطابق هوية الخادم",
    en: "Server identity mismatch",
  },
  "platform.connection.error.serverUnreachable": {
    ar: "تعذر الاتصال بالخادم",
    en: "Server is unreachable",
  },
  "platform.connection.error.unexpectedResponse": {
    ar: "استجابة غير متوقعة من الخادم",
    en: "Unexpected server response",
  },
  "platform.connection.error.updateRequired": {
    ar: "يتطلب التطبيق تحديثاً للمتابعة",
    en: "App update required to continue",
  },
  "enterpriseCore.orgWorkspace.composer.parentHelper": {
    ar: "حدد الوحدة الأصلية لربط التبعية الإدارية",
    en: "Select parent unit for administrative reporting line",
  },
  "enterpriseCore.orgWorkspace.composer.rootHelper": {
    ar: "هذه الوحدة ستكون على قمة الهيكل ككيان رئيسي",
    en: "This unit will sit at the root level as a top entity",
  },
  "enterpriseCore.orgWorkspace.composer.create": {
    ar: "إنشاء الوحدة التنظيمية",
    en: "Create Organizational Unit",
  },
  "enterpriseCore.orgWorkspace.composer.selectType": {
    ar: "اختر نوع الوحدة",
    en: "Select Unit Type",
  },
  "enterpriseCore.setup.loading": {
    ar: "جارٍ تحميل إعدادات النظام...",
    en: "Loading system setup...",
  },
  "enterpriseCore.setup.centerSummary": {
    ar: "{value0} — {value1}",
    en: "{value0} — {value1}",
  },
  "enterpriseCore.setup.scope.foundationRequired": {
    ar: "يتطلب استكمال المرحلة الأساسية أولاً",
    en: "Foundation setup required first",
  },
  "enterpriseCore.setup.modules.coreTitle": {
    ar: "الوحدات الأساسية",
    en: "Core Modules",
  },
  "enterpriseCore.setup.modules.coreDescription": {
    ar: "الحزم الأساسية لتشغيل المؤسسة",
    en: "Essential operational packages",
  },
  "enterpriseCore.setup.modules.optionalTitle": {
    ar: "الوحدات التوسعية",
    en: "Expansion Modules",
  },
  "enterpriseCore.setup.modules.optionalDescription": {
    ar: "الوحدات الإضافية الاختيارية للأعمال المتقدمة",
    en: "Optional expansion modules for advanced workflows",
  },
  "enterpriseCore.setup.modules.baselineRequired": {
    ar: "مطلوبة كحزمة أساسية",
    en: "Required as baseline package",
  },
  "enterpriseCore.orgWorkspace.empty.title": {
    ar: "الهيكل التنظيمي فارغ",
    en: "Organizational Structure Empty",
  },
  "enterpriseCore.orgWorkspace.empty.description": {
    ar: "ابدأ بتكوين الكيان الأساسي الأول لإنشاء الهيكل",
    en: "Start by creating the initial root entity to build the structure",
  },
  "enterpriseCore.orgWorkspace.empty.action": {
    ar: "إنشاء كيان أساسي",
    en: "Create Root Entity",
  },
  "enterpriseCore.orgWorkspace.scope.title": {
    ar: "النطاق التشغيلي وسياق الوحدة",
    en: "Operating Scope & Unit Context",
  },
  "enterpriseCore.orgWorkspace.scope.empty": {
    ar: "لا يوجد سياق تشغيلي مسجل لهذه الوحدة",
    en: "No operating context registered for this unit",
  },
  "enterpriseCore.orgWorkspace.relationships.title": {
    ar: "قواعد الربط المعتمدة",
    en: "Topology Rules & Relationships",
  },
  "enterpriseCore.orgWorkspace.relationships.empty": {
    ar: "لا توجد علاقات تبعية مرتبطة",
    en: "No assigned relationships",
  },
  "enterpriseCore.orgWorkspace.inspector.title": {
    ar: "تفاصيل الوحدة",
    en: "Unit Details",
  },
  "enterpriseCore.orgWorkspace.inspector.description": {
    ar: "اختر وحدة من المخطط لعرض مواصفاتها وسياقها",
    en: "Select a unit from the tree to view its specification and context",
  },
  "enterpriseCore.orgWorkspace.composer.title": {
    ar: "منشئ الوحدات التنظيمية",
    en: "Unit Composer",
  },
  "enterpriseCore.orgWorkspace.composer.description": {
    ar: "إضافة وحدة جديدة وفق القواعد الطوبولوجية الصارمة",
    en: "Add a new unit according to strict topology rules",
  },
  "enterpriseCore.orgWorkspace.composer.code": {
    ar: "رمز الوحدة",
    en: "Unit Code",
  },
  "enterpriseCore.orgWorkspace.composer.name": {
    ar: "اسم الوحدة",
    en: "Unit Name",
  },
  "enterpriseCore.orgWorkspace.phase.foundation.title": {
    ar: "المرحلة الأساسية (الكيانات والمحاسبة)",
    en: "Foundation Phase (Entities & Finance)",
  },
  "enterpriseCore.orgWorkspace.phase.coreOperations.title": {
    ar: "المرحلة التشغيلية (المصانع والمستودعات)",
    en: "Core Operations Phase (Plants & Storage)",
  },
  "enterpriseCore.orgWorkspace.phase.extensions.title": {
    ar: "المرحلة التوسعية (المشاريع والوظائف)",
    en: "Extensions Phase (Projects & Roles)",
  },
  "enterpriseCore.orgWorkspace.phase.foundation.description": {
    ar: "تأسيس الكيان القانوني ومراكز التكلفة والربحية",
    en: "Establish legal entity, cost centers, and profit centers",
  },
  "enterpriseCore.orgWorkspace.phase.coreOperations.description": {
    ar: "تكوين المستودعات والمصانع ومراكز الشراء والتوزيع",
    en: "Configure warehouses, plants, purchasing and sales orgs",
  },
  "enterpriseCore.orgWorkspace.phase.extensions.description": {
    ar: "إضافة إدارات المشاريع والمناطق الوظيفية",
    en: "Add project departments and functional areas",
  },
  "enterpriseCore.orgWorkspace.eyebrow": {
    ar: "هندسة الهيكل المؤسسي",
    en: "Enterprise Structure Architecture",
  },
  "enterpriseCore.orgWorkspace.title": {
    ar: "مخطط الهيكل التنظيمي",
    en: "Organizational Structure Blueprint",
  },
  "enterpriseCore.orgWorkspace.description": {
    ar: "إدارة الهيكل الهرمي والوحدات والتبعيات التشغيلية",
    en: "Manage hierarchical structure, units, and operational links",
  },
  "enterpriseCore.orgWorkspace.refresh": {
    ar: "تحديث المخطط",
    en: "Refresh Blueprint",
  },
  "enterpriseCore.orgWorkspace.phase.ariaLabel": {
    ar: "مراحل بناء الهيكل",
    en: "Structure Building Phases",
  },
  "enterpriseCore.orgWorkspace.complete": {
    ar: "مكتمل",
    en: "Complete",
  },
  "enterpriseCore.orgWorkspace.itemsRemaining": {
    ar: "متبقي {value0} وحدات",
    en: "{value0} units remaining",
  },
  "enterpriseCore.orgWorkspace.plan.ariaLabel": {
    ar: "خطة المرحلة",
    en: "Phase Plan",
  },
  "enterpriseCore.orgWorkspace.extensionsHelper": {
    ar: "يمكن إضافة وحدات اختيارية إضافية حسب حاجة المنشأة",
    en: "Optional additional units can be added based on enterprise requirements",
  },
  "enterpriseCore.orgWorkspace.recommendedTypes": {
    ar: "الوحدات الموصى بإضافتها",
    en: "Recommended Units",
  },
  "enterpriseCore.orgWorkspace.integrity.title": {
    ar: "سلامة الهيكل والتوافق",
    en: "Structure Integrity & Compliance",
  },
  "enterpriseCore.orgWorkspace.integrity.summary": {
    ar: "{value0} أخطاء، {value1} تحذيرات",
    en: "{value0} errors, {value1} warnings",
  },
  "enterpriseCore.orgWorkspace.architecture.title": {
    ar: "شجرة الوحدات",
    en: "Unit Hierarchy Tree",
  },
  "enterpriseCore.orgWorkspace.architecture.summary": {
    ar: "{value0} وحدة مسجلة، {value1} نوع قياسي",
    en: "{value0} registered units, {value1} meta types",
  },
  "enterpriseCore.orgWorkspace.attribute.address": {
    ar: "العنوان",
    en: "Address",
  },
  "enterpriseCore.orgWorkspace.attribute.buyerName": {
    ar: "اسم المشتري المسؤول",
    en: "Responsible Buyer Name",
  },
  "enterpriseCore.orgWorkspace.attribute.chartOfAccountsId": {
    ar: "دليل الحسابات المالي",
    en: "Chart of Accounts",
  },
  "enterpriseCore.orgWorkspace.attribute.city": {
    ar: "المدينة",
    en: "City",
  },
  "enterpriseCore.orgWorkspace.attribute.costCenterCategory": {
    ar: "فئة مركز التكلفة",
    en: "Cost Center Category",
  },
  "enterpriseCore.orgWorkspace.attribute.countryCode": {
    ar: "رمز الدولة",
    en: "Country Code",
  },
  "enterpriseCore.orgWorkspace.attribute.currencyId": {
    ar: "العملة الأساسية",
    en: "Currency",
  },
  "enterpriseCore.orgWorkspace.attribute.defaultLanguage": {
    ar: "اللغة الافتراضية",
    en: "Default Language",
  },
  "enterpriseCore.orgWorkspace.attribute.factoryCalendarId": {
    ar: "تقويم العمل والمصنع",
    en: "Factory Calendar",
  },
  "enterpriseCore.orgWorkspace.attribute.fiscalYearVariant": {
    ar: "نمط السنة المالية",
    en: "Fiscal Year Variant",
  },
  "enterpriseCore.orgWorkspace.attribute.headcount": {
    ar: "العدد المستهدف للموظفين",
    en: "Target Headcount",
  },
  "enterpriseCore.orgWorkspace.attribute.jobFamily": {
    ar: "عائلة الوظائف",
    en: "Job Family",
  },
  "enterpriseCore.orgWorkspace.attribute.language": {
    ar: "اللغة",
    en: "Language",
  },
  "enterpriseCore.orgWorkspace.attribute.manager": {
    ar: "المدير المسؤول",
    en: "Responsible Manager",
  },
  "enterpriseCore.orgWorkspace.attribute.name": {
    ar: "الاسم",
    en: "Name",
  },
  "enterpriseCore.orgWorkspace.attribute.payScaleArea": {
    ar: "منطقة سلم الرواتب",
    en: "Pay Scale Area",
  },
  "enterpriseCore.orgWorkspace.attribute.payScaleType": {
    ar: "نوع سلم الرواتب",
    en: "Pay Scale Type",
  },
  "enterpriseCore.orgWorkspace.attribute.profitCenterGroup": {
    ar: "مجموعة مراكز الربحية",
    en: "Profit Center Group",
  },
  "enterpriseCore.orgWorkspace.attribute.projectId": {
    ar: "المشروع المرتبط",
    en: "Linked Project",
  },
  "enterpriseCore.orgWorkspace.attribute.publicHolidayCalendar": {
    ar: "تقويم العطلات الرسمية",
    en: "Public Holiday Calendar",
  },
  "enterpriseCore.orgWorkspace.attribute.responsibleCostCenter": {
    ar: "مركز التكلفة المسؤول",
    en: "Responsible Cost Center",
  },
  "enterpriseCore.orgWorkspace.attribute.responsiblePerson": {
    ar: "الشخص المسؤول",
    en: "Responsible Person",
  },
  "enterpriseCore.orgWorkspace.attribute.riskCategory": {
    ar: "فئة المخاطر",
    en: "Risk Category",
  },
  "enterpriseCore.orgWorkspace.attribute.telephone": {
    ar: "رقم الهاتف",
    en: "Telephone",
  },
  "enterpriseCore.orgWorkspace.attribute.vacancyStatus": {
    ar: "حالة الشغور الوظيفي",
    en: "Vacancy Status",
  },
  "enterpriseCore.orgWorkspace.attribute.valuationGrouping": {
    ar: "مجموعة التقييم المخزني",
    en: "Valuation Grouping",
  },
};

const sourceData = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const englishData = JSON.parse(fs.readFileSync(englishPath, "utf8"));

const existingIds = new Set(sourceData.items.map((it: any) => it.id));

let addedCount = 0;
for (const [key, val] of Object.entries(orgStudioTranslations)) {
  if (!existingIds.has(key)) {
    sourceData.items.push({
      id: key,
      source: val.ar,
      classification: "user-facing",
      occurrences: [
        {
          id: `app/setup/components/orgStudio:${key}`,
          file: "app/setup/components/orgStudio",
          line: 1,
          column: 1,
          kind: "string-literal",
          context: "Organization Studio & Intelligent Setup",
        },
      ],
    });
    existingIds.add(key);
    addedCount++;
  }
  englishData.translations[key] = val.en;
}

sourceData.itemCount = sourceData.items.length;

// Ensure all items in source.json have an English translation entry
let fallbackCount = 0;
for (const item of sourceData.items) {
  if (!englishData.translations[item.id]) {
    englishData.translations[item.id] = item.source;
    fallbackCount++;
  }
}
if (fallbackCount > 0) {
  console.log(`Filled ${fallbackCount} missing English fallback translations.`);
}

fs.writeFileSync(sourcePath, JSON.stringify(sourceData, null, 2), "utf8");
fs.writeFileSync(englishPath, JSON.stringify(englishData, null, 2), "utf8");

console.log(`Injected ${addedCount} new Organization Studio translation keys.`);

// Now rebuild dictionaries
execSync("npx tsx scripts/i18n-build-dictionaries.ts", { cwd: root, stdio: "inherit" });
