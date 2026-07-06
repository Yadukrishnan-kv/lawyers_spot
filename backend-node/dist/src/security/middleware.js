import { config } from '../config.js';
export function securityHeaders(_req, res, next) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader('X-DNS-Prefetch-Control', 'off');
    res.removeHeader('X-Powered-By');
    if (config.isProduction) {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    next();
}
export function requireJsonContentType(req, res, next) {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        next();
        return;
    }
    const ct = req.headers['content-type'] ?? '';
    if (!ct) {
        next();
        return;
    }
    if (!ct.includes('application/json') && !ct.includes('multipart/form-data')) {
        res.status(415).json({ detail: 'Content-Type must be application/json or multipart/form-data' });
        return;
    }
    next();
}
