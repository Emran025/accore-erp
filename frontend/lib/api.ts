import { catalogMessage } from "@/lib/i18n";
import { API_ENDPOINTS } from "./endpoints";
export {
  formatDate,
  escapeHtml,
  getRoleBadgeText,
  getRoleBadgeClass,
  getArabicDate,
  generateBarcode,
  generateQRCode
} from "./utils";

const getApiBase = () => {
  const envBase = process.env.NEXT_PUBLIC_API_BASE;
  if (!envBase || envBase === 'undefined' || envBase === 'null') {
    return 'http://127.0.0.1:8000/api';
  }
  return envBase;
};

const API_BASE = getApiBase();

if (!process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_API_BASE === 'undefined') {
  console.warn(catalogMessage("text_65f60640bc8a") + API_BASE);
}

/**
 * Standard API response structure for the application.
 */
export interface APIResponse<T = any> {
  /** Indicates if the operation was successful */
  success?: boolean;
  /** Human-readable message (often in Arabic) */
  message?: string;
  /** Primary record ID if applicable */
  id?: number | string;
  /** Additional data fields returned by the server */
  data?: T;
  [key: string]: unknown;
}

/**
 * Options for the fetchAPI utility.
 */
interface FetchOptions {
  /** HTTP method to use */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  /** JSON string for the request body */
  body?: string;
  /** Custom headers to include */
  headers?: Record<string, string>;
}

/**
 * Core utility for making authenticated requests to the Laravel backend.
 * Handles API base URL resolution, CSRF/Session token injection, and unified error handling.
 * 
 * @param action The API endpoint path (relative to the base API URL)
 * @param options Configuration for the fetch request
 * @returns A promise resolving to the standard APIResponse structure
 */
export async function fetchAPI<T = unknown>(
  action: string,
  options?: FetchOptions
): Promise<APIResponse<T>> 
{
  const headers: Record<string, string> = {
    'Content-Type': "application/json",
    'Accept': "application/json",
    ...options?.headers,
  };

  // Add session token to headers if it exists
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('sessionToken');
    if (token) {
      headers['X-Session-Token'] = token;
    }
  }

  const fetchOptions: RequestInit = {
    method: options?.method || 'GET',
    headers: headers,
    credentials: 'include',
  };

  if (options?.body) {
    fetchOptions.body = options.body;
  }

  try {
    const cleanAction = action
      .replace(/^\//, "") // Remove leading slash
      .replace(/^api\//, "") // Remove api/ prefix
      .replace(/^\?/, ""); // Remove leading ? if any

    const isAuthEndpoint = cleanAction.includes(catalogMessage("text_975a0ada7b40")) || cleanAction.includes(catalogMessage("text_a0201c7e6498")) || cleanAction.includes(catalogMessage("text_aebd8f0f4a5e")) || cleanAction.includes(catalogMessage("text_0d5e0fdaf762")) || cleanAction.includes(catalogMessage("text_0d2f2671e84c")) || cleanAction.includes(catalogMessage("text_a3a49032ecd3"));

    // --- Fast Fail block: Stop all network requests if session is already expired ---
    if (typeof window !== 'undefined') {
      try {
        const { useAuthStore } = await import("@/stores/useAuthStore");
        if (useAuthStore.getState().sessionExpired && !isAuthEndpoint) {
          return { success: false, message: catalogMessage("text_c4741d7adbc9") };
        }
      } catch (e) {
        // ignore dynamic import errors
      }
    }

    // Laravel uses RESTful paths.
    // Ensure we don't have double slashes if action is empty
    const url = cleanAction ? catalogMessage("text_0907f4dfb304", { value0: API_BASE, value1: cleanAction }) : API_BASE;

    const response = await fetch(url as string, fetchOptions);

    if (response.status === 401 || response.status === 403) {
      if (typeof window !== 'undefined') {
        if (!isAuthEndpoint) {
          try {
            const { useAuthStore } = await import("@/stores/useAuthStore");
            const isStillAuth = await useAuthStore.getState().checkAuth(true); // Force sync
            if (!isStillAuth) {
              useAuthStore.getState().setSessionExpired(true);
            }
          } catch (e) {
             const { useAuthStore } = await import("@/stores/useAuthStore");
             useAuthStore.getState().setSessionExpired(true);
          }
        }
      }
      return { success: false, message: response.status === 403 ? catalogMessage("text_73056c6772bf") : catalogMessage("text_d089c8a9fc28") };
    }

    if (!response.ok) {
      try {
        const errData = await response.json();
        return {
          success: false,
          message: errData.message || catalogMessage("text_b8290576edf7", { value0: response.status }),
        };
      } catch {
        return { success: false, message: catalogMessage("text_b8290576edf7", { value0: response.status }) };
      }
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(catalogMessage("text_16e74a071ca9"), error);
    return { success: false, message: catalogMessage("text_e7a68cd7868b") };
  }
}




