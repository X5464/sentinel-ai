
import React, { useEffect, useRef } from 'react';

export const InteractionEffect: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Configuration
    let particles: Particle[] = [];
    let ripples: Ripple[] = [];
    let animationId: number | null = null;
    let lastPos = { x: 0, y: 0 };
    let isInitialized = false;
    let width = window.innerWidth;
    
    // Strict Mobile Detection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 1024;

    const resize = () => {
      // Optimization: Ignore vertical-only resizes on mobile (address bar hide/show)
      if (isMobile && window.innerWidth === width) return;

      width = window.innerWidth;
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
        
        // Mobile: Faster, simpler movement. Desktop: Smoother float.
        const speed = isBurst ? (Math.random() * 3 + 1) : (Math.random() * 0.2);
        const angle = Math.random() * Math.PI * 2;
        
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        
        this.life = 1;
        // Faster decay on mobile to clear canvas quicker
        this.decay = isMobile ? 0.08 : (isBurst ? (Math.random() * 0.04 + 0.02) : (Math.random() * 0.03 + 0.02));
        this.size = Math.random() * (isBurst ? 2.5 : 1.5) + 0.5;
        
        // Professional Cyan/Blue tone
        this.color = `rgba(34, 211, 238, 1)`; 
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        
        // Simplified physics
        this.vx *= 0.9;
        this.vy *= 0.9;
        
        this.life -= this.decay;
        this.size *= 0.9;
      }

      draw(context: CanvasRenderingContext2D) {
        context.fillStyle = this.color;
        context.globalAlpha = this.life * 0.6;
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fill();
      }
    }

    class Ripple {
      x: number;
      y: number;
      radius: number;
      alpha: number;
      lineWidth: number;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.radius = 2;
        this.alpha = 0.5;
        this.lineWidth = 1;
      }

      update() {
        this.radius += 4;
        this.alpha -= 0.03;
      }

      draw(context: CanvasRenderingContext2D) {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.strokeStyle = `rgba(34, 211, 238, ${this.alpha})`;
        context.lineWidth = this.lineWidth;
        context.stroke();
      }
    }

    const startAnimation = () => {
      if (!animationId) {
        animate();
      }
    };

    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let activeElements = 0;

      // 1. Draw Ripples (Desktop Only)
      if (!isMobile && ripples.length > 0) {
        activeElements += ripples.length;
        for (let i = 0; i < ripples.length; i++) {
          ripples[i].update();
          ripples[i].draw(ctx);
        }
        ripples = ripples.filter(r => r.alpha > 0);
      }

      // 2. Draw Particles
      if (particles.length > 0) {
        activeElements += particles.length;
        // Force fast standard blending
        ctx.globalCompositeOperation = 'source-over';
        
        for (let i = 0; i < particles.length; i++) {
          particles[i].update();
          particles[i].draw(ctx);
        }
        particles = particles.filter(p => p.life > 0);
      }
      
      if (activeElements > 0) {
        animationId = requestAnimationFrame(animate);
      } else {
        animationId = null;
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      // CRITICAL: Disable trail entirely on mobile/tablet to prevent scroll lag
      if (isMobile) return;

      if (!isInitialized) {
        lastPos = { x: e.clientX, y: e.clientY };
        isInitialized = true;
        return;
      }
      
      const dx = e.clientX - lastPos.x;
      const dy = e.clientY - lastPos.y;
      const dist = Math.hypot(dx, dy);
      
      // Low density for performance
      const steps = Math.min(dist, 15); 
      
      for (let i = 0; i < steps; i += 12) { 
        const t = i / dist;
        const x = lastPos.x + dx * t;
        const y = lastPos.y + dy * t;
        
        particles.push(new Particle(x, y));
      }

      lastPos = { x: e.clientX, y: e.clientY };
      startAnimation();
    };

    const handlePointerDown = (e: PointerEvent) => {
      // Ultra-lightweight burst for mobile
      if (isMobile) {
         for (let i = 0; i < 3; i++) {
            particles.push(new Particle(e.clientX, e.clientY, true));
         }
         startAnimation();
         return;
      }

      // Desktop logic
      for (let i = 0; i < 8; i++) {
         particles.push(new Particle(e.clientX, e.clientY, true));
      }
      ripples.push(new Ripple(e.clientX, e.clientY));
      
      startAnimation();
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerdown', handlePointerDown);
    
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ touchAction: 'none' }}
    />
  );
};
