import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh } from "three";

/**
 * The Beacon — the Observatory's heart, standing on its own pedestal
 * platform. Cyan-white and flame-shaped rather than a plain sphere: it
 * stretches and flickers like the restored beacon does. A single gold star
 * bit circles it — the last piece of colour on the page.
 *
 * The pointLight is real; the contact section genuinely basks in it.
 */
export function FinaleOrb() {
  const core = useRef<Mesh>(null);
  const halo = useRef<Mesh>(null);
  const spark = useRef<Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // flame flicker: two incommensurate sines so it never loops visibly
    const sx = 0.92 + 0.05 * Math.sin(t * 3.1) + 0.03 * Math.sin(t * 7.3);
    const sy = 1.25 + 0.09 * Math.sin(t * 2.3) + 0.04 * Math.sin(t * 5.7);
    core.current?.scale.set(sx, sy, sx);
    halo.current?.scale.setScalar(1.5 + 0.08 * Math.sin(t * 0.7));
    if (spark.current) {
      const a = t * 0.7;
      spark.current.position.set(
        Math.cos(a) * 1.7,
        0.3 + Math.sin(a * 0.8) * 0.5,
        Math.sin(a) * 1.7,
      );
    }
  });

  return (
    <group position={[2.7, 0.35, -122]}>
      <pointLight color="#9fe8ff" intensity={3.5} distance={30} decay={2} />

      {/* the flame */}
      <mesh ref={core} position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshStandardMaterial
          color="#eaffff"
          emissive="#9fe8ff"
          emissiveIntensity={1.3}
          roughness={0.2}
        />
      </mesh>
      <mesh ref={halo} position={[0, 0.25, 0]}>
        <sphereGeometry args={[0.8, 24, 24]} />
        <meshStandardMaterial
          color="#7fd8ff"
          transparent
          opacity={0.16}
          roughness={1}
          depthWrite={false}
        />
      </mesh>

      {/* pedestal — platform, gold trim, skirt into space */}
      <group position={[0, -1.15, 0]}>
        <mesh position={[0, 0.42, 0]}>
          <cylinderGeometry args={[0.34, 0.44, 0.5, 14]} />
          <meshStandardMaterial color="#3a4a95" roughness={0.5} />
        </mesh>
        <mesh>
          <cylinderGeometry args={[1.25, 1.35, 0.18, 26]} />
          <meshStandardMaterial color="#2c3a78" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.09, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.25, 0.035, 8, 52]} />
          <meshStandardMaterial
            color="#ffd75e"
            emissive="#ffd75e"
            emissiveIntensity={0.5}
            roughness={0.3}
          />
        </mesh>
        <mesh position={[0, -0.95, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.85, 1.7, 12]} />
          <meshStandardMaterial color="#1d2857" roughness={0.6} />
        </mesh>
      </group>

      {/* one gold star bit, orbiting */}
      <mesh ref={spark}>
        <octahedronGeometry args={[0.09, 0]} />
        <meshBasicMaterial color="#ffd75e" toneMapped={false} />
      </mesh>
    </group>
  );
}
