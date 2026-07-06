import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, Text } from "@react-three/drei";
import * as THREE from "three";

interface Props {
  position: THREE.Vector3;
  rotationY?: number;
  title?: string;
  label?: string;
  bobOffset?: number;
  dim?: boolean;
}

/**
 * A floating Wii-menu channel card: glossy white rounded rect with a title
 * on its face and a small label pill underneath. `dim` renders the blank
 * placeholder channels that pad out the plaza.
 */
export function ChannelPanel({
  position,
  rotationY = 0,
  title,
  label,
  bobOffset = 0,
  dim = false,
}: Props) {
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.elapsedTime + bobOffset;
    group.current.position.y = position.y + Math.sin(t * 0.55) * 0.09;
    group.current.rotation.z = Math.sin(t * 0.4) * 0.012;
  });

  return (
    <group
      ref={group}
      position={position.toArray()}
      rotation-y={rotationY}
    >
      <RoundedBox args={[2.6, 1.7, 0.16]} radius={0.14} smoothness={5}>
        <meshPhysicalMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={dim ? 0.18 : 0.32}
          roughness={0.14}
          clearcoat={1}
          clearcoatRoughness={0.1}
          envMapIntensity={dim ? 0.7 : 1.15}
        />
      </RoundedBox>

      {/* thin blue rim glow behind the card */}
      <RoundedBox args={[2.74, 1.84, 0.02]} radius={0.16} position-z={-0.09}>
        <meshBasicMaterial
          color="#9edcff"
          transparent
          opacity={dim ? 0.12 : 0.5}
        />
      </RoundedBox>

      {title && (
        <Text
          font="/fonts/nunito-800.woff"
          fontSize={0.34}
          color="#5a6672"
          anchorX="center"
          anchorY="middle"
          position-z={0.095}
        >
          {title}
        </Text>
      )}

      {label && (
        <Text
          font="/fonts/nunito-700.woff"
          fontSize={0.2}
          color="#8a949e"
          anchorX="center"
          anchorY="middle"
          position={[0, -1.18, 0.02]}
        >
          {label}
        </Text>
      )}
    </group>
  );
}
