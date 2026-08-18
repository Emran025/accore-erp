export interface AuthEndpoints {
  LOGIN: string;
  LOGOUT: string;
  CHECK: string;
  REFRESH: string;
  REVOKE: string;
}

export const AUTH: AuthEndpoints = {
  LOGIN: '/v2/login',
  LOGOUT: '/v2/logout',
  CHECK: '/v2/check',
  REFRESH: '/v2/refresh',
  REVOKE: '/v2/revoke',
};
