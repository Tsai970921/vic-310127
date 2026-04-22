@import "tailwindcss";

@theme {
  --font-sans: "Inter", "PingFang TC", "Noto Sans TC", sans-serif;
  --font-display: "Montserrat", sans-serif;
  --color-aqua: #7BD5F5;
  --color-ocean: #1B4F72;
  --color-cyan-glow: #B2EBF2;
  --color-dark: #020617;
}

@layer base {
  body {
    @apply bg-[#020617] text-white antialiased selection:bg-[#7BD5F5] selection:text-[#020617];
  }
}

@layer utilities {
  .text-accent-gradient {
    background: linear-gradient(135deg, #7BD5F5 0%, #38bdf8 40%, #1B4F72 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    color: transparent;
  }

  .glass {
    @apply bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)];
  }

  .glass-card {
    @apply bg-white/5 backdrop-blur-lg border border-[#B2EBF2]/30 transition-all duration-500 hover:border-[#B2EBF2] hover:shadow-[0_0_25px_rgba(178,235,242,0.3)] hover:-translate-y-2;
  }

  .btn-aqua {
    @apply border border-[#7BD5F5]/50 text-[#7BD5F5] transition-all duration-500 hover:bg-[#7BD5F5] hover:text-[#020617] hover:shadow-[0_0_20px_rgba(123,213,245,0.4)];
  }

  .nav-link-glow {
    @apply text-white transition-all duration-300 hover:text-[#7BD5F5] hover:drop-shadow-[0_0_8px_rgba(123,213,245,0.8)];
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 6px;
  }
  ::-webkit-scrollbar-track {
    background: #020617;
  }
  ::-webkit-scrollbar-thumb {
    background: #1B4F72;
    border-radius: 3px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #7BD5F5;
  }
}

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&family=Montserrat:wght@700;900&display=swap');
