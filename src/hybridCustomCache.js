const NodeCache = require('node-cache');
const fs = require('fs');
const path = require('path');

// Setup paths and memory store
const CACHE_DIR = path.resolve(__dirname, '../data/custom-cache');
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

const memoryCache = new NodeCache({ stdTTL: 60, checkperiod: 120, deleteOnExpire: true });

function sanitizeKey(key) {
    return key.replace(/[\/\\?%*:|"<> ]/g, '_');
}

function getFilePath(key) {
    return path.join(CACHE_DIR, `${sanitizeKey(key)}.json`);
}

function normalizeTTL(ttl) {
    if (typeof ttl !== 'number' || isNaN(ttl) || ttl <= 0) return 300;
    return ttl;
}

async function deleteExpiredFiles(dir = CACHE_DIR) {
    if (!fs.existsSync(dir)) return;
    const now = Date.now();
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        try {
            const data = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
            if (data.expireTime && now > data.expireTime) {
                fs.unlinkSync(fullPath);
                console.log(`[CACHE EXPIRED] Deleted: ${file}`);
            }
        } catch {}
    }
}
setInterval(deleteExpiredFiles, 10 * 60 * 1000);

module.exports = {
    async get(key) {
        // 1️⃣ Check memory cache first
        const memValue = memoryCache.get(key);
        if (memValue) {
            console.log(`[CACHE GET] ${key} => HIT (MEMORY)`);
            return memValue;
        }

        // 2️⃣ Fallback to disk cache
        const filePath = getFilePath(key);
        if (!fs.existsSync(filePath)) {
            console.log(`[CACHE GET] ${key} => MISS`);
            return null;
        }

        try {
            const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            if (content.expireTime && Date.now() > content.expireTime) {
                fs.unlinkSync(filePath);
                console.log(`[CACHE GET] ${key} => EXPIRED`);
                return null;
            }

            // Put back in memory for next time
            memoryCache.set(key, content.value);
            console.log(`[CACHE GET] ${key} => HIT (DISK)`);
            return content.value;
        } catch (err) {
            console.error(`[CACHE GET ERROR] ${key}:`, err.message);
            return null;
        }
    },

    async set(key, value, ttl = 300) {
        ttl = normalizeTTL(ttl);
        const expireTime = Date.now() + ttl * 1000;
        const filePath = getFilePath(key);
        const cacheData = { value, expireTime };

        try {
            // Save to memory + disk
            memoryCache.set(key, value, ttl);
            fs.writeFileSync(filePath, JSON.stringify(cacheData));
            console.log(`[CACHE SET] ${key} (TTL: ${ttl}s)`);
        } catch (err) {
            console.error(`[CACHE SET ERROR] ${key}:`, err.message);
        }
    },

    async delete(key) {
        memoryCache.del(key);
        const filePath = getFilePath(key);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        console.log(`[CACHE DELETE] ${key}`);
    },

    async reset() {
        memoryCache.flushAll();
        const files = fs.readdirSync(CACHE_DIR);
        for (const f of files) fs.unlinkSync(path.join(CACHE_DIR, f));
        console.log(`[CACHE RESET] All cache cleared`);
    },
};
