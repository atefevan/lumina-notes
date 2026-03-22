'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function AnimatedSphere() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <Sphere args={[1, 100, 100]} scale={2.5}>
        <MeshDistortMaterial
          color="#10b981"
          attach="material"
          distort={0.4}
          speed={1.5}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  );
}

function Particles() {
  const count = 2000;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Use a simple deterministic pseudo-random if needed, 
      // but for particles, we just want them distributed once.
      pos[i * 3] = (Math.sin(i) * 10000 % 1) * 20 - 10;
      pos[i * 3 + 1] = (Math.cos(i) * 10000 % 1) * 20 - 10;
      pos[i * 3 + 2] = (Math.sin(i * i) * 10000 % 1) * 20 - 10;
    }
    return pos;
  }, []);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#34d399" transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}

export default function Scene() {
  return (
    <div className="fixed inset-0 -z-10 bg-zinc-950">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} />
        <AnimatedSphere />
        <Particles />
      </Canvas>
    </div>
  );
}
