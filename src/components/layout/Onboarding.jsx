import React from 'react';
import { C, ff, VER } from '../../lib/constants';
import { Btn } from '../shared/UI';

export default function Onboarding({ onEnter, onDocs }) {
    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
            zIndex: 200, display: 'flex', alignItems: 'center',
            justifyContent: 'center', backdropFilter: 'blur(8px)'
        }}>
            <div style={{
                background: C.sf, border: `1px solid ${C.bd}`,
                borderRadius: 8, padding: '48px 40px', maxWidth: 480, textAlign: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: 6,
                        background: `linear-gradient(135deg,${C.cr}18,${C.ac}18)`,
                        border: `1px solid ${C.cr}28`, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontFamily: ff, fontSize: 14, fontWeight: 700, color: C.cr
                    }}>E</div>
                    <span style={{ fontFamily: ff, fontSize: 18, fontWeight: 600, color: C.br, letterSpacing: '-.02em' }}>Expositor</span>
                </div>
                <div style={{ fontFamily: ff, fontSize: 9, color: C.mu, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 24 }}>
                    AI Auditing Suite v{VER}
                </div>
                <div style={{ fontFamily: ff, fontSize: 11, color: C.mu, lineHeight: 1.8, marginBottom: 32, textAlign: 'left' }}>
                    <p style={{ marginBottom: 12 }}>Forensic conversation analysis, structured benchmark testing, pattern taxonomy reference, and direct access to AI audit agents.</p>
                    <p style={{ marginBottom: 12 }}>Built on the Cognitae Framework. Designed for AI safety researchers, government regulators, and investigative journalists.</p>
                    <p style={{ color: C.dm }}>Contact: eliotgilzene87@gmail.com</p>
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    <Btn onClick={onEnter}>Enter Expositor</Btn>
                    <Btn onClick={onDocs} outline>Documentation</Btn>
                </div>
            </div>
        </div>
    );
}
