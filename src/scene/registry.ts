import * as THREE from "three";

/**
 * Frame-rate mutable state shared between Miis (separation steering, chat
 * pairing) and the camera rig (focus dolly). Deliberately outside React.
 */
export interface MiiEntry {
  pos: THREE.Vector3;
  mode: "idle" | "walk" | "wave" | "chat";
  chatWith: string | null;
  chatUntil: number;
  chatCooldownUntil: number;
  /** seconds of goodbye-wave remaining, decremented by the Mii each frame */
  goodbyeFor: number;
}

export const miiRegistry = new Map<string, MiiEntry>();

if (import.meta.env.DEV) {
  (window as unknown as Record<string, unknown>).__miiRegistry = miiRegistry;
}

export function registerMii(id: string, x: number, z: number): MiiEntry {
  const entry: MiiEntry = {
    pos: new THREE.Vector3(x, 0, z),
    mode: "idle",
    chatWith: null,
    chatUntil: 0,
    chatCooldownUntil: 0,
    goodbyeFor: 0,
  };
  miiRegistry.set(id, entry);
  return entry;
}
