import Dexie from 'dexie';

export const dbOptions = {
    sessions: 'id, created, mode, status, updated', // Sessions
    notes: 'id, channel, updated', // Sidebar notes
    settings: 'id', // Local config
};

export const sanctumDb = new Dexie('SanctumDB');
sanctumDb.version(1).stores(dbOptions);

export const ST = {
    async save(k, v) {
        if (k.startsWith('s:')) {
            await sanctumDb.sessions.put({ ...v, updated: Date.now() });
        } else if (k.startsWith('n:')) {
            await sanctumDb.notes.put({ ...v, updated: Date.now() });
        } else {
            await sanctumDb.settings.put({ id: k, value: v });
        }
    },
    async load(k) {
        if (k.startsWith('s:')) {
            const id = k.replace('s:', '');
            return await sanctumDb.sessions.get(id);
        } else if (k.startsWith('n:')) {
            const id = k.replace('n:', '');
            return await sanctumDb.notes.get(id);
        } else {
            const r = await sanctumDb.settings.get(k);
            return r?.value ?? null;
        }
    },
    async del(k) {
        if (k.startsWith('s:')) {
            await sanctumDb.sessions.delete(k.replace('s:', ''));
        } else if (k.startsWith('n:')) {
            await sanctumDb.notes.delete(k.replace('n:', ''));
        } else {
            await sanctumDb.settings.delete(k);
        }
    },
    async saveSession(s) {
        if (!s.id) return;
        await sanctumDb.sessions.put({ ...s, updated: Date.now() });
    },
    async loadSession(id) {
        return await sanctumDb.sessions.get(id);
    },
    async loadIndex() {
        return await sanctumDb.sessions.orderBy('updated').reverse().toArray();
    },
    async deleteSession(id) {
        await sanctumDb.sessions.delete(id);
    },
    async hasOnboarded() {
        const r = await sanctumDb.settings.get('ob');
        return r?.value === true;
    },
    async setOnboarded() {
        await sanctumDb.settings.put({ id: 'ob', value: true });
    },
    async isFirstVisit() {
        const r = await sanctumDb.settings.get('visited');
        return r?.value !== true;
    },
    async setVisited() {
        await sanctumDb.settings.put({ id: 'visited', value: true });
    },

    // ─── Notes ───
    async saveNote(n) {
        if (!n.id) return;
        await sanctumDb.notes.put({ ...n, updated: Date.now() });
    },
    async loadNote(id) {
        return await sanctumDb.notes.get(id);
    },
    async loadNotes() {
        return await sanctumDb.notes.orderBy('updated').reverse().toArray();
    },
    async loadNotesFullByChannel(ch) {
        if (ch) {
            return await sanctumDb.notes.where('channel').equals(ch).reverse().sortBy('updated');
        }
        return await sanctumDb.notes.orderBy('updated').reverse().toArray();
    },
    async deleteNote(id) {
        await sanctumDb.notes.delete(id);
    },

    // ─── Ephemeral/Config ───
    async loadCustomChannels() {
        const r = await sanctumDb.settings.get('cch');
        return r?.value || [];
    },
    async saveCustomChannels(chs) {
        await sanctumDb.settings.put({ id: 'cch', value: chs });
    },
    async loadPinnedArtifacts() {
        const r = await sanctumDb.settings.get('pinart');
        return r?.value || [];
    },
    async savePinnedArtifacts(ids) {
        await sanctumDb.settings.put({ id: 'pinart', value: ids.slice(0, 3) });
    },
    async loadPinnedNotes() {
        const r = await sanctumDb.settings.get('pinnotes');
        return r?.value || [];
    },
    async savePinnedNotes(ids) {
        await sanctumDb.settings.put({ id: 'pinnotes', value: ids.slice(0, 3) });
    },
};

export function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
