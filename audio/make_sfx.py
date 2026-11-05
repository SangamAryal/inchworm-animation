"""Soft transition sounds, synthesised with numpy (no samples).

Usage: python3 audio/make_sfx.py [outdir]
- whoosh.wav: airy filtered-noise swell for the camera move (1.5 s)
- arrive.wav: low, quiet bell-like tone when the next object settles (2.5 s)
"""
import sys, wave
import numpy as np
from scipy.signal import butter, sosfilt

SR = 48000
out = sys.argv[1] if len(sys.argv) > 1 else 'public/audio'
rng = np.random.default_rng(3)

def save(name, y):
    y = y / (np.max(np.abs(y)) + 1e-9) * 0.5
    st = np.stack([y, np.roll(y, int(0.008 * SR))], axis=1)
    with wave.open(f'{out}/{name}', 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((st * 32767).astype('<i2').tobytes())

# whoosh: noise through a band-pass whose centre sweeps up then down
d = 1.5; n = int(d * SR); t = np.arange(n) / SR
noise = rng.standard_normal(n)
y = np.zeros(n)
blocks = 60
for i in range(blocks):
    a, b = i * n // blocks, (i + 1) * n // blocks
    x = (i + 0.5) / blocks
    fc = 250 + 1400 * np.sin(np.pi * x) ** 2
    sos = butter(2, [fc * 0.6, fc * 1.6], 'bandpass', fs=SR, output='sos')
    seg = sosfilt(sos, noise[max(0, a - 2000):b])[-(b - a):]
    y[a:b] = seg
env = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2.2
save('whoosh.wav', sosfilt(butter(2, 4000, 'low', fs=SR, output='sos'), y * env))

# arrive: soft low bell, two partials, slow decay
d = 2.5; t = np.arange(int(d * SR)) / SR
f = 220.0
y = (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 2.0 * t) * np.exp(-t * 2.5)
     + 0.15 * np.sin(2 * np.pi * f * 3.01 * t) * np.exp(-t * 4))
y *= np.exp(-t * 1.8) * np.minimum(t / 0.02, 1)
save('arrive.wav', y)
print('wrote whoosh.wav, arrive.wav to', out)
