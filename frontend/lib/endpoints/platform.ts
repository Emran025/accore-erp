export interface PlatformEndpoints {
    NUMBER_RANGES: {
        OBJECTS: {
            BASE: string;
            SUMMARY: string;
            withId: (id: string | number) => string;
            byType: (type: string) => string;
        };
        GROUPS: {
            list: (objectId: string | number) => string;
            create: (objectId: string | number) => string;
            update: (groupId: string | number) => string;
            delete: (groupId: string | number) => string;
        };
        INTERVALS: {
            list: (objectId: string | number) => string;
            create: (objectId: string | number) => string;
            update: (intervalId: string | number) => string;
            delete: (intervalId: string | number) => string;
            expand: (intervalId: string | number) => string;
            expansionLogs: (intervalId: string | number) => string;
        };
        ASSIGNMENTS: {
            list: (objectId: string | number) => string;
            create: (objectId: string | number) => string;
            delete: (assignmentId: string | number) => string;
        };
        FULLNESS: (objectId: string | number) => string;
        NEXT_NUMBER: string;
        PREVIEW_NUMBER: string;
    };
    AUTOMATION: {
        TEMPLATES: {
            BASE: string;
            withId: (id: string | number) => string;
            byKey: (key: string) => string;
            byType: (type: string) => string;
            HISTORY: (id: string | number) => string;
            RENDER: (id: string | number) => string;
            APPROVED_KEYS: string;
        };
    };
}

export const PLATFORM: PlatformEndpoints = {
    NUMBER_RANGES: {
        OBJECTS: {
            BASE: "/v2/number-ranges",
            SUMMARY: "/v2/number-ranges/summary",
            withId: (id: string | number) => `/v2/number-ranges/${id}`,
            byType: (type: string) => `/v2/number-ranges/type/${type}`,
        },
        GROUPS: {
            list: (objectId: string | number) => `/v2/number-ranges/${objectId}/groups`,
            create: (objectId: string | number) => `/v2/number-ranges/${objectId}/groups`,
            update: (groupId: string | number) => `/v2/number-ranges/groups/${groupId}`,
            delete: (groupId: string | number) => `/v2/number-ranges/groups/${groupId}`,
        },
        INTERVALS: {
            list: (objectId: string | number) => `/v2/number-ranges/${objectId}/intervals`,
            create: (objectId: string | number) => `/v2/number-ranges/${objectId}/intervals`,
            update: (intervalId: string | number) => `/v2/number-ranges/intervals/${intervalId}`,
            delete: (intervalId: string | number) => `/v2/number-ranges/intervals/${intervalId}`,
            expand: (intervalId: string | number) => `/v2/number-ranges/intervals/${intervalId}/expand`,
            expansionLogs: (intervalId: string | number) => `/v2/number-ranges/intervals/${intervalId}/expansion-logs`,
        },
        ASSIGNMENTS: {
            list: (objectId: string | number) => `/v2/number-ranges/${objectId}/assignments`,
            create: (objectId: string | number) => `/v2/number-ranges/${objectId}/assignments`,
            delete: (assignmentId: string | number) => `/v2/number-ranges/assignments/${assignmentId}`,
        },
        FULLNESS: (objectId: string | number) => `/v2/number-ranges/${objectId}/fullness`,
        NEXT_NUMBER: "/v2/number-ranges/next-number",
        PREVIEW_NUMBER: "/v2/number-ranges/preview-number",
    },
    AUTOMATION: {
        TEMPLATES: {
            BASE: "/v2/templates",
            withId: (id: string | number) => `/v2/templates/${id}`,
            byKey: (key: string) => `/v2/templates/key/${key}`,
            byType: (type: string) => `/v2/templates/type/${type}`,
            HISTORY: (id: string | number) => `/v2/templates/${id}/history`,
            RENDER: (id: string | number) => `/v2/templates/${id}/render`,
            APPROVED_KEYS: "/v2/templates/approved-keys",
        },
    },
};
