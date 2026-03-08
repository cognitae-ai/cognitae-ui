# Cognitae UI

This is the unified frontend interface for the Cognitae Framework. It hosts four distinct environments designed for adversarial AI auditing, philosophical conversation, and specialized system design.

## The Environments

1. **Expositor**: The core Adversarial Audit Ring. A rigid, local-first environment designed to rigorously test AI models against behavioral and safety protocols (like Sycophancy or Therapist Drift). Features a Dynamic Benchmark Engine powered by local or remote LLMs to dynamically generate adversarial follow-up prompts based on model responses.
2. **SanctumOS**: A calm, split-panel interface designed for deep philosophical reflection ("Quiet Intensity"). Features built-in session recording, notes sidebars, and custom conversation rating systems.
3. **Cognitae**: A Gemini-powered intelligence instance utilizing the Sanctum split-panel design, instructed with the core "Cognitae" persona for structured analytical synthesis.
4. **Cognitae_Gaming**: A Gemini-powered environment focused on game design architecture and the MDA framework, sharing the UI philosophy of Cognitae.

## Tech Stack
- **React + Vite**: Fast, minimal frontend tooling.
- **Dexie.js (IndexedDB)**: Robust, local-first storage. `ExpositorDB`, `SanctumDB`, `CognitaeDB`, and `GamingDB` keep context entirely on the user's machine without cross-contamination.
- **React Router Dom**: Handles unified navigation from the main portal.
- **@google/genai**: Official Gemini SDK powering the Cognitae and Gaming instances.

## Philosophy
*   **Quiet Intensity**: Minimalist aesthetics (IBM Plex Mono, Cormorant Garamond), absence of emojis, raw text focus.
*   **Receipts over PR**: Logs and interactions are recorded meticulously. We verify through adversarial testing, not claims.

## Development

```bash
npm install
npm run dev
```

Build for production:
```bash
npm run build
```
