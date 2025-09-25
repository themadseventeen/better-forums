const DB_NAME = "better-forums";

async function openDB(storeName: string): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME); // no version forces “latest”
        req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName);
            }
        };
        req.onsuccess = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains(storeName)) {
                db.close();
                const upgrade = indexedDB.open(DB_NAME, db.version + 1);
                upgrade.onupgradeneeded = () => {
                    upgrade.result.createObjectStore(storeName);
                };
                upgrade.onsuccess = () => resolve(upgrade.result);
                upgrade.onerror = () => reject(upgrade.error);
            } else {
                resolve(db);
            }
        };
        req.onerror = () => reject(req.error);
    });
}

export async function getFromCache<T = unknown>(
    cacheName: string,
    key: string
): Promise<T | undefined> {
    const db = await openDB(cacheName);
    return new Promise((resolve, reject) => {
        const tx = db.transaction(cacheName, "readonly");
        const req = tx.objectStore(cacheName).get(key);
        req.onsuccess = () => resolve(req.result as T | undefined);
        req.onerror = () => reject(req.error);
    });
}

export async function putInCache<T = unknown>(
    cacheName: string,
    key: string,
    value: T
): Promise<void> {
    const db = await openDB(cacheName);
    return new Promise((resolve, reject) => {
        const tx = db.transaction(cacheName, "readwrite");
        tx.objectStore(cacheName).put(value, key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

const inflight = new Map<string, Promise<any>>();

export async function fetchCached<T = unknown>(
    cacheName: string,
    url: string,
    key: string = url
): Promise<T> {
    const inflightKey = `${cacheName}:${key}`;
    if (inflight.has(inflightKey)) return inflight.get(inflightKey)!;

    const task = (async () => {
        const cached = await getFromCache<T>(cacheName, key);
        if (cached !== undefined) return cached;

        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`Request failed: ${resp.status}`);
        const data: T = await resp.json();
        await putInCache(cacheName, key, data);
        return data;
    })();

    inflight.set(inflightKey, task);
    try {
        return await task;
    } finally {
        inflight.delete(inflightKey);
    }
}
