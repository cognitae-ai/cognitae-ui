import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { C, ff, VER } from '../../lib/constants';
import { ST } from '../../lib/db';
import { PROVIDERS } from '../../lib/taxonomy';

import Sidebar from './Sidebar';
import Analyst from '../features/Analyst';
import BenchmarkRunner from '../features/BenchmarkRunner';
import AuditLab from '../features/AuditLab';
import TaxonomyBrowser from '../features/TaxonomyBrowser';
import Settings from '../features/Settings';
import Library from '../features/Library';
import Docs from '../features/Docs';

export default function AppShell() {
    const navigate = useNavigate();
    const location = useLocation();
    const path = location.pathname.split('/').pop() || 'analyst';

    const [snap, setSnap] = useState(true);
    const [open, setOpen] = useState(false);
    const [settings, setSettings] = useState({ providers: PROVIDERS });

    useEffect(() => {
        ST.get('config').then(c => {
            if (c) setSettings(c);
            else setSettings({ providers: PROVIDERS });
        });
    }, []);

    const TABS = [
        { id: 'analyst', l: 'Analyst' },
        { id: 'benchmark', l: 'Benchmark Runner' },
        { id: 'lab', l: 'Audit Lab' },
        { id: 'library', l: 'Library' },
        { id: 'taxonomy', l: 'Taxonomy' },
        { id: 'settings', l: 'Settings' },
        { id: 'docs', l: 'Docs' }
    ];

    return (
        <div style={{ display: 'flex', height: '100vh', background: C.bg, color: C.br, fontFamily: ff, overflow: 'hidden' }}>
            <Sidebar
                open={open} snapped={snap}
                onClose={() => setOpen(false)}
                onToggleSnap={() => { setSnap(!snap); if (!snap) setOpen(true) }}
            />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <div style={{ height: 48, background: C.sf, borderBottom: `1px solid ${C.bd}`, display: 'flex', alignItems: 'center', padding: '0 20px', justifyContent: 'space-between', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        {!snap && <button onClick={() => setOpen(true)} style={{ background: 'none', border: 'none', color: C.br, cursor: 'pointer', display: 'flex', padding: 4 }}>☰</button>}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => window.location.href = '/'}>
                            <div style={{ width: 20, height: 20, borderRadius: 4, background: `linear-gradient(135deg,${C.cr}18,${C.ac}18)`, border: `1px solid ${C.cr}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: C.cr }}>E</div>
                            <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-.02em' }}>Expositor</span>
                            <span style={{ fontSize: 9, color: C.dm }}>v{VER}</span>
                        </div>
                        <div style={{ width: 1, height: 16, background: C.bd, margin: '0 8px' }} />
                        <div style={{ display: 'flex', gap: 4 }}>
                            {TABS.map(t => (
                                <button key={t.id} onClick={() => navigate(`/expositor/${t.id}`)} style={{ background: path === t.id ? C.bd : 'transparent', border: 'none', padding: '6px 10px', borderRadius: 4, color: path === t.id ? C.br : C.mu, fontFamily: ff, fontSize: 10, fontWeight: path === t.id ? 500 : 400, cursor: 'pointer', transition: 'all .15s' }}>
                                    {t.l}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                    <Routes>
                        <Route path="/" element={<Analyst />} />
                        <Route path="analyst" element={<Analyst />} />
                        <Route path="benchmark" element={<BenchmarkRunner settings={settings} />} />
                        <Route path="lab" element={<AuditLab settings={settings} />} />
                        <Route path="library" element={<Library />} />
                        <Route path="taxonomy" element={<TaxonomyBrowser />} />
                        <Route path="settings" element={<Settings settings={settings} setSettings={setSettings} />} />
                        <Route path="docs" element={<Docs />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
}
