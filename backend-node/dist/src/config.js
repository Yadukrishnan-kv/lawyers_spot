import 'dotenv/config';
export const config = {
    isProduction: process.env.NODE_ENV === 'production',
    databaseUrl: process.env.DATABASE_URL ?? 'postgresql://lawyerspot:lawyerspot@localhost:5432/lawyerspot',
    port: Number(process.env.PORT ?? 4000),
    adminEmail: process.env.ADMIN_EMAIL ?? 'admin@lawyerspot.com',
    adminPassword: process.env.ADMIN_PASSWORD ?? 'admin123',
    adminSessionSecret: process.env.ADMIN_SESSION_SECRET ?? 'lawyerspot-dev-secret-change-in-production',
    corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean),
    cookieName: process.env.COOKIE_NAME ?? 'lawyerspot_admin_session',
    sessionDays: Number(process.env.SESSION_DAYS ?? 7),
    bcryptRounds: Number(process.env.BCRYPT_ROUNDS ?? 12),
    cmsCacheSeconds: Number(process.env.CMS_CACHE_SECONDS ?? 60),
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID ?? '',
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN ?? '',
    twilioVerifyServiceSid: process.env.TWILIO_VERIFY_SERVICE_SID ?? '',
    otpDefaultCountryCode: process.env.OTP_DEFAULT_COUNTRY_CODE ?? '+91',
    resendApiKey: process.env.RESEND_API_KEY ?? '',
    emailFrom: process.env.EMAIL_FROM ?? '',
    otpResendCooldownSeconds: Number(process.env.OTP_RESEND_COOLDOWN_SECONDS ?? 60),
    passwordResetTtlMinutes: Number(process.env.PASSWORD_RESET_TTL_MINUTES ?? 15),
};
