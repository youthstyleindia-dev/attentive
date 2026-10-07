# Workflow 25 — HUD Appearance & Transparency Control

## Overview
This workflow describes the user-controlled styling, opacity, blur intensity, and theme customizations for the in-page Head-Up Display (HUD) overlay and the toolbar popup interface.

## User Controls
1. **HUD Transparency (0–100%)**:
   - Computes dynamic background alpha: `bgAlpha = (1 - transparency / 100) * 0.85 + 0.05`
   - Dynamically updates `--at-bg` CSS custom property on the Shadow DOM root `#atentiv-v3`.
   - Real-time live preview box allows instantaneous feedback before closing Settings.

2. **Backdrop Blur Intensity (0–48px)**:
   - Sets `--at-blur` CSS custom property.
   - Applies hardware-accelerated `-webkit-backdrop-filter: blur(...)` and `backdrop-filter: blur(...)`.

3. **Accent Color Palette**:
   - 7 user-selectable colors: Purple (`#7c3aed`), Blue (`#2563eb`), Green (`#059669`), Red (`#dc2626`), Amber (`#d97706`), Pink (`#db2777`), Cyan (`#0891b2`).
   - Updates `--at-purple` and `--at-purple-l` globally across rings, badges, highlights, and active nav items.

4. **HUD Size & Positioning**:
   - Size presets: Compact (300px), Default (380px), Wide (460px).
   - Anchored positioning: Right, Left, Top-Right, Top-Left, Bottom-Right, Bottom-Left.

## Persistence
- All styling preferences are saved locally to `chrome.storage.local` under the key `atentiv_hud_prefs`.
- Zero cloud transmission or external telemetry.
- Preferences are rehydrated on content script injection and applied instantaneously.
