import { useEffect, useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { Project } from "../content/projects";
import { useAppStore } from "../store/useAppStore";
import { sfx } from "../audio/sfx";
import { miiRegistry, registerMii, type MiiEntry } from "./registry";
import { WANDER_RADIUS } from "./layout";

const SKIN = "#f2cfa5";
const WALK_SPEED = 0.85;

/* ------------------------------------------------------------------ */
/* shared geometry / textures (created once for every Mii)             */
/* ------------------------------------------------------------------ */

const geo = {
  body: new THREE.CapsuleGeometry(0.3, 0.36, 6, 16),
  head: new THREE.SphereGeometry(0.3, 24, 18),
  eye: new THREE.SphereGeometry(0.038, 10, 8),
  arm: new THREE.CapsuleGeometry(0.07, 0.26, 4, 10),
  leg: new THREE.CapsuleGeometry(0.08, 0.2, 4, 10),
  foot: new THREE.SphereGeometry(0.11, 12, 8),
  hand: new THREE.SphereGeometry(0.085, 12, 8),
};

let blobTexture: THREE.CanvasTexture | null = null;
function getBlobTexture() {
  if (!blobTexture) {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(64, 64, 6, 64, 64, 64);
    g.addColorStop(0, "rgba(50,70,95,0.55)");
    g.addColorStop(1, "rgba(50,70,95,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    blobTexture = new THREE.CanvasTexture(c);
  }
  return blobTexture;
}

function plastic(color: string, extra?: Partial<THREE.MeshPhysicalMaterialParameters>) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.28,
    clearcoat: 0.9,
    clearcoatRoughness: 0.25,
    ...extra,
  });
}

/* ------------------------------------------------------------------ */
/* hair + accessory sub-assemblies (simple primitives only)            */
/* ------------------------------------------------------------------ */

function Hair({ type, color }: { type: Project["mii"]["hair"]; color: string }) {
  const mat = useMemo(() => plastic(color), [color]);
  if (type === "none") return null;
  return (
    <group>
      {(type === "bowl" || type === "swirl") && (
        <mesh material={mat} position-y={0.02}>
          <sphereGeometry args={[0.315, 24, 12, 0, Math.PI * 2, 0, 1.45]} />
        </mesh>
      )}
      {type === "cap" && (
        <>
          <mesh material={mat} position-y={0.05}>
            <sphereGeometry args={[0.31, 24, 12, 0, Math.PI * 2, 0, 1.15]} />
          </mesh>
          <mesh material={mat} position={[0, 0.14, 0.24]} rotation-x={-0.25}>
            <cylinderGeometry args={[0.16, 0.16, 0.03, 16]} />
          </mesh>
        </>
      )}
      {type === "spike" && (
        <>
          <mesh material={mat} position-y={0.04}>
            <sphereGeometry args={[0.305, 24, 12, 0, Math.PI * 2, 0, 1.1]} />
          </mesh>
          {[-0.12, 0, 0.12].map((x, i) => (
            <mesh
              key={i}
              material={mat}
              position={[x, 0.3, 0]}
              rotation-z={-x * 1.4}
            >
              <coneGeometry args={[0.06, 0.16, 8]} />
            </mesh>
          ))}
        </>
      )}
      {type === "swirl" && (
        <mesh material={mat} position={[0.02, 0.3, 0]} rotation-x={Math.PI / 2}>
          <torusGeometry args={[0.08, 0.035, 8, 16, 4.6]} />
        </mesh>
      )}
    </group>
  );
}

/** Accessory on the head (worn) — headphones / headset / bug. */
function HeadAccessory({ type }: { type: Project["mii"]["accessory"] }) {
  const dark = useMemo(() => plastic("#33373d"), []);
  const red = useMemo(() => plastic("#c94c42"), []);
  if (type === "headphones")
    return (
      <group>
        <mesh material={dark} rotation-z={Math.PI}>
          <torusGeometry args={[0.32, 0.03, 8, 24, Math.PI]} />
        </mesh>
        <mesh material={dark} position={[-0.31, -0.02, 0]} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.09, 0.09, 0.06, 12]} />
        </mesh>
        <mesh material={dark} position={[0.31, -0.02, 0]} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.09, 0.09, 0.06, 12]} />
        </mesh>
      </group>
    );
  if (type === "headset")
    return (
      <group>
        <mesh material={dark} position={[0, 0.02, 0.27]}>
          <boxGeometry args={[0.36, 0.16, 0.12]} />
        </mesh>
        <mesh material={dark} rotation-x={Math.PI / 2}>
          <torusGeometry args={[0.31, 0.02, 6, 20]} />
        </mesh>
      </group>
    );
  if (type === "bug")
    return (
      <group position={[0.08, 0.29, 0.06]} rotation-y={0.5}>
        <mesh material={red} scale={[1, 0.7, 1.2]}>
          <sphereGeometry args={[0.07, 10, 8]} />
        </mesh>
        <mesh material={red} position={[0, 0.02, 0.08]}>
          <sphereGeometry args={[0.04, 8, 6]} />
        </mesh>
        {[-0.02, 0.02].map((x, i) => (
          <mesh key={i} material={red} position={[x, 0.08, 0.1]} rotation-x={-0.5} rotation-z={x * 8}>
            <cylinderGeometry args={[0.004, 0.004, 0.06, 4]} />
          </mesh>
        ))}
      </group>
    );
  return null;
}

/** Accessory held in the left hand — hints at the project's domain. */
function HandAccessory({ type }: { type: Project["mii"]["accessory"] }) {
  const grey = useMemo(() => plastic("#aeb8c2"), []);
  const white = useMemo(() => plastic("#f7f9fb"), []);
  const blue = useMemo(() => plastic("#3fa9f5"), []);
  const roof = useMemo(() => plastic("#c96a50"), []);
  switch (type) {
    case "database":
      return (
        <group>
          {[0, 0.09, 0.18].map((y, i) => (
            <mesh key={i} material={i === 1 ? blue : grey} position-y={y}>
              <cylinderGeometry args={[0.09, 0.09, 0.06, 14]} />
            </mesh>
          ))}
        </group>
      );
    case "house":
      return (
        <group>
          <mesh material={white}>
            <boxGeometry args={[0.15, 0.12, 0.14]} />
          </mesh>
          <mesh material={roof} position-y={0.11}>
            <coneGeometry args={[0.12, 0.1, 4]} />
          </mesh>
        </group>
      );
    case "scissors":
      return (
        <group>
          <mesh material={grey} rotation-z={0.4}>
            <boxGeometry args={[0.035, 0.24, 0.012]} />
          </mesh>
          <mesh material={grey} rotation-z={-0.4}>
            <boxGeometry args={[0.035, 0.24, 0.012]} />
          </mesh>
          <mesh material={blue}>
            <sphereGeometry args={[0.03, 8, 6]} />
          </mesh>
        </group>
      );
    case "chart":
      return (
        <group>
          <mesh material={white}>
            <boxGeometry args={[0.24, 0.18, 0.02]} />
          </mesh>
          {[0.05, 0.09, 0.13].map((h, i) => (
            <mesh key={i} material={blue} position={[-0.07 + i * 0.07, -0.07 + h / 2, 0.015]}>
              <boxGeometry args={[0.04, h, 0.01]} />
            </mesh>
          ))}
        </group>
      );
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/* the Mii                                                             */
/* ------------------------------------------------------------------ */

interface WanderState {
  target: THREE.Vector3;
  heading: number;
  phase: number;
  idleTimer: number;
  headTurn: number;
}

const tmpDir = new THREE.Vector3();
const tmpPush = new THREE.Vector3();

export function Mii({
  project,
  spawn,
}: {
  project: Project;
  spawn: [number, number];
}) {
  const { mii } = project;
  const root = useRef<THREE.Group>(null);
  const bodyGroup = useRef<THREE.Group>(null);
  const headGroup = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);

  const hovered = useAppStore((s) => s.hoveredMii === project.id);
  const reducedMotion = useAppStore((s) => s.reducedMotion);

  const entry = useMemo<MiiEntry>(
    () => registerMii(project.id, spawn[0], spawn[1]),
    [project.id, spawn],
  );
  useEffect(() => {
    return () => {
      miiRegistry.delete(project.id);
    };
  }, [project.id]);

  const wander = useRef<WanderState>({
    target: new THREE.Vector3(spawn[0], 0, spawn[1]),
    heading: Math.random() * Math.PI * 2,
    phase: Math.random() * 10,
    idleTimer: 1 + Math.random() * 3,
    headTurn: 0,
  });

  const bodyMat = useMemo(() => plastic(mii.color), [mii.color]);
  const skinMat = useMemo(() => plastic(SKIN, { clearcoat: 0.55 }), []);
  const darkMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#26262b", roughness: 0.4 }),
    [],
  );

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const s = useAppStore.getState();
    if (s.hoveredMii !== project.id) {
      s.setHoveredMii(project.id);
      s.setCursorMode("open");
      sfx.play("blip");
    }
  };
  const onOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const s = useAppStore.getState();
    if (s.hoveredMii === project.id) {
      s.setHoveredMii(null);
      if (s.cursorMode === "open") s.setCursorMode("pointer");
    }
  };
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const s = useAppStore.getState();
    s.setActiveProject(s.activeProject === project.id ? null : project.id);
    sfx.play("click");
  };

  useFrame((state, dt) => {
    const g = root.current;
    if (!g) return;
    dt = Math.min(dt, 0.06);
    const w = wander.current;
    const now = state.clock.elapsedTime;
    const app = useAppStore.getState();
    const isActive = app.activeProject === project.id;
    if (entry.goodbyeFor > 0) entry.goodbyeFor -= dt;
    const isWaving = hovered || isActive || entry.goodbyeFor > 0;

    entry.pos.copy(g.position);

    let walking = false;

    if (reducedMotion) {
      // stand and wave gently instead of wandering
      entry.mode = "wave";
    } else if (isWaving) {
      // face the camera and wave
      entry.mode = "wave";
      const cam = state.camera.position;
      const desired = Math.atan2(cam.x - g.position.x, cam.z - g.position.z);
      w.heading = THREE.MathUtils.damp(w.heading, desired, 6, dt);
    } else if (entry.mode === "chat" || (entry.chatWith && miiRegistry.has(entry.chatWith))) {
      entry.mode = "chat";
      const partner = miiRegistry.get(entry.chatWith!);
      if (!partner || now > entry.chatUntil) {
        entry.mode = "idle";
        entry.chatWith = null;
        entry.chatCooldownUntil = now + 8 + Math.random() * 8;
        w.idleTimer = 0.5;
      } else {
        const desired = Math.atan2(
          partner.pos.x - g.position.x,
          partner.pos.z - g.position.z,
        );
        w.heading = THREE.MathUtils.damp(w.heading, desired, 5, dt);
      }
    } else if (entry.mode === "walk") {
      tmpDir.subVectors(w.target, g.position);
      tmpDir.y = 0;
      const dist = tmpDir.length();
      if (dist < 0.15) {
        entry.mode = "idle";
        w.idleTimer = 2 + Math.random() * 4;
      } else {
        tmpDir.normalize();
        // separation steering from the other Miis; give the Mii that's
        // presenting its project a much wider berth
        for (const [oid, other] of miiRegistry) {
          if (oid === project.id) continue;
          const radius = oid === app.activeProject ? 2.6 : 0.95;
          tmpPush.subVectors(g.position, other.pos);
          tmpPush.y = 0;
          const d = tmpPush.length();
          if (d > 0.001 && d < radius) {
            tmpDir.addScaledVector(tmpPush.normalize(), (radius - d) * 2.2);
          }
        }
        tmpDir.normalize();
        const speed = WALK_SPEED * mii.height;
        g.position.addScaledVector(tmpDir, speed * dt);
        const desired = Math.atan2(tmpDir.x, tmpDir.z);
        w.heading = THREE.MathUtils.damp(w.heading, desired, 8, dt);
        w.phase += dt * 7.5;
        walking = true;
      }
    } else {
      // idle
      w.idleTimer -= dt;
      w.headTurn = Math.sin(now * 0.7 + w.phase) * 0.35;
      // try to strike up a chat with a nearby idle Mii
      if (!entry.chatWith && now > entry.chatCooldownUntil) {
        for (const [oid, other] of miiRegistry) {
          if (oid === project.id || other.mode !== "idle" || other.chatWith)
            continue;
          if (other.pos.distanceTo(g.position) < 2.3) {
            const until = now + 3.5 + Math.random() * 2.5;
            entry.chatWith = oid;
            entry.chatUntil = until;
            other.chatWith = project.id;
            other.chatUntil = until;
            entry.mode = "chat";
            other.mode = "chat";
            break;
          }
        }
      }
      // shuffle off camera if we're loitering next to a presenting Mii
      const focused = app.activeProject && miiRegistry.get(app.activeProject);
      const crowdingFocus =
        focused &&
        app.activeProject !== project.id &&
        focused.pos.distanceTo(g.position) < 2.2;
      if (w.idleTimer <= 0 || crowdingFocus) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * WANDER_RADIUS;
        w.target.set(Math.sin(a) * r, 0, Math.cos(a) * r);
        entry.mode = "walk";
      }
    }

    g.rotation.y = w.heading;

    /* ---- limbs & body ---- */
    const lerpTo = (ref: React.RefObject<THREE.Group | null>, x: number, z = 0) => {
      const o = ref.current;
      if (!o) return;
      o.rotation.x = THREE.MathUtils.damp(o.rotation.x, x, 10, dt);
      o.rotation.z = THREE.MathUtils.damp(o.rotation.z, z, 10, dt);
    };

    if (walking) {
      const s = Math.sin(w.phase);
      lerpTo(legL, s * 0.62);
      lerpTo(legR, -s * 0.62);
      lerpTo(armL, -s * 0.45, 0.2);
      lerpTo(armR, s * 0.45, -0.2);
      if (bodyGroup.current) {
        bodyGroup.current.position.y = Math.abs(Math.cos(w.phase)) * 0.045;
        bodyGroup.current.rotation.x = 0.06;
      }
      if (headGroup.current)
        headGroup.current.rotation.y = THREE.MathUtils.damp(
          headGroup.current.rotation.y, 0, 8, dt);
    } else if (entry.mode === "wave") {
      lerpTo(legL, 0);
      lerpTo(legR, 0);
      lerpTo(armL, 0, 0.2);
      // arm raised sideways, wiggling — the classic Mii greeting
      const wig = Math.sin(now * 8 + w.phase) * 0.32;
      lerpTo(armR, 0, -2.35 + wig);
      if (bodyGroup.current) {
        bodyGroup.current.position.y = Math.sin(now * 2.2) * 0.015;
        bodyGroup.current.rotation.x = 0;
      }
      if (headGroup.current)
        headGroup.current.rotation.y = THREE.MathUtils.damp(
          headGroup.current.rotation.y, 0, 8, dt);
    } else {
      lerpTo(legL, 0);
      lerpTo(legR, 0);
      lerpTo(armL, 0, 0.2);
      lerpTo(armR, 0, -0.2);
      if (bodyGroup.current) {
        bodyGroup.current.position.y = Math.sin(now * 2 + w.phase) * 0.014;
        bodyGroup.current.rotation.x = 0;
      }
      if (headGroup.current) {
        const nod =
          entry.mode === "chat" ? Math.sin(now * 3.2 + w.phase) * 0.07 : 0;
        headGroup.current.rotation.y = THREE.MathUtils.damp(
          headGroup.current.rotation.y,
          entry.mode === "chat" ? 0 : w.headTurn,
          4,
          dt,
        );
        headGroup.current.rotation.x = nod;
      }
    }
  });

  const h = mii.height;
  const hs = mii.headSize;
  const wearable =
    mii.accessory === "headphones" ||
    mii.accessory === "headset" ||
    mii.accessory === "bug";

  return (
    <group
      ref={root}
      position={[spawn[0], 0, spawn[1]]}
      scale={[h, h, h]}
      onPointerOver={onOver}
      onPointerOut={onOut}
      onClick={onClick}
    >
      {/* blob shadow */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.015}>
        <circleGeometry args={[0.5, 24]} />
        <meshBasicMaterial
          map={getBlobTexture()}
          transparent
          depthWrite={false}
        />
      </mesh>

      <group ref={bodyGroup}>
        {/* body */}
        <mesh geometry={geo.body} material={bodyMat} position-y={0.78} castShadow />

        {/* legs */}
        <group ref={legL} position={[-0.14, 0.42, 0]}>
          <mesh geometry={geo.leg} material={darkMat} position-y={-0.16} />
          <mesh
            geometry={geo.foot}
            material={darkMat}
            position={[0, -0.36, 0.04]}
            scale={[1, 0.55, 1.35]}
          />
        </group>
        <group ref={legR} position={[0.14, 0.42, 0]}>
          <mesh geometry={geo.leg} material={darkMat} position-y={-0.16} />
          <mesh
            geometry={geo.foot}
            material={darkMat}
            position={[0, -0.36, 0.04]}
            scale={[1, 0.55, 1.35]}
          />
        </group>

        {/* arms */}
        <group ref={armL} position={[-0.39, 1.05, 0]} rotation-z={0.2}>
          <mesh geometry={geo.arm} material={bodyMat} position-y={-0.17} />
          <mesh geometry={geo.hand} material={skinMat} position-y={-0.36} />
          {!wearable && mii.accessory !== "none" && (
            <group position={[0, -0.5, 0.05]}>
              <HandAccessory type={mii.accessory} />
            </group>
          )}
        </group>
        <group ref={armR} position={[0.39, 1.05, 0]} rotation-z={-0.2}>
          <mesh geometry={geo.arm} material={bodyMat} position-y={-0.17} />
          <mesh geometry={geo.hand} material={skinMat} position-y={-0.36} />
        </group>

        {/* head */}
        <group ref={headGroup} position-y={1.48} scale={[hs, hs, hs]}>
          <mesh geometry={geo.head} material={skinMat} />
          {/* flat oval eyes */}
          <mesh
            geometry={geo.eye}
            material={darkMat}
            position={[-0.105, 0.035, 0.265]}
            scale={[1, 1.55, 0.45]}
          />
          <mesh
            geometry={geo.eye}
            material={darkMat}
            position={[0.105, 0.035, 0.265]}
            scale={[1, 1.55, 0.45]}
          />
          {/* simple mouth */}
          <mesh material={darkMat} position={[0, -0.115, 0.275]} rotation-x={0.15}>
            <boxGeometry args={[0.1, 0.022, 0.02]} />
          </mesh>
          <Hair type={mii.hair} color={mii.hairColor} />
          {wearable && <HeadAccessory type={mii.accessory} />}
        </group>
      </group>

      {/* nameplate on hover */}
      {hovered && (
        <Html
          position={[0, 2.15 * (1 / h), 0]}
          center
          distanceFactor={7}
          zIndexRange={[25, 21]}
          style={{ pointerEvents: "none" }}
        >
          <div className="mii-nameplate">{project.name}</div>
        </Html>
      )}
    </group>
  );
}
