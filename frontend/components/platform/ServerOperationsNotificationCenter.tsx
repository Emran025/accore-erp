'use client';

import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ArchiveRestore, Download, LoaderCircle, ShieldCheck } from 'lucide-react';
import { catalogMessage } from '@/lib/i18n';
import {
  isServerDesktopRuntime,
  readServerBackupStatus,
  requestServerBackup,
  type ServerBackupStatus,
} from '@/lib/server-runtime';
import { installSignedServerDesktopUpdate } from '@/lib/server-desktop-updater';
import { type DesktopUpdateProgress } from '@/lib/desktop-auto-updater';
import { publishOperationalNotification } from '@/stores/useNotificationStore';

interface ServerOperationsContextValue {
  supported: boolean;
  backupStatus: ServerBackupStatus | null;
  updateProgress: DesktopUpdateProgress | null;
  isBackingUp: boolean;
  isInstallingUpdate: boolean;
  backupFailed: boolean;
  updateFailed: boolean;
  requestBackup: () => Promise<void>;
  checkForUpdate: () => Promise<void>;
}

const ServerOperationsContext = createContext<ServerOperationsContextValue | null>(null);

const BACKUP_NOTIFICATION_KEY = 'server-operations:backup';
const UPDATE_NOTIFICATION_KEY = 'server-operations:update';

function updateDownloadPercentage(progress: DesktopUpdateProgress | null): number | null {
  if (
    progress?.phase !== 'downloading' ||
    progress.totalBytes === undefined ||
    progress.totalBytes <= 0 ||
    progress.downloadedBytes === undefined
  ) {
    return null;
  }

  return Math.min(100, Math.round((progress.downloadedBytes / progress.totalBytes) * 100));
}

export function getServerUpdateProgressDetail(progress: DesktopUpdateProgress | null): string {
  switch (progress?.phase) {
    case 'checking':
      return catalogMessage('platform.product.serverUpdateChecking');
    case 'available':
      return catalogMessage('platform.product.serverUpdateAvailableVersion', {
        version: progress.version,
      });
    case 'downloading': {
      const percentage = updateDownloadPercentage(progress);
      return percentage === null
        ? catalogMessage('platform.product.serverUpdateDownloading')
        : catalogMessage('platform.product.serverUpdateDownloadingProgress', { percentage });
    }
    case 'preparing':
      return catalogMessage('platform.product.serverUpdatePreparing');
    case 'installing':
    case 'relaunching':
      return catalogMessage('platform.product.serverUpdateInstalling');
    case 'recovering':
      return catalogMessage('platform.product.serverUpdateRecovering');
    case 'up-to-date':
    default:
      return catalogMessage('platform.product.serverUpdateNone');
  }
}

function shouldPublishUpdateProgress(progress: DesktopUpdateProgress): boolean {
  return ['downloading', 'preparing', 'installing', 'relaunching', 'recovering'].includes(
    progress.phase
  );
}

export function ServerOperationsProvider({ children }: { children: ReactNode }) {
  const supported = isServerDesktopRuntime();
  const [backupStatus, setBackupStatus] = useState<ServerBackupStatus | null>(null);
  const [updateProgress, setUpdateProgress] = useState<DesktopUpdateProgress | null>(null);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isInstallingUpdate, setIsInstallingUpdate] = useState(false);
  const [backupFailed, setBackupFailed] = useState(false);
  const [updateFailed, setUpdateFailed] = useState(false);
  const hasCheckedForUpdate = useRef(false);
  const updateInFlight = useRef(false);

  const refreshBackupStatus = useCallback(async () => {
    if (!supported) return;

    const status = await readServerBackupStatus();
    if (status) setBackupStatus(status);
  }, [supported]);

  useEffect(() => {
    if (!supported) return;

    void refreshBackupStatus();
    const interval = window.setInterval(() => void refreshBackupStatus(), 5_000);
    return () => window.clearInterval(interval);
  }, [refreshBackupStatus, supported]);

  const reportUpdateProgress = useCallback((progress: DesktopUpdateProgress) => {
    setUpdateProgress(progress);
    if (!shouldPublishUpdateProgress(progress)) return;

    publishOperationalNotification({
      message: getServerUpdateProgressDetail(progress),
      source: catalogMessage('platform.product.serverOperationsTitle'),
      severity: progress.phase === 'recovering' ? 'warning' : 'info',
      dedupeKey: UPDATE_NOTIFICATION_KEY,
    });
  }, []);

  const checkForUpdate = useCallback(async () => {
    if (!supported || updateInFlight.current) return;

    updateInFlight.current = true;
    setIsInstallingUpdate(true);
    setUpdateFailed(false);
    try {
      await installSignedServerDesktopUpdate({ onProgress: reportUpdateProgress });
    } catch {
      setUpdateFailed(true);
      publishOperationalNotification({
        message: catalogMessage('platform.product.serverOperationRetry'),
        source: catalogMessage('platform.product.serverUpdateTitle'),
        severity: 'error',
        dedupeKey: UPDATE_NOTIFICATION_KEY,
      });
    } finally {
      updateInFlight.current = false;
      setIsInstallingUpdate(false);
    }
  }, [reportUpdateProgress, supported]);

  useEffect(() => {
    if (!supported || hasCheckedForUpdate.current) return;

    hasCheckedForUpdate.current = true;
    void checkForUpdate();
  }, [checkForUpdate, supported]);

  const requestBackup = useCallback(async () => {
    if (!supported || isBackingUp || isInstallingUpdate) return;

    setIsBackingUp(true);
    setBackupFailed(false);
    try {
      const status = await requestServerBackup();
      if (!status) throw new Error('backup-operation-unavailable');

      const requestedStatus: ServerBackupStatus = {
        ...status,
        state: 'pending',
        detail: catalogMessage('platform.product.serverBackupRequested'),
      };
      setBackupStatus(requestedStatus);
      publishOperationalNotification({
        message: requestedStatus.detail,
        source: catalogMessage('platform.product.serverBackupTitle'),
        severity: 'info',
        dedupeKey: BACKUP_NOTIFICATION_KEY,
      });
    } catch {
      setBackupFailed(true);
      publishOperationalNotification({
        message: catalogMessage('platform.product.serverOperationRetry'),
        source: catalogMessage('platform.product.serverBackupTitle'),
        severity: 'error',
        dedupeKey: BACKUP_NOTIFICATION_KEY,
      });
    } finally {
      setIsBackingUp(false);
    }
  }, [isBackingUp, isInstallingUpdate, supported]);

  const value = useMemo<ServerOperationsContextValue>(
    () => ({
      supported,
      backupStatus,
      updateProgress,
      isBackingUp,
      isInstallingUpdate,
      backupFailed,
      updateFailed,
      requestBackup,
      checkForUpdate,
    }),
    [
      backupFailed,
      backupStatus,
      checkForUpdate,
      isBackingUp,
      isInstallingUpdate,
      requestBackup,
      supported,
      updateFailed,
      updateProgress,
    ]
  );

  return (
    <ServerOperationsContext.Provider value={value}>{children}</ServerOperationsContext.Provider>
  );
}

export function ServerOperationsCenterPanel() {
  const operations = useContext(ServerOperationsContext);
  if (!operations?.supported) return null;

  const updateDetail = getServerUpdateProgressDetail(operations.updateProgress);
  const downloadPercentage = updateDownloadPercentage(operations.updateProgress);
  const hasFailure = operations.backupFailed || operations.updateFailed;

  return (
    <details className="status-notification-server-operations">
      <summary className="status-notification-server-operations-summary">
        <span className="status-notification-server-operations-summary-title">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          {catalogMessage('platform.product.serverOperationsTitle')}
        </span>
        <span className="status-notification-server-operations-summary-state">
          {operations.isInstallingUpdate || operations.isBackingUp
            ? catalogMessage('platform.product.serverRuntimeChecking')
            : catalogMessage('platform.product.serverRuntimeServiceContinuity')}
        </span>
      </summary>

      <div className="status-notification-server-operations-grid">
        <section className="status-notification-server-operation-card">
          <div className="status-notification-server-operation-heading">
            <ArchiveRestore className="h-4 w-4" aria-hidden="true" />
            <span>{catalogMessage('platform.product.serverBackupTitle')}</span>
          </div>
          <p className="status-notification-server-operation-detail">
            {operations.backupStatus?.detail ??
              catalogMessage('platform.product.serverBackupUnavailable')}
          </p>
          <button
            type="button"
            className="status-notification-server-operation-button"
            onClick={() => void operations.requestBackup()}
            disabled={operations.isBackingUp || operations.isInstallingUpdate}
          >
            {operations.isBackingUp
              ? catalogMessage('platform.product.serverBackupRequested')
              : catalogMessage('platform.product.serverBackupCreate')}
          </button>
        </section>

        <section className="status-notification-server-operation-card">
          <div className="status-notification-server-operation-heading">
            {operations.isInstallingUpdate ? (
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Download className="h-4 w-4" aria-hidden="true" />
            )}
            <span>{catalogMessage('platform.product.serverUpdateTitle')}</span>
          </div>
          <p className="status-notification-server-operation-detail">{updateDetail}</p>
          {downloadPercentage !== null && (
            <div
              className="status-notification-server-update-progress"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={downloadPercentage}
              aria-label={updateDetail}
            >
              <span style={{ width: `${downloadPercentage}%` }} />
            </div>
          )}
          <button
            type="button"
            className="status-notification-server-operation-button"
            onClick={() => void operations.checkForUpdate()}
            disabled={operations.isInstallingUpdate || operations.isBackingUp}
          >
            {operations.isInstallingUpdate
              ? catalogMessage('platform.product.serverUpdateInstalling')
              : catalogMessage('platform.product.serverUpdateCheck')}
          </button>
        </section>
      </div>

      {hasFailure && (
        <p className="status-notification-server-operation-error">
          {catalogMessage('platform.product.serverOperationRetry')}
        </p>
      )}
    </details>
  );
}
