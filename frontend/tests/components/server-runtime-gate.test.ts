import { getServerUpdateProgressDetail } from '@/components/platform/ServerOperationsNotificationCenter';
import { shouldAutomaticallyStartRuntime } from '@/components/platform/ServerRuntimeGate';
import { catalogMessage } from '@/lib/i18n';

describe('Server Desktop runtime experience', () => {
  it('requests one automatic start only when a packaged server is not ready', () => {
    const stoppedStatus = {
      state: 'stopped',
      detail: 'service is stopped',
      runtimePresent: true,
    };

    expect(shouldAutomaticallyStartRuntime(stoppedStatus as never, false)).toBe(true);
    expect(shouldAutomaticallyStartRuntime(stoppedStatus as never, true)).toBe(false);
    expect(
      shouldAutomaticallyStartRuntime({ ...stoppedStatus, state: 'ready' } as never, false)
    ).toBe(false);
    expect(
      shouldAutomaticallyStartRuntime({ ...stoppedStatus, runtimePresent: false } as never, false)
    ).toBe(false);
  });

  it('keeps signed-update download progress in the bottom notification wording', () => {
    expect(
      getServerUpdateProgressDetail({
        phase: 'downloading',
        downloadedBytes: 50,
        totalBytes: 200,
      })
    ).toBe(catalogMessage('platform.product.serverUpdateDownloadingProgress', { percentage: 25 }));
  });
});
