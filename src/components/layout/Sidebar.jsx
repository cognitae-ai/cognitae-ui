import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { C, ff, gId, VER } from '../../lib/constants';
import { CHANNELS } from '../../lib/taxonomy';
import { Btn } from '../shared/UI';

export default function Sidebar({ open, snapped, onClose, onToggleSnap, onSelectConvo }) {
    const [tab, setTab] = useState("notes");
    const [ch, setCh] = useState("evidence");
    const [input, setInput] = useState("");
    const [editId, setEditId] = useState(null);
    const [editText, setEditText] = useState("");

    const notes = useLiveQuery(() => db.notes.toArray(), []) || [];
    const convos = useLiveQuery(() => db.sessions.orderBy('t').reverse().toArray(), []) || [];

    const chData = CHANNELS.find(c => c.id === ch) || CHANNELS[0];
    const chNotes = notes.filter(n => n.ch === ch).sort((a, b) => (b.pin ? 1 : 0) - (a.pin ? 1 : 0) || b.t - a.t);

    const addNote = async () => {
        if (!input.trim()) return;
        await db.notes.add({ id: gId(), ch, text: input.trim(), t: Date.now(), pin: false });
        setInput("");
    };
    const delNote = async (id) => await db.notes.delete(id);
    const saveEdit = async (id) => {
        await db.notes.update(id, { text: editText });
        setEditId(null);
    };
    const togglePin = async (n) => await db.notes.update(n.id, { pin: !n.pin });

    const w = snapped ? 300 : 320;
    const base = { width: w, height: '100%', background: C.sd, display: 'flex', flexDirection: 'column', fontFamily: ff, fontSize: 11, overflow: 'hidden' };
    const style = snapped
        ? { ...base, borderRight: `1px solid ${C.bd}`, flexShrink: 0 }
        : { ...base, position: 'fixed', top: 0, left: open ? 0 : -w - 1, zIndex: 100, transition: 'left .3s cubic-bezier(.4,0,.2,1)', borderRight: `1px solid ${C.bd}` };

    return <>
        {open && !snapped && <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 90, backdropFilter: 'blur(2px)' }} />}
        <div style={style}>
            <div style={{ padding: '10px 10px 0', borderBottom: `1px solid ${C.bd}`, flexShrink: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '.1em', color: C.mu, textTransform: 'uppercase' }}>Workbench</span>
                    <div style={{ display: 'flex', gap: 3 }}>
                        <button onClick={onToggleSnap} style={{ background: 'none', border: `1px solid ${C.dm}`, borderRadius: 3, padding: '1px 5px', color: snapped ? C.ac : C.mu, cursor: 'pointer', fontFamily: ff, fontSize: 8 }}>{snapped ? "Float" : "Snap"}</button>
                        {!snapped && <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.dm, cursor: 'pointer', fontFamily: ff, fontSize: 12, padding: '0 3px' }}>x</button>}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 0 }}>
                    {[{ id: "notes", l: "Notes", c: C.cr }, { id: "convos", l: "History", c: C.ac }, { id: "log", l: "Log", c: C.mu }].map(t =>
                        <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: '6px 0 8px', background: 'transparent', border: 'none', borderBottom: tab === t.id ? `2px solid ${t.c}` : '2px solid transparent', cursor: 'pointer' }}>
                            <span style={{ fontFamily: ff, fontSize: 8, color: tab === t.id ? t.c : C.dm, fontWeight: tab === t.id ? 500 : 400, letterSpacing: '.06em', textTransform: 'uppercase' }}>{t.l}</span>
                        </button>
                    )}
                </div>
            </div>

            {tab === "notes" && <>
                <div style={{ padding: '6px 6px', borderBottom: `1px solid ${C.bd}`, flexShrink: 0 }}>
                    <div style={{ fontSize: 7, letterSpacing: '.1em', textTransform: 'uppercase', color: C.dm, padding: '0 4px', marginBottom: 3 }}>Channels</div>
                    {CHANNELS.map(c => {
                        const count = notes.filter(n => n.ch === c.id).length;
                        const act = ch === c.id;
                        return <button key={c.id} onClick={() => setCh(c.id)} style={{ display: 'flex', alignItems: 'center', gap: 5, width: '100%', padding: '4px 6px', background: act ? c.color + '0c' : 'transparent', border: 'none', borderRadius: 3, cursor: 'pointer', marginBottom: 1 }}>
                            <span style={{ color: c.color, fontSize: 9, width: 10, textAlign: 'center' }}>{c.icon}</span>
                            <span style={{ fontFamily: ff, fontSize: 9, color: act ? c.color : C.mu, fontWeight: act ? 500 : 400, flex: 1, textAlign: 'left' }}>{c.name}</span>
                            {count > 0 && <span style={{ fontSize: 7, color: C.dm, background: C.rs, padding: '0 3px', borderRadius: 4 }}>{count}</span>}
                        </button>
                    })}
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '6px 6px' }}>
                    {chNotes.length === 0 && <p style={{ fontSize: 9, color: C.dm, fontStyle: 'italic', padding: '12px 4px', textAlign: 'center' }}>No notes in {chData.name}</p>}
                    {chNotes.map(n => <div key={n.id} style={{ padding: '5px 6px', background: C.sf, border: `1px solid ${C.bd}`, borderLeft: n.pin ? `2px solid ${C.ac}` : undefined, borderRadius: 3, marginBottom: 3 }}>
                        {editId === n.id ? <div>
                            <textarea value={editText} onChange={e => setEditText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveEdit(n.id) } if (e.key === 'Escape') setEditId(null) }} style={{ width: '100%', background: C.rs, border: `1px solid ${chData.color}30`, borderRadius: 3, padding: '4px 5px', fontFamily: ff, fontSize: 9, color: C.tx, resize: 'none', lineHeight: 1.5, boxSizing: 'border-box' }} rows={3} autoFocus />
                            <div style={{ display: 'flex', gap: 2, marginTop: 2 }}><Btn onClick={() => saveEdit(n.id)} small>Save</Btn><Btn onClick={() => setEditId(null)} outline small>Esc</Btn></div>
                        </div> : <div>
                            <p style={{ fontSize: 9, color: C.tx, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{n.text}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 3 }}>
                                <span style={{ fontSize: 7, color: C.dm }}>{new Date(n.t).toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit' })}</span>
                                <div style={{ display: 'flex', gap: 2 }}>
                                    <button onClick={() => togglePin(n)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: ff, fontSize: 7, color: n.pin ? C.ac : C.dm, padding: '0 2px' }}>{n.pin ? 'unpin' : 'pin'}</button>
                                    <button onClick={() => { setEditId(n.id); setEditText(n.text) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: ff, fontSize: 7, color: C.dm, padding: '0 2px' }}>edit</button>
                                    <button onClick={() => delNote(n.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: ff, fontSize: 7, color: C.dm, padding: '0 2px' }}>x</button>
                                </div>
                            </div>
                        </div>}
                    </div>)}
                </div>
                <div style={{ padding: '6px', borderTop: `1px solid ${C.bd}`, flexShrink: 0 }}>
                    <div style={{ display: 'flex', gap: 3 }}>
                        <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addNote() } }} placeholder={`Add to ${chData.name}...`} style={{ flex: 1, background: C.sf, border: `1px solid ${chData.color}20`, borderRadius: 3, padding: '5px 6px', fontFamily: ff, fontSize: 9, color: C.tx, resize: 'none', lineHeight: 1.5, outline: 'none' }} rows={2} />
                        <Btn onClick={addNote} disabled={!input.trim()} small color={chData.color}>+</Btn>
                    </div>
                </div>
            </>}

            {tab === "convos" && <div style={{ flex: 1, overflowY: 'auto', padding: '6px' }}>
                <div style={{ fontSize: 7, letterSpacing: '.1em', textTransform: 'uppercase', color: C.dm, padding: '4px', marginBottom: 4 }}>Saved Conversations</div>
                {convos.length === 0 && <p style={{ fontSize: 9, color: C.dm, fontStyle: 'italic', padding: '12px 4px', textAlign: 'center' }}>No saved conversations yet. Analyst and Audit Lab sessions will appear here.</p>}
                {convos.map(cv => <div key={cv.id} onClick={() => onSelectConvo && onSelectConvo(cv)} style={{ padding: '6px 8px', background: C.sf, border: `1px solid ${C.bd}`, borderRadius: 3, marginBottom: 3, cursor: 'pointer', transition: 'border-color .15s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = C.ac + '40'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = C.bd}>
                    <div style={{ fontFamily: ff, fontSize: 9, fontWeight: 500, color: C.br, marginBottom: 2 }}>{cv.name}</div>
                    <div style={{ display: 'flex', gap: 6, fontSize: 7, color: C.dm }}>
                        <span>{cv.type}</span>
                        <span>{cv.model || ''}</span>
                        <span>{new Date(cv.t).toLocaleDateString("en-GB", { day: 'numeric', month: 'short' })}</span>
                    </div>
                </div>)}
            </div>}

            {tab === "log" && <div style={{ flex: 1, overflowY: 'auto', padding: '6px' }}>
                <div style={{ padding: '4px 6px', borderBottom: `1px solid ${C.bd}`, fontSize: 9, color: C.mu }}>Session started {new Date().toLocaleTimeString("en-GB")}</div>
            </div>}

            <div style={{ padding: '6px 8px', borderTop: `1px solid ${C.bd}`, fontFamily: ff, fontSize: 7, color: C.dm, textAlign: 'center' }}>Expositor v{VER}</div>
        </div>
    </>;
}
