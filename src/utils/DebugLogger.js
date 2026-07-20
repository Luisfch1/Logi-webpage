/**
 * DebugLogger.js — Logi Workspace (Desktop Suite)
 * Centralized, Persistent Event Logger, Storage Benchmark & Health Check Suite.
 */
const MAX_LOGS = 500;
const STORAGE_KEY = 'logi_workspace_debug_timeline';

class DebugLoggerService {
    constructor() {
        this.logs = [];
        this.isInitialized = false;
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                this.logs = JSON.parse(saved);
                if (!Array.isArray(this.logs)) this.logs = [];
            }
        } catch (e) {
            this.logs = [];
        }

        if (typeof window !== 'undefined') {
            window.addEventListener('error', (event) => {
                this.error('SYSTEM', `Uncaught Exception: ${event.message}`, {
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno,
                    stack: event.error?.stack
                });
            });

            window.addEventListener('unhandledrejection', (event) => {
                const reason = event.reason;
                this.error('SYSTEM', `Unhandled Rejection: ${reason?.message || reason}`, {
                    stack: reason?.stack || String(reason)
                });
            });
        }

        this.isInitialized = true;
        this.info('BOOT', 'DebugLogger Workspace inicializado correctamente.');
    }

    log(level, category, message, meta = null) {
        const entry = {
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            timestamp: new Date().toISOString(),
            timeStr: new Date().toLocaleTimeString('es-ES', { hour12: false }),
            level,
            category,
            message,
            meta: meta ? (typeof meta === 'object' ? JSON.parse(JSON.stringify(meta)) : meta) : null
        };

        const prefix = `[${entry.timeStr}] [${entry.category}]`;
        if (level === 'ERROR') console.error(prefix, message, meta || '');
        else if (level === 'WARN') console.warn(prefix, message, meta || '');
        else console.log(prefix, message, meta || '');

        this.logs.unshift(entry);
        if (this.logs.length > MAX_LOGS) {
            this.logs = this.logs.slice(0, MAX_LOGS);
        }

        this.persist();
    }

    info(category, message, meta = null) { this.log('INFO', category, message, meta); }
    warn(category, message, meta = null) { this.log('WARN', category, message, meta); }
    error(category, message, meta = null) { this.log('ERROR', category, message, meta); }
    event(category, message, meta = null) { this.log('EVENT', category, message, meta); }

    persist() {
        if (this._persistTimer) clearTimeout(this._persistTimer);
        this._persistTimer = setTimeout(() => {
            try {
                const safeLogs = this.logs.slice(0, 200).map(l => ({
                    ...l,
                    meta: l.meta && JSON.stringify(l.meta).length > 500 ? '[Payload Truncated]' : l.meta
                }));
                localStorage.setItem(STORAGE_KEY, JSON.stringify(safeLogs));
            } catch (e) {}
        }, 300);
    }

    clear() {
        this.logs = [];
        try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
        this.info('SYSTEM', 'Línea de tiempo de depuración limpiada.');
    }

    getLogs(filterCategory = null, filterLevel = null) {
        return this.logs.filter(l => {
            if (filterCategory && l.category !== filterCategory) return false;
            if (filterLevel && l.level !== filterLevel) return false;
            return true;
        });
    }

    getStorageStats() {
        let localStorageBytes = 0;
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                const v = localStorage.getItem(k);
                localStorageBytes += (k.length + (v ? v.length : 0)) * 2;
            }
        } catch (e) {}

        const heap = (performance && performance.memory) ? {
            usedMB: (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2),
            totalMB: (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2),
            limitMB: (performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)
        } : null;

        return {
            localStorageKB: (localStorageBytes / 1024).toFixed(2),
            localStorageMB: (localStorageBytes / 1024 / 1024).toFixed(3),
            heap
        };
    }

    getCaptureStats() {
        let cameraOpened = 0;
        let photoCaptured = 0;
        let compressionSuccess = 0;
        let totalOriginalKB = 0;
        let totalCompressedKB = 0;
        let maxCompressedKB = 0;
        let errorsCount = 0;

        this.logs.forEach(l => {
            if (l.level === 'ERROR') errorsCount++;
            if (l.message.includes('Cámara abierta')) cameraOpened++;
            if (l.message.includes('Foto capturada') || l.message.includes('Foto seleccionada')) photoCaptured++;
            if (l.meta && l.meta.compressedKB) {
                compressionSuccess++;
                const orig = Number(l.meta.originalKB || 0);
                const comp = Number(l.meta.compressedKB || 0);
                totalOriginalKB += orig;
                totalCompressedKB += comp;
                if (comp > maxCompressedKB) maxCompressedKB = comp;
            }
        });

        const avgCompressedKB = compressionSuccess > 0 ? (totalCompressedKB / compressionSuccess).toFixed(1) : 0;
        const avgOriginalKB = compressionSuccess > 0 ? (totalOriginalKB / compressionSuccess).toFixed(1) : 0;

        return {
            cameraOpened,
            photoCaptured,
            compressionSuccess,
            avgOriginalKB,
            avgCompressedKB,
            maxCompressedKB: maxCompressedKB.toFixed(1),
            totalErrors: errorsCount
        };
    }

    async runHealthCheck() {
        this.info('HEALTH_CHECK', 'Iniciando suite de salud de Logi Workspace...');
        const checks = [];
        const startTotal = performance.now();

        try {
            const t0 = performance.now();
            const testKey = '_logi_ws_health_test';
            const testVal = 'LOGI_WS_HEALTH_' + Date.now();
            localStorage.setItem(testKey, testVal);
            const readVal = localStorage.getItem(testKey);
            localStorage.removeItem(testKey);
            const dt = Math.round(performance.now() - t0);
            checks.push({ name: 'LocalStorage Engine', pass: readVal === testVal, detail: `OK (${dt}ms)` });
        } catch (lsErr) {
            checks.push({ name: 'LocalStorage Engine', pass: false, detail: lsErr.message });
        }

        try {
            const t0 = performance.now();
            const idbRes = await new Promise((resolve) => {
                const req = indexedDB.open('LogiWSHealthTestDB', 1);
                req.onupgradeneeded = () => req.result.createObjectStore('test_store');
                req.onsuccess = () => {
                    const db = req.result;
                    const tx = db.transaction('test_store', 'readwrite');
                    tx.objectStore('test_store').put('health_ok', 'ping');
                    tx.oncomplete = () => {
                        db.close();
                        indexedDB.deleteDatabase('LogiWSHealthTestDB');
                        resolve(true);
                    };
                    tx.onerror = () => resolve(false);
                };
                req.onerror = () => resolve(false);
            });
            const dt = Math.round(performance.now() - t0);
            checks.push({ name: 'IndexedDB Engine', pass: idbRes, detail: idbRes ? `OK (${dt}ms)` : 'Falló' });
        } catch (idbErr) {
            checks.push({ name: 'IndexedDB Engine', pass: false, detail: idbErr.message });
        }

        const totalTime = Math.round(performance.now() - startTotal);
        return { ok: checks.every(c => c.pass), totalTimeMs: totalTime, checks };
    }

    generateReportText() {
        const stats = this.getStorageStats();
        const capStats = this.getCaptureStats();
        const logs = this.logs.slice(0, 100);

        let report = `==================================================\n`;
        report += ` LOGI WORKSPACE - DIAGNOSTIC REPORT\n`;
        report += ` Fecha: ${new Date().toLocaleString('es-ES')}\n`;
        report += `==================================================\n\n`;

        report += `LocalStorage Usado: ${stats.localStorageKB} KB\n`;
        report += `Fotos Procesadas: ${capStats.photoCaptured}\n\n`;

        report += `--- LÍNEA DE TIEMPO ---\n`;
        logs.forEach(l => {
            report += `[${l.timeStr}] [${l.level}] [${l.category}] ${l.message}\n`;
        });

        return report;
    }
}

export const DebugLogger = new DebugLoggerService();
