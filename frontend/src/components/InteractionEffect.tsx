
import React, { useEffect, useRef } from 'react';

interface Props {
  isMobile?: boolean;
}

export const InteractionEffect: React.FC<Props> = ({ isMobile = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // --- PERFORMANCE CONFIGURATION ---
    // Drastically reduce load for mobile devices to prevent lag
    const MAX_PARTICLES = isMobile ? 15 : 80; 
    const THROTTLE_MS = isMobile ? 40 : 0; // Throttle mobile updates
    const BURST_COUNT = isMobile ? 3 : 8;
    const USE_LIGHTER_BLEND = !isMobile; // Disable expensive blending on mobile

    let particles: Particle[] = [];
    let ripples: Ripple[] = [];
    let animationId: number | null = null;
    let lastPos = { x: 0, y: 0 };
    let isInitialized = false;
    let lastTime = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      decay: number;
      size: number;
      color: string;

      constructor(x: number, y: number, isBurst = false) {
        this.x = x;
        this.y = y;
        const speed = isBurst ? (Math.random() * 3 + 1) : (Math.random() * 0.5);
        const angle = Math.random() * Math.PI * 2;
        
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        
        this.life = 1;
        // Faster decay on mobile to clear memory faster
        this.decay = isMobile ? (isBurst ? 0.08 : 0.05) : (isBurst ? (Math.random() * 0.03 + 0.02) : (Math.random() * 0.02 + 0.01));
        this.size = Math.random() * (isBurst ? 2.5 : 1.5) + 1;
        
        // MONOCHROME: Pure white with varying opacity
        const alpha = Math.random() * 0.4 + 0.1;
        this.color = `rgba(255, 255, 255, ${alpha})`;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.9;
        this.vy *= 0.9;
        this.life -= this.decay;
        this.size *= 0.9;
      }

      draw(context: CanvasRenderingContext2D) {
        context.fillStyle = this.color;
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.globalAlpha = this.life;
        context.fill();
      }
    }

    class Ripple {
      x: number;
      y: number;
      radius: number;
      alpha: number;
      color: string;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.radius = 1;
        this.alpha = 0.4;
        this.color = `rgba(255, 255, 255, 0.3)`; // White ripple
      }

      update() {
        this.radius += isMobile ? 6 : 4;
        this.alpha -= isMobile ? 0.04 : 0.02;
      }

      draw(context: CanvasRenderingContext2D) {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.strokeStyle = this.color;
        context.lineWidth = 1;
        context.globalAlpha = Math.max(0, this.alpha);
        context.stroke();
      }
    }

    const animate = () => {
      if (particles.length === 0 && ripples.length === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        animationId = null;
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw Ripples
      for (let i = 0; i < ripples.length; i++) {
        ripples[i].update();
        ripples[i].draw(ctx);
      }
      ripples = ripples.filter(r => r.alpha > 0);

      // Draw Particles
      // 'screen' is lighter than 'lighter' but cheaper than default alpha blending in some engines
      if (USE_LIGHTER_BLEND) {
        ctx.globalCompositeOperation = 'screen'; 
      }
      
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw(ctx);
      }
      
      particles = particles.filter(p => p.life > 0);
      
      if (particles.length > MAX_PARTICLES) {
        particles = particles.slice(particles.length - MAX_PARTICLES);
      }
      
      if (USE_LIGHTER_BLEND) {
        ctx.globalCompositeOperation = 'source-over';
      }
      ctx.globalAlpha = 1;

      animationId = requestAnimationFrame(animate);
    };

    const startLoop = () => {
      if (!animationId) {
        animate();
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      const now = Date.now();
      if (isMobile && now - lastTime < THROTTLE_MS) return;
      lastTime = now;

      if (!isInitialized) {
        lastPos = { x: e.clientX, y: e.clientY };
        isInitialized = true;
        return;
      }
      
      // Simple interpolation
      const dx = e.clientX - lastPos.x;
      const dy = e.clientY - lastPos.y;
      
      // Reduce interpolation density on mobile
      const dist = Math.hypot(dx, dy);
      const steps = isMobile ? Math.min(dist, 5) : Math.min(dist, 20); 
      const stepSize = isMobile ? 10 : 4;

      if (steps > 0) {
        for (let i = 0; i < steps; i += stepSize) {
          const t = i / dist;
          const x = lastPos.x + dx * t;
          const y = lastPos.y + dy * t;
          particles.push(new Particle(x, y));
        }
      } else {
         particles.push(new Particle(e.clientX, e.clientY));
      }

      lastPos = { x: e.clientX, y: e.clientY };
      startLoop();
    };

    const handlePointerDown = (e: PointerEvent) => {
      for (let i = 0; i < BURST_COUNT; i++) {
         particles.push(new Particle(e.clientX, e.clientY, true));
      }
      if (!isMobile) ripples.push(new Ripple(e.clientX, e.clientY));
      startLoop();
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerdown', handlePointerDown);
    
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [isMobile]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ touchAction: 'none' }}
    />
  );
};
