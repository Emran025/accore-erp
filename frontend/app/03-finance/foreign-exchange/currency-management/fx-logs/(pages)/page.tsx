"use client";

import { useI18n } from "@/lib/i18n";
import { MainLayout } from "@/components/layout";
import { Table, Column, showToast } from "@/components/ui";
import { TextInput } from "@/components/ui/TextInput";
import { fetchAPI } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { useCallback, useEffect, useState } from "react";

interface ExchangeRateHistory {
  id: number;
  currency_id: number;
  target_currency_id: number;
  exchange_rate: number;
  effective_date: string;
  effective_time: string | null;
  source: string;
  source_reference: string | null;
  currency?: { code: string; name: string; symbol: string };
  target_currency?: { code: string; name: string; symbol: string };
  created_by?: { name: string };
  created_at: string;
}

interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
}

export default function FxLogsPage() {
    const { t: i18n } = useI18n();
  const [history, setHistory] = useState<ExchangeRateHistory[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterCurrencyId, setFilterCurrencyId] = useState<string>("");
  const [filterTargetId, setFilterTargetId] = useState<string>("");
  const [filterFromDate, setFilterFromDate] = useState<string>("");
  const [filterToDate, setFilterToDate] = useState<string>("");

  const loadCurrencies = useCallback(async () => {
    try {
      const res = await fetchAPI(API_ENDPOINTS.FINANCE.FOREIGN_EXCHANGE.CURRENCIES.BASE);
      if (res.success) {
        setCurrencies(res.data as Currency[]);
      }
    } catch (e) {
      console.error(e);
      showToast(i18n.catalog["text_0f3bf5f8f012"], "error");
    }
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterCurrencyId) params.append("currency_id", filterCurrencyId);
      if (filterTargetId) params.append("target_currency_id", filterTargetId);
      if (filterFromDate) params.append("from_date", filterFromDate);
      if (filterToDate) params.append("to_date", filterToDate);

      const url = `${API_ENDPOINTS.FINANCE.TREASURY.RATES_HISTORY}?${params.toString()}`;
      const res = await fetchAPI(url);
      if (res.success) {
        setHistory(res.data as ExchangeRateHistory[]);
      } else {
        showToast(res.message || i18n.catalog["text_4d8acb11b239"], "error");
      }
    } catch (e) {
      console.error(e);
      showToast(i18n.catalog["text_d5a8a4c98344"], "error");
    } finally {
      setLoading(false);
    }
  }, [filterCurrencyId, filterTargetId, filterFromDate, filterToDate]);

  useEffect(() => {
    loadCurrencies();
  }, [loadCurrencies]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const columns: Column<ExchangeRateHistory>[] = [
    {
      key: "currency",
      header: i18n.catalog["text_a049cbb14f26"],
      render: (row) => (
        <span>
          {row.currency?.name || "-"}{" "}
          <span className="text-muted">({row.currency?.code})</span>
        </span>
      ),
    },
    {
      key: "target_currency",
      header: i18n.catalog["text_a7af2ad5f979"],
      render: (row) => (
        <span>
          {row.target_currency?.name || "-"}{" "}
          <span className="text-muted">({row.target_currency?.code})</span>
        </span>
      ),
    },
    {
      key: "exchange_rate",
      header: i18n.catalog["text_fbffb38f5bb4"],
      render: (row) => (
        <strong style={{ fontFamily: "monospace", fontSize: "0.95rem" }}>
          {Number(row.exchange_rate).toFixed(6)}
        </strong>
      ),
    },
    {
      key: "effective_date",
      header: i18n.catalog["text_6f53e00bf25e"],
      render: (row) => row.effective_date,
    },
    {
      key: "source",
      header: i18n.catalog["text_64660bb87d89"],
      render: (row) => (
        <span
          className={`badge ${
            row.source === "MANUAL"
              ? "badge-info-light"
              : row.source === "CENTRAL_BANK"
              ? "badge-success-light"
              : "badge-warning-light"
          }`}
        >
          {row.source === "MANUAL"
            ? i18n.catalog["text_a62cb7790ba3"]
            : row.source === "CENTRAL_BANK"
            ? i18n.catalog["text_3442aeef4a07"]
            : "API"}
        </span>
      ),
    },
    {
      key: "created_by",
      header: i18n.catalog["text_a98b66bae2c9"],
      render: (row) => row.created_by?.name || "-",
    },
    {
      key: "created_at",
      header: i18n.catalog["text_b8fcbb3f2d33"],
      render: (row) =>
        new Date(row.created_at).toLocaleString("ar-SA", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
  ];

  return (
    <MainLayout requiredModule="currency_history">
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
              <h3 style={{ margin: 0 }}>{i18n.catalog["text_485270161657"]}</h3>
              <p
                className="text-muted"
                style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem" }}
              >
                {i18n.catalog["text_1fcb7c297569"]}</p>
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
              <label className="form-label">{i18n.catalog["text_30ce3a1dae2c"]}</label>
              <select
                className="form-control"
                value={filterCurrencyId}
                onChange={(e) => setFilterCurrencyId(e.target.value)}
              >
                <option value="">{i18n.catalog["text_65f276da33cf"]}</option>
                {currencies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{i18n.catalog["text_219c5815ace0"]}</label>
              <select
                className="form-control"
                value={filterTargetId}
                onChange={(e) => setFilterTargetId(e.target.value)}
              >
                <option value="">{i18n.catalog["text_65f276da33cf"]}</option>
                {currencies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <TextInput
                label={i18n.catalog["text_996988dbc52e"]}
                type="date"
                value={filterFromDate}
                onChange={(e) => setFilterFromDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <TextInput
                label={i18n.catalog["text_217caed1c04f"]}
                type="date"
                value={filterToDate}
                onChange={(e) => setFilterToDate(e.target.value)}
              />
            </div>
          </div>

          <Table
            data={history}
            columns={columns}
            keyExtractor={(item) => item.id}
            isLoading={loading}
            emptyMessage={i18n.catalog["text_9a16c6695a92"]}
          />
        </div>
      </div>
    </MainLayout>
  );
}

