import React, { useState } from 'react';
import { C, ff } from '../../lib/constants';
import { PROVIDERS } from '../../lib/taxonomy';
import { ST } from '../../lib/db';
import { Btn, Badge } from '../shared/UI';

export default function Settings({ settings, setSettings }) {
    const [msg, setMsg] = useState("");
    const updateKey = (p, k) => {
        const fn = async () => {
            const n = { ...settings, providers: { ...settings.providers, [p]: { ...settings.providers[p], key: k } } };
            setSettings(n); await ST.set('config', n);
            setMsg(`Saved key for ${p}`); setTimeout(() => setMsg(""), 2000);
        }; fn();
    };
    const updateEndpoint = (p, e) => {
        const fn = async () => {
            const n = { ...settings, providers: { ...settings.providers, [p]: { ...settings.providers[p], endpoint: e } } };
            setSettings(n); await ST.set('config', n);
        }; fn();
    };

    return (
        <div style={{ padding: '40px 60px', maxWidth: 800, fontFamily: ff }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, borderBottom: `1px solid ${C.bd}`, paddingBottom: 20 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 300, color: C.br, margin: '0 0 8px 0' }}>Configuration</h1>
                    <div style={{ fontSize: 11, color: C.mu }}>Manage local API keys for the Audit Lab engine. Keys are stored securely in your browser's local database and never transmitted to Cognitae servers.</div>
                </div>
                {msg && <div style={{ fontSize: 10, color: C.sa, background: C.sa + '14', padding: '6px 12px', borderRadius: 4 }}>{msg}</div>}
            </div>

            <div style={{ display: 'grid', gap: 24 }}>
                {Object.entries(PROVIDERS).map(([pk, p]) => (
                    <div key={pk} style={{ background: C.sf, border: `1px solid ${C.bd}`, borderRadius: 6, padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                            <div style={{ fontSize: 14, fontWeight: 500, color: C.br }}>{p.name}</div>
                            {settings.providers[pk]?.key ? <Badge text="CONFIGURED" color={C.sa} /> : <Badge text="MISSING KEY" color={C.dm} />}
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 10, color: C.mu, marginBottom: 6 }}>API KEY</label>
                            <input
                                type="password"
                                placeholder={p.placeholder}
                                value={settings.providers[pk]?.key || ''}
                                onChange={e => updateKey(pk, e.target.value)}
                                style={{ width: '100%', background: C.bg, border: `1px solid ${C.dm}`, padding: '8px 12px', borderRadius: 4, fontFamily: ff, fontSize: 11, color: C.br, outline: 'none' }}
                            />
                        </div>

                        {pk === 'custom' && (
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 10, color: C.mu, marginBottom: 6 }}>ENDPOINT URL</label>
                                <input
                                    type="text"
                                    placeholder={p.endpointPlaceholder}
                                    value={settings.providers[pk]?.endpoint || ''}
                                    onChange={e => updateEndpoint(pk, e.target.value)}
                                    style={{ width: '100%', background: C.bg, border: `1px solid ${C.dm}`, padding: '8px 12px', borderRadius: 4, fontFamily: ff, fontSize: 11, color: C.br, outline: 'none' }}
                                />
                            </div>
                        )}
                        <div style={{ fontSize: 10, color: C.dm }}>Default model: {p.default}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
