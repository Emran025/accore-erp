"use client";

import { useI18n, catalogText } from "@/lib/i18n";
import { MainLayout, PageSubHeader } from "@/components/layout";
import { ActionButtons, Button, Column, ConfirmDialog, Dialog, Table, showAlert, showToast } from "@/components/ui";
import { TextInput } from "@/components/ui/TextInput";
import { fetchAPI } from "@/lib/api";
import { User, checkAuth, getStoredUser } from "@/lib/auth";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatDate } from "@/lib/utils";
import { publishProductNotification } from "@/stores/useNotificationStore";
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

        const warningWindowInMilliseconds = 30 * 24 * 60 * 60 * 1000;
        const upcomingPeriod = periods
          .filter((period) => !period.is_closed)
          .map((period) => ({ period, remainingTime: new Date(period.end_date).getTime() - Date.now() }))
          .filter(({ remainingTime }) => remainingTime >= 0 && remainingTime <= warningWindowInMilliseconds)
          .sort((first, second) => first.remainingTime - second.remainingTime)[0]?.period;

        if (upcomingPeriod) {
          publishProductNotification({
            message: catalogText(i18n, "finance.fiscalPeriods.nearingEndNotification", {
              value0: i18n.catalog["finance.fiscalPeriods.periodName"],
              value1: upcomingPeriod.period_name,
              value2: formatDate(upcomingPeriod.end_date),
            }),
            source: "fiscal-periods",
            action: {
              href: "/03-finance/general-ledger/ledger-core/fiscal-periods",
              label: i18n.catalog["navigation.financeConfig.fiscalPeriods"],
            },
            dedupeKey: `fiscal-period-nearing-end:${upcomingPeriod.id}`,
          });
        }
      } else {
        showAlert("alert-container", response.message || i18n.catalog["finance.fiscalPeriods.failedLoadFinancialPeriods"], "error");
      }
    } catch {
      showAlert("alert-container", i18n.catalog["common.general.errorConnectingServer"], "error");
    } finally {
      setIsLoading(false);
    }
  }, [i18n.catalog]);

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
            catalogText(i18n, "finance.fiscalPeriods.periodNameLockedClosed", { value0: period.period_name, value1: formatDate(period.start_date), value2: formatDate(period.end_date), value3: period.is_locked ? i18n.catalog["common.general.yes"] : i18n.catalog["common.general.no"], value4: period.is_closed ? i18n.catalog["common.general.yes"] : i18n.catalog["common.general.no"] })
          );
        }
      }
    } catch {
      showToast(i18n.catalog["common.general.errorLoadingPeriod"], "error");
    }
  };

  const editPeriod = async (id: number) => {
    try {
      const response = await fetchAPI(`${API_ENDPOINTS.FINANCE.FISCAL_PERIODS.BASE}?id=${id}`);
      if (response.success && response.data) {
        const period = Array.isArray(response.data) ? response.data[0] : response.data;
        if (!period) {
          showAlert("alert-container", i18n.catalog["finance.fiscalPeriods.periodNotFound"], "error");
          return;
        }

        setCurrentPeriodId(period.id);
        setPeriodName(period.period_name);
        setPeriodStart(period.start_date);
        setPeriodEnd(period.end_date);
        setPeriodDialog(true);
      }
    } catch {
      showAlert("alert-container", i18n.catalog["common.general.errorLoadingPeriod"], "error");
    }
  };

  const savePeriod = async () => {
    if (!periodName || !periodStart || !periodEnd) {
      showAlert("alert-container", i18n.catalog["common.general.pleaseFillAllFields"], "error");
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
        showAlert("alert-container", i18n.catalog["common.general.savedSuccessfully"], "success");
        setPeriodDialog(false);
        await loadPeriods(currentPage);
      } else {
        showAlert("alert-container", response.message || i18n.catalog["common.general.failedSave"], "error");
      }
    } catch {
      showAlert("alert-container", i18n.catalog["common.general.errorSaving"], "error");
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
      lock: i18n.catalog["common.general.areYouSureYouWantLockThisPeriod"],
      unlock: i18n.catalog["common.general.areYouSureYouWantOpenThisPeriod"],
      close: i18n.catalog["common.general.areYouSureYouWantCloseThisPeriod"],
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
          lock: i18n.catalog["finance.fiscalPeriods.periodLockedSuccessfully"],
          unlock: i18n.catalog["finance.fiscalPeriods.periodOpenedSuccessfully"],
          close: i18n.catalog["finance.fiscalPeriods.periodClosedSuccessfully"],
        };
        showAlert("alert-container", successMessages[confirmAction.type], "success");
        setConfirmDialog(false);
        setConfirmAction(null);
        await loadPeriods(currentPage);
      } else {
        showAlert("alert-container", response.message || i18n.catalog["finance.fiscalPeriods.operationFailed"], "error");
      }
    } catch {
      showAlert("alert-container", i18n.catalog["finance.fiscalPeriods.errorExecutingOperation"], "error");
    }
  };

  const getStatusBadge = (period: FiscalPeriod) => {
    if (period.is_closed) {
      return <span className="badge badge-danger">{i18n.catalog["common.general.closed"]}</span>;
    } else if (period.is_locked) {
      return <span className="badge badge-warning">{i18n.catalog["common.general.locked"]}</span>;
    }
    return <span className="badge badge-success">{i18n.catalog["common.general.active.alternative2"]}</span>;
  };

  const columns: Column<FiscalPeriod>[] = [
    {
      key: "period_name",
      header: i18n.catalog["common.general.periodName"],
      dataLabel: i18n.catalog["common.general.periodName"],
      render: (item) => <strong>{item.period_name}</strong>,
    },
    {
      key: "start_date",
      header: i18n.catalog["common.general.startDate.alternative4"],
      dataLabel: i18n.catalog["common.general.startDate.alternative4"],
      render: (item) => formatDate(item.start_date),
    },
    {
      key: "end_date",
      header: i18n.catalog["common.general.endDate"],
      dataLabel: i18n.catalog["common.general.endDate"],
      render: (item) => formatDate(item.end_date),
    },
    {
      key: "status",
      header: i18n.catalog["common.general.status.alternative2"],
      dataLabel: i18n.catalog["common.general.status.alternative2"],
      render: (item) => getStatusBadge(item),
    },
    {
      key: "is_locked",
      header: i18n.catalog["common.general.locked"],
      dataLabel: i18n.catalog["common.general.locked"],
      render: (item) => (item.is_locked ? "✓" : "✗"),
    },
    {
      key: "is_closed",
      header: i18n.catalog["common.general.closed"],
      dataLabel: i18n.catalog["common.general.closed"],
      render: (item) => (item.is_closed ? "✓" : "✗"),
    },
    {
      key: "actions",
      header: i18n.catalog["common.general.actions"],
      dataLabel: i18n.catalog["common.general.actions"],
      render: (item) => (
        <ActionButtons
          actions={[
            {
              icon: "eye",
              title: i18n.catalog["common.general.view"],
              variant: "view",
              onClick: () => viewPeriod(item.id)
            },
            {
              icon: item.is_locked ? "unlock" : "lock",
              title: item.is_locked ? i18n.catalog["finance.fiscalPeriods.open"] : i18n.catalog["finance.fiscalPeriods.lock"],
              variant: "view",
              onClick: () => (item.is_locked ? confirmUnlockPeriod(item.id) : confirmLockPeriod(item.id)),
              hidden: item.is_closed
            },
            {
              icon: "edit",
              title: i18n.catalog["common.general.edit"],
              variant: "edit",
              onClick: () => editPeriod(item.id),
              hidden: item.is_closed || item.is_locked
            },
            {
              icon: "check",
              title: i18n.catalog["common.general.close"],
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
              {i18n.catalog["finance.fiscalPeriods.newPeriod"]}</Button>
          }
        />
        <Table
          columns={columns}
          data={periods}
          keyExtractor={(item) => item.id}
          emptyMessage={i18n.catalog["finance.fiscalPeriods.noFinancialPeriods"]}
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
        title={currentPeriodId ? i18n.catalog["finance.fiscalPeriods.editPeriod"] : i18n.catalog["finance.fiscalPeriods.newFiscalPeriod"]}
        footer={
          <>
            <Button variant="secondary" onClick={() => setPeriodDialog(false)}>
              {i18n.catalog["common.general.cancel"]}</Button>
            <Button variant="primary" onClick={savePeriod}>
              {i18n.catalog["common.general.save"]}</Button>
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
            label={i18n.catalog["finance.fiscalPeriods.periodName"]}
            id="period-name"
            value={periodName}
            onChange={(e) => setPeriodName(e.target.value)}
            required
          />

          <div className="form-row">
            <TextInput
              type="date"
              label={i18n.catalog["finance.fiscalPeriods.startDate"]}
              id="period-start"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              required
              className="flex-1"
            />
            <TextInput
              type="date"
              label={i18n.catalog["finance.fiscalPeriods.endDate"]}
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
        title={i18n.catalog["finance.fiscalPeriods.confirmOperation"]}
        message={
          confirmAction?.type === "lock"
            ? i18n.catalog["common.general.areYouSureYouWantLockThisPeriod"]
            : confirmAction?.type === "unlock"
              ? i18n.catalog["common.general.areYouSureYouWantOpenThisPeriod"]
              : i18n.catalog["common.general.areYouSureYouWantCloseThisPeriod"]
        }
        confirmText={i18n.catalog["common.general.confirm"]}
        confirmVariant={confirmAction?.type === "close" ? "danger" : "primary"}
      />
    </MainLayout>
  );
}

