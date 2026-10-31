import matplotlib.pyplot as plt
import matplotlib.patches as patches

fig, ax = plt.subplots(figsize=(11, 4.2), facecolor='#ffffff')
ax.set_facecolor('#ffffff')
ax.set_xlim(0, 11)
ax.set_ylim(0, 4.2)
ax.axis('off')

# Box styles
box_color = '#ebf8ff'
border_color = '#3182ce'
txt_color = '#2b6cb0'

boxes = [
    (0.4, 1.2, 2.0, 1.8, "1. Browser Event\nLayer\n\nchrome.tabs.onUpdated\n(audible: true / false)"),
    (2.8, 1.2, 2.0, 1.8, "2. Platform\nDetection\n\nAudioClassifier\n(17+ Media Hosts)"),
    (5.2, 1.2, 2.0, 1.8, "3. Local ML\nInference\n\nfastText WASM\n(13 Categories)"),
    (7.6, 1.2, 2.0, 1.8, "4. Distraction\nScoring (0-100)\n\nCognitive Load &\nAcoustic Modifiers"),
    (10.0 - 0.2, 1.2, 1.8, 1.8, "5. Storage &\nPersistence\n\nDexie IndexedDB\n(tab_sessions)")
]

for x, y, w, h, t in boxes:
    rect = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.1",
                                  edgecolor=border_color, facecolor=box_color, linewidth=1.5)
    ax.add_patch(rect)
    ax.text(x + w/2, y + h/2, t, ha='center', va='center', fontsize=8.5, fontweight='bold', color=txt_color)

# Arrows
arrow_style = dict(arrowstyle="->", color="#4a5568", lw=2, mutation_scale=15)
ax.annotate("", xy=(2.7, 2.1), xytext=(2.4, 2.1), arrowprops=arrow_style)
ax.annotate("", xy=(5.1, 2.1), xytext=(4.8, 2.1), arrowprops=arrow_style)
ax.annotate("", xy=(7.5, 2.1), xytext=(7.2, 2.1), arrowprops=arrow_style)
ax.annotate("", xy=(9.7, 2.1), xytext=(9.5, 2.1), arrowprops=arrow_style)

# Header
ax.text(5.5, 3.8, "Atentiv Audio Classification & Distraction Subsystem (Experiment 9 Pipeline)",
        ha='center', va='center', fontsize=12, fontweight='bold', color='#1a365d')

plt.tight_layout()
plt.savefig('atentiv_audio_architecture.png', dpi=200)
print("Rendered atentiv_audio_architecture.png successfully")
