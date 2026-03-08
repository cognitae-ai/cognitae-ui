export const FONT = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&display=swap";
export const serif = "'Cormorant Garamond', Georgia, serif";
export const sans = "'DM Sans', system-ui, sans-serif";

export const C = {
    bg: "#0c0b0a", surface: "#141312", raised: "#1a1918",
    text: "#d4cec2", muted: "#847b6f", dim: "#3d3831", faint: "#2a2622",
    accent: "#c49a6c", accentSoft: "rgba(196,154,108,0.10)",
    guide: "#d4c4a8", border: "rgba(255,255,255,0.04)",
    paper: "#ede8df", paperText: "#2b2520", paperMuted: "#736a5f",
    episteme: "#7a9eb5", epistemeSoft: "rgba(122,158,181,0.10)",
    techne: "#8aab7a", techneSoft: "rgba(138,171,122,0.10)",
    phronesis: "#b59a7a", phronesisSoft: "rgba(181,154,122,0.10)",
    reflect: "#d4aa78", reflectSoft: "rgba(212,170,120,0.12)",
    err: "#c47a6c", lock: "#5a5550", panelBg: "#111110",
};

export const TC = { episteme: C.episteme, techne: C.techne, phronesis: C.phronesis, reflect: C.reflect };

export const CHANNELS = [
    { id: "know", name: "What I Know", desc: "Facts, evidence, things I've verified", color: C.episteme, icon: "◆" },
    { id: "do", name: "What I Could Do", desc: "Actions, options, next steps", color: C.techne, icon: "▸" },
    { id: "matters", name: "What Matters", desc: "Meaning, values, what's important", color: C.phronesis, icon: "○" },
];

export function robustCopy(t, cb) {
    if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(t).then(cb).catch(() => fbC(t, cb)); return;
    }
    fbC(t, cb);
}

function fbC(t, cb) {
    try {
        const a = document.createElement("textarea");
        a.value = t; a.style.cssText = "position:fixed;left:-9999px";
        document.body.appendChild(a); a.select();
        if (document.execCommand("copy") && cb) cb();
        document.body.removeChild(a);
    } catch { }
}

export function dlFile(c, n, t) {
    const b = new Blob([c], { type: t });
    const u = URL.createObjectURL(b);
    const a = document.createElement("a");
    a.href = u; a.download = n; document.body.appendChild(a);
    a.click(); document.body.removeChild(a); URL.revokeObjectURL(u);
}
