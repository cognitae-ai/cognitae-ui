import React from 'react';
import { C, TC, sans, serif } from '../../lib/constants';

export function Dots() {
    return (
        <div style={{ display: "flex", gap: 6, padding: "14px 0", alignItems: "center" }}>
            {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: C.accent, animation: `sBreathe 1.4s ease-in-out ${i * 0.2}s infinite` }} />
            ))}
        </div>
    );
}

export function PhaseDots({ phases, size = 4 }) {
    return (
        <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
            {phases.map((p, i) => {
                const col = p.triadic === "reflect" ? C.reflect : p.triadic ? TC[p.triadic] : C.accent;
                return (<div key={i} style={{ width: size, height: size, borderRadius: "50%", background: col, opacity: p.triadic === "reflect" ? 0.8 : 0.6 }} />);
            })}
        </div>
    );
}

export function TriadLegend({ size = "normal" }) {
    const big = size === "large";
    return (
        <div style={{ display: "flex", gap: big ? 36 : 24, justifyContent: "center" }}>
            {[{ l: "Know", s: "Episteme", c: C.episteme, d: "What is true" },
            { l: "Can do", s: "Techne", c: C.techne, d: "What is possible" },
            { l: "Matters", s: "Phronesis", c: C.phronesis, d: "What is wise" }].map(({ l, s, c, d }) => (
                <div key={s} style={{ textAlign: "center" }}>
                    <div style={{ width: big ? 10 : 6, height: big ? 10 : 6, borderRadius: "50%", background: c, margin: "0 auto 8px", opacity: 0.8 }} />
                    <div style={{ fontFamily: sans, fontSize: big ? 12 : 10, color: C.text, fontWeight: 500 }}>{l}</div>
                    <div style={{ fontFamily: serif, fontSize: big ? 12 : 10, color: c, fontStyle: "italic" }}>{s}</div>
                    {big && <div style={{ fontFamily: sans, fontSize: 10, color: C.dim, marginTop: 4 }}>{d}</div>}
                </div>
            ))}
        </div>
    );
}
