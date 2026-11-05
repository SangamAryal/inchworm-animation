"""Normalise a wav to a target peak (default -1 dBFS) with gentle soft clipping for extra loudness.

Usage: python3 audio/normalize.py in.wav out.wav [drive]
"""
import sys, wave
import numpy as np

src, out = sys.argv[1], sys.argv[2]
drive = float(sys.argv[3]) if len(sys.argv) > 3 else 1.6
with wave.open(src) as w:
    ch, sr = w.getnchannels(), w.getframerate()
    x = np.frombuffer(w.readframes(w.getnframes()), '<i2').reshape(-1, ch) / 32767
x = x / (np.max(np.abs(x)) + 1e-9)
y = np.tanh(x * drive) / np.tanh(drive) * 0.89
with wave.open(out, 'wb') as w:
    w.setnchannels(ch); w.setsampwidth(2); w.setframerate(sr)
    w.writeframes((y * 32767).astype('<i2').tobytes())
print('wrote', out, 'rms', round(float(np.sqrt((y ** 2).mean())), 3))
