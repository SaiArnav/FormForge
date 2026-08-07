'use client';

import React, { useEffect, useRef } from 'react';
import { animate } from 'animejs';

interface RevealProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  as?: React.ElementType;
  delay?: number;
  distance?: number;
  duration?: number;
}

export function Reveal({
  children,
  className,
  style,
  as = 'div',
  delay = 0,
  distance = 20,
  duration = 600,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const Tag = as as React.ElementType;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const anim = animate(el, {
      opacity: [0, 1],
      translateY: [distance, 0],
      duration,
      delay,
      ease: 'outExpo',
    });

    return () => {
      anim.cancel();
    };
  }, [delay, distance, duration]);

  return (
    <Tag ref={ref} className={className} style={style}>
      {children}
    </Tag>
  );
}
