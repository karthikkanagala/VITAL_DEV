import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useRef, useMemo, Suspense, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import GlowButton from '../ui/GlowButton';
import { FiChevronDown } from 'react-icons/fi';

/* ── Floating Particles ── */
function FloatingParticles({ count = 2000 }) {
  const ref = useRef();

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, [count]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.03;
    ref.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.01) * 0.1;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#00DC78" size={0.02} transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

/* ── Glowing Wireframe Ring ── */
function GlowRing({ radius = 3, rotationSpeed = 0.3, axis = [0, 1, 0], color = '#11C4D4' }) {
  const ref = useRef();

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() * rotationSpeed;
    ref.current.rotation.x = axis[0] * t;
    ref.current.rotation.y = axis[1] * t;
    ref.current.rotation.z = axis[2] * t;
  });

  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, 0.008, 16, 100]} />
      <meshBasicMaterial color={color} transparent opacity={0.35} />
    </mesh>
  );
}

/* ── Scene – adapts opacity for light mode ── */
function Scene({ isDark }) {
  const { gl } = useThree();
  const groupRef = useRef();

  useEffect(() => {
    gl.setClearColor(new THREE.Color(0x000000), 0);
  }, [gl]);

  return (
    <group ref={groupRef}>
      <group renderOrder={1}>
        <FloatingParticles />
      </group>
      <group renderOrder={2}>
        <GlowRing radius={3.2} rotationSpeed={0.2} axis={[0.3, 1, 0.1]} color="#11C4D4" />
        <GlowRing radius={2.6} rotationSpeed={0.35} axis={[1, 0.2, 0.4]} color="#00DC78" />
        <GlowRing radius={3.8} rotationSpeed={0.15} axis={[0.1, 0.5, 1]} color="#11C4D4" />
      </group>
    </group>
  );
}

/* ── Typewriter Hook ── */
function useTypewriter(text, speed = 65, startDelay = 600) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let timeout;
    let i = 0;
    const start = () => {
      const tick = () => {
        if (i <= text.length) {
          setDisplayed(text.slice(0, i));
          i++;
          timeout = setTimeout(tick, speed);
        } else {
          setDone(true);
        }
      };
      tick();
    };
    timeout = setTimeout(start, startDelay);
    return () => clearTimeout(timeout);
  }, [text, speed, startDelay]);

  return { displayed, done };
}

/* ── Stats Row Data ── */
const heroStats = [
  { value: '50,000+', label: 'Assessments' },
  { value: '3', label: 'Diseases Detected' },
  { value: '82%', label: 'Model Accuracy' },
  { value: 'Free', label: 'Forever' },
];

export default function HeroSection() {
  const line1 = 'Know Your Risk.';
  const line2 = "Before It's Too Late.";
  const tw1 = useTypewriter(line1, 65, 500);
  const tw2 = useTypewriter(line2, 65, 500 + line1.length * 65 + 400);

  const [isDark, setIsDark] = useState(true);
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* 3D Background */}
      <div className={`absolute inset-0 z-0 transition-opacity duration-500 ${isDark ? 'opacity-100' : 'opacity-20'}`}>
        <Canvas camera={{ position: [0, 0, 6], fov: 50 }} gl={{ alpha: true }}>
          <Suspense fallback={null}>
            <Scene isDark={isDark} />
          </Suspense>
        </Canvas>
      </div>

      {/* Radial overlay */}
      <div className="absolute inset-0 z-[1] dark:bg-[radial-gradient(ellipse_at_center,transparent_30%,#080A08_75%)] bg-[radial-gradient(ellipse_at_center,transparent_30%,#F0FAF4_75%)]" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <span className="inline-block px-4 py-1.5 bg-neon-500/10 text-neon-500 text-xs font-semibold rounded-full mb-8 border border-neon-500/20 tracking-wider">
            INDIA&apos;S FIRST AI-POWERED HEALTH RISK PLATFORM
          </span>
        </motion.div>

        {/* Typewriter Heading */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 min-h-[1em]">
          <span className="dark:text-darktext text-lighttext">{tw1.displayed}</span>
          {!tw1.done && (
            <span className="inline-block w-[3px] h-[0.85em] bg-neon-500 ml-1 animate-pulse align-middle" />
          )}
          <br />
          <span className="bg-gradient-to-r from-[#00DC78] to-[#11C4D4] bg-clip-text text-transparent">
            {tw2.displayed}
          </span>
          {tw1.done && !tw2.done && (
            <span className="inline-block w-[3px] h-[0.85em] bg-neon-500 ml-1 animate-pulse align-middle" />
          )}
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.2, duration: 0.8 }}
          className="dark:text-darksub text-lightsub text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          Enter basic health data — no lab tests needed. Our ML model predicts
          your risk for <span className="dark:text-darktext text-lighttext font-medium">diabetes</span>,{' '}
          <span className="dark:text-darktext text-lighttext font-medium">heart disease</span> &{' '}
          <span className="dark:text-darktext text-lighttext font-medium">stroke</span> in seconds.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.6, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
        >
          <Link to="/auth">
            <GlowButton size="lg">Check My Risk Now →</GlowButton>
          </Link>
          <a href="#how-it-works">
            <button className="px-8 py-3.5 rounded-lg border dark:border-darkborder border-lightborder dark:text-darksub text-lightsub hover:border-neon-500/30 hover:text-neon-500 transition-all duration-200 font-medium">
              See How It Works ↓
            </button>
          </a>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 4, duration: 0.7 }}
          className="flex flex-wrap justify-center gap-6"
        >
          {heroStats.map((s, i) => (
            <div
              key={i}
              className="px-5 py-3 rounded-xl dark:bg-darkcard/60 bg-white/60 backdrop-blur border dark:border-darkborder border-lightborder text-center"
            >
              <div className="text-xl sm:text-2xl font-bold dark:text-darktext text-lighttext">{s.value}</div>
              <div className="text-xs dark:text-darksub text-lightsub mt-0.5">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 4.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <FiChevronDown className="text-neon-500/60 text-2xl animate-bounce-slow" />
      </motion.div>
    </section>
  );
}
