"""Footsteps, wingbeats and air rush for Short 02, made only with numpy/scipy.

Usage: python3 audio/make_steps.py events.json music.wav out.wav

Every footfall is synthesised from the animal's body mass: heavier animals get a
lower, longer, louder thump and darker ground noise; light ones a short, bright
patter. Hooves add a hard 'clop', paws a soft pad and claw scuff, shoes a tap,
the elephant a deep sub-bass thud. The bat gets membrane wingbeats instead.
"""
import sys, json, wave
import numpy as np
from scipy.signal import butter, sosfilt

SR = 48000
ev_path, music_path, out = sys.argv[1], sys.argv[2], sys.argv[3]
E = json.load(open(ev_path))
dur = E['duration']
N = int(SR * (dur + 1))
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(3)


def bp(x, lo, hi):
    return sosfilt(butter(2, [lo, hi], 'bandpass', fs=SR, output='sos'), x)


def lp(x, fc):
    return sosfilt(butter(2, fc, 'low', fs=SR, output='sos'), x)


def hp(x, fc):
    return sosfilt(butter(2, fc, 'high', fs=SR, output='sos'), x)


def weight(kg):
    # 0 for a 10 kg animal, 1 for a 4-tonne elephant (log scale)
    return float(np.clip((np.log10(kg) - 1) / (np.log10(4000) - 1), 0, 1))


def step(kg, kind, far):
    w = weight(kg)
    var = 1 + rng.uniform(-0.08, 0.08)
    n_len = 0.12 + 0.5 * w
    t = np.arange(int(n_len * SR)) / SR
    # body thump: pitch drops fast, lower and longer for heavy animals
    f0 = (170 - 130 * w) * var
    f = f0 * (1 + 1.2 * np.exp(-t * 60))
    thump = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * (38 - 28 * w)) * (0.35 + 0.65 * w)
    # ground: dirt and grass crunch, darker for heavy animals
    nz = rng.standard_normal(len(t))
    dirt = lp(nz, 4200 - 3400 * w) * np.exp(-t * (55 - 35 * w)) * (0.3 + 0.2 * w)
    s = thump + dirt
    if kind == 'hoof':
        c = np.arange(int(0.05 * SR)) / SR
        clop = bp(rng.standard_normal(len(c)), 900, 3200) * np.exp(-c * 140) * 0.9
        clop += np.sin(2 * np.pi * (650 - 250 * w) * var * c) * np.exp(-c * 70) * 0.5
        s[:len(c)] += clop
    elif kind == 'paw':
        c = np.arange(int(0.04 * SR)) / SR
        s[:len(c)] += hp(rng.standard_normal(len(c)), 3500) * np.exp(-c * 120) * 0.25  # claw scuff
        s = lp(s, 2500)
    elif kind == 'shoe':
        c = np.arange(int(0.03 * SR)) / SR
        s[:len(c)] += bp(rng.standard_normal(len(c)), 1800, 5000) * np.exp(-c * 200) * 0.6
    elif kind == 'pad':
        sub = np.sin(2 * np.pi * 34 * var * t) * np.exp(-t * 6) * 0.9
        rumble = lp(rng.standard_normal(len(t)), 220) * np.exp(-t * 5) * 0.8
        s = s + sub + rumble
    if far:
        s = lp(s, 1800) * 0.7
    return s * (0.45 + 0.55 * w)


def wingbeat():
    t = np.arange(int(0.09 * SR)) / SR
    env = np.minimum(t / 0.012, 1) * np.exp(-t * 45)
    flap = bp(rng.standard_normal(len(t)), 350, 1600) * env * 0.6
    flap += np.sin(2 * np.pi * 110 * t) * env * 0.25
    return flap


def put(sig, t0, pan, gain):
    s = int(t0 * SR)
    if s < 0 or s >= N:
        return
    e = min(N, s + len(sig))
    a = (pan + 1) / 2
    L[s:e] += sig[:e - s] * gain * np.cos(a * np.pi / 2)
    R[s:e] += sig[:e - s] * gain * np.sin(a * np.pi / 2)


for e in E['events']:
    if e['gain'] <= 0.01:
        continue
    sig = wingbeat() if e['sound'] == 'wing' else step(e['kg'], e['sound'], e['side'] == 'far')
    put(sig, e['t'], float(np.clip(e['pan'], -0.8, 0.8)) * 0.6, e['gain'] * e.get('vol', 1.0))

# air rush: louder and brighter as the camera speeds up
fps = E['fps']
speed = np.array(E['speed'] + [0])
ts = np.arange(N) / SR
v = np.interp(ts, np.arange(len(speed)) / fps, speed)
air = rng.standard_normal(N)
lo = bp(air, 150, 900); hi = bp(air, 900, 4000)
k = np.clip(v / 45, 0, 1)
rush = (lo * (0.5 + 0.5 * k) + hi * k) * (k ** 2) * 0.07
L += rush; R += np.roll(rush, 300)

steps = np.stack([L, R], 1)
steps /= np.max(np.abs(steps)) + 1e-9

with wave.open(music_path) as m:
    mus = np.frombuffer(m.readframes(m.getnframes()), '<i2').reshape(-1, 2) / 32767
mus = np.pad(mus, ((0, max(0, N - len(mus))), (0, 0)))[:N]
y = steps * 0.85 + mus * 0.55
y = y[:int(dur * SR)]
y = np.tanh(y * 1.1) / np.tanh(1.1) * 0.85
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((y * 32767).astype('<i2').tobytes())
print('wrote', out)
