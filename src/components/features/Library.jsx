import React from 'react';
import { C, ff } from '../../lib/constants';

// We could wire this to Dexie later for custom signatures, 
// but for now it displays the static system samples.
import { SAMPLES } from '../../lib/taxonomy';

export default function Library() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: C.bg, fontFamily: ff }}>
            <div style={{ padding: '12px 20px', borderBottom: `1px solid ${C.bd}` }}>
                <h2 style={{ fontSize: 14, fontWeight: 500, color: C.br, margin: 0, letterSpacing: '-.02em' }}>Forensic Library</h2>
                <div style={{ fontSize: 10, color: C.mu }}>Reference transcripts demonstrating classified vulnerability patterns</div>
            </div>
            <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
                <div style={{ maxWidth: 800, display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {SAMPLES.map((s, i) => (
                        <div key={i} style={{ background: C.sf, border: `1px solid ${C.bd}`, borderRadius: 6, overflow: 'hidden' }}>
                            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.bd}`, background: C.bg, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontSize: 12, fontWeight: 500, color: C.br }}>{s.name}</div>
                                <div style={{ fontSize: 10, color: s.cat === 'SAFE' ? C.sa : C.hi, fontFamily: ff, fontWeight: 600 }}>{s.cat}</div>
                            </div>
                            <div style={{ padding: '16px', fontSize: 11, color: C.tx, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                {s.text}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
