
import React, { useEffect, useRef } from 'react';

export const InteractionEffect: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Premium Configuration
    let particles: Particle[] = [];
    let ripples: Ripple[] = [];
    let animationId: number;
    let lastPos = { x: 0, y: 0 };
    let isInitialized = false;
    let hue = 0; // Master hue for cycling colors

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
        // Burst has high velocity spread, trail has gentle drift
        const speed = isBurst ? (Math.random() * 4 + 2) : (Math.random() * 0.5);
        const angle = Math.random() * Math.PI * 2;
        
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        
        this.life = 1;
        this.decay = isBurst ? (Math.random() * 0.03 + 0.02) : (Math.random() * 0.02 + 0.01);
        this.size = Math.random() * (isBurst ? 4 : 3) + 1;
        
        // Dynamic Rainbow Color
        this.color = `hsla(${hue}, 100%, 60%, 1)`;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        
        // Friction physics for fluid feel
        this.vx *= 0.92;
        this.vy *= 0.92;
        
        this.life -= this.decay;
        this.size *= 0.95; // Shrink over time
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
        this.alpha = 1;
        this.color = `hsla(${hue}, 100%, 60%, 1)`;
      }

      update() {
        this.radius += 5; // Expansion speed
        this.alpha -= 0.03; // Fade speed
      }

      draw(context: CanvasRenderingContext2D) {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.strokeStyle = this.color;
        context.lineWidth = 2;
        context.globalAlpha = Math.max(0, this.alpha);
        context.stroke();
      }
    }

    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Cycle global hue for that RGB Gamer / Premium feel
      hue += 2;
      if (hue >= 360) hue = 0;

      // 1. Draw Ripples (Shockwaves)
      for (let i = 0; i < ripples.length; i++) {
        ripples[i].update();
        ripples[i].draw(ctx);
      }
      ripples = ripples.filter(r => r.alpha > 0);

      // 2. Draw Particles
      // Use 'lighter' blend mode for glowing neon effect when particles overlap
      ctx.globalCompositeOperation = 'lighter';
      
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw(ctx);
      }
      
      // Cleanup dead particles
      particles = particles.filter(p => p.life > 0);
      
      // Reset composite for next frame
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;

      animationId = requestAnimationFrame(animate);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isInitialized) {
        lastPos = { x: e.clientX, y: e.clientY };
        isInitialized = true;
        return;
      }
      
      // INTERPOLATION: Fill gaps between frames for a smooth continuous line
      const dx = e.clientX - lastPos.x;
      const dy = e.clientY - lastPos.y;
      const dist = Math.hypot(dx, dy);
      
      // Dynamically calculate steps based on speed (higher speed = more interpolated dots)
      const steps = Math.min(dist, 40); 
      
      for (let i = 0; i < steps; i += 2) { 
        const t = i / dist;
        const x = lastPos.x + dx * t;
        const y = lastPos.y + dy * t;
        
        // Add slight randomness for organic "dust" look
        particles.push(new Particle(
          x + (Math.random() - 0.5) * 4, 
          y + (Math.random() - 0.5) * 4
        ));
      }

      lastPos = { x: e.clientX, y: e.clientY };
    };

    const handlePointerDown = (e: PointerEvent) => {
      // Spawn Burst Particles
      for (let i = 0; i < 15; i++) {
         particles.push(new Particle(e.clientX, e.clientY, true));
      }
      // Spawn Ripple
      ripples.push(new Ripple(e.clientX, e.clientY));
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerdown', handlePointerDown);
    
    // Start Animation Loop
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ touchAction: 'none' }} // Improves touch responsiveness
    />
  );
};
