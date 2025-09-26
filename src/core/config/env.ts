export const env = {
    //API Configuration
    BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5240",
    CMS_PREFIX: process.env.NEXT_PUBLIC_CMS_PREFIX || "/api/cms",
    COMMON_PREFIX: process.env.NEXT_PUBLIC_COMMON_PREFIX || "/api/common",

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
        }
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
