'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { MotionValue } from 'framer-motion';

const MODEL = '/ball.glb';

function Studio() {
  const { gl, scene } = useThree();

  useLayoutEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    return () => {
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[3.2, 4, 5]} intensity={1.35} />
      <directionalLight position={[-3.5, -1, -2]} intensity={0.35} color="#c5d7ff" />
    </>
  );
}

function Ball({ progress, still }: { progress: MotionValue<number>; still: boolean }) {
  const { scene } = useGLTF(MODEL);
  const ball = useMemo(() => scene.clone(true), [scene]);
  const spin = useRef<THREE.Group>(null);

  useLayoutEffect(() => {
    const group = spin.current;
    if (!group) return;
    group.scale.setScalar(1);
    group.position.set(0, 0, 0);
    group.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(group);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const max = Math.max(size.x, size.y, size.z) || 1;
    const scale = 1.95 / max;
    group.scale.setScalar(scale);
    group.position.copy(center).multiplyScalar(-scale);
  }, [ball]);

  useFrame(() => {
    if (!spin.current || still) return;
    const t = progress.get();
    spin.current.rotation.x = t * Math.PI * 2.6 + Math.sin(t * Math.PI * 2) * 1.1;
    spin.current.rotation.y = t * Math.PI * 4.2;
    spin.current.rotation.z = t * Math.PI * 1.8 + Math.sin(t * Math.PI * 3) * 0.95;
  });

  return (
    <group ref={spin}>
      <primitive object={ball} />
    </group>
  );
}

export default function StatementBall({
  progress,
  still,
}: {
  progress: MotionValue<number>;
  still: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: '180px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="pointer-events-none absolute right-0 top-1/2 z-0 hidden h-[min(88vh,760px)] w-[min(88vh,760px)] translate-x-1/2 -translate-y-1/2 md:block">
      <Canvas
        className="h-full w-full"
        camera={{ position: [0, 0, 4.2], fov: 30 }}
        dpr={[1, 1.5]}
        frameloop={visible && !still ? 'always' : 'never'}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance', stencil: false }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <Studio />
        <Ball progress={progress} still={still} />
      </Canvas>
    </div>
  );
}

useGLTF.preload(MODEL);
