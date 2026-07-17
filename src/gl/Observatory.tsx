import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { Group } from "three";

/**
 * The Observatory — the hero's centrepiece. Original stylized geometry in
 * the Comet Observatory's composition language: a central spire holding a
 * beacon, ringed by domed platforms with warm-lit glass, gold trim, bridges
 * radiating from the core, and under-skirts tapering off into space so the
 * whole thing reads as afloat.
 *
 * It sits screen-right of the hero type; the flight to the first section
 * passes it close on the left — the arrival.
 */

const PLATFORM = "#2c3a78";
const SKIRT = "#1d2857";
const TOWER = "#3a4a95";
const TRIM = "#ffd75e";
const GLASS = "#7fd8e8";
const WINDOW = "#ffd75e";

function Dome({
  angle,
  dist,
  y,
  roof,
  scale = 1,
}: {
  angle: number;
  dist: number;
  y: number;
  roof: string;
  scale?: number;
}) {
  const bridgeLen = dist - 2.6;
  return (
    <group rotation={[0, -angle, 0]}>
      <group position={[dist, y, 0]} scale={scale}>
        {/* platform + trim */}
        <mesh>
          <cylinderGeometry args={[0.85, 0.95, 0.16, 24]} />
          <meshStandardMaterial color={PLATFORM} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.85, 0.03, 8, 48]} />
          <meshStandardMaterial
            color={TRIM}
            emissive={TRIM}
            emissiveIntensity={0.5}
            roughness={0.3}
          />
        </mesh>
        {/* warm interior, visible through the glass */}
        <mesh position={[0, 0.28, 0]}>
          <cylinderGeometry args={[0.5, 0.55, 0.34, 16]} />
          <meshStandardMaterial
            color={WINDOW}
            emissive={WINDOW}
            emissiveIntensity={0.75}
            roughness={0.6}
          />
        </mesh>
        {/* glass dome */}
        <mesh position={[0, 0.16, 0]}>
          <sphereGeometry args={[0.68, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial
            color={GLASS}
            transparent
            opacity={0.28}
            emissive={GLASS}
            emissiveIntensity={0.15}
            roughness={0.15}
          />
        </mesh>
        {/* finial in the dome's own colour */}
        <mesh position={[0, 0.92, 0]}>
          <coneGeometry args={[0.09, 0.22, 10]} />
          <meshStandardMaterial
            color={roof}
            emissive={roof}
            emissiveIntensity={0.4}
            roughness={0.4}
          />
        </mesh>
        {/* under-skirt, tapering into space */}
        <mesh position={[0, -0.75, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.62, 1.3, 12]} />
          <meshStandardMaterial color={SKIRT} roughness={0.6} />
        </mesh>
      </group>
      {/* bridge back to the core */}
      <mesh position={[2.0 + bridgeLen / 2, y + 0.02, 0]}>
        <boxGeometry args={[bridgeLen, 0.07, 0.3]} />
        <meshStandardMaterial color={SKIRT} roughness={0.55} />
      </mesh>
    </group>
  );
}

export function Observatory() {
  const spin = useRef<Group>(null);

  useFrame((_, dt) => {
    if (spin.current) spin.current.rotation.y += dt * 0.03; // barely turning
  });

  return (
    <Float speed={0.5} floatIntensity={0.4} rotationIntensity={0.04}>
      <group position={[3.6, -0.9, -7.5]}>
        <group ref={spin}>
          {/* core platform */}
          <mesh>
            <cylinderGeometry args={[2.0, 2.15, 0.26, 32]} />
            <meshStandardMaterial color={PLATFORM} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.13, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[2.0, 0.04, 8, 64]} />
            <meshStandardMaterial
              color={TRIM}
              emissive={TRIM}
              emissiveIntensity={0.5}
              roughness={0.3}
            />
          </mesh>
          <mesh position={[0, -1.2, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[1.4, 2.2, 16]} />
            <meshStandardMaterial color={SKIRT} roughness={0.6} />
          </mesh>

          {/* the spire */}
          <mesh position={[0, 1.4, 0]}>
            <cylinderGeometry args={[0.32, 0.42, 2.6, 16]} />
            <meshStandardMaterial color={TOWER} roughness={0.5} />
          </mesh>
          <mesh position={[0, 2.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.36, 0.03, 8, 32]} />
            <meshStandardMaterial
              color={TRIM}
              emissive={TRIM}
              emissiveIntensity={0.5}
            />
          </mesh>
          <mesh position={[0, 3.0, 0]}>
            <coneGeometry args={[0.55, 0.7, 14]} />
            <meshStandardMaterial
              color="#e05d5d"
              emissive="#e05d5d"
              emissiveIntensity={0.2}
              roughness={0.45}
            />
          </mesh>

          {/* the beacon — cyan-white, with real light */}
          <mesh position={[0, 3.62, 0]}>
            <sphereGeometry args={[0.26, 24, 24]} />
            <meshStandardMaterial
              color="#eaffff"
              emissive="#9fe8ff"
              emissiveIntensity={1.4}
              roughness={0.2}
            />
          </mesh>
          <mesh position={[0, 3.62, 0]}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial
              color="#7fd8ff"
              transparent
              opacity={0.16}
              roughness={1}
              depthWrite={false}
            />
          </mesh>
          <pointLight
            position={[0, 3.7, 0]}
            color="#9fe8ff"
            intensity={2.5}
            distance={16}
            decay={2}
          />

          {/* the domes */}
          <Dome angle={0.35} dist={3.4} y={0.3} roof="#e05d5d" />
          <Dome angle={1.66} dist={3.8} y={-0.4} roof="#5cb86e" scale={1.15} />
          <Dome angle={2.97} dist={3.3} y={0.6} roof="#b78aff" scale={0.9} />
          <Dome angle={4.28} dist={4.0} y={-0.2} roof="#ffd75e" />
          <Dome angle={5.41} dist={3.6} y={0.9} roof="#7fe0d8" scale={0.85} />
        </group>
      </group>
    </Float>
  );
}
