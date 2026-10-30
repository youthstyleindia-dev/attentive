import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

export const AtentivDemoVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene timings (in frames @ 30fps):
  // 0 - 120: Hero Intro
  // 120 - 270: Browser + Live WASM Classification + Popup (index.html)
  // 270 - 405: Side Panel Navigation (sidepanel.html)
  // 405 - 600: Analytics Dashboard (dashboard.html) & Options (options.html)

  const introOpacity = interpolate(frame, [0, 20, 105, 120], [0, 1, 1, 0], {
    extrapolateRight: 'clamp',
  });

  const browserScale = spring({
    frame: Math.max(0, frame - 120),
    fps,
    config: { damping: 16, stiffness: 110 },
  });

  const popupProgress = spring({
    frame: Math.max(0, frame - 155),
    fps,
    config: { damping: 14 },
  });
  const popupHide = interpolate(frame, [255, 270], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const sidepanelSlide = spring({
    frame: Math.max(0, frame - 270),
    fps,
    config: { damping: 18 },
  });

  const dashboardFade = interpolate(frame, [405, 425], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Animated Cursor coordinates across navigation landmarks
  const cursorX = interpolate(
    frame,
    [120, 155, 245, 275, 390, 415, 500],
    [960, 1740, 1580, 1520, 1380, 1380, 1480],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const cursorY = interpolate(
    frame,
    [120, 155, 245, 275, 390, 415, 500],
    [540, 125, 480, 360, 125, 125, 660],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const activeSurface =
    frame < 270
      ? 'Popup (index.html) & Live FastText WASM Classification'
      : frame < 405
      ? 'Side Panel Companion (sidepanel.html)'
      : frame < 495
      ? 'Productivity Analytics (dashboard.html)'
      : 'Model & Rule Settings (options.html)';

  return (
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(circle at 20% 20%, #1e1b4b 0%, #090d16 55%, #05070e 100%)',
        color: '#f8fafc',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* SCENE 1: Hero Intro */}
      <Sequence from={0} durationInFrames={120}>
        <AbsoluteFill
          style={{
            opacity: introOpacity,
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            padding: 120,
          }}
        >
          <div
            style={{
              padding: '12px 28px',
              borderRadius: 999,
              background: 'rgba(99, 102, 241, 0.18)',
              border: '1px solid rgba(129, 140, 248, 0.45)',
              color: '#a5b4fc',
              fontSize: 24,
              fontWeight: 600,
              marginBottom: 28,
            }}
          >
            ⚡ On-Device FastText WASM Browser Extension
          </div>
          <h1
            style={{
              fontSize: 102,
              fontWeight: 800,
              margin: 0,
              background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 50%, #38bdf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Atentiv Extension
          </h1>
          <p style={{ fontSize: 34, color: '#94a3b8', maxWidth: 1050, marginTop: 24 }}>
            Full navigation & animated use case: instant local page categorization with
            fastText.common.wasm and atentiv-page-category.ftz.
          </p>
        </AbsoluteFill>
      </Sequence>

      {/* SCENES 2-4: Interactive Browser Walkthrough */}
      <Sequence from={120} durationInFrames={480}>
        <AbsoluteFill style={{ padding: '80px 110px' }}>
          <div
            style={{
              width: '100%',
              height: '100%',
              background: '#0f172a',
              borderRadius: 24,
              border: '1px solid rgba(148,163,184,0.22)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              transform: `scale(${browserScale})`,
              boxShadow: '0 40px 100px rgba(0,0,0,0.65)',
            }}
          >
            {/* Browser Top Bar */}
            <div
              style={{
                height: 72,
                background: '#1e293b',
                display: 'flex',
                alignItems: 'center',
                padding: '0 28px',
                gap: 20,
              }}
            >
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ width: 14, height: 14, borderRadius: 7, background: '#ef4444' }} />
                <div style={{ width: 14, height: 14, borderRadius: 7, background: '#f59e0b' }} />
                <div style={{ width: 14, height: 14, borderRadius: 7, background: '#10b981' }} />
              </div>
              <div
                style={{
                  flex: 1,
                  height: 44,
                  background: '#0f172a',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 18px',
                  fontFamily: 'monospace',
                  fontSize: 20,
                  color: '#cbd5e1',
                }}
              >
                https://developer.chrome.com/docs/extensions/mv3
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                {['index.html', 'sidepanel.html', 'dashboard.html', 'options.html'].map(
                  (tab, idx) => {
                    const isActive =
                      (idx === 0 && frame < 270) ||
                      (idx === 1 && frame >= 270 && frame < 405) ||
                      (idx === 2 && frame >= 405 && frame < 495) ||
                      (idx === 3 && frame >= 495);
                    return (
                      <div
                        key={tab}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 8,
                          fontSize: 16,
                          fontWeight: 600,
                          background: isActive ? '#4f46e5' : 'rgba(15,23,42,0.6)',
                          color: isActive ? '#fff' : '#94a3b8',
                        }}
                      >
                        {tab}
                      </div>
                    );
                  }
                )}
              </div>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: 22,
                }}
              >
                A
              </div>
            </div>

            {/* Browser Viewport */}
            <div style={{ flex: 1, position: 'relative', display: 'flex', overflow: 'hidden' }}>
              {/* Main Webpage + WASM Classification Banner */}
              <div style={{ flex: 1, padding: 44, display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div
                  style={{
                    padding: '20px 28px',
                    borderRadius: 16,
                    background: 'rgba(16, 185, 129, 0.14)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ color: '#34d399', fontSize: 16, fontWeight: 700 }}>
                      content.js → background.js → wasm/fastText.common.wasm
                    </div>
                    <div style={{ fontSize: 26, fontWeight: 700, marginTop: 4 }}>
                      Model: models/atentiv-page-category.ftz
                    </div>
                  </div>
                  <div
                    style={{
                      padding: '12px 22px',
                      background: '#059669',
                      borderRadius: 12,
                      fontSize: 20,
                      fontWeight: 700,
                    }}
                  >
                    Software Engineering (98.4%)
                  </div>
                </div>

                <div
                  style={{
                    flex: 1,
                    background: '#1e293b',
                    borderRadius: 18,
                    padding: 32,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <h2 style={{ fontSize: 36, margin: 0 }}>
                      Real-Time Local Page Categorization Use Case
                    </h2>
                    <p style={{ fontSize: 22, color: '#94a3b8', lineHeight: 1.6, marginTop: 16 }}>
                      As the user navigates between tabs, Atentiv classifies page content on-device
                      and updates focus metrics across the Popup, Side Panel, and Analytics Dashboard.
                    </p>
                  </div>
                </div>
              </div>

              {/* Popup (index.html) */}
              {frame >= 155 && frame < 275 && (
                <div
                  style={{
                    position: 'absolute',
                    top: 18,
                    right: 24,
                    width: 380,
                    background: '#1e293b',
                    borderRadius: 20,
                    border: '1px solid rgba(129,140,248,0.45)',
                    padding: 24,
                    opacity: popupProgress * popupHide,
                    transform: `translateY(${(1 - popupProgress) * -20}px)`,
                    boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong style={{ fontSize: 22 }}>Atentiv Popup</strong>
                    <span style={{ color: '#818cf8', fontFamily: 'monospace' }}>index.html</span>
                  </div>
                  <div
                    style={{
                      marginTop: 16,
                      padding: 18,
                      background: '#0f172a',
                      borderRadius: 14,
                    }}
                  >
                    <div style={{ color: '#94a3b8', fontSize: 16 }}>Focus Score</div>
                    <div style={{ color: '#38bdf8', fontSize: 44, fontWeight: 800 }}>94 / 100</div>
                  </div>
                  <div
                    style={{
                      marginTop: 16,
                      padding: 12,
                      background: '#4f46e5',
                      borderRadius: 10,
                      textAlign: 'center',
                      fontWeight: 700,
                    }}
                  >
                    Open Side Panel →
                  </div>
                </div>
              )}

              {/* Side Panel (sidepanel.html) */}
              {frame >= 270 && (
                <div
                  style={{
                    width: 420 * sidepanelSlide,
                    opacity: sidepanelSlide,
                    background: '#172033',
                    borderLeft: '1px solid rgba(148,163,184,0.2)',
                    padding: 28,
                  }}
                >
                  <div style={{ fontSize: 24, fontWeight: 700 }}>Side Panel (sidepanel.html)</div>
                  <div
                    style={{
                      marginTop: 20,
                      padding: 18,
                      background: '#0f172a',
                      borderRadius: 14,
                      fontSize: 18,
                      lineHeight: 2,
                    }}
                  >
                    <div>✅ developer.chrome.com — Dev</div>
                    <div>✅ github.com — Code Repo</div>
                    <div>✅ arxiv.org — AI Research</div>
                  </div>
                </div>
              )}

              {/* Dashboard & Options Overlay (dashboard.html + options.html) */}
              {frame >= 405 && (
                <AbsoluteFill
                  style={{
                    background: '#0b1120',
                    opacity: dashboardFade,
                    padding: 40,
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr',
                    gap: 24,
                  }}
                >
                  <div
                    style={{
                      background: '#1e293b',
                      borderRadius: 18,
                      padding: 32,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 20,
                    }}
                  >
                    <h3 style={{ fontSize: 30, margin: 0 }}>
                      Analytics Dashboard (dashboard.html)
                    </h3>
                    {[
                      { label: 'Software Engineering', pct: 78, color: '#38bdf8' },
                      { label: 'AI & Documentation', pct: 62, color: '#818cf8' },
                      { label: 'Deep Productivity', pct: 45, color: '#34d399' },
                    ].map((row, i) => {
                      const barAnim = spring({
                        frame: Math.max(0, frame - 415 - i * 6),
                        fps,
                      });
                      return (
                        <div key={row.label}>
                          <div style={{ fontSize: 20, marginBottom: 8 }}>{row.label}</div>
                          <div
                            style={{
                              height: 24,
                              background: '#0f172a',
                              borderRadius: 999,
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${row.pct * barAnim}%`,
                                height: '100%',
                                background: row.color,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div
                    style={{
                      background: '#1e293b',
                      borderRadius: 18,
                      padding: 32,
                      border:
                        frame >= 495
                          ? '2px solid #38bdf8'
                          : '1px solid rgba(148,163,184,0.2)',
                    }}
                  >
                    <h3 style={{ fontSize: 26, margin: 0 }}>Options (options.html)</h3>
                    <p style={{ color: '#94a3b8', fontSize: 18, marginTop: 12 }}>
                      Model Manifest: models/model_manifest.json
                    </p>
                    <div
                      style={{
                        marginTop: 20,
                        padding: 14,
                        background: '#0f172a',
                        borderRadius: 10,
                        color: '#4ade80',
                        fontWeight: 700,
                      }}
                    >
                      ✓ fastText.common.wasm Active
                    </div>
                  </div>
                </AbsoluteFill>
              )}
            </div>
          </div>

          {/* Step Caption */}
          <div
            style={{
              position: 'absolute',
              bottom: 24,
              left: 110,
              padding: '12px 24px',
              background: 'rgba(15,23,42,0.92)',
              border: '1px solid rgba(99,102,241,0.45)',
              borderRadius: 12,
              fontSize: 22,
              fontWeight: 600,
            }}
          >
            {activeSurface}
          </div>

          {/* Animated Cursor */}
          <svg
            width="36"
            height="36"
            viewBox="0 0 36 36"
            style={{
              position: 'absolute',
              left: cursorX,
              top: cursorY,
              pointerEvents: 'none',
            }}
          >
            <path
              d="M6 4L29 16L18 19.5L13.5 30L6 4Z"
              fill="#38bdf8"
              stroke="#ffffff"
              strokeWidth="2.5"
            />
          </svg>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
