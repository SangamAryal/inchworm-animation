"""Calm ambient bed for Shorts, made only with numpy (no samples, no licences).

Usage: python3 audio/make_music.py [seconds] [out.wav]
Slow pads (Dm9 - Bbmaj7 - Fadd9 - C6), a soft bell motif and a long reverb tail.
"""
import sys, wave
import numpy as np

SR = 48000
dur = float(sys.argv[1]) if len(sys.argv) > 1 else 42.0
out = sys.argv[2] if len(sys.argv) > 2 else 'public/audio/short01-music.wav'
rng = np.random.default_rng(7)
N = int(SR * dur)
t = np.arange(N) / SR

def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)

def pad_voice(freq, start, length):
    n = int(length * SR); s = int(start * SR)
    tt = np.arange(n) / SR
    env = np.minimum(tt / 2.2, 1) * np.minimum((length - tt) / 2.5, 1)
    env = np.clip(env, 0, 1) ** 1.5
    sig = np.zeros(n)
    for det in (-0.12, 0.0, 0.11):  # slightly detuned saw-ish stack, softened
        f = freq * 2 ** (det / 12)
        ph = 2 * np.pi * f * tt + rng.uniform(0, 6.28)
        sig += np.sin(ph) + 0.25 * np.sin(2 * ph) + 0.08 * np.sin(3 * ph)
    sig *= 1 + 0.15 * np.sin(2 * np.pi * 0.2 * tt + rng.uniform(0, 6))
    return s, sig * env

def bell(freq, start, amp=0.5):
    n = int(4.0 * SR); s = int(start * SR)
    tt = np.arange(n) / SR
    env = np.exp(-tt * 1.6) * np.minimum(tt / 0.01, 1)
    sig = np.sin(2 * np.pi * freq * tt) + 0.35 * np.sin(2 * np.pi * freq * 2.76 * tt) * np.exp(-tt * 3)
    return s, sig * env * amp

mix = np.zeros(N + SR * 6)
chords = [[50, 57, 60, 64, 65], [46, 53, 57, 62, 64], [41, 53, 57, 60, 67], [48, 55, 60, 64, 69]]
step = 5.25
k = 0; st = 0.0
while st < dur:
    for m in chords[k % 4]:
        s, sig = pad_voice(hz(m), st, step + 2.0)
        mix[s:s + len(sig)] += sig * 0.05
    s, sig = pad_voice(hz(chords[k % 4][0] - 12), st, step + 2.0)
    mix[s:s + len(sig)] += sig * 0.07
    k += 1; st += step

motif = [74, 72, 69, 67, 69, 72, 74, 77]
bt = 2.6
for i in range(int(dur / 2.625)):
    if i % 4 == 3:
        continue
    s, sig = bell(hz(motif[i % len(motif)]), bt + i * 2.625, 0.07)
    mix[s:s + len(sig)] += sig

# gentle low-pass
from scipy.signal import butter, sosfilt, fftconvolve  # noqa: E402
mix = sosfilt(butter(4, 3200, 'low', fs=SR, output='sos'), mix)
# reverb: decaying noise impulse response
ir_t = np.arange(int(3.5 * SR)) / SR
ir = rng.standard_normal(len(ir_t)) * np.exp(-ir_t * 1.9)
ir = sosfilt(butter(2, 2500, 'low', fs=SR, output='sos'), ir)
wet = fftconvolve(mix, ir)[:len(mix)]
wet /= np.max(np.abs(wet)) + 1e-9
dry = mix / (np.max(np.abs(mix)) + 1e-9)
y = 0.55 * dry + 0.6 * wet
y = y[:N]
fade = np.minimum(np.minimum(t / 1.5, 1), np.minimum((dur - t) / 2.5, 1))
y *= fade
y = y / np.max(np.abs(y)) * 0.5  # about -6 dBFS peak; quiet bed
stereo = np.stack([y, np.roll(y, int(0.011 * SR))], axis=1)
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((stereo * 32767).astype('<i2').tobytes())
print('wrote', out, dur, 's')
