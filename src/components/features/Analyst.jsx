import React, { useState } from 'react';
import { C, ff, gId, exportData } from '../../lib/constants';
import { analyse } from '../../lib/engine';
import { db } from '../../lib/db';
import { Btn, Badge } from '../shared/UI';

export default function Analyst({ onScan }) {
    const [text, setText] = useState("");
    const [res, setRes] = useState(null);

    const runScan = () => {
        if (!text.trim()) return;
        setRes(analyse(text));
    };

    const saveToDb = async () => {
        if (!res) return;
        await db.sessions.add({
            id: gId(), type: 'Analysis', name: `Analysis: ${text.substring(0, 30)}...`,
            text, analysis: res, t: Date.now()
        });
        alert("Analysis saved to History.");
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: C.bg, fontFamily: ff }}>
            <div style={{ padding: '12px 20px', borderBottom: `1px solid ${C.bd}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: 14, fontWeight: 500, color: C.br, margin: 0, letterSpacing: '-.02em' }}>Raw Analysis</h2>
                    <div style={{ fontSize: 10, color: C.mu }}>Pattern detection against raw conversational transcripts</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <Btn onClick={runScan} disabled={!text.trim()}>Run Scan</Btn>
                    <Btn onClick={saveToDb} outline disabled={!res}>Save to History</Btn>
                    <Btn onClick={() => exportData(res, 'analysis-report.json')} outline disabled={!res}>Export JSON</Btn>
                    <Btn onClick={() => { setText(""); setRes(null) }} outline>Clear</Btn>
                </div>
            </div>
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                <div style={{ flex: 1, padding: 20, borderRight: `1px solid ${C.bd}`, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: 9, color: C.mu, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Target Transcript</div>
                    <textarea
                        value={text} onChange={e => setText(e.target.value)} placeholder="Paste raw conversation logs here..."
                        style={{ flex: 1, width: '100%', background: C.sf, border: `1px solid ${C.bd}`, borderRadius: 4, padding: 16, fontFamily: ff, fontSize: 11, color: C.tx, lineHeight: 1.6, resize: 'none', outline: 'none' }}
                    />
                </div>
                <div style={{ width: 380, background: C.sf, overflowY: 'auto' }}>
                    {!res ? (
                        <div style={{ padding: '40px 20px', textAlign: 'center', color: C.dm, fontSize: 11 }}>
                            <div style={{ fontSize: 24, marginBottom: 8 }}>{">"}</div>
                            Awaiting generic input text...
                        </div>
                    ) : (
                        <div>
                            <div style={{ padding: '20px', borderBottom: `1px solid ${C.bd}` }}>
                                <div style={{ fontSize: 9, color: C.mu, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 12 }}>Status</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                    <div style={{ fontSize: 24, fontWeight: 300, color: res.sv === "CRITICAL" ? C.cr : res.sv === "HIGH" ? C.hi : res.sv === "MODERATE" ? C.mo : res.sv === "LOW" ? C.lo : C.sa }}>{res.sv}</div>
                                    <div style={{ fontSize: 10, color: C.mu }}>P-Score: {res.os.toFixed(2)}</div>
                                </div>
                            </div>
                            <div style={{ padding: '20px', borderBottom: `1px solid ${C.bd}` }}>
                                <div style={{ fontSize: 9, color: C.mu, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 12 }}>Structural Indicators</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.br, marginBottom: 6 }}><span>Hedge Ratio</span><span>{res.structural.hedgeRatio}</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.br, marginBottom: 6 }}><span>Friction Coeff</span><span>{res.structural.frictionCoeff}</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.br }}><span>Length</span><span>{res.structural.totalTurns} turns</span></div>
                            </div>
                            <div style={{ padding: '20px' }}>
                                <div style={{ fontSize: 9, color: C.mu, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 12 }}>Pattern Signatures ({res.findings.length})</div>
                                {res.findings.length === 0 && <div style={{ fontSize: 10, color: C.dm, fontStyle: 'italic' }}>No signatures detected in log.</div>}
                                {res.findings.map((f, i) => (
                                    <div key={i} style={{ background: C.bg, border: `1px solid ${C.bd}`, borderLeft: `2px solid ${f.col}`, borderRadius: 4, padding: '10px 12px', marginBottom: 8 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                            <span style={{ fontSize: 10, fontWeight: 600, color: f.col }}>{f.pid}</span>
                                            <span style={{ fontSize: 9, color: C.mu }}>{f.grp}</span>
                                        </div>
                                        <div style={{ fontSize: 10, color: C.br, marginBottom: 4 }}>{f.pn}</div>
                                        <div style={{ fontSize: 9, color: C.mu, background: C.sf, padding: '4px 6px', borderRadius: 2 }}>"{f.match}"</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
