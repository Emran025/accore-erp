"use client";

import { MainLayout } from "@/components/layout";
import { Table, Column, showToast } from "@/components/ui";
import { TextInput } from "@/components/ui/TextInput";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { useCallback, useEffect, useState } from "react";

interface CurrencyPositionAccount {
  account_code: string;
  account_name: string;
  account_type: string;
  debit_balance: number;
  credit_balance: number;
}

interface CurrencyPosition {
  currency_id: number;
  currency_code: string;
  accounts: CurrencyPositionAccount[];
  total_debits: number;
  total_credits: number;
  is_balanced: boolean;
}

export default function CurrencyPositionsPage() {
  const [positions, setPositions] = useState<CurrencyPosition[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterCurrencyCode, setFilterCurrencyCode] = useState<string>("");
  const [filterAsOfDate, setFilterAsOfDate] = useState<string>("");

  const loadPositions = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterAsOfDate) params.append("as_of_date", filterAsOfDate);
      // backend filters by currency_id; here we primarily expose by date and let backend return all currencies

      const url = `/treasury/currency-positions?${params.toString()}`;
      const res = await fetchAPI(url);
      if (res.success) {
        setPositions(res.data as CurrencyPosition[]);
      } else {
        showToast(res.message || "فشل تحميل مراكز العملات", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("خطأ في تحميل مراكز العملات", "error");
    } finally {
      setLoading(false);
    }
  }, [filterAsOfDate]);

  useEffect(() => {
    loadPositions();
  }, [loadPositions]);

  const columns: Column<CurrencyPositionAccount>[] = [
    {
      key: "account_code",
      header: "رقم الحساب",
      render: (row) => (
        <span style={{ fontFamily: "monospace" }}>{row.account_code}</span>
      ),
    },
    {
      key: "account_name",
      header: "اسم الحساب",
      render: (row) => row.account_name,
    },
    {
      key: "debit_balance",
      header: "رصيد مدين",
      render: (row) =>
        row.debit_balance
          ? Number(row.debit_balance).toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })
          : "-",
    },
    {
      key: "credit_balance",
      header: "رصيد دائن",
      render: (row) =>
        row.credit_balance
          ? Number(row.credit_balance).toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })
          : "-",
    },
  ];

  const filteredPositions = positions.filter((p) =>
    filterCurrencyCode
      ? p.currency_code.toLowerCase().includes(filterCurrencyCode.toLowerCase())
      : true
  );

  return (
    <MainLayout requiredModule="currency_balances">
      <div className="settings-wrapper animate-fade">
        <div className="sales-card animate-fade">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.5rem",
            }}
          >
            <div>
              <h3 style={{ margin: 0 }}>مراكز العملات</h3>
              <p
                className="text-muted"
                style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem" }}
              >
                مراقبة أرصدة الحسابات حسب العملة للتأكد من سلامة المراكز
                المالية بالعملات الأجنبية
              </p>
            </div>
          </div>

          <div
            className="settings-form-grid"
            style={{
              marginBottom: "1.5rem",
              padding: "1rem",
              background: "var(--bg-color)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-color)",
            }}
          >
            <div className="form-group">
              <TextInput
                label="رمز العملة"
                placeholder="مثال: USD"
                value={filterCurrencyCode}
                onChange={(e) => setFilterCurrencyCode(e.target.value)}
              />
            </div>

            <div className="form-group">
              <TextInput
                label="حتى تاريخ"
                type="date"
                value={filterAsOfDate}
                onChange={(e) => setFilterAsOfDate(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ alignSelf: "flex-end" }}>
              <button
                className="btn btn-primary"
                type="button"
                onClick={loadPositions}
              >
                <i className="fas fa-sync-alt"></i> تحديث المراكز
              </button>
            </div>
          </div>

          {filteredPositions.length === 0 && !loading ? (
            <div
              className="empty-state"
              style={{
                minHeight: "200px",
                background: "var(--bg-color)",
                borderRadius: "var(--radius-lg)",
                border: "2px dashed var(--border-color)",
              }}
            >
              <i className="fas fa-balance-scale" style={{ fontSize: "2.5rem" }}></i>
              <h3>لا توجد مراكز عملات نشطة</h3>
              <p>لم يتم العثور على أرصدة عملات مفتوحة ضمن القيود الحالية.</p>
            </div>
          ) : (
            filteredPositions.map((position) => (
              <div
                key={position.currency_code}
                className="animate-fade"
                style={{
                  marginBottom: "1.5rem",
                  padding: "1.5rem",
                  background: "var(--bg-color)",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border-color)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1rem",
                  }}
                >
                  <div>
                    <h4 style={{ margin: 0 }}>
                      مركز العملة:{" "}
                      <span style={{ fontFamily: "monospace" }}>
                        {position.currency_code}
                      </span>
                    </h4>
                    <p
                      className="text-muted"
                      style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem" }}
                    >
                      إجمالي الأرصدة بالعملة الأجنبية على مستوى الحسابات
                    </p>
                  </div>
                  <div style={{ textAlign: "end" }}>
                    <div style={{ fontSize: "0.8rem" }}>
                      <span className="text-muted">إجمالي مدين: </span>
                      <strong style={{ fontFamily: "monospace" }}>
                        {Number(position.total_debits).toLocaleString(
                          "en-US",
                          { minimumFractionDigits: 2 }
                        )}
                      </strong>
                    </div>
                    <div style={{ fontSize: "0.8rem" }}>
                      <span className="text-muted">إجمالي دائن: </span>
                      <strong style={{ fontFamily: "monospace" }}>
                        {Number(position.total_credits).toLocaleString(
                          "en-US",
                          { minimumFractionDigits: 2 }
                        )}
                      </strong>
                    </div>
                    <span
                      className={`badge ${
                        position.is_balanced
                          ? "badge-success"
                          : "badge-warning-light"
                      }`}
                      style={{ marginTop: "0.5rem", display: "inline-block" }}
                    >
                      {position.is_balanced
                        ? "متوازن"
                        : "غير متوازن (مراجعة مطلوبة)"}
                    </span>
                  </div>
                </div>

                <Table
                  data={position.accounts}
                  columns={columns}
                  keyExtractor={(item) => item.account_code}
                  isLoading={loading}
                  emptyMessage="لا توجد حسابات بهذه العملة"
                />
              </div>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
}

