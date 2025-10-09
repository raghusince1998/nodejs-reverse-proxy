const cacheManager = require('cache-manager');
const fsStore = require('cache-manager-fs-hash');
const path = require('path');
const fs = require('fs');

const memoryCache = cacheManager.caching({ store: 'memory', max: 100, ttl: 60 });

const diskCachePath = path.resolve(__dirname, '../data/cache');

const diskCache = cacheManager.caching({
    store: fsStore,
    options: {
        path: diskCachePath,
        ttl: 300,
        subdirs: true,
        zip: false
    }
});

const multiCache = cacheManager.multiCaching([memoryCache, diskCache]);

function normalizeTTL(ttl) {
    if (typeof ttl !== 'number' || isNaN(ttl) || ttl <= 0) return 300;
    return ttl;
}

async function deleteExpiredFiles(dir = diskCachePath) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            // Recursively clean subdirectories
            await deleteExpiredFiles(fullPath);
        } else {
            try {
                const content = fs.readFileSync(fullPath, 'utf-8');
                const data = JSON.parse(content);
                const now = Date.now();
                const expireTime = Number(data.expireTime);
                if (expireTime && now > expireTime) {
                    fs.unlinkSync(fullPath);
                    console.log(`[CACHE EXPIRED] Deleted: ${fullPath}`);
                }
            } catch (err) {
                console.error(`[CACHE CLEAN ERROR] ${fullPath}: ${err.message}`);
            }
        }
    }
}

// Schedule periodic cleanup every 10 minutes
setInterval(() => {
    deleteExpiredFiles().catch(err => console.error(`[CACHE CLEAN ERROR]`, err));
}, 10 * 60 * 1000); // 10 minutes

module.exports = {
    async get(key) {
        try {
            const val = await multiCache.get(key);
            console.log(`[CACHE GET] ${key} =>`, val ? 'HIT' : 'MISS');
            return val || null;
        } catch (err) {
            console.error(`[CACHE GET ERROR] ${key}:`, err.message);
            return null;
        }
    },

    async set(key, value, ttl = 300) {
        ttl = normalizeTTL(ttl);
        try {
            const expireTime = Date.now() + ttl * 1000;
            const cacheValue = { ...value, expireTime };
            await multiCache.set(key, cacheValue, { ttl });
            console.log(`[CACHE SET] ${key} (TTL: ${ttl}s)`);
        } catch (err) {
            console.error(`[CACHE SET ERROR] ${key}:`, err.message);
        }
    },

    async delete(key) {
        try {
            await multiCache.del(key);
            console.log(`[CACHE DELETE] ${key}`);
            return true;
        } catch (err) {
            console.error(`[CACHE DELETE ERROR] ${key}:`, err.message);
            return false;
        }
    },

    async reset() {
        try {
            await multiCache.reset();
            console.log(`[CACHE RESET] All cache cleared`);
        } catch (err) {
            console.error(`[CACHE RESET ERROR]:`, err.message);
        }
    }
};
