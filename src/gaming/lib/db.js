import Dexie, { liveQuery } from 'dexie';

export const GDB = new Dexie('GamingDB');
GDB.version(1).stores({
    sessions: 'id, created',
    notes: 'id, channel, created',
    settings: 'id'
});

export const GT = {
    saveSession: async (s) => await GDB.sessions.put(s),
    loadSession: async (id) => await GDB.sessions.get(id),
    deleteSession: async (id) => await GDB.sessions.delete(id),
    loadIndex: async () => await GDB.sessions.orderBy('created').reverse().toArray(),

    saveNote: async (n) => await GDB.notes.put(n),
    loadNote: async (id) => await GDB.notes.get(id),
    deleteNote: async (id) => await GDB.notes.delete(id),

    saveSetting: async (k, v) => await GDB.settings.put({ id: k, value: v }),
    loadSetting: async (k) => { const r = await GDB.settings.get(k); return r?.value; }
};

export const genId = () => Math.random().toString(36).substring(2, 9);
export function useLive(query, deps) { return Dexie.liveQuery(query); }
