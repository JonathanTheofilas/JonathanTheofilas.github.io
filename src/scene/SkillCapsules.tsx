import { useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { site } from "../content/site";
import { ZONES } from "./layout";
import { useAppStore } from "../store/useAppStore";
import { sfx } from "../audio/sfx";

/**
 * Skill pills as 3D capsules floating near the Skills channel. Hovering one
 * bats it away with a small impulse; a spring pulls it home.
 */

interface CapsuleState {
  home: THREE.Vector3;
  vel: THREE.Vector3;
  phase: number;
}

function SkillCapsule({
  label,
  home,
  phase,
}: {
  label: string;
  home: THREE.Vector3;
  phase: number;
}) {
  const group = useRef<THREE.Group>(null);
  const st = useRef<CapsuleState>({
    home,
    vel: new THREE.Vector3(),
    phase,
  });

  const width = Math.max(0.6, label.length * 0.115);

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const dir = new THREE.Vector3()
      .subVectors(e.point, e.camera.position)
      .normalize();
    dir.y = Math.abs(dir.y) * 0.5 + 0.25; // bat it slightly upward
    st.current.vel.addScaledVector(dir, 1.6);
    useAppStore.getState().setCursorMode("open");
    sfx.play("blip");
  };
  const onOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const s = useAppStore.getState();
    if (s.cursorMode === "open") s.setCursorMode("pointer");
  };

  useFrame(({ clock }, dt) => {
    const g = group.current;
    if (!g) return;
    dt = Math.min(dt, 0.06);
    const s = st.current;
    const t = clock.elapsedTime + s.phase;

    // spring back home + gentle idle bob
    const target = new THREE.Vector3(
      s.home.x,
      s.home.y + Math.sin(t * 0.9) * 0.08,
      s.home.z,
    );
    const springK = 14;
    const damping = 4.2;
    s.vel.addScaledVector(target.clone().sub(g.position), springK * dt);
    s.vel.multiplyScalar(Math.exp(-damping * dt));
    g.position.addScaledVector(s.vel, dt);
    g.rotation.z = Math.sin(t * 0.7) * 0.08 + s.vel.x * 0.1;
    g.rotation.x = s.vel.z * 0.1;
  });

  return (
    <group ref={group} position={home.toArray()}>
      <mesh rotation-z={Math.PI / 2} onPointerOver={onOver} onPointerOut={onOut}>
        <capsuleGeometry args={[0.19, width, 8, 18]} />
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.16}
          clearcoat={1}
          clearcoatRoughness={0.1}
          envMapIntensity={1}
        />
      </mesh>
      <Text
        font="/fonts/nunito-800.woff"
        fontSize={0.17}
        color="#3fa9f5"
        anchorX="center"
        anchorY="middle"
        position-z={0.23}
      >
        {label}
      </Text>
    </group>
  );
}

export function SkillCapsules() {
  const capsules = useMemo(() => {
    const base = ZONES.skills;
    return site.skills.map((label, i) => {
      const row = i % 2;
      const col = Math.floor(i / 2);
      const home = new THREE.Vector3(
        base.x - 1.9 + col * 1.05 + row * 0.45,
        base.y - 1.55 - row * 0.6,
        base.z + 0.7 - col * 0.15 + row * 0.25,
      );
      return { label, home, phase: i * 1.37 };
    });
  }, []);

  return (
    <group>
      {capsules.map((c) => (
        <SkillCapsule key={c.label} {...c} />
      ))}
    </group>
  );
}
