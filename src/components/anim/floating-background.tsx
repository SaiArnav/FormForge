'use client';

import React, { useEffect, useRef } from 'react';
import { animate } from 'animejs';

export function FloatingBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const blobs = Array.from(container.querySelectorAll<HTMLElement>('[data-blob]'));
    if (blobs.length === 0) return;

    const anims = blobs.map((blob, i) =>
      animate(blob, {
        translateY: [-24, 24 + (i % 2) * 16],
        scale: [1, 1.06 + (i % 2) * 0.08],
        duration: 5200 + i * 1100,
        delay: i * 400,
        direction: 'alternate',
        loop: true,
        ease: 'inOutSine',
      })
    );

    return () => {
      anims.forEach((a) => a.cancel());
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div
        data-blob
        className="absolute -top-40 -right-32 h-96 w-96 rounded-full bg-brand-400/20 blur-3xl"
      />
      <div
        data-blob
        className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-cyan-400/15 blur-3xl"
      />
      <div
        data-blob
        className="absolute top-1/3 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-sky-500/10 blur-3xl"
      />
    </div>
  );
}
