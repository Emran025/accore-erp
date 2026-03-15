export interface AuthEndpoints {
    LOGIN: string;
    LOGOUT: string;
    CHECK: string;
}

export const AUTH: AuthEndpoints = {
    LOGIN: "/v2/login",
    LOGOUT: "/v2/logout",
    CHECK: "/v2/check",
};
