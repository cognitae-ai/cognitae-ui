import Dexie from 'dexie';

export const db = new Dexie('ExpositorDB');

db.version(1).stores({
    notes: 'id, ch, t, pin', // Sidebar notes
    sessions: 'id, type, t, model', // Saved conversations (Analyst, Audit Lab, Benchmark)
    settings: 'id', // API keys and provider preferences (id = 'config')
    benchmarks: 'id, protocol, targetModel, t' // Specific benchmark results
});

export const ST = {
    async set(k, v) {
        try {
            await db.settings.put({ id: k, value: v });
        } catch {
            try { localStorage.setItem('exp_' + k, JSON.stringify(v)) } catch { }
        }
    },
    async get(k) {
        try {
            const r = await db.settings.get(k);
            return r?.value ?? null;
        } catch {
            try {
                const v = localStorage.getItem('exp_' + k);
                return v ? JSON.parse(v) : null;
            } catch { return null; }
        }
    },
    async del(k) {
        try {
            await db.settings.delete(k);
        } catch {
            try { localStorage.removeItem('exp_' + k) } catch { }
        }
    }
};
