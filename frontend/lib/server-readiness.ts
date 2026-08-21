import {
  COMPILED_PRODUCT_ENVIRONMENT,
  resolveApiBase,
  resolveProductFlavor,
  type ProductBuildEnvironment,
} from '@/lib/product-flavor';

export const SERVER_HEALTH_CHECK_TIMEOUT_MS = 5_000;

export type ServerReadinessState =
  | { kind: 'not-server' }
  | { kind: 'checking'; healthUrl: string }
  | { kind: 'ready'; healthUrl: string }
  | { kind: 'unavailable'; healthUrl: string };

export function resolveServerHealthUrl(
  environment: ProductBuildEnvironment = COMPILED_PRODUCT_ENVIRONMENT
): string | undefined {
  if (resolveProductFlavor(environment) !== 'server') return undefined;

  const apiBase = resolveApiBase(environment);
  if (!apiBase) return undefined;

  const url = new URL(apiBase);
  url.pathname = '/up';
  url.search = '';
  url.hash = '';
  return url.toString();
}

export function initialServerReadiness(
  environment: ProductBuildEnvironment = COMPILED_PRODUCT_ENVIRONMENT
): ServerReadinessState {
  const healthUrl = resolveServerHealthUrl(environment);
  return healthUrl ? { kind: 'checking', healthUrl } : { kind: 'not-server' };
}

export function resolveServerReadiness(
  healthy: boolean,
  environment: ProductBuildEnvironment = COMPILED_PRODUCT_ENVIRONMENT
): ServerReadinessState {
  const healthUrl = resolveServerHealthUrl(environment);
  if (!healthUrl) return { kind: 'not-server' };
  return healthy ? { kind: 'ready', healthUrl } : { kind: 'unavailable', healthUrl };
}

export function blocksProtectedServerRoutes(state: ServerReadinessState): boolean {
  return state.kind === 'checking' || state.kind === 'unavailable';
}
