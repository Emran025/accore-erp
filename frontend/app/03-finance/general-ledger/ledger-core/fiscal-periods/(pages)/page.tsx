"use client";

import { useI18n, catalogText } from "@/lib/i18n";
import { MainLayout, PageSubHeader } from "@/components/layout";
import { ActionButtons, Button, Column, ConfirmDialog, Dialog, Table, showAlert, showToast } from "@/components/ui";
import { TextInput } from "@/components/ui/TextInput";
import { fetchAPI } from "@/lib/api";
import { User, checkAuth, getStoredUser } from "@/lib/auth";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatDate } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";

interface FiscalPeriod {
  id: number;
  period_name: string;
  start_date: string;
  end_date: string;
  is_locked: boolean;
  is_closed: boolean;
}

export default function FiscalPeriodsPage() {
    const { t: i18n } = useI18n();
  const [user, setUser] = useState<User | null>(null);
  const [periods, setPeriods] = useState<FiscalPeriod[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Dialogs
  const [periodDialog, setPeriodDialog] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: "lock" | "unlock" | "close";
    periodId: number;
  } | null>(null);

  // Form
  const [currentPeriodId, setCurrentPeriodId] = useState<number | null>(null);
  const [periodName, setPeriodName] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");

  const itemsPerPage = 20;

  const loadPeriods = useCallback(async (page: number = 1) => {
    try {
      setIsLoading(true);
      const response = await fetchAPI(`${API_ENDPOINTS.FINANCE.FISCAL_PERIODS.BASE}?page=${page}&limit=${itemsPerPage}`);
      if (response.success && Array.isArray(response.data)) {
        const periods = response.data as FiscalPeriod[];
        setPeriods(periods);
        const pagination = response.pagination as { total_pages?: number } | undefined;
        setTotalPages(pagination?.total_pages ?? Math.max(1, Math.ceil(periods.length / itemsPerPage)));
        setCurrentPage(page);
      } else {
        showAlert("alert-container", response.message || i18n.catalog["text_e5fbfede7e09"], "error");
      }
    } catch {
      showAlert("alert-container", i18n.catalog["text_22fa79f17c32"], "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const authenticated = await checkAuth();
      if (!authenticated) return;

      const storedUser = getStoredUser();
      setUser(storedUser);
      await loadPeriods();
    };
    init();
  }, [loadPeriods]);

  const openCreateDialog = () => {
    setCurrentPeriodId(null);
    setPeriodName("");
    setPeriodStart("");
    setPeriodEnd("");
    setPeriodDialog(true);
  };

  const viewPeriod = async (id: number) => {
    try {
      const response = await fetchAPI(`${API_ENDPOINTS.FINANCE.FISCAL_PERIODS.BASE}?id=${id}`);
      if (response.success && response.data) {
        const period = Array.isArray(response.data) ? response.data[0] : response.data;
        if (period) {
          alert(
            catalogText(i18n, "text_85e1ec56a68a", { value0: period.period_name, value1: formatDate(period.start_date), value2: formatDate(period.end_date), value3: period.is_locked ? i18n.catalog["text_4b2d2c65d365"] : i18n.catalog["text_2bd073516a87"], value4: period.is_closed ? i18n.catalog["text_4b2d2c65d365"] : i18n.catalog["text_2bd073516a87"] })
          );
        }
      }
    } catch {
      showToast(i18n.catalog["text_416cc1248be5"], "error");
    }
  };

  const editPeriod = async (id: number) => {
    try {
      const response = await fetchAPI(`${API_ENDPOINTS.FINANCE.FISCAL_PERIODS.BASE}?id=${id}`);
      if (response.success && response.data) {
        const period = Array.isArray(response.data) ? response.data[0] : response.data;
        if (!period) {
          showAlert("alert-container", i18n.catalog["text_5cea9853fe98"], "error");
          return;
        }

        setCurrentPeriodId(period.id);
        setPeriodName(period.period_name);
        setPeriodStart(period.start_date);
        setPeriodEnd(period.end_date);
        setPeriodDialog(true);
      }
    } catch {
      showAlert("alert-container", i18n.catalog["text_416cc1248be5"], "error");
    }
  };

  const savePeriod = async () => {
    if (!periodName || !periodStart || !periodEnd) {
      showAlert("alert-container", i18n.catalog["text_ee5bf2016153"], "error");
      return;
    }

    try {
      const body: any = {
        period_name: periodName,
        start_date: periodStart,
        end_date: periodEnd,
      };
      if (currentPeriodId) body.id = currentPeriodId;

      const response = await fetchAPI(API_ENDPOINTS.FINANCE.FISCAL_PERIODS.BASE, {
        method: currentPeriodId ? "PUT" : "POST",
        body: JSON.stringify(body),
      });

      if (response.success) {
        showAlert("alert-container", i18n.catalog["text_ff783ee2826d"], "success");
        setPeriodDialog(false);
        await loadPeriods(currentPage);
      } else {
        showAlert("alert-container", response.message || i18n.catalog["text_b0dbba00004b"], "error");
      }
    } catch {
      showAlert("alert-container", i18n.catalog["text_c574313242be"], "error");
    }
  };

  const confirmLockPeriod = (id: number) => {
    setConfirmAction({ type: "lock", periodId: id });
    setConfirmDialog(true);
  };

  const confirmUnlockPeriod = (id: number) => {
    setConfirmAction({ type: "unlock", periodId: id });
    setConfirmDialog(true);
  };

  const confirmClosePeriod = (id: number) => {
    setConfirmAction({ type: "close", periodId: id });
    setConfirmDialog(true);
  };

  const executeAction = async () => {
    if (!confirmAction) return;

    const messages = {
      lock: i18n.catalog["text_64e46a01635b"],
      unlock: i18n.catalog["text_1ff4d2f17553"],
      close: i18n.catalog["text_7fae2238d44c"],
    };

    try {
      let endpoint = "";
      if (confirmAction.type === 'lock') endpoint = API_ENDPOINTS.FINANCE.FISCAL_PERIODS.LOCK;
      else if (confirmAction.type === 'unlock') endpoint = API_ENDPOINTS.FINANCE.FISCAL_PERIODS.UNLOCK;
      else if (confirmAction.type === 'close') endpoint = API_ENDPOINTS.FINANCE.FISCAL_PERIODS.CLOSE;

      const response = await fetchAPI(
        endpoint,
        {
          method: "POST",
          body: JSON.stringify({ id: confirmAction.periodId }),
        }
      );

      if (response.success) {
        const successMessages = {
          lock: i18n.catalog["text_8642af4236c5"],
          unlock: i18n.catalog["text_a247c8409452"],
          close: i18n.catalog["text_d9926ef2082b"],
        };
        showAlert("alert-container", successMessages[confirmAction.type], "success");
        setConfirmDialog(false);
        setConfirmAction(null);
        await loadPeriods(currentPage);
      } else {
        showAlert("alert-container", response.message || i18n.catalog["text_c10db3dd267c"], "error");
      }
    } catch {
      showAlert("alert-container", i18n.catalog["text_a42849991074"], "error");
    }
  };

  const getStatusBadge = (period: FiscalPeriod) => {
    if (period.is_closed) {
      return <span className="badge badge-danger">{i18n.catalog["text_ca7e1dec1654"]}</span>;
    } else if (period.is_locked) {
      return <span className="badge badge-warning">{i18n.catalog["text_03fc404e13c8"]}</span>;
    }
    return <span className="badge badge-success">{i18n.catalog["text_8ab217d48613"]}</span>;
  };

  const columns: Column<FiscalPeriod>[] = [
    {
      key: "period_name",
      header: i18n.catalog["text_eaad95530396"],
      dataLabel: i18n.catalog["text_eaad95530396"],
      render: (item) => <strong>{item.period_name}</strong>,
    },
    {
      key: "start_date",
      header: i18n.catalog["text_fa53acac3b29"],
      dataLabel: i18n.catalog["text_fa53acac3b29"],
      render: (item) => formatDate(item.start_date),
    },
    {
      key: "end_date",
      header: i18n.catalog["text_5b51836ad9ac"],
      dataLabel: i18n.catalog["text_5b51836ad9ac"],
      render: (item) => formatDate(item.end_date),
    },
    {
      key: "status",
      header: i18n.catalog["text_c3a4749caed4"],
      dataLabel: i18n.catalog["text_c3a4749caed4"],
      render: (item) => getStatusBadge(item),
    },
    {
      key: "is_locked",
      header: i18n.catalog["text_03fc404e13c8"],
      dataLabel: i18n.catalog["text_03fc404e13c8"],
      render: (item) => (item.is_locked ? "✓" : "✗"),
    },
    {
      key: "is_closed",
      header: i18n.catalog["text_ca7e1dec1654"],
      dataLabel: i18n.catalog["text_ca7e1dec1654"],
      render: (item) => (item.is_closed ? "✓" : "✗"),
    },
    {
      key: "actions",
      header: i18n.catalog["text_7797240d6caf"],
      dataLabel: i18n.catalog["text_7797240d6caf"],
      render: (item) => (
        <ActionButtons
          actions={[
            {
              icon: "eye",
              title: i18n.catalog["text_3824e18ca83b"],
              variant: "view",
              onClick: () => viewPeriod(item.id)
            },
            {
              icon: item.is_locked ? "unlock" : "lock",
              title: item.is_locked ? i18n.catalog["text_3765484d0c5f"] : i18n.catalog["text_7815a91262fc"],
              variant: "view",
              onClick: () => (item.is_locked ? confirmUnlockPeriod(item.id) : confirmLockPeriod(item.id)),
              hidden: item.is_closed
            },
            {
              icon: "edit",
              title: i18n.catalog["text_113d570d6555"],
              variant: "edit",
              onClick: () => editPeriod(item.id),
              hidden: item.is_closed || item.is_locked
            },
            {
              icon: "check",
              title: i18n.catalog["text_ca90c297b099"],
              variant: "delete", // Closing is a "danger" action here
              onClick: () => confirmClosePeriod(item.id),
              hidden: item.is_closed
            }
          ]}
        />
      ),
    },
  ];

  return (
    < MainLayout>


      <div id="alert-container"></div>

      <div className="sales-card animate-fade">
        <PageSubHeader
          user={user}
          actions={
            <Button variant="primary" icon="plus" onClick={openCreateDialog}>
              {i18n.catalog["text_e14d8ac47493"]}</Button>
          }
        />
        <Table
          columns={columns}
          data={periods}
          keyExtractor={(item) => item.id}
          emptyMessage={i18n.catalog["text_a90b97f9b44c"]}
          isLoading={isLoading}
          pagination={{
            currentPage,
            totalPages,
            onPageChange: loadPeriods,
          }}
        />
      </div>

      {/* Period Dialog */}
      <Dialog
        isOpen={periodDialog}
        onClose={() => setPeriodDialog(false)}
        title={currentPeriodId ? i18n.catalog["text_642c3b34ca7b"] : i18n.catalog["text_becf48aac6bc"]}
        footer={
          <>
            <Button variant="secondary" onClick={() => setPeriodDialog(false)}>
              {i18n.catalog["text_9a30dc2a96b8"]}</Button>
            <Button variant="primary" onClick={savePeriod}>
              {i18n.catalog["text_ddfcaf9d0144"]}</Button>
          </>
        }
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            savePeriod();
          }}
          className="space-y-4"
        >
          <TextInput
            label={i18n.catalog["text_f1aecdc2642f"]}
            id="period-name"
            value={periodName}
            onChange={(e) => setPeriodName(e.target.value)}
            required
          />

          <div className="form-row">
            <TextInput
              type="date"
              label={i18n.catalog["text_d5176c9868fe"]}
              id="period-start"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              required
              className="flex-1"
            />
            <TextInput
              type="date"
              label={i18n.catalog["text_1afab48eab54"]}
              id="period-end"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              required
              className="flex-1"
            />
          </div>
        </form>
      </Dialog>

      {/* Confirm Action Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog}
        onClose={() => {
          setConfirmDialog(false);
          setConfirmAction(null);
        }}
        onConfirm={executeAction}
        title={i18n.catalog["text_c094165ba1ec"]}
        message={
          confirmAction?.type === "lock"
            ? i18n.catalog["text_64e46a01635b"]
            : confirmAction?.type === "unlock"
              ? i18n.catalog["text_1ff4d2f17553"]
              : i18n.catalog["text_7fae2238d44c"]
        }
        confirmText={i18n.catalog["text_8f7d74ac0eac"]}
        confirmVariant={confirmAction?.type === "close" ? "danger" : "primary"}
      />
    </MainLayout>
  );
}

