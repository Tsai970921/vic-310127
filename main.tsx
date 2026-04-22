import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from 'motion/react';
import { Menu, X, Instagram, Facebook, Mail, ArrowRight, Play, Pause, Music } from 'lucide-react';
import { ParticleContainer, triggerBurst } from './components/ParticleBurst';

// --- Global Music State ---
let audioInstance: HTMLAudioElement | null = null;

const MusicPlayer = ({ 
  isPlaying, 
  setIsPlaying, 
  isActivated, 
  setIsPlayerReady 
}: { 
  isPlaying: boolean; 
  setIsPlaying: (v: boolean) => void;
  isActivated: boolean;
  setIsPlayerReady: (v: boolean) => void;
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrl = "https://files.catbox.moe/hlxy3a.mp3";

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audio.loop = true;
    audioRef.current = audio;
    audioInstance = audio;

    const handleCanPlay = () => {
      console.log("Audio: Ready to play");
      setIsPlayerReady(true);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = (e: any) => {
      console.error("Audio Error:", e);
      setIsPlayerReady(true); // Allow entry even if audio fails
    };

    audio.addEventListener('canplaythrough', handleCanPlay);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    // Initial check
    if (audio.readyState >= 3) setIsPlayerReady(true);

    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlay);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audioInstance = null;
    };
  }, [setIsPlaying, setIsPlayerReady]);

  // Handle activation play
  useEffect(() => {
    if (isActivated && audioRef.current) {
      console.log("Audio: Activation triggered, playing...");
      audioRef.current.play().catch(err => {
        console.error("Playback failed:", err);
      });
    }
  }, [isActivated]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => console.error("Toggle play failed:", err));
      }
    }
  };

  return (
    <>
      {isActivated && (
        <div className="fixed bottom-8 right-8 z-[100] flex items-center gap-4 bg-ocean/40 backdrop-blur-xl border border-aqua/30 p-2 pr-6 rounded-full shadow-2xl group transition-all hover:border-aqua/60">
          <button 
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-aqua flex items-center justify-center text-ocean transition-transform hover:scale-110 active:scale-95 shadow-[0_0_15px_rgba(123,213,245,0.4)]"
          >
            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-[0.2em] text-aqua/60 font-medium">Now Playing</span>
            <span className="text-xs font-sans text-white tracking-widest whitespace-nowrap">星降る海 - Starry Sea</span>
          </div>
          
          {/* Visualizer bars */}
          <div className="flex items-end gap-[2px] h-3 ml-2">
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                animate={isPlaying ? { height: [4, 12, 6, 10, 4], backgroundColor: ['#7BD5F5', '#B2EBF2', '#7BD5F5'] } : { height: 2, backgroundColor: '#7BD5F5' }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
                className="w-[2px] rounded-full"
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

const ActivationOverlay = ({ onActivate, isReady }: { onActivate: () => void; isReady: boolean }) => {
  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="fixed inset-0 z-[200] bg-[#020617] flex flex-col items-center justify-center p-6 text-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-md relative z-10"
      >
        <div className="mb-12">
          <div className="w-20 h-20 border-2 border-aqua/20 rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-t-2 border-aqua rounded-full"
            />
            <Music className="text-aqua" size={32} />
          </div>
          <h2 className="font-display text-2xl text-white tracking-[0.2em] uppercase mb-4">Welcome to the Experience</h2>
          <p className="text-white/40 font-sans text-sm tracking-widest leading-relaxed">
            Please enable audio to fully immerse yourself in the Starry Sea soundtrack.
          </p>
        </div>

        <button
          onClick={() => {
            console.log("ActivationOverlay: Button clicked, isReady:", isReady);
            onActivate();
          }}
          className="group relative px-10 py-4 bg-transparent border border-aqua/50 overflow-hidden transition-all duration-500 hover:border-aqua hover:shadow-[0_0_30px_rgba(123,213,245,0.2)] cursor-pointer active:scale-95"
        >
          <div className="absolute inset-0 bg-aqua translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
          <span className="relative z-10 font-display text-sm tracking-[0.3em] uppercase text-aqua group-hover:text-ocean transition-colors duration-500">
            Welcome
          </span>
        </button>
      </motion.div>
    </motion.div>
  );
};

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { path: '/', label: '首頁 Home' },
    { path: '/about', label: '關於 About' },
    { path: '/projects', label: '遊戲推薦 Games' },
    { path: '/anime', label: '動畫推薦 Anime' },
    { path: '/contact', label: '個人資訊 Info' },
  ];

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled ? 'bg-ocean/80 backdrop-blur-xl border-b border-aqua/20 py-4' : 'py-8'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
        <NavLink 
          to="/"
          className="font-display font-bold text-2xl tracking-widest text-white hover:text-aqua transition-all hover:drop-shadow-[0_0_10px_rgba(123,213,245,0.8)]"
        >
          [ Tsam ]<span className="text-aqua">.</span>
        </NavLink>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-10">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => 
                `text-xs tracking-[0.2em] uppercase font-medium transition-all nav-link-glow ${
                  isActive ? 'text-aqua drop-shadow-[0_0_8px_rgba(123,213,245,0.8)]' : 'text-white/80'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white hover:text-aqua transition-colors"
          onClick={() => setIsMenuOpen(true)}
        >
          <Menu size={32} strokeWidth={1.5} />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ocean/95 backdrop-blur-2xl z-[60] flex flex-col items-center justify-center gap-10"
          >
            <button 
              className="absolute top-8 right-8 text-white hover:text-aqua"
              onClick={() => setIsMenuOpen(false)}
            >
              <X size={40} strokeWidth={1.5} />
            </button>
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) => 
                  `font-display text-2xl tracking-[0.2em] uppercase transition-colors hover:text-aqua ${
                    isActive ? 'text-aqua' : 'text-white'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

const SakuraPetal = ({ delay }: { delay: number; key?: number }) => {
  const randomX = Math.random() * 100; // 0 to 100vw
  const duration = 10 + Math.random() * 10; // 10 to 20 seconds
  const size = 10 + Math.random() * 15; // 10 to 25px

  return (
    <motion.div
      initial={{ 
        top: -50, 
        left: `${randomX}%`, 
        opacity: 0,
        rotate: 0,
        scale: 0.5
      }}
      animate={{ 
        top: '110vh',
        left: `${randomX + (Math.random() * 20 - 10)}%`,
        opacity: [0, 0.8, 0.8, 0],
        rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
        scale: [0.5, 1, 1, 0.5]
      }}
      transition={{ 
        duration, 
        repeat: Infinity, 
        delay,
        ease: "linear" 
      }}
      className="absolute pointer-events-none z-0"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full text-aqua/60 fill-none stroke-current stroke-[3]">
        {/* Stylized line-art cherry blossom petal */}
        <path d="M50 10 C60 40 90 50 50 90 C10 50 40 40 50 10" />
        <line x1="50" y1="10" x2="50" y2="50" />
      </svg>
    </motion.div>
  );
};

const SakuraEffect = () => {
  const petals = Array.from({ length: 15 });
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {petals.map((_, i) => (
        <SakuraPetal key={i} delay={i * 1.5} />
      ))}
    </div>
  );
};

const CursorTrail = () => {
  const [points, setPoints] = useState<{x: number, y: number, id: number}[]>([]);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setPoints(prev => [...prev.slice(-15), { x: e.clientX, y: e.clientY, id: Date.now() }]);
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[999]">
      {points.map((p, i) => (
        <motion.div
          key={p.id}
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 0, opacity: 0 }}
          className="absolute w-2 h-2 bg-aqua rounded-full blur-[2px]"
          style={{ left: p.x, top: p.y, opacity: i / points.length }}
        />
      ))}
    </div>
  );
};

const SystemLogs = () => {
  const logs = [
    "CALCULATING_AIRFOIL_LIFT...",
    "SIMULATING_BERNOULLI_FLOW...",
    "FRONTEND_POLISHING_IN_PROGRESS",
    "RECHARGING_ANIME_ENERGY",
    "LEVEL_17_STABILITY_CHECK: OK"
  ];
  const [log, setLog] = useState(logs[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLog(logs[Math.floor(Math.random() * logs.length)]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-32 left-8 z-50 font-mono text-[10px] text-aqua/40 flex items-center gap-2">
      <span className="w-1.5 h-1.5 bg-aqua rounded-full animate-ping" />
      {log}
    </div>
  );
};

const ParallaxSection = ({ image, title }: { image: string, title: string }) => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]); // 背景移動慢一點

  return (
    <div className="relative h-[400px] overflow-hidden rounded-3xl group">
      <motion.img 
        src={image} 
        style={{ y, scale: 1.2 }} 
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] group-hover:backdrop-blur-none transition-all duration-700" />
      <h2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white font-black text-4xl tracking-tighter italic">
        {title}
      </h2>
    </div>
  );
};

const GameHUD = () => {
  const { scrollYProgress } = useScroll();

  // --- 緩衝核心：Spring Physics ---
  // stiffness: 剛性 (數值高則回彈快), damping: 阻尼 (數值高則震盪少)
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // 即時計算顯示的百分比文字
  const [percent, setPercent] = useState(0);
  useEffect(() => {
    return scrollYProgress.on("change", (v) => setPercent(Math.floor(v * 100)));
  }, [scrollYProgress]);

  // 文字的透明度隨滾動出現
  const opacity = useTransform(scrollYProgress, [0, 0.05], [0, 1]);

  return (
    <>
      {/* 頂部：彈性緩衝進度條 */}
      <div className="fixed top-0 left-0 right-0 h-1.5 z-[100] bg-white/5 overflow-hidden">
        <motion.div 
          className="h-full bg-gradient-to-r from-aqua/40 via-aqua to-white shadow-[0_0_20px_rgba(123,213,245,0.8)]"
          style={{ scaleX, transformOrigin: "0%" }}
        />
      </div>

      {/* 右上角：動態 EXP 數值 (只在滾動後顯示) */}
      <motion.div 
        style={{ opacity }}
        className="fixed top-6 right-8 z-[100] hidden md:flex flex-col items-end pointer-events-none"
      >
        <div className="flex items-baseline gap-2">
          <span className="text-[10px] font-mono text-aqua/50 tracking-tighter uppercase">Exploration Exp</span>
          <span className="text-3xl font-display font-black text-white italic drop-shadow-[0_0_10px_rgba(123,213,245,0.3)]">
            {percent}%
          </span>
        </div>
        <div className="w-32 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
           <motion.div 
             className="h-full bg-aqua"
             style={{ width: `${percent}%` }}
           />
        </div>
      </motion.div>

      {/* 左下角：等級勳章 (Spring 彈入動畫) */}
      <motion.div 
        initial={{ x: -150, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 20, delay: 1 }}
        className="fixed bottom-8 left-8 z-[100] flex items-center gap-4 bg-ocean/60 backdrop-blur-xl border border-aqua/20 p-1.5 pr-5 rounded-full shadow-2xl"
      >
        <div className="w-12 h-12 rounded-full bg-aqua flex items-center justify-center text-ocean font-bold text-lg shadow-[0_0_20px_rgba(123,213,245,0.4)] relative">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border border-dashed border-ocean/30"
          />
          17
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-[0.2em] text-aqua/60 font-medium">Player Rank</span>
          <span className="text-sm font-bold text-white tracking-widest uppercase">Senior Student</span>
        </div>
      </motion.div>
    </>
  );
};

const RadarChart = () => {
  const skills = [
    { label: "物理", value: 90 },
    { label: "前端", value: 85 },
    { label: "遊戲", value: 95 },
    { label: "肝劇", value: 80 },
    { label: "幽默", value: 75 }
  ];

  // 計算多邊形點位的簡易邏輯
  const points = skills.map((s, i) => {
    const angle = (Math.PI * 2 * i) / skills.length;
    const r = s.value * 0.8; 
    return `${100 + r * Math.sin(angle)},${100 - r * Math.cos(angle)}`;
  }).join(" ");

  return (
    <div className="flex flex-col items-center glass p-6 rounded-3xl border border-white/10">
      <svg width="200" height="200" viewBox="0 0 200 200" className="drop-shadow-[0_0_10px_rgba(123,213,245,0.5)]">
        <polygon points={points} className="fill-aqua/20 stroke-aqua stroke-2" />
        {/* 畫背景網格 */}
        {[0.2, 0.4, 0.6, 0.8, 1].map(m => (
          <circle key={m} cx="100" cy="100" r={80 * m} className="fill-none stroke-white/10" strokeWidth="0.5" />
        ))}
      </svg>
      <div className="grid grid-cols-3 gap-2 mt-4 text-[10px] text-white/50 uppercase tracking-tighter">
        {skills.map(s => <span key={s.label}>{s.label} {s.value}%</span>)}
      </div>
    </div>
  );
};

const NotFound = () => (
  <div className="h-screen flex flex-col items-center justify-center bg-ocean text-white">
    <motion.h1 
      animate={{ y: [0, -20, 0] }}
      transition={{ repeat: Infinity, duration: 2 }}
      className="text-9xl font-black text-aqua"
    >
      404
    </motion.h1>
    <p className="mt-8 text-xl tracking-[0.5em] uppercase opacity-50">重力異常：此頁面已飄向虛空</p>
    <NavLink to="/" className="mt-12 px-8 py-3 border border-aqua text-aqua hover:bg-aqua hover:text-ocean transition-all">
      回到安全地帶
    </NavLink>
  </div>
);

const SakuraIllustration = ({ className = "top-0 right-0 justify-end items-start", opacity = 0.5 }: { className?: string; opacity?: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.05, x: 30, y: -20 }}
      animate={{ opacity: opacity, scale: 1, x: 0, y: 0 }}
      transition={{ duration: 2, ease: [0.2, 0, 0.2, 1] }}
      className={`absolute w-full h-full pointer-events-none z-0 overflow-hidden flex ${className}`}
    >
      <svg
        viewBox="0 0 1000 1000"
        fill="none"
        className="w-[80%] h-auto text-white stroke-current"
        style={{ strokeWidth: 0.8, filter: 'drop-shadow(0 0 10px rgba(178, 235, 242, 0.5))' }}
      >
        {/* Main Branch - Fine liner style with slight irregularities */}
        <path d="M950 50 C 900 120, 800 180, 650 150 S 400 250, 350 450" />
        <path d="M948 52 C 898 122, 798 182, 648 152 S 398 252, 348 452" opacity="0.6" />
        
        {/* Secondary Branches */}
        <path d="M650 150 C 600 100, 520 120, 480 200" />
        <path d="M800 180 C 830 250, 780 320, 720 380" />
        <path d="M480 200 C 450 180, 400 190, 370 230" />
        
        {/* Detailed Sakura Blossoms - Line Art Style */}
        {/* Cluster 1 */}
        <g transform="translate(950, 50) rotate(-20)">
          <path d="M0 -20 Q 8 -30 16 -20 Q 24 -10 16 0 Q 8 10 0 0 Q -8 10 -16 0 Q -24 -10 -16 -20 Q -8 -30 0 -20" />
          <path d="M0 -15 L0 0 M-12 -10 L12 -10" opacity="0.7" />
          <path d="M2 -18 Q 7 -25 12 -18" opacity="0.5" />
        </g>
        
        {/* Cluster 2 */}
        <g transform="translate(650, 150) rotate(15)">
          <path d="M0 -15 Q 6 -22 12 -15 Q 18 -8 12 0 Q 6 8 0 0 Q -6 8 -12 0 Q -18 -8 -12 -15 Q -6 -22 0 -15" />
          <path d="M0 -15 L0 0 M-9 -7 L9 -7" opacity="0.7" />
          <circle cx="0" cy="-7" r="2" strokeDasharray="1 1" />
        </g>

        {/* Cluster 3 */}
        <g transform="translate(480, 200) rotate(-45)">
          <path d="M0 -12 Q 5 -18 10 -12 Q 15 -6 10 0 Q 5 6 0 0 Q -5 6 -10 0 Q -15 -6 -10 -12 Q -5 -18 0 -12" />
          <path d="M0 -12 L0 0" opacity="0.6" />
        </g>

        {/* Cluster 4 */}
        <g transform="translate(720, 380) rotate(10)">
          <path d="M0 -18 Q 7 -26 14 -18 Q 21 -10 14 0 Q 7 10 0 0 Q -7 10 -14 0 Q -21 -10 -14 -18 Q -7 -26 0 -18" />
          <path d="M0 -18 L0 0 M-10 -9 L10 -9" opacity="0.8" />
        </g>

        {/* Floating Petals - Line Art */}
        <g transform="translate(300, 600) rotate(30)">
          <path d="M0 0 Q 5 -10 10 0 Q 5 10 0 0" />
          <line x1="0" y1="0" x2="5" y2="0" opacity="0.6" />
        </g>
        <g transform="translate(800, 700) rotate(-15)">
          <path d="M0 0 Q 8 -12 16 0 Q 8 12 0 0" />
        </g>
        
        {/* Fine Sketching Lines (Hatching) */}
        <path d="M640 160 L660 140 M645 165 L665 145" opacity="0.4" />
        <path d="M810 190 L830 170 M815 195 L835 175" opacity="0.4" />
      </svg>
    </motion.div>
  );
};

// 新增粒子組件
const StarrySeaParticles = () => {
  const stars = Array.from({ length: 50 });
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
      {stars.map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000), 
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
            opacity: Math.random() 
          }}
          animate={{ 
            y: [null, Math.random() * -100], // 緩慢向上漂浮
            opacity: [0.2, 0.8, 0.2] 
          }}
          transition={{ 
            duration: 5 + Math.random() * 10, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute w-1 h-1 bg-white rounded-full shadow-[0_0_8px_#fff]"
        />
      ))}
    </div>
  );
};

// 新增一個打字機文字組件
const TypewriterText = ({ text }: { text: string }) => {
  const letters = Array.from(text);
  
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.04 * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {letters.map((letter, index) => (
        <motion.span variants={child} key={index}>
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.div>
  );
};

const Home = ({ isPlaying, isActivated }: { isPlaying: boolean; isActivated: boolean }) => {
  const navigate = useNavigate();
  
  // 在 Home 組件中使用 useScroll 達成視差
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 500], [0, 150]); // 背景動得慢
  const textY = useTransform(scrollY, [0, 500], [0, -50]);       // 文字動得快
  
  const toggleGlobalMusic = () => {
    if (audioInstance) {
      if (isPlaying) {
        audioInstance.pause();
      } else {
        audioInstance.play().catch(err => console.error("Toggle music failed:", err));
      }
    }
  };

  return (
    <section className="relative h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Background Image with Overlay */}
      <motion.div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10s] hover:scale-110"
        style={{ 
          backgroundImage: 'url("https://files.catbox.moe/npmd51.jpg")',
          backgroundPosition: 'center 20%',
          y: backgroundY
        }}
      />
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-ocean/60 via-ocean/40 to-ocean/80 backdrop-blur-[2px]" />
      
      <StarrySeaParticles />

      <AnimatePresence>
        {isActivated && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2 }}
            >
              <SakuraIllustration opacity={0.6} />
              <SakuraEffect />
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ y: textY }}
              transition={{ duration: 1.5, delay: 0.5, ease: [0.2, 0, 0.2, 1] }}
              className="relative z-10 text-center w-full max-w-5xl"
            >
              <h1 className="font-display font-black text-[50px] md:text-[80px] tracking-tighter leading-tight mb-8 text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                <TypewriterText text="I AM" /><br />
                <span className="text-accent-gradient font-sans font-bold">[ Tsam ]</span>
              </h1>
              
              {/* 這裡使用了打字機效果 */}
              <div className="font-sans text-white/90 text-base md:text-xl max-w-2xl mx-auto mb-14 font-light tracking-[0.3em] leading-relaxed h-16">
                <TypewriterText text="民國97年高中畜，在地球Online遊玩17年" />
              </div>

              <button 
                onClick={() => navigate('/projects')}
                className="inline-flex items-center gap-3 px-12 py-4 btn-aqua uppercase tracking-[0.2em] text-sm font-medium group glass relative overflow-hidden"
              >
                真心推薦
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-2" />
                <motion.div 
                  whileTap={{ opacity: [0, 1, 0], scale: [0.8, 1.5] }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 bg-white rounded-full blur-md opacity-0 pointer-events-none"
                />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
};

const MagneticBio = () => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // 使用彈簧緩衝，讓回彈更自然
  const mouseX = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 20 });

  function handleMouseMove(e: React.MouseEvent) {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: mouseX, y: mouseY, rotateX: useTransform(mouseY, [-100, 100], [10, -10]), rotateY: useTransform(mouseX, [-100, 100], [-10, 10]) }}
      className="p-10 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-md rounded-[2rem] border border-white/20 cursor-pointer shadow-2xl"
    >
      <div className="text-center">
        <div className="w-20 h-20 bg-aqua rounded-2xl mx-auto mb-6 rotate-3 flex items-center justify-center text-ocean text-3xl font-black">
          T
        </div>
        <p className="text-white/60 text-sm italic tracking-widest">「在流體與代碼之間尋找平衡」</p>
      </div>
    </motion.div>
  );
};

const SocialLink = ({ name, icon, href }: { name: string, icon: string, href?: string }) => {
  const content = (
    <>
      <span className="text-xl">{icon}</span>
      <span className="font-bold tracking-widest uppercase text-xs text-white">{name}</span>
    </>
  );

  const className = "flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-aqua/20 border border-white/10 hover:border-aqua/50 rounded-xl transition-colors cursor-pointer";

  if (href) {
    return (
      <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ 
          x: [0, -2, 2, -2, 0], 
          transition: { duration: 0.2, repeat: Infinity } 
        }}
        className={className}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.div
      whileHover={{ 
        x: [0, -2, 2, -2, 0], 
        transition: { duration: 0.2, repeat: Infinity } 
      }}
      className={className}
    >
      {content}
    </motion.div>
  );
};

const About = () => {
  // 3. 成就系統資料
  const achievements = [
    { icon: "🛡️", title: "學科成就", desc: "解鎖「流體力學」與「航空物理」研究" },
    { icon: "⚔️", title: "核心裝備", desc: "以 React & Tailwind 構築個人領域" },
    { icon: "🧩", title: "隨機事件", desc: "於 2026 啟動 AI 視覺藝術探索" }
  ];

  // 5. 常用裝備資料
  const arsenal = [
    { category: "Coding", items: "VS Code / Cursor" },
    { category: "Design", items: "AI Studio / Figma" },
    { category: "Physics", items: "Wind Tunnel Simulation" }
  ];

  return (
    <section className="relative min-h-screen pt-48 pb-32 px-6 bg-gradient-to-b from-ocean to-[#020617] overflow-hidden">
      <SakuraIllustration className="top-0 right-0 justify-end items-start" opacity={0.3} />
      <SakuraIllustration className="bottom-0 left-0 justify-start items-end rotate-180" opacity={0.2} />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-start">
          
          {/* 左側：頭像與 2. 物理規律隱喻 */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative group mb-12">
              <div className="absolute inset-0 border border-aqua translate-x-4 translate-y-4 transition-transform group-hover:translate-x-6 group-hover:translate-y-6 duration-700 z-0" />
              <div className="relative z-10 w-full aspect-[4/5] bg-ocean/20 backdrop-blur-sm overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700 rounded-lg">
                <img 
                  src="https://i.ibb.co/m5ybjYs6/image.jpg" // 這裡建議換成你的帥照或代表圖
                  alt="Portrait" 
                  className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000"
                />
              </div>
            </div>

            {/* 2. 物理規律與生活的結合 */}
            <div className="mb-12">
              <MagneticBio />
            </div>

            <div className="glass p-8 rounded-2xl border-l-4 border-aqua">
              <p className="text-aqua font-display text-sm tracking-widest mb-2 uppercase opacity-60">Physics Law #01</p>
              <h4 className="text-white text-xl font-medium leading-relaxed italic">
                "Life, like fluid dynamics, is about finding balance between <span className="text-aqua">pressure</span> and <span className="text-aqua">velocity</span>."
              </h4>
              <p className="text-white/40 text-sm mt-4 font-light">—— 伯努利定律給我的生活啟發</p>
            </div>
          </motion.div>

          {/* 右側：文字介紹與 3 & 5 區塊 */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-display text-sm text-aqua tracking-[0.3em] uppercase mb-4">About Me</h2>
            <h3 className="font-sans text-4xl font-bold mb-8 tracking-wider text-white">
              [ Tsam ] <span className="text-white/30 text-2xl">Lv.17</span>
            </h3>

            <div className="space-y-6 text-white/70 text-base leading-loose font-light mb-12">
              <p>我是 Tsam，一名遊走於物理規律與數位代碼之間的高中生。我熱衷於研究流體力學中的升力來源，同時也沉迷於在網頁前端建立純粹的視覺秩序。</p>
            </div>

            {/* 3. 成就系統 (Achievement Badges) */}
            <div className="mb-12">
              <h4 className="text-xs text-aqua tracking-[0.2em] uppercase mb-6 opacity-50">Current Achievements</h4>
              <div className="space-y-4">
                {achievements.map((ach, i) => (
                  <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5 hover:border-aqua/30 transition-colors">
                    <span className="text-2xl">{ach.icon}</span>
                    <div>
                      <div className="text-white text-sm font-bold">{ach.title}</div>
                      <div className="text-white/40 text-xs mt-1">{ach.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. 我的常用裝備 (The Arsenal) */}
            <div className="mb-12">
              <h4 className="text-xs text-aqua tracking-[0.2em] uppercase mb-6 opacity-50">The Arsenal</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {arsenal.map((item, i) => (
                  <div key={i} className="glass p-4 rounded-xl text-center border border-white/5">
                    <div className="text-aqua text-[10px] uppercase tracking-tighter mb-2">{item.category}</div>
                    <div className="text-white/80 text-xs font-medium">{item.items}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Radar Chart Section */}
            <div>
              <h4 className="text-xs text-aqua tracking-[0.2em] uppercase mb-6 opacity-50">Skill Attributes</h4>
              <RadarChart />
            </div>

          </motion.div>
        </div>
      </div>
    </section>
  );
};

const ProjectCard = ({ project, index, onClick }: any) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div 
      layoutId={project.title}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: index * 0.2 }}
      className="cursor-pointer group relative glass-card overflow-hidden rounded-2xl"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        {/* 封面圖 */}
        <img 
          src={project.image} 
          alt={project.title}
          referrerPolicy="no-referrer"
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${isHovered ? 'opacity-0 scale-110' : 'opacity-100 scale-100'}`}
        />
        
        {/* 懸浮時播放的影片片段 */}
        {isHovered && project.videoUrl && (
          <video 
            src={project.videoUrl} 
            autoPlay 
            muted 
            loop 
            playsInline
            className="absolute inset-0 w-full h-full object-cover scale-110"
          />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-ocean/90 via-ocean/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
      </div>
      <div className="p-8 relative">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-aqua/60 mb-2 block">{project.category}</span>
            <h4 className="text-2xl font-bold text-white tracking-wide group-hover:text-aqua transition-colors">{project.title}</h4>
          </div>
          <span className="text-aqua font-display font-bold text-xl drop-shadow-[0_0_8px_rgba(123,213,245,0.5)]">{project.rating}</span>
        </div>
        <p className="text-white/60 font-light leading-relaxed mb-6">{project.review}</p>
        <div className="w-full h-[1px] bg-gradient-to-r from-aqua/40 to-transparent" />
      </div>
    </motion.div>
  );
};

const Projects = () => {
  const projects = [
    {
      title: "明日方舟:終末地",
      category: "ARKNIGHT:Endfild",
      image: "https://files.catbox.moe/iribrg.webp",
      videoUrl: "https://files.catbox.moe/6wwc1n.mp4", // 👈 在這裡放嵌入網址
      review: "拉電線的極致享受，清波寨寨子的決裂",
      rating: "8/10"
    },
    {
      title: "Limbus company",
      category: "邊獄公司Limbus company",
      image: "https://files.catbox.moe/4k2680.jpg",
      videoUrl: "https://files.catbox.moe/b6x0en.mp4", // 👈 如果沒有影片，留空就會顯示圖片
      review: "點數與點數間的碰撞 ，個人故事的精彩劇情。",
      rating: "9.5/10"
    },
    {
      title: "AlbionOnline",
      category: "AlbionOnline",
      image: "https://files.catbox.moe/w8gels.jpeg",
      videoUrl: "https://files.catbox.moe/q9pb47.mp4",
      review: "大陸上的奇幻冒險，在旅途中與朋友同樂。",
      rating: "9/10"
    },
    {
      title: "明日方舟",
      category: "Arlnights",
      image: "https://files.catbox.moe/tqmrr2.png",
      videoUrl: "https://files.catbox.moe/j8189i.mp4",
      review: "放置美少女塔房 豐富生動的劇情，每年都有超大杯的角色。",
      rating: "9.8/10"
    }
  ];

  const [selectedProject, setSelectedProject] = useState<null | typeof projects[0]>(null);

  useEffect(() => {
    // 當彈窗開啟時，如果背景有音樂，就把音量調低到 10%
    if (selectedProject) {
      if (audioInstance) audioInstance.volume = 0.1;
    } else {
      // 關閉彈窗時恢復音量
      if (audioInstance) audioInstance.volume = 1.0;
    }
  }, [selectedProject]);

  return (
    <section className="relative min-h-screen pt-40 pb-32 px-6 overflow-hidden bg-gradient-to-b from-[#020617] via-ocean/20 to-[#020617]">
      <SakuraIllustration className="top-0 right-0 justify-end items-start" opacity={0.4} />
      <SakuraIllustration className="bottom-0 left-0 justify-start items-end rotate-180" opacity={0.2} />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <h2 className="font-display text-sm text-aqua tracking-[0.3em] uppercase mb-4">Recommendations</h2>
          <h3 className="font-display text-5xl md:text-6xl font-black uppercase tracking-widest text-white drop-shadow-[0_0_15px_rgba(123,213,245,0.3)]">
            真心<span className="text-accent-gradient">推薦</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {projects.map((project, index) => (
            <ProjectCard 
              key={index}
              project={project}
              index={index}
              onClick={() => setSelectedProject(project)}
            />
          ))}
        </div>
      </div>

      {/* 彈窗內容：加入了影片嵌入功能 */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-ocean/90 backdrop-blur-md"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div 
              layoutId={selectedProject.title}
              className="bg-ocean border border-aqua/30 p-8 rounded-3xl max-w-3xl w-full overflow-y-auto max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 影片/圖片 顯示區 */}
              <div className="relative aspect-video mb-6 rounded-xl overflow-hidden bg-black shadow-2xl border border-white/10">
                {selectedProject.videoUrl ? (
                  selectedProject.videoUrl.includes('youtube.com') || selectedProject.videoUrl.includes('youtu.be') ? (
                    <iframe 
                      className="w-full h-full"
                      src={selectedProject.videoUrl} 
                      title={selectedProject.title}
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <video 
                      src={selectedProject.videoUrl} 
                      autoPlay 
                      muted 
                      loop 
                      playsInline 
                      controls
                      className="w-full h-full object-cover"
                    />
                  )
                ) : (
                  <img src={selectedProject.image} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                )}
              </div>

              <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl text-aqua font-bold">{selectedProject.title}</h2>
                <div className="px-4 py-1 bg-aqua/20 rounded-full border border-aqua/30">
                  <span className="text-aqua font-bold">{selectedProject.rating}</span>
                </div>
              </div>
              
              <p className="text-white/80 leading-loose mb-8 text-lg font-light italic">
                「{selectedProject.review}」
              </p>

              <button 
                onClick={() => setSelectedProject(null)} 
                className="w-full py-4 bg-aqua/10 border border-aqua/30 text-aqua rounded-xl hover:bg-aqua hover:text-ocean transition-all duration-300 tracking-[0.3em] uppercase text-xs font-bold"
              >
                返回列表 Back to List
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

const Anime = () => {
  const animeList = [
    {
      title: "葬送的芙莉蓮",
      category: "葬送のフリーレン",
      image: "https://files.catbox.moe/qyzzuc.webp", // A real image for Frieren
      videoUrl: "", // 一樣可以放預告片
      review: "關於時間與生命的細膩描寫，看完後會對『活在當下』有更深的感悟。",
      rating: "10/10"
    },
    {
      title: "咒術迴戰 死滅洄游",
      category: "呪術廻戰",
      image: "https://files.catbox.moe/f8uh7f.webp",
      videoUrl: "",
      review: "由羂索所主導的大逃殺遊戲，死滅洄游篇不僅是實力與戰術的對決，更是關於倫理道德、規則操弄以及對人性考驗的篇章。。",
      rating: "9.5/10"
    },
    {
      title: "【我推的孩子】",
      category: "【推しの子】",
      image: "https://i.ibb.co/tw792q9b/62ba3d9353506388f44fed34491kzs15.jpg", // Placeholder or relevant image if I had one, using a generic one for now
      videoUrl: "",
      review: "揭露演藝圈光鮮亮麗背後的黑暗面，結合轉生與懸疑的震撼之作。",
      rating: "9.7/10"
    }
  ];

  const [selectedAnime, setSelectedAnime] = useState<null | typeof animeList[0]>(null);

  return (
    <section className="relative min-h-screen pt-40 pb-32 px-6 overflow-hidden bg-gradient-to-b from-[#020617] via-[#1a103d]/20 to-[#020617]">
      <SakuraIllustration className="top-0 left-0 opacity-20 -rotate-90" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <h2 className="font-display text-sm text-aqua tracking-[0.3em] uppercase mb-4">Anime Collection</h2>
          <h3 className="font-display text-5xl md:text-6xl font-black uppercase tracking-widest text-white drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            動畫<span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-aqua">收藏</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {animeList.map((anime, index) => (
            <motion.div 
              key={index}
              layoutId={anime.title}
              onClick={() => setSelectedAnime(anime)}
              className="cursor-pointer group glass-card rounded-2xl overflow-hidden border border-white/5 hover:border-purple-500/50 transition-all duration-500"
              whileHover={{ y: -10 }}
            >
              <div className="aspect-[3/4] overflow-hidden relative">
                <img src={anime.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-6 left-6 right-6">
                   <span className="text-aqua text-[10px] tracking-[0.2em] uppercase">{anime.category}</span>
                   <h4 className="text-xl font-bold text-white mt-2">{anime.title}</h4>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedAnime && (
          <motion.div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-ocean/90 backdrop-blur-md"
            onClick={() => setSelectedAnime(null)}
          >
            <motion.div 
              layoutId={selectedAnime.title}
              className="bg-[#0c0a1f] border border-purple-500/30 p-8 rounded-3xl max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-video mb-6 rounded-xl overflow-hidden bg-black shadow-2xl">
                {selectedAnime.videoUrl ? (
                  selectedAnime.videoUrl.includes('youtube.com') || selectedAnime.videoUrl.includes('youtu.be') ? (
                    <iframe 
                      className="w-full h-full"
                      src={selectedAnime.videoUrl} 
                      title={selectedAnime.title}
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                      referrerPolicy="strict-origin-when-cross-origin" 
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <video 
                      src={selectedAnime.videoUrl} 
                      autoPlay 
                      muted 
                      loop 
                      playsInline 
                      controls
                      className="w-full h-full object-cover"
                    />
                  )
                ) : (
                  <img src={selectedAnime.image} className="w-full h-full object-cover" />
                )}
              </div>
              <h2 className="text-2xl text-aqua font-bold mb-4">{selectedAnime.title}</h2>
              <p className="text-white/70 leading-relaxed mb-8 italic">「{selectedAnime.review}」</p>
              <button onClick={() => setSelectedAnime(null)} className="w-full py-4 bg-purple-500/10 border border-purple-500/30 text-purple-300 rounded-xl hover:bg-purple-500 hover:text-white transition-all">Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

const PersonalInfo = () => (
  <section className="relative h-screen flex flex-col items-center justify-center px-6 border-t border-aqua/10 bg-[#020617] overflow-hidden">
    <SakuraIllustration className="top-0 left-0 justify-start items-start -rotate-90" opacity={0.3} />
    <SakuraIllustration className="bottom-0 right-0 justify-end items-end rotate-90" opacity={0.3} />
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative z-10 max-w-4xl mx-auto text-center glass p-16 rounded-3xl"
    >
      <h2 className="font-display text-aqua tracking-[0.3em] uppercase text-sm mb-6">Personal Information</h2>
      <a 
        href="mailto:tsai970921@gmail.com" 
        className="inline-block font-display text-3xl sm:text-5xl md:text-6xl font-black text-white hover:text-aqua transition-all duration-500 mb-16 break-all tracking-widest drop-shadow-[0_0_10px_rgba(123,213,245,0.3)]"
      >
        tsai970921@gmail.com
      </a>
      <div className="flex flex-wrap justify-center gap-6 mb-20">
        <SocialLink name="Instagram" icon="📸" href="https://www.instagram.com/er_7t_970910/" />
        <SocialLink name="Facebook" icon="👥" href="https://www.facebook.com/eric.tsai.925448" />
        <SocialLink name="Discord: Yuki" icon="🎮" />
        <SocialLink name="Email" icon="✉️" href="mailto:tsai970921@gmail.com" />
      </div>
      <p className="font-sans text-xs text-white/20 tracking-[0.2em] uppercase">
        &copy; 2024 I AM [ Tsam ]. ALL RIGHTS RESERVED.
      </p>
    </motion.div>
  </section>
);

const TerminalBio = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="relative group p-8 glass rounded-3xl border border-aqua/20 overflow-hidden"
    >
      {/* 掃描線動畫 */}
      <motion.div 
        animate={{ top: ["-100%", "200%"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 right-0 h-[2px] bg-aqua/30 shadow-[0_0_15px_aqua] z-10"
      />
      
      <h3 className="text-aqua font-mono mb-4 tracking-tighter"> {">"} DATABASE_USER_INFO</h3>
      <div className="space-y-2 font-mono text-sm">
        <p className="text-white/80"><span className="text-aqua/50">NAME:</span> Tsam</p>
        <p className="text-white/80"><span className="text-aqua/50">STATUS:</span> LV.17 / Physics Enthusiast</p>
        <p className="text-white/80"><span className="text-aqua/50">LOCATION:</span> Taiwan, Earth</p>
      </div>
      
      {/* 裝飾性的小方塊 */}
      <div className="absolute bottom-2 right-2 flex gap-1">
        {[1, 2, 3].map(i => (
          <div key={i} className="w-1 h-1 bg-aqua animate-pulse" style={{ animationDelay: `${i*0.2}s` }} />
        ))}
      </div>
    </motion.div>
  );
};

const Footer = () => {
  const socialLinks = [
    { name: "Discord", icon: "🎮", color: "#5865F2" },
    { name: "GitHub", icon: "🐙", color: "#ffffff" },
    { name: "Instagram", icon: "📸", color: "#E4405F" }
  ];

  return (
    <footer className="relative mt-20 pb-20 px-6">
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto relative group p-10 glass rounded-[2rem] border border-aqua/20 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.3)]"
      >
        {/* 1. 科技掃描線動畫 */}
        <motion.div 
          animate={{ top: ["-10%", "110%"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-aqua to-transparent z-10 opacity-50"
        />
        
        <div className="relative z-20 grid md:grid-cols-2 gap-12">
          {/* 左側：終端機個人資訊 */}
          <div className="space-y-6">
            <div>
              <h3 className="text-aqua font-mono text-sm tracking-[0.3em] mb-2 uppercase flex items-center gap-2">
                <span className="w-2 h-2 bg-aqua animate-pulse rounded-full" />
                Accessing Identity Data...
              </h3>
              <div className="h-[1px] w-full bg-gradient-to-r from-aqua/50 to-transparent" />
            </div>

            <div className="space-y-4 font-mono">
              {[
                { label: "USER", value: "Tsam" },
                { label: "CLASS", value: "Senior High Student" },
                { label: "FIELD", value: "Fluid Dynamics / Front-end" },
                { label: "STATUS", value: "LV.17 - Keep Learning" }
              ].map((item, i) => (
                <motion.div 
                  key={item.label}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 + 0.5 }}
                  className="flex gap-4 text-sm"
                >
                  <span className="text-aqua/40 w-20">{item.label}:</span>
                  <span className="text-white/90 font-bold tracking-widest">{item.value}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* 右側：社交連結 (Glitch 抖動感) */}
          <div className="flex flex-col justify-center gap-4">
            <p className="text-[10px] text-white/30 font-mono tracking-widest uppercase mb-2">Connect via Secure Link</p>
            <div className="grid grid-cols-1 gap-3">
              {socialLinks.map((link) => (
                <motion.a
                  key={link.name}
                  href="#" // 換成你的連結
                  whileHover={{ 
                    x: [0, -3, 3, -3, 0], // 物理抖動感
                    boxShadow: `0 0 20px ${link.color}44`,
                    borderColor: link.color
                  }}
                  className="flex items-center justify-between px-6 py-4 bg-white/5 border border-white/10 rounded-2xl transition-all duration-300 group/link"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{link.icon}</span>
                    <span className="font-bold tracking-[0.2em] text-xs text-white/70 group-hover/link:text-white uppercase">
                      {link.name}
                    </span>
                  </div>
                  <span className="text-aqua opacity-0 group-hover/link:opacity-100 transition-opacity font-mono">-{">"}</span>
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        {/* 底部裝飾文字 */}
        <div className="mt-12 text-center">
          <p className="text-[9px] font-mono text-white/20 tracking-[0.5em] uppercase">
            © 2026 TSAM_LABS // All Rights Reserved // Built with React & Physics
          </p>
        </div>
      </motion.div>

      {/* 背景裝飾：讓底部有一種「能量場」的感覺 */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-64 bg-aqua/5 blur-[120px] rounded-full pointer-events-none" />
    </footer>
  );
};

// --- Main App ---

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  return (
    <HashRouter>
      <div className="font-sans">
        <ParticleContainer />
        <CursorTrail />
        <SystemLogs />
        <GameHUD />
        <Navbar />
        <MusicPlayer 
          isPlaying={isPlaying} 
          setIsPlaying={setIsPlaying} 
          isActivated={isActivated}
          setIsPlayerReady={setIsPlayerReady}
        />
        
        <AnimatePresence>
          {!isActivated && (
            <ActivationOverlay 
              onActivate={() => {
                console.log("App: Activating experience...");
                setIsActivated(true);
              }} 
              isReady={isPlayerReady}
            />
          )}
        </AnimatePresence>

        <main className="overflow-x-hidden">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={
                <motion.div
                  key="home"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Home isPlaying={isPlaying} isActivated={isActivated} />
                </motion.div>
              } />
              <Route path="/about" element={
                <motion.div
                  key="about"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <About />
                </motion.div>
              } />
              <Route path="/projects" element={
                <motion.div
                  key="projects"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Projects />
                </motion.div>
              } />
              <Route path="/anime" element={
                <motion.div
                  key="anime"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Anime />
                </motion.div>
              } />
              <Route path="/contact" element={
                <motion.div
                  key="contact"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <PersonalInfo />
                </motion.div>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
          <Footer />
        </main>
      </div>
    </HashRouter>
  );
}
