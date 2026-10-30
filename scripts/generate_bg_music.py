import numpy as np
from scipy.io import wavfile

sample_rate = 44100
duration = 90.0  # seconds
t = np.linspace(0, duration, int(sample_rate * duration), endpoint=False)

# Chords: Dm9, G13, Cmaj9, Am9 in Hz
chords = [
    [146.83, 174.61, 220.00, 261.63, 329.63],  # Dm9
    [98.00,  123.47, 174.61, 220.00, 329.63],  # G13
    [130.81, 164.81, 196.00, 246.94, 293.66],  # Cmaj9
    [110.00, 130.81, 164.81, 196.00, 246.94],  # Am9
]

chord_duration = 4.5  # seconds per chord
total_chords = int(np.ceil(duration / chord_duration))

audio = np.zeros(len(t), dtype=np.float32)

for i in range(total_chords):
    chord = chords[i % len(chords)]
    start_time = i * chord_duration
    start_idx = int(start_time * sample_rate)
    chord_len = int(chord_duration * sample_rate)
    end_idx = min(len(t), start_idx + chord_len)
    actual_len = end_idx - start_idx
    if actual_len <= 0:
        break
    
    t_chord = np.linspace(0, actual_len / sample_rate, actual_len, endpoint=False)
    
    # Envelope: gentle attack, pleasant sustain/decay
    env = (1.0 - np.exp(-t_chord * 12.0)) * np.exp(-t_chord * 0.45)
    
    chord_wave = np.zeros(actual_len, dtype=np.float32)
    for freq in chord:
        # Fundamental + warm soft harmonics (Rhodes / EP vibe)
        h1 = np.sin(2 * np.pi * freq * t_chord)
        h2 = 0.35 * np.sin(2 * np.pi * 2 * freq * t_chord)
        h3 = 0.12 * np.sin(2 * np.pi * 3 * freq * t_chord)
        chord_wave += (h1 + h2 + h3)
    
    chord_wave /= len(chord)
    audio[start_idx:end_idx] += (chord_wave * env * 0.22).astype(np.float32)

# Add warm gentle sub bass
bass_notes = [73.42, 49.00, 65.41, 55.00]  # D2, G1, C2, A1
for i in range(total_chords):
    bass_freq = bass_notes[i % len(bass_notes)]
    start_time = i * chord_duration
    start_idx = int(start_time * sample_rate)
    chord_len = int(chord_duration * sample_rate)
    end_idx = min(len(t), start_idx + chord_len)
    actual_len = end_idx - start_idx
    if actual_len <= 0:
        break
    t_chord = np.linspace(0, actual_len / sample_rate, actual_len, endpoint=False)
    bass_env = (1.0 - np.exp(-t_chord * 10.0)) * np.exp(-t_chord * 0.3)
    bass_wave = np.sin(2 * np.pi * bass_freq * t_chord) * bass_env * 0.18
    audio[start_idx:end_idx] += bass_wave.astype(np.float32)

# Fade in and fade out
fade_in = int(2.0 * sample_rate)
audio[:fade_in] *= np.linspace(0, 1, fade_in)
fade_out = int(3.0 * sample_rate)
audio[-fade_out:] *= np.linspace(1, 0, fade_out)

# Normalize
max_val = np.max(np.abs(audio))
if max_val > 0:
    audio = audio / max_val * 0.55

wavfile.write("scripts/demo_video/bg_music.wav", sample_rate, (audio * 32767).astype(np.int16))
print("Background music generated successfully: scripts/demo_video/bg_music.wav")
