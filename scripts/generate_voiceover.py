import subprocess
import os

clips = [
    {
        "id": "v1_intro",
        "start": 0.5,
        "text": "Welcome to Atentiv. The privacy-first, on-device A.I. focus assistant for modern web browsing."
    },
    {
        "id": "v2_hud",
        "start": 5.2,
        "text": "As you browse, Atentiv injects a sleek glass focus pill with real-time scoring, rendered in an isolated shadow root with zero page interference."
    },
    {
        "id": "v3_compact",
        "start": 13.5,
        "text": "A single click expands the Compact Glass HUD, displaying active dwell time, a live focus gauge, and instant session toggles."
    },
    {
        "id": "v4_full_hud",
        "start": 21.5,
        "text": "Expanding further reveals the full three-column cockpit, detailing active workstreams, productivity dials, and domain rules."
    },
    {
        "id": "v5_popup",
        "start": 30.5,
        "text": "From your Chrome toolbar, the Atentiv popup gives an instant glance at your daily focus quotient and current workstream."
    },
    {
        "id": "v6_sidepanel",
        "start": 38.5,
        "text": "For continuous multi-tasking, the Chrome Side Panel docks right beside your tab, tracking productivity without blocking your work."
    },
    {
        "id": "v7_dash_pt1",
        "start": 46.5,
        "text": "In the full-screen analytics dashboard, explore scenic morning check-ins, executive metrics, and an interactive workstream intelligence map."
    },
    {
        "id": "v8_dash_pt2",
        "start": 58.5,
        "text": "Inspect deep attention heatmaps, custom domain rules, explainable A.I. decision traces, and one-click workspace resume."
    },
    {
        "id": "v9_audio",
        "start": 71.5,
        "text": "With on-device FastText audio classification, Atentiv detects background audio, separating educational lectures from distracting gaming streams."
    },
    {
        "id": "v10_outro",
        "start": 80.5,
        "text": "One hundred percent on-device machine learning, local storage, and zero cloud telemetry. Atentiv: browse mindfully."
    }
]

out_dir = "scripts/demo_video/voice_clips"
os.makedirs(out_dir, exist_ok=True)

for clip in clips:
    aiff_path = os.path.join(out_dir, f"{clip['id']}.aiff")
    wav_path = os.path.join(out_dir, f"{clip['id']}.wav")
    cmd_say = ["say", "-v", "Samantha", "-r", "175", clip["text"], "-o", aiff_path]
    subprocess.run(cmd_say, check=True)
    cmd_conv = ["ffmpeg", "-y", "-i", aiff_path, "-ar", "44100", "-ac", "1", wav_path]
    subprocess.run(cmd_conv, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    
    # Check duration with ffprobe
    res = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", wav_path], capture_output=True, text=True)
    dur = float(res.stdout.strip())
    print(f"[{clip['id']}] Start: {clip['start']:4.1f}s | Duration: {dur:4.2f}s | Text: {clip['text'][:50]}...")

print("\nAll voice clips generated successfully!")
