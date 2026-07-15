'use client';

import { useEffect, useRef } from 'react';

export default function FluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }

    let isMounted = true;
    let isForwarding = false;

    const initFluid = async () => {
      try {
        const WebGLFluid = (await import('webgl-fluid')).default;
        if (!isMounted || !canvasRef.current) return;

        WebGLFluid(canvasRef.current, {
          TRIGGER: 'hover',
          SIM_RESOLUTION: 128,
          DYE_RESOLUTION: 512,
          DISSIPATION: 0.994,
          VELOCITY_DISSIPATION: 0.999,
          PRESSURE: 0.8,
          PRESSURE_ITERATIONS: 1,
          CURL: 30,
          SPLAT_RADIUS: 0.1,
          SPLAT_FORCE: 10000,
          SHADING: false,
          COLORFUL: false,
          SPLAT_COLOR: { r: 0.3, g: 0.2, b: 0.3 },
          COLOR_UPDATE_SPEED: 90,
          PAUSED: false,
          BACK_COLOR: { r: 248, g: 246, b: 241 },
          TRANSPARENT: false,
          BLOOM: true,
          BLOOM_ITERATIONS: 1,
          BLOOM_RESOLUTION: 256,
          BLOOM_INTENSITY: 0.2,
          BLOOM_THRESHOLD: 0.85,
          BLOOM_SOFT_KNEE: 0.7,
        });

        const forwardMouseEvent = (type: string, e: MouseEvent) => {
          if (isForwarding) return;
          
          const canvas = canvasRef.current;
          if (!canvas) return;

          const rect = canvas.getBoundingClientRect();
          const offsetX = e.clientX - rect.left;
          const offsetY = e.clientY - rect.top;

          isForwarding = true;
          
          try {
            const mouseEvent = new MouseEvent(type, {
              clientX: e.clientX,
              clientY: e.clientY,
              screenX: e.screenX,
              screenY: e.screenY,
              bubbles: false,
              cancelable: true,
            });

            Object.defineProperties(mouseEvent, {
              offsetX: { value: offsetX, configurable: true, enumerable: true },
              offsetY: { value: offsetY, configurable: true, enumerable: true },
            });
            canvas.dispatchEvent(mouseEvent);

            if (typeof PointerEvent !== 'undefined') {
              const pointerType =
                type === 'mousemove'
                  ? 'pointermove'
                  : type === 'mousedown'
                  ? 'pointerdown'
                  : 'pointerup';

              const pointerEvent = new PointerEvent(pointerType, {
                clientX: e.clientX,
                clientY: e.clientY,
                screenX: e.screenX,
                screenY: e.screenY,
                bubbles: false,
                cancelable: true,
                pointerType: 'mouse',
              });

              Object.defineProperties(pointerEvent, {
                offsetX: { value: offsetX, configurable: true, enumerable: true },
                offsetY: { value: offsetY, configurable: true, enumerable: true },
              });
              canvas.dispatchEvent(pointerEvent);
            }
          } finally {
            isForwarding = false;
          }
        };

        const handleMouseMove = (e: MouseEvent) => forwardMouseEvent('mousemove', e);
        const handleMouseDown = (e: MouseEvent) => forwardMouseEvent('mousedown', e);
        const handleMouseUp = (e: MouseEvent) => forwardMouseEvent('mouseup', e);

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mousedown', handleMouseDown);
          window.removeEventListener('mouseup', handleMouseUp);
        };
      } catch (error) {
        console.error('Failed to load or initialize webgl-fluid dynamically:', error);
      }
    };

    initFluid();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}