"use client";

import { useI18n } from "@/lib/i18n";
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
    const { t: i18n } = useI18n();
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
        showToast(res.message || i18n.catalog["text_aadc27dda997"], "error");
      }
    } catch (e) {
      console.error(e);
      showToast(i18n.catalog["text_460810e230d6"], "error");
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
      header: i18n.catalog["text_62a19661ff2e"],
      render: (row) => (
        <span style={{ fontFamily: "monospace" }}>{row.account_code}</span>
      ),
    },
    {
      key: "account_name",
      header: i18n.catalog["text_03cec4ee9ea4"],
      render: (row) => row.account_name,
    },
    {
      key: "debit_balance",
      header: i18n.catalog["text_4b2ef7352916"],
      render: (row) =>
        row.debit_balance
          ? Number(row.debit_balance).toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })
          : "-",
    },
    {
      key: "credit_balance",
      header: i18n.catalog["text_3017b7fc9f81"],
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
              <h3 style={{ margin: 0 }}>{i18n.catalog["text_0aef4886b833"]}</h3>
              <p
                className="text-muted"
                style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem" }}
              >
                {i18n.catalog["text_175d1485d822"]}</p>
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
                label={i18n.catalog["text_48e954a1635b"]}
                placeholder={i18n.catalog["text_4bb2741d9fe5"]}
                value={filterCurrencyCode}
                onChange={(e) => setFilterCurrencyCode(e.target.value)}
              />
            </div>

            <div className="form-group">
              <TextInput
                label={i18n.catalog["text_d0035a06988e"]}
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
                <i className="fas fa-sync-alt"></i> {i18n.catalog["text_2ad21c85eed0"]}</button>
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
              <h3>{i18n.catalog["text_8f73941c65b5"]}</h3>
              <p>{i18n.catalog["text_2054599501da"]}</p>
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
                      {i18n.catalog["text_c4a113b90ef2"]}{" "}
                      <span style={{ fontFamily: "monospace" }}>
                        {position.currency_code}
                      </span>
                    </h4>
                    <p
                      className="text-muted"
                      style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem" }}
                    >
                      {i18n.catalog["text_0fe5b61de838"]}</p>
                  </div>
                  <div style={{ textAlign: "end" }}>
                    <div style={{ fontSize: "0.8rem" }}>
                      <span className="text-muted">{i18n.catalog["text_e3c25e2cea31"]}</span>
                      <strong style={{ fontFamily: "monospace" }}>
                        {Number(position.total_debits).toLocaleString(
                          "en-US",
                          { minimumFractionDigits: 2 }
                        )}
                      </strong>
                    </div>
                    <div style={{ fontSize: "0.8rem" }}>
                      <span className="text-muted">{i18n.catalog["text_42a15350418c"]}</span>
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
                        ? i18n.catalog["text_707e82d6d92a"]
                        : i18n.catalog["text_27059c971b1e"]}
                    </span>
                  </div>
                </div>

                <Table
                  data={position.accounts}
                  columns={columns}
                  keyExtractor={(item) => item.account_code}
                  isLoading={loading}
                  emptyMessage={i18n.catalog["text_54ef9a21a2df"]}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
}

