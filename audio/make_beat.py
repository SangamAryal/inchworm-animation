"""Space lo-fi beat for Shorts, made only with numpy/scipy (no samples, no licences).

Usage: python3 audio/make_beat.py [seconds] [bar_seconds] [first_downbeat_s] [out.wav]

The bar length and first downbeat are chosen so camera moves land on downbeats
(Short 01: one object every 3.8 s = 2 bars of 1.9 s, beat drops at 3.4 s).
Parts: pads (Dm9 - Bbmaj7 - Fmaj7 - C6, two bars each), sub bass, kick, soft
clap on 2 and 4, swung hats, a quiet plucked arpeggio and a reverb send.
"""
import sys, wave
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000
dur = float(sys.argv[1]) if len(sys.argv) > 1 else 41.5
bar = float(sys.argv[2]) if len(sys.argv) > 2 else 1.9
t0 = float(sys.argv[3]) if len(sys.argv) > 3 else 3.4
out = sys.argv[4] if len(sys.argv) > 4 else 'public/audio/short01-music.wav'
beat = bar / 4
rng = np.random.default_rng(11)
N = int(SR * (dur + 4))
bus = {k: np.zeros(N) for k in ('pad', 'bass', 'kick', 'clap', 'hat', 'arp')}


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def put(name, start, sig, gain=1.0):
    s = int(start * SR)
    if s >= N or s + len(sig) <= 0:
        return
    e = min(N, s + len(sig))
    bus[name][max(s, 0):e] += sig[max(0, -s):e - s] * gain


def lp(x, fc, order=2):
    return sosfilt(butter(order, fc, 'low', fs=SR, output='sos'), x)


def hp(x, fc, order=2):
    return sosfilt(butter(order, fc, 'high', fs=SR, output='sos'), x)


# --- instruments -------------------------------------------------------------
def kick():
    t = np.arange(int(0.45 * SR)) / SR
    f = 45 + 85 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 7.5) + 0.25 * np.sin(ph * 2) * np.exp(-t * 30)


def clap():
    t = np.arange(int(0.35 * SR)) / SR
    n = rng.standard_normal(len(t))
    body = sosfilt(butter(2, [900, 2600], 'bandpass', fs=SR, output='sos'), n)
    env = np.exp(-t * 18) + 0.6 * np.exp(-np.abs(t - 0.012) * 400) + 0.4 * np.exp(-np.abs(t - 0.024) * 400)
    return body * env * 0.9 + np.sin(2 * np.pi * 190 * t) * np.exp(-t * 35) * 0.25


def hat(open_=False):
    t = np.arange(int((0.25 if open_ else 0.06) * SR)) / SR
    n = hp(rng.standard_normal(len(t)), 7000)
    return n * np.exp(-t * (14 if open_ else 70))


def pad(freq, length):
    t = np.arange(int(length * SR)) / SR
    env = np.clip(np.minimum(t / 0.6, 1) * np.minimum((length - t) / 0.8, 1), 0, 1)
    s = np.zeros(len(t))
    for det in (-0.1, 0.0, 0.09):
        ph = 2 * np.pi * freq * 2 ** (det / 12) * t + rng.uniform(0, 6.28)
        s += np.sin(ph) + 0.3 * np.sin(2 * ph) + 0.1 * np.sin(3 * ph)
    return lp(s, 2200) * env


def sub(freq, length):
    t = np.arange(int(length * SR)) / SR
    env = np.minimum(t / 0.01, 1) * np.clip((length - t) / 0.08, 0, 1)
    return (np.sin(2 * np.pi * freq * t) + 0.15 * np.sin(4 * np.pi * freq * t)) * env


def pluck(freq):
    t = np.arange(int(0.6 * SR)) / SR
    s = np.sin(2 * np.pi * freq * t) + 0.4 * np.sin(4 * np.pi * freq * t) * np.exp(-t * 12)
    return s * np.exp(-t * 7) * np.minimum(t / 0.003, 1)


# --- arrangement ---------------------------------------------------------------
chords = [  # root (bass), voicing
    (38, [53, 57, 60, 64]),  # Dm9
    (34, [53, 57, 58, 62]),  # Bbmaj7
    (41, [57, 60, 64, 65]),  # Fmaj7
    (36, [55, 57, 60, 64]),  # C6
]
# intro: pads only, from 0 to the first downbeat
for m in chords[0][1]:
    put('pad', 0.0, pad(hz(m), t0 + 0.3), 0.06)

nbars = int((dur - t0) / bar) + 1
end_beats = dur - 2.5  # drums stop before the outro
for b in range(nbars):
    tb = t0 + b * bar
    root, voicing = chords[(b // 2) % 4]
    if b % 2 == 0:
        for m in voicing:
            put('pad', tb, pad(hz(m), bar * 2 + 0.6), 0.06)
    # bass: root on 1, a push on the "and" of 3
    put('bass', tb, sub(hz(root), beat * 2.4), 0.5)
    put('bass', tb + beat * 2.5, sub(hz(root + (7 if b % 2 else 12)), beat * 1.3), 0.35)
    if tb > end_beats:
        continue
    # drums (first bar after the drop: kick only, so it eases in)
    put('kick', tb, kick(), 0.9)
    put('kick', tb + beat * 2.5, kick(), 0.55)
    if b >= 1:
        put('clap', tb + beat, clap(), 0.35)
        put('clap', tb + beat * 3, clap(), 0.35)
        for i in range(8):
            swing = 0.035 * beat if i % 2 else 0
            put('hat', tb + i * beat / 2 + swing, hat(open_=(i == 7 and b % 2 == 1)), 0.12 if i % 2 else 0.18)
    # quiet arpeggio, 16ths, every other bar
    if b >= 2 and b % 2 == 1:
        notes = voicing + [voicing[1] + 12]
        for i in range(16):
            put('arp', tb + i * beat / 4, pluck(hz(notes[(i * 3) % len(notes)] + 12)), 0.05)

# --- mix ---------------------------------------------------------------------
mix = (bus['pad'] + lp(bus['bass'], 300) + bus['kick'] * 0.9 + bus['clap'] * 0.8 + bus['hat'] * 0.7
       + lp(bus['arp'], 5000))
# gentle sidechain: pads and arp duck under the kick
kick_env = lp(np.abs(bus['kick']), 12)
duck = 1 - 0.35 * np.clip(kick_env / (kick_env.max() + 1e-9) * 3, 0, 1)
mix = mix * duck + (bus['kick'] * 0.9 + lp(bus['bass'], 300)) * (1 - duck)
# reverb send on pads, clap and arp
ir_t = np.arange(int(2.2 * SR)) / SR
ir = lp(rng.standard_normal(len(ir_t)) * np.exp(-ir_t * 2.6), 3000)
send = bus['pad'] + bus['clap'] * 0.5 + bus['arp']
wet = fftconvolve(send, ir)[:N]
wet *= 0.25 / (np.max(np.abs(wet)) + 1e-9) * (np.max(np.abs(mix)) + 1e-9)
y = mix + wet
y = y[:int(dur * SR)]
t = np.arange(len(y)) / SR
y *= np.minimum(np.minimum(t / 0.8, 1), np.clip((dur - t) / 2.0, 0, 1))
y = np.tanh(y / (np.max(np.abs(y)) + 1e-9) * 1.3) / np.tanh(1.3) * 0.6
st = np.stack([y, np.roll(y, int(0.007 * SR))], axis=1)
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((st * 32767).astype('<i2').tobytes())
print('wrote', out, f'{dur}s, bar {bar}s ({240 / bar:.1f} BPM), drop at {t0}s')
