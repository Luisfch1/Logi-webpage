/**
 * LogiNative.js — Logi Workspace (Desktop Suite)
 * IndexedDB & LocalStorage Web Storage Engine for PC Desktop
 */
import { DebugLogger } from '../utils/DebugLogger.js';

const DB_NAME = 'LogiWorkspaceDB';
const STORE_NAME = 'blobs';
let _dbPromise = null;

function getDB() {
    if (_dbPromise) return _dbPromise;
    _dbPromise = new Promise((resolve) => {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
    });
    return _dbPromise;
}

const _webMeta = {
    meta: JSON.parse(localStorage.getItem('logi_ws_meta') || '[]'),
    items_meta: JSON.parse(localStorage.getItem('logi_ws_items_meta') || '[]'),
    config: JSON.parse(localStorage.getItem('logi_ws_config') || '[]'),
    catalog: JSON.parse(localStorage.getItem('logi_ws_catalog') || '{}')
};

function saveWebMeta(store) {
    if (store === 'items_meta' && Array.isArray(_webMeta.items_meta)) {
        _webMeta.items_meta.forEach(item => {
            if (item._tempImageSrc) delete item._tempImageSrc;
            if (item.base64) delete item.base64;
        });
    }
    try {
        localStorage.setItem(`logi_ws_${store}`, JSON.stringify(_webMeta[store]));
    } catch (e) {
        DebugLogger.error('STORAGE', `saveWebMeta Error en ${store}: ${e.message}`, { error: e });
    }
}

export const LogiNative = {
    isNative: () => false,

    init: async () => {
        console.log('[LogiNative] PC Desktop Web Storage Engine Active');
        await getDB();
    },

    dbPut: async (store, item) => {
        if (!item || !store) return false;
        const idx = (_webMeta[store] || []).findIndex(i => i.id === item.id);
        if (idx !== -1) _webMeta[store][idx] = item;
        else (_webMeta[store] = _webMeta[store] || []).unshift(item);
        saveWebMeta(store);
        return true;
    },

    dbGet: async (store, id) => {
        return (_webMeta[store] || []).find(i => i.id === id) || null;
    },

    dbGetAll: async (store) => {
        return _webMeta[store] || [];
    },

    dbDelete: async (store, id) => {
        if (_webMeta[store]) {
            _webMeta[store] = _webMeta[store].filter(i => i.id !== id);
            saveWebMeta(store);
        }
        return true;
    },

    storeBlob: async (filename, base64) => {
        const fullBase64 = base64.includes('data:image') ? base64 : `data:image/jpeg;base64,${base64}`;
        const db = await getDB();
        if (!db) return false;

        return new Promise(r => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);

            const cleanName = String(filename).trim();
            const noExt = cleanName.replace(/\.jpg$/i, '');
            const noCap = cleanName.replace(/^cap_/, '');
            const rawId = noCap.replace(/\.jpg$/i, '');

            store.put(fullBase64, cleanName);
            if (noExt !== cleanName) store.put(fullBase64, noExt);
            if (noCap !== cleanName) store.put(fullBase64, noCap);
            if (rawId !== cleanName) store.put(fullBase64, `${rawId}.jpg`);

            tx.oncomplete = () => r(true);
            tx.onerror = () => r(false);
        });
    },

    getBlobUri: async (filename) => {
        if (!filename) return null;
        const db = await getDB();
        if (!db) return null;

        return new Promise(r => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);

            const cleanName = String(filename).trim();
            const noExt = cleanName.replace(/\.jpg$/i, '');
            const noCap = cleanName.replace(/^cap_/, '');
            const rawId = noCap.replace(/\.jpg$/i, '');

            const candidates = Array.from(new Set([cleanName, noExt, noCap, rawId, `${rawId}.jpg`, `cap_${rawId}.jpg`]));

            let candidateIdx = 0;
            const tryNext = () => {
                if (candidateIdx >= candidates.length) {
                    const allKeysReq = store.getAllKeys();
                    allKeysReq.onsuccess = () => {
                        const keys = allKeysReq.result || [];
                        const matchedKey = keys.find(k => typeof k === 'string' && rawId && k.includes(rawId));
                        if (matchedKey) {
                            const finalReq = store.get(matchedKey);
                            finalReq.onsuccess = () => r(finalReq.result || null);
                            finalReq.onerror = () => r(null);
                        } else {
                            r(null);
                        }
                    };
                    allKeysReq.onerror = () => r(null);
                    return;
                }

                const key = candidates[candidateIdx++];
                const req = store.get(key);
                req.onsuccess = () => {
                    if (req.result) r(req.result);
                    else tryNext();
                };
                req.onerror = () => tryNext();
            };

            tryNext();
        });
    },

    readBlobAsBase64: async (filename) => {
        return LogiNative.getBlobUri(filename);
    },

    dbPutCatalog: async (projectId, items) => {
        _webMeta.catalog[projectId] = items;
        saveWebMeta('catalog');
        return true;
    },

    dbGetCatalog: async (projectId) => {
        return _webMeta.catalog[projectId] || [];
    },

    dbDeleteCatalog: async (projectId) => {
        delete _webMeta.catalog[projectId];
        saveWebMeta('catalog');
        return true;
    },

    saveLogo: async (base64) => {
        const db = await getDB();
        if (!db) return false;
        return new Promise(r => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            tx.objectStore(STORE_NAME).put(base64, 'export_logo');
            tx.oncomplete = () => r(true);
            tx.onerror = () => r(false);
        });
    },

    getLogo: async () => {
        const db = await getDB();
        if (!db) return null;
        return new Promise(r => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const req = tx.objectStore(STORE_NAME).get('export_logo');
            req.onsuccess = () => r(req.result || null);
            req.onerror = () => r(null);
        });
    },

    deleteLogo: async () => {
        const db = await getDB();
        if (!db) return false;
        return new Promise(r => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            tx.objectStore(STORE_NAME).delete('export_logo');
            tx.oncomplete = () => r(true);
            tx.onerror = () => r(false);
        });
    }
};
