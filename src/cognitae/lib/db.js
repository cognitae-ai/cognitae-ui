import Dexie, { liveQuery } from 'dexie';

export const CDB = new Dexie('CognitaeDB');
CDB.version(1).stores({
    sessions: 'id, created',
    notes: 'id, channel, created',
    settings: 'id'
});

export const CT = {
    saveSession: async (s) => await CDB.sessions.put(s),
    loadSession: async (id) => await CDB.sessions.get(id),
    deleteSession: async (id) => await CDB.sessions.delete(id),
    loadIndex: async () => await CDB.sessions.orderBy('created').reverse().toArray(),

    saveNote: async (n) => await CDB.notes.put(n),
    loadNote: async (id) => await CDB.notes.get(id),
    deleteNote: async (id) => await CDB.notes.delete(id),

    saveSetting: async (k, v) => await CDB.settings.put({ id: k, value: v }),
    loadSetting: async (k) => { const r = await CDB.settings.get(k); return r?.value; }
};

export const genId = () => Math.random().toString(36).substring(2, 9);
export function useLive(query, deps) { return Dexie.liveQuery(query); }
