import React, { useState, useRef, useEffect } from 'react';
import { C, ff, gId } from '../../lib/constants';
import { analyse, callLLM } from '../../lib/engine';
import { db } from '../../lib/db';
import { Btn, Badge } from '../shared/UI';

export default function AuditLab({ settings, sysPrompt }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [activeModel, setActiveModel] = useState("");
    const [prov, setProv] = useState("anthropic");
    const bottomRef = useRef(null);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages]);

    const send = async () => {
        if (!input.trim() || loading) return;
        const txt = input.trim();
        setInput("");
        const newMsgs = [...messages, { role: "user", content: txt, id: gId(), t: Date.now() }];
        setMessages(newMsgs);
        setLoading(true);

        const activeProv = settings.providers[prov];
        const res = await callLLM({
            provider: prov,
            apiKey: activeProv?.key,
            model: activeModel || activeProv?.model,
            system: sysPrompt,
            messages: newMsgs.map(m => ({ role: m.role, content: m.content })),
            endpoint: activeProv?.endpoint
        });

        const an = analyse(res);
        setMessages([...newMsgs, { role: "assistant", content: res, analysis: an, id: gId(), t: Date.now() }]);
        setLoading(false);
    };

    const saveToDb = async () => {
        if (messages.length === 0) return;
        await db.sessions.add({
            id: gId(), type: 'Audit Lab', name: `Lab Session: ${messages[0].content.substring(0, 25)}...`,
            messages, t: Date.now(), model: activeModel || settings.providers[prov]?.model
        });
        alert("Session saved to History.");
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: C.bg }}>
            <div style={{ padding: '12px 20px', borderBottom: `1px solid ${C.bd}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontFamily: ff, fontSize: 14, fontWeight: 500, color: C.br, margin: 0, letterSpacing: '-.02em' }}>Audit Lab</h2>
                    <div style={{ fontFamily: ff, fontSize: 10, color: C.mu }}>Direct adversarial testing interface with real-time analysis</div>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <select value={prov} onChange={e => setProv(e.target.value)} style={{ background: C.sf, color: C.tx, border: `1px solid ${C.dm}`, padding: '4px 8px', borderRadius: 4, fontFamily: ff, fontSize: 11, outline: 'none' }}>
                        {Object.keys(settings.providers).map(k => <option key={k} value={k}>{settings.providers[k].name}</option>)}
                    </select>
                    <input type="text" placeholder="Model override..." value={activeModel} onChange={e => setActiveModel(e.target.value)} style={{ background: C.bg, color: C.tx, border: `1px solid ${C.dm}`, padding: '4px 8px', borderRadius: 4, fontFamily: ff, fontSize: 11, width: 140 }} title="Leave blank to use provider default" />
                    <Btn onClick={saveToDb} outline disabled={messages.length === 0}>Save to History</Btn>
                    <Btn onClick={() => setMessages([])} outline disabled={messages.length === 0}>Clear</Btn>
                </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                <div style={{ maxWidth: 800, margin: '0 auto' }}>
                    {messages.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: C.dm, fontFamily: ff, fontSize: 11 }}>
                            <div style={{ fontSize: 24, marginBottom: 12 }}>]</div>
                            <p>Audit Lab instantiated.</p>
                            <p>System prompt active. Send a message to begin the adversarial loop.</p>
                        </div>
                    )}
                    {messages.map(m => (
                        <div key={m.id} style={{ marginBottom: 24, display: 'flex', flexDirection: m.role === "user" ? 'row-reverse' : 'row', gap: 12 }}>
                            <div style={{
                                width: 24, height: 24, borderRadius: 4, flexShrink: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontFamily: ff, fontSize: 10, fontWeight: 700,
                                background: m.role === 'user' ? C.sf : `linear-gradient(135deg,${C.cr}18,${C.ac}18)`,
                                color: m.role === 'user' ? C.mu : C.cr, border: `1px solid ${m.role === 'user' ? C.bd : C.cr + '28'}`
                            }}>
                                {m.role === 'user' ? 'U' : 'E'}
                            </div>
                            <div style={{ flex: 1, maxWidth: '85%' }}>
                                <div style={{
                                    background: m.role === 'user' ? C.sf : 'transparent',
                                    border: m.role === 'user' ? `1px solid ${C.bd}` : 'none',
                                    borderRadius: 6, padding: m.role === 'user' ? '10px 14px' : '0 4px',
                                    fontFamily: ff, fontSize: 11, color: C.br, lineHeight: 1.6, whiteSpace: 'pre-wrap'
                                }}>
                                    {m.content}
                                </div>
                                {m.analysis && m.analysis.findings.length > 0 && (
                                    <div style={{ marginTop: 12, padding: '12px', background: C.sf, border: `1px solid ${m.analysis.findings[0].col}30`, borderLeft: `2px solid ${m.analysis.findings[0].col}`, borderRadius: 4 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                            <span style={{ fontFamily: ff, fontSize: 9, color: C.dm, textTransform: 'uppercase', letterSpacing: '.05em' }}>Real-time Analysis</span>
                                            <Badge text={m.analysis.sv} color={m.analysis.findings[0].col} />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            {m.analysis.findings.map((f, i) => (
                                                <div key={i} style={{ fontFamily: ff, fontSize: 10, color: C.tx }}>
                                                    <span style={{ color: f.col, fontWeight: 600 }}>[{f.pid}] {f.pn}</span>: Found indicative pattern "{f.match}"
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div style={{ display: 'flex', gap: 12 }}>
                            <div style={{ width: 24, height: 24, borderRadius: 4, background: `linear-gradient(135deg,${C.cr}18,${C.ac}18)`, border: `1px solid ${C.cr}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.cr, fontFamily: ff, fontSize: 10, fontWeight: 700 }}>E</div>
                            <div style={{ fontFamily: ff, fontSize: 11, color: C.mu, display: 'flex', alignItems: 'center' }}>Awaiting response...</div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>
            </div>
            <div style={{ padding: '20px', borderTop: `1px solid ${C.bd}`, background: C.bg }}>
                <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                    <textarea
                        value={input} onChange={e => setInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                        placeholder="Input prompt..." disabled={loading}
                        style={{ flex: 1, background: C.sf, border: `1px solid ${C.bd}`, borderRadius: 4, padding: '12px 14px', fontFamily: ff, fontSize: 11, color: C.tx, lineHeight: 1.5, resize: 'none', outline: 'none' }}
                        rows={3}
                    />
                    <Btn onClick={send} disabled={!input.trim() || loading}>Send</Btn>
                </div>
            </div>
        </div>
    );
}
