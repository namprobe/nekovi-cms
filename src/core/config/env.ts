//src/core/config/env.ts
// Helper function to normalize URL by removing trailing slash
function normalizeUrl(url: string): string {
    return url.endsWith('/') ? url.slice(0, -1) : url;
}

const BASE_URL = normalizeUrl(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5240");
const CMS_PREFIX = process.env.NEXT_PUBLIC_CMS_PREFIX || "/api/cms";
const COMMON_PREFIX = process.env.NEXT_PUBLIC_COMMON_PREFIX || "/api/common";

export const env = {
    //API Configuration
    BASE_URL,
    CMS_PREFIX,
    COMMON_PREFIX,

    //app config
    APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "NekoVi CMS",
    APP_DESCRIPTION: process.env.NEXT_PUBLIC_APP_DESCRIPTION || "NekoVi CMS",
    APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",

    //auth config
    JWT_SECRET: process.env.NEXT_PUBLIC_JWT_SECRET || "NekoViBE_SecretKey_ForJWT_Authentication_2025_EXE201",
    TOKEN_EXPIRY: process.env.NEXT_PUBLIC_TOKEN_EXPIRY || "2h",
    REFRESH_TOKEN_EXPIRY: process.env.NEXT_PUBLIC_REFRESH_TOKEN_EXPIRY || "7d",

    //Development
    NODE_ENV: process.env.NODE_ENV || "development",
    IS_DEVELOPMENT: process.env.NODE_ENV === "development",
    IS_PRODUCTION: process.env.NODE_ENV === "production",
    DEBUG: process.env.NEXT_PUBLIC_DEBUG === "true",

    // API Endpoints
    ENDPOINTS: {
        AUTH: {
            LOGIN: "/auth/login",
            LOGOUT: "/auth/logout",
            PROFILE: "/auth/profile",
            REFRESH_TOKEN: "/auth/refresh-token",
        },
        PRODUCT: {
            LIST: `${CMS_PREFIX}/products`,
            DETAIL: (id: string) => `${CMS_PREFIX}/products/${id}`,
            CREATE: `${CMS_PREFIX}/products`,   // POST tạo mới
            UPDATE: (id: string) => `${CMS_PREFIX}/products/${id}`, // PUT/PATCH
            DELETE: (id: string) => `${CMS_PREFIX}/products/${id}`, // DELETE
            UPLOAD_IMAGE: `${CMS_PREFIX}/product-image`, // POST upload ảnh
        },
        PRODUCT_IMAGE: {
            CREATE: `/product-image`,
        },
        CATEGORY: {
            SELECT_LIST: `/categories/select-list`,
            LIST: `/categories`,
            DETAIL: (id: string) => `/categories/${id}`,
            CREATE: `/categories`,   // POST tạo mới
            UPDATE: (id: string) => `/categories/${id}`, // PUT/PATCH
            DELETE: (id: string) => `/categories/${id}`, // DELETE
        },
        ANIME: {
            SELECT_LIST: `/anime-series/select-list`
        },
        TAG: {
            SELECT_LIST: `/tags/select-list`,
        },
        EVENT: {
            LIST: `/events`,
            DETAIL: (id: string) => `/events/${id}`,
            CREATE: `/events`,
            UPDATE: (id: string) => `/events/${id}`,
            DELETE: (id: string) => `/events/${id}`,
        },
        BLOGPOST: {
            LIST: `/blog-posts`,
            DETAIL: (id: string) => `/blog-posts/${id}`,
            CREATE: `/blog-posts`,
            UPDATE: (id: string) => `/blog-posts/${id}`,
            DELETE: (id: string) => `/blog-posts/${id}`,
            PUBLISH: (id: string) => `/blog-posts/${id}/publish`,
        },
        // env.ts
        POST_CATEGORY: {
            SELECT_LIST: `/post-categories/select-list`,
            LIST: `/post-categories`,
            DETAIL: (id: string) => `/post-categories/${id}`,
            CREATE: `/post-categories`,
            UPDATE: (id: string) => `/post-categories/${id}`,
            DELETE: (id: string) => `/post-categories/${id}`,
        },
        HOME_IMAGE: {
            LIST: `/home-images`,
            DETAIL: (id: string) => `/home-images/${id}`,
            CREATE: `/home-images`,
            UPDATE: (id: string) => `/home-images/${id}`,
            DELETE: (id: string) => `/home-images/${id}`,
        },
        PRODUCT_INVENTORY: {
            LIST: `/product-inventory`,
            DETAIL: (id: string) => `/product-inventory/${id}`,
            CREATE: `/product-inventory`,
            UPDATE: (id: string) => `/product-inventory/${id}`,
            DELETE: (id: string) => `/product-inventory/${id}`,
        },
    }
} as const;

// Validation function to ensure required env vars are present
export function validateEnv() {
    const requireVars = [
        "NEXT_PUBLIC_BASE_URL",
        "NEXT_PUBLIC_COMMON_PREFIX",
        "NEXT_PUBLIC_CMS_PREFIX",
    ]

    const missing = requireVars.filter(v => !process.env[v]);

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
}
