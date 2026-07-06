import { Howl, Howler } from "howler";
import { useAppStore } from "../store/useAppStore";

/**
 * All sounds are synthesized WAVs (see scripts/generate-audio.mjs) — nothing
 * sampled. The site starts muted; the mute toggle in the HUD is the only
 * thing that unmutes, which also satisfies browser autoplay policy since
 * it's always a user gesture.
 */

const make = (src: string, volume: number, loop = false) =>
  new Howl({ src: [src], volume, loop, preload: true });

const sounds = {
  blip: make("/audio/blip.wav", 0.28),
  click: make("/audio/click.wav", 0.4),
  back: make("/audio/back.wav", 0.35),
  whir: make("/audio/whir.wav", 0.5),
  chime: make("/audio/chime.wav", 0.45),
  hum: make("/audio/hum.wav", 0.32, true),
};

export type SfxName = keyof typeof sounds;

let lastBlip = 0;

export const sfx = {
  play(name: SfxName) {
    if (useAppStore.getState().muted) return;
    if (name === "blip") {
      // hovering across many Miis shouldn't machine-gun
      const now = performance.now();
      if (now - lastBlip < 90) return;
      lastBlip = now;
    }
    sounds[name].play();
  },

  startAmbient() {
    if (useAppStore.getState().muted) return;
    if (!sounds.hum.playing()) {
      sounds.hum.play();
      sounds.hum.fade(0, 0.32, 2000);
    }
  },

  stopAmbient() {
    if (sounds.hum.playing()) sounds.hum.fade(0.32, 0, 600);
    setTimeout(() => sounds.hum.stop(), 650);
  },
};

// keep Howler's global mute in sync with the store
useAppStore.subscribe((state, prev) => {
  if (state.muted !== prev.muted) {
    Howler.mute(state.muted);
    if (!state.muted && state.bootPhase === "done") sfx.startAmbient();
    if (state.muted) sounds.hum.stop();
  }
});
