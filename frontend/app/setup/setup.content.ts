export const setupContent = {
  shell: {
    loading: 'جاري تحميل تهيئة النظام…',
    loadingLabel: 'جاري تحميل حالة تهيئة النظام',
  },
  recovery: {
    kicker: 'تعذر التحقق من التهيئة',
    title: 'لن نعرض النظام قبل التأكد من حالة الإعداد.',
    fallbackMessage: 'تعذر الاتصال بحالة تهيئة النظام. تحقق من الاتصال ثم أعد المحاولة.',
    retry: 'إعادة المحاولة',
  },
  scope: {
    kicker: 'التهيئة الأولى',
    continuationKicker: 'إكمال تهيئة وحدة مؤجلة',
    title: 'ما الوحدات التي ستشغّلها الآن؟',
    continuationTitle: 'ما الوحدات التي تريد إضافتها الآن؟',
    introduction:
      'اختر نطاق الإطلاق الأول. لن تظهر الوحدة للمستخدمين ولن تصبح قابلة للتشغيل قبل إكمال هيكلها التنظيمي ومتطلبات تشغيلها والتحقق منها.',
    continuationIntroduction:
      'أضف الوحدات التي تحتاجها الآن. ستظل الوحدات الحالية متاحة، بينما تبقى الوحدة الجديدة مخفية حتى يكتمل إعدادها التنظيمي والتشغيلي.',
    modulesLabel: 'وحدات الإطلاق',
    continuationModulesLabel: 'الوحدات المتاحة للإضافة',
    saveAndContinue: 'حفظ والانتقال إلى إعداد الهيكل',
    deferredNotice: 'الوحدات المؤجلة ستبقى مخفية ويمكن إضافتها لاحقاً من رحلة التهيئة نفسها.',
    emptySelectionHint: 'اختر وحدة واحدة على الأقل لبدء التهيئة.',
  },
  moduleStatus: {
    active: 'جاهزة ومفعلة',
    selected: 'محددة وتنتظر إعداد الهيكل',
    pending: 'غير محددة',
  },
  steps: [
    {
      key: 'scope',
      label: 'اختيار نطاق الإطلاق',
      description: 'حدد الوحدات التي ستُهيأ الآن.',
      icon: 'fa-layer-group',
      isRequired: true,
    },
    {
      key: 'organization',
      label: 'تأسيس الهيكل',
      description: 'استخدم الهيكل التنظيمي القائم لتأسيس المنشأة والفروع.',
      icon: 'fa-sitemap',
      isRequired: true,
    },
    {
      key: 'activation',
      label: 'التحقق والتفعيل',
      description: 'تتحقق الخلفية من الجاهزية قبل إظهار الوحدة.',
      icon: 'fa-shield-check',
      isRequired: true,
    },
  ],
} as const;
