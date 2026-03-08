import React from 'react';
import { C, ff, VER } from '../../lib/constants';

export default function Docs() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: C.bg, fontFamily: ff }}>
            <div style={{ padding: '12px 20px', borderBottom: `1px solid ${C.bd}` }}>
                <h2 style={{ fontSize: 14, fontWeight: 500, color: C.br, margin: 0, letterSpacing: '-.02em' }}>Documentation</h2>
                <div style={{ fontSize: 10, color: C.mu }}>Expositor v{VER} User Guide</div>
            </div>
            <div style={{ flex: 1, padding: '40px 60px', overflowY: 'auto' }}>
                <div style={{ maxWidth: 600, color: C.tx, fontSize: 12, lineHeight: 1.6 }}>
                    <h1 style={{ fontSize: 24, fontWeight: 300, color: C.br, margin: '0 0 24px 0' }}>Expositor AI Auditing Suite</h1>

                    <h3 style={{ fontSize: 14, color: C.ac, marginTop: 32, marginBottom: 12 }}>Core Principles</h3>
                    <ul style={{ paddingLeft: 20, marginBottom: 24, color: C.mu }}>
                        <li style={{ marginBottom: 8 }}><strong style={{ color: C.br }}>Evidence Architecture:</strong> Interfaces must capture, expose, and format evidence rather than hide it.</li>
                        <li style={{ marginBottom: 8 }}><strong style={{ color: C.br }}>Quiet Intensity:</strong> Deliberate visual pacing. No generic dark mode blues. Forensic colour palette.</li>
                        <li style={{ marginBottom: 8 }}><strong style={{ color: C.br }}>Receipts Over PR:</strong> The tool exists to prove what an AI actually does, bypassing theoretical safety claims.</li>
                    </ul>

                    <h3 style={{ fontSize: 14, color: C.ac, marginTop: 32, marginBottom: 12 }}>Modules</h3>

                    <div style={{ marginBottom: 24 }}>
                        <h4 style={{ fontSize: 12, color: C.br, marginBottom: 4 }}>1. Analyst (Static Scanning)</h4>
                        <p style={{ color: C.mu }}>Paste raw conversation logs from other platforms. The engine applies the loaded Taxonomy to identify vulnerability signatures and generate a structural resilience score (Hedge Ratio, Friction Coefficient).</p>
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <h4 style={{ fontSize: 12, color: C.br, marginBottom: 4 }}>2. Benchmark Runner</h4>
                        <p style={{ color: C.mu }}>Structured, multi-phase adversarial testing protocols. Tests escalate pressure on specific vectors (e.g. Sycophancy, Containment Spirals). Generates official graded reports (A-F).</p>
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <h4 style={{ fontSize: 12, color: C.br, marginBottom: 4 }}>3. Audit Lab</h4>
                        <p style={{ color: C.mu }}>Direct chat interface with selected models via configured API keys. Includes real-time static analysis on the incoming token stream, identifying signatures as they occur.</p>
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <h4 style={{ fontSize: 12, color: C.br, marginBottom: 4 }}>4. Taxonomy Browser</h4>
                        <p style={{ color: C.mu }}>The loaded ruleset defining cognitive, structural, and institutional vulnerabilities. Contains definitions, mechanisms, structural examples, and regex signatures.</p>
                    </div>

                    <h3 style={{ fontSize: 14, color: C.ac, marginTop: 32, marginBottom: 12 }}>Data Handling</h3>
                    <p style={{ color: C.mu, marginBottom: 24 }}>
                        <strong>Local-First:</strong> All API keys, workbench notes, benchmark results, and session logs are stored strictly within this browser instance using IndexedDB. Clearing browser site data will permanently delete this information.
                    </p>
                </div>
            </div>
        </div>
    );
}
