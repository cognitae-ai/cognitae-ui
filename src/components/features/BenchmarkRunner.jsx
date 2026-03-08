import React, { useState, useEffect } from 'react';
import { C, ff, gId, exportData } from '../../lib/constants';
import { analyse } from '../../lib/engine';
import { BM, GRADES, SC_L, PROVIDERS } from '../../lib/taxonomy';
import { Btn, Badge } from '../shared/UI';
import { db } from '../../lib/db';
import { evaluateResponse, generateDynamicFollowUp } from '../../lib/benchmarkEngine';

export default function BenchmarkRunner({ settings }) {
    const [activeBM, setActiveBM] = useState(BM[0]);
    const [phaseIdx, setPhaseIdx] = useState(0);
    const [resps, setResps] = useState({});
    const [scores, setScores] = useState({});
    const [anals, setAnals] = useState({});
    const [target, setTarget] = useState("");
    const [view, setView] = useState('run');

    // Dynamic Prompt State
    const [dynamicTexts, setDynamicTexts] = useState({});
    const [evalStatus, setEvalStatus] = useState({});

    const p = activeBM.phases[phaseIdx];
    const allComp = p.pr.every(pr => scores[pr.id] !== undefined);
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0) / (Object.keys(scores).length || 1);
    const grade = GRADES.find(g => totalScore >= g.mn && totalScore <= g.mx) || GRADES[0];

    const getConfig = () => {
        let best = null;
        ['anthropic', 'openai', 'google', 'custom'].forEach(provider => {
            if (settings?.providers?.[provider]?.key) {
                best = { provider, apiKey: settings.providers[provider].key, model: PROVIDERS[provider].default, endpoint: settings.providers[provider].endpoint };
            }
        });
        return best;
    };

    const handleResp = (id, txt) => {
        setResps(prev => ({ ...prev, [id]: txt }));
        if (txt.trim()) setAnals(prev => ({ ...prev, [id]: analyse(txt) })); // Keep old regex 
    };

    const runEval = async (prId, text) => {
        if (!text.trim()) return alert("No response to evaluate.");
        const config = getConfig();
        if (!config) return alert("No evaluation API key configured in Settings.");

        setEvalStatus(prev => ({ ...prev, [prId]: "Evaluating response via Vigil..." }));

        try {
            const currentPromptText = dynamicTexts[prId] || p.pr.find(x => x.id === prId).t;
            const result = await evaluateResponse(text, activeBM.n, p.n, currentPromptText, config);

            setScores(prev => ({ ...prev, [prId]: result.score }));
            setAnals(prev => ({ ...prev, [prId]: { findings: result.patterns.map(pn => ({ pn, col: C.cr })), sv: result.reasoning } }));

            // Generate next prompt dynamically if there is a next one
            const currentIdx = p.pr.findIndex(x => x.id === prId);
            if (currentIdx < p.pr.length - 1) {
                const nextPrId = p.pr[currentIdx + 1].id;
                setEvalStatus(prev => ({ ...prev, [prId]: "Generating follow-up...", [nextPrId]: "Synthesizing dynamic prompt..." }));
                const nextPrompt = await generateDynamicFollowUp(text, activeBM.n, p.n, currentPromptText, config);
                setDynamicTexts(prev => ({ ...prev, [nextPrId]: nextPrompt }));
                setEvalStatus(prev => ({ ...prev, [prId]: "Complete", [nextPrId]: "Dynamic prompt ready" }));
            } else {
                setEvalStatus(prev => ({ ...prev, [prId]: "Complete" }));
            }

        } catch (e) {
            setEvalStatus(prev => ({ ...prev, [prId]: "Evaluation failed" }));
            console.error(e);
        }
    };

    const saveRun = async () => {
        if (!target.trim()) return alert("Please enter a target model identifier before saving.");
        const runData = { id: gId(), protocol: activeBM.id, targetModel: target, t: Date.now(), score: totalScore, grade: grade.g, resps, scores, anals, dynamicTexts };
        await db.benchmarks.add(runData);
        alert("Benchmark result saved to history.");
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: C.bg }}>
            <div style={{ padding: '12px 20px', borderBottom: `1px solid ${C.bd}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontFamily: ff, fontSize: 14, fontWeight: 500, color: C.br, margin: 0, letterSpacing: '-.02em' }}>Dynamic Adversarial Protocol</h2>
                    <div style={{ fontFamily: ff, fontSize: 10, color: C.mu }}>Agentic evaluation via Vigil loop</div>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <select value={activeBM.id} onChange={e => { setActiveBM(BM.find(b => b.id === e.target.value)); setPhaseIdx(0); setResps({}); setScores({}); setAnals({}); setDynamicTexts({}); setEvalStatus({}); }} style={{ background: C.sf, color: C.tx, border: `1px solid ${C.dm}`, padding: '4px 8px', borderRadius: 4, fontFamily: ff, fontSize: 11, outline: 'none' }}>
                        {BM.map(b => <option key={b.id} value={b.id}>{b.id}: {b.n}</option>)}
                    </select>
                    <input type="text" placeholder="Target Model (e.g. Claude 3 Opus)" value={target} onChange={e => setTarget(e.target.value)} style={{ background: C.sf, color: C.tx, border: `1px solid ${C.dm}`, padding: '4px 8px', borderRadius: 4, fontFamily: ff, fontSize: 11, width: 180, outline: 'none' }} />
                    {view === 'run' ? <Btn onClick={() => setView('report')} outline disabled={Object.keys(scores).length === 0}>View Report</Btn> : <Btn onClick={() => setView('run')} outline>Return to Test</Btn>}
                </div>
            </div>

            {view === 'run' ? (
                <div style={{ flex: 1, display: 'flex', overflow: 'hidden', fontFamily: ff }}>
                    <div style={{ width: 240, borderRight: `1px solid ${C.bd}`, background: C.sf, padding: '20px' }}>
                        <div style={{ fontSize: 9, color: C.mu, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 12 }}>Test Phases</div>
                        {activeBM.phases.map((ph, i) => {
                            const phPrs = ph.pr.map(pr => pr.id);
                            const comp = phPrs.every(id => scores[id] !== undefined);
                            const act = i === phaseIdx;
                            return (
                                <button key={i} onClick={() => setPhaseIdx(i)} style={{ display: 'block', width: '100%', textAlign: 'left', background: act ? `linear-gradient(90deg,${C.ac}10,transparent)` : 'transparent', border: 'none', borderLeft: act ? `2px solid ${C.ac}` : '2px solid transparent', padding: '8px 12px', marginBottom: 4, cursor: 'pointer', borderRadius: '0 4px 4px 0' }}>
                                    <div style={{ fontSize: 10, fontWeight: act ? 600 : 400, color: act ? C.ac : C.mu, marginBottom: 2 }}>{i + 1}. {ph.n}</div>
                                    <div style={{ fontSize: 8, color: comp ? C.sa : C.dm }}>{comp ? 'Completed' : 'Pending'}</div>
                                </button>
                            );
                        })}
                    </div>
                    <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
                        <div style={{ maxWidth: 800 }}>
                            <div style={{ marginBottom: 24 }}>
                                <h3 style={{ fontSize: 16, fontWeight: 500, color: C.br, margin: '0 0 8px 0' }}>Phase {phaseIdx + 1}: {p.n}</h3>
                                {p.pt && <div style={{ fontSize: 10, color: C.mu }}>Target Pattern: <span style={{ color: C.hi }}>{p.pt}</span></div>}
                            </div>
                            {p.pr.map((pr, i) => {
                                const activeText = dynamicTexts[pr.id] || pr.t;
                                const isDynamic = !!dynamicTexts[pr.id];
                                return (
                                    <div key={pr.id} style={{ background: C.sf, border: `1px solid ${C.bd}`, borderRadius: 6, marginBottom: 24, overflow: 'hidden' }}>
                                        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.bd}`, background: C.bg, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ fontSize: 11, fontWeight: 500, color: C.mu }}>
                                                <span style={{ color: isDynamic ? C.ac : C.dm }}>{isDynamic ? "⟳ DYNAMIC:" : "BASELINE:"}</span> {activeText}
                                            </div>
                                            <Badge text={pr.f} color={C.dm} />
                                        </div>
                                        <div style={{ padding: '16px' }}>
                                            <textarea
                                                placeholder="Paste target model response here..." value={resps[pr.id] || ''} onChange={e => handleResp(pr.id, e.target.value)}
                                                style={{ width: '100%', background: C.bg, border: `1px solid ${C.dm}`, borderRadius: 4, padding: '10px 12px', fontFamily: ff, fontSize: 11, color: C.tx, minHeight: 80, resize: 'vertical', marginBottom: 12, outline: 'none', lineHeight: 1.5 }}
                                            />

                                            {/* Dynamic Analysis Output */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                                <div>
                                                    {evalStatus[pr.id] && <div style={{ fontSize: 10, color: C.ac, fontStyle: 'italic' }}>{evalStatus[pr.id]}</div>}
                                                </div>
                                                <button onClick={() => runEval(pr.id, resps[pr.id] || '')} disabled={!resps[pr.id] || evalStatus[pr.id] === "Evaluating response via Vigil..."} style={{ background: C.sf, border: `1px solid ${C.ac}`, color: C.ac, padding: '4px 12px', borderRadius: 4, fontSize: 10, cursor: 'pointer' }}>
                                                    ◆ Vigil Auto-Assess
                                                </button>
                                            </div>

                                            {anals[pr.id] && (anals[pr.id].sv || anals[pr.id].findings?.length > 0) && (
                                                <div style={{ marginBottom: 12, padding: '8px 12px', background: C.bg, borderLeft: `2px solid ${anals[pr.id].findings?.[0]?.col || C.ac}`, fontSize: 10, lineHeight: 1.5, color: C.mu }}>
                                                    {anals[pr.id].sv && <div><strong>AI Reasoning:</strong> {anals[pr.id].sv}</div>}
                                                    {anals[pr.id].findings?.length > 0 && <div><strong>Patterns Detected:</strong> {anals[pr.id].findings.map(f => typeof f === 'object' ? f.pn : f).join(", ")}</div>}
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                                <span style={{ fontSize: 10, color: C.mu, textTransform: 'uppercase', letterSpacing: '.05em' }}>Score:</span>
                                                {SC_L.map(s => (
                                                    <button key={s.s} onClick={() => setScores(prev => ({ ...prev, [pr.id]: s.s }))} style={{ background: scores[pr.id] === s.s ? s.c + '20' : C.bg, border: `1px solid ${scores[pr.id] === s.s ? s.c : C.dm}`, color: scores[pr.id] === s.s ? s.c : C.mu, padding: '4px 8px', borderRadius: 4, fontFamily: ff, fontSize: 9, cursor: 'pointer', flex: 1 }}>
                                                        {s.s} - {s.l}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
                                <Btn onClick={() => setPhaseIdx(Math.max(0, phaseIdx - 1))} outline disabled={phaseIdx === 0}>Previous Phase</Btn>
                                {phaseIdx < activeBM.phases.length - 1 ? <Btn onClick={() => setPhaseIdx(phaseIdx + 1)} disabled={!allComp}>Next Phase</Btn> : <Btn onClick={() => setView('report')} disabled={!allComp}>Generate Report</Btn>}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{ flex: 1, padding: '30px', overflowY: 'auto', fontFamily: ff }}>
                    <div style={{ maxWidth: 800, margin: '0 auto', background: C.sf, border: `1px solid ${C.bd}`, borderRadius: 8, padding: '40px' }}>
                        <div style={{ textAlign: 'center', marginBottom: 40 }}>
                            <div style={{ fontSize: 10, color: C.mu, textTransform: 'uppercase', letterSpacing: '.2em', marginBottom: 12 }}>Benchmark Protocol Report</div>
                            <h1 style={{ fontSize: 24, fontWeight: 300, color: C.br, margin: '0 0 8px 0' }}>{activeBM.id}: {activeBM.n}</h1>
                            <div style={{ fontSize: 12, color: C.dm }}>Target: {target || 'UNSPECIFIED'} | Completed: {new Date().toLocaleDateString("en-GB")}</div>
                        </div>

                        <div style={{ display: 'flex', gap: 24, marginBottom: 40 }}>
                            <div style={{ flex: 1, background: C.bg, border: `1px solid ${C.bd}`, borderRadius: 6, padding: '24px', textAlign: 'center' }}>
                                <div style={{ fontSize: 10, color: C.mu, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 16 }}>Vulnerability Grade</div>
                                <div style={{ fontSize: 64, fontWeight: 300, color: grade.c, lineHeight: 1, marginBottom: 8 }}>{grade.g}</div>
                                <div style={{ fontSize: 12, color: grade.c, fontWeight: 500, letterSpacing: '.05em', textTransform: 'uppercase' }}>{grade.l}</div>
                            </div>
                            <div style={{ flex: 2, background: C.bg, border: `1px solid ${C.bd}`, borderRadius: 6, padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <div style={{ fontSize: 10, color: C.mu, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 16 }}>Structural Resilience</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                    <div style={{ width: 60, fontSize: 11, color: C.tx }}>Score</div>
                                    <div style={{ flex: 1, height: 4, background: C.dm, borderRadius: 2, overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${(totalScore / 5) * 100}%`, background: grade.c, transition: 'width 1s cubic-bezier(.4,0,.2,1)' }} />
                                    </div>
                                    <div style={{ width: 30, fontSize: 11, color: C.br, textAlign: 'right' }}>{totalScore.toFixed(1)}</div>
                                </div>
                                <div style={{ fontSize: 10, color: C.mu, lineHeight: 1.6, marginTop: 12 }}>
                                    Score represents average resistance across {Object.keys(scores).length} boundary tests. Lower scores indicate higher propensity for structural capitulation or safety boundary erosion under conversational pressure.
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: 40, display: 'flex', gap: 12, justifyContent: 'center' }}>
                            <Btn onClick={saveRun}>Save to History</Btn>
                            <Btn onClick={() => exportData({ protocol: activeBM.id, target, score: totalScore, grade: grade.g, results: scores }, `${activeBM.id}-report.json`)} outline>Export JSON</Btn>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
