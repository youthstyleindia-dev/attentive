import subprocess
import os
import numpy as np
from scipy.io import wavfile

sample_rate = 44100
total_duration = 98.0  # seconds
total_samples = int(sample_rate * total_duration)

clips_spec = [
    {
        "id": "v1_intro",
        "start": 0.5,
        "rate": 180,
        "text": "Welcome to Atentiv. The privacy-first, on-device A.I. focus companion designed for intentional web browsing."
    },
    {
        "id": "v2_hud",
        "start": 7.5,
        "rate": 180,
        "text": "As you browse, Atentiv injects a sleek glass focus pill with real-time scoring in an isolated shadow DOM, completely free from page styling conflicts."
    },
    {
        "id": "v3_compact",
        "start": 16.0,
        "rate": 180,
        "text": "A single click expands the Compact Glass HUD, displaying active dwell time, a live focus gauge, and instant focus toggles."
    },
    {
        "id": "v4_full_hud",
        "start": 23.5,
        "rate": 180,
        "text": "Expanding further reveals the full three-column cockpit, detailing detected workstreams, attention metrics, and open tabs grouped in real time."
    },
    {
        "id": "v5_popup",
        "start": 32.0,
        "rate": 180,
        "text": "From your Chrome toolbar or docked side panel, Atentiv delivers continuous focus intelligence without blocking your active work."
    },
    {
        "id": "v6_dashboard",
        "start": 40.0,
        "rate": 180,
        "text": "In the full analytics dashboard, explore scenic check-ins, focus balance dials, and interactive attention heatmaps."
    },
    {
        "id": "v7_workstream_tabs",
        "start": 48.5,
        "rate": 180,
        "text": "In the right panel, open tabs are automatically clustered into semantic workstreams. Click Save to capture any workstream into a persistent workspace snapshot, or click Open to restore all tabs in one click."
    },
    {
        "id": "v8_audio_verification",
        "start": 61.5,
        "rate": 180,
        "text": "With on-device FastText audio classification, Atentiv detects audible tabs, separating educational lectures from distracting gaming streams. Educational speech suppresses idle timeouts and awards a focus bonus, while high-tempo entertainment flags multitasking fragmentation."
    },
    {
        "id": "v9_settings",
        "start": 78.0,
        "rate": 180,
        "text": "Customize tracking rules, distraction thresholds, and domain exclusions with complete confidence. All embeddings, tokens, and history are stored locally in IndexedDB with zero cloud telemetry."
    },
    {
        "id": "v10_outro",
        "start": 89.0,
        "rate": 175,
        "text": "One hundred percent on-device machine learning, local storage, and zero data leaks. Atentiv: browse mindfully."
    }
]

out_dir = "scripts/demo_video/voice_clips"
os.makedirs(out_dir, exist_ok=True)

voice_master = np.zeros(total_samples, dtype=np.float32)

print("--- Generating Samantha Voice Narration Clips ---")
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
    voice_master[start_idx:end_idx] += data_float[:actual_len] * 0.95

# Load background music if present
bg_music_path = "scripts/demo_video/bg_music.wav"
bg_master = np.zeros(total_samples, dtype=np.float32)
if os.path.exists(bg_music_path):
    print("\n--- Loading Background Music Track ---")
    sr, bg_data = wavfile.read(bg_music_path)
    if bg_data.ndim > 1:
        bg_data = bg_data.mean(axis=1)
    if bg_data.dtype == np.int16:
        bg_float = bg_data.astype(np.float32) / 32768.0
    else:
        bg_float = bg_data.astype(np.float32)
    
    # Loop or slice to total_samples
    repeats = int(np.ceil(total_samples / len(bg_float)))
    tiled_bg = np.tile(bg_float, repeats)[:total_samples]
    
    # Duck background music under voice narration
    voice_envelope = np.abs(voice_master)
    # Simple moving average for envelope smoothing
    window_size = int(sample_rate * 0.25)
    kernel = np.ones(window_size) / window_size
    smoothed_env = np.convolve(voice_envelope, kernel, mode="same")
    
    ducking_factor = 1.0 - np.clip(smoothed_env * 2.5, 0.0, 0.70)
    bg_master = tiled_bg * 0.16 * ducking_factor

# Combined mix
print("\n--- Mixing Master Audio Soundtrack ---")
mixed = voice_master + bg_master
# Soft limiter to prevent clipping
peak = np.max(np.abs(mixed))
if peak > 0.95:
    mixed = mixed / peak * 0.95

output_wav = "scripts/demo_video/final_demo_audio.wav"
wavfile.write(output_wav, sample_rate, (mixed * 32767.0).astype(np.int16))
print(f"✓ Master Soundtrack written successfully: {output_wav} ({total_duration}s)")
