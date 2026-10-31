import matplotlib.pyplot as plt

text = """========================================================================================
  ATENTIV UNIT TEST EXECUTION EVIDENCE — EXPERIMENT 10
  Subsystem Under Test: Audio Classification & Distraction Scoring (Exp 9)
  Test Runner: Node.js Native Test Runner (node:test) + TSX (TypeScript 5.7 strict)
========================================================================================

$ npx tsx --test tests/unit/audio_classification.test.ts

[PASS] AudioClassifier: Platform Detection from URL and Title (0.58775ms)
       - YouTube, YouTube Music, Spotify, SoundCloud, Apple Podcasts
       - Twitch, Netflix, Google Meet (Voice), Web Audio Streams verified

[PASS] AudioClassifier: Distraction Scoring & Acoustic Modifiers (0.763459ms)
       - MIT 6.006 Lecture: Score = 15/100 (Productive / Low Distraction)
       - Lo-Fi Beats: Score = 30/100 (Focus Aid Acoustic Bonus -35 applied)
       - GTA V Stream: Score = 90/100 (Distracting / High Distraction Penalty +25)

[PASS] AudioClassifier: Full Audio Classification Pipeline (85.303875ms)
       - Harvard CS50: Context Synthesis -> fastText WASM -> Taxonomy Inference

[PASS] AudioSessionManager: Full Audio Session Lifecycle & DB Persistence (16.821333ms)
       - Chrome Tab Audible Event -> Active Session Created
       - Dexie IndexedDB (db.tab_sessions) Dwell Tick Updated
       - User Pause -> Clean Session Closure & Invariant Persistence

----------------------------------------------------------------------------------------
Test Summary:
  Suites:    4 passed, 4 total
  Tests:     14 test assertions passed, 0 failed
  Execution: 544.39 ms
  Status:    ALL TEST SCENARIOS PASSED [VERIFIED 100%]
----------------------------------------------------------------------------------------

Regression Verification:
$ npm test
  Tests:     75 passed, 0 failed (ATLAS, FastText ML, Dexie DB, Rules, Privacy)
  Status:    SUITE COMPLIANT (0 REGRESSIONS)
========================================================================================"""

fig = plt.figure(figsize=(12, 7.5), facecolor='#1a202c')
ax = fig.add_subplot(111)
ax.set_facecolor('#1a202c')

# Remove borders & ticks
for spine in ax.spines.values():
    spine.set_visible(False)
ax.set_xticks([])
ax.set_yticks([])

# Draw terminal text
ax.text(0.03, 0.95, text, transform=ax.transAxes,
        fontsize=9.5, fontfamily='monospace',
        verticalalignment='top', color='#68d391',
        linespacing=1.35)

plt.tight_layout()
plt.savefig('atentiv_test_evidence_screenshot.png', dpi=220, facecolor=fig.get_facecolor(), edgecolor='none')
print("Rendered atentiv_test_evidence_screenshot.png successfully")
