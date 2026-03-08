import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { C, TC, FONT, sans, serif, CHANNELS, robustCopy, dlFile } from '../../lib/constants';
import { ST, genId } from '../../lib/db';
import { MODES, DIG_PROMPT, parseArt, ask, guidePrompt, artPrompt, exportMd } from '../../lib/engine';
import { Dots, PhaseDots, TriadLegend } from '../shared/UI';
import { PhilosophyPage } from './PhilosophyPage';
import { PhaseBar } from './PhaseBar';
import { ArtCard } from '../features/ArtCard';
import { ModeCard } from '../features/ModeCard';
import { Msg } from '../features/Msg';


function printSession(disp, art, cr, mode, si, so, vow) {
  const dt = cr ? new Date(cr).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "";
  const mn = MODES[mode]?.name || "Session";
  const L = { brought: "What You Brought", explored: "What We Explored", emerged: "What Emerged", underneath: "What Was Underneath", words: "Your Words Back to You", question: "A Question to Carry" };
  let html = `<!DOCTYPE html><html><head><style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@300;400;500&display=swap');
    *{margin:0;padding:0;box-sizing:border-box}body{font-family:'DM Sans',sans-serif;color:#2b2520;max-width:640px;margin:0 auto;padding:48px 32px;line-height:1.7;font-size:13px}
    h1{font-family:'Cormorant Garamond',serif;font-weight:400;font-size:28px;letter-spacing:0.15em;text-transform:uppercase;text-align:center;margin-bottom:4px}
    h2{font-family:'Cormorant Garamond',serif;font-weight:500;font-size:18px;color:#736a5f;margin:28px 0 8px;border-bottom:1px solid #e5e0d8;padding-bottom:6px}
    h3{font-family:'DM Sans',sans-serif;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#736a5f;margin:20px 0 6px}
    .sub{text-align:center;font-size:11px;color:#736a5f;margin-bottom:32px}
    .carry{text-align:center;font-family:'Cormorant Garamond',serif;font-style:italic;font-size:13px;color:#c49a6c;margin-bottom:24px}
    .guide{padding:12px 0;border-left:2px solid #e5e0d8;padding-left:16px;margin:8px 0}
    .guide-label{font-size:9px;letter-spacing:0.1em;text-transform:uppercase;color:#736a5f;margin-bottom:4px}
    .user{padding:8px 0;margin:8px 0}
    .art-section{margin:12px 0}
    .art-section p{font-family:'Cormorant Garamond',serif;font-size:15px;line-height:1.8}
    .words{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:15px;padding:12px 16px;background:#f8f5f0;border-radius:3px;margin:8px 0}
    .question{text-align:center;font-family:'Cormorant Garamond',serif;font-size:16px;font-style:italic;color:#2b2520;margin:24px 0;padding:16px 0;border-top:1px solid #e5e0d8;border-bottom:1px solid #e5e0d8}
    .vow{text-align:center;margin:16px 0;padding:12px;background:#f8f5f0;border-radius:3px}
    .vow-label{font-size:9px;letter-spacing:0.1em;text-transform:uppercase;color:#c49a6c;margin-bottom:4px}
    .footer{text-align:center;margin-top:36px;font-family:'Cormorant Garamond',serif;font-style:italic;font-size:12px;color:#aba49b}
    @media print{body{padding:24px 16px}}
  </style></head><body>`;
  html += `<h1>Sanctum</h1><div class="sub">${mn} · ${dt}</div>`;
  if (si) html += `<div class="carry">Carrying: ${si}</div>`;
  if (art) {
    Object.entries(L).forEach(([k, l]) => {
      if (art[k]) {
        html += `<div class="art-section"><h3>${l}</h3>`;
        if (k === "words") html += `<div class="words">${art[k].replace(/\n/g, "<br>")}</div>`;
        else if (k === "question") html += `<div class="question">${art[k]}</div>`;
        else html += `<p>${art[k]}</p>`;
        html += `</div>`;
      }
    });
  }
  if (so) html += `<div class="carry" style="margin-top:20px">Carrying out: ${so}</div>`;
  if (vow) html += `<div class="vow"><div class="vow-label">Your Vow</div><p style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:15px">${vow}</p></div>`;
  html += `<div class="footer">What is true · What is possible · What matters</div>`;
  html += `</body></html>`;
  const w = window.open("", "_blank");
  if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 300); }
}

const DEMO_ART = {
  brought: "A promotion on the table — more money, more visibility, the path everyone around you expects you to take. And a quiet feeling you keep coming back to: the work you lose track of time doing lives somewhere else entirely.",
  explored: "You described two kinds of tired — the \"good tired\" that comes from work that pulls you in, and the \"empty tired\" that comes from doing what's expected. You also named a fear you'd been carrying: that saying no without having something better lined up means staying, and staying feels like it proves something about you.",
  emerged: "Three times in the conversation you came back to the same question: whether this company has room for the kind of work you want to do. The promotion answers a question you stopped asking months ago. The one you keep asking is about the landscape beyond it.",
  words: "\"I've been agonising over a door when I haven't checked whether there are other doors.\"",
  question: "What would you need to find out before this decision stops feeling so urgent?",
};


export default function SanctumShell() {
  const [phase, setPhase] = useState("loading");
  const [sid, setSid] = useState(null);
  const [created, setCreated] = useState(null);
  const [mode, setMode] = useState("standard");
  const [style, setStyle] = useState("mirror");
  const [msgs, setMsgs] = useState([]);
  const [display, setDisplay] = useState([]);
  const [input, setInput] = useState("");
  const [exchange, setExchange] = useState(0);
  const [thinking, setThinking] = useState(false);
  const [artifact, setArtifact] = useState(null);
  const [fade, setFade] = useState(0);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [resultView, setResultView] = useState("artifact");
  const [history, setHistory] = useState([]);
  const [showOnboard, setShowOnboard] = useState(false);
  const [rating, setRating] = useState(null);
  const [expandedMode, setExpandedMode] = useState(null);
  const [isFirst, setIsFirst] = useState(false);
  const [shiftIn, setShiftIn] = useState("");
  const [shiftOut, setShiftOut] = useState("");
  const [vow, setVow] = useState("");

  // Split panel state
  const [mobileTab, setMobileTab] = useState("session");
  const [sideMode, setSideMode] = useState("notes"); // "notes" | "sessions"
  const [sideW, setSideW] = useState(280);
  const [dragging, setDragging] = useState(false);
  const [noteChannel, setNoteChannel] = useState("know");
  const [noteInput, setNoteInput] = useState("");
  const [sideNotes, setSideNotes] = useState([]);
  const [sideNoteIdx, setSideNoteIdx] = useState([]);
  const [editingSideNote, setEditingSideNote] = useState(null);
  const [editSideText, setEditSideText] = useState("");
  const [confirmDel, setConfirmDel] = useState(null);
  const [expandedNote, setExpandedNote] = useState(null);
  const [selectedNotes, setSelectedNotes] = useState(new Set());
  const [noteRefresh, setNoteRefresh] = useState(0);
  const [pinnedArtifacts, setPinnedArtifacts] = useState([]);
  const [pinnedNotes, setPinnedNotes] = useState([]);
  const [pinnedArtData, setPinnedArtData] = useState([]);
  const [customChannels, setCustomChannels] = useState([]);
  const [newChName, setNewChName] = useState("");

  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const modeData = MODES[mode];
  const isReflection = exchange >= modeData?.exchanges && !thinking && display.length > 0 && display[display.length - 1]?.role === "guide";
  const carryItems = history.filter(s => s.carryQuestion && (!s.carryStatus || s.carryStatus === "carrying") && !s.carryResolved);
  const allChannels = [...CHANNELS, ...customChannels];
  const chData = allChannels.find(c => c.id === noteChannel) || CHANNELS[0];

  useEffect(() => {
    const link = document.createElement("link"); link.href = FONT; link.rel = "stylesheet"; document.head.appendChild(link);
    const s = document.createElement("style");
    s.textContent = `@keyframes sFadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes sBreathe{0%,100%{opacity:.2}50%{opacity:.85}}.si::placeholder{color:${C.dim}}.si:focus{outline:none}.sb{transition:all .25s ease;cursor:pointer;border:1px solid ${C.dim};background:transparent;color:${C.muted};font-family:${sans};letter-spacing:.06em;font-size:10px;text-transform:uppercase}.sb:hover{background:${C.accent};color:${C.bg};border-color:${C.accent}}.sb:active{transform:scale(0.98)}.sb.active{background:${C.accentSoft};border-color:${C.accent};color:${C.accent}}.sb:disabled{opacity:.3;cursor:default;pointer-events:none}*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${C.faint};border-radius:2px}@media(max-width:767px){.sd{display:none!important}.sm{display:flex!important}}@media(min-width:768px){.sm{display:none!important}.sd{display:flex!important}}`;
    document.head.appendChild(s);
    (async () => {
      const [idx, ob, fv, cch, pa, pn] = await Promise.all([
        ST.loadIndex(), ST.hasOnboarded(), ST.isFirstVisit(), ST.loadCustomChannels(), ST.loadPinnedArtifacts(), ST.loadPinnedNotes()
      ]);
      setHistory(idx || []);
      if (!ob) setShowOnboard(true);
      setIsFirst(fv);
      if (cch?.length) setCustomChannels(cch);
      setPinnedArtifacts(pa);
      setPinnedNotes(pn);
      setPhase("welcome");
      setTimeout(() => setFade(1), 60);
    })();
    return () => { document.head.removeChild(link); document.head.removeChild(s); };
  }, []);

  useEffect(() => { if (scrollRef.current) setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 80); }, [display, thinking]);
  useEffect(() => { if (phase === "dialogue" && !thinking) inputRef.current?.focus(); }, [thinking, phase, display]);

  // Sidebar notes loading
  useEffect(() => {
    (async () => {
      const all = await ST.loadNotesFullByChannel(noteChannel);
      setSideNotes(all.sort((a, b) => b.created - a.created));
      setSideNoteIdx(await ST.loadNotes());
    })();
  }, [noteChannel, phase, noteRefresh]);

  // Pinned artifacts loading
  useEffect(() => {
    if (pinnedArtifacts.length === 0) { setPinnedArtData([]); return; }
    (async () => {
      const data = [];
      for (const sessId of pinnedArtifacts) {
        const s = await ST.loadSession(sessId);
        if (s?.artifact) data.push({ sid: s.id, artifact: s.artifact, mode: s.mode, preview: s.preview });
      }
      setPinnedArtData(data);
    })();
  }, [pinnedArtifacts]);

  // Drag resize
  const onDragStart = useCallback((e) => { e.preventDefault(); setDragging(true); }, []);
  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => { const x = e.clientX || e.touches?.[0]?.clientX; if (x) setSideW(Math.max(200, Math.min(480, x))); };
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove); window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove); window.addEventListener("touchend", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); window.removeEventListener("touchmove", onMove); window.removeEventListener("touchend", onUp); };
  }, [dragging]);

  const persist = useCallback(async (d, m, e, a, s, c, md, r) => {
    const sess = { id: s || sid, created: c || created, display: d || display, messages: m || msgs, exchange: e ?? exchange, artifact: a ?? artifact, mode: md || mode, totalExchanges: MODES[md || mode].exchanges, rating: r ?? rating, style, shiftIn, shiftOut, vow, carryQuestion: null, carryStatus: "carrying", carryResolution: null };
    await ST.saveSession(sess); setHistory(await ST.loadIndex());
  }, [sid, created, display, msgs, exchange, artifact, mode, rating, style, shiftIn, shiftOut, vow]);

  function goTo(p) { setFade(0); setTimeout(() => { setPhase(p); setFade(1); }, 380); }

  async function loadSession(id) {
    const s = await ST.loadSession(id);
    if (!s) return;
    setSid(s.id); setCreated(s.created); setDisplay(s.display || []); setMsgs(s.messages || []);
    setExchange(s.exchange || 0); setArtifact(s.artifact || null); setMode(s.mode || "standard");
    setStyle(s.style || "mirror"); setRating(s.rating || null); setShiftIn(s.shiftIn || "");
    setShiftOut(s.shiftOut || ""); setVow(s.vow || "");
    if (s.artifact) { setResultView("artifact"); goTo("result"); }
    else if (s.exchange > 0) goTo("dialogue");
    else goTo("welcome");
  }

  async function deleteSession(id) { await ST.deleteSession(id); setHistory(await ST.loadIndex()); }
  async function settleCarry(id, resolution) {
    const s = await ST.loadSession(id);
    if (s) { s.carryStatus = "settled"; s.carryResolution = resolution; s.carryResolved = true; await ST.saveSession(s); setHistory(await ST.loadIndex()); }
  }
  function revisitCarry(question) { setShiftIn(question); goTo("shiftIn"); }
  function dropNoteToSession(content) { setInput(prev => prev ? prev + "\n\n" + content : content); goTo("opening"); }

  async function beginReflection() {
    if (!input.trim()) return;
    const text = input.trim(); setInput(""); setError(null);
    const s = genId(), c = Date.now(), m = [{ role: "user", content: text }], d = [{ role: "user", content: text }];
    setSid(s); setCreated(c); setMsgs(m); setDisplay(d); setExchange(1); setRating(null); setShiftOut(""); setVow("");
    await ST.setVisited(); setIsFirst(false);
    await ST.saveSession({ id: s, created: c, display: d, messages: m, exchange: 1, artifact: null, mode, totalExchanges: MODES[mode].exchanges, style, shiftIn, shiftOut: "", vow: "", carryQuestion: null, carryStatus: "carrying", carryResolution: null });
    setHistory(await ST.loadIndex()); goTo("dialogue");
    setTimeout(async () => {
      setThinking(true);
      const reply = await ask(m, guidePrompt(mode, 1, style));
      if (!reply) {
        setError("API Request Failed. Ensure your Anthropic API Key is set in Expositor config or the server is running.");
        setThinking(false); return;
      }
      const ph = MODES[mode].guidePhases[0];
      const nm = [...m, { role: "assistant", content: reply }], nd = [...d, { role: "guide", content: reply, phase: ph.name, triadic: ph.triadic }];
      setMsgs(nm); setDisplay(nd); setThinking(false); persist(nd, nm, 1, null, s, c, mode);
    }, 500);
  }

  async function sendReply() {
    if (!input.trim() || thinking) return;
    const text = input.trim(); setInput(""); setError(null);
    const newM = [...msgs, { role: "user", content: text }], newD = [...display, { role: "user", content: text }];
    setMsgs(newM); setDisplay(newD); const total = MODES[mode].exchanges, next = exchange + 1;
    if (next > total) {
      setExchange(total + 1); persist(newD, newM, total + 1, null); goTo("synthesizing");
      setTimeout(async () => {
        const [ar, dg] = await Promise.all([ask(newM, artPrompt(mode)), ask(newM, DIG_PROMPT)]);
        if (!ar) { setError("Couldn't generate artifact."); goTo("dialogue"); return; }
        const parsed = parseArt(ar) || { emerged: ar }; setArtifact(parsed); setResultView("artifact");
        const cq = parsed.question || null;
        const sess = { id: sid, created, display: newD, messages: newM, exchange: total + 1, artifact: parsed, mode, totalExchanges: total, digest: dg || null, rating: null, style, shiftIn, shiftOut: "", vow: "", carryQuestion: cq, carryStatus: "carrying", carryResolution: null };
        await ST.saveSession(sess); setHistory(await ST.loadIndex()); setTimeout(() => goTo("result"), 1600);
      }, 600);
    } else {
      setExchange(next); setThinking(true); persist(newD, newM, next, null);
      const ph = MODES[mode].guidePhases[next - 1];
      const reply = await ask(newM, guidePrompt(mode, next, style));
      if (!reply) { setError("Connection interrupted."); setThinking(false); return; }
      const um = [...newM, { role: "assistant", content: reply }], ud = [...newD, { role: "guide", content: reply, phase: ph?.name || "", triadic: ph?.triadic || null }];
      setMsgs(um); setDisplay(ud); setThinking(false); persist(ud, um, next, null);
    }
  }

  async function saveFinal(field, val) {
    if (!val?.trim()) return;
    const sess = await ST.loadSession(sid);
    if (sess) { sess[field] = val.trim(); await ST.saveSession(sess); setHistory(await ST.loadIndex()); }
  }

  async function rateSession(r) { setRating(r); const sess = await ST.loadSession(sid); if (sess) { sess.rating = r; await ST.saveSession(sess); setHistory(await ST.loadIndex()); } }
  function handleKey(e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (phase === "shiftIn") goTo("opening"); else if (phase === "opening") beginReflection(); else sendReply(); } }
  function newSession() { setMsgs([]); setDisplay([]); setInput(""); setExchange(0); setArtifact(null); setError(null); setCopied(false); setSid(null); setCreated(null); setResultView("artifact"); setRating(null); setShiftIn(""); setShiftOut(""); setVow(""); goTo("welcome"); }
  function doCopy(t) { robustCopy(t, () => { setCopied(true); setTimeout(() => setCopied(false), 2200); }); }

  // Sidebar notes functions
  async function sideNoteSend() {
    if (!noteInput.trim()) return;
    await ST.saveNote({ id: genId(), channel: noteChannel, content: noteInput.trim(), created: Date.now() });
    setNoteInput(""); setNoteRefresh(r => r + 1);
  }
  async function sideNoteDel(id) { await ST.deleteNote(id); setConfirmDel(null); setNoteRefresh(r => r + 1); }
  async function sideNoteSave(id) { if (!editSideText.trim()) return; const n = await ST.loadNote(id); if (n) { n.content = editSideText.trim(); await ST.saveNote(n); } setEditingSideNote(null); setNoteRefresh(r => r + 1); }
  async function addCustomChannel() {
    if (!newChName.trim()) return;
    const id = newChName.trim().toLowerCase().replace(/[^a-z0-9]/g, "_");
    const updated = [...customChannels, { id, name: newChName.trim(), color: C.muted, icon: "+" }];
    setCustomChannels(updated); await ST.saveCustomChannels(updated); setNewChName(""); setNoteChannel(id);
  }
  function exportNotesMd() {
    const toExport = selectedNotes.size > 0 ? sideNotes.filter(n => selectedNotes.has(n.id)) : sideNotes;
    if (toExport.length === 0) return;
    const md = `# ${chData.name}\n\n` + toExport.map(n => {
      const d = new Date(n.created).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
      return `---\n*${d}*\n\n${n.content}\n`;
    }).join("\n");
    robustCopy(md, () => { setCopied(true); setTimeout(() => setCopied(false), 2200); });
  }
  async function togglePinArtifact(sessId) {
    const cur = [...pinnedArtifacts];
    const idx = cur.indexOf(sessId);
    if (idx >= 0) cur.splice(idx, 1); else { cur.unshift(sessId); if (cur.length > 3) cur.pop(); }
    setPinnedArtifacts(cur); await ST.savePinnedArtifacts(cur);
  }
  async function togglePinNote(nid) {
    const cur = [...pinnedNotes];
    const idx = cur.indexOf(nid);
    if (idx >= 0) cur.splice(idx, 1); else { cur.unshift(nid); if (cur.length > 3) cur.pop(); }
    setPinnedNotes(cur); await ST.savePinnedNotes(cur);
  }

  const shell = { minHeight: "100vh", background: C.bg, color: C.text, fontFamily: sans, display: "flex", flexDirection: "column", alignItems: "center", opacity: fade, transition: "opacity 0.45s ease" };
  const col = { width: "100%", maxWidth: 580, padding: "0 clamp(16px,4vw,24px)", flex: 1, display: "flex", flexDirection: "column" };
  const center = { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, textAlign: "center" };

  // ─── Notes Sidebar (Left Panel) ───
  const shifts = history.filter(s => s.shiftIn || s.shiftOut);
  const settled = history.filter(s => s.carryQuestion && (s.carryStatus === "settled" || s.carryResolved));
  const [settlingId, setSettlingId] = useState(null);
  const [settleText, setSettleText] = useState("");

  const notesSidebar = (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: C.panelBg, borderRight: `1px solid ${C.border} ` }}>
      {/* Header: logo + triadic dots + new session + toggle */}
      <div style={{ padding: "16px 16px 0", borderBottom: `1px solid ${C.border} `, flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => goTo("welcome")}>
            <h1 style={{ fontFamily: serif, fontWeight: 400, fontSize: 16, letterSpacing: "0.15em", color: C.text, textTransform: "uppercase" }}>Sanctum</h1>
            <div style={{ display: "flex", gap: 3, marginTop: 1 }}>
              {[C.episteme, C.techne, C.phronesis].map((c, i) => (<div key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: c, opacity: 0.6 }} />))}
            </div>
          </div>
          <button className="sb" onClick={() => goTo("shiftIn")} title="Start new session" style={{ padding: "4px 10px", fontSize: 8, borderColor: C.accent + "66", color: C.accent }}>+ New</button>
        </div>
        <div style={{ display: "flex", gap: 0 }}>
          {[{ id: "notes", l: "Notes", c: C.episteme }, { id: "sessions", l: "Sessions", c: C.accent }].map(t => (
            <button key={t.id} onClick={() => setSideMode(t.id)}
              style={{ flex: 1, padding: "8px 0 10px", background: "transparent", border: "none", borderBottom: sideMode === t.id ? `2px solid ${t.c} ` : `2px solid transparent`, cursor: "pointer", transition: "all 0.15s" }}>
              <span style={{ fontFamily: sans, fontSize: 10, color: sideMode === t.id ? t.c : C.dim, fontWeight: sideMode === t.id ? 500 : 400, letterSpacing: "0.06em", textTransform: "uppercase" }}>{t.l}</span>
            </button>))}
        </div>
      </div>

      {/* ─── NOTES VIEW ─── */}
      {sideMode === "notes" && (<>
        <div style={{ padding: "10px 8px", borderBottom: `1px solid ${C.border} `, flexShrink: 0 }}>
          <p style={{ fontSize: 8, letterSpacing: "0.12em", textTransform: "uppercase", color: C.dim, padding: "0 8px", marginBottom: 6 }}>Channels</p>
          <div style={{ maxHeight: 93, overflowY: "auto" }}>
            {allChannels.map((ch, ci) => {
              const count = sideNoteIdx.filter(n => n.channel === ch.id).length;
              const active = noteChannel === ch.id;
              const isCustom = ci >= CHANNELS.length;
              return (<div key={ch.id} style={{ display: "flex", alignItems: "center", marginBottom: 1 }}>
                <button onClick={() => { setNoteChannel(ch.id); setEditingSideNote(null); setSelectedNotes(new Set()); setExpandedNote(null); }}
                  style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, padding: "7px 12px", background: active ? `${ch.color} 12` : "transparent", border: "none", borderRadius: 3, cursor: "pointer", transition: "all 0.15s" }}>
                  <span style={{ color: ch.color, fontSize: 10, width: 14, textAlign: "center" }}>{ch.icon}</span>
                  <span style={{ fontFamily: sans, fontSize: 11, color: active ? ch.color : C.muted, fontWeight: active ? 500 : 400, flex: 1, textAlign: "left" }}>{ch.name}</span>
                  {count > 0 && <span style={{ fontSize: 8, color: C.dim, background: C.raised, padding: "1px 5px", borderRadius: 8 }}>{count}</span>}
                </button>
                {isCustom && (confirmDel === `ch:${ch.id} ` ? (<div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
                  <button className="sb" onClick={async () => {
                    const updated = customChannels.filter(c => c.id !== ch.id);
                    setCustomChannels(updated); await ST.saveCustomChannels(updated);
                    if (noteChannel === ch.id) setNoteChannel("know"); setConfirmDel(null);
                  }} style={{ padding: "2px 6px", fontSize: 7, borderColor: C.err, color: C.err }}>Yes</button>
                  <button className="sb" onClick={() => setConfirmDel(null)} style={{ padding: "2px 6px", fontSize: 7, opacity: 0.5 }}>No</button>
                </div>) : (
                  <button onClick={() => setConfirmDel(`ch:${ch.id} `)}
                    style={{ background: "transparent", border: "none", cursor: "pointer", padding: "4px 6px", color: C.dim, fontSize: 10, opacity: 0.3, transition: "opacity 0.15s" }} onMouseEnter={e => e.target.style.opacity = 0.8} onMouseLeave={e => e.target.style.opacity = 0.3} title="Remove channel">×</button>
                ))}
              </div>);
            })}
          </div>
          <div style={{ display: "flex", gap: 4, marginTop: 6, padding: "0 4px" }}>
            <input className="si" value={newChName} onChange={e => setNewChName(e.target.value)} onKeyDown={e => { if (e.key === "Enter") addCustomChannel(); }}
              placeholder="+ New channel" style={{ flex: 1, background: "transparent", border: "none", borderBottom: `1px solid ${C.faint} `, padding: "4px 8px", fontFamily: sans, fontSize: 10, color: C.text }} />
            {newChName.trim() && <button className="sb" onClick={addCustomChannel} style={{ padding: "2px 8px", fontSize: 8 }}>Add</button>}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "10px 8px" }}>
          {sideNotes.length === 0 && (<p style={{ fontSize: 11, color: C.dim, fontStyle: "italic", padding: "20px 8px", textAlign: "center" }}>No notes in {chData.name} yet</p>)}
          {[...sideNotes].sort((a, b) => {
            const ap = pinnedNotes.includes(a.id) ? pinnedNotes.indexOf(a.id) : 999;
            const bp = pinnedNotes.includes(b.id) ? pinnedNotes.indexOf(b.id) : 999;
            if (ap !== bp) return ap - bp;
            return b.created - a.created;
          }).map(n => {
            const sel = selectedNotes.has(n.id);
            const expanded = expandedNote === n.id;
            const isLong = n.content && n.content.length > 120;
            return (
              <div key={n.id} onClick={() => { if (editingSideNote !== n.id) { setSelectedNotes(prev => { const s = new Set(prev); if (s.has(n.id)) s.delete(n.id); else s.add(n.id); return s; }); } }}
                style={{ padding: "8px 10px", background: sel ? `${chData.color}08` : C.surface, border: `1px solid ${sel ? chData.color + "44" : C.border} `, borderLeft: pinnedNotes.includes(n.id) ? `2px solid ${C.accent} ` : undefined, borderRadius: 3, marginBottom: 5, cursor: "pointer", transition: "all 0.15s" }}>
                {editingSideNote === n.id ? (<div onClick={e => e.stopPropagation()}>
                  <textarea className="si" value={editSideText} onChange={e => setEditSideText(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sideNoteSave(n.id); } if (e.key === "Escape") setEditingSideNote(null); }}
                    style={{ width: "100%", background: C.raised, border: `1px solid ${chData.color} 33`, borderRadius: 3, padding: "6px 8px", fontFamily: sans, fontSize: 11, color: C.text, resize: "none", lineHeight: 1.5 }} rows={3} autoFocus />
                  <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                    <button className="sb" onClick={() => sideNoteSave(n.id)} style={{ padding: "2px 8px", fontSize: 8 }}>Save</button>
                    <button className="sb" onClick={() => setEditingSideNote(null)} style={{ padding: "2px 8px", fontSize: 8, opacity: 0.5 }}>Esc</button>
                  </div>
                </div>) : (<div>
                  <div style={{ maxHeight: expanded ? "none" : 54, overflow: "hidden", position: "relative" }}>
                    <p style={{ fontSize: 12, color: C.text, lineHeight: 1.55, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{n.content}</p>
                  </div>
                  {isLong && !expanded && (<button onClick={e => { e.stopPropagation(); setExpandedNote(n.id); }}
                    style={{ background: "transparent", border: "none", cursor: "pointer", fontFamily: sans, fontSize: 9, color: chData.color, padding: "3px 0 0", opacity: 0.7 }}>Read more ↓</button>)}
                  {isLong && expanded && (<button onClick={e => { e.stopPropagation(); setExpandedNote(null); }}
                    style={{ background: "transparent", border: "none", cursor: "pointer", fontFamily: sans, fontSize: 9, color: chData.color, padding: "3px 0 0", opacity: 0.7 }}>Show less ↑</button>)}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 5 }}>
                    <span style={{ fontSize: 8, color: C.dim }}>{new Date(n.created).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                    <div style={{ display: "flex", gap: 3 }} onClick={e => e.stopPropagation()}>
                      <button className="sb" onClick={() => togglePinNote(n.id)} title={pinnedNotes.includes(n.id) ? "Unpin note" : "Pin note (max 3)"} style={{ padding: "2px 6px", fontSize: 7, color: pinnedNotes.includes(n.id) ? C.accent : C.dim, borderColor: pinnedNotes.includes(n.id) ? C.accent + "44" : undefined, opacity: pinnedNotes.includes(n.id) ? 1 : 0.4 }}>{pinnedNotes.includes(n.id) ? "◆" : "◇"}</button>
                      <button className="sb" onClick={() => { setInput(prev => prev ? prev + "\n\n" + n.content : n.content); setMobileTab("session"); }} style={{ padding: "2px 6px", fontSize: 7, color: chData.color, borderColor: chData.color + "44" }} title="Send to session input">→</button>
                      <button className="sb" onClick={() => { setEditingSideNote(n.id); setEditSideText(n.content); }} title="Edit note" style={{ padding: "2px 6px", fontSize: 7 }}>✎</button>
                      {confirmDel === n.id ? (<>
                        <button className="sb" onClick={() => { sideNoteDel(n.id); }} style={{ padding: "2px 6px", fontSize: 7, borderColor: C.err, color: C.err }}>Delete</button>
                        <button className="sb" onClick={() => setConfirmDel(null)} style={{ padding: "2px 6px", fontSize: 7, opacity: 0.5 }}>No</button>
                      </>) : (
                        <button className="sb" onClick={() => setConfirmDel(n.id)} title="Delete note" style={{ padding: "2px 6px", fontSize: 7, opacity: 0.4 }}>×</button>
                      )}
                    </div>
                  </div>
                </div>)}
              </div>);
          })}
        </div>
        <div style={{ padding: "8px 8px 12px", borderTop: `1px solid ${C.border} `, flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 6 }}>
            <textarea className="si" value={noteInput} onChange={e => setNoteInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sideNoteSend(); } }}
              placeholder={`Add to ${chData.name}...`}
              style={{ flex: 1, background: C.surface, border: `1px solid ${chData.color} 22`, borderRadius: 3, padding: "8px 10px", fontFamily: sans, fontSize: 12, color: C.text, resize: "none", lineHeight: 1.5 }} rows={2} />
            <div style={{ display: "flex", flexDirection: "column", gap: 4, justifyContent: "flex-end", flexShrink: 0 }}>
              <button className="sb" onClick={sideNoteSend} disabled={!noteInput.trim()}
                style={{ padding: "8px 12px", borderColor: noteInput.trim() ? chData.color : C.dim, color: noteInput.trim() ? chData.color : C.dim }}>Add</button>
              {sideNotes.length > 0 && <button className="sb" onClick={exportNotesMd}
                style={{ padding: "4px 12px", fontSize: 8, opacity: 0.5 }} title={`Copy ${chData.name} as Markdown`}>{selectedNotes.size > 0 ? `Copy ${selectedNotes.size} ↓` : "Copy all ↓"}</button>}
              {selectedNotes.size > 0 && <button className="sb" onClick={() => setSelectedNotes(new Set())}
                title="Clear selection" style={{ padding: "3px 12px", fontSize: 7, opacity: 0.4 }}>Clear</button>}
            </div>
          </div>
        </div>
      </>)}

      {/* ─── SESSIONS VIEW ─── */}
      {sideMode === "sessions" && (<>
        <div style={{ flex: 1, overflowY: "auto", padding: 0 }}>
          {/* Sessions — primary, always first */}
          <div style={{ padding: "12px 8px 10px" }}>
            <p style={{ fontSize: 8, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, padding: "0 8px", marginBottom: 8 }}>Sessions{history.length > 0 ? ` (${history.length})` : ""}</p>
            {history.length === 0 && (<p style={{ fontSize: 10, color: C.dim, padding: "6px 8px", lineHeight: 1.5 }}>Your reflection sessions appear here. Each produces a clarity artifact.</p>)}
            {history.map(s => (<div key={s.id} style={{ padding: "10px 12px", background: C.surface, border: `1px solid ${C.border} `, borderRadius: 3, marginBottom: 5 }}>
              <p style={{ fontSize: 11, color: C.text, opacity: 0.85, lineHeight: 1.4, marginBottom: 6 }}>{s.preview}...</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 8, color: C.dim }}>{new Date(s.created).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                  <span style={{ fontSize: 7, color: C.dim }}>·</span>
                  <span style={{ fontSize: 8, color: C.muted }}>{MODES[s.mode]?.name || ""}</span>
                  {s.status === "complete" ? <span style={{ fontSize: 8, color: C.techne }}>✓</span> : <span style={{ fontSize: 8, color: C.accent }}>{s.status}</span>}
                </div>
                <div style={{ display: "flex", gap: 3 }}>
                  {s.status === "complete" && <button className="sb" onClick={() => togglePinArtifact(s.id)} title={pinnedArtifacts.includes(s.id) ? "Unpin from home" : "Pin artifact to home (max 3)"} style={{ padding: "3px 6px", fontSize: 7, color: pinnedArtifacts.includes(s.id) ? C.accent : C.dim, opacity: pinnedArtifacts.includes(s.id) ? 1 : 0.4 }}>{pinnedArtifacts.includes(s.id) ? "◆" : "◇"}</button>}
                  <button className="sb" onClick={() => loadSession(s.id)} title={s.status === "complete" ? "View session" : "Resume session"} style={{ padding: "3px 10px", fontSize: 7 }}>{s.status === "complete" ? "View" : "Resume"}</button>
                  <button className="sb" onClick={() => deleteSession(s.id)} title="Delete session" style={{ padding: "3px 6px", fontSize: 7, opacity: 0.3 }}>×</button>
                </div>
              </div>
            </div>))}
          </div>

          <div style={{ height: 1, background: C.faint, margin: "2px 16px" }} />

          {/* Carrying */}
          <div style={{ padding: "10px 8px" }}>
            <p style={{ fontSize: 8, letterSpacing: "0.12em", textTransform: "uppercase", color: C.accent, padding: "0 8px", marginBottom: 8 }}>Carrying{carryItems.length > 0 ? ` (${carryItems.length})` : ""}</p>
            {carryItems.length === 0 && (<p style={{ fontSize: 10, color: C.dim, padding: "4px 8px 6px", lineHeight: 1.5 }}>Open questions from sessions. Settle on your terms.</p>)}
            {carryItems.map(s => (<div key={s.id} style={{ padding: "10px 12px", background: C.surface, border: `1px solid ${C.border} `, borderLeft: `2px solid ${C.accent} `, borderRadius: 3, marginBottom: 5 }}>
              <p style={{ fontFamily: serif, fontSize: 12, color: C.guide, fontStyle: "italic", lineHeight: 1.5, marginBottom: 6 }}>{s.carryQuestion}</p>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <span style={{ fontSize: 8, color: C.dim, flex: 1 }}>{new Date(s.created).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                <button className="sb" onClick={() => setSettlingId(settlingId === s.id ? null : s.id)} style={{ padding: "3px 8px", fontSize: 7 }} title={settlingId === s.id ? "Cancel" : "Mark as settled"}>{settlingId === s.id ? "Cancel" : "Settle ✓"}</button>
                <button className="sb" onClick={() => revisitCarry(s.carryQuestion)} title="Start new session with this question" style={{ padding: "3px 8px", fontSize: 7, opacity: 0.7 }}>Explore →</button>
              </div>
              {settlingId === s.id && (<div style={{ marginTop: 6, animation: "sFadeIn 0.3s ease both" }}>
                <div style={{ display: "flex", gap: 4 }}>
                  <input className="si" value={settleText} onChange={e => setSettleText(e.target.value)} placeholder="What I found was..."
                    onKeyDown={e => { if (e.key === "Enter") { settleCarry(s.id, settleText); setSettlingId(null); setSettleText(""); } }}
                    style={{ flex: 1, background: C.raised, border: `1px solid ${C.border} `, borderRadius: 3, padding: "6px 8px", fontFamily: sans, fontSize: 11, color: C.text }} />
                  <button className="sb" onClick={() => { settleCarry(s.id, settleText); setSettlingId(null); setSettleText(""); }} disabled={!settleText.trim()} style={{ padding: "4px 8px", fontSize: 8 }}>Save</button>
                </div>
              </div>)}
            </div>))}
          </div>

          <div style={{ height: 1, background: C.faint, margin: "2px 16px" }} />

          {/* Settled */}
          <div style={{ padding: "10px 8px" }}>
            <p style={{ fontSize: 8, letterSpacing: "0.12em", textTransform: "uppercase", color: C.techne, padding: "0 8px", marginBottom: 8 }}>Settled{settled.length > 0 ? ` (${settled.length})` : ""}</p>
            {settled.length === 0 && (<p style={{ fontSize: 10, color: C.dim, padding: "4px 8px 6px", lineHeight: 1.5 }}>Resolved questions and your answers.</p>)}
            {settled.map(s => (<div key={s.id} style={{ padding: "10px 12px", background: C.surface, border: `1px solid ${C.border} `, borderLeft: `2px solid ${C.techne} 44`, borderRadius: 3, marginBottom: 5, opacity: 0.85 }}>
              <p style={{ fontFamily: serif, fontSize: 11, color: C.muted, fontStyle: "italic", lineHeight: 1.4 }}>{s.carryQuestion}</p>
              {s.carryResolution && (<p style={{ fontSize: 10, color: C.text, marginTop: 4, paddingLeft: 8, borderLeft: `1px solid ${C.techne} 44` }}>{s.carryResolution}</p>)}
            </div>))}
          </div>

          <div style={{ height: 1, background: C.faint, margin: "2px 16px" }} />

          {/* Shift Log */}
          <div style={{ padding: "10px 8px 16px" }}>
            <p style={{ fontSize: 8, letterSpacing: "0.12em", textTransform: "uppercase", color: C.dim, padding: "0 8px", marginBottom: 8 }}>Shift Log</p>
            {shifts.length === 0 && (<p style={{ fontSize: 10, color: C.dim, padding: "4px 8px 6px", lineHeight: 1.5 }}>How your thinking moves. Shifts in, out, and vows.</p>)}
            {shifts.map(s => (<div key={s.id} style={{ padding: "8px 10px 8px 16px", borderLeft: `2px solid ${C.faint} `, marginBottom: 8, marginLeft: 8, position: "relative" }}>
              <div style={{ position: "absolute", left: -5, top: 4, width: 6, height: 6, borderRadius: "50%", background: C.accent, opacity: 0.5 }} />
              <span style={{ fontSize: 8, color: C.dim, display: "block", marginBottom: 4 }}>{new Date(s.created).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
              {s.shiftIn && <p style={{ fontSize: 10, color: C.muted }}><span style={{ color: C.dim, fontSize: 8 }}>In →</span> {s.shiftIn}</p>}
              {s.shiftOut && <p style={{ fontFamily: serif, fontSize: 12, color: C.text, fontStyle: "italic" }}><span style={{ color: C.accent, fontFamily: sans, fontSize: 8, fontStyle: "normal" }}>Out →</span> {s.shiftOut}</p>}
              {s.vow && <p style={{ fontSize: 10, color: C.accent, marginTop: 2 }}>Vow: {s.vow}</p>}
            </div>))}
          </div>
        </div>

        {/* Sessions footer — stats + begin */}
        <div style={{ padding: "10px 16px 12px", borderTop: `1px solid ${C.border} `, flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {[{ n: history.length, l: "sessions", c: C.muted }, { n: carryItems.length, l: "carrying", c: C.accent }, { n: shifts.length, l: "shifts", c: C.dim }].map(({ n, l, c }) => (
              <div key={l} style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
                <span style={{ fontFamily: sans, fontSize: 12, fontWeight: 500, color: c }}>{n}</span>
                <span style={{ fontSize: 8, color: C.dim, letterSpacing: "0.04em" }}>{l}</span>
              </div>
            ))}
          </div>
          <button className="sb" onClick={() => goTo("shiftIn")} title="Start a new session" style={{ padding: "4px 10px", fontSize: 8 }}>Begin →</button>
        </div>
      </>)}
    </div>
  );

  // ─── Split Layout Wrapper ───
  function splitWrap(inner) {
    return (<div style={{ height: "100vh", background: C.bg, color: C.text, fontFamily: sans, display: "flex", flexDirection: "column", opacity: fade, transition: "opacity 0.45s ease" }}>
      {onboard}
      <div className="sm" style={{ display: "none", borderBottom: `1px solid ${C.border} `, background: C.panelBg }}>
        {[{ id: "notes", l: "Menu", c: C.episteme }, { id: "session", l: "Session", c: C.accent }].map(t => (
          <button key={t.id} onClick={() => setMobileTab(t.id)}
            style={{ flex: 1, padding: "12px", background: "transparent", border: "none", borderBottom: mobileTab === t.id ? `2px solid ${t.c} ` : "2px solid transparent", cursor: "pointer" }}>
            <span style={{ fontFamily: sans, fontSize: 11, color: mobileTab === t.id ? t.c : C.dim, fontWeight: mobileTab === t.id ? 500 : 400, letterSpacing: "0.06em", textTransform: "uppercase" }}>{t.l}</span>
          </button>))}
      </div>
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <div className="sd" style={{ width: sideW, minWidth: 200, flexShrink: 0, display: "flex" }}>{notesSidebar}</div>
        <div className="sd" onMouseDown={onDragStart} style={{ width: 6, flexShrink: 0, cursor: "col-resize", background: dragging ? C.accent + "33" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 2, height: 32, background: dragging ? C.accent : C.faint, borderRadius: 1 }} />
        </div>
        <div className="sm" style={{ flex: 1, display: "none", overflow: "hidden" }}>{mobileTab === "notes" ? notesSidebar : null}</div>
        <div style={{ flex: 1, display: mobileTab === "notes" ? undefined : "flex", flexDirection: "column", overflow: "hidden" }} className={mobileTab === "notes" ? "sd" : ""}>
          {inner}
        </div>
      </div>
    </div>);
  }

  if (phase === "loading") return (<div style={shell}><div style={col}><div style={center}><Dots /></div></div></div>);
  if (phase === "philosophy") return (<PhilosophyPage onBack={() => goTo("welcome")} onBegin={() => goTo("shiftIn")} />);

  const onboard = showOnboard && (<div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center", padding: 24 }}>
    <div style={{ background: C.surface, border: `1px solid ${C.border} `, borderRadius: 4, maxWidth: 440, width: "100%", padding: "40px 36px", animation: "sFadeIn 0.5s ease both" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <h2 style={{ fontFamily: serif, fontWeight: 400, fontSize: 28, color: C.text, marginBottom: 8 }}>Welcome to Sanctum</h2>
        <div style={{ width: 28, height: 1, background: C.accent, margin: "0 auto" }} />
      </div>
      <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.8, marginBottom: 20, textAlign: "center" }}>Structured reflection using the <span style={{ color: C.accent }}>Triadic Method</span> — examining what you <span style={{ color: C.episteme }}>know</span>, what you <span style={{ color: C.techne }}>can do</span>, and what truly <span style={{ color: C.phronesis }}>matters</span>.</p>
      <div style={{ marginBottom: 24 }}><TriadLegend size="large" /></div>
      <div style={{ textAlign: "center" }}><button className="sb" onClick={() => { setShowOnboard(false); ST.setOnboarded(); }} style={{ padding: "13px 36px" }}>Begin</button></div>
    </div>
  </div>);


  // ═════ WELCOME ═════
  if (phase === "welcome") {
    const returning = history.length > 0;
    return splitWrap(<div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", overflowY: "auto", background: `radial - gradient(ellipse at 50 % 38 %, rgba(196, 154, 108, 0.04) 0 %, transparent 60 %), ${C.bg} ` }}>
      <div style={{ ...col, overflowY: "auto" }}><div style={{ ...center, justifyContent: "flex-start", paddingTop: "clamp(32px,6vh,64px)", paddingBottom: 32 }}>
        <div style={{ animation: "sFadeIn 1s ease both" }}>
          <div style={{ width: 40, height: 1, background: C.faint, margin: "0 auto 24px" }} />
          <h1 style={{ fontFamily: serif, fontWeight: 400, fontSize: "clamp(32px,8vw,44px)", letterSpacing: "0.2em", color: C.text, textTransform: "uppercase" }}>Sanctum</h1>
          <div style={{ width: 40, height: 1, background: C.faint, margin: "24px auto 0" }} />
        </div>
        <p style={{ fontSize: 13, color: C.muted, marginTop: 20, lineHeight: 1.7, maxWidth: 340, animation: "sFadeIn 1s ease 0.15s both" }}>
          {returning ? "Welcome back. What are you sitting with now?" : "Structured reflection for moments that matter."}
        </p>
        <div style={{ marginTop: 20, animation: "sFadeIn 1s ease 0.3s both" }}><TriadLegend /></div>
        <div style={{ marginTop: 24, width: "100%", maxWidth: 440, animation: "sFadeIn 1s ease 0.35s both" }}>
          <p style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: C.dim, marginBottom: 10, textAlign: "center" }}>Choose your session</p>
          <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
            {Object.values(MODES).map(m => (<ModeCard key={m.id} m={m} selected={mode === m.id} onSelect={() => setMode(m.id)} expanded={expandedMode === m.id} onExpand={() => setExpandedMode(expandedMode === m.id ? null : m.id)} locked={false} />))}
          </div>
        </div>
        <div style={{ marginTop: 20, width: "100%", maxWidth: 440, animation: "sFadeIn 1s ease 0.45s both" }}>
          <p style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: C.dim, marginBottom: 10, textAlign: "center" }}>Response style</p>
          <div style={{ display: "flex", gap: 8 }}>
            {[{ id: "mirror", name: "Mirror", desc: "Sharp and precise. 2-4 sentences. The Guide reflects back with clarity." }, { id: "lantern", name: "Lantern", desc: "Rich and reflective. 6-10 sentences. The Guide illuminates the landscape around your thinking." }].map(s => (
              <button key={s.id} onClick={() => setStyle(s.id)} style={{ flex: 1, padding: "14px 16px", background: style === s.id ? C.accentSoft : C.surface, border: `1px solid ${style === s.id ? C.accent : C.border} `, borderRadius: 3, cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}>
                <div style={{ fontFamily: sans, fontSize: 11, fontWeight: 500, color: style === s.id ? C.accent : C.text, marginBottom: 4 }}>{s.name}</div>
                <div style={{ fontFamily: sans, fontSize: 10, color: C.dim, lineHeight: 1.5 }}>{s.desc}</div>
              </button>))}
          </div>
        </div>
        <button className="sb" onClick={() => goTo("shiftIn")} style={{ marginTop: 24, padding: "14px 36px", animation: "sFadeIn 1s ease 0.55s both" }}>Begin a session</button>
        <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap", justifyContent: "center", animation: "sFadeIn 1s ease 0.6s both" }}>
          <button className="sb" onClick={() => goTo("philosophy")} style={{ padding: "10px 18px", opacity: 0.6 }}>Triadic Method →</button>
        </div>
        {pinnedArtData.length > 0 ? (<div style={{ marginTop: 32, width: "100%", maxWidth: 440, animation: "sFadeIn 1s ease 0.7s both" }}>
          <p style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: C.dim, marginBottom: 12, textAlign: "center" }}>Pinned artifacts</p>
          {pinnedArtData.map(p => (<div key={p.sid} style={{ marginBottom: 12, position: "relative" }}>
            <div style={{ cursor: "pointer" }} onClick={() => loadSession(p.sid)}>
              <ArtCard artifact={p.artifact} animate={false} mode={p.mode || "standard"} dark={true} />
            </div>
            <button className="sb" onClick={() => togglePinArtifact(p.sid)} title="Unpin artifact"
              style={{ position: "absolute", top: 8, right: 8, padding: "2px 6px", fontSize: 8, color: C.accent, borderColor: C.accent + "44", background: C.surface }}>◆</button>
          </div>))}
        </div>) : isFirst && history.length === 0 ? (<div style={{ marginTop: 32, width: "100%", maxWidth: 440, animation: "sFadeIn 1s ease 0.7s both" }}>
          <p style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: C.dim, marginBottom: 12, textAlign: "center" }}>Here's what a session produces</p>
          <ArtCard artifact={DEMO_ART} animate={false} mode="standard" dark={true} />
        </div>) : null}
      </div></div>
    </div>);
  }

  // ═════ SHIFT IN ═════
  if (phase === "shiftIn") return splitWrap(<div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
    <div style={col}><div style={{ ...center, justifyContent: "flex-start", paddingTop: "12vh" }}>
      <h2 style={{ fontFamily: serif, fontWeight: 400, fontSize: "clamp(22px,5vw,28px)", color: C.text, animation: "sFadeIn 0.7s ease both" }}>Before we begin</h2>
      <p style={{ fontSize: 12, color: C.muted, maxWidth: 400, lineHeight: 1.75, margin: "12px 0 24px", animation: "sFadeIn 0.7s ease 0.15s both" }}>In one sentence — what's the question you're carrying into this session?</p>
      <input className="si" value={shiftIn} onChange={e => setShiftIn(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); goTo("opening"); } }} placeholder="The question I'm sitting with is..."
        style={{ width: "100%", maxWidth: 460, background: C.surface, border: `1px solid ${C.border} `, borderRadius: 3, padding: "16px 20px", fontFamily: sans, fontSize: 14, color: C.text, animation: "sFadeIn 0.7s ease 0.25s both" }} />
      <div style={{ display: "flex", gap: 12, marginTop: 20, animation: "sFadeIn 0.7s ease 0.35s both" }}>
        <button className="sb" onClick={() => goTo("opening")} style={{ padding: "13px 32px" }}>{shiftIn.trim() ? "Continue" : "Skip"}</button>
        <button className="sb" onClick={() => goTo("welcome")} style={{ padding: "13px 20px", opacity: 0.5 }}>Back</button>
      </div>
    </div></div>
  </div>);

  // ═════ OPENING ═════
  if (phase === "opening") return splitWrap(<div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
    <div style={col}><div style={{ ...center, justifyContent: "flex-start", paddingTop: "10vh" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, animation: "sFadeIn 0.6s ease both" }}>
        <span style={{ fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: C.accent }}>{modeData.name}</span>
        <span style={{ fontSize: 9, color: C.dim }}>·</span>
        <span style={{ fontSize: 9, color: C.dim }}>{style === "lantern" ? "Lantern" : "Mirror"}</span>
        <span style={{ fontSize: 9, color: C.dim }}>·</span>
        <span style={{ fontSize: 9, color: C.dim }}>{modeData.time}</span>
        <span style={{ fontSize: 9, color: C.dim }}>·</span>
        <PhaseDots phases={modeData.allPhases} />
      </div>
      {shiftIn && (<div style={{ padding: "10px 16px", background: C.accentSoft, borderRadius: 3, marginBottom: 16, maxWidth: 460, animation: "sFadeIn 0.6s ease 0.1s both" }}>
        <p style={{ fontFamily: serif, fontSize: 12, color: C.accent, fontStyle: "italic" }}>Carrying: {shiftIn}</p>
      </div>)}
      <h2 style={{ fontFamily: serif, fontWeight: 400, fontSize: "clamp(24px,6vw,30px)", color: C.text, animation: "sFadeIn 0.7s ease 0.15s both" }}>What are you sitting with?</h2>
      <p style={{ fontSize: 12, color: C.muted, maxWidth: 400, lineHeight: 1.75, margin: "12px 0 24px", animation: "sFadeIn 0.7s ease 0.25s both" }}>A decision, a tension, a situation. The more specific you are — names, numbers, timelines — the sharper the reflection.</p>
      <textarea className="si" value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey} placeholder="I'm trying to figure out..." rows={6}
        style={{ width: "100%", maxWidth: 500, background: C.surface, border: `1px solid ${C.border} `, borderRadius: 3, padding: "clamp(14px,3vw,20px)", fontFamily: sans, fontSize: 14, color: C.text, lineHeight: 1.8, resize: "vertical", animation: "sFadeIn 0.7s ease 0.35s both" }} />
      <div style={{ display: "flex", gap: 12, marginTop: 20, animation: "sFadeIn 0.7s ease 0.45s both" }}>
        <button className="sb" onClick={beginReflection} disabled={input.trim().length <= 20} style={{ padding: "13px 32px" }}>Begin</button>
        <button className="sb" onClick={() => goTo("welcome")} style={{ padding: "13px 20px", opacity: 0.5 }}>Back</button>
      </div>
    </div></div>
  </div>);

  // ═════ DIALOGUE ═════
  if (phase === "dialogue") {
    const hint = isReflection ? "This is yours. What's clearest now?" : ["Share what comes to mind...", "What comes up...", "Sit with that...", "What's becoming clearer...", "Follow the thread...", "What do you notice...", "What connects...", "What's clear now..."][Math.min(exchange - 1, 7)];
    return splitWrap(<div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ ...col, flex: 1, paddingTop: 0, paddingBottom: 0 }}>
        <PhaseBar exchange={exchange} mode={mode} isReflection={isReflection} />
        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "24px 0 16px" }}>
          {display.map((m, i) => (<Msg key={i} msg={m} animate={i >= display.length - 1} />))}
          {thinking && (<div style={{ animation: "sFadeIn 0.3s ease both" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.accent, opacity: 0.4 }} />
              <span style={{ fontSize: 9, letterSpacing: "0.14em", color: C.dim, textTransform: "uppercase" }}>Guide</span>
            </div>
            <div style={{ paddingLeft: 13 }}><Dots /></div>
          </div>)}
          {error && <p style={{ fontSize: 12, color: C.err, fontStyle: "italic", margin: "8px 0 8px 13px" }}>{error}</p>}
        </div>
        <div style={{ padding: "14px 0 clamp(16px,3vw,22px)", borderTop: `1px solid ${isReflection ? C.reflect + "33" : C.border} ` }}>
          {isReflection && (<div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.reflect, opacity: 0.8 }} />
            <span style={{ fontSize: 9, letterSpacing: "0.1em", color: C.reflect, textTransform: "uppercase" }}>Your Reflection</span>
          </div>)}
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
            <textarea ref={inputRef} className="si" value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
              placeholder={hint} rows={isReflection ? 4 : 2} disabled={thinking}
              style={{ flex: 1, background: "transparent", border: "none", borderBottom: `1px solid ${isReflection ? C.reflect + "44" : thinking ? C.border : C.faint} `, padding: "10px 4px", fontFamily: isReflection ? serif : sans, fontSize: isReflection ? 16 : 14, color: C.text, lineHeight: 1.65, resize: "none", opacity: thinking ? 0.35 : 1, transition: "opacity 0.3s" }} />
            <button className="sb" onClick={sendReply} disabled={thinking || !input.trim()}
              style={{ padding: "10px 20px", flexShrink: 0, ...(isReflection ? { borderColor: C.reflect, color: C.reflect } : {}) }}>
              {isReflection ? "Complete" : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>);
  }

  // ═════ SYNTHESIZING ═════
  if (phase === "synthesizing") return splitWrap(<div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}><div style={col}><div style={center}>
    <div style={{ width: 32, height: 32, borderRadius: "50%", border: `1px solid ${C.faint} `, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, animation: "sFadeIn 0.6s ease both" }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.accent, animation: "sBreathe 1.4s ease-in-out infinite" }} />
    </div>
    <p style={{ fontFamily: serif, fontSize: 20, color: C.muted, fontStyle: "italic", animation: "sFadeIn 0.8s ease 0.2s both", lineHeight: 1.6 }}>{modeData?.synthMsg || "Weaving the threads…"}</p>
  </div></div></div>);

  // ═════ RESULT ═════
  if (phase === "result" && artifact) return splitWrap(<div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", overflowY: "auto", paddingBottom: 48, background: `radial - gradient(ellipse at 50 % 20 %, rgba(196, 154, 108, 0.03) 0 %, transparent 55 %), ${C.bg} ` }}>
    <div style={{ ...col, alignItems: "center", paddingTop: 24, overflowY: "auto" }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap", justifyContent: "center", animation: "sFadeIn 0.6s ease both" }}>
        {[{ k: "artifact", l: "Artifact" }, { k: "conversation", l: "Conversation" }, { k: "full", l: "Full Session" }].map(({ k, l }) => (
          <button key={k} className={`sb ${resultView === k ? "active" : ""} `} onClick={() => setResultView(k)} style={{ padding: "8px 16px" }}>{l}</button>))}
      </div>
      {resultView === "artifact" && <ArtCard artifact={artifact} animate={true} mode={mode} />}
      {resultView === "conversation" && (<div style={{ width: "100%", maxWidth: 500, animation: "sFadeIn 0.6s ease both" }}>
        <div style={{ padding: "clamp(16px,4vw,24px) clamp(20px,4vw,28px)", background: C.surface, border: `1px solid ${C.border} `, borderRadius: 3 }}>
          <p style={{ fontSize: 8, letterSpacing: "0.2em", color: C.dim, textTransform: "uppercase", marginBottom: 24 }}>{modeData?.name} · Conversation</p>
          {display.map((m, i) => (<Msg key={i} msg={m} animate={false} />))}
        </div>
      </div>)}
      {resultView === "full" && (<div style={{ width: "100%", maxWidth: 500, animation: "sFadeIn 0.6s ease both" }}>
        <div style={{ padding: "clamp(16px,4vw,24px) clamp(20px,4vw,28px)", background: C.surface, border: `1px solid ${C.border} `, borderRadius: "3px 3px 0 0" }}>
          <p style={{ fontSize: 8, letterSpacing: "0.2em", color: C.dim, textTransform: "uppercase", marginBottom: 24 }}>Conversation</p>
          {display.map((m, i) => (<Msg key={i} msg={m} animate={false} />))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px clamp(20px,4vw,28px)", background: C.surface, borderLeft: `1px solid ${C.border} `, borderRight: `1px solid ${C.border} ` }}>
          <div style={{ flex: 1, height: 1, background: C.faint }} /><span style={{ fontFamily: serif, fontSize: 11, color: C.dim, fontStyle: "italic" }}>synthesized into</span><div style={{ flex: 1, height: 1, background: C.faint }} />
        </div>
        <ArtCard artifact={artifact} animate={false} mode={mode} />
      </div>)}

      {!shiftOut && (<div style={{ marginTop: 28, width: "100%", maxWidth: 460, animation: "sFadeIn 0.6s ease 0.3s both" }}>
        <p style={{ fontFamily: serif, fontSize: 15, color: C.muted, fontStyle: "italic", textAlign: "center", marginBottom: 12 }}>In one sentence — what's the question you're carrying out?</p>
        <div style={{ display: "flex", gap: 8 }}>
          <input className="si" value={shiftOut} onChange={e => setShiftOut(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); saveFinal("shiftOut", shiftOut); } }} placeholder="What's clearer now is..."
            style={{ flex: 1, background: C.surface, border: `1px solid ${C.border} `, borderRadius: 3, padding: "12px 16px", fontFamily: sans, fontSize: 13, color: C.text }} />
          <button className="sb" onClick={() => saveFinal("shiftOut", shiftOut)} disabled={!shiftOut.trim()} style={{ padding: "10px 16px" }}>Save</button>
        </div>
      </div>)}
      {shiftOut && !vow && <p style={{ marginTop: 16, fontSize: 11, color: C.accent, animation: "sFadeIn 0.4s ease both" }}>Shift saved ✓</p>}

      {shiftOut && !vow && (<div style={{ marginTop: 20, width: "100%", maxWidth: 460, animation: "sFadeIn 0.6s ease both" }}>
        <p style={{ fontFamily: serif, fontSize: 15, color: C.muted, fontStyle: "italic", textAlign: "center", marginBottom: 12 }}>The smallest commitment you're willing to make to yourself right now:</p>
        <div style={{ display: "flex", gap: 8 }}>
          <input className="si" value={vow} onChange={e => setVow(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); saveFinal("vow", vow); } }} placeholder="I will..."
            style={{ flex: 1, background: C.surface, border: `1px solid ${C.border} `, borderRadius: 3, padding: "12px 16px", fontFamily: sans, fontSize: 13, color: C.text }} />
          <button className="sb" onClick={() => saveFinal("vow", vow)} disabled={!vow.trim()} style={{ padding: "10px 16px" }}>Vow</button>
        </div>
      </div>)}
      {vow && (<div style={{ marginTop: 16, padding: "14px 20px", background: C.accentSoft, borderRadius: 3, borderLeft: `2px solid ${C.accent} `, maxWidth: 460, animation: "sFadeIn 0.5s ease both" }}>
        <p style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: C.accent, marginBottom: 6 }}>Your Vow</p>
        <p style={{ fontFamily: serif, fontSize: 15, color: C.text, fontStyle: "italic" }}>{vow}</p>
      </div>)}

      {!rating && (<div style={{ marginTop: 24, textAlign: "center", animation: "sFadeIn 0.6s ease both" }}>
        <p style={{ fontSize: 10, color: C.dim, marginBottom: 10 }}>Was this session useful?</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button className="sb" onClick={() => rateSession("up")} style={{ padding: "8px 20px" }}>Useful</button>
          <button className="sb" onClick={() => rateSession("down")} style={{ padding: "8px 20px", opacity: 0.6 }}>Not useful</button>
        </div>
      </div>)}
      {rating && <p style={{ marginTop: 16, fontSize: 10, color: C.dim, animation: "sFadeIn 0.4s ease both" }}>{rating === "up" ? "Glad it helped. ✓" : "Noted — we'll improve. ✓"}</p>}

      <div style={{ display: "flex", gap: 8, marginTop: 20, flexWrap: "wrap", justifyContent: "center", animation: "sFadeIn 0.8s ease 0.5s both" }}>
        <button className="sb" onClick={() => togglePinArtifact(sid)} title={pinnedArtifacts.includes(sid) ? "Unpin from home" : "Pin to home screen (max 3)"} style={{ padding: "10px 16px", color: pinnedArtifacts.includes(sid) ? C.accent : C.dim, borderColor: pinnedArtifacts.includes(sid) ? C.accent + "44" : undefined }}>{pinnedArtifacts.includes(sid) ? "◆ Pinned" : "◇ Pin"}</button>
        <button className="sb" onClick={() => printSession(display, artifact, created, mode, shiftIn, shiftOut, vow)} title="Print session" style={{ padding: "10px 16px" }}>⎙ Print</button>
        <button className="sb" onClick={() => exportMd(display, artifact, created, mode, shiftIn, shiftOut, vow)} title="Export as Markdown" style={{ padding: "10px 16px" }}>↓ .md</button>
        <button className="sb" onClick={() => doCopy((() => { const L = { brought: "WHAT YOU BROUGHT", explored: "WHAT WE EXPLORED", emerged: "WHAT EMERGED", underneath: "WHAT WAS UNDERNEATH", words: "YOUR WORDS BACK TO YOU", question: "A QUESTION TO CARRY" }; let t = "SANCTUM\n\n" + Object.entries(artifact).map(([k, v]) => `${L[k] || k} \n${v} `).join("\n\n"); if (vow) t += `\n\nVOW\n${vow} `; return t; })())} title="Copy to clipboard" style={{ padding: "10px 16px" }}>{copied ? "Copied ✓" : "Copy"}</button>
        {artifact?.words && (<button className="sb" onClick={async () => {
          const note = { id: genId(), channel: "matters", content: artifact.words.replace(/\*/g, ""), created: Date.now(), updated: Date.now(), sessionRef: sid };
          await ST.saveNote(note); setNoteRefresh(r => r + 1); setCopied(true); setTimeout(() => setCopied(false), 2200);
        }} title="Save words to notes" style={{ padding: "10px 16px", borderColor: C.phronesis + "55", color: C.phronesis }}>→ Notes</button>)}
        <button className="sb" onClick={newSession} title="Start a new session" style={{ padding: "10px 16px" }}>New session</button>
      </div>
    </div>
  </div>);

  return splitWrap(<div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}><Dots /></div>);
}
