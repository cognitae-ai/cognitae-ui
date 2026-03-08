import React from 'react';
import { C, TC, sans } from '../../lib/constants';
import { MODES } from '../../lib/engine';

export function PhaseBar({ exchange, mode, isReflection }) {
    const m = MODES[mode];
    if (!m || exchange < 1) return null;

    const all = m.allPhases;
    const activeIdx = isReflection ? all.length - 1 : Math.min(exchange, m.exchanges) - 1;
    const filledCount = isReflection ? all.length : Math.min(exchange, m.exchanges);
    const p = all[activeIdx];
    if (!p) return null;

    const ac = p.triadic === "reflect" ? C.reflect : p.triadic ? TC[p.triadic] : C.accent;

    return (
        <div style={{ padding: "12px 20px", background: C.surface, borderBottom: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", gap: 2, marginBottom: 10 }}>
                {all.map((ph, i) => {
                    const phc = ph.triadic === "reflect" ? C.reflect : ph.triadic ? TC[ph.triadic] : C.accent;
                    return (
                        <div key={i} style={{
                            flex: 1, height: 3, borderRadius: 1,
                            background: i < filledCount ? phc : C.faint,
                            opacity: i < filledCount ? (i === activeIdx ? 1 : 0.4) : 0.15,
                            transition: "all 0.6s ease"
                        }} />
                    );
                })}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: ac, opacity: 0.8 }} />
                    <span style={{ fontFamily: sans, fontSize: 10, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: ac }}>{p.name}</span>
                    <span style={{ fontFamily: sans, fontSize: 10, color: C.dim }}>{p.desc}</span>
                </div>
                <span style={{ fontFamily: sans, fontSize: 10, color: C.dim }}>
                    <span style={{ color: C.muted, marginRight: 6, fontSize: 8, letterSpacing: "0.06em", textTransform: "uppercase" }}>{m.name}</span>
                    {isReflection ? "Yours" : `${exchange}/${m.exchanges}`}
                </span>
            </div>
        </div>
    );
}
