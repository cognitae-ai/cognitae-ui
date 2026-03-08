import { allPat, TX, PROVIDERS } from './taxonomy';

export function analyse(text) {
    const findings = [];
    allPat.forEach(p => {
        (p.kw || []).forEach(kw => {
            if (kw.w < 0) return; let m, re = new RegExp(kw.re.source, kw.re.flags);
            while ((m = re.exec(text)) !== null) {
                const cs = Math.max(0, m.index - 80), ce = Math.min(text.length, m.index + m[0].length + 80);
                findings.push({ pid: p.id, pn: p.n, sev: p.s, col: p.c, match: m[0], w: kw.w, ctx: text.substring(cs, ce), idx: m.index, grp: TX.find(t => t.items.includes(p))?.grp });
            }
        });
    });
    findings.sort((a, b) => b.w - a.w);
    const lines = text.split('\n').filter(l => l.trim()); const totalTurns = Math.max(1, lines.length);
    const hedgeWords = (text.match(/(perhaps|maybe|might|possibly|could be|it's possible|I'm not sure|I think)/gi) || []).length;
    const certainWords = (text.match(/(definitely|certainly|clearly|obviously|undoubtedly|without doubt|absolutely|it's clear)/gi) || []).length;
    const frictionWords = (text.match(/(however|but|actually|I disagree|that's not|not quite|I'd push back|to be fair)/gi) || []).length;
    const structural = { hedgeRatio: (hedgeWords / (hedgeWords + certainWords + 1)).toFixed(2), frictionCoeff: (frictionWords / totalTurns).toFixed(3), certaintyScore: certainWords, hedgeCount: hedgeWords, frictionCount: frictionWords, totalTurns };
    const ps = {}; allPat.forEach(p => { ps[p.id] = { p, ms: [], tw: 0 } });
    findings.forEach(fi => { ps[fi.pid].ms.push(fi); ps[fi.pid].tw += fi.w });
    const os = findings.length > 0 ? Math.min(1, findings.reduce((s, fi) => s + fi.w, 0) / (findings.length * .8)) : 0;
    let sv = "SAFE"; if (os > .7) sv = "CRITICAL"; else if (os > .5) sv = "HIGH"; else if (os > .3) sv = "MODERATE"; else if (os > .1) sv = "LOW";
    return { findings, ps, os, sv, structural };
}

export async function callLLM({ provider, apiKey, model, system, messages, endpoint }) {
    const p = PROVIDERS[provider]; if (!p || !apiKey) return 'No API key or provider configured';
    try {
        if (provider === 'anthropic') {
            const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01", "anthropic-dangerously-allow-browser": "true" }, body: JSON.stringify({ model, max_tokens: 1000, system, messages }) });
            const d = await r.json(); return d.content?.map(c => c.text || '').join('\n') || d.error?.message || 'No response';
        } else if (provider === 'openai') {
            const r = await fetch("https://api.openai.com/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": "Bearer " + apiKey }, body: JSON.stringify({ model, messages: [{ role: "system", content: system }, ...messages], max_tokens: 1000 }) });
            const d = await r.json(); return d.choices?.[0]?.message?.content || d.error?.message || 'No response';
        } else if (provider === 'google') {
            const contents = messages.map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
            const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents }) });
            const d = await r.json(); return d.candidates?.[0]?.content?.parts?.[0]?.text || d.error?.message || 'No response';
        } else if (provider === 'custom') {
            const r = await fetch(endpoint || "https://api.example.com/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": "Bearer " + apiKey }, body: JSON.stringify({ model, messages: [{ role: "system", content: system }, ...messages], max_tokens: 1000 }) });
            const d = await r.json(); return d.choices?.[0]?.message?.content || d.error?.message || 'No response';
        }
    } catch (e) { return 'Error: ' + e.message }
}
