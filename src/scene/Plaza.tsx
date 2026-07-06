import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, Lightformer, Text } from "@react-three/drei";
import * as THREE from "three";
import { site } from "../content/site";
import { ZONES } from "./layout";
import { ChannelPanel } from "./ChannelPanel";

/** Endless soft-white floor with a radial gradient baked into a canvas texture. */
function Floor() {
  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 512;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(256, 256, 40, 256, 256, 256);
    g.addColorStop(0, "#ffffff");
    g.addColorStop(0.55, "#f2f5f8");
    g.addColorStop(1, "#dfe6ec");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 512);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

  return (
    <mesh rotation-x={-Math.PI / 2} position-y={0} receiveShadow>
      <circleGeometry args={[46, 64]} />
      <meshStandardMaterial map={texture} roughness={0.55} metalness={0} />
    </mesh>
  );
}

/** The visitor's name floating over the plaza, Wii-channel typography. */
function NameSign() {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.position.y =
      ZONES.name.y + Math.sin(clock.elapsedTime * 0.6) * 0.08;
    group.current.rotation.y = Math.sin(clock.elapsedTime * 0.25) * 0.03;
  });

  return (
    <group ref={group} position={ZONES.name.toArray()}>
      <Text
        font="/fonts/nunito-800.woff"
        fontSize={1.05}
        letterSpacing={0.02}
        color="#4a4a4a"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.028}
        outlineColor="#ffffff"
      >
        {site.name}
      </Text>
      <Text
        font="/fonts/nunito-700.woff"
        fontSize={0.34}
        letterSpacing={0.14}
        color="#3fa9f5"
        anchorX="center"
        anchorY="middle"
        position={[0, -0.95, 0]}
        outlineWidth={0.012}
        outlineColor="#ffffff"
      >
        {`${site.tagline} — ${site.location.toLowerCase()}`}
      </Text>
    </group>
  );
}

/** Soft studio lighting: bright, clean product-render look, no HDR download. */
function Studio() {
  return (
    <>
      <ambientLight intensity={0.85} />
      <directionalLight position={[6, 10, 4]} intensity={1.25} color="#ffffff" />
      <directionalLight position={[-8, 6, -4]} intensity={0.35} color="#cfe8ff" />
      <Environment frames={1} resolution={128}>
        {/* big softbox overhead */}
        <Lightformer
          form="rect"
          intensity={2.2}
          position={[0, 8, 0]}
          rotation-x={-Math.PI / 2}
          scale={[14, 14, 1]}
          color="#ffffff"
        />
        {/* cool blue rim from the sides — the Wii-blue sheen on gloss */}
        <Lightformer
          form="rect"
          intensity={1.1}
          position={[-10, 3, 2]}
          rotation-y={Math.PI / 2}
          scale={[9, 5, 1]}
          color="#bfe3ff"
        />
        <Lightformer
          form="rect"
          intensity={0.9}
          position={[10, 3, -2]}
          rotation-y={-Math.PI / 2}
          scale={[9, 5, 1]}
          color="#dceeff"
        />
        <Lightformer
          form="rect"
          intensity={0.6}
          position={[0, 2, -12]}
          scale={[12, 4, 1]}
          color="#ffffff"
        />
      </Environment>
    </>
  );
}

export function Plaza() {
  return (
    <group>
      <Studio />
      <Floor />
      <NameSign />

      {/* Section channels — the "site map" floating in the space */}
      <ChannelPanel
        position={ZONES.about}
        rotationY={0.62}
        title="About"
        label="About me"
        bobOffset={0}
      />
      <ChannelPanel
        position={ZONES.skills}
        rotationY={-0.62}
        title="Skills"
        label="What I use"
        bobOffset={1.7}
      />
      <ChannelPanel
        position={ZONES.contact}
        rotationY={0}
        title="Contact"
        label="Say hi"
        bobOffset={3.1}
      />

      {/* blank channels, like the empty slots on the Wii menu */}
      <ChannelPanel position={new THREE.Vector3(-8, 2.6, -9)} rotationY={0.35} bobOffset={2.2} dim />
      <ChannelPanel position={new THREE.Vector3(8, 2.9, -9.5)} rotationY={-0.3} bobOffset={4.4} dim />
      <ChannelPanel position={new THREE.Vector3(-11.5, 3.4, -7.5)} rotationY={0.8} bobOffset={5.1} dim />
    </group>
  );
}
