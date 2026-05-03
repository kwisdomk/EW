/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Mission-critical command center palette
        'ew-bg': '#050505',           // Pitch black background
        'ew-bg-alt': '#020617',       // Alternative deep background
        'ew-panel': '#0f172a',        // slate-900 panels
        'ew-panel-alt': '#020617',    // slate-950 alternative
        'ew-border': '#1e293b',       // slate-800 borders (low opacity)
        
        // Severity colors (LED-style)
        'ew-critical': '#f43f5e',     // rose-500 (Critical/Emergency)
        'ew-elevated': '#f97316',     // orange-500 (Elevated Threat)
        'ew-monitoring': '#eab308',   // yellow-500 (Monitoring)
        'ew-secure': '#10b981',       // emerald-500 (Baseline/Secure)
        
        // Text hierarchy
        'ew-text-primary': '#cbd5e1',   // slate-300 primary reading
        'ew-text-secondary': '#94a3b8', // slate-400 secondary
        'ew-text-tertiary': '#64748b',  // slate-500 tertiary/labels
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
      },
      animation: {
        'scan-line': 'scan-line 8s linear infinite',
        'radar-sweep': 'radar-sweep 4s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'radar-sweep': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 15px rgba(16, 185, 129, 0.6)' },
          '50%': { opacity: '0.5', boxShadow: '0 0 5px rgba(16, 185, 129, 0.3)' },
        },
      },
    },
  },
  plugins: [],
}

// Made with Bob
