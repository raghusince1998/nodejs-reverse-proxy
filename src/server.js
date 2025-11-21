require('dotenv').config();
const http = require('http');
const https = require('https');
const httpProxy = require('http-proxy');
const routes = require('./routes');
const fs = require('fs');
const path = require('path');
const { createLogger } = require("./logger");
const diskCache = require('./hybridCustomCache');
const crypto = require('crypto');

const proxy = httpProxy.createProxyServer({});

const HTTP_PORT = process.env.HTTP_PORT || 80;
const HTTPS_PORT = process.env.HTTPS_PORT || 443;

const options = {
    key: fs.readFileSync(path.join(__dirname, '../ssl/proxy.asia.group-key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../ssl/proxy.asia.group.pem'))
};

const loggers = {};
const errorLogger = createLogger(path.join(__dirname, '../logs/error.log'));

function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

function readLogFile(filePath) {
    try {
        if (!fs.existsSync(filePath)) return null;
        return fs.readFileSync(filePath, 'utf-8');
    } catch (err) {
        errorLogger.error(`Failed to read log file: ${filePath} - ${err.message}`);
        return null;
    }
}

function ensureDirExists(filePath) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function generateRequestId() {
    return crypto.randomUUID(); // Node.js >=14.17
}

function hashKey(input) {
    return crypto.createHash('sha256').update(input).digest('hex');
}

function buildCacheKey(req) {
    const hostname = req.headers.host?.split(':')[0] || 'default';
    const url = new URL(req.url, `http://${hostname}`);
    const pathname = url.pathname.replace(/\/+$/, '') || '/';
    const query = url.search;
    const normalizedUrl = `${pathname}${query}`;
    const hashedKey = hashKey(normalizedUrl);
    console.log(`[CACHE KEY] Raw URL: ${req.url} | Normalized: ${normalizedUrl} | Key: ${hostname}::${hashedKey}`);
    return `${hostname}::${req.url}::${hashedKey}`;
}

(async () => {
    async function handleRequest(req, res) {
        const startTime = Date.now();
        const hostHeader = req.headers.host || '';
        const hostname = hostHeader.split(':')[0]; // e.g. api.example.com
        const routeRules = routes[hostname] || routes['default'];

        if (req.url.startsWith('/_logs')) {
            const url = new URL(req.url, `http://${req.headers.host}`);
            const host = url.searchParams.get('host') || 'default';
            const context = url.searchParams.get('context') || '';
            const logFile = path.join(__dirname, `../logs/${host}/${context}/access-${getTodayDate()}.log`);

            const logContent = readLogFile(logFile);
            res.writeHead(logContent ? 200 : 404, { 'Content-Type': 'text/plain' });
            res.end(logContent || 'Log file not found.');
            return;
        }
        if (req.url.startsWith('/purge/')) {
            if (!isAuthorized(req)) {
                res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="Admin"' });
                return res.end('Unauthorized');
            }
            const originalPath = req.url.replace(/^\/purge/, '');
            const fakeReq = { ...req, url: originalPath };
            const cacheKey = buildCacheKey(fakeReq);
            await diskCache.delete(cacheKey);
            res.writeHead(200);
            return res.end(`Purged cache for ${originalPath}`);
        }
        if (req.url === '/purge-all') {
            try {
                await diskCache.reset();
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('✅ All cache cleared!');
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end(`❌ Failed to clear cache: ${err.message}`);
            }
            return;
        }

        const matchedRule = routeRules?.find(rule => req.url.startsWith(rule.location));

        if (!matchedRule) {
            console.warn(`[WARN] No matching route found for ${hostname}${req.url}`);
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 - No matching route');
            return;
        }

        // --- CLIENT MAX BODY SIZE CHECK ---
        const maxBodySize = (matchedRule.maxBodySize || 5) * 1024 * 1024; // default 5MB
        const contentLength = parseInt(req.headers['content-length'] || '0');
        if (contentLength > maxBodySize) {
            res.writeHead(413, { 'Content-Type': 'text/plain' });
            res.end(`Payload Too Large. Max allowed: ${maxBodySize / (1024*1024)} MB`);
            return;
        }

        const { target, request_headers, access_log, cache, sendTimeout, proxyTimeout, connectTimeout } = matchedRule;

        if (target === 'self') {
            res.writeHead(500);
            res.end('Invalid proxy target');
            return;
        }

        const targetUrl = new URL(target);
        const agent = targetUrl.protocol === 'https:'
            ? new https.Agent({ rejectUnauthorized: false })  // Enable SSL verify for production
            : new http.Agent();

        // Set send timeout if defined
        if (sendTimeout) {
            req.setTimeout(sendTimeout, () => {
                res.writeHead(504);
                res.end('Request send timeout');
            });
        }

        const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress;

        // Clone headers so we don't mutate original req.headers
        const headers = { ...req.headers };

        if (request_headers) {
            for (const [key, value] of Object.entries(request_headers)) {
                const requestId = generateRequestId();
                headers[key.toLowerCase()] = ('' + value)
                    .replace('$host', req.headers.host || '')
                    .replace('$remote_addr', clientIp)
                    .replace('$request_id', requestId);
            }
        }

        // Handle GET cache logic
        const cacheKey = buildCacheKey(req); // safe cache key
        const cacheEnabled = cache && req.method === 'GET' && !(request_headers?.['x-cache-bypass']);

        if (cacheEnabled) {
            // if (req.url.includes('/favicon.ico')) return next();
            const cached = await diskCache.get(cacheKey);
            console.log(`[CACHE CHECK for] ${cacheKey} :: ${req.url}=>`, cached ? 'HIT' : 'MISS');
            if (cached) {
                console.log(`[CACHE HIT] ${cacheKey}`);
                const { headers, body } = cached;
                Object.entries(headers).forEach(([k,v]) => res.setHeader(k, v));
                res.statusCode = 200;
                res.end(body);
                return;
            }
        }

        // Proxy options
        const proxyOptions = {
            target,
            changeOrigin: true,
            agent,
            headers,
            timeout: (connectTimeout || 30) * 1000,      // equivalent to proxy_connect_timeout in seconds
            proxyTimeout: (proxyTimeout || 30) * 1000    // equivalent to proxy_read_timeout in seconds
        };

        proxy.web(req, res, proxyOptions, (err) => {
            const errorMsg = `${hostname}${req.url} -> ${target} | ${err.message}`;
            console.error(`[ERROR] ${errorMsg}`);
            errorLogger.error(errorMsg);
            if (!res.headersSent) {
                res.writeHead(502);
            }
            res.end('Bad Gateway');
        });

        res.on('finish', () => {
            const duration = Date.now() - startTime;
            const logMessage = `${clientIp} ${req.method} ${req.url} ${res.statusCode} ${duration}ms -> ${target}`;
            console.log(`[ACCESS] ${hostname}: ${logMessage}`);

            if (access_log) {
                const fullPath = path.isAbsolute(access_log)
                    ? access_log
                    : path.join(__dirname, '..', access_log);
                ensureDirExists(fullPath);

                if (!loggers[fullPath]) {
                    loggers[fullPath] = createLogger(fullPath);
                }
                loggers[fullPath].info(logMessage);
            }
        });
    }

    proxy.on('proxyRes', (proxyRes, req, res) => {
        const hostHeader = req.headers.host || '';
        const hostname = hostHeader.split(':')[0];
        const routeRules = routes[hostname] || routes['default'];
        const matchedRule = routeRules.find(rule => req.url.startsWith(rule.location));
        const cacheEnabled = matchedRule.cache && req.method === 'GET' && !matchedRule.request_headers['x-cache-bypass'];

        if (matchedRule?.response_headers) {
            for (const [key, value] of Object.entries(matchedRule.response_headers)) {
                const evaluatedValue = ('' + value).replace('$upstream_cache_status', cacheEnabled ? 'MISS' : 'HIT')
                    .replace('$host', req.headers.host || '');
                res.setHeader(key.toLowerCase(), evaluatedValue);
            }
        }

        if (cacheEnabled) {
            // Cache response stream but limit size to avoid large memory consumption
            const MAX_CACHE_SIZE = 5 * 1024 * 1024; // 5MB max cache size
            let size = 0;
            let chunks = [];

            proxyRes.on('data', chunk => {
                size += chunk.length;
                if (size <= MAX_CACHE_SIZE) {
                    chunks.push(chunk);
                } else {
                    // Stop caching after limit reached
                    chunks = null;
                }
            });

            proxyRes.on('end', async () => {
                if (chunks) {
                    const body = Buffer.concat(chunks).toString('utf-8');
                    const cacheKey = buildCacheKey(req);
                    const cache_ttl = matchedRule.cache_ttl || 300;
                    try {
                        await diskCache.set(cacheKey, { headers: proxyRes.headers, body, cache_ttl }, cache_ttl);
                        console.log(`[CACHE SET] ${ cacheKey} :: ${req.url}, size: ${body.length}`);
                    } catch (err) {
                        console.error(`[CACHE WRITE ERROR] ${cacheKey}: ${err.message}`);
                    }
                }
            });
        }
    });

    // Global proxy error listener (recommended)
    proxy.on('error', (err, req, res) => {
        const hostname = req.headers.host?.split(':')[0] || 'unknown';
        const errorMsg = `${hostname}${req.url} -> error | ${err.message}`;
        console.error(`[PROXY ERROR] ${errorMsg}`);
        errorLogger.error(errorMsg);
        if (res && !res.headersSent) {
            res.writeHead(502);
            res.end('Bad Gateway');
        }
    });

    const httpServer = http.createServer(handleRequest);
    const httpsServer = https.createServer(options, handleRequest);

    httpServer.listen(HTTP_PORT, () => {
        console.log(`🌀 Reverse proxy listening on port ${HTTP_PORT}`);
    });

    httpsServer.listen(HTTPS_PORT, () => {
        console.log(`🌀 Reverse proxy listening on port ${HTTPS_PORT}`);
    });
})();
