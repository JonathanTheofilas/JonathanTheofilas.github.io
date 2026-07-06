import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { site } from "../content/site";

/**
 * The boot disc: a glossy white disc with a monogram label that slides into
 * the slot at the right screen edge, then reappears centre-stage spinning
 * while the plaza loads behind the overlay.
 */
export function BootDisc({ onInsert }: { onInsert: () => void }) {
  const group = useRef<THREE.Group>(null);
  const spin = useRef(0);
  const inserted = useRef(false);
  const start = useRef<number | null>(null);

  const label = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 512;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#fdfdfd";
    ctx.beginPath();
    ctx.arc(256, 256, 256, 0, Math.PI * 2);
    ctx.fill();
    // label ring
    ctx.strokeStyle = "#dbe7f2";
    ctx.lineWidth = 26;
    ctx.beginPath();
    ctx.arc(256, 256, 196, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "#3fa9f5";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(256, 256, 168, 0, Math.PI * 2);
    ctx.stroke();
    // monogram
    ctx.fillStyle = "#4a4a4a";
    ctx.font = "800 150px Nunito, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(site.monogram, 256, 250);
    // hub
    ctx.fillStyle = "#e8eef4";
    ctx.beginPath();
    ctx.arc(256, 256, 56, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f4f6f8";
    ctx.beginPath();
    ctx.arc(256, 256, 30, 0, Math.PI * 2);
    ctx.fill();
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, []);

  useFrame(({ clock }, dt) => {
    const g = group.current;
    if (!g) return;
    if (start.current === null) start.current = clock.elapsedTime;
    const t = clock.elapsedTime - start.current;

    if (t < 1.5) {
      // glide toward the slot at the right edge
      const p = t / 1.5;
      const e = p * p * (3 - 2 * p);
      g.position.x = -2.4 + e * 5.2;
      g.position.y = Math.sin(p * Math.PI) * 0.15;
      g.scale.setScalar(1);
      spin.current += dt * 1.5;
    } else if (t < 2.1) {
      // slip into the slot (offscreen right)
      inserted.current || (inserted.current = true, onInsert());
      g.position.x = 2.8 + (t - 1.5) * 5;
      spin.current += dt * 4;
    } else {
      // spin-up, centre stage — this IS the loading indicator
      const p = Math.min((t - 2.1) / 0.5, 1);
      g.position.x = 0;
      g.position.y = 0;
      g.scale.setScalar(0.25 + p * 0.95);
      spin.current += dt * (4 + Math.min(t - 2.1, 2.2) * 9);
    }
    g.rotation.z = -spin.current;
    g.rotation.x = -0.18 + Math.sin(clock.elapsedTime * 0.8) * 0.04;
  });

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 4, 6]} intensity={1.6} />
      <directionalLight position={[-4, -2, 3]} intensity={0.5} color="#9fd4ff" />
      <group ref={group} position={[-2.4, 0, 0]}>
        {/* disc body */}
        <mesh rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[1.15, 1.15, 0.05, 72]} />
          <meshPhysicalMaterial
            color="#f2f5f8"
            roughness={0.12}
            clearcoat={1}
            clearcoatRoughness={0.06}
          />
        </mesh>
        {/* label face */}
        <mesh position-z={0.028}>
          <circleGeometry args={[1.12, 72]} />
          <meshBasicMaterial map={label} toneMapped={false} />
        </mesh>
        {/* centre hole */}
        <mesh position-z={0.03}>
          <circleGeometry args={[0.09, 24]} />
          <meshBasicMaterial color="#0b0e12" />
        </mesh>
      </group>
    </>
  );
}
