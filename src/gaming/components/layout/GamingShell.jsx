import React, { useState, useEffect, useRef } from 'react';
import { askGemini } from '../../../lib/gemini';
import { GAMING_PROMPT } from '../../lib/prompt';
import { GDB, GT, genId } from '../../lib/db';
import { C, FONT, sans, serif } from '../../lib/constants';
import { Link } from 'react-router-dom';

export default function GamingShell() {
    const [apiKey, setApiKey] = useState("");
    const [input, setInput] = useState("");
    const [msgs, setMsgs] = useState([]);
    const [thinking, setThinking] = useState(false);

    useEffect(() => {
        GT.loadSetting("gemini_key").then(k => {
            if (k) setApiKey(k);
            else console.log("No Gemini API key found in GamingDB");
        });
    }, []);

    const saveKey = async (e) => {
        const val = e.target.value;
        setApiKey(val);
        await GT.saveSetting("gemini_key", val);
    };

    const handleSend = async () => {
        if (!input.trim() || thinking) return;
        if (!apiKey) return alert("Please enter a Gemini API Key in the settings.");

        const newM = [...msgs, { role: "user", content: input }];
        setMsgs(newM);
        setInput("");
        setThinking(true);

        try {
            const reply = await askGemini(apiKey, GAMING_PROMPT, msgs, newM[newM.length - 1].content);
            setMsgs([...newM, { role: "assistant", content: reply }]);
        } catch (e) {
            setMsgs([...newM, { role: "assistant", content: "_[SYSTEM ERROR: Unable to reach Gemini. Check API Key.]_" }]);
        } finally {
            setThinking(false);
        }
    };

    const handleKey = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', background: C.bg, color: C.text, fontFamily: sans }}>
            <div style={{ width: 280, borderRight: `1px solid ${C.border}`, padding: 24, display: 'flex', flexDirection: 'column' }}>
                <Link to="/" style={{ color: C.dim, textDecoration: 'none', marginBottom: 24, fontSize: 11, letterSpacing: '0.1em' }}>← BACK TO ROOT</Link>
                <h2 style={{ fontFamily: serif, color: C.accent, fontWeight: 400, fontSize: 24, letterSpacing: '0.05em', marginBottom: 32 }}>Cognitae_Gaming</h2>

                <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', fontSize: 10, color: C.muted, textTransform: 'uppercase', marginBottom: 8 }}>Gemini API Key</label>
                    <input type="password" value={apiKey} onChange={saveKey} style={{ width: '100%', background: C.surface, border: `1px solid ${C.border}`, color: C.text, padding: "8px 12px", borderRadius: 3, fontSize: 12 }} placeholder="AIzaSy..." />
                </div>

                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: C.dim, lineHeight: 1.6 }}>System Instruction loaded: "MDA Framework, Systems & Mechanics..."</div>
                </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 48px' }}>
                <div style={{ flex: 1, overflowY: 'auto', padding: '48px 0' }}>
                    {msgs.length === 0 && (
                        <div style={{ textAlign: 'center', color: C.muted, fontFamily: serif, fontStyle: 'italic', marginTop: '20vh' }}>
                            Awaiting mechanical blueprint...
                        </div>
                    )}
                    {msgs.map((m, i) => (
                        <div key={i} style={{ marginBottom: 24, maxWidth: 640, margin: "0 auto 32px", display: 'flex', gap: 16 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: m.role === 'user' ? C.dim : C.accent, flexShrink: 0, marginTop: 8 }} />
                            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: m.role === 'user' ? C.text : C.guide }}>{m.content}</div>
                        </div>
                    ))}
                    {thinking && (
                        <div style={{ maxWidth: 640, margin: "0 auto", color: C.dim }}>Analyzing ruleset...</div>
                    )}
                </div>

                <div style={{ padding: "24px 0", borderTop: `1px solid ${C.border}`, maxWidth: 640, width: "100%", margin: "0 auto" }}>
                    <textarea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKey}
                        placeholder={"Describe the system..."}
                        style={{ width: '100%', background: C.surface, border: `1px solid ${C.border}`, padding: 16, color: C.text, fontSize: 14, resize: 'none', borderRadius: 3, fontFamily: sans }}
                        rows={3}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                        <button onClick={handleSend} disabled={thinking || !input.trim()} style={{ background: C.accentSoft, border: `1px solid ${C.accent}`, color: C.accent, padding: "8px 24px", borderRadius: 3, cursor: "pointer", opacity: (thinking || !input.trim()) ? 0.5 : 1 }}>Transmit</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
