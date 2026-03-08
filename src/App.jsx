import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import SanctumShell from './sanctum/components/layout/SanctumShell';
import CognitaeShell from './cognitae/components/layout/CognitaeShell';
import GamingShell from './gaming/components/layout/GamingShell';

const LandingPage = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#08080a',
      color: '#cccccc',
      fontFamily: '"IBM Plex Mono", monospace'
    }}>
      <h1 style={{ fontWeight: 300, marginBottom: '2rem', letterSpacing: '0.1em' }}>COGNITAE FRAMEWORK</h1>
      <div style={{ display: 'flex', gap: '2rem' }}>
        <Link
          to="/expositor"
          style={{
            padding: '1rem 2rem',
            border: '1px solid #333',
            color: '#ccc',
            textDecoration: 'none',
            transition: 'all 0.2s',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => { e.currentTarget.style.borderColor = '#666'; e.currentTarget.style.color = '#fff'; }}
          onMouseOut={(e) => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#ccc'; }}
        >
          [ Boot EXPOSITOR ]
        </Link>
        <Link
          to="/sanctum"
          style={{
            padding: '1rem 2rem',
            border: '1px solid #333',
            color: '#ccc',
            textDecoration: 'none',
            transition: 'all 0.2s',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => { e.currentTarget.style.borderColor = '#666'; e.currentTarget.style.color = '#fff'; }}
          onMouseOut={(e) => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#ccc'; }}
        >
          [ Boot SANCTUM_OS ]
        </Link>
        <Link
          to="/cognitae"
          style={{
            padding: '1rem 2rem',
            border: '1px solid #333',
            color: '#ccc',
            textDecoration: 'none',
            transition: 'all 0.2s',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => { e.currentTarget.style.borderColor = '#666'; e.currentTarget.style.color = '#fff'; }}
          onMouseOut={(e) => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#ccc'; }}
        >
          [ Boot COGNITAE ]
        </Link>
        <Link
          to="/gaming"
          style={{
            padding: '1rem 2rem',
            border: '1px solid #333',
            color: '#ccc',
            textDecoration: 'none',
            transition: 'all 0.2s',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => { e.currentTarget.style.borderColor = '#666'; e.currentTarget.style.color = '#fff'; }}
          onMouseOut={(e) => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#ccc'; }}
        >
          [ Boot GAMING ]
        </Link>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/expositor/*" element={<AppShell />} />
        <Route path="/sanctum/*" element={<SanctumShell />} />
        <Route path="/cognitae/*" element={<CognitaeShell />} />
        <Route path="/gaming/*" element={<GamingShell />} />
      </Routes>
    </Router>
  );
};

export default App;
