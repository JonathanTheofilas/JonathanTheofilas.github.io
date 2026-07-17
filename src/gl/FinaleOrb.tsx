import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh } from "three";

/**
 * The last thing on the page: a single glowing orb, breathing. It's the
 * loader's bloom made physical — the site opens with the glow and closes on
 * it. Bookends.
 */
export function FinaleOrb() {
  const core = useRef<Mesh>(null);
  const halo = useRef<Mesh>(null);
  const spark = useRef<Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const s = 0.9 + 0.05 * Math.sin(t * 1.1);
    core.current?.scale.setScalar(s);
    halo.current?.scale.setScalar(s * 1.6 + 0.1 * Math.sin(t * 0.7));
    if (spark.current) {
      const a = t * 0.7;
      spark.current.position.set(
        Math.cos(a) * 1.7,
        Math.sin(a * 0.8) * 0.5,
        Math.sin(a) * 1.7,
      );
    }
  });

  return (
    // x 2.7 clears the contact links' 640px column — the orb shares the
    // frame with "Say hi", it doesn't sit on it.
    <group position={[2.7, 0.35, -122]}>
      <mesh ref={core}>
        <sphereGeometry args={[0.8, 48, 48]} />
        <meshStandardMaterial
          color="#dff0fb"
          emissive="#4a9fd8"
          emissiveIntensity={0.55}
          roughness={0.2}
        />
      </mesh>
      <mesh ref={halo}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial
          color="#7ed0ff"
          transparent
          opacity={0.12}
          roughness={1}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={spark}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#7ed0ff"
          emissiveIntensity={0.8}
        />
      </mesh>
    </group>
  );
}
