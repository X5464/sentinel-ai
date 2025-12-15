
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['SF Pro Display', 'Inter', 'sans-serif'],
      },
      colors: {
        glass: {
          100: "rgba(255, 255, 255, 0.03)",
          200: "rgba(255, 255, 255, 0.05)",
          300: "rgba(255, 255, 255, 0.08)",
        },
        risk: {
          safe: "#10b981",    // Deep Green (Safe)
          low: "#2dd4bf",     // Semi Green/Teal (Low)
          medium: "#facc15",  // Yellow (Medium)
          high: "#fb923c",    // Orange (High)
          critical: "#ef4444" // Red (Critical)
        }
      },
      animation: {
        'spin': 'spin 1s linear infinite',
        'pulse-slow': 'pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'shimmer': 'shimmer 2.5s linear infinite',
        'float': 'float 8s ease-in-out infinite',
        'scan': 'scan 1.5s linear infinite',
        'fill': 'fill 1.5s ease-out forwards',
        'blob': 'blob 10s infinite', // New GPU-optimized animation
        'flow': 'flow 5s ease-in-out infinite',
        'blob-bounce': 'blobBounce 25s infinite ease-in-out',
        'click-bubble': 'clickBubble 0.6s ease-out forwards',
        'cursor-trail': 'cursorTrail 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'toast-in': 'toastIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'toast-out': 'toastOut 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        scan: {
          '0%': { top: '0%', opacity: '0' },
          '15%': { opacity: '1' },
          '85%': { opacity: '1' },
          '100%': { top: '100%', opacity: '0' },
        },
        fill: {
          '0%': { width: '0%' },
          '100%': { width: '100%' }
        },
        // Optimized Blob Animation (Transform only - No Layout Shift)
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" }
        },
        flow: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        blobBounce: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(20px, -20px)' },
          '50%': { transform: 'translate(-20px, 20px)' },
          '75%': { transform: 'translate(20px, 20px)' },
        },
        clickBubble: {
          '0%': { transform: 'translate(-50%, -50%) scale(0.5)', opacity: '1' },
          '100%': { transform: 'translate(-50%, -50%) scale(4)', opacity: '0' },
        },
        cursorTrail: {
          '0%': { transform: 'translate(-50%, -50%) scale(1)', opacity: '0.7' },
          '100%': { transform: 'translate(-50%, -50%) scale(0.2)', opacity: '0' },
        },
        toastIn: {
          '0%': { transform: 'translateY(-20px) scale(0.9)', opacity: '0' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        toastOut: {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '1' },
          '100%': { transform: 'translateY(-20px) scale(0.9)', opacity: '0' },
        }
      }
    }
  },
  plugins: [],
}
