import React from 'react';
import { C, TC, sans, serif } from '../../lib/constants';
import { PhaseDots } from '../shared/UI';

export function ModeCard({ m, selected, onSelect, expanded, onExpand, locked }) {
    const sel = selected && !locked && !m.coming;

    return (
        <div style={{ border: `1px solid ${sel ? C.accent : C.border}`, borderRadius: 3, overflow: "hidden", transition: "all 0.2s", background: sel ? C.accentSoft : C.surface, opacity: locked || m.coming ? 0.6 : 1, position: "relative" }}>
            {m.coming && <span style={{ position: "absolute", top: 8, right: 10, fontSize: 7, letterSpacing: "0.08em", textTransform: "uppercase", color: C.accent, zIndex: 1 }}>Coming soon</span>}
            <button onClick={locked || m.coming ? undefined : onSelect} style={{ padding: "clamp(12px,3vw,16px) clamp(16px,3vw,20px)", width: "100%", textAlign: "left", background: "transparent", border: "none", cursor: locked || m.coming ? "default" : "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", color: C.text }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontFamily: sans, fontSize: 12, fontWeight: 500, color: sel ? C.accent : C.text }}>{m.name}</span>
                        {locked && <span style={{ fontSize: 8, letterSpacing: "0.08em", textTransform: "uppercase", color: C.lock, padding: "2px 6px", border: `1px solid ${C.lock}`, borderRadius: 2 }}>{m.tier === "founder" ? "Founder" : "Clarity"}</span>}
                    </div>
                    <div style={{ fontFamily: sans, fontSize: 11, color: C.dim, lineHeight: 1.5 }}>{m.desc}</div>
                </div>
                <div style={{ flexShrink: 0, marginLeft: 16, textAlign: "right" }}>
                    <div style={{ fontFamily: sans, fontSize: 10, color: C.dim }}>{m.time}</div>
                    <div style={{ marginTop: 4 }}><PhaseDots phases={m.allPhases} /></div>
                </div>
            </button>
            <div style={{ padding: "0 clamp(16px,3vw,20px)", overflow: "hidden", maxHeight: expanded ? 320 : 0, transition: "max-height 0.3s ease" }}>
                <div style={{ padding: "14px 0", borderTop: `1px solid ${C.border}` }}>
                    <p style={{ fontFamily: sans, fontSize: 11, color: C.muted, lineHeight: 1.7, marginBottom: 8 }}>{m.longDesc}</p>
                    <p style={{ fontFamily: serif, fontStyle: "italic", fontSize: 12, color: C.accent }}>{m.example}</p>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 10, alignItems: "center" }}>
                        {m.allPhases.map((p, i) => {
                            const col = p.triadic === "reflect" ? C.reflect : p.triadic ? TC[p.triadic] : C.accent;
                            return (<span key={i} style={{ fontSize: 9, color: col, padding: "2px 8px", border: `1px solid ${col}33`, borderRadius: 2 }}>{p.name}</span>);
                        })}
                    </div>
                </div>
            </div>
            <button onClick={onExpand} style={{ width: "100%", padding: "8px", background: "transparent", border: "none", borderTop: `1px solid ${C.border}`, cursor: "pointer", fontFamily: sans, fontSize: 9, color: C.dim, letterSpacing: "0.06em" }}>
                {expanded ? "Less ↑" : "Learn more ↓"}
            </button>
        </div>
    );
}
