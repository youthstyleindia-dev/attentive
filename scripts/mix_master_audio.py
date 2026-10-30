import subprocess
import os
import numpy as np
from scipy.io import wavfile

sample_rate = 44100
total_duration = 89.4  # exact duration of video
total_samples = int(sample_rate * total_duration)

clips_spec = [
    {
        "id": "v1_intro",
        "start": 0.4,
        "rate": 185,
        "text": "Welcome to Atentiv. The privacy-first A.I. focus assistant."
    },
    {
        "id": "v2_hud",
        "start": 4.6,
        "rate": 185,
        "text": "As you browse, Atentiv injects a sleek glass focus pill with real-time scoring in an isolated shadow root."
    },
    {
        "id": "v3_compact",
        "start": 13.0,
        "rate": 185,
        "text": "A single click expands the Compact Glass HUD, displaying active dwell time, a live focus gauge, and session toggles."
    },
    {
        "id": "v4_full_hud",
        "start": 21.2,
        "rate": 185,
        "text": "Expanding further reveals the full three-column cockpit, detailing active workstreams, metrics, and domain rules."
    },
    {
        "id": "v5_popup",
        "start": 30.5,
        "rate": 185,
        "text": "From your Chrome toolbar, the Atentiv popup gives an instant glance at your daily focus score and current workstream."
    },
    {
        "id": "v6_sidepanel",
        "start": 38.5,
        "rate": 185,
        "text": "For continuous multi-tasking, the Chrome Side Panel docks right beside your tab, tracking productivity without blocking your work."
    },
    {
        "id": "v7_dash_pt1",
        "start": 47.0,
        "rate": 185,
        "text": "In the full-screen analytics dashboard, explore scenic morning check-ins, executive metrics, and an interactive workstream intelligence map."
    },
    {
        "id": "v8_dash_pt2",
        "start": 56.5,
        "rate": 185,
        "text": "Inspect deep attention heatmaps, custom domain rules, explainable A.I. decision traces, and one-click workspace resume."
    },
    {
        "id": "v9_audio",
        "start": 70.0,
        "rate": 185,
        "text": "With on-device FastText audio classification, Atentiv detects background sound, differentiating focus lectures from distracting gaming streams."
    },
    {
        "id": "v10_outro",
        "start": 80.0,
        "rate": 180,
        "text": "One hundred percent on-device machine learning, local storage, and zero cloud telemetry. Atentiv: browse mindfully."
    }
]

out_dir = "scripts/demo_video/voice_clips"
os.makedirs(out_dir, exist_ok=True)

voice_master = np.zeros(total_samples, dtype=np.float32)

for clip in clips_spec:
    aiff_path = os.path.join(out_dir, f"{clip['id']}.aiff")
    wav_path = os.path.join(out_dir, f"{clip['id']}.wav")
    
    cmd_say = ["say", "-v", "Samantha", "-r", str(clip["rate"]), clip["text"], "-o", aiff_path]
    subprocess.run(cmd_say, check=True)
    
    cmd_conv = ["ffmpeg", "-y", "-i", aiff_path, "-ar", str(sample_rate), "-ac", "1", wav_path]
    subprocess.run(cmd_conv, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    
    sr, data = wavfile.read(wav_path)
    if data.dtype == np.int16:
        data_float = data.astype(np.float32) / 32768.0
    else:
        data_float = data.astype(np.float32)
    
    start_idx = int(clip["start"] * sample_rate)
    end_idx = min(total_samples, start_idx + len(data_float))
    actual_len = end_idx - start_idx
    
    dur = actual_len / sample_rate
    print(f"[{clip['id']}] Placed at {clip['start']:4.1f}s - {clip['start']+dur:4.1f}s ({dur:3.1f}s)")
    
    voice_master[start_idx:end_idx] += data_float[:actual_len] * 0.92

# Load background music
bg_path = "scripts/demo_video/bg_music.wav"
sr_bg, bg_data = wavfile.read(bg_path)
if bg_data.dtype == np.int16:
    bg_float = bg_data.astype(np.float32) / 32768.0
else:
    bg_float = bg_data.astype(np.float32)

if len(bg_float) < total_samples:
    bg_full = np.pad(bg_float, (0, total_samples - len(bg_float)))
else:
    bg_full = bg_float[:total_samples]

# Apply gentle sidechain / ducking
voice_energy = np.abs(voice_master)
window_size = int(0.25 * sample_rate)
kernel = np.ones(window_size) / window_size
smoothed_energy = np.convolve(voice_energy, kernel, mode='same')
duck_factor = 0.35 - 0.20 * np.clip(smoothed_energy * 4.0, 0.0, 1.0)
bg_ducked = bg_full * duck_factor

# Master Mix
final_mix = voice_master + bg_ducked

# Normalize to -0.8 dB peak
peak = np.max(np.abs(final_mix))
if peak > 0:
    final_mix = final_mix / peak * 0.91

master_wav = "scripts/demo_video/final_master_soundtrack.wav"
wavfile.write(master_wav, sample_rate, (final_mix * 32767).astype(np.int16))
print(f"\n✓ Master Soundtrack rendered without any overlap: {master_wav} ({total_duration}s)")
