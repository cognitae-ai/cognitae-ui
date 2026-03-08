export const VER = "0.2.0";
export const FONT_URL = "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&display=swap";
export const ff = "'IBM Plex Mono', monospace";
export const C = {
    bg: "#08080a", sf: "#0e0e11", rs: "#141418", tx: "#c8c8cd", br: "#e8e8ec",
    mu: "#5a5a64", dm: "#2a2a30", ft: "#1a1a1f", bd: "rgba(255,255,255,0.04)",
    bh: "rgba(255,255,255,0.1)", cr: "#f43f5e", hi: "#f97316", mo: "#ca8a04",
    lo: "#6366f1", sa: "#10b981", ac: "#818cf8", sd: "#0a0a0d"
};
export const sC = { CRITICAL: C.cr, HIGH: C.hi, MODERATE: C.mo, LOW: C.lo, SAFE: C.sa };
export const gId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export function exportData(data, name, type = 'json') {
    const str = type === 'json' ? JSON.stringify(data, null, 2) : type === 'md' ? data : JSON.stringify(data);
    const blob = new Blob([str], { type: type === 'json' ? 'application/json' : 'text/plain' });
    const u = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = u; a.download = name; a.click();
    URL.revokeObjectURL(u);
}
