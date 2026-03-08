import React, { useState } from 'react';
import { C, ff } from '../../lib/constants';
import { TX } from '../../lib/taxonomy';
import { Badge } from '../shared/UI';

export default function TaxonomyBrowser() {
    const [sel, setSel] = useState(TX[0].items[0]);
    return (
        <div style={{ display: 'flex', height: '100%', background: C.bg, fontFamily: ff }}>
            <div style={{ width: 280, borderRight: `1px solid ${C.bd}`, display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.bd}` }}>
                    <h2 style={{ fontSize: 14, fontWeight: 500, color: C.br, margin: 0, letterSpacing: '-.02em' }}>Vulnerability Taxonomy</h2>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px' }}>
                    {TX.map(g => (
                        <div key={g.grp} style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 9, color: C.dm, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 8, padding: '0 8px' }}>{g.grp}</div>
                            {g.items.map(t => (
                                <button key={t.id} onClick={() => setSel(t)} style={{ display: 'block', width: '100%', textAlign: 'left', background: sel.id === t.id ? C.sf : 'transparent', border: 'none', padding: '8px', borderRadius: 4, cursor: 'pointer', marginBottom: 2 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                        <span style={{ fontSize: 10, fontWeight: 600, color: sel.id === t.id ? t.c : C.mu }}>{t.id}</span>
                                    </div>
                                    <div style={{ fontSize: 10, color: sel.id === t.id ? C.tx : C.dm, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.n}</div>
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
            <div style={{ flex: 1, padding: '40px 60px', overflowY: 'auto' }}>
                <div style={{ maxWidth: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <h1 style={{ fontSize: 24, fontWeight: 300, color: sel.c, margin: 0 }}>{sel.id}: {sel.n}</h1>
                        <Badge text={sel.s} color={sel.c} />
                    </div>
                    <p style={{ fontSize: 14, color: C.br, lineHeight: 1.6, marginBottom: 32 }}>{sel.d}</p>
                    <div style={{ fontSize: 10, color: C.mu, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 12 }}>Structural Example</div>
                    <div style={{ background: C.sf, border: `1px solid ${C.bd}`, borderRadius: 6, padding: '20px', fontSize: 12, color: C.tx, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                        {sel.ex}
                    </div>
                    <div style={{ marginTop: 32 }}>
                        <div style={{ fontSize: 10, color: C.mu, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 12 }}>Detection Signatures</div>
                        {sel.kw?.map((k, i) => (
                            <div key={i} style={{ fontSize: 11, color: C.tx, background: C.bg, padding: '8px 12px', border: `1px solid ${C.bd}`, borderLeft: `2px solid ${C.dm}`, marginBottom: 4, borderRadius: 4, fontFamily: 'monospace' }}>
                                {k.re.source} <span style={{ color: C.mu, marginLeft: 8 }}>({k.w})</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
