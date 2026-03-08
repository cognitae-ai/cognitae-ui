import React from 'react';
import { ff, C } from '../../lib/constants';

export function Badge({ text, color }) {
    return (
        <span style={{
            display: 'inline-flex', padding: '1px 6px', borderRadius: 3,
            fontSize: 9, fontWeight: 600, fontFamily: ff, letterSpacing: '.06em',
            background: color + '14', color, border: `1px solid ${color}28`
        }}>
            {text}
        </span>
    );
}

export function Btn({ children, onClick, color = C.ac, outline, disabled, small }) {
    const s = outline
        ? {
            padding: small ? '4px 8px' : '7px 14px', borderRadius: 4, border: `1px solid ${C.dm}`,
            background: 'transparent', color: C.mu, fontFamily: ff, fontSize: small ? 9 : 10,
            cursor: disabled ? 'default' : 'pointer', opacity: disabled ? .4 : 1
        }
        : {
            padding: small ? '4px 8px' : '7px 14px', borderRadius: 4, border: 'none',
            background: color, color: '#fff', fontFamily: ff, fontSize: small ? 9 : 10,
            fontWeight: 600, cursor: disabled ? 'default' : 'pointer', opacity: disabled ? .4 : 1,
            letterSpacing: '.02em'
        };
    return <button onClick={disabled ? undefined : onClick} style={s}>{children}</button>;
}
