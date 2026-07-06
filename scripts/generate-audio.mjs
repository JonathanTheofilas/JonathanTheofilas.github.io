/**
 * Synthesizes the site's UI sounds as WAV files in public/audio/.
 * Everything is generated from oscillators + noise — composed for this site,
 * no sampled/ripped audio anywhere.
 *
 * Run: npm run audio:generate
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const OUT = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "public",
  "audio",
);
mkdirSync(OUT, { recursive: true });

function wav(samples, rate) {
  const n = samples.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + n * 2, 4);
  buf.write("WAVEfmt ", 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(1, 22); // mono
  buf.writeUInt32LE(rate, 24);
  buf.writeUInt32LE(rate * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(s * 32767), 44 + i * 2);
  }
  return buf;
}

const sine = (f, t) => Math.sin(2 * Math.PI * f * t);
const env = (t, a, d) => (t < a ? t / a : Math.exp(-(t - a) / d));

function render(dur, rate, fn) {
  const n = Math.floor(dur * rate);
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) out[i] = fn(i / rate);
  return out;
}

/* blip — soft two-tone hover ping, Wii-menu flavoured */
{
  const rate = 44100;
  const s = render(0.09, rate, (t) => {
    const f = 1240 - 260 * t * 8;
    return 0.35 * sine(f, t) * env(t, 0.004, 0.028);
  });
  writeFileSync(path.join(OUT, "blip.wav"), wav(s, rate));
}

/* click — confident select "pop", slightly lower pair of partials */
{
  const rate = 44100;
  const s = render(0.16, rate, (t) => {
    const a = 0.32 * sine(660, t) * env(t, 0.003, 0.045);
    const b = 0.22 * sine(990, t) * env(t, 0.003, 0.03);
    const c = 0.18 * sine(1320, t + 0.02) * env(Math.max(0, t - 0.05), 0.004, 0.04);
    return a + b + c;
  });
  writeFileSync(path.join(OUT, "click.wav"), wav(s, rate));
}

/* back — closing a panel, downward pair */
{
  const rate = 44100;
  const s = render(0.14, rate, (t) => {
    const a = 0.3 * sine(880, t) * env(t, 0.003, 0.03);
    const b = 0.26 * sine(587, t + 0.04) * env(Math.max(0, t - 0.045), 0.004, 0.05);
    return a + b;
  });
  writeFileSync(path.join(OUT, "back.wav"), wav(s, rate));
}

/* whir — disc spin-up: filtered noise swell + rising motor tone */
{
  const rate = 22050;
  let lp = 0;
  const s = render(1.6, rate, (t) => {
    const p = Math.min(t / 1.3, 1);
    const noise = Math.random() * 2 - 1;
    lp += 0.06 * (noise - lp); // crude lowpass
    const motor =
      0.16 * sine(70 + 480 * p * p, t) + 0.07 * sine(140 + 960 * p * p, t);
    const swell = Math.pow(p, 1.6) * (t > 1.35 ? Math.exp(-(t - 1.35) / 0.12) : 1);
    return (0.5 * lp + motor) * swell * 0.8;
  });
  writeFileSync(path.join(OUT, "whir.wav"), wav(s, rate));
}

/* chime — gentle rising major arpeggio for boot completion */
{
  const rate = 44100;
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
  const s = render(1.5, rate, (t) => {
    let v = 0;
    notes.forEach((f, i) => {
      const t0 = i * 0.11;
      if (t >= t0) {
        const lt = t - t0;
        v +=
          0.16 *
          (sine(f, lt) + 0.35 * sine(f * 2, lt)) *
          env(lt, 0.008, 0.32);
      }
    });
    return v;
  });
  writeFileSync(path.join(OUT, "chime.wav"), wav(s, rate));
}

/* hum — 12s loopable ambient pad: slow-beating detuned fifths.
   Rendered with whole-second-period LFOs so the loop point is seamless. */
{
  const rate = 22050;
  const dur = 12;
  const s = render(dur, rate, (t) => {
    const lfo1 = 0.5 + 0.5 * sine(1 / 6, t); // period 6s
    const lfo2 = 0.5 + 0.5 * sine(1 / 4, t + 1); // period 4s
    const a = sine(110, t) + sine(110.35, t); // beating A2
    const b = sine(164.81, t) * lfo1; // E3
    const c = sine(220.5, t) * lfo2 * 0.6; // ~A3
    const d = sine(329.63, t) * (1 - lfo1) * 0.35; // E4
    return 0.055 * (a + b + c + d);
  });
  writeFileSync(path.join(OUT, "hum.wav"), wav(s, rate));
}

console.log("audio written to public/audio/");
