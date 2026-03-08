import React from 'react';
import { C, TC, sans, serif } from '../../lib/constants';

export function ArtCard({ artifact, animate, mode, dark }) {
    // Pass the actual mode name dynamically if known from parent
    const mn = mode ? (mode.charAt(0).toUpperCase() + mode.slice(1)) : "";
    const bg = dark ? C.surface : C.paper;
    const txt = dark ? C.text : C.paperText;
    const mut = dark ? C.muted : C.paperMuted;
    const hlTxt = dark ? C.guide : "#1a1512";
    const bdr = dark ? C.border : "rgba(0,0,0,0.05)";
    const deepBg = dark ? "rgba(196,154,108,0.06)" : "rgba(196,154,108,0.08)";

    const secs = [
        { key: "brought", label: "What You Brought" },
        { key: "explored", label: "What We Explored" },
        { key: "emerged", label: "What Emerged", hl: 1 },
        { key: "underneath", label: "What Was Underneath", deep: 1 },
        { key: "words", label: "Your Words Back to You", qt: 1 },
        { key: "question", label: "A Question to Carry", it: 1 }
    ];

    return (
        <div style={{ background: bg, borderRadius: 3, padding: "clamp(32px,6vw,48px) clamp(24px,5vw,40px)", width: "100%", maxWidth: 500, boxShadow: dark ? "none" : "0 12px 48px rgba(0,0,0,0.45)", border: dark ? `1px solid ${C.border}` : "none", animation: animate ? "sFadeIn 0.9s ease 0.15s both" : "none" }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
                <p style={{ fontFamily: sans, fontSize: 8, letterSpacing: "0.22em", color: mut, textTransform: "uppercase", marginBottom: 4 }}>Sanctum{mn ? ` · ${mn}` : ""}</p>
                <p style={{ fontFamily: sans, fontSize: 8, letterSpacing: "0.18em", color: C.accent, textTransform: "uppercase", marginBottom: 10 }}>Clarity Artifact</p>
                <div style={{ width: 28, height: 1, background: C.accent, margin: "0 auto", opacity: 0.6 }} />
            </div>
            {secs.map(({ key, label, hl, qt, it, deep }, idx) => artifact[key] ? (
                <div key={key} style={{ marginBottom: 26, animation: animate ? `sFadeIn 0.6s ease ${0.3 + idx * 0.12}s both` : "none", ...(deep ? { padding: "16px 20px", background: deepBg, borderRadius: 3, borderLeft: `2px solid ${C.accent}` } : {}) }}>
                    <div style={{ fontFamily: sans, fontSize: 8, letterSpacing: "0.14em", color: hl || deep ? C.accent : mut, textTransform: "uppercase", marginBottom: 8, fontWeight: 500 }}>{label}</div>
                    <p style={{ fontFamily: serif, fontSize: "clamp(14px,3.5vw,16px)", color: hl || deep ? hlTxt : txt, lineHeight: 1.85, fontStyle: it || qt ? "italic" : "normal", ...(qt ? { borderLeft: `2px solid ${C.accent}`, paddingLeft: 16, marginLeft: 2, opacity: 0.9 } : {}) }}>{artifact[key]}</p>
                </div>
            ) : null)}
            <div style={{ textAlign: "center", marginTop: 28, paddingTop: 18, borderTop: `1px solid ${bdr}` }}>
                <div style={{ display: "flex", gap: 4, justifyContent: "center", marginBottom: 5 }}>
                    {[C.episteme, C.accent, C.phronesis].map((c, i) => (<div key={i} style={{ width: 3, height: 3, borderRadius: "50%", background: c, opacity: 0.5 }} />))}
                </div>
                <p style={{ fontFamily: serif, fontStyle: "italic", fontSize: 10, color: mut }}>What is true · What is possible · What matters</p>
            </div>
        </div>
    );
}
