import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const SimpleSphere = ({ isSpeaking }) => {
  const mesh = useRef();
  const particleCount = 5000;

  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      const x = Math.sin(phi) * Math.cos(theta) * 0.8;
      const y = Math.sin(phi) * Math.sin(theta) * 1.2; 
      const z = Math.cos(phi) * 0.8;

      pos.set([x, y, z], i * 3);
    }
    return pos;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    mesh.current.rotation.y = Math.sin(t * 0.2) * 0.1;

    if (isSpeaking) {
      const scale = 1 + Math.sin(t * 25) * 0.02;
      mesh.current.scale.set(scale, scale, scale);
      mesh.current.material.opacity = 0.6 + Math.sin(t * 25) * 0.4;
    } else {
      mesh.current.scale.set(1, 1, 1);
      mesh.current.material.opacity = 0.8;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial 
        size={0.01} 
        color="#00f2ff" 
        transparent 
        blending={THREE.AdditiveBlending} 
        depthWrite={false}
        opacity={0.8}
      />
    </points>
  );
};

export default function AIHead({ isSpeaking = false }) {
  return (
    <div className="relative w-full h-[600px] flex items-center justify-center bg-[#020617] rounded-2xl overflow-hidden">
      <div className="absolute w-[480px] h-[480px] rounded-full border-2 border-blue-500/40 shadow-[0_0_100px_rgba(0,180,255,0.4)] animate-pulse" />
      
      <Canvas camera={{ position: [0, 0, 3], fov: 40 }}>
        <SimpleSphere isSpeaking={isSpeaking} />
      </Canvas>
      
      <div className="absolute bottom-10 flex flex-col items-center">
        <h1 className="text-cyan-400 text-2xl font-bold tracking-[0.3em] uppercase">Rendix</h1>
        <span className="text-cyan-800 text-xs font-mono uppercase">Vocal AI Assistant</span>
      </div>
    </div>
  );
}
