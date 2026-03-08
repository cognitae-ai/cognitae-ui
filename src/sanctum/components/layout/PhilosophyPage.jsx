import React from 'react';
import { C, TC, sans, serif } from '../../lib/constants';
import { TriadLegend } from '../shared/UI';

export function PhilosophyPage({ onBack, onBegin }) {
    const secs = [
        { t: "Episteme", g: "ἐπιστήμη", c: C.episteme, s: C.epistemeSoft, sub: "What is true", body: "Aristotle distinguished episteme as knowledge that is universal, necessary, and demonstrable. In the Sanctum Method, this is the dimension of ground truth. What do you know? What are the facts versus the stories?", practice: "What specifically happened? What are the numbers? What do you know for certain versus what are you inferring?" },
        { t: "Techne", g: "τέχνη", c: C.techne, s: C.techneSoft, sub: "What is possible", body: "Techne was the Greek concept of craft and practical know-how — the intelligence of the maker. In Sanctum, this is capability and action. What can you do? What's the smallest step you could take tomorrow?", practice: "What could you literally do this week? What skills apply here? What's the smallest viable step?" },
        { t: "Phronesis", g: "φρόνησις", c: C.phronesis, s: C.phronesisSoft, sub: "What is wise", body: "Phronesis is Aristotle's highest practical virtue — the capacity to discern the right course by balancing competing goods and acting in alignment with your deepest values. What matters here?", practice: "What would you tell someone you love in this position? What does this mean for who you're becoming? What would you regret?" },
    ];
    return (
        <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: sans }}>
            <div style={{ maxWidth: 600, margin: "0 auto", padding: "clamp(24px,5vw,48px) clamp(16px,4vw,24px)" }}>
                <div style={{ textAlign: "center", marginBottom: 48, animation: "sFadeIn 0.8s ease both" }}>
                    <button className="sb" onClick={onBack} style={{ padding: "6px 16px", marginBottom: 32, fontSize: 9 }}>← Back</button>
                    <h1 style={{ fontFamily: serif, fontWeight: 400, fontSize: "clamp(28px,6vw,36px)", color: C.text, marginBottom: 12 }}>The Triadic Method</h1>
                    <div style={{ width: 36, height: 1, background: C.accent, margin: "0 auto 20px" }} />
                    <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.8, maxWidth: 440, margin: "0 auto" }}>Three forms of knowledge. Twenty-four centuries of wisdom. One structured reflection.</p>
                </div>
                <div style={{ marginBottom: 48, animation: "sFadeIn 0.8s ease 0.2s both" }}><TriadLegend size="large" /></div>
                {secs.map((s, i) => (
                    <div key={s.t} style={{ marginBottom: 32, padding: "clamp(24px,4vw,32px) clamp(20px,4vw,28px)", background: s.s, border: `1px solid ${s.c}22`, borderRadius: 4, borderLeft: `3px solid ${s.c}`, animation: `sFadeIn 0.7s ease ${0.3 + i * 0.15}s both` }}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6 }}>
                            <h2 style={{ fontFamily: serif, fontSize: "clamp(22px,5vw,26px)", fontWeight: 500, color: s.c }}>{s.t}</h2>
                            <span style={{ fontFamily: serif, fontSize: 16, color: C.dim, fontStyle: "italic" }}>{s.g}</span>
                        </div>
                        <p style={{ fontSize: 11, color: s.c, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 16, fontWeight: 500 }}>{s.sub}</p>
                        <p style={{ fontFamily: serif, fontSize: "clamp(15px,3.5vw,17px)", color: C.text, lineHeight: 1.85, marginBottom: 16 }}>{s.body}</p>
                        <div style={{ padding: "14px 18px", background: "rgba(0,0,0,0.15)", borderRadius: 3 }}>
                            <p style={{ fontSize: 10, color: s.c, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6, fontWeight: 500 }}>The Guide asks</p>
                            <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.75 }}>{s.practice}</p>
                        </div>
                    </div>
                ))}
                <div style={{ marginBottom: 32, padding: "clamp(24px,4vw,32px) clamp(20px,4vw,28px)", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 4, animation: "sFadeIn 0.7s ease 0.75s both" }}>
                    <h3 style={{ fontFamily: serif, fontSize: 22, color: C.accent, marginBottom: 16 }}>How it moves</h3>
                    <p style={{ fontFamily: sans, fontSize: 11, color: C.muted, marginBottom: 20, lineHeight: 1.7 }}>A session moves through dimensions based on where you are and where you haven't looked yet:</p>
                    <div style={{ marginBottom: 16, paddingLeft: 14, borderLeft: `2px solid ${C.faint}` }}>
                        <p style={{ fontFamily: sans, fontSize: 11, color: C.text, lineHeight: 1.7, opacity: 0.8 }}>"I've been offered something good but it doesn't feel right. I keep going back and forth."</p>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                            <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.episteme, opacity: 0.7 }} />
                            <span style={{ fontSize: 9, color: C.episteme, letterSpacing: "0.1em", textTransform: "uppercase" }}>Guide · Ground</span>
                        </div>
                        <p style={{ fontFamily: serif, fontSize: 15, color: C.guide, lineHeight: 1.8, paddingLeft: 11, fontStyle: "italic" }}>You said "good" and "doesn't feel right" in the same sentence. How long have you had the offer, and what specifically have you been going back and forth between?</p>
                    </div>
                    <p style={{ fontFamily: sans, fontSize: 11, color: C.dim, lineHeight: 1.7 }}>The Guide heard two contradictory words and pulled toward facts — when, what specifically. The session continues from there, moving through what's possible and what matters based on what the person brings.</p>
                </div>
                <div style={{ marginBottom: 32, padding: "clamp(24px,4vw,32px) clamp(20px,4vw,28px)", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 4, animation: "sFadeIn 0.7s ease 0.9s both" }}>
                    <h3 style={{ fontFamily: serif, fontSize: 22, color: C.accent, marginBottom: 16 }}>The Socratic tradition</h3>
                    <p style={{ fontFamily: serif, fontSize: "clamp(15px,3.5vw,17px)", color: C.text, lineHeight: 1.85 }}>Socrates never gave answers. He asked questions so precisely aimed that people discovered truth within themselves. The Sanctum Guide operates in this tradition — it holds a mirror angled to show the dimension you haven't examined. What emerges belongs entirely to you.</p>
                </div>
                <div style={{ textAlign: "center", paddingBottom: 48 }}><button className="sb" onClick={onBegin} style={{ padding: "13px 36px" }}>Begin a session</button></div>
            </div>
        </div>
    );
}
