import React from 'react';
import { C, TC, sans, serif } from '../../lib/constants';

export function Msg({ msg, animate }) {
    const g = msg.role === "guide";
    const phc = msg.triadic ? TC[msg.triadic] : null;

    return (
        <div style={{ marginBottom: 24, animation: animate ? "sFadeIn 0.5s ease both" : "none" }}>
            {g ? (
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: phc || C.accent, opacity: 0.7 }} />
                        <span style={{ fontSize: 9, letterSpacing: "0.12em", color: phc || C.dim, textTransform: "uppercase", fontFamily: sans }}>Guide{msg.phase ? ` · ${msg.phase}` : ""}</span>
                    </div>
                    <p style={{ fontFamily: serif, fontSize: "clamp(17px,4vw,19px)", color: C.guide, lineHeight: 1.8, paddingLeft: 13 }}>{msg.content}</p>
                </div>
            ) : (
                <div style={{ paddingLeft: 14, borderLeft: `2px solid ${C.faint}` }}>
                    <p style={{ fontFamily: sans, fontSize: "clamp(12.5px,3.2vw,13.5px)", color: C.text, lineHeight: 1.85, opacity: 0.8 }}>{msg.content}</p>
                </div>
            )}
        </div>
    );
}
