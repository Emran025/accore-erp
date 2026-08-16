'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { SetupModuleState, useSetupStateStore } from '@/stores/useSetupStateStore';

const ORGANIZATION_SETUP_PATH =
  '/01-enterprise-core/organization-governance/org-structure/org-hierarchy?setup=1';

export default function SetupPage() {
  const router = useRouter();
  const { checkAuth } = useAuthStore();
  const { state, isLoading, isSaving, error, loadState, selectModules } = useSetupStateStore();
  const [selected, setSelected] = useState<string[]>([]);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const load = async () => {
      const isAuthenticated = await checkAuth(true);
      if (!isAuthenticated) {
        router.replace('/auth/login');
        return;
      }

      const setupState = await loadState();
      if (setupState && !setupState.setup_required) {
        router.replace('/navigation');
        return;
      }

      setAuthChecked(true);
    };

    void load();
  }, [checkAuth, loadState, router]);

  useEffect(() => {
    if (state) {
      setSelected(state.selected_module_keys);
    }
  }, [state]);

  const businessModules = useMemo(
    () => (state?.modules || []).filter((module) => !module.is_core),
    [state]
  );

  const toggleModule = (module: SetupModuleState) => {
    setSelected((current) =>
      current.includes(module.module_key)
        ? current.filter((key) => key !== module.module_key)
        : [...current, module.module_key]
    );
  };

  const saveSelection = async () => {
    const updated = await selectModules(selected);
    if (updated?.next_action === 'complete_organization_setup') {
      router.push(ORGANIZATION_SETUP_PATH);
    }
  };

  if (!authChecked || isLoading) {
    return (
      <main className="setup-shell" aria-busy="true">
        <p>جاري تحميل تهيئة النظام…</p>
      </main>
    );
  }

  if (!state) {
    return (
      <main className="setup-shell">
        <section className="setup-card setup-recovery-card" role="alert">
          <p className="setup-kicker">تعذر التحقق من التهيئة</p>
          <h1>لن نعرض النظام قبل التأكد من حالة الإعداد.</h1>
          <p className="setup-intro">
            {error || 'تعذر الاتصال بحالة تهيئة النظام. تحقق من الاتصال ثم أعد المحاولة.'}
          </p>
          <button type="button" className="setup-primary-action" onClick={() => void loadState()}>
            إعادة المحاولة
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="setup-shell">
      <section className="setup-card" aria-labelledby="setup-title">
        <p className="setup-kicker">التهيئة الأولية</p>
        <h1 id="setup-title">ما الوحدات التي ستشغّلها الآن؟</h1>
        <p className="setup-intro">
          اختر نطاق الإطلاق الأول. لن تظهر الوحدة للمستخدمين ولن تصبح قابلة للتشغيل قبل إكمال هيكلها
          التنظيمي ومتطلبات تشغيلها والتحقق منها.
        </p>

        <div className="setup-principles" role="list">
          <span role="listitem">1. اختيار نطاق الإطلاق</span>
          <span role="listitem">2. تأسيس الهيكل المطلوب</span>
          <span role="listitem">3. التحقق والتفعيل</span>
        </div>

        <div className="module-grid" role="group" aria-label="وحدات الإطلاق">
          {businessModules.map((module) => {
            const isSelected = selected.includes(module.module_key);
            const isActive = module.lifecycle === 'active';
            return (
              <label
                key={module.module_key}
                className={`module-choice ${isSelected ? 'selected' : ''} ${isActive ? 'active' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={isSelected || isActive}
                  disabled={isActive}
                  onChange={() => toggleModule(module)}
                />
                <span className="module-choice-body">
                  <strong>{module.name_ar || module.name_en}</strong>
                  <small>
                    {isActive
                      ? 'جاهزة ومفعلة'
                      : isSelected
                        ? 'محددة وتنتظر إعداد الهيكل'
                        : 'غير محددة'}
                  </small>
                </span>
              </label>
            );
          })}
        </div>

        {error ? (
          <p className="setup-error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="setup-actions">
          <button
            type="button"
            className="setup-primary-action"
            disabled={isSaving || selected.length === 0}
            onClick={() => void saveSelection()}
          >
            {isSaving ? 'جارٍ حفظ الاختيار…' : 'حفظ والانتقال إلى إعداد الهيكل'}
          </button>
          <p>الوحدات المؤجلة ستبقى مخفية ويمكن إضافتها لاحقاً من رحلة التهيئة نفسها.</p>
        </div>
      </section>

      <style jsx>{`
        .setup-shell {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 2rem;
          color: var(--text-primary, #172033);
          background: linear-gradient(145deg, #edf3ff 0%, #f8fbff 47%, #effaf5 100%);
        }
        .setup-card {
          width: min(100%, 960px);
          padding: clamp(1.5rem, 4vw, 3.5rem);
          border: 1px solid rgba(43, 85, 155, 0.14);
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.94);
          box-shadow: 0 24px 70px rgba(43, 85, 155, 0.13);
        }
        .setup-kicker {
          margin: 0 0 0.75rem;
          color: #2563a8;
          font-weight: 700;
        }
        h1 {
          margin: 0;
          font-size: clamp(1.7rem, 4vw, 2.6rem);
        }
        .setup-intro {
          max-width: 760px;
          line-height: 1.8;
          color: #44546f;
        }
        .setup-principles {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
          margin: 1.5rem 0;
        }
        .setup-principles span {
          padding: 0.55rem 0.8rem;
          border-radius: 999px;
          background: #eef5ff;
          color: #285581;
          font-size: 0.9rem;
          font-weight: 600;
        }
        .module-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(205px, 1fr));
          gap: 0.8rem;
        }
        .module-choice {
          display: flex;
          gap: 0.75rem;
          min-height: 86px;
          padding: 1rem;
          border: 1px solid #d6e0ef;
          border-radius: 14px;
          cursor: pointer;
          background: white;
          transition:
            border-color 0.15s ease,
            box-shadow 0.15s ease,
            transform 0.15s ease;
        }
        .module-choice:hover {
          transform: translateY(-1px);
          border-color: #70a7de;
        }
        .module-choice.selected {
          border-color: #2563a8;
          box-shadow: 0 0 0 3px rgba(37, 99, 168, 0.12);
        }
        .module-choice.active {
          border-color: #2f8f63;
          background: #f2fbf6;
          cursor: default;
        }
        .module-choice input {
          margin-top: 0.2rem;
          accent-color: #2563a8;
        }
        .module-choice-body {
          display: grid;
          gap: 0.35rem;
        }
        .module-choice small {
          color: #66758c;
        }
        .setup-actions {
          display: grid;
          gap: 0.75rem;
          margin-top: 1.8rem;
        }
        .setup-actions p {
          margin: 0;
          color: #66758c;
          font-size: 0.9rem;
        }
        .setup-primary-action {
          width: fit-content;
          padding: 0.8rem 1.15rem;
          border: 0;
          border-radius: 10px;
          background: #145fa4;
          color: white;
          font: inherit;
          font-weight: 700;
          cursor: pointer;
        }
        .setup-primary-action:disabled {
          cursor: not-allowed;
          opacity: 0.55;
        }
        .setup-error {
          color: #b42318;
          font-weight: 600;
        }
      `}</style>
    </main>
  );
}
